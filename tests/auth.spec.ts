import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('TC-001 - Usuario registrado puede iniciar sesión', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@test.com');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'Admin123');
    await page.click('button:has-text("Iniciar sesión")');

    await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('TC-002 - Rechazo de credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@test.com');
    await page.fill('#password', 'WrongPassword123!');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page.getByText(/el password no es valido|credenciales inválidas|error al iniciar sesión|error de conexión/i)).toBeVisible({ timeout: 10000 });
  });
});