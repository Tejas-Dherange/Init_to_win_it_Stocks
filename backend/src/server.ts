import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { environment } from './config/environment';
import { logger } from './utils/logger';
import apiRoutes from './api/routes';
import { errorHandler } from './api/middleware/errorHandler.middleware';

// Import LiveNSEPoller to enable auto-start when DATA_SOURCE=nse
import './workers/LiveNSEPoller';

const app: Application = express();

// Global error handlers for startup crashes
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
});

// Middleware
app.use(cors({
    origin: environment.corsOrigin,
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (environment.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: environment.nodeEnv,
    });
});

// API routes
app.use(`/api/${environment.apiVersion}`, apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = environment.port;

app.listen(PORT, () => {
    logger.info(`🚀 RiskMind backend started on port ${PORT}`);
    logger.info(`📊 Environment: ${environment.nodeEnv}`);
    logger.info(`🔗 API: http://localhost:${PORT}/api/${environment.apiVersion}`);

    // Start simulated price updates (for demo when market is closed)
    // Comment out when using live NSE data during market hours
    if (environment.nodeEnv === 'development') {
        const { priceSimulator } = require('./services/PriceSimulator');
        setTimeout(() => {
            priceSimulator.start();
        }, 3000); // Start after 3 seconds to let NSE poller initialize first
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

export default app;
