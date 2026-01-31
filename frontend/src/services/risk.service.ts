import { apiService } from './api.service';
import type { RiskAssessment } from '../types';

class RiskService {
    /**
     * Get risk assessment for a symbol
     */
    async getRiskAssessment(symbol: string): Promise<RiskAssessment> {
        const response = await apiService.get<{ symbol: string; risk: RiskAssessment; executionTime: number }>(
            `/risk/${symbol}`
        );
        return response.data!.risk;
    }
}

export const riskService = new RiskService();
export default riskService;
