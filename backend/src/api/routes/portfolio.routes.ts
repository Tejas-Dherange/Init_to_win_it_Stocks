import { Router } from 'express';
import { logger } from '../../utils/logger';
import { requireAuth } from '../middleware/requireAuth.middleware';
import prisma from '../../config/database.config';

const router = Router();

/**
 * GET /api/v1/portfolio
 * Get authenticated user's portfolio from database
 */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }

        // Load portfolio from database scoped to user
        const positions = await prisma.portfolio.findMany({
            where: { userId },
            orderBy: { symbol: 'asc' }
        });

        if (positions.length === 0) {
            return res.json({
                success: true,
                data: {
                    positions: [],
                    summary: {
                        totalPnL: 0,
                        totalExposure: 0,
                        avgRiskScore: 0,
                        positionCount: 0,
                    },
                },
            });
        }

        // Calculate totals based ONLY on user's data
        const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
        const totalExposure = positions.reduce((sum, p) => sum + p.exposure, 0);
        const avgRisk = positions.reduce((sum, p) => sum + p.riskScore, 0) / positions.length;

        return res.json({
            success: true,
            data: {
                positions: positions.map(p => ({
                    ...p,
                    quantity: p.quantity,
                    entryPrice: p.entryPrice,
                    currentPrice: p.currentPrice,
                    pnl: p.pnl,
                    pnlPercent: p.pnlPercent,
                    riskScore: p.riskScore,
                    exposure: p.exposure,
                })),
                summary: {
                    totalPnL,
                    totalExposure,
                    avgRiskScore: avgRisk,
                    positionCount: positions.length,
                },
            },
        });
    } catch (error) {
        logger.error('Failed to fetch user portfolio:', error);
        return next(error);
    }
});

export default router;
