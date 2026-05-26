// Global type declarations for Jest when @types/jest is not installed.
// This makes Jest globals available in TypeScript test files.
import type { expect, describe, it, test, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';

declare global {
  const expect: typeof import('@jest/globals').expect;
  const describe: typeof import('@jest/globals').describe;
  const it: typeof import('@jest/globals').it;
  const test: typeof import('@jest/globals').test;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterAll: typeof import('@jest/globals').afterAll;
  const afterEach: typeof import('@jest/globals').afterEach;
}
