import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { APIResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

class ApiService {
    private client: AxiosInstance;

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
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response.data,
            (error: AxiosError<APIResponse<any>>) => {
                // Handle errors
                const message = error.response?.data?.error?.message || error.message;
                console.error('API Error:', message);
                return Promise.reject(new Error(message));
            }
        );
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
