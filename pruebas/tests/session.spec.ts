import { test, expect } from '@playwright/test';

test('TC-004 - Vistas protegidas bloqueadas con sesión expirada', async ({ page }) => {
  // Iniciar sesión
  await page.goto('/login');
  await page.fill('#standard-email', process.env.TEST_USER_EMAIL || 'admin@test.com');
  await page.fill('#standard-password', process.env.TEST_USER_PASSWORD || 'TestAdmin123');
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL(/\/dashboard.*/, { timeout: 10000 });

  // Verificar que estamos en dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Limpiar cookies y localStorage para simular sesión expirada
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  // Intentar acceder a vista protegida
  await page.goto('/projects');
  
  // Debe redirigir a login
  await page.waitForURL(/\/login/, { timeout: 10000 });
  await expect(page).toHaveURL(/\/login/);
});
