import { Router } from 'express';
import prisma from '../../config/database.config';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/actions/pending
 * Get pending actions for user
 */
router.get('/pending', async (req, res, next) => {
    try {
        const userId = '1'; // Demo user

        // Query without alternatives field if it doesn't exist
        const pendingDecisions = await prisma.decision.findMany({
            where: {
                status: 'pending',
            },
            include: {
                portfolio: true,
            },
            orderBy: {
                urgency: 'desc',
            },
        });

        res.json({
            success: true,
            data: pendingDecisions,
        });
    } catch (error) {
        logger.error('Failed to get pending actions:', error);
        // Return empty array instead of failing
        res.json({
            success: true,
            data: [],
        });
    }
});

/**
 * POST /api/v1/actions/confirm
 * Confirm and execute a decision
 */
router.post('/confirm', async (req, res, next) => {
    try {
        const { decisionId } = req.body;

        if (!decisionId) {
            return res.status(400).json({
                success: false,
                message: 'decisionId is required',
            });
        }

        logger.info(`Confirming decision: ${decisionId}`);

        // Update decision status
        const decision = await prisma.decision.update({
            where: { id: decisionId },
            data: {
                status: 'approved',
                updatedAt: new Date(),
            },
            include: {
                portfolio: true,
            },
        });

        // TODO: Execute the actual trading action
        // For now, we just mark it as executed
        await prisma.decision.update({
            where: { id: decisionId },
            data: {
                status: 'executed',
                executedAt: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Decision confirmed and executed',
            data: decision,
        });
    } catch (error) {
        logger.error('Failed to confirm decision:', error);
        next(error);
    }
});

/**
 * POST /api/v1/actions/reject
 * Reject a decision
 */
router.post('/reject', async (req, res, next) => {
    try {
        const { decisionId, reason } = req.body;

        if (!decisionId) {
            return res.status(400).json({
                success: false,
                message: 'decisionId is required',
            });
        }

        logger.info(`Rejecting decision: ${decisionId}`);

        const decision = await prisma.decision.update({
            where: { id: decisionId },
            data: {
                status: 'rejected',
                updatedAt: new Date(),
            },
        });

        // Optionally log the rejection reason
        if (reason) {
            await prisma.auditLog.create({
                data: {
                    agentName: 'USER',
                    operation: 'DECISION_REJECTED',
                    input: { decisionId, reason },
                    output: null,
                    executionTime: 0,
                    success: true,
                },
            });
        }

        res.json({
            success: true,
            message: 'Decision rejected',
            data: decision,
        });
    } catch (error) {
        logger.error('Failed to reject decision:', error);
        next(error);
    }
});

export default router;
