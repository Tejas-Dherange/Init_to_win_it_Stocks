import { ValidatedTick, RiskAssessment, DecisionOutput, PortfolioPosition } from '../types/agents.types';
import { ValidationResult } from '../services/llm/ReasoningService';

/**
 * LangGraph State
 */
export interface AgentState {
    userId: string;
    portfolioPosition?: PortfolioPosition;
    rawTick?: any;
    marketData?: ValidatedTick;
    riskAssessment?: RiskAssessment;
    riskInterpretation?: string; // LLM-generated risk interpretation
    decision?: DecisionOutput;
    decisionValidation?: ValidationResult; // LLM validation of decision
    auditTrail: Array<{
        step: string;
        status: 'success' | 'failure';
        details?: string;
        timestamp: Date;
    }>;
    errors?: string[];
    shouldTerminate?: boolean;
}
