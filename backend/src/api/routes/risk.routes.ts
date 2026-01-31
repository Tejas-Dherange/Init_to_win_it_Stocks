import { Router } from 'express';
import { MasterAgent } from '../../agents/master/MasterAgent';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { logger } from '../../utils/logger';

const router = Router();
const masterAgent = new MasterAgent();

/**
 * GET /api/v1/risk/:symbol
 * Get risk assessment for a symbol
 */
router.get('/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        logger.info(`Risk assessment requested for ${symbol}`);

        // Get tick data from CSV
        const tickData = await csvDataLoader.getTickBySymbol(symbol);

        if (!tickData) {
            return res.status(404).json({
                success: false,
                message: `Symbol ${symbol} not found`,
            });
        }

        // Run workflow (Market + Risk agents only)
        const workflowResult = await masterAgent.executeWorkflow({
            userId: '1', // Demo user
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
        });

        res.json({
            success: true,
            data: {
                symbol,
                risk: workflowResult.riskAssessment,
                executionTime: workflowResult.auditTrail.reduce((sum, a) => sum + a.duration, 0),
            },
        });
    } catch (error) {
        logger.error('Risk assessment failed:', error);
        next(error);
    }
});

export default router;
