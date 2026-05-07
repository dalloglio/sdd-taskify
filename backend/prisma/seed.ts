import { MemberRole, PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing data...')
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding users...')
  const users = []
  users.push(
    await prisma.user.create({ data: { name: 'Alice Chen', role: UserRole.PRODUCT_MANAGER } })
  )
  users.push(await prisma.user.create({ data: { name: 'Bob Smith', role: UserRole.ENGINEER } }))
  users.push(await prisma.user.create({ data: { name: 'Carol Johnson', role: UserRole.ENGINEER } }))
  users.push(await prisma.user.create({ data: { name: 'Dave Wilson', role: UserRole.ENGINEER } }))
  users.push(await prisma.user.create({ data: { name: 'Emma Lee', role: UserRole.ENGINEER } }))

  console.log('Seeding projects and memberships...')
  const projectList = [
    { name: 'Website Redesign', description: 'Redesign the marketing website for Q3 launch' },
    { name: 'Mobile App v2', description: 'Second major version of the mobile app' },
    { name: 'API Refactor', description: 'Refactor backend APIs for performance and consistency' },
  ]

  for (const p of projectList) {
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        createdById: users[0]!.id,
      },
    })

    // Add all users as members for demo purposes
    for (const u of users) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: u.id,
          role: MemberRole.MEMBER,
        },
      })
    }
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
