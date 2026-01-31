import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { environment } from '../../config/environment';
import { logger } from '../../utils/logger';

export interface StockTickCSV {
    symbol: string;
    price: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    change: string;
    change_percent: string;
    timestamp: string;
    sentiment: string;
    volatility30d: string;
    market_cap: string;
    pe_ratio: string;
    sector: string;
}

export interface PortfolioCSV {
    user_id: string;
    symbol: string;
    quantity: string;
    entry_price: string;
    entry_date: string;
    current_price: string;
    pnl: string;
    pnl_percent: string;
    risk_score: string;
    exposure: string;
    sector: string;
}

export interface NewsSentimentCSV {
    symbol: string;
    date: string;
    headline: string;
    sentiment_score: string;
    source: string;
    published_at: string;
}

export class CSVDataLoader {
    private dataPath: string;

    constructor() {
        this.dataPath = path.resolve(process.cwd(), environment.csvDataPath);
    }

    /**
     * Load stock ticks from CSV
     */
    async loadStockTicks(): Promise<StockTickCSV[]> {
        try {
            const filePath = path.join(this.dataPath, 'stock_ticks.csv');
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            logger.info(`Loaded ${records.length} stock ticks from CSV`);
            return records as StockTickCSV[];
        } catch (error) {
            logger.error('Error loading stock ticks CSV:', error);
            throw new Error('Failed to load stock ticks data');
        }
    }

    /**
     * Load portfolio data from CSV
     */
    async loadPortfolio(userId?: string): Promise<PortfolioCSV[]> {
        try {
            const filePath = path.join(this.dataPath, 'portfolio.csv');
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            let records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }) as PortfolioCSV[];

            // Filter by userId if provided
            if (userId) {
                records = records.filter(r => r.user_id === userId);
            }

            logger.info(`Loaded ${records.length} portfolio positions from CSV`);
            return records;
        } catch (error) {
            logger.error('Error loading portfolio CSV:', error);
            throw new Error('Failed to load portfolio data');
        }
    }

    /**
     * Load news sentiment data from CSV
     */
    async loadNewsSentiment(symbol?: string): Promise<NewsSentimentCSV[]> {
        try {
            const filePath = path.join(this.dataPath, 'news_sentiment.csv');
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            let records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }) as NewsSentimentCSV[];

            // Filter by symbol if provided
            if (symbol) {
                records = records.filter(r => r.symbol === symbol);
            }

            logger.info(`Loaded ${records.length} news sentiment records from CSV`);
            return records;
        } catch (error) {
            logger.error('Error loading news sentiment CSV:', error);
            throw new Error('Failed to load news sentiment data');
        }
    }

    /**
     * Load technical indicators from CSV
     */
    async loadTechnicalIndicators(symbol?: string): Promise<any[]> {
        try {
            const filePath = path.join(this.dataPath, 'technical_indicators.csv');
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            let records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            // Filter by symbol if provided
            if (symbol) {
                records = records.filter((r: any) => r.symbol === symbol);
            }

            logger.info(`Loaded ${records.length} technical indicator records from CSV`);
            return records;
        } catch (error) {
            logger.error('Error loading technical indicators CSV:', error);
            return [];
        }
    }

    /**
     * Get tick by symbol
     */
    async getTickBySymbol(symbol: string): Promise<StockTickCSV | null> {
        const ticks = await this.loadStockTicks();
        return ticks.find(t => t.symbol === symbol) || null;
    }

    /**
     * Get all unique symbols
     */
    async getAllSymbols(): Promise<string[]> {
        const ticks = await this.loadStockTicks();
        return Array.from(new Set(ticks.map(t => t.symbol)));
    }
}

export const csvDataLoader = new CSVDataLoader();
export default csvDataLoader;
