import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { APIResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

class ApiService {
    private client: AxiosInstance;
    private getToken: (() => Promise<string | null>) | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            async (config) => {
                // Add Clerk auth token if available
                if (this.getToken) {
                    try {
                        const token = await this.getToken();
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    } catch (error) {
                        console.error('Failed to get auth token:', error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response.data,
            async (error: AxiosError<APIResponse<any>>) => {
                // Handle 401 errors
                if (error.response?.status === 401) {
                    console.error('Unauthorized - Token may be expired');
                    // Optionally trigger logout or token refresh
                }

                const message = error.response?.data?.error?.message || error.message;
                console.error('API Error:', message);
                return Promise.reject(new Error(message));
            }
        );
    }

    // Set the Clerk token getter function
    setTokenGetter(getter: () => Promise<string | null>) {
        this.getToken = getter;
    }

    // Generic GET request
    async get<T>(url: string, params?: any): Promise<APIResponse<T>> {
        return this.client.get(url, { params });
    }

    // Generic POST request
    async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
        return this.client.post(url, data);
    }

    // Generic PUT request
    async put<T>(url: string, data?: any): Promise<APIResponse<T>> {
        return this.client.put(url, data);
    }

    // Generic DELETE request
    async delete<T>(url: string): Promise<APIResponse<T>> {
        return this.client.delete(url);
    }
}

export const apiService = new ApiService();
export default apiService;
