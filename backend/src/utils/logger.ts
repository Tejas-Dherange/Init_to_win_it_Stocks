import winston from 'winston';
import path from 'path';
import { environment } from '../config/environment';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
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
