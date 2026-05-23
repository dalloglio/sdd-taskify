import { mapComment } from '../../src/controllers/commentController';
import { mapTask } from '../../src/controllers/taskController';

describe('API contract response shapes', () => {
  it('maps tasks to the documented task contract shape', () => {
    const mapped = mapTask({
      id: 'task-1',
      projectId: 'project-1',
      title: 'Design landing page',
      description: 'Create mockups',
      status: 'IN_PROGRESS',
      assignee: {
        id: 'user-2',
        name: 'Bob Smith',
        role: 'ENGINEER',
        avatarUrl: null,
      },
      createdBy: {
        id: 'user-1',
        name: 'Alice Chen',
        role: 'PRODUCT_MANAGER',
        avatarUrl: null,
      },
      _count: { comments: 3 },
      comments: [
        {
          id: 'comment-1',
          text: 'Prioritize mobile',
          author: {
            id: 'user-2',
            name: 'Bob Smith',
            role: 'ENGINEER',
            avatarUrl: null,
          },
          createdAt: new Date('2026-05-06T10:30:00.000Z'),
          updatedAt: new Date('2026-05-06T10:30:00.000Z'),
        },
      ],
      createdAt: new Date('2026-05-06T10:00:00.000Z'),
      updatedAt: new Date('2026-05-06T10:15:00.000Z'),
    });

    expect(mapped).toEqual({
      id: 'task-1',
      projectId: 'project-1',
      title: 'Design landing page',
      description: 'Create mockups',
      status: 'in_progress',
      assignee: {
        id: 'user-2',
        name: 'Bob Smith',
        role: 'engineer',
        avatarUrl: undefined,
      },
      createdBy: {
        id: 'user-1',
        name: 'Alice Chen',
        role: 'product_manager',
        avatarUrl: undefined,
      },
      commentCount: 3,
      comments: [
        {
          id: 'comment-1',
          text: 'Prioritize mobile',
          author: {
            id: 'user-2',
            name: 'Bob Smith',
            role: 'engineer',
            avatarUrl: undefined,
          },
          createdAt: '2026-05-06T10:30:00.000Z',
          updatedAt: '2026-05-06T10:30:00.000Z',
        },
      ],
      createdAt: '2026-05-06T10:00:00.000Z',
      updatedAt: '2026-05-06T10:15:00.000Z',
    });
  });

  it('maps unassigned tasks as null assignee for the task contract', () => {
    expect(
      mapTask({
        id: 'task-2',
        projectId: 'project-1',
        title: 'Triage backlog',
        description: null,
        status: 'TO_DO',
        assignee: null,
        createdBy: null,
        comments: [],
        createdAt: '2026-05-06T10:00:00.000Z',
        updatedAt: '2026-05-06T10:00:00.000Z',
      })
    ).toEqual(
      expect.objectContaining({
        description: undefined,
        status: 'to_do',
        assignee: null,
        createdBy: null,
        comments: [],
      })
    );
  });

  it('maps comments to the documented comment and notification event shape', () => {
    expect(
      mapComment({
        id: 'comment-1',
        taskId: 'task-1',
        text: 'Looks good',
        author: {
          id: 'user-1',
          name: 'Alice Chen',
          role: 'PRODUCT_MANAGER',
          avatarUrl: null,
        },
        task: { projectId: 'project-1' },
        createdAt: new Date('2026-05-06T10:30:00.000Z'),
        updatedAt: new Date('2026-05-06T10:35:00.000Z'),
      })
    ).toEqual({
      id: 'comment-1',
      taskId: 'task-1',
      projectId: 'project-1',
      text: 'Looks good',
      author: {
        id: 'user-1',
        name: 'Alice Chen',
        role: 'product_manager',
        avatarUrl: undefined,
      },
      createdAt: '2026-05-06T10:30:00.000Z',
      updatedAt: '2026-05-06T10:35:00.000Z',
    });
  });
});
