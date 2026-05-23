import axe from 'axe-core';
import { DndContext } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import TaskCard from '../../src/components/TaskCard';
import type { Task, User } from '../../src/types/models';
import { renderWithProviders } from '../utils';

const alice: User = { id: 'user-1', name: 'Alice Chen', role: 'product_manager' };
const task: Task = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Create hero section',
  assignee: alice,
  status: 'to_do',
  createdAt: '2026-05-06T10:00:00.000Z',
};

async function expectNoA11yViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  expect(result.violations).toEqual([]);
}

describe('component accessibility', () => {
  it('keeps common form controls accessible', async () => {
    const { container } = renderWithProviders(
      <form aria-label="Project form">
        <label>
          Project name
          <Input name="name" />
        </label>
        <Button type="submit">Create project</Button>
      </form>
    );

    await expectNoA11yViolations(container);
  });

  it('keeps task cards accessible to screen readers', async () => {
    const { container } = renderWithProviders(
      <DndContext>
        <TaskCard
          task={task}
          currentUser={alice}
          onOpen={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
          onStatusChange={() => undefined}
        />
      </DndContext>
    );

    await expectNoA11yViolations(container);
  });
});
