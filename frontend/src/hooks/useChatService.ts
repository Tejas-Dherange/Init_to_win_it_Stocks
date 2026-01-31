import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ChatMessage {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
}

export const useChatService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async (symbol: string): Promise<ChatMessage[]> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/chat/${symbol}`);
            return response.data.data.messages;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to load chat history';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (symbol: string, message: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/chat/${symbol}`, {
                message,
            });
            return response.data.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to send message';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async (symbol: string) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_URL}/chat/${symbol}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to clear chat';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        loadHistory,
        sendMessage,
        clearChat,
        loading,
        error,
    };
};
