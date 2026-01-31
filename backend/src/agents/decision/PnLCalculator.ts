/**
 * Calculate Profit & Loss
 */
export class PnLCalculator {
    /**
     * Calculate realized P&L (for closed positions)
     */
    calculateRealizedPnL(
        entryPrice: number,
        exitPrice: number,
        quantity: number
    ): { pnl: number; pnlPercent: number } {
        const pnl = (exitPrice - entryPrice) * quantity;
        const pnlPercent = entryPrice !== 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;

        return { pnl, pnlPercent };
    }

    /**
     * Calculate unrealized P&L (for open positions)
     */
    calculateUnrealizedPnL(
        entryPrice: number,
        currentPrice: number,
        quantity: number
    ): { pnl: number; pnlPercent: number } {
        return this.calculateRealizedPnL(entryPrice, currentPrice, quantity);
    }

    /**
     * Calculate total portfolio P&L
     */
    calculatePortfolioPnL(
        positions: Array<{
            entryPrice: number;
            currentPrice: number;
            quantity: number;
        }>
    ): { totalPnL: number; totalPnLPercent: number } {
        let totalPnL = 0;
        let totalInvestment = 0;

        for (const position of positions) {
            const { pnl } = this.calculateUnrealizedPnL(
                position.entryPrice,
                position.currentPrice,
                position.quantity
            );
            totalPnL += pnl;
            totalInvestment += position.entryPrice * position.quantity;
        }

        const totalPnLPercent = totalInvestment !== 0 ? (totalPnL / totalInvestment) * 100 : 0;

        return { totalPnL, totalPnLPercent };
    }

    /**
     * Calculate margin utilization
     */
    calculateMarginUtilization(
        exposedValue: number,
        availableMargin: number
    ): number {
        if (availableMargin === 0) return 0;
        return (exposedValue / availableMargin) * 100;
    }

    /**
     * Calculate position exposure (current market value)
     */
    calculateExposure(currentPrice: number, quantity: number): number {
        return currentPrice * quantity;
    }

    /**
     * Calculate expected P&L for a decision
     */
    calculateExpectedPnL(
        currentPrice: number,
        targetPrice: number,
        quantity: number
    ): number {
        return (targetPrice - currentPrice) * quantity;
    }
}

export default PnLCalculator;
