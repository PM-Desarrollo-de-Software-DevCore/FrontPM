import { type Page } from "@playwright/test"

// Credenciales de TESTS.md con soporte para variables de entorno
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@test.com"
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123"
export const USER_EMAIL = process.env.USER_EMAIL || "user@test.com"
export const USER_PASSWORD = process.env.USER_PASSWORD || "User123"

/**
 * Login completo con limpieza de sesión previa.
 * Espera explícitamente a que el formulario de login sea visible antes de interactuar,
 * porque el AuthProvider muestra un LoadingScreen mientras verifica la sesión.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.goto("/login")
  await page.evaluate(() => localStorage.clear())
  // Esperar a que el AuthProvider termine de verificar la sesión y muestre el form
  await page.locator("#email").waitFor({ state: "visible", timeout: 25000 })
  await page.fill("#email", ADMIN_EMAIL)
  await page.fill("#password", ADMIN_PASSWORD)
  await page.click('button:has-text("Iniciar sesión")')
  await page.waitForURL(/\/dashboard\/(admin|user|pm)$/, { timeout: 20000 })
}

export async function loginAsUser(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.goto("/login")
  await page.evaluate(() => localStorage.clear())
  await page.locator("#email").waitFor({ state: "visible", timeout: 25000 })
  await page.fill("#email", USER_EMAIL)
  await page.fill("#password", USER_PASSWORD)
  await page.click('button:has-text("Iniciar sesión")')
  await page.waitForURL(/\/dashboard\/(admin|user|pm)$/, { timeout: 20000 })
}

/**
 * Navega a la página de tareas del primer proyecto visible en /projects.
 * Reutiliza el patrón de TC-008 / TC-010 de task.spec.ts.
 */
export async function goToFirstProjectTasks(page: Page): Promise<void> {
  await page.goto("/projects")
  await page.locator("article").first().waitFor({ state: "visible", timeout: 20000 })
  await page.locator("article").first().getByRole("link", { name: "View Tasks" }).click()
  await page.waitForURL(/\/projects\/.+\/tasks/, { timeout: 20000 })
}
