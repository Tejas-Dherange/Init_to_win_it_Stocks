/**
 * Format number as Indian Rupee currency
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers in Lakhs/Crores
 */
export const formatLargeNumber = (value: number): string => {
    if (value >= 10000000) {
        // 1 Crore = 10 Million
        return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
        // 1 Lakh = 100 Thousand
        return `₹${(value / 100000).toFixed(2)}L`;
    }
    return formatCurrency(value);
};

/**
 * Format date/time
 */
export const formatDateTime = (date: string | Date): string => {
    return new Date(date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

export default {
    formatCurrency,
    formatPercent,
    formatLargeNumber,
    formatDateTime,
    formatRelativeTime,
};
