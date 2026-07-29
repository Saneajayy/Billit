import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Ensure you have GEMINI_API_KEY in your env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const querySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500),
});

router.use(requireAuth);

router.post('/query', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = querySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const { query } = parsedBody.data;

    // 1. Fetch relevant business data context for the AI
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const aggregates = await prisma.invoice.aggregate({
      where: { userId: user.id },
      _sum: {
        subtotal: true,
        totalCGST: true,
        totalSGST: true,
        totalIGST: true,
        grandTotal: true,
      },
      _count: true
    });

    const totalCustomers = await prisma.customer.count({ where: { userId: user.id } });
    
    // Get top customers for better context
    const topCustomersRaw = await prisma.invoice.groupBy({
      by: ['customerId'],
      where: { userId: user.id },
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5
    });
    
    const customerIds = topCustomersRaw.map(c => c.customerId);
    const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });
    const topCustomers = topCustomersRaw.map(tc => {
      const c = customers.find(c => c.id === tc.customerId);
      return { name: c?.name || 'Unknown', totalRevenue: tc._sum.grandTotal || 0 };
    });

    const contextData = {
      currentDate: new Date().toISOString().split('T')[0],
      businessInfo: {
        name: user.businessName,
        totalCustomers: totalCustomers,
        totalInvoicesCreated: aggregates._count,
        totalRevenue: aggregates._sum.grandTotal || 0,
        totalTaxCollected: (aggregates._sum.totalCGST || 0) + (aggregates._sum.totalSGST || 0) + (aggregates._sum.totalIGST || 0),
      },
      topCustomers: topCustomers,
      recentInvoices: recentInvoices.map(inv => ({
        number: inv.invoiceNumber,
        date: inv.invoiceDate.toISOString().split('T')[0],
        customer: inv.customer.name,
        amount: inv.grandTotal,
        status: inv.status,
      }))
    };

    // 2. Build the Prompt
    const prompt = `
You are an intelligent billing and invoice assistant for a business named "${user.businessName}".
Your goal is to answer the user's questions about their business, customers, and invoice data accurately.
Only use the provided context data to answer the question. Do not make up financial numbers.
If a user asks about "profit", politely clarify that you only track "revenue", and provide the revenue figure.
If the exact answer isn't explicitly available but can be reasonably inferred or approximated from the context, do so, but mention the limitation.
If the data provided completely lacks the context to answer (like asking about employees), say "I don't have enough data to answer that based on your current account data."

Context Data (JSON format):
${JSON.stringify(contextData, null, 2)}

User Question: "${query}"

Provide a concise, helpful, and natural language response.
`;

    // 3. Call Gemini
    const modelName = "gemini-3.5-flash"; // Restored correct model name for 2026
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log("=== AI PROMPT CONTEXT ===");
    console.log(JSON.stringify(contextData, null, 2));
    console.log("Question:", query);
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    await prisma.aIQueryLog.create({
      data: {
        userId: user.id,
        query,
        response: responseText,
      }
    });

    return res.json({ response: responseText });

  } catch (error) {
    console.error('Error in AI Assistant:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
