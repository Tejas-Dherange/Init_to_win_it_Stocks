import Redis from 'ioredis';
import { environment } from './environment';

const createRedisClient = () => {
    const config: any = {
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    };

    // Parse Redis URL
    if (environment.redisPassword) {
        config.password = environment.redisPassword;
    }

    return new Redis(environment.redisUrl, config);
};

export const redisClient = createRedisClient();
export const redisPubClient = createRedisClient();
export const redisSubClient = createRedisClient();

redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err);
});

export default redisClient;
