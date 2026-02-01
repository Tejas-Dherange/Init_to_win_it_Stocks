import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/user.service';

// Extend Express Request to include user data
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                clerkId: string;
                email: string;
                name: string;
                riskTolerance: number;
            };
        }
    }
}

/**
 * Sync user middleware
 * Must be used after clerkMiddleware
 * Syncs Clerk user to database and attaches to request
 */
export const syncUserMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Only sync if user is authenticated
        if (!req.auth || !req.auth.userId) {
            return next();
        }

        // Get or create user in database
        const user = await userService.getOrCreateUser(req.auth.userId);

        // Attach user to request
        req.user = {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
            riskTolerance: user.riskTolerance,
        };

        next();
    } catch (error: any) {
        console.error('Sync user middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to sync user data',
            },
        });
    }
};
