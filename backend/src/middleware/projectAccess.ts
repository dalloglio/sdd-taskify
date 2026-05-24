import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db/client';

const uuidSchema = z.string().uuid();

function currentUserId(req: Request) {
  return (
    req.header('x-current-user-id') ||
    req.body.createdById ||
    req.body.authorId ||
    req.body.currentUserId
  );
}

function reject(res: Response, status: number, error: string) {
  res.status(status).json({ success: false, error });
}

async function isProjectMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { projectId: true },
  });

  return Boolean(membership);
}

async function projectIdForTask(taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    select: { projectId: true },
  });

  return task?.projectId ?? null;
}

async function projectIdForComment(commentId: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
    select: { task: { select: { projectId: true } } },
  });

  return comment?.task.projectId ?? null;
}

function getValidatedCurrentUserId(req: Request, res: Response) {
  const userId = currentUserId(req);
  const parsed = uuidSchema.safeParse(userId);

  if (!parsed.success) {
    reject(res, 401, 'Current user is required');
    return null;
  }

  return parsed.data;
}

async function requireMembership(
  req: Request,
  res: Response,
  next: NextFunction,
  projectId: string | null
) {
  if (!projectId) {
    reject(res, 404, 'Resource not found');
    return;
  }

  const userId = getValidatedCurrentUserId(req, res);
  if (!userId) return;

  if (!(await isProjectMember(projectId, userId))) {
    reject(res, 403, 'Current user is not a project member');
    return;
  }

  next();
}

export function requireProjectMember() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = uuidSchema.safeParse(req.params.projectId);
    if (!parsed.success) {
      reject(res, 400, 'Invalid projectId');
      return;
    }

    await requireMembership(req, res, next, parsed.data);
  };
}

export function requireTaskProjectMember() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = uuidSchema.safeParse(req.params.taskId);
    if (!parsed.success) {
      reject(res, 400, 'Invalid taskId');
      return;
    }

    await requireMembership(
      req,
      res,
      next,
      await projectIdForTask(parsed.data)
    );
  };
}

export function requireCommentProjectMember() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = uuidSchema.safeParse(req.params.commentId);
    if (!parsed.success) {
      reject(res, 400, 'Invalid commentId');
      return;
    }

    await requireMembership(
      req,
      res,
      next,
      await projectIdForComment(parsed.data)
    );
  };
}
