# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard y métricas >> TC-006 - Acceso a dashboard según rol
- Location: tests/dashboard.spec.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('label').filter({ hasText: 'Sprint' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('label').filter({ hasText: 'Sprint' }).first()

```

```yaml
- banner:
  - img "FrontPM Logo"
  - img
  - searchbox "Search projects, sprints, tasks, users"
  - button "Abrir notificaciones"
  - paragraph: Admin Test
  - paragraph: admin@test.com
  - button "User":
    - img "User"
- list:
  - listitem:
    - link "Dashboard":
      - /url: /dashboard/admin
  - listitem:
    - link "Finance":
      - /url: /finance
  - listitem:
    - link "Projects":
      - /url: /projects
  - listitem:
    - link "Milestones":
      - /url: /milestones
  - listitem:
    - link "Work Logs":
      - /url: /worklogs
  - listitem:
    - link "Profile":
      - /url: /profile
  - listitem:
    - link "Users":
      - /url: /users/create
- main:
  - heading "Dashboard" [level=1]
  - paragraph: test
  - paragraph: Descripcion bien chida
  - paragraph: 02 JUL 2026
  - text: 0 tareas High
  - paragraph: 02 JUL 2026
  - paragraph: Inserta namechido
  - paragraph: Inseta descripcion
  - paragraph: 05 JUN 2026
  - text: 0 tareas Low
  - paragraph: 05 JUN 2026
  - paragraph: NewTry
  - paragraph: Descripcion super pro
  - paragraph: 30 DIC 2026
  - text: 0 tareas High
  - paragraph: 30 DIC 2026
  - paragraph: Test
  - paragraph: test1
  - paragraph: 02 JUN 2026
  - text: 0 tareas Medium
  - paragraph: 02 JUN 2026
  - paragraph: IOS_App
  - paragraph: Hola
  - paragraph: 02 JUN 2026
  - text: 0 tareas Medium
  - paragraph: 02 JUN 2026
  - paragraph: "[SEED] Juniper Data"
  - paragraph: Registro de prueba para Juniper Labs (Data platform).
  - paragraph: 16 JUL 2026
  - text: 0 tareas Medium
  - paragraph: 16 JUL 2026
  - paragraph: "[SEED] Ivory Scheduler"
  - paragraph: Registro de prueba para Ivory Education (Scheduling system).
  - button "see more"
  - paragraph: 23 AGO 2026
  - text: 0 tareas Low
  - paragraph: 23 AGO 2026
  - paragraph: "[SEED] Harbor Admin"
  - paragraph: Registro de prueba para Harbor Fintech (Admin panel).
  - paragraph: 19 JUL 2026
  - text: 0 tareas High
  - paragraph: 19 JUL 2026
  - paragraph: "[SEED] Grove CRM"
  - paragraph: Registro de prueba para Grove Realty (CRM).
  - paragraph: 10 MAY 2026
  - text: 0 tareas Medium
  - paragraph: 10 MAY 2026
  - paragraph: "[SEED] Flux Support"
  - paragraph: Registro de prueba para Flux Studio (Support portal).
  - paragraph: 14 JUN 2026
  - text: 0 tareas Low
  - paragraph: 14 JUN 2026
  - paragraph: "[SEED] Ember Insights"
  - paragraph: Registro de prueba para Ember Analytics (Analytics suite).
  - button "see more"
  - paragraph: 08 AGO 2026
  - text: 0 tareas High
  - paragraph: 08 AGO 2026
  - paragraph: "[SEED] Drift Commerce"
  - paragraph: Registro de prueba para Drift Commerce (E-commerce).
  - paragraph: 24 JUL 2026
  - text: 0 tareas Medium
  - paragraph: 24 JUL 2026
  - paragraph: "[SEED] Cinder Ops"
  - paragraph: Registro de prueba para Cinder Logistics (Internal tooling).
  - button "see more"
  - paragraph: 24 JUN 2026
  - text: 0 tareas High
  - paragraph: 24 JUN 2026
  - paragraph: "[SEED] Boreal Mobile"
  - paragraph: Registro de prueba para Boreal Health (Mobile app).
  - paragraph: 09 JUL 2026
  - text: 0 tareas Medium
  - paragraph: 09 JUL 2026
  - paragraph: "[SEED] Atlas Platform"
  - paragraph: Registro de prueba para Atlas Foods (Web platform).
  - paragraph: 03 AGO 2026
  - text: 0 tareas High
  - paragraph: 03 AGO 2026
  - paragraph: Retroalimentacion ppt
  - paragraph: generar feedback
  - paragraph: 30 MAY 2026
  - text: 0 tareas High
  - paragraph: 30 MAY 2026
  - paragraph: Project de automatizacion 1
  - paragraph: pruebas
  - paragraph: 29 MAY 2026
  - text: 0 tareas High
  - paragraph: 29 MAY 2026
  - paragraph: Landing Page
  - paragraph: Portfolio UI/UX
  - paragraph: 28 MAY 2026
  - text: 0 tareas High
  - paragraph: 28 MAY 2026
  - paragraph: Proyect Manager Site
  - paragraph: Gestor de proyectos para una empresa
  - paragraph: 29 MAY 2026
  - text: 0 tareas High
  - paragraph: 29 MAY 2026
  - paragraph: Frontend Development
  - paragraph: React responsive site
  - paragraph: 24 MAY 2026
  - text: 0 tareas Low
  - paragraph: 24 MAY 2026
  - paragraph: Project Alpha
  - paragraph: Project semilla para demostrar la estructura principal.
  - paragraph: 29 JUN 2026
  - text: 0 tareas High
  - paragraph: 29 JUN 2026
  - paragraph: Project Beta
  - paragraph: Segundo proyecto semilla con alcance reducido.
  - paragraph: 15 JUN 2026
  - text: 0 tareas Medium
  - paragraph: 15 JUN 2026
  - heading "Logs" [level=2]
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - paragraph: User updated project settings
  - paragraph: Logs · 2 mins ago
  - heading "Performance" [level=3]
  - paragraph: Page load time over time
  - img
- alert
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | async function login(page: Page, email: string, password: string) {
  4  |   await page.context().clearCookies();
  5  |   await page.goto('/login');
  6  |   await page.evaluate(() => localStorage.clear());
  7  |   await page.fill('#email', email);
  8  |   await page.fill('#password', password);
  9  |   await page.click('button:has-text("Iniciar sesión")');
  10 | }
  11 | 
  12 | test.describe('Dashboard y métricas', () => {
  13 |   test('TC-006 - Acceso a dashboard según rol', async ({ page }) => {
  14 |     await login(page, process.env.ADMIN_EMAIL || 'admin@test.com', process.env.ADMIN_PASSWORD || 'Admin123');
  15 |     await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
  16 | 
  17 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  18 |     await expect(page.getByText('Performance')).toBeVisible();
  19 |     await expect(page.getByText('Page load time over time')).toBeVisible();
> 20 |     await expect(page.locator('label', { hasText: 'Sprint' }).first()).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  21 | 
  22 |     await login(page, process.env.USER_EMAIL || 'user@test.com', process.env.USER_PASSWORD || 'User123');
  23 |     await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
  24 | 
  25 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  26 |     await expect(page.getByText('Performance')).toBeVisible();
  27 |     await expect(page.getByText('Page load time over time')).toBeVisible();
  28 |     await expect(page.locator('label', { hasText: 'Proyecto' }).first()).toBeVisible();
  29 |   });
  30 | 
  31 |   test('TC-009 - Visualización métricas por miembro', async ({ page }) => {
  32 |     await login(page, process.env.USER_EMAIL || 'user@test.com', process.env.USER_PASSWORD || 'User123');
  33 |     await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
  34 | 
  35 |     await expect(page.getByText('Performance')).toBeVisible();
  36 |     await expect(page.getByText('Page load time over time')).toBeVisible();
  37 |     await expect(page.getByText('Sistema de Gestión').first()).toBeVisible();
  38 |   });
  39 | });
```