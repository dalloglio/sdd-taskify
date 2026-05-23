import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import api from '../../src/services/api';
import { useUserStore } from '../../src/context/userStore';
import { renderWithProviders } from '../utils';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const users = [
  { id: 'user-1', name: 'Alice Chen' },
  { id: 'user-2', name: 'Bob Smith' },
  { id: 'user-3', name: 'Carol Johnson' },
];

const projects = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Modernize the website',
    members: [users[0], users[1]],
    createdAt: '2026-05-06T10:00:00.000Z',
  },
];

const createdProject = {
  id: 'project-2',
  name: 'Launch Plan',
  description: 'Coordinate the launch',
  members: [],
  createdAt: '2026-05-07T10:00:00.000Z',
};

describe('project workflow', () => {
  beforeEach(() => {
    useUserStore.getState().setCurrentUser(null);
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/users') return { data: { data: users } };
      if (url === '/projects') return { data: { data: projects } };
      throw new Error(`Unhandled GET ${url}`);
    });
    vi.mocked(api.post).mockResolvedValue({ data: { data: createdProject } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('supports user selection, project list viewing, and project creation', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/user-select');
    renderWithProviders(React.createElement(App), { withRouter: false });

    await user.click(await screen.findByRole('button', { name: /alice chen/i }));

    expect(useUserStore.getState().currentUser?.id).toBe('user-1');
    expect(await screen.findByRole('heading', { name: /projects/i })).toBeInTheDocument();
    expect(await screen.findByText('Website Redesign')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create project/i }));
    await user.type(screen.getByLabelText(/name/i), 'Launch Plan');
    await user.type(screen.getByLabelText(/description/i), 'Coordinate the launch');
    const bobOptions = await screen.findAllByLabelText(/bob smith/i);
    await user.click(bobOptions[0]);
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/projects', {
        name: 'Launch Plan',
        description: 'Coordinate the launch',
        memberIds: ['user-2'],
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /new project/i })).not.toBeInTheDocument();
    });
  });
});
