// import { DecisionInput, DecisionOutput } from '../../types/agents.types';
import { ActionType } from '../../utils/constants';
import { logger } from '../../utils/logger';

export interface RuleContext {
    symbol: string;
    riskScore: number;
    riskLevel: string;
    sentiment?: number;
    pnlPercent: number;
    volatility: number;
    concentrationRisk: number;
}

/**
 * Rule-Based Decision Strategy
 */
export class RuleBasedStrategy {
    /**
     * Evaluate trading rules and determine action
     */
    evaluateRules(context: RuleContext): {
        action: ActionType;
        urgency: number;
        reason: string;
    } {
        logger.info(`Evaluating rules for ${context.symbol}`);

        // Rule 1: Critical risk + negative sentiment → EXIT
        if (context.riskScore > 0.8 && (context.sentiment || 0) < -0.3) {
            return {
                action: ActionType.EXIT,
                urgency: 10,
                reason: 'Critical risk level with strong negative sentiment',
            };
        }

        // Rule 2: Sharp loss (>15%) → STOP_LOSS
        if (context.pnlPercent < -15) {
            return {
                action: ActionType.STOP_LOSS,
                urgency: 9,
                reason: 'Stop-loss triggered at -15% loss threshold',
            };
        }

        // Rule 3: High risk + negative sentiment → EXIT
        if (context.riskScore > 0.7 && (context.sentiment || 0) < -0.2) {
            return {
                action: ActionType.EXIT,
                urgency: 8,
                reason: 'High risk combined with negative market sentiment',
            };
        }

        // Rule 4: High concentration risk (>40%) → REALLOCATE
        if (context.concentrationRisk > 0.4) {
            return {
                action: ActionType.REALLOCATE,
                urgency: 7,
                reason: 'Portfolio over-concentrated in this position',
            };
        }

        // Rule 5: Moderate risk + high volatility → REDUCE
        if (context.riskScore > 0.5 && context.volatility > 0.35) {
            return {
                action: ActionType.REDUCE,
                urgency: 6,
                reason: 'Elevated risk and volatility suggest position reduction',
            };
        }

        // Rule 6: Moderate risk → REDUCE
        if (context.riskScore > 0.5) {
            return {
                action: ActionType.REDUCE,
                urgency: 5,
                reason: 'Moderate risk level warrants partial position reduction',
            };
        }

        // Rule 7: Moderate loss (>10%) → REDUCE
        if (context.pnlPercent < -10) {
            return {
                action: ActionType.REDUCE,
                urgency: 5,
                reason: 'Loss exceeds 10% threshold',
            };
        }

        // Rule 8: Low risk + positive sentiment → HOLD
        if (context.riskScore < 0.4 && (context.sentiment || 0) > 0.3) {
            return {
                action: ActionType.HOLD,
                urgency: 2,
                reason: 'Low risk with positive sentiment supports holding',
            };
        }

        // Default: HOLD
        return {
            action: ActionType.HOLD,
            urgency: 3,
            reason: 'Risk metrics within acceptable range',
        };
    }

    /**
     * Get action priority (for sorting multiple decisions)
     */
    getActionPriority(action: ActionType): number {
        const priorities: Record<ActionType, number> = {
            [ActionType.EXIT]: 5,
            [ActionType.STOP_LOSS]: 4,
            [ActionType.REDUCE]: 3,
            [ActionType.REALLOCATE]: 2,
            [ActionType.HOLD]: 1,
            [ActionType.BUY]: 0,
        };

        return priorities[action] || 0;
    }
}

export default RuleBasedStrategy;
