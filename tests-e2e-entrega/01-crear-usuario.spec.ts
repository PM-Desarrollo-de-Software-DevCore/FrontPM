import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers"

/**
 * TC-E2E-01: Admin crea un nuevo usuario a través de /users/create.
 *
 * Formulario requiere: email válido (.com), teléfono ≥10 dígitos,
 * al menos 1 designación y 1 skill (validateForm en create/page.tsx).
 *
 * Fix para "strict mode violation" en Add: el filtro div.filter({ has: input })
 * matchea divs ANCESTROS que contienen AMBOS botones Add. Se navega al padre
 * inmediato del input con locator("xpath=..") para aislar el botón correcto.
 */
test.describe("TC-E2E-01 - Crear usuario", () => {
  test("Admin puede crear un nuevo usuario con datos válidos y recibe confirmación", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/users/create")

    // Esperar que la página cargue
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({ timeout: 10000 })

    const ts = Date.now()

    // Campos básicos
    await page.getByPlaceholder("First name").fill("Playwright")
    await page.getByPlaceholder("Last name").fill(`E2E ${ts}`)
    await page.locator('input[type="email"]').fill(`playwright.e2e.${ts}@example.com`)
    await page.getByPlaceholder("Phone number").fill("5512345678")
    await page.locator('input[name="password"]').fill("Password123!")

    // Designation — se navega al div padre inmediato del input (flex gap-3)
    // para aislar su Add button del Add button de Skills que comparte ancestros.
    const designationInput = page.getByPlaceholder("Backend Developer, Frontend Developer...")
    await designationInput.fill("QA Engineer")
    await designationInput.locator("xpath=..").getByRole("button", { name: "Add" }).click()

    // Skill — mismo patrón con padre inmediato
    const skillInput = page.getByPlaceholder("React, SQL, TypeScript...")
    await skillInput.fill("Playwright")
    await skillInput.locator("xpath=..").getByRole("button", { name: "Add" }).click()

    // Submit (type="submit" con texto exacto "Create User").
    // exact: true evita el match con el botón "+ Create User" (type="button") del header,
    // cuyo nombre accesible es "+ Create User", no "Create User".
    await page.getByRole("button", { name: "Create User", exact: true }).click()

    // Notificación de éxito: title = "User created"
    await expect(page.getByText("User created")).toBeVisible({ timeout: 15000 })
  })
})
