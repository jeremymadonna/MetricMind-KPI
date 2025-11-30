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
    loadDemoDashboard: () => void;
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
    loadDemoDashboard: () => {
        const demoKpis: KPI[] = [
            {
                name: 'Daily Revenue',
                description: 'Total revenue generated on a daily basis.',
                formula: "df['revenue'].sum()",
                display_format: 'currency',
                value: 12227.62,
            },
            {
                name: 'Average Daily Orders',
                description: 'Average number of orders placed per day.',
                formula: "df['orders'].mean()",
                display_format: 'number',
                value: 144.74,
            },
            {
                name: 'Total New Customers',
                description: 'Number of new customers added daily.',
                formula: "df['new_customers'].mean()",
                display_format: 'number',
                value: 50.52,
            },
            {
                name: 'Average Returning Customers',
                description: 'Average number of returning customers per day.',
                formula: "df['returning_customers'].mean()",
                display_format: 'number',
                value: 94.22,
            },
            {
                name: 'Total Marketing Spend',
                description: 'Total amount spent on marketing efforts daily.',
                formula: "df['marketing_spend'].mean()",
                display_format: 'currency',
                value: 1453.95,
            },
            {
                name: 'Average Conversion Rate (in %)',
                description: 'Average percentage of customers converting.',
                formula: "df['conversion_rate_percent'].mean()",
                display_format: 'percent',
                value: 2.99,
            },
        ];

        const demoVisualizations: VisualizationSpec[] = [
            {
                chart_type: 'line',
                title: 'Daily Revenue Trend',
                x_axis: 'date',
                y_axis: 'revenue',
                plotly_config: {
                    data: [
                        {
                            type: 'scatter',
                            mode: 'lines+markers',
                            x: ['Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26'],
                            y: [11800, 12450, 13100, 12800, 13950, 14220, 13680],
                            line: { color: '#22d3ee', width: 3 },
                            marker: { color: '#22d3ee', size: 8 },
                            name: 'Revenue',
                        },
                    ],
                    layout: {
                        title: 'Revenue accelerating week over week',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Revenue ($)' },
                    },
                },
            },
            {
                chart_type: 'bar',
                title: 'Marketing Efficiency',
                x_axis: 'channel',
                y_axis: 'cac',
                plotly_config: {
                    data: [
                        {
                            type: 'bar',
                            x: ['Search', 'Paid Social', 'Affiliate', 'Email'],
                            y: [42, 58, 37, 18],
                            marker: {
                                color: ['#34d399', '#60a5fa', '#a855f7', '#f59e0b'],
                            },
                            name: 'CAC ($)',
                        },
                    ],
                    layout: {
                        title: 'Customer acquisition cost by channel',
                        xaxis: { title: 'Channel' },
                        yaxis: { title: 'CAC ($)' },
                    },
                },
            },
            {
                chart_type: 'line',
                title: 'Conversion & Retention',
                x_axis: 'date',
                y_axis: 'rates',
                plotly_config: {
                    data: [
                        {
                            type: 'scatter',
                            mode: 'lines+markers',
                            x: ['Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26'],
                            y: [2.4, 2.6, 2.8, 2.9, 3.1, 3.0, 3.2],
                            name: 'Conversion Rate %',
                            line: { color: '#a855f7', width: 3 },
                            marker: { color: '#a855f7', size: 8 },
                        },
                        {
                            type: 'scatter',
                            mode: 'lines+markers',
                            x: ['Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26'],
                            y: [84, 87, 89, 91, 93, 94, 96],
                            name: 'Returning Customers',
                            yaxis: 'y2',
                            line: { color: '#f59e0b', width: 3 },
                            marker: { color: '#f59e0b', size: 8 },
                        },
                    ],
                    layout: {
                        title: 'Conversion up as loyalty deepens',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Conversion Rate (%)' },
                        yaxis2: {
                            title: 'Returning Customers',
                            overlaying: 'y',
                            side: 'right',
                        },
                        legend: { orientation: 'h', y: -0.2 },
                    },
                },
            },
        ];

        const demoNarrative =
            "Momentum is building: daily revenue is compounding, CAC is healthy across channels, and conversion rates are edging past 3%. Retention is climbing in lockstep, signaling that recent journey optimizations are working. Double down on the top-performing channels and maintain the velocity on onboarding to sustain this trend.";

        set({
            kpis: demoKpis,
            visualizations: demoVisualizations,
            narrative: demoNarrative,
            status: 'succeeded',
            error: null,
        });
    },
}));
