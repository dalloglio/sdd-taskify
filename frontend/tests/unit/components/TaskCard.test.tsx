import { DndContext } from '@dnd-kit/core';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskCard from '../../../src/components/TaskCard';
import type { Task, User } from '../../../src/types/models';
import { renderWithProviders } from '../../utils';

const alice: User = { id: 'user-1', name: 'Alice Chen', role: 'product_manager' };
const bob: User = { id: 'user-2', name: 'Bob Smith', role: 'engineer' };

const assignedTask: Task = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Create hero section',
  description: 'Design the main landing section',
  assignee: bob,
  status: 'to_do',
  createdAt: '2026-05-06T10:00:00.000Z',
};

function renderTaskCard(task: Task = assignedTask) {
  const props = {
    task,
    currentUser: bob,
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
  };

  renderWithProviders(
    <DndContext>
      <TaskCard {...props} />
    </DndContext>
  );

  return props;
}

describe('TaskCard', () => {
  it('renders task hierarchy, current-user accent, and drag handle', () => {
    renderTaskCard();

    const card = screen.getByText('Create hero section').closest('article') as HTMLElement;
    expect(card).toHaveClass('border-l-blue-500');
    expect(within(card).getByText('Design the main landing section')).toBeInTheDocument();
    expect(within(card).getByText('Bob Smith')).toBeInTheDocument();
    expect(within(card).getByText('To Do')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drag create hero section/i })).toBeInTheDocument();
  });

  it('opens details from the card body and exposes status/edit/delete actions', async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    await user.click(screen.getByText('Create hero section').closest('article') as HTMLElement);
    expect(props.onOpen).toHaveBeenCalledWith(assignedTask);

    await user.click(screen.getByRole('button', { name: /open actions/i }));
    await user.click(screen.getByRole('button', { name: 'In Progress' }));
    expect(props.onStatusChange).toHaveBeenCalledWith(assignedTask, 'in_progress');

    await user.click(screen.getByRole('button', { name: /open actions/i }));
    await user.click(screen.getByRole('button', { name: /edit task/i }));
    expect(props.onEdit).toHaveBeenCalledWith(assignedTask);

    await user.click(screen.getByRole('button', { name: /open actions/i }));
    await user.click(screen.getByRole('button', { name: /delete task/i }));
    expect(props.onDelete).toHaveBeenCalledWith(assignedTask);
  });

  it('labels unassigned tasks clearly', () => {
    renderTaskCard({ ...assignedTask, assignee: null });

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });
});
