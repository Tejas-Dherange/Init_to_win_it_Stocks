import { groqService } from './groq.service';
import { RISK_INTERPRETATION_PROMPT, RISK_SUMMARY_PROMPT } from './prompts/riskInterpretation';
import { DECISION_VALIDATION_PROMPT } from './prompts/decisionValidation';
import { logger } from '../../utils/logger';

export interface RiskInterpretationInput {
    symbol: string;
    riskScore: number;
    riskLevel: string;
    volatility: number;
    var95: number;
    currentPrice: number;
}

export interface DecisionValidationInput {
    symbol: string;
    action: string;
    urgency: number;
    riskScore: number;
    currentPrice: number;
    pnl: number;
    volatility: number;
    rationale: string;
}

export interface ValidationResult {
    confidence: number;
    concerns: string;
    verdict: 'APPROVE' | 'REVIEW_NEEDED';
    reasoning: string;
}

/**
 * ReasoningService - Provides LLM-powered reasoning for workflow decisions
 */
export class ReasoningService {
    /**
     * Generate risk interpretation using LLM
     */
    async interpretRisk(input: RiskInterpretationInput, detailed: boolean = false): Promise<string> {
        try {
            logger.info(`\n🎯 LLM RISK INTERPRETATION for ${input.symbol}`);
            logger.info(`Risk Score: ${input.riskScore.toFixed(2)} | Level: ${input.riskLevel}`);

            const prompt = detailed ? RISK_INTERPRETATION_PROMPT : RISK_SUMMARY_PROMPT;

            const enrichedPrompt = prompt
                .replace('{{symbol}}', input.symbol)
                .replace('{{risk_score}}', input.riskScore.toFixed(2))
                .replace('{{risk_level}}', input.riskLevel)
                .replace('{{volatility}}', (input.volatility * 100).toFixed(2))
                .replace('{{var95}}', input.var95.toFixed(2))
                .replace('{{current_price}}', input.currentPrice.toFixed(2));

            const interpretation = await groqService.generateCompletion(
                enrichedPrompt,
                'You are a professional financial risk analyst specializing in Indian stock markets.'
            );

            logger.info(`✅ Risk interpretation complete for ${input.symbol}\n`);
            return interpretation.trim();
        } catch (error) {
            logger.error('Risk interpretation failed:', error);
            return `Risk Level: ${input.riskLevel} (${(input.riskScore * 100).toFixed(0)}%). Volatility: ${(input.volatility * 100).toFixed(1)}%.`;
        }
    }

    /**
     * Validate decision using LLM
     */
    async validateDecision(input: DecisionValidationInput): Promise<ValidationResult> {
        try {
            logger.info(`\n🎯 LLM DECISION VALIDATION for ${input.symbol}`);
            logger.info(`Action: ${input.action} | Urgency: ${input.urgency}/10 | Risk: ${input.riskScore.toFixed(2)}`);

            const enrichedPrompt = DECISION_VALIDATION_PROMPT
                .replace('{{symbol}}', input.symbol)
                .replace('{{action}}', input.action)
                .replace('{{urgency}}', input.urgency.toString())
                .replace('{{risk_score}}', input.riskScore.toFixed(2))
                .replace('{{current_price}}', input.currentPrice.toFixed(2))
                .replace('{{pnl}}', input.pnl.toFixed(2))
                .replace('{{volatility}}', (input.volatility * 100).toFixed(2))
                .replace('{{rationale}}', input.rationale);

            const response = await groqService.generateCompletion(
                enrichedPrompt,
                'You are a senior financial advisor validating AI-generated trading decisions.'
            );

            // Try to parse JSON response
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    const result = {
                        confidence: parsed.confidence || 0.7,
                        concerns: parsed.concerns || 'None',
                        verdict: parsed.verdict || 'APPROVE',
                        reasoning: parsed.reasoning || 'Decision appears reasonable'
                    };
                    logger.info(`✅ Validation: ${result.verdict} (confidence: ${result.confidence})\n`);
                    return result;
                }
            } catch (parseError) {
                logger.warn('Failed to parse LLM validation response as JSON');
            }

            // Fallback: analyze text response
            const confidence = response.toLowerCase().includes('confident') ? 0.8 : 0.6;
            const verdict = response.toLowerCase().includes('review') ? 'REVIEW_NEEDED' : 'APPROVE';

            logger.info(`✅ Validation (fallback): ${verdict} (confidence: ${confidence})\n`);
            return {
                confidence,
                concerns: 'None',
                verdict,
                reasoning: response.slice(0, 100)
            };
        } catch (error) {
            logger.error('Decision validation failed:', error);
            // Fallback to approval with lower confidence
            return {
                confidence: 0.5,
                concerns: 'LLM validation unavailable',
                verdict: 'APPROVE',
                reasoning: 'Proceeding with rule-based validation'
            };
        }
    }

    /**
     * Check if LLM service is healthy
     */
    async healthCheck(): Promise<boolean> {
        return groqService.healthCheck();
    }
}

export const reasoningService = new ReasoningService();
