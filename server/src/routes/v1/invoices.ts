import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { calculateInvoiceGST } from '../../services/gstCalculator';
import { generateInvoicePDF } from '../../services/pdfGenerator';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const router = Router();

const invoiceItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(0.01),
});

const invoiceSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(invoiceItemSchema).min(1),
  dueDate: z.string().datetime().optional(), // ISO string
});

router.use(requireAuth);

router.get('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.get('/:id', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id, userId: user.id },
      include: {
        customer: true,
        lineItems: {
          include: { product: true },
        },
      },
    });

    if (!invoice) return res.status(404).json({ error: { message: 'Invoice not found' } });
    return res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.post('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = invoiceSchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error('Validation Error Details:', JSON.stringify(parsedBody.error.format(), null, 2));
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const { customerId, items, dueDate } = parsedBody.data;

    // Fetch customer to check billing state
    const customer = await prisma.customer.findUnique({ where: { id: customerId, userId: user.id } });
    if (!customer) return res.status(404).json({ error: { message: 'Customer not found' } });

    // Fetch products to get prices and rates
    const productIds = items.map((i: any) => i.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds }, userId: user.id },
    });

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: { message: 'One or more products not found' } });
    }

    // Build items for calculation
    const itemsForCalc = items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        gstRate: product.gstRate,
      };
    });

    // Run GST Calculation
    const calcResult = calculateInvoiceGST(
      itemsForCalc,
      user.businessState,
      customer.billingState
    );

    // Generate Invoice Number (simple logic for now)
    const count = await prisma.invoice.count({ where: { userId: user.id } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Use Prisma transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          userId: user.id,
          customerId: customer.id,
          invoiceNumber,
          invoiceDate: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          isInterState: calcResult.isInterState,
          subtotal: calcResult.subtotal,
          totalCGST: calcResult.totalCGST,
          totalSGST: calcResult.totalSGST,
          totalIGST: calcResult.totalIGST,
          grandTotal: calcResult.grandTotal,
          status: 'DRAFT',
          lineItems: {
            create: calcResult.lineItems.map(li => {
              const product = products.find(p => p.id === li.productId)!;
              return {
                productId: li.productId,
                description: product.name,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                gstRate: li.gstRate,
                taxableValue: li.taxableValue,
                cgstAmount: li.cgstAmount,
                sgstAmount: li.sgstAmount,
                igstAmount: li.igstAmount,
                lineTotal: li.lineTotal,
              };
            }),
          }
        },
      });
      return inv;
    });

    // Generate PDF Synchronously (Vercel Compatible)
    try {
      const fullInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          user: true,
          customer: true,
          lineItems: { include: { product: true } }
        }
      });
      if (fullInvoice) {
        const pdfUrl = await generateInvoicePDF(fullInvoice);
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { pdfUrl }
        });
        (invoice as any).pdfUrl = pdfUrl;
      }
    } catch (pdfErr) {
      console.error('Failed to generate PDF synchronously:', pdfErr);
      // We don't fail the invoice creation if PDF fails
    }

    // Invalidate Redis Cache (wrap in try/catch to prevent crashes if Redis is offline)
    try {
      await redis.del(`dashboard:summary:${user.id}`);
    } catch (err) {
      console.warn('Redis cache clear failed', err);
    }

    return res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
