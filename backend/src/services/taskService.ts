import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import prisma from '../db/client';
import { TaskStatus } from '../types/tasks';

const taskInclude = {
  assignee: true,
  createdBy: true,
  _count: { select: { comments: true } },
};

const taskDetailInclude = {
  assignee: true,
  createdBy: true,
  comments: {
    where: { deletedAt: null },
    include: { author: true },
    orderBy: { createdAt: 'asc' as const },
  },
};

const statusToPrisma: Record<TaskStatus, PrismaTaskStatus> = {
  to_do: PrismaTaskStatus.TO_DO,
  in_progress: PrismaTaskStatus.IN_PROGRESS,
  in_review: PrismaTaskStatus.IN_REVIEW,
  done: PrismaTaskStatus.DONE,
};

export const prismaToStatus: Record<PrismaTaskStatus, TaskStatus> = {
  [PrismaTaskStatus.TO_DO]: 'to_do',
  [PrismaTaskStatus.IN_PROGRESS]: 'in_progress',
  [PrismaTaskStatus.IN_REVIEW]: 'in_review',
  [PrismaTaskStatus.DONE]: 'done',
};

function serviceError(message: string, status: number) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function toPrismaStatus(status: TaskStatus) {
  return statusToPrisma[status];
}

function buildTaskData(data: {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus;
}) {
  const update: {
    title?: string;
    description?: string | null;
    assigneeId?: string | null;
    status?: PrismaTaskStatus;
  } = {};

  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.assigneeId !== undefined) update.assigneeId = data.assigneeId;
  if (data.status !== undefined) update.status = toPrismaStatus(data.status);

  return update;
}

async function getProjectOrThrow(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    throw serviceError('Project not found', 404);
  }

  return project;
}

function assertProjectMember(
  members: { userId: string }[],
  userId: string,
  message = 'Assignee must be a project member'
) {
  if (!members.some((member) => member.userId === userId)) {
    throw serviceError(message, 409);
  }
}

function resolveCreatorId(
  project: { createdById: string; members: { userId: string }[] },
  createdById?: string,
  assigneeId?: string | null
) {
  const resolved = createdById ?? assigneeId ?? project.members[0]?.userId;

  if (!resolved) {
    return project.createdById;
  }

  assertProjectMember(project.members, resolved, 'Creator must be a project member');
  return resolved;
}

export async function createTask(
  projectId: string,
  payload: {
    title: string;
    description?: string;
    assigneeId?: string | null;
    status?: TaskStatus;
    createdById?: string;
  }
) {
  const project = await getProjectOrThrow(projectId);

  if (payload.assigneeId) {
    assertProjectMember(project.members, payload.assigneeId);
  }

  const createdById = resolveCreatorId(
    project,
    payload.createdById,
    payload.assigneeId
  );

  return prisma.task.create({
    data: {
      projectId,
      title: payload.title,
      description: payload.description ?? null,
      assigneeId: payload.assigneeId ?? null,
      status: toPrismaStatus(payload.status ?? 'to_do'),
      createdById,
    },
    include: taskDetailInclude,
  });
}

export async function getTask(taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    include: taskDetailInclude,
  });

  if (!task) {
    throw serviceError('Task not found', 404);
  }

  return task;
}

export async function getTasksByProject(
  projectId: string,
  filters: { status?: TaskStatus; assigneeId?: string; limit?: number; offset?: number } = {}
) {
  await getProjectOrThrow(projectId);

  return prisma.task.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(filters.status ? { status: toPrismaStatus(filters.status) } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: taskInclude,
    orderBy: { createdAt: 'asc' },
    take: filters.limit ?? 100,
    skip: filters.offset ?? 0,
  });
}

export async function updateTask(
  taskId: string,
  payload: {
    title?: string;
    description?: string | null;
    assigneeId?: string | null;
    status?: TaskStatus;
  }
) {
  const existing = await getTask(taskId);

  if (payload.assigneeId) {
    const project = await getProjectOrThrow(existing.projectId);
    assertProjectMember(project.members, payload.assigneeId);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: buildTaskData(payload),
    include: taskDetailInclude,
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const existing = await getTask(taskId);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: toPrismaStatus(status) },
    include: taskDetailInclude,
  });

  return { task: updated, previousStatus: prismaToStatus[existing.status] };
}

export async function deleteTask(taskId: string) {
  await getTask(taskId);

  return prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
      include: taskDetailInclude,
    }),
    prisma.comment.updateMany({
      where: { taskId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
  ]);
}

export default {
  createTask,
  getTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
