import '@testing-library/jest-dom/vitest';

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => `test-id-${Math.random().toString(16).slice(2)}`
    },
    configurable: true
  });
}

const localStorageMemory = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => localStorageMemory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      localStorageMemory.set(key, String(value));
    },
    removeItem: (key: string) => {
      localStorageMemory.delete(key);
    },
    clear: () => {
      localStorageMemory.clear();
    },
    key: (index: number) => Array.from(localStorageMemory.keys())[index] ?? null,
    get length() {
      return localStorageMemory.size;
    }
  },
  configurable: true
});
