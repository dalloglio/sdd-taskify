import '@testing-library/jest-dom/vitest';
import { notifyManager } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import { afterAll, beforeAll, vi } from 'vitest';

notifyManager.setNotifyFunction((callback) => {
  act(callback);
});

const consoleError = console.error;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
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

afterAll(() => {
  consoleErrorSpy.mockRestore();
});
