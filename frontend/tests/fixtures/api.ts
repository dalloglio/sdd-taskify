import type { Comment, Project, Task, User } from '../../src/types/models';
import type { SampleDataSummary } from '../../src/types/sampleData';

export const fixtureUsers: User[] = [
  { id: 'user-1', name: 'Alice Chen', role: 'product_manager' },
  { id: 'user-2', name: 'Bob Smith', role: 'engineer' },
  { id: 'user-3', name: 'Carol Johnson', role: 'engineer' },
  { id: 'user-4', name: 'Dave Wilson', role: 'engineer' },
  { id: 'user-5', name: 'Emma Lee', role: 'engineer' },
];

export const fixtureProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Modernize the marketing website',
    members: fixtureUsers,
    createdAt: '2026-05-06T10:00:00.000Z',
    isSample: true,
  },
  {
    id: 'project-2',
    name: 'Mobile App v2',
    members: fixtureUsers.slice(1),
    createdAt: '2026-05-06T10:00:00.000Z',
    isSample: true,
  },
  {
    id: 'project-3',
    name: 'API Refactor',
    members: [fixtureUsers[0], fixtureUsers[2], fixtureUsers[3]],
    createdAt: '2026-05-06T10:00:00.000Z',
    isSample: true,
  },
];

export const fixtureTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Create hero section',
    description: 'Design the main landing section',
    assignee: fixtureUsers[1],
    status: 'to_do',
    createdAt: '2026-05-06T10:00:00.000Z',
  },
  {
    id: 'task-2',
    projectId: 'project-1',
    title: 'Review color palette',
    assignee: null,
    status: 'in_review',
    createdAt: '2026-05-06T11:00:00.000Z',
  },
];

export const fixtureComments: Comment[] = [
  {
    id: 'comment-1',
    taskId: 'task-1',
    projectId: 'project-1',
    text: 'Initial direction looks good.',
    author: fixtureUsers[0],
    createdAt: '2026-05-06T10:30:00.000Z',
  },
];

export const fixtureSampleData: SampleDataSummary = {
  usersCount: 5,
  projectsCount: 3,
  tasksCount: 15,
  commentsCount: 6,
  sampleProjectNames: ['Website Redesign', 'Mobile App v2', 'API Refactor'],
  projects: fixtureProjects.map((project) => ({
    id: project.id,
    name: project.name,
    membersCount: project.members.length,
    tasksCount: project.id === 'project-1' ? fixtureTasks.length : 5,
    commentsCount: project.id === 'project-1' ? fixtureComments.length : 2,
  })),
};

export function apiResponse<T>(data: T) {
  return { success: true, data };
}
