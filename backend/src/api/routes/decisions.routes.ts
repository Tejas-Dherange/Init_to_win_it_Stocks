import { Router } from 'express';
import { MasterAgent } from '../../agents/master/MasterAgent';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { logger } from '../../utils/logger';
import prisma from '../../config/database.config';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();
const masterAgent = new MasterAgent();

/**
 * POST /api/v1/decisions/generate
 * Generate trading decisions for authenticated user's portfolio
 */
router.post('/generate', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }

        // Load portfolio from database scoped to user
        const userPortfolio = await prisma.portfolio.findMany({
            where: { userId },
        });

        if (userPortfolio.length === 0) {
            return res.json({
                success: true,
                data: {
                    decisions: [],
                    count: 0,
                    highUrgency: 0,
                },
            });
        }

        // Load global simulated stock ticks
        const stockTicks = await csvDataLoader.loadStockTicks();

        // LIMIT: Only process first 2 positions to stay under rate limit
        const limitedPortfolio = userPortfolio.slice(0, 2);
        logger.info(`\n⚠️  Processing ${limitedPortfolio.length} stocks (limited for rate limits)`);

        const decisions = [];

        // Process each position
        for (const position of userPortfolio) {
            const tickData = stockTicks.find((t) => t.symbol === position.symbol);

            if (!tickData) {
                logger.warn(`Tick data not found for ${position.symbol}`);
                continue;
            }

            // Run complete workflow scoped to user
            const workflowResult = await masterAgent.executeWorkflow({
                userId,
                rawTick: {
                    symbol: tickData.symbol,
                    price: parseFloat(tickData.price),
                    open: parseFloat(tickData.open),
                    high: parseFloat(tickData.high),
                    low: parseFloat(tickData.low),
                    close: parseFloat(tickData.close),
                    volume: parseInt(tickData.volume, 10),
                    change: parseFloat(tickData.change),
                    changePercent: parseFloat(tickData.change_percent),
                    timestamp: new Date(tickData.timestamp),
                    sentiment: tickData.sentiment ? parseFloat(tickData.sentiment) : undefined,
                    volatility30d: tickData.volatility30d ? parseFloat(tickData.volatility30d) : undefined,
                    sector: tickData.sector,
                },
                portfolioPosition: {
                    id: position.id,
                    symbol: position.symbol,
                    quantity: position.quantity,
                    entryPrice: position.entryPrice,
                    currentPrice: parseFloat(tickData.price),
                },
            });

            if (workflowResult.decision) {
                decisions.push({
                    symbol: position.symbol,
                    decision: workflowResult.decision,
                    risk: workflowResult.riskAssessment,
                });
            }
        }

        // Sort by urgency
        decisions.sort((a, b) => b.decision.urgency - a.decision.urgency);

        return res.json({
            success: true,
            data: {
                decisions,
                count: decisions.length,
                highUrgency: decisions.filter((d) => d.decision.urgency >= 7).length,
            },
        });
    } catch (error) {
        logger.error('Failed to generate decisions:', error);
        return next(error);
    }
});

/**
 * GET /api/v1/decisions
 * Get pending decisions for the authenticated user
 * AUTH TEMPORARILY DISABLED FOR TESTING
 */
router.get('/', /* requireAuth, */ async (req, res, next) => {
    try {
        const userId = '1'; // req.user?.id;

        const pendingDecisions = await prisma.decision.findMany({
            where: {
                userId,
                status: 'pending',
            },
            include: {
                portfolio: true,
                alternatives: true,
            },
            orderBy: {
                urgency: 'desc',
            },
        });

        return res.json({
            success: true,
            data: pendingDecisions,
        });
    } catch (error) {
        logger.error('Failed to fetch pending decisions:', error);
        return next(error);
    }
});

export default router;
