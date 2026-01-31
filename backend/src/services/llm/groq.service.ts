import { ChatGroq } from '@langchain/groq';
import { llmConfig } from '../../config/llm.config';
import { logger } from '../../utils/logger';

export class GroqService {
    private model: ChatGroq;
    private static instance: GroqService;

    private constructor() {
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: llmConfig.model,
            temperature: llmConfig.temperature,
            maxTokens: llmConfig.maxTokens,
            maxRetries: 2,
        });
    }

    public static getInstance(): GroqService {
        if (!GroqService.instance) {
            GroqService.instance = new GroqService();
        }
        return GroqService.instance;
    }

    /**
     * Generate completion for a prompt
     */
    async generateCompletion(prompt: string, systemContext?: string): Promise<string> {
        try {
            const messages: any[] = [];

            if (systemContext) {
                messages.push({ role: 'system', content: systemContext });
            }
            messages.push({ role: 'user', content: prompt });

            const response = await this.model.invoke(messages);

            const content = typeof response.content === 'string'
                ? response.content
                : Array.isArray(response.content)
                    ? (response.content[0] as any).text
                    : '';

            return content;
        } catch (error) {
            logger.error('GroqService generation failed:', error);
            throw error;
        }
    }

    /**
     * Check health of LLM service
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.model.invoke([{ role: 'user', content: 'ping' }]);
            return true;
        } catch (error) {
            logger.error('GroqService health check failed:', error);
            return false;
        }
    }
}

export const groqService = GroqService.getInstance();
