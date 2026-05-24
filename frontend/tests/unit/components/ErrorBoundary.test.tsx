import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../../src/components/ErrorBoundary';

function BrokenComponent() {
  throw new Error('Task details failed to render');
}

describe('ErrorBoundary', () => {
  it('logs frontend errors and shows a recoverable message', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Task details failed to render')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      '[taskify:error-boundary]',
      expect.objectContaining({ message: 'Task details failed to render' })
    );

    consoleError.mockRestore();
  });
});
