import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { environment } from '../../config/environment';

// Extend Express Request to include auth info
declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                sessionId: string;
            };
        }
    }
}

/**
 * Clerk authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches user ID and session ID to request object
 */
export const clerkMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue without auth
            return next();
        }

        const token = authHeader.substring(7);

        // Verify the token with Clerk
        try {
            // Using verifyToken for JWT verification in Clerk v5+
            const payload = await clerkClient.verifyToken(token, {
                secretKey: environment.clerkSecretKey,
            });

            // Attach auth info to request
            req.auth = {
                userId: payload.sub,
                sessionId: (payload as any).sid || '',
            };

            next();
        } catch (verifyError: any) {
            console.error('Clerk token verification failed:', verifyError.message);
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: `Invalid or expired authentication token: ${verifyError.message}`,
                },
            });
        }
    } catch (error: any) {
        console.error('Clerk middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Authentication system error',
            },
        });
    }
};
