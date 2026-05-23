import prisma from '../db/client';

export const SAMPLE_PROJECT_NAMES = [
  'Website Redesign',
  'Mobile App v2',
  'API Refactor',
];

export async function getSampleDataSummary() {
  const [usersCount, projectsCount, tasksCount, commentsCount, projects] =
    await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count({ where: { deletedAt: null } }),
      prisma.comment.count({ where: { deletedAt: null } }),
      prisma.project.findMany({
        where: { name: { in: SAMPLE_PROJECT_NAMES } },
        include: {
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
          tasks: {
            where: { deletedAt: null },
            select: {
              id: true,
              _count: {
                select: {
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

  return {
    usersCount,
    projectsCount,
    tasksCount,
    commentsCount,
    sampleProjectNames: SAMPLE_PROJECT_NAMES,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      membersCount: project._count.members,
      tasksCount: project._count.tasks,
      commentsCount: project.tasks.reduce(
        (total, task) => total + task._count.comments,
        0
      ),
    })),
  };
}

export default {
  getSampleDataSummary,
};
