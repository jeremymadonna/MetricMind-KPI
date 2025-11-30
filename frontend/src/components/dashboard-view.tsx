'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp } from 'lucide-react';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function DashboardView() {
    const { kpis, visualizations, narrative, status, error } = useDashboardStore();

    if (status === 'loading') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (status === 'failed') {
        return <div className="text-red-500 p-10 text-center">Error: {error}</div>;
    }

    if (status === 'idle' && kpis.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8 mt-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {kpi.display_format === 'currency' ? '$' : ''}
                                {kpi.value || 'N/A'}
                                {kpi.display_format === 'percent' ? '%' : ''}
                            </div>
                            <p className="text-xs text-muted-foreground">{kpi.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visualizations.map((viz, idx) => (
                    <Card key={idx} className="col-span-1">
                        <CardHeader>
                            <CardTitle>{viz.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-64">
                                <Plot
                                    data={viz.plotly_config.data}
                                    layout={{ ...viz.plotly_config.layout, autosize: true, margin: { t: 10, b: 30, l: 40, r: 10 } }}
                                    useResizeHandler={true}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Narrative */}
            {narrative && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none text-gray-700">
                            <p>{narrative}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
