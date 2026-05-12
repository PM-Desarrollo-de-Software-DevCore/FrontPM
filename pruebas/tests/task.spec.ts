import { test, expect } from '@playwright/test';

test.describe('Tareas y comentarios', () => {
  test('TC-008 - Cambio de estado de tarea y recálculo', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await page.click('text=Tareas');
    await page.click('text=Una tarea pendiente');
    await page.click('button:has-text("Completada"), text=Completada');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Completada')).toBeVisible();
  });

  test('TC-010 - Crear comentario en tarea', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await page.click('text=Tareas');
    await page.click('text=Una tarea pendiente');
    await page.fill('textarea[name="comment"], textarea[placeholder*="coment"]', 'Comentario desde Playwright');
    await page.click('button:has-text("Enviar"), button:has-text("Guardar")');
    await expect(page.locator('text=Comentario desde Playwright')).toBeVisible();
  });

  test('TC-014 - Asignar tarea a miembro', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await page.click('text=Tareas');
    await page.click('text=Una tarea pendiente');
    await page.click('select[name="assignee"]');
    await page.click('text=Miembro de equipo');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Miembro de equipo')).toBeVisible();
  });
});
