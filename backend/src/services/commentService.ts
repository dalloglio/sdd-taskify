import prisma from '../db/client';

const commentInclude = {
  author: true,
  task: {
    select: {
      id: true,
      projectId: true,
      deletedAt: true,
      project: { select: { members: true } },
    },
  },
};

function serviceError(message: string, status: number) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

async function getTaskOrThrow(taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    include: { project: { select: { members: true } } },
  });

  if (!task) {
    throw serviceError('Task not found', 404);
  }

  return task;
}

function assertProjectMember(members: { userId: string }[], userId: string) {
  if (!members.some((member) => member.userId === userId)) {
    throw serviceError('Comment author must be a project member', 403);
  }
}

async function getCommentOrThrow(commentId: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
    include: commentInclude,
  });

  if (!comment) {
    throw serviceError('Comment not found', 404);
  }

  return comment;
}

function assertAuthor(comment: { authorId: string }, userId: string) {
  if (comment.authorId !== userId) {
    throw serviceError('Only the comment author can modify this comment', 403);
  }
}

export async function createComment(
  taskId: string,
  payload: { text: string; authorId: string }
) {
  const task = await getTaskOrThrow(taskId);
  assertProjectMember(task.project.members, payload.authorId);

  return prisma.comment.create({
    data: {
      taskId,
      authorId: payload.authorId,
      text: payload.text,
    },
    include: commentInclude,
  });
}

export async function getCommentsByTask(taskId: string) {
  await getTaskOrThrow(taskId);

  return prisma.comment.findMany({
    where: { taskId, deletedAt: null },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateComment(
  commentId: string,
  payload: { text: string; currentUserId: string }
) {
  const existing = await getCommentOrThrow(commentId);
  assertAuthor(existing, payload.currentUserId);

  return prisma.comment.update({
    where: { id: commentId },
    data: { text: payload.text },
    include: commentInclude,
  });
}

export async function deleteComment(
  commentId: string,
  payload: { currentUserId: string }
) {
  const existing = await getCommentOrThrow(commentId);
  assertAuthor(existing, payload.currentUserId);

  return prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
    include: commentInclude,
  });
}

export default {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
};
