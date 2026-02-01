import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.middleware';
import { userService } from '../../services/user.service';

const router = Router();

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated',
                },
            });
        }

        return res.json({
            success: true,
            data: {
                user: req.user,
            },
        });
    } catch (error: any) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message,
            },
        });
    }
});

/**
 * PUT /api/v1/auth/profile
 * Update user profile preferences
 */
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.auth) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated',
                },
            });
        }

        const { name, riskTolerance } = req.body;

        // Validate riskTolerance if provided
        if (riskTolerance !== undefined) {
            if (typeof riskTolerance !== 'number' || riskTolerance < 0 || riskTolerance > 1) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Risk tolerance must be a number between 0 and 1',
                    },
                });
            }
        }

        const updatedUser = await userService.updateUserProfile(req.auth.userId, {
            name,
            riskTolerance,
        });

        return res.json({
            success: true,
            data: {
                user: {
                    id: updatedUser.id,
                    clerkId: updatedUser.clerkId,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    riskTolerance: updatedUser.riskTolerance,
                },
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message,
            },
        });
    }
});

/**
 * POST /api/v1/auth/sync
 * Manually trigger user sync from Clerk
 */
router.post('/sync', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.auth) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated',
                },
            });
        }

        const user = await userService.syncUserFromClerk(req.auth.userId);

        return res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    clerkId: user.clerkId,
                    email: user.email,
                    name: user.name,
                    riskTolerance: user.riskTolerance,
                },
                message: 'User synced successfully',
            },
        });
    } catch (error: any) {
        console.error('Sync user error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message,
            },
        });
    }
});

export default router;
