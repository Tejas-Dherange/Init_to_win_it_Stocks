import { StateGraph, END } from '@langchain/langgraph';
import { AgentState } from './types';
import { MarketAgent } from '../agents/market/MarketAgent';
import { RiskAgent } from '../agents/risk/RiskAgent';
import { DecisionAgent } from '../agents/decision/DecisionAgent';
import { AuditAgent } from '../agents/audit/AuditAgent';
import { reasoningService } from '../services/llm/ReasoningService';
import { logger } from '../utils/logger';
import { ValidatedTick, RiskAssessment, DecisionOutput } from '../types/agents.types';

// Instantiate Agents
const marketAgent = new MarketAgent();
const riskAgent = new RiskAgent();
const decisionAgent = new DecisionAgent();
const auditAgent = new AuditAgent();

// Define Nodes
async function marketNode(state: AgentState): Promise<Partial<AgentState>> {
    logger.info(`[LangGraph] Market Node processing ${state.rawTick?.symbol}`);
    try {
        const result = await marketAgent.execute(state.rawTick);
        if (!result.success || !result.data) {
            return {
                errors: [...(state.errors || []), result.error || 'Market data processing failed'],
                shouldTerminate: true,
                auditTrail: [...state.auditTrail, { step: 'Market', status: 'failure', details: result.error, timestamp: new Date() }]
            };
        }
        return {
            marketData: result.data as ValidatedTick,
            auditTrail: [...state.auditTrail, { step: 'Market', status: 'success', timestamp: new Date() }]
        };
    } catch (error) {
        return {
            errors: [...(state.errors || []), (error as Error).message],
            shouldTerminate: true,
            auditTrail: [...state.auditTrail, { step: 'Market', status: 'failure', details: (error as Error).message, timestamp: new Date() }]
        };
    }
}

async function riskNode(state: AgentState): Promise<Partial<AgentState>> {
    if (state.shouldTerminate || !state.marketData) return {};

    logger.info(`[LangGraph] Risk Node processing`);
    try {
        const riskResult = await riskAgent.execute(state.marketData);

        if (!riskResult.success || !riskResult.data) {
            return {
                errors: [...(state.errors || []), riskResult.error || 'Risk assessment failed'],
                shouldTerminate: true,
                auditTrail: [...state.auditTrail, { step: 'Risk', status: 'failure', details: riskResult.error, timestamp: new Date() }]
            };
        }

        return {
            riskAssessment: riskResult.data as RiskAssessment,
            auditTrail: [...state.auditTrail, { step: 'Risk', status: 'success', timestamp: new Date() }]
        };
    } catch (error) {
        return {
            errors: [...(state.errors || []), (error as Error).message],
            shouldTerminate: true,
            auditTrail: [...state.auditTrail, { step: 'Risk', status: 'failure', details: (error as Error).message, timestamp: new Date() }]
        };
    }
}

// NEW: LLM Risk Interpretation Node
async function riskInterpretationNode(state: AgentState): Promise<Partial<AgentState>> {
    if (state.shouldTerminate || !state.marketData || !state.riskAssessment) return {};

    logger.info(`[LangGraph] LLM Risk Interpretation for ${state.marketData.symbol}`);
    try {
        const interpretation = await reasoningService.interpretRisk({
            symbol: state.marketData.symbol,
            riskScore: state.riskAssessment.riskScore,
            riskLevel: state.riskAssessment.riskLevel,
            volatility: state.riskAssessment.factors.volatility,
            var95: state.riskAssessment.var95,
            currentPrice: state.marketData.price,
        }, true); // detailed interpretation

        return {
            riskInterpretation: interpretation,
            auditTrail: [...state.auditTrail, { step: 'RiskInterpretation', status: 'success', details: 'LLM analysis complete', timestamp: new Date() }]
        };
    } catch (error) {
        logger.error('Risk interpretation failed:', error);
        return {
            riskInterpretation: `High risk detected for ${state.marketData.symbol}. Immediate review recommended.`,
            auditTrail: [...state.auditTrail, { step: 'RiskInterpretation', status: 'failure', details: (error as Error).message, timestamp: new Date() }]
        };
    }
}

