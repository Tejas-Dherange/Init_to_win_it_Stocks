import { Router } from 'express';
import { chatService } from '../../services/chat/ChatService';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/chat/:symbol
 * Get chat history for a symbol
 */
router.get('/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const userId = '1'; // Demo user

        logger.info(`Getting chat history for ${symbol}`);

        const messages = await chatService.getChatHistory(userId, symbol);

        res.json({
            success: true,
            data: {
                symbol,
                messages,
            },
        });
    } catch (error) {
        logger.error('Failed to get chat history:', error);
        next(error);
    }
});

/**
 * POST /api/v1/chat/:symbol
 * Send message and get LLM response
 */
router.post('/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const { message } = req.body;
        const userId = '1'; // Demo user

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        logger.info(`Sending message for ${symbol}: ${message.substring(0, 50)}...`);

        const result = await chatService.sendMessage(userId, symbol, message);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Failed to send message:', error);
        next(error);
    }
});

/**
 * DELETE /api/v1/chat/:symbol
 * Clear chat history for a symbol
 */
router.delete('/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const userId = '1'; // Demo user

        logger.info(`Clearing chat history for ${symbol}`);

        await chatService.clearChat(userId, symbol);

        res.json({
            success: true,
            message: 'Chat history cleared',
        });
    } catch (error) {
        logger.error('Failed to clear chat:', error);
        next(error);
    }
});

export default router;
