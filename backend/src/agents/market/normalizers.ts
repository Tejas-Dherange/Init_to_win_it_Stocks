import { normalizeSymbol } from '../../utils/helpers/formatters';

/**
 * Normalize stock symbol to NSE format
 */
export const normalizeStockSymbol = (symbol: string): string => {
    return normalizeSymbol(symbol);
};

/**
 * Normalize timestamp to Date object
 */
export const normalizeTimestamp = (timestamp: string | Date): Date => {
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return new Date(timestamp);
};

/**
 * Calculate price change
 */
export const calculateChange = (current: number, previous: number): number => {
    return current - previous;
};

/**
 * Calculate price change percentage
 */
export const calculateChangePercent = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Normalize volume to number
 */
export const normalizeVolume = (volume: string | number | bigint): number => {
    if (typeof volume === 'bigint') {
        return Number(volume);
    }
    if (typeof volume === 'string') {
        return parseInt(volume, 10);
    }
    return volume;
};

export default {
    normalizeStockSymbol,
    normalizeTimestamp,
    calculateChange,
    calculateChangePercent,
    normalizeVolume,
};
