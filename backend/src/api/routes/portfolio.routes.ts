import { Router } from 'express';
import prisma from '../../config/database.config';
import { logger } from '../../utils/logger';
// import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

/**
 * GET /api/v1/portfolio
 * Get authenticated user's portfolio from database with live tick data
 * AUTH TEMPORARILY DISABLED FOR TESTING - ADD BACK LATER
 */
router.get('/', /* requireAuth, */ async (_req, res, next) => {
    try {
        // TEMP: Hardcode user ID for testing without auth
        const userId = '1'; // req.user?.id;

        /* COMMENTED OUT FOR TESTING
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }
        */

        logger.info(`[Portfolio] Fetching portfolio for user ${userId}`);

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

        // Enrich with live tick data if available
        const enrichedPositions = await Promise.all(
            positions.map(async (position) => {
                // Get latest tick for this symbol
                const latestTick = await prisma.tick.findFirst({
                    where: { symbol: position.symbol },
                    orderBy: { timestamp: 'desc' },
                });

                // Use live tick price if available, otherwise use stored currentPrice
                const currentPrice = latestTick?.price || position.currentPrice;
                const pnl = (currentPrice - position.entryPrice) * position.quantity;
                const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

                return {
                    id: position.id,
                    symbol: position.symbol,
                    quantity: position.quantity,
                    entryPrice: position.entryPrice,
                    currentPrice,
                    pnl,
                    pnlPercent,
                    riskScore: position.riskScore,
                    riskLevel: position.riskScore,
                    exposure: position.exposure,
                    sector: position.sector || 'Unknown',
                    lastUpdate: latestTick?.timestamp || position.updatedAt,
                };
            })
        );

        // Calculate totals
        const totalPnL = enrichedPositions.reduce((sum, p) => sum + p.pnl, 0);
        const totalExposure = enrichedPositions.reduce((sum, p) => sum + p.exposure, 0);
        const avgRisk = enrichedPositions.reduce((sum, p) => sum + p.riskScore, 0) / enrichedPositions.length;

        return res.json({
            success: true,
            data: {
                positions: enrichedPositions,
                summary: {
                    totalPnL,
                    totalExposure,
                    avgRiskScore: avgRisk,
                    positionCount: enrichedPositions.length,
                },
            },
        });
    } catch (error) {
        logger.error('[Portfolio] Failed to fetch portfolio:', error);
        return next(error);
    }
});

export default router;
