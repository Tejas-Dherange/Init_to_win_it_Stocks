import { GoogleGenerativeAI } from '@google/generative-ai';
import { llmConfig } from '../../config/llm.config';
import { logger } from '../../utils/logger';

export class GroqService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private static instance: GroqService;

    private constructor() {
        const apiKey = process.env.GOOGLE_API_KEY || '';
        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY is not set');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.5-flash (latest Flash model)
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                maxOutputTokens: llmConfig.maxTokens,
                temperature: llmConfig.temperature,
            }
        });

        logger.info(`GroqService initialized with Google Gemini SDK`);
    }

    public static getInstance(): GroqService {
        if (!GroqService.instance) {
            GroqService.instance = new GroqService();
        }
        return GroqService.instance;
    }

    /**
     * Generate completion using Google Gemini SDK
     */
    async generateCompletion(userMessage: string, systemContext?: string): Promise<string> {
        try {
            logger.info(`\n${'='.repeat(80)}`);
            logger.info(`🤖 GEMINI 2.5 FLASH REQUEST`);
            logger.info(`${'='.repeat(80)}`);

            // For simple text generation, we can just combine context and prompt
            let prompt = userMessage;
            if (systemContext) {
                prompt = `System Context: ${systemContext}\n\nUser Request: ${userMessage}`;
                logger.info(`📋 System Context: ${systemContext}`);
            }

            logger.info(`📝 User Prompt:\n${userMessage.substring(0, 200)}${userMessage.length > 200 ? '...' : ''}`);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            logger.info(`\n${'='.repeat(80)}`);
            logger.info(`✅ GEMINI 2.5 FLASH RESPONSE`);
            logger.info(`${'='.repeat(80)}`);
            logger.info(`📤 Output:\n${text}`);
            logger.info(`${'='.repeat(80)}\n`);

            return text;
        } catch (error) {
            logger.error(`\n${'!'.repeat(80)}`);
            logger.error('❌ Gemini generation failed:', error);
            logger.error(`${'!'.repeat(80)}\n`);
            throw error;
        }
    }

    /**
     * Check health of LLM service
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.generateCompletion('ping');
            return true;
        } catch (error) {
            logger.error('Gemini health check failed:', error);
            return false;
        }
    }
}

export const groqService = GroqService.getInstance();
