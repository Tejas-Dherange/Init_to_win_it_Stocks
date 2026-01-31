import { logger } from '../../utils/logger';

/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by stopping operations when error rate is too high
 */
export class CircuitBreaker {
    private failures: number = 0;
    private successes: number = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private lastFailureTime: number = 0;
    private windowStart: number = Date.now();

    constructor(
        private threshold: number = 0.5, // 50% failure rate
        private windowMs: number = 600000, // 10 minutes
        private cooldownMs: number = 60000 // 1 minute cooldown
    ) { }

    /**
     * Record a successful operation
     */
    recordSuccess(): void {
        this.resetWindowIfNeeded();
        this.successes++;

        // If in HALF_OPEN state and success, close the circuit
        if (this.state === 'HALF_OPEN') {
            logger.info('Circuit breaker: HALF_OPEN → CLOSED (success recorded)');
            this.state = 'CLOSED';
            this.failures = 0;
            this.successes = 0;
        }
    }

    /**
     * Record a failed operation
     */
    recordFailure(): void {
        this.resetWindowIfNeeded();
        this.failures++;
        this.lastFailureTime = Date.now();

        const total = this.failures + this.successes;
        if (total > 10) {
            // Need minimum sample size
            const failureRate = this.failures / total;

            if (failureRate >= this.threshold && this.state === 'CLOSED') {
                logger.warn(`Circuit breaker OPENED: ${(failureRate * 100).toFixed(1)}% failures`);
                this.state = 'OPEN';
            }
        }
    }

    /**
     * Check if operation should be allowed
     */
    async isAllowed(): Promise<boolean> {
        switch (this.state) {
            case 'CLOSED':
                return true;

            case 'OPEN':
                // Check if cooldown period has passed
                const timeSinceFailure = Date.now() - this.lastFailureTime;
                if (timeSinceFailure >= this.cooldownMs) {
                    logger.info('Circuit breaker: OPEN → HALF_OPEN (testing)');
                    this.state = 'HALF_OPEN';
                    return true;
                }
                logger.debug('Circuit breaker: Operation blocked (OPEN)');
                return false;

            case 'HALF_OPEN':
                // Allow one test request
                return true;
        }
    }

    /**
     * Reset the time window if needed
     */
    private resetWindowIfNeeded(): void {
        const windowAge = Date.now() - this.windowStart;
        if (windowAge >= this.windowMs) {
            this.failures = 0;
            this.successes = 0;
            this.windowStart = Date.now();
        }
    }

    /**
     * Get current state
     */
    getState(): {
        state: string;
        failureRate: number;
        failures: number;
        successes: number;
    } {
        const total = this.failures + this.successes;
        const failureRate = total > 0 ? this.failures / total : 0;

        return {
            state: this.state,
            failureRate,
            failures: this.failures,
            successes: this.successes,
        };
    }

    /**
     * Force reset the circuit breaker
     */
    reset(): void {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.windowStart = Date.now();
        logger.info('Circuit breaker manually reset');
    }
}

export default CircuitBreaker;
