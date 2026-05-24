import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import {
  getErrorMessage,
  isRecoverableNetworkError,
  retryRecoverable,
} from '../../../src/utils/errors';

function axiosError(status?: number, code?: string, data?: unknown) {
  return new AxiosError('Request failed', code, undefined, undefined, {
    status: status ?? 500,
    statusText: 'error',
    headers: {},
    config: {} as any,
    data,
  });
}

describe('friendly error utilities', () => {
  it('prefers API error messages and maps known statuses', () => {
    expect(getErrorMessage(axiosError(400, undefined, { error: 'Name is required' }))).toBe(
      'Name is required'
    );
    expect(getErrorMessage(axiosError(403))).toBe(
      'You do not have permission to perform this action.'
    );
  });

  it('identifies recoverable network and server errors', () => {
    expect(isRecoverableNetworkError(axiosError(undefined, 'ERR_NETWORK'))).toBe(true);
    expect(isRecoverableNetworkError(axiosError(503))).toBe(true);
    expect(isRecoverableNetworkError(axiosError(404))).toBe(false);
  });

  it('retries recoverable failures before returning success', async () => {
    vi.useFakeTimers();
    const operation = vi
      .fn<[], Promise<string>>()
      .mockRejectedValueOnce(axiosError(503))
      .mockResolvedValueOnce('ok');

    const result = retryRecoverable(operation, { retries: 2, delayMs: 10 });
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
