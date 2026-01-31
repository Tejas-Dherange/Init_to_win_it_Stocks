/**
 * Calculate statistical mean
 */
export const mean = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = mean(values);
    const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
};

/**
 * Calculate percentile (e.g., 95th percentile for VaR)
 */
export const percentile = (values: number[], p: number): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
};

/**
 * Normalize value to 0-1 scale
 */
export const normalize = (value: number, min: number, max: number): number => {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Calculate compound annual growth rate (CAGR)
 */
export const cagr = (startValue: number, endValue: number, years: number): number => {
    if (years === 0 || startValue === 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

/**
 * Calculate simple moving average
 */
export const sma = (values: number[], period: number): number => {
    if (values.length < period) return mean(values);
    const recent = values.slice(-period);
    return mean(recent);
};

/**
 * Calculate exponentially weighted moving average
 */
export const ewma = (values: number[], alpha: number = 0.94): number => {
    if (values.length === 0) return 0;
    let result = values[0];
    for (let i = 1; i < values.length; i++) {
        result = alpha * result + (1 - alpha) * values[i];
    }
    return result;
};

/**
 * Round to specified decimal places
 */
export const roundTo = (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};
