import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../../../utils/logger';
import { NSEQuoteResponse, TickData } from './NSETypes';
import { environment } from '../../../config/environment';

export class NSEProvider {
    private axiosInstance: AxiosInstance;
    private baseUrl = 'https://www.nseindia.com';
    private sessionCookies: string = '';

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: environment.nseTimeoutMs || 5000,
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
            },
        });

        // Initial session setup
        this.initializeSession();
    }

    /**
     * Initialize NSE session by visiting homepage to get cookies
     */
    private async initializeSession(): Promise<void> {
        try {
            const response = await this.axiosInstance.get('/', {
                headers: {
                    'Referer': this.baseUrl,
                }
            });

            // Extract cookies from response
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                this.sessionCookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');
                logger.info('[NSEProvider] Session initialized successfully');
            }
        } catch (error) {
            logger.warn('[NSEProvider] Failed to initialize session:', error);
        }
    }

    /**
     * Fetch stock quote from NSE API
     */
    async fetchStock(symbol: string): Promise<TickData> {
        const maxRetries = environment.nseMaxRetries || 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`[NSEProvider] Fetching ${symbol} (attempt ${attempt}/${maxRetries})`);

                const config: AxiosRequestConfig = {
                    headers: {
                        'Referer': `${this.baseUrl}/get-quotes/equity?symbol=${symbol}`,
                        'Cookie': this.sessionCookies,
                    },
                };

                const response = await this.axiosInstance.get<NSEQuoteResponse>(
                    `/api/quote-equity?symbol=${symbol}`,
                    config
                );

                const data = response.data;

                // Map NSE response to internal TickData format
                const tickData: TickData = {
                    symbol: data.info.symbol,
                    price: data.priceInfo.lastPrice,
                    open: data.priceInfo.open,
                    high: data.priceInfo.intraDayHighLow.max,
                    low: data.priceInfo.intraDayHighLow.min,
                    close: data.priceInfo.close,
                    volume: data.preOpenMarket?.totalTradedVolume || 0,
                    change: data.priceInfo.change,
                    changePercent: data.priceInfo.pChange,
                    timestamp: this.parseNSETimestamp(data.metadata.lastUpdateTime),
                    sector: data.industryInfo?.sector,
                    sentiment: 0.5, // Neutral default (can be enhanced later)
                    volatility30d: undefined, // Not available in quote API
                };

                logger.info(`[NSEProvider] Successfully fetched ${symbol}: ₹${tickData.price} (${tickData.changePercent.toFixed(2)}%)`);
                return tickData;

            } catch (error: any) {
                lastError = error;

                // Handle specific error cases
                if (error.response?.status === 403) {
                    logger.warn(`[NSEProvider] 403 Forbidden for ${symbol} - reinitializing session`);
                    await this.initializeSession();
                    await this.delay(1000 * attempt); // Exponential backoff
                } else if (error.response?.status === 429) {
                    logger.warn(`[NSEProvider] Rate limited for ${symbol} - waiting ${attempt * 2}s`);
                    await this.delay(2000 * attempt);
                } else {
                    logger.error(`[NSEProvider] Error fetching ${symbol}:`, error.message);
                    if (attempt < maxRetries) {
                        await this.delay(500 * attempt);
                    }
                }
            }
        }

        throw new Error(`Failed to fetch ${symbol} after ${maxRetries} attempts: ${lastError?.message}`);
    }

    /**
     * Fetch multiple stocks in batch
     */
    async fetchBatch(symbols: string[]): Promise<TickData[]> {
        const results: TickData[] = [];

        for (const symbol of symbols) {
            try {
                const tickData = await this.fetchStock(symbol);
                results.push(tickData);

                // Add delay between requests to avoid rate limiting
                await this.delay(500);
            } catch (error) {
                logger.error(`[NSEProvider] Failed to fetch ${symbol} in batch:`, error);
                // Continue with other symbols
            }
        }

        return results;
    }

    /**
     * Health check - verify NSE API is accessible
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.fetchStock('RELIANCE');
            return true;
        } catch (error) {
            logger.error('[NSEProvider] Health check failed:', error);
            return false;
        }
    }

    /**
     * Parse NSE timestamp format (e.g., "30-Jan-2026 16:00:00")
     */
    private parseNSETimestamp(timestamp: string): Date {
        try {
            // NSE format: "30-Jan-2026 16:00:00"
            const [datePart, timePart] = timestamp.split(' ');
            const [day, month, year] = datePart.split('-');

            const monthMap: { [key: string]: string } = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };

            const isoDate = `${year}-${monthMap[month]}-${day}T${timePart}+05:30`; // IST
            return new Date(isoDate);
        } catch (error) {
            logger.warn(`[NSEProvider] Failed to parse timestamp "${timestamp}", using current time`);
            return new Date();
        }
    }

    /**
     * Utility: delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const nseProvider = new NSEProvider();
