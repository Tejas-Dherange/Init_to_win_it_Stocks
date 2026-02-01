import winston from 'winston';
import { environment } from '../config/environment';
import path from 'path';

// Safe JSON stringify that handles circular references
function safeStringify(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Custom format for console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;

        // If there's metadata, append it
        if (Object.keys(metadata).length > 0) {
            // Filter out Winston's internal symbols
            const filteredMetadata = Object.keys(metadata)
                .filter(key => !key.startsWith('Symbol'))
                .reduce((obj, key) => {
                    obj[key] = metadata[key];
                    return obj;
                }, {} as any);

            if (Object.keys(filteredMetadata).length > 0) {
                msg += ` ${safeStringify(filteredMetadata)}`;
            }
        }

        return msg;
    })
);

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// Add file transports in production
if (environment.nodeEnv === 'production') {
    transports.push(
        new winston.transports.File({
            filename: path.join(environment.logFilePath, 'error.log'),
            level: 'error',
            format: logFormat,
        }),
        new winston.transports.File({
            filename: path.join(environment.logFilePath, 'combined.log'),
            format: logFormat,
        })
    );
}

// Configure logger options
const loggerOptions: winston.LoggerOptions = {
    level: environment.logLevel,
    format: logFormat,
    transports,
};

// Add exception/rejection handlers only in production to avoid issues
if (environment.nodeEnv === 'production') {
    loggerOptions.exceptionHandlers = [
        new winston.transports.File({
            filename: path.join(environment.logFilePath, 'exceptions.log'),
        }),
    ];
    loggerOptions.rejectionHandlers = [
        new winston.transports.File({
            filename: path.join(environment.logFilePath, 'rejections.log'),
        }),
    ];
}

export const logger = winston.createLogger(loggerOptions);

export default logger;
