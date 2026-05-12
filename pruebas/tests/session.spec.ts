import { test, expect } from '@playwright/test';

test('TC-004 - Vistas protegidas bloqueadas con sesión expirada', async ({ page }) => {
  // Iniciar sesión
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test.user@example.com');
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Password123!');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.getByRole('button', { name: /Iniciar sesión|Sign in|Login/i }).click()]);

  // Invalidar sesión manualmente: si la app tiene endpoint para logout o revocar token
  await page.context().clearCookies();

  // Intentar acceder a vista protegida
  await page.goto('/projects');
  await expect(page).toHaveURL(/login|auth/);
});
