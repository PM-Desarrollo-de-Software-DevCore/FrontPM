import { test, expect } from "@playwright/test"
import { loginAsAdmin, goToFirstProjectTasks } from "./helpers"

/**
 * TC-E2E-03: Cambiar fecha de entrega de una tarea.
 *
 * Flujo:
 * 1. Crear tarea con fecha inicial
 * 2. Recargar la página (garantiza datos frescos del backend en el Scrum board)
 * 3. Abrir la tarea desde el Scrum board → Backlog
 * 4. Cambiar la fecha → Save → verificar "Due date updated."
 *
 * Nota: el page.reload() es necesario porque después de createTask + loadData()
 * la vista Kanban no siempre refleja la nueva tarea inmediatamente en el DOM
 * (el componente TaskWorkspaceViews se carga dinámicamente con ssr:false).
 * El reload garantiza un fetch fresco y que la tarea esté en el Scrum board.
 */
test.describe("TC-E2E-03 - Cambiar fecha de entrega de tarea", () => {
  test("Usuario edita la fecha de entrega de una tarea existente desde el detalle", async ({ page }) => {
    await loginAsAdmin(page)
    await goToFirstProjectTasks(page)

    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 10000 })

    // English-only prefix avoids Chrome auto-translate modifying the stored title
    const taskTitle = `DueDate-Test-${Date.now()}`
    const initialDate = "2027-03-01"
    const updatedDate = "2027-09-15"

    // 1. Crear la tarea con fecha inicial
    await page.getByRole("button", { name: "+ Nueva tarea" }).click()
    await expect(page.getByRole("heading", { name: "New Task" })).toBeVisible()
    await page.getByPlaceholder("Task title").fill(taskTitle)
    await page.locator('input[type="date"]').fill(initialDate)
    await page.getByRole("button", { name: "Create Task" }).click()
    await expect(page.getByText("Task created")).toBeVisible({ timeout: 10000 })

    // 2. Recargar para obtener datos frescos del backend
    await page.reload()
    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 15000 })

    // 3. Cambiar a Scrum board donde el Backlog es una sección explícita.
    //    La tarea aparece en <p class="truncate ...">taskTitle</p>
    await page.getByRole("button", { name: "Scrum board" }).click()
    // Use getByRole to avoid strict mode violation: "backlog" (lowercase) also appears
    // in the empty-state paragraph "No hay tasks en el backlog."
    await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible({ timeout: 10000 })
    await expect(page.locator("p.truncate").filter({ hasText: taskTitle })).toBeVisible({ timeout: 15000 })
    await page.locator("p.truncate").filter({ hasText: taskTitle }).click()

    // 4. Verificar que el modal de detalles se abrió con el campo Due Date editable
    await expect(page.getByText("Task Details")).toBeVisible({ timeout: 8000 })
    await expect(page.getByText("Due Date")).toBeVisible()

    // 5. Cambiar la fecha al nuevo valor
    await page.locator('input[type="date"]').fill(updatedDate)

    // 6. Guardar con el botón unificado "Save changes" y verificar la notificación.
    //    (El modal ya no tiene botones de guardado por campo; un único "Save changes"
    //    persiste todos los cambios y la página emite el toast "Task updated".)
    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page.getByText("Task updated")).toBeVisible({ timeout: 8000 })
  })
})
