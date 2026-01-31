import { AlternativeStock } from '../../types/agents.types';
import { csvDataLoader } from '../../services/data-sources/CSVDataLoader';
import { logger } from '../../utils/logger';

/**
 * Find alternative stock opportunities
 */
export class OpportunityFinder {
    /**
     * Find top alternative stocks
     * Filter: risk < 0.4, sentiment > 0.3, positive momentum
     * Score: (sentiment × 0.4) + ((1-risk) × 0.4) + (momentum × 0.2)
     */
    async findAlternatives(params: {
        currentSymbol: string;
        currentSector?: string;
        excludeSymbols?: string[];
        limit?: number;
    }): Promise<AlternativeStock[]> {
        const { currentSymbol, currentSector, excludeSymbols = [], limit = 5 } = params;

        try {
            logger.info(`Finding alternatives for ${currentSymbol}`);

            // Load all stock ticks from CSV
            const allTicks = await csvDataLoader.loadStockTicks();

            // Load news sentiment
            const allNews = await csvDataLoader.loadNewsSentiment();

            const alternatives: AlternativeStock[] = [];

            for (const tick of allTicks) {
                // Skip current stock and excluded stocks
                if (tick.symbol === currentSymbol || excludeSymbols.includes(tick.symbol)) {
                    continue;
                }

                // Parse data
                const price = parseFloat(tick.price);
                const sentiment = tick.sentiment ? parseFloat(tick.sentiment) : 0;
                const volatility = tick.volatility30d ? parseFloat(tick.volatility30d) : 0.2;
                const changePercent = tick.change_percent ? parseFloat(tick.change_percent) : 0;

                // Calculate risk score (simplified)
                const riskScore = this.estimateRiskScore(volatility, sentiment);

                // Filter criteria
                if (riskScore >= 0.4) continue; // Risk too high
                if (sentiment <= 0.3) continue; // Sentiment too low

                // Calculate momentum (using change percent as proxy)
                const momentum = this.normalizeMomentum(changePercent);

                // Calculate composite score
                const score = sentiment * 0.4 + (1 - riskScore) * 0.4 + momentum * 0.2;

                // Get reason from news
                const reason = this.generateReason(tick.symbol, allNews, sentiment, riskScore);

                alternatives.push({
                    symbol: tick.symbol,
                    reason,
                    riskScore,
                    sentiment,
                    score,
                    sector: tick.sector,
                    currentPrice: price,
                });
            }

            // Sort by composite score (descending)
            alternatives.sort((a, b) => b.score - a.score);

            // Return top N
            const topAlternatives = alternatives.slice(0, limit);

            logger.info(`Found ${topAlternatives.length} alternative opportunities`);
            return topAlternatives;
        } catch (error) {
            logger.error('Failed to find alternatives:', error);
            return [];
        }
    }

    /**
     * Estimate risk score from volatility and sentiment
     */
    private estimateRiskScore(volatility: number, sentiment: number): number {
        // Simple risk estimation
        const volatilityRisk = Math.min(volatility / 0.5, 1); // Normalize to 0-1
        const sentimentRisk = (1 - sentiment) / 2; // Convert sentiment to risk

        return (volatilityRisk * 0.6 + sentimentRisk * 0.4);
    }

    /**
     * Normalize momentum to 0-1 scale
     */
    private normalizeMomentum(changePercent: number): number {
        // Map -10% to +10% range to 0-1
        const normalized = (changePercent + 10) / 20;
        return Math.max(0, Math.min(1, normalized));
    }

    /**
     * Generate reason string from news
     */
    private generateReason(
        symbol: string,
        allNews: any[],
        sentiment: number,
        riskScore: number
    ): string {
        // Find recent positive news for this symbol
        const symbolNews = allNews.filter((n) => n.symbol === symbol);

        if (symbolNews.length > 0) {
            // Get most positive headline
            const bestNews = symbolNews.reduce((best, current) => {
                const currentScore = parseFloat(current.sentiment_score || '0');
                const bestScore = parseFloat(best.sentiment_score || '0');
                return currentScore > bestScore ? current : best;
            });

            return `Strong fundamentals with positive news: "${bestNews.headline.substring(0, 80)}..."`;
        }

        // Default reason
        if (sentiment > 0.6 && riskScore < 0.3) {
            return 'Strong positive sentiment with low risk profile';
        } else if (riskScore < 0.25) {
            return 'Low risk alternative with stable performance';
        } else {
            return 'Moderate risk with positive market outlook';
        }
    }

    /**
     * Find sector-based alternatives
     */
    async findSectorAlternatives(
        currentSector: string,
        excludeSymbols: string[] = [],
        limit: number = 3
    ): Promise<AlternativeStock[]> {
        const allAlternatives = await this.findAlternatives({
            currentSymbol: '',
            currentSector,
            excludeSymbols,
            limit: limit * 2, // Get more to filter by sector
        });

        // Filter by same sector
        const sectorAlternatives = allAlternatives.filter(
            (alt) => alt.sector === currentSector
        );

        return sectorAlternatives.slice(0, limit);
    }
}

export default OpportunityFinder;
