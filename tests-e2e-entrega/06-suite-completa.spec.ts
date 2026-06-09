import { test, expect, type Page } from "@playwright/test"
import { loginAsAdmin } from "./helpers"

/**
 * TC-E2E-06: Suite integral de seeding + verificación funcional.
 *
 * Crea datos dummy y ejercita TODAS las áreas principales del sitio:
 *   1. 5 usuarios dummy (con skill y designación).
 *   2. 5 proyectos dummy (con miembros sugeridos, best-effort).
 *   3. Sprints (con fechas distintas) y tareas (fechas/prioridades/asignados
 *      variados) en cada proyecto, incluyendo un intento de drag&drop de una
 *      tarea del Backlog a un Sprint.
 *   4. Edición de tarea con el botón unificado "Save changes" (status + fecha).
 *   5. Render de las 6 vistas del workspace (Kanban/Timeline/Scrum/Table/Calendar/Roadmap).
 *   6. Finanzas: alta de un gasto y una factura.
 *   7. Milestones: la página muestra los proyectos creados.
 *
 * Requisitos: app Next.js en http://localhost:3000 + backend accesible, y un
 * admin sembrado (ADMIN_EMAIL/ADMIN_PASSWORD, por defecto admin@test.com / Admin123).
 *
 * Ejecutar:
 *   npx playwright test tests-e2e-entrega/06-suite-completa.spec.ts \
 *     --config=playwright-entrega.config.ts
 *
 * Notas de robustez (ver memoria project-e2e-tests):
 *   - Prefijos en inglés para evitar la auto-traducción de Chromium.
 *   - page.reload() tras crear datos: TaskWorkspaceViews se carga con dynamic/ssr:false
 *     y puede no haber commiteado el render cuando el locator evalúa.
 *   - Backlog: getByRole("heading", { name: "Backlog" }) evita el strict-mode con el
 *     texto del empty-state.
 */

// Modo serial: los tests comparten datos creados (proyectos/usuarios) vía
// variables de módulo. Si uno falla, los siguientes se omiten (es una suite de seeding).
test.describe.configure({ mode: "serial" })

const RUN = Date.now()

type DummyUser = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  designation: string
  skill: string
}

const dummyUsers: DummyUser[] = [
  { firstName: "Ada", lastName: `QA-${RUN}`, email: `ada.${RUN}@example.com`, phone: "5512340001", password: "Password123!", designation: "Backend Developer", skill: "Node" },
  { firstName: "Linus", lastName: `Dev-${RUN}`, email: `linus.${RUN}@example.com`, phone: "5512340002", password: "Password123!", designation: "Frontend Developer", skill: "React" },
  { firstName: "Grace", lastName: `Lead-${RUN}`, email: `grace.${RUN}@example.com`, phone: "5512340003", password: "Password123!", designation: "Scrum Master", skill: "Agile" },
  { firstName: "Alan", lastName: `Ops-${RUN}`, email: `alan.${RUN}@example.com`, phone: "5512340004", password: "Password123!", designation: "DevOps Engineer", skill: "Docker" },
  { firstName: "Edsger", lastName: `Arch-${RUN}`, email: `edsger.${RUN}@example.com`, phone: "5512340005", password: "Password123!", designation: "Solutions Architect", skill: "TypeScript" },
]

type DummyProject = {
  name: string
  description: string
  client: string
  projectType: string
  objective: string
  start: string
  end: string
}

const dummyProjects: DummyProject[] = [
  { name: `E2E-Mobile-Banking-${RUN}`, description: "Mobile banking platform with secure onboarding flows", client: "FinCorp", projectType: "Mobile app", objective: "Deliver a secure mobile banking onboarding portal", start: "2026-07-01", end: "2026-12-15" },
  { name: `E2E-Ecommerce-${RUN}`, description: "Headless ecommerce storefront and checkout revamp", client: "ShopLine", projectType: "Web app", objective: "Rebuild the checkout and product catalog experience", start: "2026-07-05", end: "2026-11-30" },
  { name: `E2E-Analytics-${RUN}`, description: "Real-time analytics dashboard for operations teams", client: "DataWorks", projectType: "Web app", objective: "Ship a realtime KPI dashboard for operations", start: "2026-08-01", end: "2027-01-20" },
  { name: `E2E-HR-Portal-${RUN}`, description: "Internal human resources self-service portal", client: "PeopleOps", projectType: "Web app", objective: "Centralize HR requests and approvals in one portal", start: "2026-08-10", end: "2026-12-31" },
  { name: `E2E-IoT-Fleet-${RUN}`, description: "IoT fleet tracking and telemetry ingestion service", client: "MoveIt", projectType: "Platform", objective: "Track fleet telemetry and surface live vehicle status", start: "2026-09-01", end: "2027-03-01" },
]

