import { apiService } from './api.service';
import type { Decision, RiskAssessment } from '../types';

export interface DecisionResponse {
    symbol: string;
    decision: Decision;
    risk: RiskAssessment;
}

export interface GenerateDecisionsResponse {
    decisions: DecisionResponse[];
    count: number;
    highUrgency: number;
}

class DecisionService {
    /**
     * Generate trading decisions for portfolio
     */
    async generateDecisions(): Promise<GenerateDecisionsResponse> {
        const response = await apiService.post<GenerateDecisionsResponse>('/decisions/generate');
        return response.data!;
    }

    /**
     * Get pending decisions
     */
    async getDecisions(): Promise<Decision[]> {
        const response = await apiService.get<Decision[]>('/decisions');
        return response.data || [];
    }
}

export const decisionService = new DecisionService();
export default decisionService;
