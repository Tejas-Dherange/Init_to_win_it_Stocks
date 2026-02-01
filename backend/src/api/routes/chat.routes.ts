import { Router } from 'express';
import { chatService } from '../../services/chat/ChatService';
import { logger } from '../../utils/logger';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

/**
 * GET /api/v1/chat/:symbol
 * Get chat history for a symbol for authenticated user
 * AUTH TEMPORARILY DISABLED FOR TESTING
 */
router.get('/:symbol', /* requireAuth, */ async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const userId = '1'; // req.user?.id;

        /* COMMENTED FOR TESTING
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }
        */

        logger.info(`Getting chat history for ${symbol} by user ${userId}`);

        const messages = await chatService.getChatHistory(userId, symbol);

        return res.json({
            success: true,
            data: {
                symbol,
                messages,
            },
        });
    } catch (error) {
        logger.error('Failed to get chat history:', error);
        return next(error);
    }
});

/**
 * POST /api/v1/chat/:symbol
 * Send message and get LLM response for authenticated user
 * AUTH TEMPORARILY DISABLED FOR TESTING
 */
router.post('/:symbol', /* requireAuth, */ async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const { message } = req.body;
        const userId = '1'; // req.user?.id;

        /* COMMENTED FOR TESTING
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }
        */

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        logger.info(`Sending message for ${symbol} by user ${userId}: ${message.substring(0, 50)}...`);

        const result = await chatService.sendMessage(userId, symbol, message);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Failed to send message:', error);
        return next(error);
    }
});

/**
 * DELETE /api/v1/chat/:symbol
 * Clear chat history for a symbol for authenticated user
 */
router.delete('/:symbol', requireAuth, async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context missing',
            });
        }

        logger.info(`Clearing chat history for ${symbol} by user ${userId}`);

        await chatService.clearChat(userId, symbol);

        return res.json({
            success: true,
            message: 'Chat history cleared',
        });
    } catch (error) {
        logger.error('Failed to clear chat:', error);
        return next(error);
    }
});

export default router;
