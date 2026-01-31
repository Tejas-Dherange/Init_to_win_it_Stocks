import { MarketAgent } from '../market/MarketAgent';
import { RiskAgent } from '../risk/RiskAgent';
import { DecisionAgent } from '../decision/DecisionAgent';
import { AuditAgent } from '../audit/AuditAgent';
import { logger } from '../../utils/logger';
import { CircuitBreaker } from './CircuitBreaker';
import { WorkflowState } from '../../types/agents.types';

/**
 * MasterAgent - Orchestrates the multi-agent workflow
 */
export class MasterAgent {
    private marketAgent: MarketAgent;
    private riskAgent: RiskAgent;
    private decisionAgent: DecisionAgent;
    private auditAgent: AuditAgent;
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.marketAgent = new MarketAgent();
        this.riskAgent = new RiskAgent();
        this.decisionAgent = new DecisionAgent();
        this.auditAgent = new AuditAgent();
        this.circuitBreaker = new CircuitBreaker();
    }

    /**
     * Execute complete workflow for a stock tick
     */
    async executeWorkflow(params: {
        userId: string;
        rawTick: any;
        portfolioPosition?: any;
    }): Promise<WorkflowState> {
        const { userId, rawTick, portfolioPosition } = params;

        const state: WorkflowState = {
            userId,
            symbol: rawTick.symbol || 'UNKNOWN',
            rawTick,
            auditTrail: [],
            startTime: new Date(),
        };

        try {
            logger.info(`Starting workflow for ${state.symbol}`);

            // Check circuit breaker
            const allowed = await this.circuitBreaker.isAllowed();
            if (!allowed) {
                throw new Error('Circuit breaker is OPEN - workflow temporarily disabled');
            }

            // Step 1: MarketAgent - Validate and enrich tick
            logger.info('Step 1/4: MarketAgent processing');
            const marketResult = await this.marketAgent.execute(rawTick);

            if (!marketResult.success) {
                this.circuitBreaker.recordFailure();
                throw new Error(`MarketAgent failed: ${marketResult.error}`);
            }

            state.validatedTick = marketResult.data;
            state.auditTrail.push({
                agent: 'MarketAgent',
                operation: 'validate_tick',
                timestamp: new Date(),
                duration: marketResult.metrics.executionTime,
                success: true,
            });

            // Log to audit
            await this.auditAgent.execute({
                agentName: 'MarketAgent',
                operation: 'validate_tick',
                input: { symbol: rawTick.symbol },
                output: { normalized: true },
                executionTime: marketResult.metrics.executionTime,
                success: true,
            });

            // Step 2: RiskAgent - Calculate risk
            logger.info('Step 2/4: RiskAgent processing');
            const riskResult = await this.riskAgent.execute(state.validatedTick!);

            if (!riskResult.success) {
                this.circuitBreaker.recordFailure();
                throw new Error(`RiskAgent failed: ${riskResult.error}`);
            }

            state.riskAssessment = riskResult.data;
            state.auditTrail.push({
                agent: 'RiskAgent',
                operation: 'calculate_risk',
                timestamp: new Date(),
                duration: riskResult.metrics.executionTime,
                success: true,
            });

            await this.auditAgent.execute({
                agentName: 'RiskAgent',
                operation: 'calculate_risk',
                input: { symbol: state.symbol },
                output: { riskScore: riskResult.data?.riskScore },
                executionTime: riskResult.metrics.executionTime,
                success: true,
            });

            // Step 3: DecisionAgent - Make decision
            logger.info('Step 3/4: DecisionAgent processing');
            const decisionResult = await this.decisionAgent.execute({
                tick: state.validatedTick!,
                risk: state.riskAssessment!,
                portfolioPosition,
            });

            if (!decisionResult.success) {
                this.circuitBreaker.recordFailure();
                throw new Error(`DecisionAgent failed: ${decisionResult.error}`);
            }

            state.decision = decisionResult.data;
            state.auditTrail.push({
                agent: 'DecisionAgent',
                operation: 'make_decision',
                timestamp: new Date(),
                duration: decisionResult.metrics.executionTime,
                success: true,
            });

            await this.auditAgent.execute({
                agentName: 'DecisionAgent',
                operation: 'make_decision',
                input: { symbol: state.symbol },
                output: { action: decisionResult.data?.action },
                executionTime: decisionResult.metrics.executionTime,
                success: true,
            });

            // Step 4: Log decision
            if (portfolioPosition) {
                logger.info('Step 4/4: Logging decision');
                await this.auditAgent.logDecision({
                    userId,
                    portfolioId: portfolioPosition.id,
                    symbol: state.symbol,
                    action: state.decision!.action,
                    rationale: state.decision!.rationale,
                    urgency: state.decision!.urgency,
                    riskScore: state.decision!.riskScore,
                });
            }

            // Mark user confirmation as pending
            state.userConfirmation = 'pending';
            state.endTime = new Date();

            // Record success in circuit breaker
            this.circuitBreaker.recordSuccess();

            logger.info(`Workflow completed for ${state.symbol} in ${Date.now() - state.startTime.getTime()}ms`);

            return state;
        } catch (error) {
            logger.error('Workflow failed:', error);

            state.endTime = new Date();
            state.auditTrail.push({
                agent: 'MasterAgent',
                operation: 'workflow',
                timestamp: new Date(),
                duration: Date.now() - state.startTime.getTime(),
                success: false,
                error: (error as Error).message,
            });

            // Record failure
            this.circuitBreaker.recordFailure();

            throw error;
        }
    }

    /**
     * Get health status of all agents
     */
    async getHealthStatus(): Promise<{
        overall: 'healthy' | 'degraded' | 'down';
        agents: any[];
        circuitBreaker: any;
    }> {
        const agents = [
            this.marketAgent.getHealth(),
            this.riskAgent.getHealth(),
            this.decisionAgent.getHealth(),
            this.auditAgent.getHealth(),
        ];

        // Determine overall health
        const avgSuccessRate =
            agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length;

        let overall: 'healthy' | 'degraded' | 'down';
        if (avgSuccessRate > 0.9) {
            overall = 'healthy';
        } else if (avgSuccessRate > 0.5) {
            overall = 'degraded';
        } else {
            overall = 'down';
        }

        return {
            overall,
            agents,
            circuitBreaker: this.circuitBreaker.getState(),
        };
    }

    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(): void {
        this.circuitBreaker.reset();
    }
}

export default MasterAgent;
