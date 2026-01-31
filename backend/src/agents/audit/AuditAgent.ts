import { BaseAgent } from '../base/BaseAgent';
import prisma from '../../config/database.config';
import { logger } from '../../utils/logger';

export interface AuditInput {
    userId?: string; // Scoped to user
    agentName: string;
    operation: string;
    input?: any;
    output?: any;
    executionTime: number;
    success: boolean;
    error?: string;
    llmTraceId?: string;
}

/**
 * AuditAgent - Logs all agent actions and decisions
 */
export class AuditAgent extends BaseAgent<AuditInput, void> {
    constructor() {
        super('AuditAgent');
    }

    /**
     * Validate audit input
     */
    protected validate(input: AuditInput): boolean {
        if (!input || !input.agentName || !input.operation) {
            logger.warn('Invalid audit input');
            return false;
        }

        return true;
    }

    /**
     * Process audit logging
     */
    protected async process(input: AuditInput): Promise<void> {
        try {
            // Log to database scoped to user
            await prisma.auditLog.create({
                data: {
                    userId: input.userId, // Multi-user support
                    agentName: input.agentName,
                    operation: input.operation,
                    input: input.input || {},
                    output: input.output || {},
                    executionTime: input.executionTime,
                    success: input.success,
                    error: input.error,
                },
            });

            logger.debug(`Audit log created for ${input.agentName}.${input.operation} (user: ${input.userId || 'system'})`);
        } catch (error) {
            logger.warn('Failed to create audit log:', error);
        }
    }

    /**
     * Log decision
     */
    async logDecision({
        userId,
        portfolioId,
        symbol,
        action,
        rationale,
        urgency,
        riskScore,
        llmTraceId
    }: {
        userId: string;
        portfolioId: string;
        symbol: string;
        action: string;
        rationale: string;
        urgency: number;
        riskScore: number;
        llmTraceId?: string;
    }): Promise<string> {
        try {
            // First, ensure the portfolio exists, or create a dummy record
            let portfolio = await prisma.portfolio.findFirst({
                where: { symbol }
            });

            // Fallback: Try removing .NS suffix (e.g. TCS.NS -> TCS)
            // Database stores raw symbols (TCS), workflow uses NSE symbols (TCS.NS)
            if (!portfolio && symbol.endsWith('.NS')) {
                const rawSymbol = symbol.replace('.NS', '');
                logger.info(`Trying fallback portfolio lookup for ${rawSymbol}`);
                portfolio = await prisma.portfolio.findFirst({
                    where: { symbol: rawSymbol }
                });
            }

            // If no portfolio found, skip decision logging (not critical)
            if (!portfolio) {
                logger.warn(`Portfolio not found for ${symbol} (or ${symbol.replace('.NS', '')}), skipping decision log`);
                return 'skipped-no-portfolio';
            }

            const decision = await prisma.decision.create({
                data: {
                    userId, // Required by schema
                    portfolioId: portfolio.id,
                    symbol: portfolio.symbol,
                    action,
                    rationale,
                    urgency,
                    riskScore,
                    llmTraceId,
                    createdAt: new Date(),
                }
            });

            logger.info(`Decision logged: ${decision.id} for user ${params.userId}`);
            return decision.id;
        } catch (error) {
            logger.warn('Failed to log decision:', error);
            return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    /**
     * Log alternatives
     */
    async logAlternatives(decisionId: string, alternatives: any[]): Promise<void> {
        try {
            await prisma.alternative.createMany({
                data: alternatives.map((alt) => ({
                    decisionId,
                    symbol: alt.symbol,
                    reason: alt.reason,
                    riskScore: alt.riskScore,
                    sentiment: alt.sentiment,
                    score: alt.score,
                    sector: alt.sector,
                    currentPrice: alt.currentPrice,
                })),
            });

            logger.info(`Logged ${alternatives.length} alternatives for decision ${decisionId}`);
        } catch (error) {
            logger.warn('Failed to log alternatives:', error);
        }
    }

    /**
     * Log chat message
     */
    async logChatMessage(params: {
        userId: string;
        symbol?: string;
        message: string;
        sender: 'user' | 'bot';
        llmTraceId?: string;
    }): Promise<void> {
        try {
            await prisma.chatMessage.create({
                data: {
                    userId: params.userId,
                    symbol: params.symbol,
                    message: params.message,
                    sender: params.sender,
                    llmTraceId: params.llmTraceId,
                },
            });

            logger.debug(`Chat message logged for user ${params.userId}`);
        } catch (error) {
            logger.warn('Failed to log chat message:', error);
        }
    }

    /**
     * Get audit trail for a timeframe - SCOPED TO USER
     */
    async getAuditTrail(params: {
        userId: string;
        agentName?: string;
        startTime: Date;
        endTime: Date;
        limit?: number;
    }): Promise<any[]> {
        try {
            const logs = await prisma.auditLog.findMany({
                where: {
                    userId: params.userId, // Strict user isolation
                    agentName: params.agentName,
                    timestamp: {
                        gte: params.startTime,
                        lte: params.endTime,
                    },
                },
                orderBy: {
                    timestamp: 'desc',
                },
                take: params.limit || 100,
            });

            return logs;
        } catch (error) {
            logger.error('Failed to retrieve audit trail:', error);
            return [];
        }
    }

    /**
     * Generate compliance report - SCOPED TO USER
     */
    async generateComplianceReport(userId: string, date: Date): Promise<{
        totalDecisions: number;
        approvedDecisions: number;
        rejectedDecisions: number;
        pendingDecisions: number;
        avgResponseTime: number;
    }> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const decisions = await prisma.decision.findMany({
                where: {
                    userId, // Strict user isolation
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

            const totalDecisions = decisions.length;
            const approvedDecisions = decisions.filter((d) => d.status === 'approved').length;
            const rejectedDecisions = decisions.filter((d) => d.status === 'rejected').length;
            const pendingDecisions = decisions.filter((d) => d.status === 'pending').length;

            // Calculate average response time for approved/rejected decisions
            const respondedDecisions = decisions.filter(
                (d) => d.status === 'approved' || d.status === 'rejected'
            );

            let avgResponseTime = 0;
            if (respondedDecisions.length > 0) {
                const totalResponseTime = respondedDecisions.reduce((sum, d) => {
                    const responseTime = d.updatedAt.getTime() - d.createdAt.getTime();
                    return sum + responseTime;
                }, 0);
                avgResponseTime = totalResponseTime / respondedDecisions.length / 1000; // Convert to seconds
            }

            return {
                totalDecisions,
                approvedDecisions,
                rejectedDecisions,
                pendingDecisions,
                avgResponseTime,
            };
        } catch (error) {
            logger.error('Failed to generate compliance report:', error);
            throw error;
        }
    }
}

export const auditAgent = new AuditAgent();
export default AuditAgent;
