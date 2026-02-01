import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from './redis.config';
// import { environment } from './environment';

const queueOptions: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
    },
};

export const queues = {
    ticks: new Queue('ticks', queueOptions),
    risks: new Queue('risks', queueOptions),
    decisions: new Queue('decisions', queueOptions),
    chat: new Queue('chat', queueOptions),
};

export default queues;
