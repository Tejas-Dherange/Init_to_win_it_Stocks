import { apiService } from './api.service';

export const dashboardService = {
    /**
     * Get portfolio trades/positions
     */
    getTrades: async () => {
        try {
            const response = await apiService.get('/portfolio');

            // Transform portfolio data to match dashboard expectations
            const positions = response.data?.positions || [];

            return {
                current: positions.map((pos: any) => ({
                    id: pos.id,
                    symbol: pos.symbol,
                    name: pos.symbol, // Add company name if available
                    quantity: pos.quantity,
                    entryPrice: pos.entryPrice,
                    currentPrice: pos.currentPrice,
                    pnl: pos.pnl,
                    pnlPercent: pos.pnlPercent,
                    riskScore: pos.riskScore,
                    riskLevel: pos.riskLevel || pos.riskScore,
                    exposure: pos.exposure,
                    sector: pos.sector,
                    lastUpdate: pos.lastUpdate,
                })),
                suggested: [], // Suggestions would come from decisions endpoint
                summary: response.data?.summary || {},
            };
        } catch (error) {
            console.error('[DashboardService] Failed to fetch trades:', error);
            // Return empty data instead of throwing - graceful degradation
            return {
                current: [],
                suggested: [],
                summary: {
                    totalPnL: 0,
                    totalExposure: 0,
                    avgRiskScore: 0,
                    positionCount: 0,
                },
            };
        }
    },

    /**
     * Get chart data for a symbol
     */
    getChartData: async (symbol: string) => {
        try {
            // TODO: Implement chart data endpoint in backend
            // For now, return mock data structure
            return {
                data: [],
                symbol,
            };
        } catch (error) {
            console.error('[DashboardService] Failed to fetch chart data:', error);
            return { data: [], symbol };
        }
    },

    /**
     * Send chat message
     */
    sendChatMessage: async (message: string, context?: any) => {
        try {
            const response = await apiService.post('/chat', {
                message,
                context,
            });
            return response.data;
        } catch (error) {
            console.error('[DashboardService] Failed to send chat message:', error);
            throw error;
        }
    },
};
