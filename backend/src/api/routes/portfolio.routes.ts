import { Router } from 'express';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/portfolio
 * Get user portfolio (demo - uses CSV data)
 */
router.get('/', async (req, res, next) => {
    try {
        // For demo, use user_id = "1" from CSV
        const userId = '1';

        const portfolioData = await csvDataLoader.loadPortfolio(userId);
        const stockTicks = await csvDataLoader.loadStockTicks();

        // Enrich portfolio with current prices
        const enrichedPortfolio = portfolioData.map((position) => {
            const currentTick = stockTicks.find((t) => t.symbol === position.symbol);

            return {
                symbol: position.symbol,
                quantity: parseInt(position.quantity, 10),
                entryPrice: parseFloat(position.entry_price),
                currentPrice: currentTick ? parseFloat(currentTick.price) : parseFloat(position.current_price),
                pnl: parseFloat(position.pnl),
                pnlPercent: parseFloat(position.pnl_percent),
                riskScore: parseFloat(position.risk_score),
                exposure: parseFloat(position.exposure),
                sector: position.sector,
            };
        });

        // Calculate totals
        const totalPnL = enrichedPortfolio.reduce((sum, p) => sum + p.pnl, 0);
        const totalExposure = enrichedPortfolio.reduce((sum, p) => sum + p.exposure, 0);
        const avgRisk = enrichedPortfolio.reduce((sum, p) => sum + p.riskScore, 0) / enrichedPortfolio.length;

        res.json({
            success: true,
            data: {
                positions: enrichedPortfolio,
                summary: {
                    totalPnL,
                    totalExposure,
                    avgRiskScore: avgRisk,
                    positionCount: enrichedPortfolio.length,
                },
            },
        });
    } catch (error) {
        logger.error('Failed to fetch portfolio:', error);
        next(error);
    }
});

export default router;
