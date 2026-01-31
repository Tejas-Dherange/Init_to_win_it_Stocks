// Action types
export const ActionType = {
    HOLD: 'HOLD',
    REDUCE: 'REDUCE',
    EXIT: 'EXIT',
    STOP_LOSS: 'STOP_LOSS',
    REALLOCATE: 'REALLOCATE',
    BUY: 'BUY',
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

// Decision status
export const DecisionStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXECUTED: 'executed',
    EXPIRED: 'expired',
} as const;

export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus];

// Risk levels
export const RiskLevel = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

// Agent names
export const AgentName = {
    MARKET: 'MarketAgent',
    RISK: 'RiskAgent',
    DECISION: 'DecisionAgent',
    AUDIT: 'AuditAgent',
    MASTER: 'MasterAgent',
} as const;

export type AgentName = typeof AgentName[keyof typeof AgentName];

// Message sender
export const MessageSender = {
    USER: 'user',
    BOT: 'bot',
} as const;

export type MessageSender = typeof MessageSender[keyof typeof MessageSender];

// Reason codes for risk
export const RiskReasonCode = {
    HIGH_VOLATILITY: 'high_volatility',
    NEGATIVE_SENTIMENT: 'negative_sentiment',
    SHARP_PRICE_DROP: 'sharp_price_drop',
    CONCENTRATION_RISK: 'concentration_risk',
    HIGH_VAR: 'high_var',
    MARGIN_PRESSURE: 'margin_pressure',
} as const;

export type RiskReasonCode = typeof RiskReasonCode[keyof typeof RiskReasonCode];

// Sectors
export const Sector = {
    IT: 'IT',
    BANKING: 'Banking',
    ENERGY: 'Energy',
    PHARMA: 'Pharma',
    AUTO: 'Auto',
    FMCG: 'FMCG',
    METALS: 'Metals',
    TELECOM: 'Telecom',
    INFRASTRUCTURE: 'Infrastructure',
    FINANCE: 'Finance',
    POWER: 'Power',
    CONSUMER: 'Consumer',
} as const;

export type Sector = typeof Sector[keyof typeof Sector];
