import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers"

/**
 * TC-E2E-04: Admin crea un proyecto desde /projects.
 *
 * Verificación en dos pasos:
 * 1. Notificación de éxito "Project created successfully!" (prueba que el backend respondió OK).
 * 2. page.reload() → el proyecto aparece como <h2> en la lista de tarjetas.
 *
 * Nota: el reload() es necesario porque handleCreateProject llama setProjects()
 * optimistamente, pero en algunos runs el componente no termina de commitear el
 * render antes de que el locator evalúe; el reload fuerza un fetch fresco del
 * backend (la caché se invalida en createProject → invalidateProjectsCache()).
 */
test.describe("TC-E2E-04 - Crear proyecto", () => {
  test("Admin puede crear un proyecto nuevo con datos válidos", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/projects")

    // Abrir formulario de creación
    await page.click('button:has-text("+ New Project")')

    // English-only prefix avoids Chrome auto-translate silently changing the name
    // (e.g. "Proyecto" → "Project") in the DOM while the JS variable keeps the original.
    const projectName = `E2E-Project-${Date.now()}`

    // Campos obligatorios del formulario de creación
    await page.fill('input[placeholder="Project Name"]', projectName)
    await page.fill('textarea[placeholder="Project Description"]', "Proyecto de prueba automatizada E2E")
    await page.fill('input[placeholder="Corporate Client"]', "E2E Corp")
    await page.fill('input[placeholder="Web app"]', "Web app")
    await page.fill(
      'textarea[placeholder="Launch a central portal for customer onboarding"]',
      "Validar el flujo de creación de proyectos en E2E"
    )

    // Fechas (inicio y fin)
    const dateFields = page.locator('input[type="date"]')
    await dateFields.nth(0).fill("2026-08-01")
    await dateFields.nth(1).fill("2026-12-31")

    // Crear
    await page.click('button:has-text("Create Project")')

    // 1. Verificar notificación de éxito (confirma que el backend procesó la creación)
    await expect(page.getByText("Project created successfully!")).toBeVisible({ timeout: 20000 })

    // 2. Recargar para obtener la lista de proyectos fresca del backend y
    //    verificar que la tarjeta del proyecto aparece con su nombre como <h2>
    await page.reload()
    await page.locator("article").first().waitFor({ state: "visible", timeout: 15000 })
    await expect(page.locator("h2").filter({ hasText: projectName })).toBeVisible({ timeout: 10000 })
  })
})
