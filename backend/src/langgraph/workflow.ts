import { StateGraph, END } from '@langchain/langgraph';
import { AgentState } from './types';
import { MarketAgent } from '../agents/market/MarketAgent';
import { RiskAgent } from '../agents/risk/RiskAgent';
import { DecisionAgent } from '../agents/decision/DecisionAgent';
import { AuditAgent } from '../agents/audit/AuditAgent';
import { logger } from '../utils/logger';
import { ValidatedTick, RiskAssessment, DecisionOutput, PortfolioPosition } from '../types/agents.types';

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

async function decisionNode(state: AgentState): Promise<Partial<AgentState>> {
    if (state.shouldTerminate || !state.marketData || !state.riskAssessment) return {};

    logger.info(`[LangGraph] Decision Node processing`);
    try {
        const result = await decisionAgent.execute({
            tick: state.marketData,
            risk: state.riskAssessment,
            portfolioPosition: state.portfolioPosition as PortfolioPosition // Cast as we assume basic fields
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

async function auditNode(state: AgentState): Promise<Partial<AgentState>> {
    logger.info(`[LangGraph] Audit Node processing`);
    // Log the final state scoped to user
    await auditAgent.execute({
        userId: state.userId,
        agentName: 'RiskMindGraph',
        operation: 'WorkflowComplete',
        input: { symbol: state.portfolioPosition?.symbol || 'UNKNOWN' },
        output: { decision: state.decision, errors: state.errors },
        executionTime: 0,
        success: !state.errors?.length,
        error: state.errors?.join(', ')
    });

    // Also log specific decision if successful
    if (state.decision && !state.shouldTerminate) {
        await auditAgent.logDecision({
            userId: state.userId,
            portfolioId: state.portfolioPosition?.id || 'unknown',
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

// Define Graph
const workflow = new StateGraph<AgentState>({
    channels: {
        userId: { reducer: (a, b) => b ?? a, default: () => "" },
        portfolioPosition: { reducer: (a, b) => b ?? a, default: () => ({}) as any },
        rawTick: { reducer: (a, b) => b ?? a, default: () => ({}) },
        marketData: { reducer: (a, b) => b ?? a, default: () => undefined },
        riskAssessment: { reducer: (a, b) => b ?? a, default: () => undefined },
        decision: { reducer: (a, b) => b ?? a, default: () => undefined },
        auditTrail: { reducer: (a, b) => a.concat(b), default: () => [] },
        errors: { reducer: (a, b) => (a || []).concat(b || []), default: () => [] },
        shouldTerminate: { reducer: (a, b) => b ?? a, default: () => false },
    }
});

// Add Nodes
workflow.addNode("market_agent", marketNode);
workflow.addNode("risk_agent", riskNode);
workflow.addNode("decision_agent", decisionNode);
workflow.addNode("audit_agent", auditNode);

// Add Edges
// @ts-ignore
workflow.addEdge("market_agent", "risk_agent");
// @ts-ignore
workflow.addEdge("risk_agent", "decision_agent");
// @ts-ignore
workflow.addEdge("decision_agent", "audit_agent");
// @ts-ignore
workflow.addEdge("audit_agent", END);

// Set Entry Point
// @ts-ignore
workflow.setEntryPoint("market_agent");

// Compile
export const riskMindGraph = workflow.compile();
