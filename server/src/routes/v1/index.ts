import { Router } from 'express';
import onboardingRouter from './onboarding';
import customersRouter from './customers';
import productsRouter from './products';
import invoicesRouter from './invoices';
import dashboardRouter from './dashboard';
import assistantRouter from './assistant';

const router = Router();

router.use('/onboarding', onboardingRouter);
router.use('/customers', customersRouter);
router.use('/products', productsRouter);
router.use('/invoices', invoicesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/assistant', assistantRouter);

export default router;
