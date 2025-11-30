import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub browser APIs used by Plotly/react
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(global as any).URL) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).URL = {};
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).URL.createObjectURL = vi.fn();
