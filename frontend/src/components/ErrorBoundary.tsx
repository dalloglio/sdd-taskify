import React from 'react';
import { getErrorMessage } from '../utils/errors';

type State = { error: unknown; hasError: boolean };

function logFrontendError(error: unknown, info?: unknown) {
  const payload = {
    message: getErrorMessage(error),
    componentStack:
      info && typeof info === 'object' && 'componentStack' in info
        ? (info as { componentStack?: string }).componentStack
        : undefined,
  };

  // eslint-disable-next-line no-console
  console.error('[taskify:error-boundary]', payload);
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { error, hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    logFrontendError(error, info);
  }

  reset = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8" role="alert">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(this.state.error)}
          </p>
          <button
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            onClick={this.reset}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
