import { Router } from 'express';
import { MasterAgent } from '../../agents/master/MasterAgent';

const router = Router();
const masterAgent = new MasterAgent();

/**
 * GET /api/v1/health
 * System health check
 */
router.get('/', async (_req, res, next) => {
    try {
        const health = await masterAgent.getHealthStatus();

        res.json({
            success: true,
            data: {
                status: health.overall,
                timestamp: new Date().toISOString(),
                agents: health.agents,
                circuitBreaker: health.circuitBreaker,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
