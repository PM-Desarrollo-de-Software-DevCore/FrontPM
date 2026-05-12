import { test, expect } from '@playwright/test';

test.describe('Proyectos', () => {
  test('TC-003 - Crear nuevo proyecto (líder)', async ({ page }) => {
    // Requiere usuario autenticado: asumimos env vars con cookie/session no implementado
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.LEAD_EMAIL || 'lead@example.com');
    await page.fill('input[name="password"]', process.env.LEAD_PASSWORD || 'Password123!');
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.getByRole('button', { name: /Iniciar sesión|Sign in|Login/i }).click()]);

    await page.click('text=Crear Proyecto, button:has-text("Crear Proyecto")');
    await page.fill('input[name="name"], input[placeholder="Nombre"]', 'Proyecto Playwright');
    await page.fill('textarea[name="description"], textarea[placeholder="Descripción"]', 'Proyecto creado por Playwright');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-06-01');
    await page.click('button:has-text("Guardar"), button:has-text("Crear")');
    await expect(page.locator('text=Proyecto Playwright')).toBeVisible();
  });

  test('TC-007 - Visualización vista unificada de proyecto', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await expect(page.locator('text=integrantes, text=roles, text=sprints, text=avance')).toBeVisible();
  });

  test('TC-013 - Crear sprint (duplicado de TC-005)', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await page.click('text=Sprints');
    await page.click('button:has-text("Crear Sprint")');
    await page.fill('input[name="objective"]', 'Objetivo del sprint');
    await page.fill('input[name="duration"]', '2');
    // Asociar tareas: selector genérico
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Objetivo del sprint')).toBeVisible();
  });
});
