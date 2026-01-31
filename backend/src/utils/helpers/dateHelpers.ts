import { format, parseISO, isValid } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Format date to IST timezone
 */
export const formatToIST = (date: Date | string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
        throw new Error('Invalid date provided');
    }
    const zonedDate = toZonedTime(dateObj, TIMEZONE);
    return format(zonedDate, formatStr);
};

/**
 * Get current IST time
 */
export const getCurrentIST = (): Date => {
    return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Convert string to Date object
 */
export const parseDate = (dateStr: string): Date => {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
        throw new Error(`Invalid date string: ${dateStr}`);
    }
    return date;
};

/**
 * Check if date is within market hours (9:15 AM - 3:30 PM IST)
 */
export const isMarketHours = (date: Date = new Date()): boolean => {
    const ist = toZonedTime(date, TIMEZONE);
    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    const time = hours * 60 + minutes;

    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM

    // Also check if it's a weekday
    const day = ist.getDay();
    const isWeekday = day >= 1 && day <= 5;

    return isWeekday && time >= marketOpen && time <= marketClose;
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
