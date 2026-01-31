import { Router } from 'express';
import healthRoutes from './health.routes';
import portfolioRoutes from './portfolio.routes';
import riskRoutes from './risk.routes';
import decisionsRoutes from './decisions.routes';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/risk', riskRoutes);
router.use('/decisions', decisionsRoutes);

export default router;
