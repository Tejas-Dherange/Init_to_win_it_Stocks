import { RiskFactors } from '../../types/agents.types';
import { clamp, normalize } from '../../utils/helpers/mathHelpers';
import { environment } from '../../config/environment';
import { logger } from '../../utils/logger';
import { RiskReasonCode } from '../../utils/constants';

/**
 * Risk Scorer - Calculates composite risk score and generates reason codes
 */
export class RiskScorer {
    private readonly HIGH_THRESHOLD = environment.riskHighThreshold;
    private readonly MEDIUM_THRESHOLD = environment.riskMediumThreshold;

    /**
     * Calculate composite risk score (0-1 scale)
     * Formula: (VaR × 0.4) + (volatility × 0.3) + (sentiment_risk × 0.3)
     */
    calculateCompositeScore(factors: RiskFactors): number {
        const {
            var95,
            volatility,
            sentimentRisk,
            concentrationRisk,
        } = factors;

        // Normalize VaR (assuming max portfolio value loss of 50%)
        const normalizedVaR = normalize(var95, 0, 500000); // Adjust based on portfolio size

        // Normalize volatility (0-1 already if done by calculator)
        const normalizedVolatility = clamp(volatility, 0, 1);

        // Sentiment risk is already 0-1 (inverse of sentiment)
        const normalizedSentiment = clamp(sentimentRisk, 0, 1);

        // Concentration risk is already 0-1
        const normalizedConcentration = clamp(concentrationRisk, 0, 1);

        // Weighted composite score
        const compositeScore =
            normalizedVaR * 0.35 +
            normalizedVolatility * 0.25 +
            normalizedSentiment * 0.25 +
            normalizedConcentration * 0.15;

        const finalScore = clamp(compositeScore, 0, 1);

        logger.debug(`Risk score calculated: ${(finalScore * 100).toFixed(2)}%`);
        return finalScore;
    }

    /**
     * Determine risk level from score
     */
    getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 0.8) return 'critical';
        if (score >= this.HIGH_THRESHOLD) return 'high';
        if (score >= this.MEDIUM_THRESHOLD) return 'medium';
        return 'low';
    }

    /**
     * Generate reason codes based on risk factors
     */
    generateReasonCodes(factors: RiskFactors, sentiment?: number): string[] {
        const reasons: string[] = [];

        // High volatility
        if (factors.volatility > 0.3) {
            reasons.push(RiskReasonCode.HIGH_VOLATILITY);
        }

        // Negative sentiment
        if (sentiment !== undefined && sentiment < -0.2) {
            reasons.push(RiskReasonCode.NEGATIVE_SENTIMENT);
        }

        // High VaR
        if (factors.var95 > 100000) { // Adjust threshold
            reasons.push(RiskReasonCode.HIGH_VAR);
        }

        // Concentration risk
        if (factors.concentrationRisk > 0.4) {
            reasons.push(RiskReasonCode.CONCENTRATION_RISK);
        }

        return reasons;
    }

    /**
     * Calculate sentiment risk (inverse of sentiment)
     * sentiment: -1 to +1
     * risk: 0 to 1 (higher risk when sentiment is negative)
     */
    calculateSentimentRisk(sentiment?: number): number {
        if (sentiment === undefined) {
            return 0.5; // Neutral risk if sentiment unknown
        }

        // Map sentiment (-1 to +1) to risk (1 to 0)
        // sentiment = -1 → risk = 1
        // sentiment = 0 → risk = 0.5
        // sentiment = +1 → risk = 0
        const sentimentRisk = (1 - sentiment) / 2;

        return clamp(sentimentRisk, 0, 1);
    }

    /**
     * Calculate concentration risk
     * Returns 0-1 where 1 means highly concentrated
     */
    calculateConcentrationRisk(
        exposureBySymbol: Record<string, number>,
        totalPortfolioValue: number
    ): number {
        if (totalPortfolioValue === 0) {
            return 0;
        }

        // Find maximum single stock exposure
        const maxExposure = Math.max(...Object.values(exposureBySymbol));
        const maxExposurePercent = maxExposure / totalPortfolioValue;

        // Normalize to 0-1 scale
        // 0% exposure = 0 risk
        // 40%+ exposure = 1 risk
        const concentrationRisk = normalize(maxExposurePercent, 0, environment.concentrationThreshold * 2);

        return clamp(concentrationRisk, 0, 1);
    }

    /**
     * Adjust risk score based on market conditions
     */
    adjustForMarketConditions(
        baseScore: number,
        marketVolatilityIndex?: number
    ): number {
        if (!marketVolatilityIndex) {
            return baseScore;
        }

        // If market is highly volatile, increase risk across the board
        if (marketVolatilityIndex > 30) {
            const multiplier = 1 + (marketVolatilityIndex - 30) / 100;
            return clamp(baseScore * multiplier, 0, 1);
        }

        return baseScore;
    }
}

export default RiskScorer;
