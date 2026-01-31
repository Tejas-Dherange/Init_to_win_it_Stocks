import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useDecisionActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmDecision = async (decisionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/actions/confirm`, {
                decisionId,
            });
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to confirm decision';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const rejectDecision = async (decisionId: string, reason?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/actions/reject`, {
                decisionId,
                reason,
            });
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to reject decision';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getPendingActions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/actions/pending`);
            return response.data.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch pending actions';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        confirmDecision,
        rejectDecision,
        getPendingActions,
        loading,
        error,
    };
};
