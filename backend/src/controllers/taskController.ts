import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { prismaToStatus } from '../services/taskService';
import { TaskStatus } from '../types/tasks';
import { fail, ok } from '../utils/response';
import {
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskMoved,
  emitTaskUpdated,
} from '../realtime/handlers';

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: typeof user.role === 'string' ? user.role.toLowerCase() : user.role,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export function mapTask(task: any) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? undefined,
    status: prismaToStatus[task.status as keyof typeof prismaToStatus],
    assignee: mapUser(task.assignee),
    createdBy: mapUser(task.createdBy),
    commentCount: task._count?.comments,
    comments: (task.comments || []).map((comment: any) => ({
      id: comment.id,
      text: comment.text,
      author: mapUser(comment.author),
      createdAt: toIso(comment.createdAt),
      updatedAt: toIso(comment.updatedAt),
    })),
    createdAt: toIso(task.createdAt),
    updatedAt: toIso(task.updatedAt),
  };
}

function getCurrentUserId(req: Request) {
  const header = req.header('x-current-user-id');
  return header || req.body.createdById;
}

function errorStatus(err: any) {
  return typeof err?.status === 'number' ? err.status : 400;
}

export async function createTask(req: Request, res: Response) {
  try {
    const { projectId } = req.params as { projectId: string };
    const task = await taskService.createTask(projectId, {
      title: req.body.title,
      description: req.body.description,
      assigneeId: req.body.assigneeId,
      status: req.body.status,
      createdById: getCurrentUserId(req),
    });
    const mapped = mapTask(task);
    emitTaskCreated(projectId, mapped);
    return ok(res.status(201), mapped);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to create task', errorStatus(err));
  }
}

export async function listTasks(req: Request, res: Response) {
  try {
    const { projectId } = req.params as { projectId: string };
    const filters: {
      status?: TaskStatus;
      assigneeId?: string;
      limit?: number;
      offset?: number;
    } = {};

    if (req.query.status) filters.status = req.query.status as TaskStatus;
    if (req.query.assigneeId) filters.assigneeId = req.query.assigneeId as string;
    if (req.query.limit) filters.limit = Number(req.query.limit);
    if (req.query.offset) filters.offset = Number(req.query.offset);

    const tasks = await taskService.getTasksByProject(projectId, filters);
    return ok(res, tasks.map(mapTask));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to list tasks', errorStatus(err));
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const task = await taskService.getTask(taskId);
    return ok(res, mapTask(task));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to get task', errorStatus(err));
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const task = await taskService.updateTask(taskId, {
      title: req.body.title,
      description: req.body.description,
      assigneeId: req.body.assigneeId,
      status: req.body.status,
    });
    const mapped = mapTask(task);
    emitTaskUpdated(mapped.projectId, mapped);
    return ok(res, mapped);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to update task', errorStatus(err));
  }
}

export async function updateTaskStatus(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const { task, previousStatus } = await taskService.updateTaskStatus(
      taskId,
      req.body.status
    );
    const mapped = mapTask(task);
    emitTaskMoved(mapped.projectId, {
      taskId: mapped.id,
      projectId: mapped.projectId,
      fromStatus: previousStatus,
      toStatus: mapped.status,
      timestamp: new Date().toISOString(),
    });
    return ok(res, mapped);
  } catch (err: any) {
    return fail(
      res,
      err.message || 'Failed to update task status',
      errorStatus(err)
    );
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const [task] = await taskService.deleteTask(taskId);
    emitTaskDeleted(task.projectId, {
      taskId: task.id,
      projectId: task.projectId,
      timestamp: new Date().toISOString(),
    });
    return res.status(204).send();
  } catch (err: any) {
    return fail(res, err.message || 'Failed to delete task', errorStatus(err));
  }
}

export default {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
