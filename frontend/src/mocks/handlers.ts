import { HttpResponse, http } from 'msw';
import {
  apiResponse,
  fixtureComments,
  fixtureProjects,
  fixtureSampleData,
  fixtureTasks,
  fixtureUsers,
} from '../../tests/fixtures/api';
import type { Comment, Project, Task, TaskStatus } from '../types/models';

const API_BASE = 'http://localhost:3000/api/v1';

let projects: Project[] = [];
let tasks: Task[] = [];
let comments: Comment[] = [];

export function resetMockApiState() {
  projects = fixtureProjects.map((project) => ({
    ...project,
    members: [...project.members],
  }));
  tasks = fixtureTasks.map((task) => ({ ...task }));
  comments = fixtureComments.map((comment) => ({ ...comment }));
}

resetMockApiState();

export const handlers = [
  http.get(`${API_BASE}/users`, () => HttpResponse.json(apiResponse(fixtureUsers))),

  http.get(`${API_BASE}/projects`, () => HttpResponse.json(apiResponse(projects))),

  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      memberIds?: string[];
    };
    const createdProject: Project = {
      id: `project-${projects.length + 1}`,
      name: body.name,
      description: body.description,
      members: fixtureUsers.filter((user) => body.memberIds?.includes(user.id)),
      createdAt: '2026-05-07T10:00:00.000Z',
    };
    projects = [createdProject, ...projects];
    return HttpResponse.json(apiResponse(createdProject), { status: 201 });
  }),

  http.get(`${API_BASE}/projects/:projectId`, ({ params }) => {
    const project = projects.find((item) => item.id === params.projectId);
    if (!project) return HttpResponse.json(apiResponse(null), { status: 404 });
    return HttpResponse.json(apiResponse(project));
  }),

  http.get(`${API_BASE}/projects/:projectId/tasks`, ({ params }) => {
    return HttpResponse.json(
      apiResponse(tasks.filter((task) => task.projectId === params.projectId))
    );
  }),

  http.post(`${API_BASE}/projects/:projectId/tasks`, async ({ params, request }) => {
    const body = (await request.json()) as {
      title: string;
      description?: string;
      assigneeId?: string | null;
      createdById?: string;
    };
    const createdTask: Task = {
      id: `task-${tasks.length + 1}`,
      projectId: String(params.projectId),
      title: body.title,
      description: body.description,
      assignee: fixtureUsers.find((user) => user.id === body.assigneeId) ?? null,
      createdBy: fixtureUsers.find((user) => user.id === body.createdById) ?? null,
      status: 'to_do',
      createdAt: '2026-05-07T11:00:00.000Z',
    };
    tasks = [createdTask, ...tasks];
    return HttpResponse.json(apiResponse(createdTask), { status: 201 });
  }),

  http.patch(`${API_BASE}/tasks/:taskId/status`, async ({ params, request }) => {
    const body = (await request.json()) as { status: TaskStatus };
    const updatedTask = tasks.find((task) => task.id === params.taskId);
    if (!updatedTask) return HttpResponse.json(apiResponse(null), { status: 404 });
    updatedTask.status = body.status;
    return HttpResponse.json(apiResponse(updatedTask));
  }),

  http.get(`${API_BASE}/tasks/:taskId/comments`, ({ params }) => {
    return HttpResponse.json(
      apiResponse(comments.filter((comment) => comment.taskId === params.taskId))
    );
  }),

  http.post(`${API_BASE}/tasks/:taskId/comments`, async ({ params, request }) => {
    const body = (await request.json()) as { text: string; authorId: string };
    const task = tasks.find((item) => item.id === params.taskId);
    const createdComment: Comment = {
      id: `comment-${comments.length + 1}`,
      taskId: String(params.taskId),
      projectId: task?.projectId,
      text: body.text,
      author: fixtureUsers.find((user) => user.id === body.authorId) ?? fixtureUsers[0],
      createdAt: '2026-05-07T12:00:00.000Z',
    };
    comments = [...comments, createdComment];
    return HttpResponse.json(apiResponse(createdComment), { status: 201 });
  }),

  http.patch(`${API_BASE}/comments/:commentId`, async ({ params, request }) => {
    const body = (await request.json()) as { text: string };
    const comment = comments.find((item) => item.id === params.commentId);
    if (!comment) return HttpResponse.json(apiResponse(null), { status: 404 });
    comment.text = body.text;
    comment.updatedAt = '2026-05-07T12:30:00.000Z';
    return HttpResponse.json(apiResponse(comment));
  }),

  http.delete(`${API_BASE}/comments/:commentId`, ({ params }) => {
    comments = comments.filter((comment) => comment.id !== params.commentId);
    return HttpResponse.json(apiResponse({ id: params.commentId }));
  }),

  http.get(`${API_BASE}/sample-data`, () => HttpResponse.json(apiResponse(fixtureSampleData))),
];
