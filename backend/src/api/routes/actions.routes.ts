import { Router } from 'express';
import prisma from '../../config/database.config';
import { logger } from '../../utils/logger';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

/**
 * GET /api/v1/actions/pending
 * Get pending actions for user
 */
router.get('/pending', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const pendingDecisions = await prisma.decision.findMany({
            where: {
                userId,
                status: 'pending',
            },
            include: {
                portfolio: true,
                alternatives: true,
            },
            orderBy: {
                urgency: 'desc',
            },
        });

        return res.json({
            success: true,
            data: pendingDecisions,
        });
    } catch (error) {
        logger.error('Failed to get pending actions:', error);
        return next(error);
    }
});

/**
 * POST /api/v1/actions/confirm
 * Confirm and execute a decision
 */
router.post('/confirm', requireAuth, async (req, res, next) => {
    try {
        const { decisionId } = req.body;
        const userId = req.user?.id;

        if (!decisionId) {
            return res.status(400).json({
                success: false,
                message: 'decisionId is required',
            });
        }

        logger.info(`Confirming decision: ${decisionId} for user ${userId}`);

        // Update decision status - SECURE: Filter by userId to prevent horizontal escalation
        const updateResult = await prisma.decision.updateMany({
            where: {
                id: decisionId,
                userId: userId // Ensure user owns the decision
            },
            data: {
                status: 'approved',
                updatedAt: new Date(),
            }
        });

        if (updateResult.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Decision not found or unauthorized',
            });
        }

        // TODO: Execute the actual trading action
        // For now, we just mark it as executed
        await prisma.decision.update({
            where: { id: decisionId },
            data: {
                status: 'executed',
                executedAt: new Date(),
            },
        });

        const updatedDecision = await prisma.decision.findUnique({
            where: { id: decisionId },
            include: { portfolio: true }
        });

        return res.json({
            success: true,
            message: 'Decision confirmed and executed',
            data: updatedDecision,
        });
    } catch (error) {
        logger.error('Failed to confirm decision:', error);
        return next(error);
    }
});

/**
 * POST /api/v1/actions/reject
 * Reject a decision
 */
router.post('/reject', requireAuth, async (req, res, next) => {
    try {
        const { decisionId, reason } = req.body;
        const userId = req.user?.id;

        if (!decisionId) {
            return res.status(400).json({
                success: false,
                message: 'decisionId is required',
            });
        }

        logger.info(`Rejecting decision: ${decisionId} for user ${userId}`);

        // SECURE: Filter by userId
        const updateResult = await prisma.decision.updateMany({
            where: {
                id: decisionId,
                userId: userId
            },
            data: {
                status: 'rejected',
                updatedAt: new Date(),
            },
        });

        if (updateResult.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Decision not found or unauthorized',
            });
        }

        // Optionally log the rejection reason
        if (reason) {
            await prisma.auditLog.create({
                data: {
                    userId: userId,
                    agentName: 'USER',
                    operation: 'DECISION_REJECTED',
                    input: { decisionId, userId, reason },
                    output: {}, // Use empty object instead of null for JSON
                    executionTime: 0,
                    success: true,
                },
            });
        }

        return res.json({
            success: true,
            message: 'Decision rejected',
        });
    } catch (error) {
        logger.error('Failed to reject decision:', error);
        return next(error);
    }
});

export default router;
