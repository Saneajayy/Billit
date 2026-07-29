import { Router } from 'express';
import IORedis from 'ioredis';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 0,
});

router.use(requireAuth);

router.get('/summary', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const cacheKey = `dashboard:summary:${user.id}`;
    let cachedData = null;
    
    try {
      cachedData = await redis.get(cacheKey);
    } catch (err) {
      console.warn('Redis cache read failed, falling back to database', err);
    }

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // 1. Total Invoices Issued
    const totalInvoices = await prisma.invoice.count({
      where: { userId: user.id }
    });

    // 2. Total Revenue & Tax Collected
    const aggregates = await prisma.invoice.aggregate({
      where: { userId: user.id },
      _sum: {
        subtotal: true,
        totalCGST: true,
        totalSGST: true,
        totalIGST: true,
        grandTotal: true,
      }
    });

    // 3. Revenue Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentInvoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        invoiceDate: { gte: sixMonthsAgo }
      },
      select: { invoiceDate: true, grandTotal: true },
      orderBy: { invoiceDate: 'asc' }
    });

    const revenueTrendMap: Record<string, number> = {};
    recentInvoices.forEach(inv => {
      const month = inv.invoiceDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      revenueTrendMap[month] = (revenueTrendMap[month] || 0) + inv.grandTotal;
    });

    const revenueTrend = Object.entries(revenueTrendMap).map(([month, revenue]) => ({
      name: month,
      revenue
    }));

    // 4. Top Customers
    const topCustomersRaw = await prisma.invoice.groupBy({
      by: ['customerId'],
      where: { userId: user.id },
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5
    });

    const customerIds = topCustomersRaw.map(c => c.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } }
    });

    const topCustomers = topCustomersRaw.map(tc => {
      const customer = customers.find(c => c.id === tc.customerId);
      return {
        name: customer?.name || 'Unknown',
        total: tc._sum.grandTotal || 0,
      };
    });

    const result = {
      totalInvoices,
      revenue: aggregates._sum.subtotal || 0,
      tax: {
        cgst: aggregates._sum.totalCGST || 0,
        sgst: aggregates._sum.totalSGST || 0,
        igst: aggregates._sum.totalIGST || 0,
        total: (aggregates._sum.totalCGST || 0) + (aggregates._sum.totalSGST || 0) + (aggregates._sum.totalIGST || 0)
      },
      grandTotal: aggregates._sum.grandTotal || 0,
      revenueTrend,
      topCustomers,
    };

    // Cache the result for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    } catch (err) {
      console.warn('Redis cache write failed', err);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
