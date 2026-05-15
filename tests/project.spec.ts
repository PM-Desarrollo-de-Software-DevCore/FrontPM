import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.fill('#standard-email', process.env.ADMIN_EMAIL || 'admin@test.com');
  await page.fill('#standard-password', process.env.ADMIN_PASSWORD || 'TestAdmin123');
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
}

test.describe('Proyectos', () => {
  test('TC-003 - Crear nuevo proyecto', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    await page.click('button:has-text("+ New Project")');

    const projectName = `Proyecto Test ${Date.now()}`;
    await page.fill('input[placeholder="Project Name"]', projectName);
    await page.fill('textarea[placeholder="Project Description"]', 'Descripción del proyecto');
    await page.fill('input[placeholder="Project Manager"]', 'Test Manager');

    const dateFields = page.locator('input[type="date"]');
    await dateFields.nth(0).fill('2026-05-13');
    await dateFields.nth(1).fill('2026-08-13');
    await page.fill('input[placeholder="Team Members (comma separated)"]', 'Team 1, Team 2');

    await page.click('button:has-text("Create Project")');
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
  });

  test('TC-007 - Visualización vista unificada de proyecto', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    const firstProject = page.locator('article').first();
    await expect(firstProject.getByRole('heading')).toBeVisible();
    await expect(firstProject.getByText('Deadline :')).toBeVisible();
    await expect(firstProject.getByText('issues')).toBeVisible();
    await expect(firstProject.getByRole('link', { name: 'View Tasks' })).toBeVisible();
  });

  test('TC-013 - Crear sprint (duplicado de TC-005)', async ({ page }) => {
    await login(page);
    await page.goto('/milestones');

    await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible();
    await expect(page.getByText('Select Sprint')).toBeVisible();
    await page.getByRole('button', { name: /Sprint 1: Foundation/ }).click();
    await expect(page.getByText('Sprint Progress')).toBeVisible();
  });
});