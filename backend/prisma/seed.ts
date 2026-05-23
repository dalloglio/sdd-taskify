import { MemberRole, PrismaClient, TaskStatus, UserRole } from '@prisma/client'

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

  console.log('Seeding projects, memberships, tasks, and comments...')
  const projectList = [
    { name: 'Website Redesign', description: 'Redesign the marketing website for Q3 launch' },
    { name: 'Mobile App v2', description: 'Second major version of the mobile app' },
    { name: 'API Refactor', description: 'Refactor backend APIs for performance and consistency' },
  ]

  const sampleTasks: Record<
    string,
    Array<{
      title: string
      description: string
      assigneeIndex: number | null
      status: TaskStatus
      comments: Array<{ authorIndex: number; text: string }>
    }>
  > = {
    'Website Redesign': [
      {
        title: 'Audit existing landing pages',
        description: 'Inventory top traffic pages and capture conversion blockers.',
        assigneeIndex: 1,
        status: TaskStatus.DONE,
        comments: [
          { authorIndex: 0, text: 'Please include mobile screenshots in the audit.' },
          { authorIndex: 1, text: 'Added mobile notes for all product pages.' },
        ],
      },
      {
        title: 'Create homepage wireframes',
        description: 'Draft a refreshed homepage structure for stakeholder review.',
        assigneeIndex: 2,
        status: TaskStatus.IN_REVIEW,
        comments: [{ authorIndex: 0, text: 'Ready for product review after copy updates.' }],
      },
      {
        title: 'Implement design tokens',
        description: 'Add typography, spacing, and color tokens for the redesign.',
        assigneeIndex: 3,
        status: TaskStatus.IN_PROGRESS,
        comments: [{ authorIndex: 3, text: 'Token naming is aligned with the new style guide.' }],
      },
      {
        title: 'Rewrite pricing copy',
        description: 'Clarify tiers and remove outdated trial language.',
        assigneeIndex: null,
        status: TaskStatus.TO_DO,
        comments: [],
      },
      {
        title: 'QA launch checklist',
        description: 'Prepare browser, analytics, and accessibility checks before launch.',
        assigneeIndex: 4,
        status: TaskStatus.TO_DO,
        comments: [{ authorIndex: 4, text: 'I will add the accessibility checks once pages stabilize.' }],
      },
    ],
    'Mobile App v2': [
      {
        title: 'Map onboarding flow',
        description: 'Document screens and state transitions for first-run onboarding.',
        assigneeIndex: 0,
        status: TaskStatus.DONE,
        comments: [{ authorIndex: 0, text: 'Flow approved for the v2 prototype.' }],
      },
      {
        title: 'Build push notification settings',
        description: 'Create user controls for task and project notification preferences.',
        assigneeIndex: 1,
        status: TaskStatus.IN_PROGRESS,
        comments: [{ authorIndex: 1, text: 'API contract is ready; wiring UI now.' }],
      },
      {
        title: 'Prototype offline task cache',
        description: 'Spike local persistence for board browsing without connectivity.',
        assigneeIndex: 2,
        status: TaskStatus.IN_REVIEW,
        comments: [
          { authorIndex: 2, text: 'Prototype handles read-only board snapshots.' },
          { authorIndex: 3, text: 'We should keep edits online-only for this release.' },
        ],
      },
      {
        title: 'Refresh app icon set',
        description: 'Replace legacy icons with the v2 visual system.',
        assigneeIndex: 4,
        status: TaskStatus.TO_DO,
        comments: [],
      },
      {
        title: 'Instrument analytics events',
        description: 'Track task creation, board moves, and comment submission.',
        assigneeIndex: 3,
        status: TaskStatus.TO_DO,
        comments: [{ authorIndex: 0, text: 'Use existing event names where possible.' }],
      },
    ],
    'API Refactor': [
      {
        title: 'Document endpoint ownership',
        description: 'List API owners and consumers before changing route boundaries.',
        assigneeIndex: 0,
        status: TaskStatus.DONE,
        comments: [{ authorIndex: 0, text: 'Ownership matrix is in the project notes.' }],
      },
      {
        title: 'Extract task query helpers',
        description: 'Move shared Prisma query construction into service helpers.',
        assigneeIndex: 1,
        status: TaskStatus.IN_PROGRESS,
        comments: [{ authorIndex: 1, text: 'Initial helper passes unit tests locally.' }],
      },
      {
        title: 'Normalize error payloads',
        description: 'Ensure REST errors use a consistent response shape.',
        assigneeIndex: 2,
        status: TaskStatus.IN_REVIEW,
        comments: [{ authorIndex: 2, text: 'Need one more pass on validation errors.' }],
      },
      {
        title: 'Add migration smoke test',
        description: 'Verify a clean database can migrate and seed from scratch.',
        assigneeIndex: 3,
        status: TaskStatus.TO_DO,
        comments: [],
      },
      {
        title: 'Review Socket.IO room checks',
        description: 'Confirm project room joins are guarded by membership checks.',
        assigneeIndex: 4,
        status: TaskStatus.TO_DO,
        comments: [{ authorIndex: 4, text: 'I will compare handlers against the notification contract.' }],
      },
    ],
  }

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

    for (const task of sampleTasks[p.name] ?? []) {
      const createdTask = await prisma.task.create({
        data: {
          projectId: project.id,
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeIndex === null ? null : users[task.assigneeIndex]!.id,
          status: task.status,
          createdById: users[0]!.id,
        },
      })

      for (const comment of task.comments) {
        await prisma.comment.create({
          data: {
            taskId: createdTask.id,
            authorId: users[comment.authorIndex]!.id,
            text: comment.text,
          },
        })
      }
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
