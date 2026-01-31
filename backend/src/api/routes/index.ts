import { Router } from 'express';
import healthRoutes from './health.routes';
import portfolioRoutes from './portfolio.routes';
import riskRoutes from './risk.routes';
import decisionsRoutes from './decisions.routes';
import llmRoutes from './llm.routes';
import chatRoutes from './chat.routes';
import actionsRoutes from './actions.routes';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/risk', riskRoutes);
router.use('/decisions', decisionsRoutes);
router.use('/llm', llmRoutes);
router.use('/chat', chatRoutes);
router.use('/actions', actionsRoutes);

export default router;
