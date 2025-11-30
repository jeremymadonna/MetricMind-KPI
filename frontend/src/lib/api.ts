import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
});

export const generateDashboard = async (context: string) => {
    const response = await apiClient.post('/kpi/', { context });
    return response.data;
};
