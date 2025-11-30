import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDashboardStore } from '@/store/useDashboardStore';
import { generateDashboard } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  generateDashboard: vi.fn(),
}));

/**
 * Tests the Zustand dashboard store behaviors for API fetch and demo load.
 */
describe('useDashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      kpis: [],
      visualizations: [],
      narrative: '',
      status: 'idle',
      error: null,
    });
  });

  it('loads demo dashboard with predefined KPIs', () => {
    useDashboardStore.getState().loadDemoDashboard();
    const state = useDashboardStore.getState();
    expect(state.status).toBe('succeeded');
    expect(state.kpis.length).toBeGreaterThan(0);
    expect(state.narrative).toMatch(/Momentum is building/);
  });

  it('handles fetchDashboard success', async () => {
    (generateDashboard as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      kpis: [{ name: 'X', description: '', formula: '', display_format: 'number', value: 1 }],
      visualizations: [],
      narrative: 'ok',
    });
    await useDashboardStore.getState().fetchDashboard('ctx', 'csv');
    expect(useDashboardStore.getState().status).toBe('succeeded');
  });

  it('handles fetchDashboard failure', async () => {
    (generateDashboard as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
    await useDashboardStore.getState().fetchDashboard('ctx', 'csv');
    expect(useDashboardStore.getState().status).toBe('failed');
    expect(useDashboardStore.getState().error).toBe('fail');
  });
});
