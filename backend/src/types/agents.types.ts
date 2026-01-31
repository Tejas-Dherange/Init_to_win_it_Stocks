// Agent types
export interface AgentConfig {
    name: string;
    retryAttempts: number;
    timeout: number;
    enabled: boolean;
}

export interface AgentMetrics {
    executionTime: number;
    success: boolean;
    timestamp: Date;
    error?: string;
}

export interface AgentResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metrics: AgentMetrics;
}

// Market Agent types
export interface TickData {
    symbol: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    timestamp: Date;
    sentiment?: number;
    volatility30d?: number;
    marketCap?: bigint;
    peRatio?: number;
    sector?: string;
}

export interface ValidatedTick extends TickData {
    normalized: boolean;
    enriched: boolean;
    derivedMetrics: {
        priceMomentum: number;
        volumeChange: number;
    };
}

// Risk Agent types
export interface RiskFactors {
    var95: number;
    volatility: number;
    sentimentRisk: number;
    concentrationRisk: number;
}

export interface RiskAssessment {
    symbol: string;
    riskScore: number; // 0-1
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: RiskFactors;
    reasonCodes: string[];
    timestamp: Date;
}

export interface PortfolioRisk {
    overallRisk: number;
    exposureBySymbol: Record<string, number>;
    exposureBySector: Record<string, number>;
    concentration: number;
    var95: number;
}

// Decision Agent types
export interface DecisionInput {
    tick: ValidatedTick;
    risk: RiskAssessment;
    portfolioPosition?: PortfolioPosition;
}

export interface PortfolioPosition {
    symbol: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    exposure: number;
}

export interface DecisionOutput {
    symbol: string;
    action: 'HOLD' | 'REDUCE' | 'EXIT' | 'STOP_LOSS' | 'REALLOCATE' | 'BUY';
    rationale: string;
    urgency: number; // 1-10
    riskScore: number;
    expectedPnl?: number;
    alternatives?: AlternativeStock[];
}

export interface AlternativeStock {
    symbol: string;
    reason: string;
    riskScore: number;
    sentiment: number;
    score: number;
    sector?: string;
    currentPrice?: number;
}

// Workflow State
export interface WorkflowState {
    userId: string;
    symbol: string;
    rawTick?: any;
    validatedTick?: ValidatedTick;
    riskAssessment?: RiskAssessment;
    decision?: DecisionOutput;
    userConfirmation?: 'pending' | 'approved' | 'rejected';
    auditTrail: AuditEntry[];
    startTime: Date;
    endTime?: Date;
}

export interface AuditEntry {
    agent: string;
    operation: string;
    timestamp: Date;
    duration: number;
    success: boolean;
    error?: string;
}
