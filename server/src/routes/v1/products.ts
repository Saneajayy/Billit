import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hsnCode: z.string().optional().or(z.literal('')),
  unitPrice: z.number().min(0, 'Price must be positive'),
  gstRate: z.number().int().refine(val => [0, 5, 12, 18, 28].includes(val), 'Invalid GST rate'),
  unit: z.string().min(1, 'Unit is required'),
});

router.use(requireAuth);

router.get('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.post('/', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = productSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        ...parsedBody.data,
        hsnCode: parsedBody.data.hsnCode || null,
      },
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.put('/:id', async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const parsedBody = productSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const product = await prisma.product.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: {
        ...parsedBody.data,
        hsnCode: parsedBody.data.hsnCode || null,
      },
    });
    
    if (product.count === 0) return res.status(404).json({ error: { message: 'Product not found' } });

    return res.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
