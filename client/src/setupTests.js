import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for ChatWindow auto-scroll in jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};
