import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  billingState: z.string().length(2, 'State code must be 2 digits'),
  billingAddress: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const customers = await prisma.customer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.post('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = customerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        ...parsedBody.data,
        gstin: parsedBody.data.gstin || null,
        email: parsedBody.data.email || null,
        phone: parsedBody.data.phone || null,
      },
    });
    return res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.put('/:id', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = customerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const customer = await prisma.customer.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: {
        ...parsedBody.data,
        gstin: parsedBody.data.gstin || null,
        email: parsedBody.data.email || null,
        phone: parsedBody.data.phone || null,
      },
    });
    
    if (customer.count === 0) return res.status(404).json({ error: { message: 'Customer not found' } });

    return res.json({ message: 'Customer updated' });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
