import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@test.com');
  await page.fill('#password', process.env.ADMIN_PASSWORD || 'Admin123');
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
}

test.describe('Sprints', () => {
  test('TC-005 - Crear sprint con objetivo y tareas vinculadas', async ({ page }) => {
    await login(page);
    await page.goto('/milestones');

    await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible();
    await expect(page.getByText('Track project progress and key deliverables across sprints')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sprint 2: Core Features' })).toBeVisible();
    await page.getByRole('button', { name: /Sprint 2: Core Features/ }).click();
    await page.getByRole('button', { name: /Sprint 1: Foundation/ }).click();
    await expect(page.getByRole('heading', { name: 'Sprint 1: Foundation' })).toBeVisible();
  });
});