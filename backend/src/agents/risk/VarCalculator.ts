import { standardDeviation } from '../../utils/helpers/mathHelpers';
import { logger } from '../../utils/logger';

/**
 * VaR Calculator using Historical Simulation
 */
export class VarCalculator {
    /**
     * Calculate Value at Risk at given confidence level
     * @param returns Array of historical returns
     * @param confidence Confidence level (e.g., 0.95 for 95%)
     * @param portfolioValue Current portfolio value
     */
    calculateHistoricalVaR(
        returns: number[],
        confidence: number = 0.95,
        portfolioValue: number = 1000000
    ): number {
        if (returns.length === 0) {
            logger.warn('Empty returns array for VaR calculation');
            return 0;
        }

        // Sort returns in ascending order
        const sortedReturns = [...returns].sort((a, b) => a - b);

        // Find the return at the (1-confidence) percentile
        const varPercentile = 1 - confidence;
        const index = Math.floor(sortedReturns.length * varPercentile);
        const varReturn = sortedReturns[Math.max(0, index)];

        // Convert to monetary value
        const var95 = Math.abs(varReturn * portfolioValue);

        logger.debug(`VaR (${confidence * 100}%): ₹${var95.toFixed(2)}`);
        return var95;
    }

    /**
     * Calculate parametric VaR (assumes normal distribution)
     */
    calculateParametricVaR(
        returns: number[],
        confidence: number = 0.95,
        portfolioValue: number = 1000000
    ): number {
        if (returns.length === 0) {
            return 0;
        }

        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const stdDev = standardDeviation(returns);

        // Z-score for 95% confidence ≈ 1.645 (one-tailed)
        const zScore = this.getZScore(confidence);

        // VaR = (mean - z * stdDev) * portfolioValue
        const varReturn = mean - zScore * stdDev;
        const var95 = Math.abs(varReturn * portfolioValue);

        return var95;
    }

    /**
     * Generate synthetic returns for Monte Carlo simulation
     */
    generateSyntheticReturns(
        mean: number,
        stdDev: number,
        count: number = 1000
    ): number[] {
        const returns: number[] = [];

        for (let i = 0; i < count; i++) {
            // Box-Muller transform for normal distribution
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const syntheticReturn = mean + z * stdDev;
            returns.push(syntheticReturn);
        }

        return returns;
    }

    /**
     * Get Z-score for confidence level
     */
    private getZScore(confidence: number): number {
        const zScores: Record<number, number> = {
            0.90: 1.282,
            0.95: 1.645,
            0.99: 2.326,
        };

        return zScores[confidence] || 1.645;
    }

    /**
     * Calculate Expected Shortfall (CVaR)
     * Average loss beyond VaR threshold
     */
    calculateExpectedShortfall(
        returns: number[],
        confidence: number = 0.95,
        portfolioValue: number = 1000000
    ): number {
        if (returns.length === 0) {
            return 0;
        }

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varPercentile = 1 - confidence;
        const cutoffIndex = Math.floor(sortedReturns.length * varPercentile);

        // Average of returns worse than VaR
        const tailReturns = sortedReturns.slice(0, cutoffIndex);
        if (tailReturns.length === 0) {
            return 0;
        }

        const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
        return Math.abs(avgTailReturn * portfolioValue);
    }
}

export default VarCalculator;
