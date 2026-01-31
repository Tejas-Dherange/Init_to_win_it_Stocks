export interface Trade {
    id: string;
    symbol: string;
    name: string;
    type: 'Long' | 'Short';
    entryPrice: number;
    currentPrice: number;
    riskScore: number;
    status: 'Active' | 'Pending';
    pl: number;
}

export interface SuggestedTrade {
    id: string;
    symbol: string;
    reason: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    confidence: number;
}

export interface ChartDataPoint {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}
