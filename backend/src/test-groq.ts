import 'dotenv/config';
import { groqService } from './services/llm/groq.service';
import { logger } from './utils/logger';

async function testGroqService() {
    try {
        logger.info('=== Testing GroqService ===');

        // Test 1: Simple message without context
        logger.info('\nTest 1: Simple message without context');
        const response1 = await groqService.generateCompletion('Say hello in one sentence');
        logger.info(`Response: ${response1}`);

        // Test 2: Message with system context
        logger.info('\nTest 2: Message with system context');
        const response2 = await groqService.generateCompletion(
            'What is my current risk?',
            'You are a financial advisor. The user has TCS stock with 10% profit.'
        );
        logger.info(`Response: ${response2}`);

        // Test 3: Health check
        logger.info('\nTest 3: Health check');
        const isHealthy = await groqService.healthCheck();
        logger.info(`Health check: ${isHealthy ? 'PASSED' : 'FAILED'}`);

        logger.info('\n=== All tests completed ===');
        process.exit(0);
    } catch (error) {
        logger.error('Test failed:', error);
        process.exit(1);
    }
}

testGroqService();
