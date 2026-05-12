import { test, expect } from '@playwright/test';

test.describe('Sprints', () => {
  test('TC-005 - Crear sprint con objetivo y tareas vinculadas', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=Proyecto Playwright');
    await page.click('text=Sprints');
    await page.click('button:has-text("Crear Sprint")');
    await page.fill('input[name="objective"]', 'Objetivo Sprint 1');
    await page.fill('input[name="duration"]', '14');
    // Asociar tareas (selector dependiente de implementación)
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Objetivo Sprint 1')).toBeVisible();
  });
});
