import { create } from 'zustand';
import type { Position, PortfolioSummary } from '../types';
import { portfolioService } from '../services/portfolio.service';

interface PortfolioState {
    positions: Position[];
    summary: PortfolioSummary | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchPortfolio: () => Promise<void>;
    updatePosition: (symbol: string, updates: Partial<Position>) => void;
    clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    positions: [],
    summary: null,
    loading: false,
    error: null,

    fetchPortfolio: async () => {
        set({ loading: true, error: null });
        try {
            const data = await portfolioService.getPortfolio();
            set({
                positions: data.positions,
                summary: data.summary,
                loading: false,
            });
        } catch (error) {
            set({
                error: (error as Error).message,
                loading: false,
            });
        }
    },

    updatePosition: (symbol, updates) => {
        set((state) => ({
            positions: state.positions.map((pos) =>
                pos.symbol === symbol ? { ...pos, ...updates } : pos
            ),
        }));
    },

    clearError: () => set({ error: null }),
}));

export default usePortfolioStore;
