import { groqClient, llmConfig } from '../../config/llm.config';
import { DECISION_RATIONALE_PROMPT, substitutePromptVariables } from './prompts';
import { logger } from '../../utils/logger';
import { ActionType } from '../../utils/constants';

/**
 * LLM-powered decision strategy using Groq API
 */
export class LLMStrategy {
    /**
     * Generate decision rationale using LLM
     */
    async generateRationale(context: {
        symbol: string;
        sector?: string;
        currentPrice: number;
        entryPrice: number;
        changePercent: number;
        pnl: number;
        pnlAmount: number;
        quantity: number;
        exposure: number;
        riskScore: number;
        riskLevel: string;
        volatility: number;
        sentiment?: number;
        var95: number;
        action: ActionType;
        urgency: number;
    }): Promise<string> {
        try {
            logger.info(`Generating LLM rationale for ${context.symbol}`);

            // Prepare prompt with variables
            const prompt = substitutePromptVariables(DECISION_RATIONALE_PROMPT, {
                symbol: context.symbol,
                sector: context.sector || 'Unknown',
                current_price: context.currentPrice.toFixed(2),
                entry_price: context.entryPrice.toFixed(2),
                change_percent: context.changePercent.toFixed(2),
                pnl: context.pnl.toFixed(2),
                pnl_amount: context.pnlAmount.toFixed(2),
                quantity: context.quantity,
                exposure: context.exposure.toFixed(2),
                risk_score: context.riskScore.toFixed(2),
                risk_level: context.riskLevel,
                volatility: (context.volatility * 100).toFixed(2),
                sentiment: context.sentiment?.toFixed(2) || 'N/A',
                sentiment_label: this.getSentimentLabel(context.sentiment),
                var95: context.var95.toFixed(2),
                action: context.action,
                urgency: context.urgency,
            });

            // Call Groq API
            const completion = await groqClient.chat.completions.create({
                model: llmConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional financial advisor specializing in Indian stock markets.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: llmConfig.temperature,
                max_tokens: llmConfig.maxTokens,
                top_p: llmConfig.topP,
            });

            const rationale = completion.choices[0]?.message?.content || 'Unable to generate rationale';

            logger.info(`LLM rationale generated successfully for ${context.symbol}`);
            return rationale.trim();
        } catch (error) {
            logger.error('Failed to generate LLM rationale:', error);
            // Fallback to rule-based rationale
            return this.generateFallbackRationale(context);
        }
    }

    /**
     * Generate fallback rationale when LLM fails
     */
    private generateFallbackRationale(context: any): string {
        const { action, riskScore, pnl, sentiment } = context;

        let rationale = `Recommended action: ${action}. `;

        if (riskScore > 0.7) {
            rationale += `High risk level (${(riskScore * 100).toFixed(0)}%) indicates increased downside potential. `;
        }

        if (pnl < -10) {
            rationale += `Position is showing significant loss of ${pnl.toFixed(1)}%. `;
        }

        if (sentiment && sentiment < -0.2) {
            rationale += `Negative market sentiment adds to risk factors. `;
        }

        rationale += `Taking action now may help protect capital and optimize portfolio performance.`;

        return rationale;
    }

    /**
     * Get sentiment label
     */
    private getSentimentLabel(sentiment?: number): string {
        if (!sentiment) return 'Neutral';
        if (sentiment > 0.5) return 'Very Positive';
        if (sentiment > 0.2) return 'Positive';
        if (sentiment > -0.2) return 'Neutral';
        if (sentiment > -0.5) return 'Negative';
        return 'Very Negative';
    }

    /**
     * Check if LLM is available
     */
    async healthCheck(): Promise<boolean> {
        try {
            await groqClient.chat.completions.create({
                model: llmConfig.model,
                messages: [{ role: 'user', content: 'Health check' }],
                max_tokens: 10,
            });
            return true;
        } catch (error) {
            logger.error('LLM health check failed:', error);
            return false;
        }
    }
}

export default LLMStrategy;
