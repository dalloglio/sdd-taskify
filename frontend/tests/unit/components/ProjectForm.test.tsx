import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectCard from '../../../src/components/ProjectCard';
import ProjectForm from '../../../src/components/ProjectForm';
import api from '../../../src/services/api';
import { renderWithProviders } from '../../utils';

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const users = [
  { id: 'user-1', name: 'Alice Chen' },
  { id: 'user-2', name: 'Bob Smith' },
];

describe('ProjectForm', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: users } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits project name, description, and selected team members', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), 'Website Refresh');
    await user.type(screen.getByLabelText(/description/i), 'Update content pages');
    await user.click(await screen.findByLabelText(/alice chen/i));
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Website Refresh',
      description: 'Update content pages',
      memberIds: ['user-1'],
    });
  });

  it('calls onCancel without submitting', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<ProjectForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ProjectCard', () => {
  it('renders project summary and member avatars', () => {
    renderWithProviders(
      <ProjectCard
        project={{
          id: 'project-1',
          name: 'Website Redesign',
          description: 'Modernize the website',
          members: users,
          createdAt: '2026-05-06T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText(/created/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Alice Chen')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob Smith')).toBeInTheDocument();
  });
});