// Carry-over entre tests (serial).
const createdProjects: string[] = []

/* ------------------------------- helpers ------------------------------- */

/**
 * Cierra las notificaciones (toasts) visibles. Se apilan arriba-derecha y se
 * solapan con los botones del header ("+ Nueva tarea" / "+ Create Sprint"),
 * interfiriendo con los clics consecutivos rápidos. Limpiarlas entre cada
 * creación hace el seeding determinista.
 */
async function clearToasts(page: Page): Promise<void> {
  const closeButtons = page.getByRole("button", { name: "Dismiss notification" })
  const count = await closeButtons.count()
  for (let i = count - 1; i >= 0; i--) {
    await closeButtons.nth(i).click().catch(() => {})
  }
  await page.waitForTimeout(150)
}

async function goToProjectTasksByName(page: Page, name: string): Promise<void> {
  await page.goto("/projects")
  const card = page.locator("article").filter({ has: page.locator("h2", { hasText: name }) })
  await card.first().waitFor({ state: "visible", timeout: 20000 })
  await card.first().getByRole("link", { name: "View Tasks" }).click()
  await page.waitForURL(/\/projects\/.+\/tasks/, { timeout: 20000 })
  await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 15000 })
}

const sprintHeading = (page: Page) => page.getByRole("heading", { name: "Create Sprint" })

async function createSprint(page: Page, name: string, start: string, end: string): Promise<void> {
  // Reintento: encadenar creaciones rápidas en la misma página produce condiciones
  // de carrera ocasionales (el submit no cuaja y el modal queda abierto). El cierre
  // del modal es la señal fiable de éxito (handleCreateSprint solo cierra en éxito).
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (!(await sprintHeading(page).isVisible())) {
      await page.getByRole("button", { name: "+ Create Sprint" }).click()
      await expect(sprintHeading(page)).toBeVisible({ timeout: 10000 })
    }
    await page.getByPlaceholder("Sprint 1 - Authentication").fill(name)
    const dates = page.locator('input[type="date"]')
    await dates.nth(0).fill(start)
    await dates.nth(1).fill(end)
    // exact:true para no chocar con el botón header "+ Create Sprint"
    await page.getByRole("button", { name: "Create Sprint", exact: true }).click()

    const closed = await sprintHeading(page)
      .waitFor({ state: "hidden", timeout: 12000 })
      .then(() => true)
      .catch(() => false)

    if (closed) {
      await clearToasts(page)
      return
    }

    const notif = await page.locator("div.fixed.top-3.right-3 p").allTextContents()
    console.log(`createSprint "${name}" intento ${attempt} no cerró el modal. notif=${JSON.stringify(notif)}`)
    await clearToasts(page)
    await page.waitForTimeout(1200)
  }
  throw new Error(`No se pudo crear el sprint "${name}" tras 3 intentos`)
}

const newTaskHeading = (page: Page) => page.getByRole("heading", { name: "New Task" })

