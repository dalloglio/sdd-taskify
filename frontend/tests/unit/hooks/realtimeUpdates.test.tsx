import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBoardUpdates } from '../../../src/hooks/useBoardUpdates';
import { useCommentUpdates } from '../../../src/hooks/useCommentUpdates';
import type { Comment, Task, User } from '../../../src/types/models';

let socketHandlers: Record<string, (payload?: unknown) => void> = {};

vi.mock('../../../src/hooks/useSocket', () => ({
  useSocket: vi.fn((_projectId, handlers) => {
    socketHandlers = handlers;
  }),
}));

const alice: User = { id: 'user-1', name: 'Alice Chen', role: 'product_manager' };

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('real-time update hooks', () => {
  beforeEach(() => {
    socketHandlers = {};
  });

  it('updates task cache for board socket events', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const task: Task = {
      id: 'task-1',
      projectId: 'project-1',
      title: 'Create hero section',
      status: 'to_do',
      createdAt: '2026-05-06T10:00:00.000Z',
    };
    queryClient.setQueryData<Task[]>(['tasks', 'project-1'], [task]);

    const { result } = renderHook(() => useBoardUpdates('project-1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => socketHandlers['task:moved']({ taskId: 'task-1', toStatus: 'done' }));
    expect(queryClient.getQueryData<Task[]>(['tasks', 'project-1'])?.[0].status).toBe('done');
    expect(result.current.message).toBe('Task moved');

    act(() => socketHandlers['task:deleted']({ taskId: 'task-1' }));
    expect(queryClient.getQueryData<Task[]>(['tasks', 'project-1'])).toEqual([]);

    act(() => socketHandlers['task:created']({ ...task, id: 'task-2' }));
    expect(queryClient.getQueryData<Task[]>(['tasks', 'project-1'])?.[0].id).toBe('task-2');

    act(() => socketHandlers['task:error']());
    expect(result.current.message).toBe('Board update failed');
  });

  it('updates comment cache only for the active task', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const comment: Comment = {
      id: 'comment-1',
      taskId: 'task-1',
      projectId: 'project-1',
      text: 'Initial direction',
      author: alice,
      createdAt: '2026-05-06T10:30:00.000Z',
    };
    queryClient.setQueryData<Comment[]>(['comments', 'task-1'], [comment]);

    const { result } = renderHook(() => useCommentUpdates('project-1', 'task-1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() =>
      socketHandlers['comment:updated']({
        ...comment,
        text: 'Updated direction',
      })
    );
    expect(queryClient.getQueryData<Comment[]>(['comments', 'task-1'])?.[0].text).toBe(
      'Updated direction'
    );

    act(() =>
      socketHandlers['comment:added']({
        ...comment,
        id: 'comment-2',
        text: 'New feedback',
      })
    );
    expect(queryClient.getQueryData<Comment[]>(['comments', 'task-1'])).toHaveLength(2);
    expect(result.current.message).toBe('Comment added');

    act(() => socketHandlers['comment:deleted']({ commentId: 'comment-1', taskId: 'task-1' }));
    expect(queryClient.getQueryData<Comment[]>(['comments', 'task-1'])?.[0].id).toBe(
      'comment-2'
    );

    act(() =>
      socketHandlers['comment:added']({
        ...comment,
        id: 'comment-3',
        taskId: 'other-task',
      })
    );
    expect(queryClient.getQueryData<Comment[]>(['comments', 'task-1'])).toHaveLength(1);

    act(() => socketHandlers['comment:error']());
    expect(result.current.message).toBe('Comment update failed');
  });
});
