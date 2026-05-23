import { Request, Response } from 'express';
import * as commentService from '../services/commentService';
import {
  emitCommentAdded,
  emitCommentDeleted,
  emitCommentUpdated,
} from '../realtime/handlers';
import { fail, ok } from '../utils/response';

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    role: typeof user.role === 'string' ? user.role.toLowerCase() : user.role,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export function mapComment(comment: any) {
  return {
    id: comment.id,
    taskId: comment.taskId,
    projectId: comment.task?.projectId,
    text: comment.text,
    author: mapUser(comment.author),
    createdAt: toIso(comment.createdAt),
    updatedAt: toIso(comment.updatedAt),
  };
}

function getCurrentUserId(req: Request) {
  const header = req.header('x-current-user-id');
  return header || req.body.authorId || req.body.currentUserId;
}

function errorStatus(err: any) {
  return typeof err?.status === 'number' ? err.status : 400;
}

export async function createComment(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const comment = await commentService.createComment(taskId, {
      text: req.body.text,
      authorId: getCurrentUserId(req),
    });
    const mapped = mapComment(comment);
    emitCommentAdded(mapped.projectId, mapped);
    return ok(res.status(201), mapped);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to create comment', errorStatus(err));
  }
}

export async function listComments(req: Request, res: Response) {
  try {
    const { taskId } = req.params as { taskId: string };
    const comments = await commentService.getCommentsByTask(taskId);
    return ok(res, comments.map(mapComment));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to list comments', errorStatus(err));
  }
}

export async function updateComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params as { commentId: string };
    const comment = await commentService.updateComment(commentId, {
      text: req.body.text,
      currentUserId: getCurrentUserId(req),
    });
    const mapped = mapComment(comment);
    emitCommentUpdated(mapped.projectId, mapped);
    return ok(res, mapped);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to update comment', errorStatus(err));
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params as { commentId: string };
    const comment = await commentService.deleteComment(commentId, {
      currentUserId: getCurrentUserId(req),
    });
    const mapped = mapComment(comment);
    emitCommentDeleted(mapped.projectId, {
      commentId: mapped.id,
      taskId: mapped.taskId,
      projectId: mapped.projectId,
      deletedBy: mapped.author,
      timestamp: new Date().toISOString(),
    });
    return res.status(204).send();
  } catch (err: any) {
    return fail(res, err.message || 'Failed to delete comment', errorStatus(err));
  }
}

export default {
  createComment,
  listComments,
  updateComment,
  deleteComment,
};