async function createBacklogTask(
  page: Page,
  title: string,
  priority: "low" | "medium" | "high",
  dueDate: string,
  assignByIndex = true
): Promise<void> {
  // Mismo patrón de reintento que createSprint: el cierre del modal es la señal
  // fiable de éxito (handleCreateTask solo cierra en la ruta de éxito).
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (!(await newTaskHeading(page).isVisible())) {
      await page.getByRole("button", { name: "+ Nueva tarea" }).click()
      await expect(newTaskHeading(page)).toBeVisible({ timeout: 10000 })
    }

    await page.getByPlaceholder("Task title").fill(title)
    await page.getByPlaceholder("Description").fill(`Auto task ${title}`)

    // Priority: el select que contiene la opción "high" (lo distingue del "Assign To")
    await page
      .locator("select")
      .filter({ has: page.locator('option[value="high"]') })
      .selectOption(priority)

    // Assign To (best-effort): si el proyecto tiene miembros, hay >1 opción.
    if (assignByIndex) {
      const assignSelect = page
        .locator("select")
        .filter({ has: page.locator("option", { hasText: "Unassigned" }) })
      const optionCount = await assignSelect.locator("option").count()
      if (optionCount > 1) {
        await assignSelect.selectOption({ index: 1 })
      }
    }

    await page.locator('input[type="date"]').fill(dueDate)
    await page.getByRole("button", { name: "Create Task" }).click()

    const closed = await newTaskHeading(page)
      .waitFor({ state: "hidden", timeout: 12000 })
      .then(() => true)
      .catch(() => false)

    if (closed) {
      await clearToasts(page)
      return
    }

    const notif = await page.locator("div.fixed.top-3.right-3 p").allTextContents()
    console.log(`createBacklogTask "${title}" intento ${attempt} no cerró el modal. notif=${JSON.stringify(notif)}`)
    await clearToasts(page)
    await page.waitForTimeout(1200)
  }
  throw new Error(`No se pudo crear la tarea "${title}" tras 3 intentos`)
}

/** Drag&drop basado en mouse (compatible con @hello-pangea/dnd). Best-effort. */
async function dragTaskToSprint(page: Page, taskTitle: string, sprintName: string): Promise<boolean> {
  const source = page.locator("p.truncate").filter({ hasText: taskTitle }).first()
  const target = page.locator("section").filter({ hasText: sprintName }).first()

  const sb = await source.boundingBox()
  const tb = await target.boundingBox()
  if (!sb || !tb) return false

  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2)
  await page.mouse.down()
  // pequeños movimientos para que la librería registre el inicio del drag
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2 + 6, { steps: 6 })
  await page.mouse.move(tb.x + tb.width / 2, tb.y + 50, { steps: 25 })
  await page.mouse.move(tb.x + tb.width / 2, tb.y + 80, { steps: 10 })
  await page.mouse.up()
  return true
}

/* -------------------------------- tests -------------------------------- */

test("01 · crea 5 usuarios dummy con skill y designación", async ({ page }) => {
  test.setTimeout(180000)
  await loginAsAdmin(page)

  for (const user of dummyUsers) {
    await page.goto("/users/create")
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({ timeout: 10000 })

    await page.getByPlaceholder("First name").fill(user.firstName)
    await page.getByPlaceholder("Last name").fill(user.lastName)
    await page.locator('input[type="email"]').fill(user.email)
    await page.getByPlaceholder("Phone number").fill(user.phone)
    await page.locator('input[name="password"]').fill(user.password)

    const designationInput = page.getByPlaceholder("Backend Developer, Frontend Developer...")
    await designationInput.fill(user.designation)
    await designationInput.locator("xpath=..").getByRole("button", { name: "Add" }).click()

    const skillInput = page.getByPlaceholder("React, SQL, TypeScript...")
    await skillInput.fill(user.skill)
    await skillInput.locator("xpath=..").getByRole("button", { name: "Add" }).click()

    await page.getByRole("button", { name: "Create User", exact: true }).click()
    await expect(page.getByText("User created").first()).toBeVisible({ timeout: 20000 })
  }
})

