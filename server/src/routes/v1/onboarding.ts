import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';

const router = Router();

const onboardingSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessGSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  businessState: z.string().length(2, 'State code must be 2 digits'),
  businessAddress: z.string().min(1, 'Address is required'),
});

router.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) return res.status(401).json({ error: { message: 'Unauthorized' } });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const parsedBody = onboardingSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: { message: 'Validation Error', details: parsedBody.error.format() } });
    }

    const { businessName, businessGSTIN, businessState, businessAddress } = parsedBody.data;

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        businessName,
        businessGSTIN,
        businessState,
        businessAddress,
      },
      create: {
        clerkId,
        businessName,
        businessGSTIN,
        businessState,
        businessAddress,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Onboarding Error:', error);
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

export default router;
