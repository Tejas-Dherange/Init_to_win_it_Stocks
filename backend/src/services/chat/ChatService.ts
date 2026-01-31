import { groqService } from '../llm/groq.service';
import prisma from '../../config/database.config';
import { logger } from '../../utils/logger';

export interface ChatContext {
    userId: string;
    symbol: string;
    currentPosition?: any;
    riskAssessment?: any;
    recentDecisions?: any[];
}

export class ChatService {
    /**
     * Get chat history for a symbol
     */
    async getChatHistory(userId: string, symbol: string): Promise<any[]> {
        try {
            const messages = await prisma.chatMessage.findMany({
                where: {
                    userId,
                    symbol,
                },
                orderBy: {
                    timestamp: 'asc',
                },
                take: 50, // Last 50 messages
            });

            return messages;
        } catch (error) {
            logger.error('Failed to get chat history:', error);
            throw error;
        }
    }

    /**
     * Send message and get LLM response
     */
    async sendMessage(userId: string, symbol: string, message: string): Promise<any> {
        try {
            // Save user message
            const userMessage = await prisma.chatMessage.create({
                data: {
                    userId,
                    symbol,
                    sender: 'user',
                    message: message,
                },
            });

            // Get context
            const context = await this.getContext(userId, symbol);

            // Generate LLM response
            const response = await this.generateResponse(context, message);

            // Save assistant message
            const assistantMessage = await prisma.chatMessage.create({
                data: {
                    userId,
                    symbol,
                    sender: 'bot',
                    message: response,
                },
            });

            return {
                userMessage,
                assistantMessage,
            };
        } catch (error) {
            logger.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Get context for LLM
     */
    private async getContext(userId: string, symbol: string): Promise<ChatContext> {
        try {
            // Get current position
            const position = await prisma.portfolio.findFirst({
                where: { userId, symbol },
            });

            // Get recent decisions
            const decisions = await prisma.decision.findMany({
                where: { userId, symbol },
                orderBy: { createdAt: 'desc' },
                take: 3,
            });

            // Get latest risk assessment (from audit trail or cache)
            // For now, we'll use a placeholder
            const riskAssessment = null;

            return {
                userId,
                symbol,
                currentPosition: position,
                riskAssessment,
                recentDecisions: decisions,
            };
        } catch (error) {
            logger.error('Failed to get context:', error);
            return { userId, symbol };
        }
    }

    /**
     * Generate LLM response with context
     */
    private async generateResponse(context: ChatContext, question: string): Promise<string> {
        try {
            const systemContext = this.buildSystemContext(context);
            const response = await groqService.generateCompletion(question, systemContext);
            return response;
        } catch (error) {
            logger.error('Failed to generate response:', error);
            return 'I apologize, but I encountered an error processing your question. Please try again.';
        }
    }

    /**
     * Build system context for LLM
     */
    private buildSystemContext(context: ChatContext): string {
        let systemPrompt = `You are a financial advisor assistant for RiskMind, helping users understand their portfolio decisions.

Symbol: ${context.symbol}
`;

        if (context.currentPosition) {
            const pos = context.currentPosition;
            const pnl = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
            systemPrompt += `
Current Position:
- Quantity: ${pos.quantity}
- Entry Price: ₹${pos.entryPrice.toFixed(2)}
- Current Price: ₹${pos.currentPrice.toFixed(2)}
- PnL: ${pnl.toFixed(2)}%
- Exposure: ₹${pos.exposure.toFixed(2)}
`;
        }

        if (context.recentDecisions && context.recentDecisions.length > 0) {
            systemPrompt += '\nRecent Decisions:\n';
            context.recentDecisions.forEach((decision, i) => {
                systemPrompt += `${i + 1}. ${decision.action} - ${decision.rationale.substring(0, 100)}...\n`;
            });
        }

        systemPrompt += `
Answer the user's questions about this stock position, risk assessment, and trading decisions.
Be concise, professional, and data-driven. Use Indian Rupee (₹) for currency.`;

        return systemPrompt;
    }

    /**
     * Clear chat history
     */
    async clearChat(userId: string, symbol: string): Promise<void> {
        try {
            await prisma.chatMessage.deleteMany({
                where: {
                    userId,
                    symbol,
                },
            });
            logger.info(`Cleared chat history for ${userId}/${symbol}`);
        } catch (error) {
            logger.error('Failed to clear chat:', error);
            throw error;
        }
    }
}

export const chatService = new ChatService();