test("02 · crea 5 proyectos dummy (con miembros sugeridos)", async ({ page }) => {
  test.setTimeout(240000)
  await loginAsAdmin(page)

  for (const project of dummyProjects) {
    await page.goto("/projects")
    await page.click('button:has-text("+ New Project")')

    await page.fill('input[placeholder="Project Name"]', project.name)
    await page.fill('textarea[placeholder="Project Description"]', project.description)
    await page.fill('input[placeholder="Corporate Client"]', project.client)
    await page.fill('input[placeholder="Web app"]', project.projectType)
    await page.fill(
      'textarea[placeholder="Launch a central portal for customer onboarding"]',
      project.objective
    )

    const dateFields = page.locator('input[type="date"]')
    await dateFields.nth(0).fill(project.start)
    await dateFields.nth(1).fill(project.end)

    // Miembros (best-effort): la única vía de UI es la lista de "Smart member
    // suggestions" (el dropdown de búsqueda está deshabilitado en el componente).
    // El recomendador es asíncrono (IA) y puede no devolver nada; no bloquea el test.
    // Se añade solo el primer sugerido: en la primera iteración no hay chips de
    // miembros aún, así que el primer botón de la sección es siempre una sugerencia
    // (nunca el botón "x" de quitar), evitando remover un miembro por accidente.
    try {
      const suggestionSection = page.locator("section").filter({ hasText: "Smart member suggestions" })
      const suggestionButton = suggestionSection.locator("button").first()
      await suggestionButton.waitFor({ state: "visible", timeout: 4000 })
      await suggestionButton.click()
    } catch {
      // sin sugerencias disponibles → se crea el proyecto sin miembros
    }

    await page.click('button:has-text("Create Project")')
    await expect(page.getByText("Project created successfully!").first()).toBeVisible({ timeout: 25000 })

    createdProjects.push(project.name)
  }

  // Verificación: las tarjetas aparecen tras refrescar (fetch fresco del backend).
  await page.reload()
  await page.locator("article").first().waitFor({ state: "visible", timeout: 15000 })
  for (const name of createdProjects) {
    await expect(page.locator("h2").filter({ hasText: name })).toBeVisible({ timeout: 10000 })
  }
})

test("03 · crea sprints y tareas variadas en cada proyecto", async ({ page }) => {
  test.setTimeout(600000)
  await loginAsAdmin(page)
  expect(createdProjects.length, "el test 02 debe haber creado proyectos").toBeGreaterThan(0)

  const priorities: Array<"low" | "medium" | "high"> = ["high", "medium", "low"]

  for (const [index, projectName] of createdProjects.entries()) {
    await goToProjectTasksByName(page, projectName)

    // 2 sprints con fechas distintas por proyecto.
    const baseMonth = 7 + index // distribuye fechas por proyecto
    const mm = String(baseMonth).padStart(2, "0")
    await createSprint(page, `Sprint A · ${projectName}`, `2026-${mm}-05`, `2026-${mm}-19`)
    await createSprint(page, `Sprint B · ${projectName}`, `2026-${mm}-20`, `2026-${mm}-28`)

    // 3 tareas con prioridades, fechas y (best-effort) asignados distintos.
    const taskTitles = [
      `Task-Setup-${projectName}`,
      `Task-Build-${projectName}`,
      `Task-Polish-${projectName}`,
    ]
    const dueDates = [`2026-${mm}-10`, `2026-${mm}-18`, `2026-${mm}-25`]
    for (let t = 0; t < taskTitles.length; t++) {
      await createBacklogTask(page, taskTitles[t], priorities[t], dueDates[t])
    }

    // Verificar tareas en el Scrum board (Backlog).
    await page.reload()
    await expect(page.getByRole("heading", { name: "Task workspace" })).toBeVisible({ timeout: 15000 })
    await page.getByRole("button", { name: "Scrum board" }).click()
    await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible({ timeout: 10000 })
    for (const title of taskTitles) {
      await expect(page.locator("p.truncate").filter({ hasText: title })).toBeVisible({ timeout: 15000 })
    }

    // Intento de drag&drop de la primera tarea al Sprint A (best-effort; @hello-pangea/dnd).
    try {
      await dragTaskToSprint(page, taskTitles[0], `Sprint A · ${projectName}`)
      await page.waitForTimeout(800)
    } catch {
      // el DnD es sensible al timing; las tareas quedan al menos en el Backlog.
    }
  }
})

test("04 · edita una tarea con el botón unificado 'Save changes'", async ({ page }) => {
  test.setTimeout(180000)
  await loginAsAdmin(page)
  expect(createdProjects.length).toBeGreaterThan(0)

  await goToProjectTasksByName(page, createdProjects[0])

  // Abrir la primera tarea desde el Scrum board.
  await page.getByRole("button", { name: "Scrum board" }).click()
  await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible({ timeout: 10000 })
  await page.locator("p.truncate").first().click()

  await expect(page.getByText("Task Details")).toBeVisible({ timeout: 8000 })

  // Cambiar Status (select que contiene la opción in_progress) y Due Date.
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="in_progress"]') })
    .selectOption("in_progress")
  await page.locator('input[type="date"]').fill("2027-01-15")

  // Botón unificado: guarda todos los cambios en una sola operación.
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Task updated").first()).toBeVisible({ timeout: 12000 })
})

