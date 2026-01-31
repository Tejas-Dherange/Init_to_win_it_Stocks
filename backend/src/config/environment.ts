import dotenv from 'dotenv';

dotenv.config();

export const environment = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    redisPassword: process.env.REDIS_PASSWORD || '',


    // Clerk
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',

    // Groq API
    groqApiKey: process.env.GROQ_API_KEY || '',

    // LangSmith
    langsmithApiKey: process.env.LANGSMITH_API_KEY || '',
    langsmithProject: process.env.LANGSMITH_PROJECT || 'riskmind',
    langchainTracingV2: process.env.LANGCHAIN_TRACING_V2 === 'true',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // WebSocket
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    socketIoPingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000', 10),
    socketIoPingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000', 10),

    // Agent Configuration
    agentRetryAttempts: parseInt(process.env.AGENT_RETRY_ATTEMPTS || '3', 10),
    agentTimeoutMs: parseInt(process.env.AGENT_TIMEOUT_MS || '5000', 10),
    circuitBreakerThreshold: parseFloat(process.env.CIRCUIT_BREAKER_THRESHOLD || '0.5'),
    circuitBreakerWindowMs: parseInt(process.env.CIRCUIT_BREAKER_WINDOW_MS || '600000', 10),

    // Risk Calculation
    varConfidence: parseFloat(process.env.VAR_CONFIDENCE || '0.95'),
    volatilityWindowDays: parseInt(process.env.VOLATILITY_WINDOW_DAYS || '30', 10),
    concentrationThreshold: parseFloat(process.env.CONCENTRATION_THRESHOLD || '0.4'),
    riskHighThreshold: parseFloat(process.env.RISK_HIGH_THRESHOLD || '0.7'),
    riskMediumThreshold: parseFloat(process.env.RISK_MEDIUM_THRESHOLD || '0.4'),

    // CSV Data
    csvDataPath: process.env.CSV_DATA_PATH || './data',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logFilePath: process.env.LOG_FILE_PATH || './logs',
} as const;

export const isDevelopment = environment.nodeEnv === 'development';
export const isProduction = environment.nodeEnv === 'production';
export const isTest = environment.nodeEnv === 'test';
