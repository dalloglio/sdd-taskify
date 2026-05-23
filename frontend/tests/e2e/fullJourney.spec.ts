import { expect, test } from 'playwright/test';

const users = [
  { id: 'user-1', name: 'Alice Chen', role: 'product_manager' },
  { id: 'user-2', name: 'Bob Smith', role: 'engineer' },
  { id: 'user-3', name: 'Carol Johnson', role: 'engineer' },
  { id: 'user-4', name: 'Dave Wilson', role: 'engineer' },
  { id: 'user-5', name: 'Emma Lee', role: 'engineer' },
];

const project = {
  id: 'project-1',
  name: 'Website Redesign',
  members: users,
  createdAt: '2026-05-06T10:00:00.000Z',
  isSample: true,
};

test('completes the primary project, task, and comment journey', async ({ page }) => {
  let tasks = [
    {
      id: 'task-1',
      projectId: project.id,
      title: 'Create hero section',
      description: 'Design the main landing section',
      assignee: users[1],
      status: 'to_do',
      createdAt: '2026-05-06T10:00:00.000Z',
    },
  ];
  let comments = [
    {
      id: 'comment-1',
      taskId: 'task-1',
      projectId: project.id,
      text: 'Initial direction looks good.',
      author: users[0],
      createdAt: '2026-05-06T10:30:00.000Z',
    },
  ];

  await page.route('**/api/v1/users', (route) =>
    route.fulfill({ json: { success: true, data: users } })
  );
  await page.route('**/api/v1/projects', (route) =>
    route.fulfill({ json: { success: true, data: [project] } })
  );
  await page.route('**/api/v1/sample-data', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          usersCount: 5,
          projectsCount: 3,
          tasksCount: 15,
          commentsCount: 6,
          sampleProjectNames: ['Website Redesign', 'Mobile App v2', 'API Refactor'],
          projects: [
            {
              id: project.id,
              name: project.name,
              membersCount: 5,
              tasksCount: 1,
              commentsCount: 1,
            },
          ],
        },
      },
    })
  );
  await page.route('**/api/v1/projects/project-1', (route) =>
    route.fulfill({ json: { success: true, data: project } })
  );
  await page.route('**/api/v1/projects/project-1/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON();
      const task = {
        id: 'task-2',
        projectId: project.id,
        title: body.title,
        description: body.description,
        assignee: users.find((user) => user.id === body.assigneeId) ?? null,
        status: 'to_do',
        createdAt: '2026-05-07T11:00:00.000Z',
      };
      tasks = [task, ...tasks];
      await route.fulfill({ json: { success: true, data: task } });
      return;
    }
    await route.fulfill({ json: { success: true, data: tasks } });
  });
  await page.route('**/api/v1/tasks/task-1/status', async (route) => {
    const body = await route.request().postDataJSON();
    tasks = tasks.map((task) => (task.id === 'task-1' ? { ...task, status: body.status } : task));
    await route.fulfill({ json: { success: true, data: tasks.find((task) => task.id === 'task-1') } });
  });
  await page.route('**/api/v1/tasks/task-1/comments', async (route) => {
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON();
      const comment = {
        id: 'comment-2',
        taskId: 'task-1',
        projectId: project.id,
        text: body.text,
        author: users[0],
        createdAt: '2026-05-07T12:00:00.000Z',
      };
      comments = [...comments, comment];
      await route.fulfill({ json: { success: true, data: comment } });
      return;
    }
    await route.fulfill({ json: { success: true, data: comments } });
  });

  await page.goto('http://127.0.0.1:4174/user-select');
  await page.getByRole('button', { name: /alice chen/i }).click();
  await page.getByText('Website Redesign').click();

  await expect(page.getByRole('heading', { name: /kanban board/i })).toBeVisible();
  await page.getByRole('button', { name: /add task/i }).click();
  await page.getByLabel(/^title$/i).fill('Write launch copy');
  await page.getByLabel(/assignee/i).selectOption('user-2');
  await page.getByRole('button', { name: /create task/i }).click();
  await expect(page.getByText('Write launch copy')).toBeVisible();

  await page.getByRole('button', { name: /open actions for create hero section/i }).click();
  await page.getByRole('button', { name: 'In Progress' }).click();

  await page.getByText('Create hero section').click();
  await page.getByLabel(/add comment/i).fill('Ready for design review.');
  await page.getByRole('button', { name: /add comment/i }).click();
  await expect(page.getByText('Ready for design review.')).toBeVisible();
});