test("05 · todas las vistas del workspace renderizan", async ({ page }) => {
  test.setTimeout(180000)
  await loginAsAdmin(page)
  expect(createdProjects.length).toBeGreaterThan(0)

  await goToProjectTasksByName(page, createdProjects[0])

  // Kanban (vista por defecto): columnas por estado.
  await page.getByRole("button", { name: "Kanban" }).click()
  await expect(page.getByRole("heading", { name: "Pending" })).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Timeline" }).click()
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Scrum board" }).click()
  await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Table view" }).click()
  await expect(page.getByRole("heading", { name: "Table view" })).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Calendar" }).click()
  await expect(page.getByRole("heading", { name: "Calendar view" })).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Roadmap" }).click()
  await expect(page.getByText("Roadmap de").first()).toBeVisible({ timeout: 10000 })
})

test("06 · finanzas: agrega un gasto y una factura", async ({ page }) => {
  test.setTimeout(180000)
  await loginAsAdmin(page)
  expect(createdProjects.length).toBeGreaterThan(0)

  // Llegar a finanzas reutilizando el slug de la URL de tareas.
  // NOTA: la página de finanzas tiene texto mayormente en español, así que Chromium
  // la auto-traduce a inglés (reescribe el DOM) pese a --disable-features=Translate y
  // al atributo translate="no". Por eso los locators usan regex EN/ES para funcionar
  // con o sin traducción. Los inputs se localizan por tipo (agnóstico al idioma).
  await goToProjectTasksByName(page, createdProjects[0])
  const financeUrl = page.url().replace(/\/tasks\/?(\?.*)?$/, "/finance")
  await page.goto(financeUrl)
  await expect(page.getByRole("heading", { name: /Finance|Finanzas/i }).first()).toBeVisible({ timeout: 15000 })

  // --- Gasto / Expense ---
  await page.getByRole("button", { name: /^(Expenses|Gastos)$/ }).click()
  await page.getByRole("button", { name: /add expense|agregar gasto/i }).click()
  const expenseModal = page.getByRole("heading", { name: /New expense|Nuevo gasto/i })
  await expect(expenseModal).toBeVisible({ timeout: 8000 })
  const expenseForm = page.locator("form")
  await expenseForm.locator('input[type="number"]').fill("1500.50")
  await expenseForm.locator('input[type="date"]').fill("2026-08-15")
  await expenseForm.locator('input[type="text"]').fill("Licencias de software E2E")
  await page.getByRole("button", { name: /^(Save|Guardar)$/ }).click()
  await expect(expenseModal).toBeHidden({ timeout: 12000 })

  // --- Factura / Invoice ---
  await page.getByRole("button", { name: /^(Invoices|Facturas)$/ }).click()
  await page.getByRole("button", { name: /add invoice|agregar factura/i }).click()
  const invoiceModal = page.getByRole("heading", { name: /New invoice|Nueva factura/i })
  await expect(invoiceModal).toBeVisible({ timeout: 8000 })
  const invoiceForm = page.locator("form")
  await invoiceForm.locator('input[type="number"]').fill("8200")
  await invoiceForm.locator('input[type="text"]').fill("Hito 1 - Entrega inicial E2E")
  await invoiceForm.locator('input[type="date"]').first().fill("2026-08-20")
  await page.getByRole("button", { name: /^(Save|Guardar)$/ }).click()
  await expect(invoiceModal).toBeHidden({ timeout: 12000 })
})

test("07 · milestones muestra los proyectos creados", async ({ page }) => {
  test.setTimeout(120000)
  await loginAsAdmin(page)
  expect(createdProjects.length).toBeGreaterThan(0)

  await page.goto("/milestones")
  // Heading EN/ES por si Chromium auto-traduce la página.
  await expect(page.getByRole("heading", { name: /Milestones|Hitos/i }).first()).toBeVisible({ timeout: 15000 })

  // La página agrega proyectos del usuario; el primero creado debe aparecer
  // (el nombre es un identificador propio, no se traduce).
  await expect(page.getByText(createdProjects[0]).first()).toBeVisible({ timeout: 20000 })
})
