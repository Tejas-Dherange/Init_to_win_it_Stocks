import { BaseAgent } from '../base/BaseAgent';
import { TickData, ValidatedTick } from '../../types/agents.types';
import { tickSchema, validatePriceRelationships, validateNSESymbol } from './validators';
import {
    normalizeStockSymbol,
    normalizeTimestamp,
    calculateChange,
    calculateChangePercent
} from './normalizers';
import { logger } from '../../utils/logger';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';

/**
 * MarketAgent - Validates and enriches stock tick data
 */
export class MarketAgent extends BaseAgent<any, ValidatedTick> {
    constructor() {
        super('MarketAgent');
    }

    /**
     * Validate input tick data
     */
    protected validate(input: any): boolean {
        try {
            // Basic structure check
            if (!input || typeof input !== 'object') {
                return false;
            }

            // Symbol validation
            if (!input.symbol || !validateNSESymbol(input.symbol)) {
                logger.warn(`Invalid symbol format: ${input.symbol}`);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('MarketAgent validation error:', error);
            return false;
        }
    }

    /**
     * Process tick data
     */
    protected async process(input: any): Promise<ValidatedTick> {
        logger.info(`Processing tick for symbol: ${input.symbol}`);

        // Step 1: Normalize symbol
        const normalizedSymbol = normalizeStockSymbol(input.symbol);

        // Step 2: Parse and validate basic tick data
        let tickData: TickData;
        try {
            tickData = this.parseTickData(input, normalizedSymbol);
        } catch (error) {
            logger.error('Failed to parse tick data:', error);
            throw error;
        }

        // Step 3: Enrich with missing fields from CSV (if available)
        const enrichedTick = await this.enrichTickData(tickData);

        // Step 4: Calculate derived metrics
        const derivedMetrics = this.calculateDerivedMetrics(enrichedTick);

        // Step 5: Validate price relationships
        if (!validatePriceRelationships(enrichedTick)) {
            throw new Error('Invalid price relationships');
        }

        // Step 6: Create validated tick
        const validatedTick: ValidatedTick = {
            ...enrichedTick,
            normalized: true,
            enriched: true,
            derivedMetrics,
        };

        logger.info(`Successfully validated tick for ${normalizedSymbol}`);
        return validatedTick;
    }

    /**
     * Parse raw input into TickData
     */
    private parseTickData(input: any, symbol: string): TickData {
        return {
            symbol,
            price: this.parseNumber(input.price),
            open: this.parseNumber(input.open),
            high: this.parseNumber(input.high),
            low: this.parseNumber(input.low),
            close: this.parseNumber(input.close),
            volume: this.parseNumber(input.volume),
            change: this.parseNumber(input.change, 0),
            changePercent: this.parseNumber(input.changePercent || input.change_percent, 0),
            timestamp: normalizeTimestamp(input.timestamp || new Date()),
            sentiment: input.sentiment ? this.parseNumber(input.sentiment) : undefined,
            volatility30d: input.volatility30d || input.volatility_30d
                ? this.parseNumber(input.volatility30d || input.volatility_30d)
                : undefined,
            marketCap: input.marketCap || input.market_cap
                ? BigInt(input.marketCap || input.market_cap)
                : undefined,
            peRatio: input.peRatio || input.pe_ratio
                ? this.parseNumber(input.peRatio || input.pe_ratio)
                : undefined,
            sector: input.sector,
        };
    }

    /**
     * Enrich tick data with CSV data if fields are missing
     */
    private async enrichTickData(tick: TickData): Promise<TickData> {
        try {
            // If already has all fields, return as is
            if (tick.sentiment !== undefined && tick.volatility30d !== undefined && tick.sector) {
                return tick;
            }

            // Try to get data from CSV
            const csvTick = await csvDataLoader.getTickBySymbol(tick.symbol.replace('.NS', ''));
            if (!csvTick) {
                return tick;
            }

            // Enrich missing fields
            return {
                ...tick,
                sentiment: tick.sentiment ?? (csvTick.sentiment ? parseFloat(csvTick.sentiment) : undefined),
                volatility30d: tick.volatility30d ?? (csvTick.volatility30d ? parseFloat(csvTick.volatility30d) : undefined),
                sector: tick.sector ?? csvTick.sector,
                marketCap: tick.marketCap ?? (csvTick.market_cap ? BigInt(csvTick.market_cap) : undefined),
                peRatio: tick.peRatio ?? (csvTick.pe_ratio ? parseFloat(csvTick.pe_ratio) : undefined),
            };
        } catch (error) {
            logger.warn('Failed to enrich from CSV, using original data:', error);
            return tick;
        }
    }

    /**
     * Calculate derived metrics
     */
    private calculateDerivedMetrics(tick: TickData): { priceMomentum: number; volumeChange: number } {
        // Price momentum: (close - open) / open * 100
        const priceMomentum = tick.open !== 0
            ? ((tick.close - tick.open) / tick.open) * 100
            : 0;

        // Volume change: placeholder (would need historical data)
        const volumeChange = 0;

        return {
            priceMomentum,
            volumeChange,
        };
    }

    /**
     * Parse number safely
     */
    private parseNumber(value: any, defaultValue?: number): number {
        if (value === undefined || value === null) {
            if (defaultValue !== undefined) return defaultValue;
            throw new Error(`Required numeric value is missing`);
        }

        const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(parsed)) {
            if (defaultValue !== undefined) return defaultValue;
            throw new Error(`Invalid numeric value: ${value}`);
        }

        return parsed;
    }
}

export default MarketAgent;
