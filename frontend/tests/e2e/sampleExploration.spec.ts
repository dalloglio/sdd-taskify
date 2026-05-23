import { expect, test } from 'playwright/test';

test('launches app, selects a sample user, and explores projects', async ({
  page,
}) => {
  await page.route('**/api/v1/users', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: [
          { id: 'user-1', name: 'Alice Chen', role: 'product_manager' },
          { id: 'user-2', name: 'Bob Smith', role: 'engineer' },
          { id: 'user-3', name: 'Carol Johnson', role: 'engineer' },
          { id: 'user-4', name: 'Dave Wilson', role: 'engineer' },
          { id: 'user-5', name: 'Emma Lee', role: 'engineer' },
        ],
      },
    });
  });

  await page.route('**/api/v1/projects', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: [
          {
            id: 'project-1',
            name: 'Website Redesign',
            members: [{ id: 'user-1', name: 'Alice Chen' }],
            createdAt: '2026-05-06T10:00:00.000Z',
            isSample: true,
          },
          {
            id: 'project-2',
            name: 'Mobile App v2',
            members: [{ id: 'user-2', name: 'Bob Smith' }],
            createdAt: '2026-05-06T10:00:00.000Z',
            isSample: true,
          },
          {
            id: 'project-3',
            name: 'API Refactor',
            members: [{ id: 'user-3', name: 'Carol Johnson' }],
            createdAt: '2026-05-06T10:00:00.000Z',
            isSample: true,
          },
        ],
      },
    });
  });

  await page.route('**/api/v1/sample-data', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          usersCount: 5,
          projectsCount: 3,
          tasksCount: 15,
          commentsCount: 15,
          sampleProjectNames: [
            'Website Redesign',
            'Mobile App v2',
            'API Refactor',
          ],
          projects: [
            {
              id: 'project-1',
              name: 'Website Redesign',
              membersCount: 5,
              tasksCount: 5,
              commentsCount: 3,
            },
          ],
        },
      },
    });
  });

  await page.goto('http://127.0.0.1:4174/user-select');
  await expect(page.getByText('5 Predefined Users Available')).toBeVisible();
  await page.getByRole('button', { name: /alice chen/i }).click();

  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(page.getByText('Sample workspace loaded')).toBeVisible();
  await expect(page.getByText('Website Redesign')).toBeVisible();
  await expect(page.getByText('Mobile App v2')).toBeVisible();
  await expect(page.getByText('API Refactor')).toBeVisible();
  await expect(page.getByText('Sample').first()).toBeVisible();
});
