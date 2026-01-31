import { PrismaClient } from '@prisma/client';
import { environment } from './environment';

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
    if (!environment.databaseUrl) {
        console.warn('⚠️  DATABASE_URL not set, Prisma Client will not be initialized');
        return null;
    }

    try {
        return new PrismaClient({
            log: environment.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
            errorFormat: 'pretty',
        });
    } catch (error) {
        console.error('Failed to initialize Prisma Client:', error);
        return null;
    }
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Lazy initialization - only create when first accessed
export const getPrisma = () => {
    if (prismaInstance === null && !globalThis.prismaGlobal) {
        prismaInstance = prismaClientSingleton();
        if (environment.nodeEnv !== 'production') {
            globalThis.prismaGlobal = prismaInstance;
        }
    }
    return prismaInstance || globalThis.prismaGlobal || null;
};

// Mock delegate that handles any property access or function call
const createMockDelegate = () => {
    const noop = () => Promise.resolve([]);
    return new Proxy(noop, {
        get(_target, _prop) {
            return createMockDelegate(); // Recursive mock for deeper chaining if needed
        },
        apply(_target, _thisArg, _argArray) {
            return Promise.resolve([]); // Return empty array for any call
        }
    });
};

// For backwards compatibility
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        const client = getPrisma();
        if (!client) {
            // Only log once per property access to avoid spam
            if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️  Prisma not available. Mocking: ${String(prop)}`);
            }
            return createMockDelegate();
        }
        return client[prop as keyof PrismaClient];
    }
});

export default prisma;
