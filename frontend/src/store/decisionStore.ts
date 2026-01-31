import { create } from 'zustand';
import type { Decision } from '../types';
import { decisionService } from '../services/decision.service';

interface DecisionState {
    decisions: Decision[];
    loading: boolean;
    error: string | null;

    // Actions
    generateDecisions: () => Promise<void>;
    clearDecisions: () => void;
    clearError: () => void;
}

export const useDecisionStore = create<DecisionState>((set) => ({
    decisions: [],
    loading: false,
    error: null,

    generateDecisions: async () => {
        set({ loading: true, error: null });
        try {
            const response = await decisionService.generateDecisions();
            set({
                decisions: response.decisions.map((d) => d.decision),
                loading: false,
            });
        } catch (error) {
            set({
                error: (error as Error).message,
                loading: false,
            });
        }
    },

    clearDecisions: () => set({ decisions: [] }),
    clearError: () => set({ error: null }),
}));

export default useDecisionStore;
