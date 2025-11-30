import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

export const generateDashboard = async (context: string, csvContent?: string) => {
    const response = await apiClient.post('/kpi/', { context, csv_content: csvContent });
    return response.data;
};
