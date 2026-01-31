import { AgentConfig, AgentMetrics, AgentResult } from '../../types/agents.types';
import { logger } from '../../utils/logger';
import { environment } from '../../config/environment';

export abstract class BaseAgent<TInput = any, TOutput = any> {
    protected config: AgentConfig;
    protected metrics: AgentMetrics[] = [];

    constructor(name: string) {
        this.config = {
            name,
            retryAttempts: environment.agentRetryAttempts,
            timeout: environment.agentTimeoutMs,
            enabled: true,
        };
    }

    /**
     * Main execution method - must be implemented by child classes
     */
    protected abstract process(input: TInput): Promise<TOutput>;

    /**
     * Validate input data
     */
    protected abstract validate(input: TInput): boolean;

    /**
     * Execute agent with retry logic and metrics tracking
     */
    async execute(input: TInput): Promise<AgentResult<TOutput>> {
        const startTime = Date.now();
        let lastError: Error | undefined;

        // Validate input
        try {
            const isValid = this.validate(input);
            if (!isValid) {
                throw new Error(`Invalid input for ${this.config.name}`);
            }
        } catch (error) {
            logger.error(`${this.config.name} validation failed:`, error);
            return this.createErrorResult(startTime, 'Validation failed', error as Error);
        }

        // Retry logic
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                logger.info(`${this.config.name} executing (attempt ${attempt}/${this.config.retryAttempts})`);

                // Execute with timeout
                const data = await this.executeWithTimeout(input);

                // Success
                const executionTime = Date.now() - startTime;
                this.recordMetrics(executionTime, true);

                logger.info(`${this.config.name} completed in ${executionTime}ms`);

                return {
                    success: true,
                    data,
                    metrics: {
                        executionTime,
                        success: true,
                        timestamp: new Date(),
                    },
                };
            } catch (error) {
                lastError = error as Error;
                logger.warn(`${this.config.name} attempt ${attempt} failed:`, error);

                // Wait before retry (exponential backoff)
                if (attempt < this.config.retryAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                    await this.sleep(delay);
                }
            }
        }

        // All retries failed
        const executionTime = Date.now() - startTime;
        this.recordMetrics(executionTime, false, lastError);

        return this.createErrorResult(startTime, 'All retry attempts failed', lastError);
    }

    /**
     * Execute with timeout protection
     */
    private async executeWithTimeout(input: TInput): Promise<TOutput> {
        return Promise.race([
            this.process(input),
            this.createTimeout(),
        ]);
    }

    /**
     * Create timeout promise
     */
    private createTimeout(): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`${this.config.name} timeout after ${this.config.timeout}ms`));
            }, this.config.timeout);
        });
    }

    /**
     * Record execution metrics
     */
    private recordMetrics(executionTime: number, success: boolean, error?: Error): void {
        const metric: AgentMetrics = {
            executionTime,
            success,
            timestamp: new Date(),
            error: error?.message,
        };

        this.metrics.push(metric);

        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
            this.metrics.shift();
        }
    }

    /**
     * Create error result
     */
    private createErrorResult(startTime: number, message: string, error?: Error): AgentResult<TOutput> {
        const executionTime = Date.now() - startTime;

        return {
            success: false,
            error: error?.message || message,
            metrics: {
                executionTime,
                success: false,
                timestamp: new Date(),
                error: error?.message || message,
            },
        };
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Get agent health metrics
     */
    getHealth(): {
        name: string;
        enabled: boolean;
        successRate: number;
        avgExecutionTime: number;
        recentErrors: string[];
    } {
        const recent = this.metrics.slice(-20);
        const successes = recent.filter((m) => m.success).length;
        const successRate = recent.length > 0 ? successes / recent.length : 0;
        const avgExecutionTime = recent.length > 0
            ? recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length
            : 0;
        const recentErrors = recent
            .filter((m) => !m.success && m.error)
            .map((m) => m.error!)
            .slice(-5);

        return {
            name: this.config.name,
            enabled: this.config.enabled,
            successRate,
            avgExecutionTime,
            recentErrors,
        };
    }

    /**
     * Enable/disable agent
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
        logger.info(`${this.config.name} ${enabled ? 'enabled' : 'disabled'}`);
    }
}

export default BaseAgent;
