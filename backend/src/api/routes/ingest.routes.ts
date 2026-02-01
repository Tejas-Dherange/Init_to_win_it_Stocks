import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { nseProvider } from '../../services/data-sources/stock/NSEProvider';
import prisma from '../../config/database.config';
// import { MasterAgent } from '../../agents/master/MasterAgent';

const router = Router();
// const masterAgent = new MasterAgent(); // Unused

// Validation schema for tick data
const TickSchema = z.object({
    symbol: z.string().min(1).max(20),
    price: z.number().positive(),
    open: z.number().positive(),
    high: z.number().positive(),
    low: z.number().positive(),
    close: z.number().positive(),
    volume: z.number().nonnegative(),
    change: z.number(),
    changePercent: z.number(),
    timestamp: z.string().datetime().or(z.date()),
    sentiment: z.number().min(0).max(1).optional(),
    volatility30d: z.number().optional(),
    sector: z.string().optional(),
});

/**
 * POST /api/v1/ingest/tick
 * Ingest a single stock tick and optionally trigger workflow
 */
router.post('/tick', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate incoming data
        const validatedTick = TickSchema.parse(req.body);

        logger.info(`[TickIngest] Received tick for ${validatedTick.symbol}`);

        // Store tick in database
        const tick = await prisma.tick.create({
            data: {
                symbol: validatedTick.symbol,
                price: validatedTick.price,
                open: validatedTick.open,
                high: validatedTick.high,
                low: validatedTick.low,
                close: validatedTick.close,
                volume: BigInt(validatedTick.volume),
                change: validatedTick.change,
                changePercent: validatedTick.changePercent,
                timestamp: new Date(validatedTick.timestamp),
                sentiment: validatedTick.sentiment,
                volatility30d: validatedTick.volatility30d,
                sector: validatedTick.sector,
            },
        });

        logger.info(`[TickIngest] Stored tick ${tick.id} for ${validatedTick.symbol}`);

        // Optionally trigger workflow for this tick
        // This is commented out to avoid overwhelming the system
        // Uncomment if you want real-time decision generation on every tick
        /*
        const userId = '1'; // Demo user
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId, symbol: validatedTick.symbol }
        });

        if (portfolio) {
            logger.info(`[TickIngest] Triggering workflow for ${validatedTick.symbol}`);
            await masterAgent.executeWorkflow({
                userId,
                rawTick: validatedTick,
                portfolioPosition: {
                    id: portfolio.id,
                    symbol: portfolio.symbol,
                    quantity: portfolio.quantity,
                    entryPrice: parseFloat(portfolio.avgPrice.toString()),
                    currentPrice: validatedTick.price,
                },
            });
        }
        */

        // Return success response with ingested tick
        res.json({
            success: true,
            data: {
                tick
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid tick data',
                errors: error.errors,
            });
            return;
        }
        next(error);
        return;
    }
});

/**
 * POST /api/v1/ingest/batch
 * Ingest multiple ticks at once
 */
router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticks = z.array(TickSchema).parse(req.body);

        logger.info(`[TickIngest] Batch ingest of ${ticks.length} ticks`);

        const results = await Promise.all(
            ticks.map(async (tickData) => {
                try {
                    return await prisma.tick.create({
                        data: {
                            symbol: tickData.symbol,
                            price: tickData.price,
                            open: tickData.open,
                            high: tickData.high,
                            low: tickData.low,
                            close: tickData.close,
                            volume: BigInt(tickData.volume),
                            change: tickData.change,
                            changePercent: tickData.changePercent,
                            timestamp: new Date(tickData.timestamp),
                            sentiment: tickData.sentiment,
                            volatility30d: tickData.volatility30d,
                            sector: tickData.sector,
                        },
                    });
                } catch (error) {
                    logger.error(`[TickIngest] Failed to ingest ${tickData.symbol}:`, error);
                    return null;
                }
            })
        );

        const successCount = results.filter(r => r !== null).length;

        res.json({
            success: true,
            message: `Batch ingest completed: ${successCount}/${ticks.length} successful`,
            data: {
                total: ticks.length,
                success: successCount,
                failed: ticks.length - successCount,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid batch data',
                errors: error.errors,
            });
            return;
        }
        next(error);
        return;
    }
});

/**
 * GET /api/v1/ingest/status
 * Get poller status and NSE API health
 */
// Status endpoint
router.get('/status', async (_req: Request, res: Response) => {
    try {
        const nseHealthy = await nseProvider.healthCheck();

        // Get last ingested tick
        const lastTick = await prisma.tick.findFirst({
            orderBy: { createdAt: 'desc' },
            select: {
                symbol: true,
                price: true,
                timestamp: true,
                createdAt: true,
            },
        });

        // Count ticks in last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentTickCount = await prisma.tick.count({
            where: {
                createdAt: {
                    gte: fiveMinutesAgo,
                },
            },
        });

        res.json({
            success: true,
            data: {
                nseApiHealthy: nseHealthy,
                dataSource: process.env.DATA_SOURCE || 'csv',
                lastTick: lastTick || null,
                recentTickCount,
                pollerActive: process.env.DATA_SOURCE === 'nse',
            },
        });
    } catch (error) {
        logger.error('[TickIngest] Status check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ingestion status',
        });
    }
});

/**
 * GET /api/v1/ingest/sources
 * List available data sources
 */
router.get('/sources', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            active: process.env.DATA_SOURCE || 'csv',
            available: ['csv', 'nse'],
            nseWatchSymbols: (process.env.NSE_WATCH_SYMBOLS || '').split(',').filter(Boolean),
        },
    });
});

export default router;
