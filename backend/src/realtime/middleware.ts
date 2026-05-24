import { Socket } from 'socket.io';
import { z } from 'zod';
import prisma from '../db/client';

const uuidSchema = z.string().uuid();

function firstString(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
}

export function getSocketUserId(socket: Socket) {
  const authUserId = firstString(socket.handshake.auth?.userId);
  const queryUserId = firstString(socket.handshake.query.userId);
  const parsed = uuidSchema.safeParse(authUserId || queryUserId);
  return parsed.success ? parsed.data : null;
}

export async function validateProjectMembership(
  socket: Socket,
  projectId: string
) {
  const parsedProjectId = uuidSchema.safeParse(projectId);
  const userId = getSocketUserId(socket);

  if (!parsedProjectId.success || !userId) {
    return false;
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: parsedProjectId.data, userId } },
    select: { projectId: true },
  });

  return Boolean(membership);
}
