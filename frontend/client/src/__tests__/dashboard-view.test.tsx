import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { DashboardView } from '@/components/dashboard-view';
import { vi } from 'vitest';

vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plot" />,
}));

/**
 * Tests DashboardView rendering paths with stubbed store state.
 */
describe('DashboardView', () => {
  afterEach(() => {
    useDashboardStore.setState({
      kpis: [],
      visualizations: [],
      narrative: '',
      status: 'idle',
      error: null,
    });
  });

  it('renders loading skeletons', () => {
    act(() => {
      useDashboardStore.setState({ status: 'loading' as const });
    });
    const { container } = render(<DashboardView />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders KPI cards and narrative when data is present', () => {
    act(() => {
      useDashboardStore.setState({
        status: 'succeeded',
        kpis: [
          { name: 'Revenue', description: 'Daily revenue', formula: '', display_format: 'currency', value: 12000 },
        ],
        visualizations: [],
        narrative: 'Strong week-over-week growth.',
        error: null,
      });
    });

    render(<DashboardView />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText(/\$12000\.00/)).toBeInTheDocument();
    expect(screen.getByText('Strong week-over-week growth.')).toBeInTheDocument();
  });
});
