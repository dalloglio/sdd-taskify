import React from 'react';

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown, _info: unknown) {
    // TODO: send to logging service
    // console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h2 className="text-xl">Something went wrong</h2>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
