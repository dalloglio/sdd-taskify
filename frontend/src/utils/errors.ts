import { AxiosError } from 'axios';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const statusMessages: Record<number, string> = {
  400: 'Please check the highlighted details and try again.',
  401: 'Your user selection is no longer valid. Please select a user again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  409: 'This change conflicts with the latest project data. Refresh and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'The server had a problem. Please try again shortly.',
  502: 'The service is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The service took too long to respond. Please try again.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data?.error;
    const apiMessage =
      typeof apiError === 'string'
        ? apiError
        : error.response?.data?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }

    const status = error.response?.status;
    if (status && statusMessages[status]) {
      return statusMessages[status];
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Unable to reach Taskify. Check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return DEFAULT_MESSAGE;
}

export function isRecoverableNetworkError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;

  const status = error.response?.status;
  return (
    !status ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

export async function retryRecoverable<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 250;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRecoverableNetworkError(error)) {
        throw error;
      }

      await new Promise((resolve) =>
        window.setTimeout(resolve, delayMs * (attempt + 1))
      );
    }
  }

  throw lastError;
}
