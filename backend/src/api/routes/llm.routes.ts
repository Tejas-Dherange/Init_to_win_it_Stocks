import { Router } from 'express';
import { groqService } from '../../services/llm/groq.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/llm/test
 * Test LLM integration with Groq
 */
router.get('/test', async (req, res, next) => {
    try {
        logger.info('Testing Groq LLM integration');

        const prompt = 'Explain in one sentence what LangGraph is used for.';
        const systemContext = 'You are a helpful AI assistant.';

        const response = await groqService.generateCompletion(prompt, systemContext);

        res.json({
            success: true,
            data: {
                prompt,
                response,
                model: 'llama-3.3-70b-versatile',
                provider: 'Groq via LangChain'
            }
        });
    } catch (error) {
        logger.error('LLM test failed:', error);
        next(error);
    }
});

/**
 * GET /api/v1/llm/health
 * Check LLM service health
 */
router.get('/health', async (req, res, next) => {
    try {
        const isHealthy = await groqService.healthCheck();

        res.json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                provider: 'Groq',
                model: 'llama-3.3-70b-versatile'
            }
        });
    } catch (error) {
        logger.error('LLM health check failed:', error);
        next(error);
    }
});

export default router;
