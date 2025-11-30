'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { DashboardView } from '@/components/dashboard-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Search } from 'lucide-react';

export default function Home() {
  const [context, setContext] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { fetchDashboard, status } = useDashboardStore();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (context.trim()) {
      let csvContent = undefined;

      if (file) {
        csvContent = await file.text();
      }

      fetchDashboard(context, csvContent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">MetricMind KPI Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <label htmlFor="context" className="sr-only">Business Context</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="context"
                  className="pl-10"
                  placeholder="Describe your business context (e.g., 'SaaS startup tracking monthly recurring revenue')"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
              <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Generating...' : 'Generate Dashboard'}
              </Button>
            </div>
          </form>
        </div>

        {/* Dashboard View */}
        <DashboardView />
      </main>
    </div>
  );
}
