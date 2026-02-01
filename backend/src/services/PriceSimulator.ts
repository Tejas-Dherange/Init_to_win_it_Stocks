import prisma from '../config/database.config';
import { logger } from '../utils/logger';

/**
 * Price Simulator - Adds random variations to portfolio prices
 * USE ONLY FOR DEMO/TESTING when market is closed
 */
export class PriceSimulator {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning = false;

    /**
     * Start simulating price changes
     * Adds ±0.5% to ±2% random variation every 5 seconds
     */
    start() {
        if (this.isRunning) {
            logger.warn('[PriceSimulator] Already running');
            return;
        }

        this.isRunning = true;
        logger.info('[PriceSimulator] 🎭 Starting simulated price updates (DEMO MODE)');

        this.intervalId = setInterval(async () => {
            try {
                await this.updatePrices();
            } catch (error) {
                logger.error('[PriceSimulator] Error updating prices:', error);
            }
        }, 5000); // Update every 5 seconds
    }

    /**
     * Stop price simulation
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
            logger.info('[PriceSimulator] Stopped simulated price updates');
        }
    }

    /**
     * Update all portfolio positions with simulated price changes
     */
    private async updatePrices() {
        const portfolios = await prisma.portfolio.findMany();

        for (const portfolio of portfolios) {
            // Generate random price change: -2% to +2%
            const changePercent = (Math.random() - 0.5) * 4; // -2 to +2
            const changeFactor = 1 + (changePercent / 100);

            // Calculate new price
            const newPrice = Number((portfolio.currentPrice * changeFactor).toFixed(2));

            // Calculate new P&L
            const pnl = Number(((newPrice - portfolio.entryPrice) * portfolio.quantity).toFixed(2));
            const pnlPercent = Number((((newPrice - portfolio.entryPrice) / portfolio.entryPrice) * 100).toFixed(2));

            // Update portfolio
            await prisma.portfolio.update({
                where: { id: portfolio.id },
                data: {
                    currentPrice: newPrice,
                    pnl,
                    pnlPercent,
                },
            });

            // Create a new tick record so API picks up the latest price
            // (API prioritizes latest Tick over Portfolio currentPrice)
            await prisma.tick.create({
                data: {
                    symbol: portfolio.symbol,
                    price: newPrice,
                    open: portfolio.currentPrice, // Simplified
                    high: Math.max(portfolio.currentPrice, newPrice),
                    low: Math.min(portfolio.currentPrice, newPrice),
                    close: newPrice,
                    volume: BigInt(Math.floor(Math.random() * 10000)),
                    change: newPrice - portfolio.currentPrice,
                    changePercent: changePercent,
                    timestamp: new Date(),
                    sentiment: 0.5, // Neutral for demo
                }
            });

            logger.info(
                `[PriceSimulator] ${portfolio.symbol}: ₹${portfolio.currentPrice} → ₹${newPrice} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
            );
        }
    }
}

// Singleton instance
export const priceSimulator = new PriceSimulator();
