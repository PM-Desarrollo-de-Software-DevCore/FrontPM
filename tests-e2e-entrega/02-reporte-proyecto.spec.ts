import { test, expect } from "@playwright/test"
import { loginAsAdmin, goToFirstProjectTasks } from "./helpers"

/**
 * TC-E2E-02: El usuario genera el reporte PDF de un proyecto desde la vista de tareas.
 *
 * Flujo: Task workspace → botón "Generate Report" (aria-label) → modal ProjectReportModal
 * → verificar cabecera "Project Report" e iframe/spinner → cerrar.
 */
test.describe("TC-E2E-02 - Generar reporte de proyecto con IA", () => {
  test("Usuario puede abrir el modal de reporte y ver su contenido", async ({ page }) => {
    await loginAsAdmin(page)
    await goToFirstProjectTasks(page)

    // Verificar que estamos en el Task workspace
    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 10000 })

    // Abrir modal de reporte
    await page.getByRole("button", { name: "Generate Report" }).click()

    // Verificar cabecera del modal (texto estático de ProjectReportModal)
    await expect(page.getByText("Project Report")).toBeVisible({ timeout: 8000 })

    // Verificar que los controles del modal están presentes
    await expect(page.getByRole("button", { name: "Close report modal" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Regenerate PDF" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible()

    // El reporte carga como iframe — esperar a que aparezca o que muestre error controlado
    const loadingOrFrame = page.locator('[title="Project report preview"], [class*="border-dashed"]')
    await expect(loadingOrFrame.first()).toBeVisible({ timeout: 15000 })

    // Cerrar modal
    await page.getByRole("button", { name: "Close report modal" }).click()
    await expect(page.getByText("Project Report")).not.toBeVisible({ timeout: 5000 })
  })
})
