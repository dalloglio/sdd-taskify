import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: { route?: string; queryClient?: QueryClient; withRouter?: boolean } = {}
) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const content =
    options.withRouter === false ? (
      ui
    ) : (
      <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
    );

  return render(
    <QueryClientProvider client={queryClient}>
      {content}
    </QueryClientProvider>
  );
}

export default renderWithProviders;
