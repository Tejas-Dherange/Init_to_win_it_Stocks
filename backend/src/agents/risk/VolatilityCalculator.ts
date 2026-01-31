import { standardDeviation, ewma } from '../../utils/helpers/mathHelpers';
import { logger } from '../../utils/logger';

/**
 * Volatility Calculator for stock price data
 */
export class VolatilityCalculator {
    /**
     * Calculate historical volatility (annualized)
     * @param prices Array of historical prices
     * @param windowDays Number of days for rolling window
     */
    calculateHistoricalVolatility(prices: number[], windowDays: number = 30): number {
        if (prices.length < 2) {
            logger.warn('Insufficient price data for volatility calculation');
            return 0;
        }

        // Calculate daily returns
        const returns = this.calculateReturns(prices);

        // Take last N days
        const recentReturns = returns.slice(-windowDays);

        // Calculate standard deviation of returns
        const dailyVolatility = standardDeviation(recentReturns);

        // Annualize (√252 trading days)
        const annualizedVolatility = dailyVolatility * Math.sqrt(252);

        logger.debug(`Historical volatility (${windowDays}d): ${(annualizedVolatility * 100).toFixed(2)}%`);
        return annualizedVolatility;
    }

    /**
     * Calculate returns from prices
     */
    private calculateReturns(prices: number[]): number[] {
        const returns: number[] = [];

        for (let i = 1; i < prices.length; i++) {
            if (prices[i - 1] !== 0) {
                const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
                returns.push(ret);
            }
        }

        return returns;
    }

    /**
     * Calculate EWMA (Exponentially Weighted Moving Average) volatility
     * Gives more weight to recent observations
     */
    calculateEWMAVolatility(prices: number[], lambda: number = 0.94): number {
        const returns = this.calculateReturns(prices);

        if (returns.length === 0) {
            return 0;
        }

        // Square returns to get variance
        const squaredReturns = returns.map((r) => r * r);

        // Calculate EWMA variance
        const ewmaVariance = ewma(squaredReturns, lambda);

        // Volatility is square root of variance, annualized
        const dailyVolatility = Math.sqrt(ewmaVariance);
        return dailyVolatility * Math.sqrt(252);
    }

    /**
     * Detect volatility clustering (GARCH-like behavior)
     * Returns true if current volatility is significantly higher than average
     */
    detectVolatilityClustering(prices: number[], threshold: number = 1.5): boolean {
        if (prices.length < 60) {
            return false;
        }

        // Calculate short-term volatility (last 10 days)
        const recentPrices = prices.slice(-10);
        const shortTermVol = this.calculateHistoricalVolatility(recentPrices, 10);

        // Calculate long-term volatility (last 60 days)
        const longTermPrices = prices.slice(-60);
        const longTermVol = this.calculateHistoricalVolatility(longTermPrices, 60);

        // Clustering if short-term vol is significantly higher
        const isClustering = shortTermVol > longTermVol * threshold;

        if (isClustering) {
            logger.info('Volatility clustering detected');
        }

        return isClustering;
    }

    /**
     * Calculate Parkinson volatility (uses High-Low range)
     * More efficient estimator than close-to-close
     */
    calculateParkinsonVolatility(highs: number[], lows: number[]): number {
        if (highs.length !== lows.length || highs.length === 0) {
            return 0;
        }

        const n = highs.length;
        let sum = 0;

        for (let i = 0; i < n; i++) {
            if (lows[i] !== 0) {
                const ratio = highs[i] / lows[i];
                sum += Math.pow(Math.log(ratio), 2);
            }
        }

        // Parkinson formula
        const variance = sum / (4 * n * Math.log(2));
        const dailyVolatility = Math.sqrt(variance);

        // Annualize
        return dailyVolatility * Math.sqrt(252);
    }

    /**
     * Calculate realized volatility from intraday data
     */
    calculateRealizedVolatility(intradayReturns: number[]): number {
        if (intradayReturns.length === 0) {
            return 0;
        }

        // Sum of squared returns
        const sumSquared = intradayReturns.reduce((sum, r) => sum + r * r, 0);

        // Realized variance
        const realizedVariance = sumSquared;

        // Realized volatility (annualized)
        return Math.sqrt(realizedVariance * 252);
    }

    /**
     * Normalize volatility to 0-1 scale for risk scoring
     */
    normalizeVolatility(volatility: number): number {
        // Typical volatility range: 0% - 100% annualized
        // Map to 0-1 scale
        const normalized = Math.min(volatility, 1.0);
        return Math.max(0, normalized);
    }
}

export default VolatilityCalculator;
