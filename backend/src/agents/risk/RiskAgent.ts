import { BaseAgent } from '../base/BaseAgent';
import { ValidatedTick, RiskAssessment, RiskFactors } from '../../types/agents.types';
import { VarCalculator } from './VarCalculator';
import { VolatilityCalculator } from './VolatilityCalculator';
import { RiskScorer } from './RiskScorer';
import { logger } from '../../utils/logger';

/**
 * RiskAgent - Calculates risk assessment for stock positions
 */
export class RiskAgent extends BaseAgent<ValidatedTick, RiskAssessment> {
    private varCalculator: VarCalculator;
    private volatilityCalculator: VolatilityCalculator;
    private riskScorer: RiskScorer;

    constructor() {
        super('RiskAgent');
        this.varCalculator = new VarCalculator();
        this.volatilityCalculator = new VolatilityCalculator();
        this.riskScorer = new RiskScorer();
    }

    /**
     * Validate input tick
     */
    protected validate(input: ValidatedTick): boolean {
        if (!input || !input.symbol) {
            logger.warn('Invalid tick data for risk assessment');
            return false;
        }

        if (!input.normalized || !input.enriched) {
            logger.warn('Tick data not properly validated by MarketAgent');
            return false;
        }

        return true;
    }

    /**
     * Process risk assessment
     */
    protected async process(input: ValidatedTick): Promise<RiskAssessment> {
        logger.info(`Calculating risk for ${input.symbol}`);

        // Step 1: Calculate risk factors
        const factors = await this.calculateRiskFactors(input);

        // Step 2: Calculate composite risk score
        const riskScore = this.riskScorer.calculateCompositeScore(factors);

        // Step 3: Determine risk level
        const riskLevel = this.riskScorer.getRiskLevel(riskScore);

        // Step 4: Generate reason codes
        const reasonCodes = this.riskScorer.generateReasonCodes(factors, input.sentiment);

        const assessment: RiskAssessment = {
            symbol: input.symbol,
            riskScore,
            riskLevel,
            factors,
            reasonCodes,
            timestamp: new Date(),
        };

        logger.info(
            `Risk assessment for ${input.symbol}: ${riskLevel} (${(riskScore * 100).toFixed(2)}%)`
        );

        return assessment;
    }

    /**
     * Calculate all risk factors
     */
    private async calculateRiskFactors(tick: ValidatedTick): Promise<RiskFactors> {
        // For demo purposes, use tick data
        // In production, fetch historical price data

        // VaR calculation (simplified - using volatility as proxy)
        const volatility = tick.volatility30d || 0.2; // Default 20% if not available
        const var95 = this.estimateVaRFromVolatility(tick.price, volatility);

        // Sentiment risk
        const sentimentRisk = this.riskScorer.calculateSentimentRisk(tick.sentiment);

        // Concentration risk (would need portfolio data - using 0 for single stock)
        const concentrationRisk = 0;

        const factors: RiskFactors = {
            var95,
            volatility,
            sentimentRisk,
            concentrationRisk,
        };

        logger.debug(`Risk factors for ${tick.symbol}:`, factors);
        return factors;
    }

    /**
     * Estimate VaR from volatility (simplified method)
     * In production, use historical returns
     */
    private estimateVaRFromVolatility(price: number, annualizedVolatility: number): number {
        // 1-day VaR at 95% confidence
        // Daily volatility = annual volatility / √252
        const dailyVolatility = annualizedVolatility / Math.sqrt(252);

        // Z-score for 95% = 1.645
        const zScore = 1.645;

        // VaR = price × daily volatility × z-score
        const var95 = price * dailyVolatility * zScore;

        return var95;
    }

    /**
     * Calculate portfolio-level risk
     * Aggregates risk across multiple positions
     */
    async calculatePortfolioRisk(
        ticks: ValidatedTick[],
        positions: Record<string, number>
    ): Promise<{ overallRisk: number; exposureBySymbol: Record<string, number> }> {
        const exposureBySymbol: Record<string, number> = {};
        let totalExposure = 0;
        let weightedRisk = 0;

        for (const tick of ticks) {
            const quantity = positions[tick.symbol] || 0;
            const exposure = tick.price * quantity;

            exposureBySymbol[tick.symbol] = exposure;
            totalExposure += exposure;

            // Calculate individual risk
            const assessment = await this.process(tick);
            weightedRisk += assessment.riskScore * exposure;
        }

        const overallRisk = totalExposure > 0 ? weightedRisk / totalExposure : 0;

        logger.info(`Portfolio risk: ${(overallRisk * 100).toFixed(2)}%`);

        return {
            overallRisk,
            exposureBySymbol,
        };
    }
}

export default RiskAgent;
