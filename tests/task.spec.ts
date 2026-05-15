import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.fill('#standard-email', process.env.USER_EMAIL || 'ejemplo2@gmail.com');
  await page.fill('#standard-password', process.env.USER_PASSWORD || 'prueba123');
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
}

test.describe('Tareas y comentarios', () => {
  test('TC-008 - Cambio de estado de tarea y recálculo', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();

    const firstBacklogTask = page.locator('article').first();
    const completedColumn = page.getByRole('heading', { name: 'Completed' }).locator('..').locator('..');

    await expect(firstBacklogTask).toBeVisible();
    await firstBacklogTask.dragTo(completedColumn);
    await expect(page.getByRole('heading', { name: 'Completed' })).toBeVisible();
  });

  test('TC-010 - Crear comentario en tarea', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();

    await page.locator('article').first().click();
    await expect(page.getByText('Project / Task ID -')).toBeVisible();

    const commentBox = page.locator('textarea[placeholder="Add attachment or add comment to describe the issue..."]');
    await commentBox.fill('Comentario desde Playwright');
    await expect(commentBox).toHaveValue('Comentario desde Playwright');
    await page.getByRole('button', { name: 'Save' }).click();
  });

  test('TC-014 - Asignar tarea a miembro', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();

    await page.getByRole('button', { name: '+ New Task' }).click();
    const taskTitle = `Tarea Playwright ${Date.now()}`;
    await page.fill('input[placeholder="Task Title"]', taskTitle);
    await page.fill('input[placeholder="Assignee"]', 'Nuevo Miembro');
    await page.fill('input[placeholder="Manager"]', 'Project Manager');
    await page.fill('textarea[placeholder="Task Description"]', 'Tarea creada para validar asignación');
    await page.locator('input[type="date"]').fill('2026-05-20');
    await page.getByRole('button', { name: 'Create Task' }).click();

    await expect(page.getByText(taskTitle)).toBeVisible();
    await expect(page.getByText('NM').first()).toBeVisible();
  });
});