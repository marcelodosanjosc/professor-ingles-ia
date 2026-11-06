import '@testing-library/jest-dom/vitest';

// Mock de window.scrollTo para jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// Mock do ResizeObserver para componentes que dependem dele (ex: Recharts ResponsiveContainer)
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}


