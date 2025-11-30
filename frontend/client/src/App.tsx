import { useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { DashboardView } from '@/components/dashboard-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboardStore } from '@/store/useDashboardStore';

/**
 * Main application shell with hero, generator form, and live dashboard preview.
 *
 * Handles CSV upload/context submission to the backend or triggers a local demo.
 */
function App() {
  const [context, setContext] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { fetchDashboard, loadDemoDashboard, status } = useDashboardStore();

  /**
   * Submits the business context and optional CSV to the backend pipeline.
   *
   * Args:
   *   e: Form submission event.
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) return;

    let csvContent = undefined;
    if (file) {
      csvContent = await file.text();
    }
    fetchDashboard(context, csvContent);
  };

  const differentiators = [
    { title: 'Multi-agent LangGraph', desc: 'Ingestion → KPI extraction → visualization → narrative with RAG memory.', icon: Cpu },
    { title: 'Guardrails on data', desc: 'Column validation prevents hallucinated KPIs and mismatched formulas.', icon: ShieldCheck },
    { title: 'Exec-ready storytelling', desc: 'Plotly visuals paired with concise, action-oriented narratives.', icon: Sparkles },
  ];

  const proofPoints = [
    { label: 'LLM Stack', value: 'Ollama (codellama:13b, llama3:8b) + Claude 3.5 fallback' },
    { label: 'Persistence', value: 'Postgres metadata + Chroma vector recall' },
    { label: 'Charts', value: 'Responsive Plotly.js with KPI-aware layouts' },
  ];

  const pipeline = [
    { title: 'Upload or paste data', detail: 'CSV drag-and-drop with inline validation and schema preview.', icon: UploadCloud },
    { title: 'Context-aware KPIs', detail: 'codellama:13b proposes only schema-valid metrics with formulas.', icon: Wand2 },
    { title: 'Story and visuals', detail: 'llama3:8b crafts executive narrative matched to Plotly specs.', icon: BarChart3 },
    { title: 'Reuse wins', detail: 'Chroma RAG recalls previous dashboards to keep teams consistent.', icon: RefreshCcw },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(94,234,212,0.12),transparent_30%)]" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-300">MetricMind</p>
              <p className="text-lg font-semibold text-white">AI KPI Dashboard Builder</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              Multi-agent • Plotly • RAG
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-100"
              type="button"
              onClick={loadDemoDashboard}
            >
              Live demo
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-10">
        <section className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-cyan-200 ring-1 ring-cyan-400/40">
                Automated KPI reasoning with codellama:13b
              </span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/30">
                Narrative by llama3:8b
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Go from raw CSVs to executive-ready KPI dashboards in minutes.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                MetricMind ingests your data, validates columns, proposes the right KPIs, chooses Plotly visuals, and writes the story.
                Built with FastAPI, LangGraph, Postgres, and Chroma so teams can trust every number.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {differentiators.map(({ title, desc, icon: Icon }) => (
                <div key={title} className="rounded-xl border border-white/5 bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {title}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{desc}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-3xl" aria-hidden>
              <div className="h-full w-full rounded-3xl bg-gradient-to-b from-cyan-400/20 via-blue-500/10 to-emerald-400/10" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Wand2 className="h-4 w-4 text-cyan-300" />
                  Generate a dashboard
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-emerald-500/30">
                  100% local data
                </span>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col gap-5 p-6">
                <div className="space-y-2">
                  <label htmlFor="context" className="text-sm font-medium text-slate-200">
                    Business context
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="context"
                      className="pl-9 text-slate-100"
                      placeholder="e.g., SaaS revenue dashboard, ecommerce funnel, B2B pipeline"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    We feed this into the KPI extraction agent so formulas align with your goals.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Upload CSV</label>
                  <label
                    className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-500/5"
                  >
                    <UploadCloud className="h-6 w-6 text-cyan-300" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">Drop your file or browse</p>
                      <p className="text-xs text-slate-400">CSV only · schema stays local · validated before KPI prompts</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {file && (
                      <p className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
                        {file.name}
                      </p>
                    )}
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'loading'}
                  className="h-11 bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-slate-900 hover:from-cyan-400 hover:to-emerald-400"
                >
                  {status === 'loading' ? 'Generating with LangGraph…' : 'Generate KPI Dashboard'}
                </Button>

                <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Validated columns before KPI formulas
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                    <Database className="h-4 w-4 text-cyan-300" />
                    Postgres + Chroma persistence
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-lg ring-1 ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <p className="text-sm text-slate-300">MetricMind pipeline</p>
              <h2 className="text-2xl font-semibold text-white">How we ship trustworthy dashboards</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/40">
              FastAPI • LangGraph • Plotly.js
            </span>
          </div>
          <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
            {pipeline.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="flex h-full flex-col gap-3 rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-white/[0.02] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30">
                    <Icon className="h-4 w-4" />
                  </div>
                  {title}
                </div>
                <p className="text-sm text-slate-300">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Live preview</p>
              <h2 className="text-2xl font-semibold text-white">KPI cards, Plotly visuals, executive narrative</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-100 ring-1 ring-emerald-400/30">
                <CheckCircle2 className="h-4 w-4" />
                Validated schema
              </div>
              <div className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-100 ring-1 ring-cyan-400/30">
                <Cpu className="h-4 w-4" />
                LLM agents
              </div>
            </div>
          </div>
          <DashboardView />
        </section>
      </main>
    </div>
  );
}

export default App;
