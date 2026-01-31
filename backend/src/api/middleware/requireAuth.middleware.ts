import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication
 * Must be used after clerkMiddleware
 * Checks if req.auth exists (set by clerkMiddleware)
 */
export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.auth || !req.auth.userId) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    next();
};
