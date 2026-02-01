// Portfolio types
export interface Position {
    id: string;
    symbol: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    riskScore: number;
    exposure: number;
    sector?: string;
}

export interface PortfolioSummary {
    totalPnL: number;
    totalExposure: number;
    avgRiskScore: number;
    positionCount: number;
}

// Risk types
export interface RiskAssessment {
    symbol: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: {
        var95: number;
        volatility: number;
        sentimentRisk: number;
        concentrationRisk: number;
    };
    reasonCodes: string[];
    timestamp: string;
}

// Decision types
export interface Decision {
    id: string;
    symbol: string;
    status: 'pending' | 'approved' | 'rejected' | 'executed';
    createdAt: string;
    action: 'HOLD' | 'REDUCE' | 'EXIT' | 'STOP_LOSS' | 'REALLOCATE' | 'BUY';
    rationale: string;
    urgency: number;
    riskScore: number;
    expectedPnl?: number;
    alternatives?: Alternative[];
}

export interface Alternative {
    symbol: string;
    reason: string;
    riskScore: number;
    sentiment: number;
    score: number;
    sector?: string;
    currentPrice?: number;
}

// Chat types
export interface ChatMessage {
    id: string;
    symbol?: string;
    message: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

// API Response types
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        stack?: string;
    };
}

// Agent health types
export interface AgentHealth {
    name: string;
    enabled: boolean;
    successRate: number;
    avgExecutionTime: number;
    recentErrors: string[];
}

export interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'down';
    agents: AgentHealth[];
    circuitBreaker: {
        state: string;
        failureRate: number;
        failures: number;
        successes: number;
    };
}
