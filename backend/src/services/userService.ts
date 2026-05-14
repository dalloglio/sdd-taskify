import prisma from '../db/client';

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, avatarUrl: true, role: true },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUsersByIds(ids: string[]) {
  return prisma.user.findMany({ where: { id: { in: ids } } });
}

export default {
  getAllUsers,
  getUserById,
  getUsersByIds,
};
