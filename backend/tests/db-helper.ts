import prisma from '../src/db/client';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const ROLLBACK = Symbol('ROLLBACK_TEST_TRANSACTION');

export async function withRollback<T>(run: (tx: TxClient) => Promise<T>) {
  let result: T;

  try {
    await prisma.$transaction(async (tx) => {
      result = await run(tx);
      throw ROLLBACK;
    });
  } catch (err) {
    if (err !== ROLLBACK) {
      throw err;
    }
  }

  return result!;
}

export async function truncateTaskifyTables() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}
