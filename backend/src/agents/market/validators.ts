import { z } from 'zod';

/**
 * Tick validation schema
 */
export const tickSchema = z.object({
    symbol: z.string().min(1).max(20),
    price: z.number().positive(),
    open: z.number().positive(),
    high: z.number().positive(),
    low: z.number().positive(),
    close: z.number().positive(),
    volume: z.number().nonnegative(),
    change: z.number(),
    changePercent: z.number(),
    timestamp: z.date(),
    sentiment: z.number().min(-1).max(1).optional(),
    volatility30d: z.number().min(0).max(1).optional(),
    marketCap: z.bigint().optional(),
    peRatio: z.number().positive().optional(),
    sector: z.string().optional(),
});

/**
 * Validate price relationships
 */
export const validatePriceRelationships = (tick: any): boolean => {
    // High should be >= all other prices
    if (tick.high < tick.low || tick.high < tick.open || tick.high < tick.close) {
        return false;
    }

    // Low should be <= all other prices
    if (tick.low > tick.high || tick.low > tick.open || tick.low > tick.close) {
        return false;
    }

    // Current price should be within high-low range
    if (tick.price < tick.low || tick.price > tick.high) {
        return false;
    }

    return true;
};

/**
 * Validate NSE symbol format
 */
export const validateNSESymbol = (symbol: string): boolean => {
    // NSE symbols: 1-20 characters, alphanumeric, may have .NS suffix
    const regex = /^[A-Z0-9&]{1,20}(\.NS)?$/;
    return regex.test(symbol);
};

export default tickSchema;
