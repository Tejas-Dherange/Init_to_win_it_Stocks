import axios from 'axios';
import { nseProvider } from '../services/data-sources/stock/NSEProvider';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * LiveNSEPoller - Continuously fetches live stock data from NSE and posts to ingestion API
 */
class LiveNSEPoller {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning = false;
    private readonly apiUrl: string;
    private readonly pollInterval: number;
    private readonly watchSymbols: string[];

    constructor() {
        this.apiUrl = `http://localhost:${environment.port}/api/${environment.apiVersion}/ingest/tick`;
        this.pollInterval = environment.nsePollIntervalMs;
        this.watchSymbols = environment.nseWatchSymbols;

        logger.info(`[LiveNSEPoller] Initialized with ${this.watchSymbols.length} symbols`);
        logger.info(`[LiveNSEPoller] Poll interval: ${this.pollInterval}ms`);
        logger.info(`[LiveNSEPoller] Watch list: ${this.watchSymbols.join(', ')}`);
    }

    /**
     * Start the poller
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            logger.warn('[LiveNSEPoller] Already running');
            return;
        }

        logger.info('[LiveNSEPoller] Starting live data polling...');
        this.isRunning = true;

        // Initial fetch
        await this.fetchAndIngest();

        // Schedule recurring fetches
        this.intervalId = setInterval(async () => {
            await this.fetchAndIngest();
        }, this.pollInterval);

        logger.info('[LiveNSEPoller] ✅ Live polling started');
    }

    /**
     * Stop the poller
     */
    stop(): void {
        if (!this.isRunning) {
            logger.warn('[LiveNSEPoller] Not running');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        logger.info('[LiveNSEPoller] ❌ Stopped');
    }

    /**
     * Fetch data from NSE and post to ingestion API
     */
    private async fetchAndIngest(): Promise<void> {
        logger.info(`[LiveNSEPoller] Fetching ${this.watchSymbols.length} symbols...`);

        const startTime = Date.now();
        let successCount = 0;
        let failCount = 0;

        for (const symbol of this.watchSymbols) {
            try {
                // Fetch from NSE
                const tickData = await nseProvider.fetchStock(symbol);

                // Post to ingestion API
                await axios.post(this.apiUrl, tickData, {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                successCount++;
                logger.info(`[LiveNSEPoller] ✅ ${symbol}: ₹${tickData.price} (${tickData.changePercent.toFixed(2)}%)`);

                // Add delay between requests to avoid rate limiting
                await this.delay(500);
            } catch (error: any) {
                failCount++;
                logger.error(`[LiveNSEPoller] ❌ ${symbol}: ${error.message}`);
            }
        }

        const duration = Date.now() - startTime;
        logger.info(`[LiveNSEPoller] Cycle complete: ${successCount} success, ${failCount} failed (${duration}ms)`);
    }

    /**
     * Get current status
     */
    getStatus(): { running: boolean; symbols: string[]; interval: number } {
        return {
            running: this.isRunning,
            symbols: this.watchSymbols,
            interval: this.pollInterval,
        };
    }

    /**
     * Utility: delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
export const liveNSEPoller = new LiveNSEPoller();

// Auto-start if DATA_SOURCE is 'nse'
if (environment.dataSource === 'nse') {
    logger.info('[LiveNSEPoller] Data source set to NSE - auto-starting poller');

    // Wait a bit for server to be fully ready
    setTimeout(async () => {
        try {
            await liveNSEPoller.start();
        } catch (error) {
            logger.error('[LiveNSEPoller] Failed to auto-start:', error);
        }
    }, 3000); // 3 second delay
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('[LiveNSEPoller] SIGTERM received');
    liveNSEPoller.stop();
});

process.on('SIGINT', () => {
    logger.info('[LiveNSEPoller] SIGINT received');
    liveNSEPoller.stop();
});
