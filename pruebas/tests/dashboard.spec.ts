import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.fill('#standard-email', email);
  await page.fill('#standard-password', password);
  await page.click('button:has-text("Iniciar sesión")');
}

test.describe('Dashboard y métricas', () => {
  test('TC-006 - Acceso a dashboard según rol', async ({ page }) => {
    await login(page, process.env.ADMIN_EMAIL || 'admin@test.com', process.env.ADMIN_PASSWORD || 'TestAdmin123');
    await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Page load time over time')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Sprint' }).first()).toBeVisible();

    await login(page, process.env.USER_EMAIL || 'ejemplo2@gmail.com', process.env.USER_PASSWORD || 'prueba123');
    await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Page load time over time')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Proyecto' }).first()).toBeVisible();
  });

  test('TC-009 - Visualización métricas por miembro', async ({ page }) => {
    await login(page, process.env.USER_EMAIL || 'ejemplo2@gmail.com', process.env.USER_PASSWORD || 'prueba123');
    await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });

    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Page load time over time')).toBeVisible();
    await expect(page.getByText('Sistema de Gestión').first()).toBeVisible();
  });
});
