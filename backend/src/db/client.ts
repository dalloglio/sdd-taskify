import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function connectDb() {
  try {
    await prisma.$connect()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Prisma connect error', err)
    throw err
  }
}

export async function disconnectDb() {
  try {
    await prisma.$disconnect()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Prisma disconnect error', err)
  }
}

export default prisma
