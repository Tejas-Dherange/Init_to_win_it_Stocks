// NSE API Response Types (based on actual API response)
export interface NSEPriceInfo {
    lastPrice: number;
    change: number;
    pChange: number;
    previousClose: number;
    open: number;
    close: number;
    vwap: number;
    lowerCP: string;
    upperCP: string;
    intraDayHighLow: {
        min: number;
        max: number;
        value: number;
    };
    weekHighLow: {
        min: number;
        minDate: string;
        max: number;
        maxDate: string;
        value: number;
    };
}

export interface NSEPreOpenMarket {
    totalTradedVolume: number;
    IEP: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    Change: number;
    perChange: number;
}

export interface NSESecurityInfo {
    boardStatus: string;
    tradingStatus: string;
    faceValue: number;
    issuedSize: number;
}

export interface NSEIndustryInfo {
    macro: string;
    sector: string;
    industry: string;
    basicIndustry: string;
}

export interface NSEMetadata {
    symbol: string;
    series: string;
    isin: string;
    status: string;
    lastUpdateTime: string;
    industry: string;
}

export interface NSEQuoteResponse {
    info: {
        symbol: string;
        companyName: string;
        industry: string;
        isFNOSec: boolean;
    };
    metadata: NSEMetadata;
    priceInfo: NSEPriceInfo;
    preOpenMarket: NSEPreOpenMarket;
    securityInfo: NSESecurityInfo;
    industryInfo: NSEIndustryInfo;
}

// Internal Tick Data format (matching existing system)
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
    sector?: string;
    marketCap?: bigint;
    peRatio?: number;
}
