import '@testing-library/jest-dom/vitest';

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => `test-id-${Math.random().toString(16).slice(2)}`
    },
    configurable: true
  });
}

