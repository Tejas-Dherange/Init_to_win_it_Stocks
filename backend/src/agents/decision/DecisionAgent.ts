import { BaseAgent } from '../base/BaseAgent';
import { DecisionInput, DecisionOutput, PortfolioPosition } from '../../types/agents.types';
import { RuleBasedStrategy } from './RuleBasedStrategy';
import { LLMStrategy } from './LLMStrategy';
import { OpportunityFinder } from './OpportunityFinder';
import { PnLCalculator } from './PnLCalculator';
import { logger } from '../../utils/logger';

/**
 * DecisionAgent - Makes trading decisions based on risk and portfolio data
 */
export class DecisionAgent extends BaseAgent<DecisionInput, DecisionOutput> {
    private ruleStrategy: RuleBasedStrategy;
    private llmStrategy: LLMStrategy;
    private opportunityFinder: OpportunityFinder;
    private pnlCalculator: PnLCalculator;

    constructor() {
        super('DecisionAgent');
        this.ruleStrategy = new RuleBasedStrategy();
        this.llmStrategy = new LLMStrategy();
        this.opportunityFinder = new OpportunityFinder();
        this.pnlCalculator = new PnLCalculator();
    }

    /**
     * Validate input
     */
    protected validate(input: DecisionInput): boolean {
        if (!input || !input.tick || !input.risk) {
            logger.warn('Invalid decision input');
            return false;
        }

        return true;
    }

    /**
     * Process decision
     */
    protected async process(input: DecisionInput): Promise<DecisionOutput> {
        const { tick, risk, portfolioPosition } = input;

        logger.info(`Making decision for ${tick.symbol}`);

        // Step 1: Calculate PnL if position exists
        let pnl = 0;
        let pnlPercent = 0;
        let exposure = 0;

        if (portfolioPosition) {
            const pnlResult = this.pnlCalculator.calculateUnrealizedPnL(
                portfolioPosition.entryPrice,
                tick.price,
                portfolioPosition.quantity
            );
            pnl = pnlResult.pnl;
            pnlPercent = pnlResult.pnlPercent;
            exposure = this.pnlCalculator.calculateExposure(tick.price, portfolioPosition.quantity);
        }

        // Step 2: Apply rule-based strategy
        const ruleResult = this.ruleStrategy.evaluateRules({
            symbol: tick.symbol,
            riskScore: risk.riskScore,
            riskLevel: risk.riskLevel,
            sentiment: tick.sentiment,
            pnlPercent,
            volatility: tick.volatility30d || 0.2,
            concentrationRisk: risk.factors.concentrationRisk,
        });

        // Step 3: Generate LLM rationale for high-urgency decisions
        let rationale = ruleResult.reason;

        if (ruleResult.urgency >= 7) {
            try {
                rationale = await this.llmStrategy.generateRationale({
                    symbol: tick.symbol,
                    sector: tick.sector,
                    currentPrice: tick.price,
                    entryPrice: portfolioPosition?.entryPrice || tick.price,
                    changePercent: tick.changePercent,
                    pnl: pnlPercent,
                    pnlAmount: pnl,
                    quantity: portfolioPosition?.quantity || 0,
                    exposure,
                    riskScore: risk.riskScore,
                    riskLevel: risk.riskLevel,
                    volatility: tick.volatility30d || 0.2,
                    sentiment: tick.sentiment,
                    var95: risk.factors.var95,
                    action: ruleResult.action,
                    urgency: ruleResult.urgency,
                });
            } catch (error) {
                logger.warn('LLM rationale generation failed, using rule-based:', error);
                // Keep rule-based rationale
            }
        }

        // Step 4: Find alternatives if action is EXIT or REALLOCATE
        let alternatives;
        if (ruleResult.action === 'EXIT' || ruleResult.action === 'REALLOCATE') {
            alternatives = await this.opportunityFinder.findAlternatives({
                currentSymbol: tick.symbol,
                currentSector: tick.sector,
                limit: 5,
            });
        }

        // Step 5: Create decision output
        const decision: DecisionOutput = {
            symbol: tick.symbol,
            action: ruleResult.action,
            rationale,
            urgency: ruleResult.urgency,
            riskScore: risk.riskScore,
            expectedPnl: pnl,
            alternatives,
        };

        logger.info(
            `Decision for ${tick.symbol}: ${decision.action} (urgency ${decision.urgency}/10)`
        );

        return decision;
    }

    /**
     * Batch process decisions for multiple positions
     */
    async processPortfolio(inputs: DecisionInput[]): Promise<DecisionOutput[]> {
        const decisions: DecisionOutput[] = [];

        for (const input of inputs) {
            const result = await this.execute(input);
            if (result.success && result.data) {
                decisions.push(result.data);
            }
        }

        // Sort by urgency (descending)
        decisions.sort((a, b) => b.urgency - a.urgency);

        return decisions;
    }
}

export default DecisionAgent;
