import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors/AppError';
import { logger } from '../../utils/logger';
import { environment } from '../../config/environment';

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Log error
    logger.error('Error occurred:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Determine status code
    let statusCode = 500;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message,
            ...(environment.nodeEnv === 'development' && { stack: err.stack }),
        },
    });
}

export default errorHandler;
