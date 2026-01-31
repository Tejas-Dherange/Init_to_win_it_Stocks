import { Router } from 'express';
import { clerkMiddleware } from '../middleware/clerk.middleware';
import { syncUserMiddleware } from '../middleware/syncUser.middleware';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import portfolioRoutes from './portfolio.routes';
import riskRoutes from './risk.routes';
import decisionsRoutes from './decisions.routes';
import llmRoutes from './llm.routes';
import chatRoutes from './chat.routes';
import actionsRoutes from './actions.routes';

const router = Router();

// Apply Clerk authentication middleware to all routes
router.use(clerkMiddleware);

// Apply user sync middleware to authenticated routes
router.use(syncUserMiddleware);

// Mount routes
router.use('/health', healthRoutes); // Public route
router.use('/auth', authRoutes); // Auth routes (protected)
router.use('/portfolio', portfolioRoutes);
router.use('/risk', riskRoutes);
router.use('/decisions', decisionsRoutes);
router.use('/llm', llmRoutes);
router.use('/chat', chatRoutes);
router.use('/actions', actionsRoutes);

export default router;
