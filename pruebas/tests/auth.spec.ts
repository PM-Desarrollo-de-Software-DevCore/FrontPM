import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('TC-001 - Usuario registrado puede iniciar sesión', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test.user@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Password123!');
    const btn = page.getByRole('button', { name: /Iniciar sesión|Sign in|Login/i });
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), btn.click()]);
    await expect(page).toHaveURL(/dashboard|\/admin|\/pm|\/user/);
  });

  test('TC-002 - Rechazo de credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test.user@example.com');
    await page.fill('input[name="password"]', 'WrongPassword!');
    await page.click('button:has-text("Iniciar sesión"), button:has-text("Sign in"), button:has-text("Login")');
    const err = page.locator('text=credencial|incorrecto|invalid|error');
    await expect(err).toBeVisible({ timeout: 5000 });
  });
});