async function decisionNode(state: AgentState): Promise<Partial<AgentState>> {
    if (state.shouldTerminate || !state.marketData || !state.riskAssessment) return {};

    logger.info(`[LangGraph] Decision Node processing`);
    try {
        const result = await decisionAgent.execute({
            tick: state.marketData,
            risk: state.riskAssessment,
            portfolioPosition: state.portfolioPosition || {
                symbol: state.marketData.symbol,
                quantity: 0,
                entryPrice: state.marketData.price,
                currentPrice: state.marketData.price,
                unrealizedPnL: 0,
                realizedPnL: 0,
                exposure: 0,
                marginUsed: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        if (!result.success || !result.data) {
            return {
                errors: [...(state.errors || []), result.error || 'Decision generation failed'],
                shouldTerminate: true,
                auditTrail: [...state.auditTrail, { step: 'Decision', status: 'failure', details: result.error, timestamp: new Date() }]
            };
        }

        return {
            decision: result.data as DecisionOutput,
            auditTrail: [...state.auditTrail, { step: 'Decision', status: 'success', timestamp: new Date() }]
        };
    } catch (error) {
        return {
            errors: [...(state.errors || []), (error as Error).message],
            shouldTerminate: true,
            auditTrail: [...state.auditTrail, { step: 'Decision', status: 'failure', details: (error as Error).message, timestamp: new Date() }]
        };
    }
}

// NEW: LLM Decision Validation Node
async function decisionValidationNode(state: AgentState): Promise<Partial<AgentState>> {
    if (state.shouldTerminate || !state.decision || !state.marketData || !state.riskAssessment) return {};

    logger.info(`[LangGraph] LLM Decision Validation for ${state.decision.symbol}`);
    try {
        const portfolioPos = state.portfolioPosition || { entryPrice: state.marketData.price, quantity: 0 };
        const pnl = portfolioPos.quantity > 0
            ? ((state.marketData.price - portfolioPos.entryPrice) / portfolioPos.entryPrice) * 100
            : 0;

        const validation = await reasoningService.validateDecision({
            symbol: state.decision.symbol,
            action: state.decision.action,
            urgency: state.decision.urgency,
            riskScore: state.riskAssessment.riskScore,
            currentPrice: state.marketData.price,
            pnl,
            volatility: state.riskAssessment.factors.volatility,
            rationale: state.decision.rationale,
        });

        return {
            decisionValidation: validation,
            auditTrail: [...state.auditTrail, {
                step: 'DecisionValidation',
                status: 'success',
                details: `${validation.verdict} (confidence: ${validation.confidence})`,
                timestamp: new Date()
            }]
        };
    } catch (error) {
        logger.error('Decision validation failed:', error);
        return {
            decisionValidation: {
                confidence: 0.7,
                concerns: 'Validation unavailable',
                verdict: 'APPROVE',
                reasoning: 'Proceeding without LLM validation'
            },
            auditTrail: [...state.auditTrail, { step: 'DecisionValidation', status: 'failure', details: (error as Error).message, timestamp: new Date() }]
        };
    }
}

async function auditNode(state: AgentState): Promise<Partial<AgentState>> {
    logger.info(`[LangGraph] Audit Node processing`);
    // Log the final state scoped to user
    await auditAgent.execute({
        userId: state.userId,
        agentName: 'RiskMindGraph',
        operation: 'WorkflowComplete',
        input: { symbol: state.portfolioPosition?.symbol || state.marketData?.symbol || 'UNKNOWN' },
        output: {
            decision: state.decision,
            validation: state.decisionValidation,
            riskInterpretation: state.riskInterpretation,
            errors: state.errors
        },
        executionTime: 0,
        success: !state.errors?.length,
        error: state.errors?.join(', ')
    });

    // Also log specific decision if successful
    if (state.decision && !state.shouldTerminate) {
        await auditAgent.logDecision({
            userId: state.userId,
            portfolioId: 'temp-' + state.decision.symbol, // This will be looked up in AuditAgent
            symbol: state.decision.symbol,
            action: state.decision.action,
            rationale: state.decision.rationale,
            urgency: state.decision.urgency,
            riskScore: state.riskAssessment?.riskScore || 0,
            llmTraceId: 'langgraph-' + Date.now()
        });
    }

    return {
        auditTrail: [...state.auditTrail, { step: 'Audit', status: 'success', timestamp: new Date() }]
    };
}

// Conditional routing function
function shouldUseDetailedRiskAnalysis(state: AgentState): string {
    // Route to LLM interpretation for high-risk scenarios
    if (state.riskAssessment && state.riskAssessment.riskScore > 0.7) {
        logger.info(`High risk detected (${state.riskAssessment.riskScore}), routing to LLM interpretation`);
        return "risk_interpretation";
    }
    logger.info(`Normal risk level, proceeding to decision`);
    return "decision_agent";
}

// Define Graph
const workflow = new StateGraph<AgentState>({
    channels: {
        userId: { reducer: (a, b) => b ?? a, default: () => "" },
        portfolioPosition: { reducer: (a, b) => b ?? a, default: () => undefined },
        rawTick: { reducer: (a, b) => b ?? a, default: () => ({}) },
        marketData: { reducer: (a, b) => b ?? a, default: () => undefined },
        riskAssessment: { reducer: (a, b) => b ?? a, default: () => undefined },
        riskInterpretation: { reducer: (a, b) => b ?? a, default: () => undefined },
        decision: { reducer: (a, b) => b ?? a, default: () => undefined },
        decisionValidation: { reducer: (a, b) => b ?? a, default: () => undefined },
        auditTrail: { reducer: (a, b) => a.concat(b), default: () => [] },
        errors: { reducer: (a, b) => (a || []).concat(b || []), default: () => [] },
        shouldTerminate: { reducer: (a, b) => b ?? a, default: () => false },
    }
});

// Add Nodes
workflow.addNode("market_agent", marketNode);
workflow.addNode("risk_agent", riskNode);
workflow.addNode("risk_interpretation", riskInterpretationNode); // NEW LLM node
workflow.addNode("decision_agent", decisionNode);
workflow.addNode("decision_validation", decisionValidationNode); // NEW LLM node
workflow.addNode("audit_agent", auditNode);

// Add Edges
// @ts-ignore
workflow.addEdge("market_agent", "risk_agent");

// Conditional routing after risk assessment
// @ts-ignore
workflow.addConditionalEdges(
    "risk_agent",
    shouldUseDetailedRiskAnalysis,
    {
        risk_interpretation: "risk_interpretation",
        decision_agent: "decision_agent"
    }
);

// If we go through risk interpretation, then proceed to decision
// @ts-ignore
workflow.addEdge("risk_interpretation", "decision_agent");

// After decision, always validate with LLM
// @ts-ignore
workflow.addEdge("decision_agent", "decision_validation");

// After validation, go to audit
// @ts-ignore
workflow.addEdge("decision_validation", "audit_agent");

// Audit is the final step
// @ts-ignore
workflow.addEdge("audit_agent", END);

// Set Entry Point
// @ts-ignore
workflow.setEntryPoint("market_agent");

// Compile
export const riskMindGraph = workflow.compile();
