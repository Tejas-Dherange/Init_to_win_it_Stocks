import { MarketAgent } from '../market/MarketAgent';
import { RiskAgent } from '../risk/RiskAgent';
import { DecisionAgent } from '../decision/DecisionAgent';
import { AuditAgent } from '../audit/AuditAgent';
import { logger } from '../../utils/logger';
import { CircuitBreaker } from './CircuitBreaker';
import { WorkflowState } from '../../types/agents.types';
import { riskMindGraph } from '../../langgraph/workflow';

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
        const startTime = new Date();

        try {
            logger.info(`Starting workflow for ${rawTick.symbol || 'UNKNOWN'}`);

            // Check circuit breaker
            const allowed = await this.circuitBreaker.isAllowed();
            if (!allowed) {
                throw new Error('Circuit breaker is OPEN - workflow temporarily disabled');
            }

            // Prepare initial state for LangGraph
            const initialState: any = {
                userId,
                rawTick,
                portfolioPosition: portfolioPosition || { symbol: rawTick.symbol, id: 'unknown', quantity: 0, entryPrice: 0, currentPrice: 0 },
                auditTrail: [],
                errors: []
            };

            // Execute LangGraph Workflow
            // @ts-ignore - Invoke internal types can be tricky
            const finalState = await riskMindGraph.invoke(initialState);

            // Check for termination errors in graph
            if (finalState.shouldTerminate && finalState.errors?.length > 0) {
                this.circuitBreaker.recordFailure();
                throw new Error(`Workflow failed: ${finalState.errors.join(', ')}`);
            }

            this.circuitBreaker.recordSuccess();
            logger.info(`Workflow completed for ${rawTick.symbol} in ${Date.now() - startTime.getTime()}ms`);

            // Map back to WorkflowState for API consistency
            return {
                userId,
                symbol: rawTick.symbol,
                rawTick,
                validatedTick: finalState.marketData,
                riskAssessment: finalState.riskAssessment,
                decision: finalState.decision,
                auditTrail: finalState.auditTrail.map((log: any) => ({
                    agent: log.step,
                    operation: 'process',
                    timestamp: log.timestamp,
                    duration: 0, // Not granular in state currently
                    success: log.status === 'success',
                    error: log.details
                })),
                startTime,
                endTime: new Date()
            };

        } catch (error) {
            logger.error('Workflow failed:', error);
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
