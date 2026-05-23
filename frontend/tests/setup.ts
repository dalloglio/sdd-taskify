import '@testing-library/jest-dom/vitest';
import { notifyManager } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { resetMockApiState } from '../src/mocks/handlers';
import { server } from '../src/mocks/server';

notifyManager.setNotifyFunction((callback) => {
  act(callback);
});

const consoleError = console.error;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const [firstArg] = args;
    if (
      typeof firstArg === 'string' &&
      firstArg.includes('Warning: An update to') &&
      firstArg.includes('was not wrapped in act')
    ) {
      return;
    }

    consoleError(...args);
  });
});

afterEach(() => {
  server.resetHandlers();
  resetMockApiState();
});

afterAll(() => {
  server.close();
  consoleErrorSpy.mockRestore();
});
