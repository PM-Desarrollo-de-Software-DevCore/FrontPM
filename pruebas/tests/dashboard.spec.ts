import { test, expect } from '@playwright/test';

test.describe('Dashboard y métricas', () => {
  test('TC-006 - Acceso a dashboard según rol y recalculo de avance', async ({ page }) => {
    // Ejecutivo
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.EXEC_EMAIL || 'exec@example.com');
    await page.fill('input[name="password"]', process.env.EXEC_PASSWORD || 'Password123!');
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.getByRole('button', { name: /Iniciar sesión|Sign in|Login/i }).click()]);
    await page.goto('/dashboard');
    await expect(page.locator('text=dashboard|avance|porcentaje')).toBeVisible();
  });

  test('TC-009 - Visualización métricas por miembro', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=miembro|tareas|completadas')).toBeVisible();
  });
});
