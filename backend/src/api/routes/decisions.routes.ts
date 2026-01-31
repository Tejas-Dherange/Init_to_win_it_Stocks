import { Router } from 'express';
import { MasterAgent } from '../../agents/master/MasterAgent';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { logger } from '../../utils/logger';
import prisma from '../../config/database.config';
import { environment } from '../../config/environment';

const router = Router();
const masterAgent = new MasterAgent();

/**
 * POST /api/v1/decisions/generate
 * Generate trading decisions for portfolio
 */
router.post('/generate', async (req, res, next) => {
    try {
        const userId = '1'; // Demo user

        // Load portfolio - LIMIT TO 2 STOCKS to avoid Gemini rate limits (5 req/min)
        const portfolioData = await csvDataLoader.loadPortfolio(userId);
        const stockTicks = await csvDataLoader.loadStockTicks();

        // LIMIT: Only process first 2 positions to stay under rate limit
        const limitedPortfolio = portfolioData.slice(0, 2);
        logger.info(`\n⚠️  Processing ${limitedPortfolio.length} stocks (limited for rate limits)`);

        const decisions = [];

        // Process each position
        for (const position of limitedPortfolio) {
            const tickData = stockTicks.find((t) => t.symbol === position.symbol);

            if (!tickData) {
                logger.warn(`Tick data not found for ${position.symbol}`);
                continue;
            }

            // Fetch real portfolio ID from DB for FK constraint
            let portfolioId = position.symbol; // Fallback
            if (environment.databaseUrl) {
                const dbPortfolio = await prisma.portfolio.findFirst({
                    where: {
                        userId: userId,
                        symbol: position.symbol,
                    },
                });
                if (dbPortfolio) {
                    portfolioId = dbPortfolio.id;
                }
            }

            // Run complete workflow
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
                    id: portfolioId, // Use real UUID or symbol fallback
                    symbol: position.symbol,
                    quantity: parseInt(position.quantity, 10),
                    entryPrice: parseFloat(position.entry_price),
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

        res.json({
            success: true,
            data: {
                decisions,
                count: decisions.length,
                highUrgency: decisions.filter((d) => d.decision.urgency >= 7).length,
            },
        });
    } catch (error) {
        logger.error('Failed to generate decisions:', error);
        next(error);
    }
});

/**
 * GET /api/v1/decisions
 * Get pending decisions (demo - returns generated decisions)
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = '1'; // Demo user

        const decisions = await prisma.decision.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                portfolio: true,
            }
        });

        res.json({
            success: true,
            data: decisions,
            count: decisions.length,
        });
    } catch (error) {
        logger.error('Failed to fetch decisions:', error);
        next(error);
    }
});

export default router;
