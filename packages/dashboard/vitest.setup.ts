import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === '2d') {
    return {
      drawImage: () => {},
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      // Add other methods as needed
    } as any;
  }
  return null;
};

// Mock HTMLCanvasElement.toBlob
HTMLCanvasElement.prototype.toBlob = function (
  callback: BlobCallback,
  type?: string,
  quality?: number
) {
  const blob = new Blob(['mock-canvas-data'], { type: type || 'image/png' });
  callback(blob);
};

// Setup global mocks
global.URL.createObjectURL = () => 'blob:mock-url';
global.URL.revokeObjectURL = () => {};

// Mock Image
(global as any).Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 800;
  height = 600;

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};
