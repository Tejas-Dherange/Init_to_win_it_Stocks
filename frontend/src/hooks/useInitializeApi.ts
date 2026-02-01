import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import apiService from '../services/api.service';

/**
 * Hook to initialize the API service with Clerk authentication
 * This should be called once at the app level
 */
export function useInitializeApi() {
    const { getToken } = useAuth();

    useEffect(() => {
        // Set the Clerk token getter function for the API service
        apiService.setTokenGetter(async () => {
            try {
                return await getToken();
            } catch (error) {
                console.error('Error getting Clerk token:', error);
                return null;
            }
        });
    }, [getToken]);
}
