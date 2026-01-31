import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1'; // Adjust if environment variable needed

export const dashboardService = {
    getTrades: async () => {
        const response = await axios.get(`${API_URL}/dashboard/trades`);
        return response.data;
    },

    getChartData: async (symbol: string) => {
        const response = await axios.get(`${API_URL}/dashboard/chart/${symbol}`);
        return response.data;
    },

    sendChatMessage: async (message: string, context?: any) => {
        const response = await axios.post(`${API_URL}/dashboard/chat`, { message, context });
        return response.data;
    }
};
