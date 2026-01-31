/**
 * Format number as Indian Rupees
 */
export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format large numbers with suffixes (K, L, Cr)
 */
export const formatLargeNumber = (num: number): string => {
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
        return `₹${(num / 1000).toFixed(2)} K`;
    }
    return `₹${num.toFixed(2)}`;
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format volume (in lakhs/crores)
 */
export const formatVolume = (volume: number): string => {
    if (volume >= 10000000) {
        return `${(volume / 10000000).toFixed(2)} Cr`;
    } else if (volume >= 100000) {
        return `${(volume / 100000).toFixed(2)} L`;
    } else if (volume >= 1000) {
        return `${(volume / 1000).toFixed(2)} K`;
    }
    return volume.toString();
};

/**
 * Normalize stock symbol (add .NS suffix for NSE if missing)
 */
export const normalizeSymbol = (symbol: string): string => {
    if (!symbol) return '';
    const upper = symbol.toUpperCase().trim();
    // If already has .NS or .BO suffix, return as is
    if (upper.endsWith('.NS') || upper.endsWith('.BO')) {
        return upper;
    }
    // Add .NS suffix for NSE stocks
    return `${upper}.NS`;
};

/**
 * Format stock symbol for display (remove .NS suffix)
 */
export const displaySymbol = (symbol: string): string => {
    return symbol.replace(/\.(NS|BO)$/, '');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};
