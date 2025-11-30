import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, FileWarning, Sparkles, TrendingUp } from 'lucide-react';
import Plot from 'react-plotly.js';

type VisualizationSpec = {
    title?: string;
    plotly_config?: {
        data?: any[];
        layout?: Record<string, any>;
    } | string | null;
};

type KpiItem = { name: string; value?: number | string; display_format?: string; description?: string };

const buildFallbackPlot = (kpis: KpiItem[]) => {
    const numericKpis = kpis
        .map((kpi) => ({
            name: kpi.name,
            value: typeof kpi.value === 'string' ? Number.parseFloat(kpi.value) : kpi.value,
        }))
        .filter((kpi) => typeof kpi.value === 'number' && Number.isFinite(kpi.value as number));

    if (!numericKpis.length) return null;

    return {
        data: [
            {
                type: 'bar',
                x: numericKpis.map((k) => k.name),
                y: numericKpis.map((k) => k.value),
                marker: { color: ['#22d3ee', '#34d399', '#a855f7', '#f472b6', '#fbbf24', '#38bdf8'] },
            },
        ],
        layout: {
            title: 'KPI Snapshot',
        },
    };
};

const normalizePlot = (viz: VisualizationSpec, kpis: KpiItem[]) => {
    let cfg: any = viz?.plotly_config;

    // Accept serialized JSON strings from backend
    if (typeof cfg === 'string') {
        try {
            cfg = JSON.parse(cfg);
        } catch {
            cfg = null;
        }
    }

    // Ensure we have usable data
    if (cfg && Array.isArray(cfg.data) && cfg.data.length) {
        const cleaned = cfg.data.filter((d: any) => d && ((Array.isArray(d.x) && d.x.length) || (Array.isArray(d.y) && d.y.length)));
        if (cleaned.length) {
            return {
                data: cleaned,
                layout: cfg.layout ?? {},
            };
        }
    }

    return buildFallbackPlot(kpis);
};

const formatValue = (value: KpiItem['value'], display: string | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
        const rounded = Number.isFinite(value) ? value.toFixed(2) : value;
        if (display === 'percent') return `${rounded}%`;
        if (display === 'currency') return `$${rounded}`;
        return rounded;
    }
    const maybeNum = Number.parseFloat(value);
    if (Number.isFinite(maybeNum)) {
        const rounded = maybeNum.toFixed(2);
        if (display === 'percent') return `${rounded}%`;
        if (display === 'currency') return `$${rounded}`;
        return rounded;
    }
    return value;
};

export function DashboardView() {
    const { kpis, visualizations, narrative, status, error } = useDashboardStore();
    const isEmpty = status === 'idle' && kpis.length === 0;
    const hasVisualizations = Array.isArray(visualizations) && visualizations.length > 0;

    if (status === 'loading') {
        return (
            <div className="space-y-6 rounded-2xl border border-white/5 bg-slate-900/50 p-6 ring-1 ring-white/10">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/10" />
                    ))}
                </div>
                <Skeleton className="h-72 w-full rounded-xl bg-white/10" />
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-red-100">
                <FileWarning className="h-6 w-6" />
                <p className="text-sm font-semibold">Error generating dashboard</p>
                <p className="text-sm text-red-200">{error}</p>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-200">
                <p className="text-lg font-semibold">Generate a dashboard to preview KPI cards, visuals, and narrative.</p>
                <p className="mt-2 text-sm text-slate-400">We validate your CSV schema, pick KPI formulas that actually align to columns, and render Plotly charts automatically.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 rounded-2xl border border-white/5 bg-slate-900/50 p-6 shadow-lg ring-1 ring-white/10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] text-white shadow-md ring-1 ring-white/10">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold">{kpi.name}</CardTitle>
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
                                <Activity className="h-3.5 w-3.5" />
                                KPI
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-bold leading-tight">{formatValue(kpi.value, kpi.display_format)}</div>
                            <p className="text-sm text-slate-200">{kpi.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {hasVisualizations
                    ? visualizations.map((viz, idx) => {
                          let plotCfg = normalizePlot(viz, kpis);
                          const fallback = !plotCfg ? buildFallbackPlot(kpis) : null;
                          if (!plotCfg && fallback) {
                              plotCfg = fallback;
                          }
                          return (
                              <Card key={idx} className="border-white/10 bg-slate-900/80 text-white shadow-md ring-1 ring-white/10">
                                  <CardHeader className="border-b border-white/5 pb-3">
                                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                          <Sparkles className="h-4 w-4 text-cyan-300" />
                                          {viz.title || 'Visualization'}
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      {plotCfg ? (
                                          <div className="h-72 w-full">
                                              <Plot
                                                  data={plotCfg.data}
                                                  layout={{
                                                      ...plotCfg.layout,
                                                      autosize: true,
                                                      paper_bgcolor: 'rgba(0,0,0,0)',
                                                      plot_bgcolor: 'rgba(0,0,0,0)',
                                                      font: { color: '#e2e8f0' },
                                                      margin: { t: 30, b: 40, l: 40, r: 10 },
                                                  }}
                                                  useResizeHandler={true}
                                                  style={{ width: '100%', height: '100%' }}
                                              />
                                          </div>
                                      ) : (
                                          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                              We could not render this chart because no Plotly data was provided. Validate the visualization payload from the backend.
                                          </div>
                                      )}
                                  </CardContent>
                              </Card>
                          );
                      })
                    : (() => {
                          const fallback = buildFallbackPlot(kpis);
                          return (
                              <Card className="border-white/10 bg-slate-900/80 text-white shadow-md ring-1 ring-white/10">
                                  <CardHeader className="border-b border-white/5 pb-3">
                                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                          <Sparkles className="h-4 w-4 text-cyan-300" />
                                          KPI Snapshot
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      {fallback ? (
                                          <div className="h-72 w-full">
                                              <Plot
                                                  data={fallback.data}
                                                  layout={{
                                                      ...fallback.layout,
                                                      autosize: true,
                                                      paper_bgcolor: 'rgba(0,0,0,0)',
                                                      plot_bgcolor: 'rgba(0,0,0,0)',
                                                      font: { color: '#e2e8f0' },
                                                      margin: { t: 30, b: 40, l: 40, r: 10 },
                                                  }}
                                                  useResizeHandler={true}
                                                  style={{ width: '100%', height: '100%' }}
                                              />
                                          </div>
                                      ) : (
                                          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                              No visualization data returned. Upload a dataset or verify the KPI response to see charts.
                                          </div>
                                      )}
                                  </CardContent>
                              </Card>
                          );
                      })()}
            </div>

            {/* Narrative */}
            {narrative && (
                <Card className="border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white ring-1 ring-white/10">
                    <CardHeader className="flex flex-row items-center gap-2 border-b border-white/5 pb-4">
                        <TrendingUp className="h-5 w-5 text-emerald-300" />
                        <CardTitle className="text-base font-semibold">Executive Narrative</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-100">
                        <p className="leading-relaxed">{narrative}</p>
                        <p className="text-sm text-slate-300">
                            Generated by llama3:8b using KPI values, anomalies, and visualization choices. Tailored for exec readouts.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
