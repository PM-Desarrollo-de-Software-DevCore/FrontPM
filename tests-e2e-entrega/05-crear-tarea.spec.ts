import { test, expect } from "@playwright/test"
import { loginAsAdmin, goToFirstProjectTasks } from "./helpers"

/**
 * TC-E2E-05: Crear tarea desde la vista Task workspace de un proyecto.
 *
 * Flujo: Login → Proyectos → Ver Tareas → "+ Nueva tarea" (CreateTaskModal)
 * → completar campos → Create Task → verificar notificación → reload →
 * cambiar a Scrum board → verificar tarjeta en Backlog.
 *
 * Nota: el page.reload() es necesario porque aunque handleCreateTask llama
 * await loadData() antes de mostrar la notificación, el componente
 * TaskWorkspaceViews (cargado con dynamic/ssr:false) puede tener un ciclo
 * de render adicional que aún no es estable cuando el test evalúa el locator.
 * El reload garantiza datos frescos y componente completamente montado.
 */
test.describe("TC-E2E-05 - Crear tarea", () => {
  test("Usuario puede crear una nueva tarea y verla en el board de tareas", async ({ page }) => {
    await loginAsAdmin(page)
    await goToFirstProjectTasks(page)

    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 10000 })

    // English-only prefix avoids Chrome auto-translate silently changing the title
    // (e.g. "Tarea" → "Task") in the DOM while the JS variable keeps the original.
    const taskTitle = `E2E-Task-${Date.now()}`

    // Abrir modal de creación
    await page.getByRole("button", { name: "+ Nueva tarea" }).click()
    await expect(page.getByRole("heading", { name: "New Task" })).toBeVisible()

    // Título (requerido)
    await page.getByPlaceholder("Task title").fill(taskTitle)

    // Descripción (opcional pero incluida para completitud)
    await page.getByPlaceholder("Description").fill("Tarea creada por prueba E2E automatizada")

    // Prioridad — se filtra el select que contenga la opción "high" (Priority)
    // para distinguirlo del select "Assign To" que tiene nombres de usuario
    await page
      .locator("select")
      .filter({ has: page.locator('option[value="high"]') })
      .selectOption("high")

    // Fecha de entrega
    await page.locator('input[type="date"]').fill("2027-09-30")

    // Crear tarea (sin asignado → va al Backlog con id_sprint: null)
    await page.getByRole("button", { name: "Create Task" }).click()

    // Notificación de éxito (title: "Task created")
    await expect(page.getByText("Task created")).toBeVisible({ timeout: 10000 })

    // Recargar para obtener datos frescos del backend (garantiza que el
    // TaskWorkspaceViews esté completamente montado con la nueva tarea)
    await page.reload()
    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 15000 })

    // Cambiar a "Scrum board" donde el Backlog es una sección explícita.
    // Las tareas sin sprint aparecen en <p class="truncate">{task.title}</p>.
    await page.getByRole("button", { name: "Scrum board" }).click()
    await expect(page.locator("p.truncate").filter({ hasText: taskTitle })).toBeVisible({ timeout: 15000 })
  })
})
