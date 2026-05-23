import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumb from '../../../src/components/Breadcrumb';
import ErrorBoundary from '../../../src/components/ErrorBoundary';
import Loading from '../../../src/components/Loading';
import Navigation from '../../../src/components/Navigation';
import { renderWithProviders } from '../../utils';

function BrokenChild() {
  throw new Error('Render failed');
}

describe('miscellaneous components', () => {
  it('renders breadcrumb links and current page labels', () => {
    renderWithProviders(
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: 'Website Redesign' },
        ]}
      />
    );

    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute(
      'href',
      '/projects'
    );
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<Navigation />);

    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute(
      'href',
      '/projects'
    );
    expect(screen.getByRole('link', { name: /user/i })).toHaveAttribute(
      'href',
      '/user-select'
    );
  });

  it('renders the loading indicator without visible status text', () => {
    const { container } = renderWithProviders(<Loading />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders an error fallback when a child throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderWithProviders(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
