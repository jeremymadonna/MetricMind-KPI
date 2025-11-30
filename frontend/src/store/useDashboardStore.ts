import { create } from 'zustand';
import { generateDashboard } from '@/lib/api';

interface KPI {
    name: string;
    description: string;
    formula: string;
    display_format: string;
    value?: number | string;
}

interface VisualizationSpec {
    chart_type: string;
    title: string;
    x_axis: string;
    y_axis: string;
    plotly_config: any;
}

interface DashboardState {
    kpis: KPI[];
    visualizations: VisualizationSpec[];
    narrative: string;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    fetchDashboard: (context: string, csvContent?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    kpis: [],
    visualizations: [],
    narrative: '',
    status: 'idle',
    error: null,
    fetchDashboard: async (context, csvContent) => {
        set({ status: 'loading', error: null });
        try {
            const data = await generateDashboard(context, csvContent);
            set({
                status: 'succeeded',
                kpis: data.kpis,
                visualizations: data.visualizations,
                narrative: data.narrative,
            });
        } catch (error: any) {
            set({ status: 'failed', error: error.message || 'Failed to fetch dashboard' });
        }
    },
}));
