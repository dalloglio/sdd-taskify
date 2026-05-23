import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { useUserStore } from '../../src/context/userStore';
import { renderWithProviders } from '../utils';

vi.mock('../../src/services/socket', () => ({
  initSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  closeSocket: vi.fn(),
}));

describe('MSW-backed user workflow', () => {
  it('selects a user, creates a project, opens the board, and adds a comment', async () => {
    const user = userEvent.setup();
    useUserStore.getState().setCurrentUser(null);
    window.history.pushState({}, '', '/user-select');

    renderWithProviders(<App />, { withRouter: false });

    await user.click(await screen.findByRole('button', { name: /alice chen/i }));
    expect(await screen.findByText('Website Redesign')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create project/i }));
    await user.type(screen.getByLabelText(/name/i), 'Launch Plan');
    await user.type(screen.getByLabelText(/description/i), 'Coordinate the launch');
    const bobOptions = await screen.findAllByLabelText(/bob smith/i);
    await user.click(bobOptions[0]);
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /create project/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Website Redesign'));
    expect(await screen.findByRole('heading', { name: /kanban board/i })).toBeInTheDocument();

    await user.click(await screen.findByText('Create hero section'));
    await user.type(screen.getByLabelText(/add comment/i), 'Ready for design review.');
    await user.click(screen.getByRole('button', { name: /add comment/i }));

    expect(await screen.findByText('Ready for design review.')).toBeInTheDocument();
  });
});
