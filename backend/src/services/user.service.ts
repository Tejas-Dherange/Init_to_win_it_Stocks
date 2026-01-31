import { prisma } from '../config/database.config';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * User Service - Handles Clerk user synchronization with database
 */
export class UserService {
    /**
     * Get user from database by Clerk ID
     */
    async getUserByClerkId(clerkId: string) {
        return await prisma.user.findUnique({
            where: { clerkId },
        });
    }

    /**
     * Sync user from Clerk to database
     * Fetches user data from Clerk and creates/updates in DB
     */
    async syncUserFromClerk(clerkId: string) {
        try {
            // Fetch user data from Clerk
            const clerkUser = await clerkClient.users.getUser(clerkId);

            // Extract user information
            const email = clerkUser.emailAddresses.find(
                (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || '';

            const name = clerkUser.firstName && clerkUser.lastName
                ? `${clerkUser.firstName} ${clerkUser.lastName}`
                : clerkUser.firstName || clerkUser.lastName || email.split('@')[0];

            // Upsert user in database
            const user = await prisma.user.upsert({
                where: { clerkId },
                update: {
                    email,
                    name,
                    updatedAt: new Date(),
                },
                create: {
                    clerkId,
                    email,
                    name,
                    riskTolerance: 0.5, // Default risk tolerance
                },
            });

            return user;
        } catch (error: any) {
            console.error('Error syncing user from Clerk:', error);
            throw new Error(`Failed to sync user: ${error.message}`);
        }
    }

    /**
     * Get or create user from Clerk ID
     * Attempts to get from DB first, syncs from Clerk  if not found
     */
    async getOrCreateUser(clerkId: string) {
        let user = await this.getUserByClerkId(clerkId);

        if (!user) {
            user = await this.syncUserFromClerk(clerkId);
        }

        return user;
    }

    /**
     * Update user preferences
     */
    async updateUserProfile(clerkId: string, data: { name?: string; riskTolerance?: number }) {
        return await prisma.user.update({
            where: { clerkId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
}

export const userService = new UserService();
