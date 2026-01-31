import { apiService } from './api.service';
import type { Position, PortfolioSummary } from '../types';

export interface PortfolioResponse {
    positions: Position[];
    summary: PortfolioSummary;
}

class PortfolioService {
    /**
     * Get user portfolio
     */
    async getPortfolio(): Promise<PortfolioResponse> {
        const response = await apiService.get<PortfolioResponse>('/portfolio');
        return response.data!;
    }

    /**
     * Get position by symbol
     */
    async getPosition(symbol: string): Promise<Position | null> {
        const portfolio = await this.getPortfolio();
        return portfolio.positions.find((p) => p.symbol === symbol) || null;
    }
}

export const portfolioService = new PortfolioService();
export default portfolioService;
