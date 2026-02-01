import { Router } from 'express';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { environment } from '../../config/environment';
import prisma from '../../config/database.config';
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
        const userId = '1'; // Demo user

        let enrichedPortfolio: any[] = [];

        if (environment.dataSource === 'nse') {
            // Fetch from database using live tick data
            logger.info('[Portfolio] Using live NSE data from database');

            // Get portfolio positions from database
            const portfolioPositions = await prisma.portfolio.findMany({
                where: { userId },
            });

            if (portfolioPositions.length === 0) {
                logger.warn('[Portfolio] No portfolio positions found in database');
                // Fallback to CSV
                return await getCsvPortfolio(res);
            }

            // Get latest tick for each symbol
            enrichedPortfolio = await Promise.all(
                portfolioPositions.map(async (position) => {
                    const latestTick = await prisma.tick.findFirst({
                        where: { symbol: position.symbol },
                        orderBy: { timestamp: 'desc' },
                    });

                    const currentPrice = latestTick ? latestTick.price : parseFloat(position.currentPrice.toString());
                    const pnl = (currentPrice - parseFloat(position.entryPrice.toString())) * position.quantity;
                    const pnlPercent = ((currentPrice - parseFloat(position.entryPrice.toString())) / parseFloat(position.entryPrice.toString())) * 100;

                    return {
                        id: position.id,
                        symbol: position.symbol,
                        quantity: position.quantity,
                        entryPrice: parseFloat(position.entryPrice.toString()),
                        currentPrice,
                        pnl,
                        pnlPercent,
                        riskScore: parseFloat(position.riskScore.toString()),
                        riskLevel: parseFloat(position.riskScore.toString()),
                        exposure: parseFloat(position.exposure.toString()),
                        sector: position.sector || 'Unknown',
                        lastUpdate: latestTick?.timestamp || new Date(),
                    };
                })
            );
        } else {
            // Use CSV data
            return await getCsvPortfolio(res);
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

/**
 * Helper function to get CSV portfolio data
 */
async function getCsvPortfolio(res: any) {
    logger.info('[Portfolio] Using CSV data');

    const userId = '1';
    const portfolioData = await csvDataLoader.loadPortfolio(userId);
    const stockTicks = await csvDataLoader.loadStockTicks();

    const enrichedPortfolio = portfolioData.map((position) => {
        const currentTick = stockTicks.find((t) => t.symbol === position.symbol);

        return {
            id: position.symbol,
            symbol: position.symbol,
            quantity: parseInt(position.quantity, 10),
            entryPrice: parseFloat(position.entry_price),
            currentPrice: currentTick ? parseFloat(currentTick.price) : parseFloat(position.current_price),
            pnl: parseFloat(position.pnl),
            pnlPercent: parseFloat(position.pnl_percent),
            riskScore: parseFloat(position.risk_score),
            riskLevel: parseFloat(position.risk_score),
            exposure: parseFloat(position.exposure),
            sector: position.sector,
        };
    });

    const totalPnL = enrichedPortfolio.reduce((sum, p) => sum + p.pnl, 0);
    const totalExposure = enrichedPortfolio.reduce((sum, p) => sum + p.exposure, 0);
    const avgRisk = enrichedPortfolio.reduce((sum, p) => sum + p.riskScore, 0) / enrichedPortfolio.length;

    return res.json({
        success: true,
        data: {
            positions: enrichedPortfolio,
            summary: {
                totalPnL,
                totalExposure,
                avgRiskScore: avgRisk,
            },
        },
    });
}

export default router;
