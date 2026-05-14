import prisma from '../db/client';

export async function createProject(payload: {
  name: string;
  description?: string;
  memberIds?: string[];
}) {
  // Duplicate name check
  const existingByName = await prisma.project.findFirst({
    where: { name: payload.name },
  });
  if (existingByName) {
    const err: any = new Error('Project name already exists');
    err.status = 409;
    throw err;
  }
  // pick a createdById from memberIds if available
  let createdById =
    payload.memberIds && payload.memberIds.length
      ? payload.memberIds[0]
      : undefined;
  if (!createdById) {
    const firstUser = await prisma.user.findFirst({ select: { id: true } });
    if (!firstUser)
      throw new Error('No users available to set as project owner');
    createdById = firstUser.id;
  }

  const project = await prisma.project.create({
    data: {
      name: payload.name,
      description: payload.description ?? null,
      createdById,
    },
  });

  if (payload.memberIds && payload.memberIds.length) {
    // verify all users exist and de-duplicate
    const uniqueMemberIds = Array.from(new Set(payload.memberIds));
    const users = await prisma.user.findMany({
      where: { id: { in: uniqueMemberIds } },
      select: { id: true },
    });
    const validIds = new Set(users.map((u) => u.id));
    const invalid = uniqueMemberIds.filter((id) => !validIds.has(id));
    if (invalid.length) {
      const err: any = new Error(
        `Invalid member assignments: ${invalid.join(', ')}`
      );
      err.status = 400;
      throw err;
    }
    const members = uniqueMemberIds.map((userId) => ({
      projectId: project.id,
      userId,
    }));
    // create many project members
    // Prisma createMany requires data array and skipDuplicates
    // but ProjectMember has composite primary key so skipDuplicates helpful
    // Use transaction to ensure consistency
    await prisma.$transaction(
      members.map((m) => prisma.projectMember.create({ data: m }))
    );
  }

  return project;
}

export async function getAllProjects() {
  return prisma.project.findMany({
    include: { members: { include: { user: true } } },
  });
}

export async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { user: true } }, tasks: true },
  });
}

export async function addProjectMember(projectId: string, userId: string) {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!project) {
    const err: any = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (existing) {
    const err: any = new Error('User is already a project member');
    err.status = 409;
    throw err;
  }
  return prisma.projectMember.create({ data: { projectId, userId } });
}

export async function getProjectMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true },
  });
}

export default {
  createProject,
  getAllProjects,
  getProject,
  addProjectMember,
  getProjectMembers,
};
