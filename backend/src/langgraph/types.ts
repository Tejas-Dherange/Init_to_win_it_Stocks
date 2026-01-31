import { ValidatedTick, RiskAssessment, DecisionOutput, PortfolioPosition } from '../types/agents.types';

export interface AgentState {
    // Inputs
    userId: string;
    portfolioPosition: Partial<PortfolioPosition> & { id: string; symbol: string }; // Minimal requirements
    rawTick: any; // Raw input from source

    // Computed State
    marketData?: ValidatedTick;
    riskAssessment?: RiskAssessment;
    decision?: DecisionOutput;

    auditTrail: Array<{
        step: string;
        status: 'success' | 'failure';
        details?: string;
        timestamp: Date;
    }>;

    // Control Flags
    errors?: string[];
    shouldTerminate: boolean;
}
