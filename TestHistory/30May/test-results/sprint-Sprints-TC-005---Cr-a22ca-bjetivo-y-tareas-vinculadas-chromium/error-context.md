# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sprint.spec.ts >> Sprints >> TC-005 - Crear sprint con objetivo y tareas vinculadas
- Location: tests/sprint.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Track project progress and key deliverables across sprints')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Track project progress and key deliverables across sprints')

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
  - main:
    - heading "Milestones" [level=1]
    - paragraph: Select a project to change the top view, sprint progression, and timeline without leaving the page.
    - heading "Project Test 1780513120611" [level=3]
    - paragraph: Sprint Progress
    - text: Planning No sprint data available for this project yet.
    - paragraph: Project progress
    - paragraph: 0%
    - paragraph: Tasks
    - paragraph: "0"
    - paragraph: Owner
    - paragraph: Admin Test
    - paragraph: Deadline
    - paragraph: 12 AUG 2026
    - text: Select Project Sprint This project does not have any sprints loaded yet.
    - heading "Milestone Timeline" [level=3]
    - paragraph: Milestones generated from the selected project's sprints
    - text: No milestones to show for this project.
    - heading "Related Projects" [level=3]
    - paragraph: The buttons work like tabs and update the entire top view.
    - text: 23 projects loaded from backend
    - 'button "Project Test 1780513120611 Owner: Admin Test Planning Medium Project Description 0 tasks 0% complete Deadline: 12 AUG 2026 Active" [pressed]':
      - heading "Project Test 1780513120611" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Medium
      - paragraph: Project Description
      - text: "0 tasks 0% complete Deadline: 12 AUG 2026 Active"
    - 'button "test Owner: Admin Test Planning High Descripcion bien chida 0 tasks 0% complete Israel Rodríguez Zavala Deadline: 02 JUL 2026"':
      - heading "test" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: Descripcion bien chida
      - text: 0 tasks 0% complete
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 02 JUL 2026"
    - 'button "Inserta namechido Owner: Admin Test Planning Low Inseta descripcion 0 tasks 0% complete Random nose Deadline: 05 JUN 2026"':
      - heading "Inserta namechido" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Low
      - paragraph: Inseta descripcion
      - text: 0 tasks 0% complete
      - img "Random nose"
      - text: "Deadline: 05 JUN 2026"
    - 'button "NewTry Owner: Admin Test Planning High Descripcion super pro 0 tasks 0% complete Israel Rodríguez Zavala Deadline: 30 DEC 2026"':
      - heading "NewTry" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: Descripcion super pro
      - text: 0 tasks 0% complete
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 30 DEC 2026"
    - 'button "Test Owner: Admin Test Planning Medium test1 0 tasks 0% complete Deadline: 02 JUN 2026"':
      - heading "Test" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Medium
      - paragraph: test1
      - text: "0 tasks 0% complete Deadline: 02 JUN 2026"
    - 'button "IOS_App Owner: Admin Test Planning Medium Hola 0 tasks 0% complete Israel Rodríguez Zavala Deadline: 02 JUN 2026"':
      - heading "IOS_App" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Medium
      - paragraph: Hola
      - text: 0 tasks 0% complete
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 02 JUN 2026"
    - 'button "[SEED] Juniper Data Owner: Admin Test In Progress Medium Registro de prueba para Juniper Labs (Data platform). 0 tasks 0% complete Deadline: 16 JUL 2026"':
      - heading "[SEED] Juniper Data" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress Medium
      - paragraph: Registro de prueba para Juniper Labs (Data platform).
      - text: "0 tasks 0% complete Deadline: 16 JUL 2026"
    - 'button "[SEED] Ivory Scheduler Owner: Admin Test Planning Low Registro de prueba para Ivory Education (Scheduling system). 0 tasks 0% complete Deadline: 23 AUG 2026"':
      - heading "[SEED] Ivory Scheduler" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Low
      - paragraph: Registro de prueba para Ivory Education (Scheduling system).
      - text: "0 tasks 0% complete Deadline: 23 AUG 2026"
    - 'button "[SEED] Harbor Admin Owner: Admin Test In Progress High Registro de prueba para Harbor Fintech (Admin panel). 0 tasks 0% complete Deadline: 19 JUL 2026"':
      - heading "[SEED] Harbor Admin" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress High
      - paragraph: Registro de prueba para Harbor Fintech (Admin panel).
      - text: "0 tasks 0% complete Deadline: 19 JUL 2026"
    - 'button "[SEED] Grove CRM Owner: Admin Test Completed Medium Registro de prueba para Grove Realty (CRM). 0 tasks 0% complete Deadline: 10 MAY 2026"':
      - heading "[SEED] Grove CRM" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Completed Medium
      - paragraph: Registro de prueba para Grove Realty (CRM).
      - text: "0 tasks 0% complete Deadline: 10 MAY 2026"
    - 'button "[SEED] Flux Support Owner: Admin Test In Progress Low Registro de prueba para Flux Studio (Support portal). 0 tasks 0% complete Deadline: 14 JUN 2026"':
      - heading "[SEED] Flux Support" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress Low
      - paragraph: Registro de prueba para Flux Studio (Support portal).
      - text: "0 tasks 0% complete Deadline: 14 JUN 2026"
    - 'button "[SEED] Ember Insights Owner: Admin Test In Progress High Registro de prueba para Ember Analytics (Analytics suite). 0 tasks 0% complete Deadline: 08 AUG 2026"':
      - heading "[SEED] Ember Insights" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress High
      - paragraph: Registro de prueba para Ember Analytics (Analytics suite).
      - text: "0 tasks 0% complete Deadline: 08 AUG 2026"
    - 'button "[SEED] Drift Commerce Owner: Admin Test Planning Medium Registro de prueba para Drift Commerce (E-commerce). 0 tasks 0% complete Deadline: 24 JUL 2026"':
      - heading "[SEED] Drift Commerce" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Medium
      - paragraph: Registro de prueba para Drift Commerce (E-commerce).
      - text: "0 tasks 0% complete Deadline: 24 JUL 2026"
    - 'button "[SEED] Cinder Ops Owner: Admin Test In Progress High Registro de prueba para Cinder Logistics (Internal tooling). 0 tasks 0% complete Deadline: 24 JUN 2026"':
      - heading "[SEED] Cinder Ops" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress High
      - paragraph: Registro de prueba para Cinder Logistics (Internal tooling).
      - text: "0 tasks 0% complete Deadline: 24 JUN 2026"
    - 'button "[SEED] Boreal Mobile Owner: Admin Test In Progress Medium Registro de prueba para Boreal Health (Mobile app). 0 tasks 0% complete Deadline: 09 JUL 2026"':
      - heading "[SEED] Boreal Mobile" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress Medium
      - paragraph: Registro de prueba para Boreal Health (Mobile app).
      - text: "0 tasks 0% complete Deadline: 09 JUL 2026"
    - 'button "[SEED] Atlas Platform Owner: Admin Test Planning High Registro de prueba para Atlas Foods (Web platform). 0 tasks 0% complete Deadline: 03 AUG 2026"':
      - heading "[SEED] Atlas Platform" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: Registro de prueba para Atlas Foods (Web platform).
      - text: "0 tasks 0% complete Deadline: 03 AUG 2026"
    - 'button "Retroalimentacion ppt Owner: Admin Test Planning High generar feedback 7 tasks 71% complete User (Changed) Test Israel Rodríguez Zavala Deadline: 30 MAY 2026"':
      - heading "Retroalimentacion ppt" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: generar feedback
      - text: 7 tasks 71% complete
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 30 MAY 2026"
    - 'button "Project de automatizacion 1 Owner: Admin Test Planning High pruebas 2 tasks 0% complete User (Changed) Test Israel Rodríguez Zavala Deadline: 29 MAY 2026"':
      - heading "Project de automatizacion 1" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: pruebas
      - text: 2 tasks 0% complete
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 29 MAY 2026"
    - 'button "Landing Page Owner: Admin Test Planning High Portfolio UI/UX 2 tasks 100% complete User (Changed) Test Israel Rodríguez Zavala Deadline: 28 MAY 2026"':
      - heading "Landing Page" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: Portfolio UI/UX
      - text: 2 tasks 100% complete
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 28 MAY 2026"
    - 'button "Proyect Manager Site Owner: Admin Test Planning High Gestor de proyectos para una empresa 5 tasks 60% complete User (Changed) Test Israel Rodríguez Zavala Deadline: 29 MAY 2026"':
      - heading "Proyect Manager Site" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning High
      - paragraph: Gestor de proyectos para una empresa
      - text: 5 tasks 60% complete
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 29 MAY 2026"
    - 'button "Frontend Development Owner: Admin Test Planning Low React responsive site 0 tasks 0% complete User (Changed) Test Israel Rodríguez Zavala Deadline: 24 MAY 2026"':
      - heading "Frontend Development" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: Planning Low
      - paragraph: React responsive site
      - text: 0 tasks 0% complete
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 24 MAY 2026"
    - 'button "Project Alpha Owner: Admin Test In Progress High Project semilla para demostrar la estructura principal. 5 tasks 80% complete Admin Test User (Changed) Test Israel Rodríguez Zavala Deadline: 29 JUN 2026"':
      - heading "Project Alpha" [level=3]
      - paragraph: "Owner: Admin Test"
      - text: In Progress High
      - paragraph: Project semilla para demostrar la estructura principal.
      - text: 5 tasks 80% complete
      - img "Admin Test"
      - img "User (Changed) Test"
      - img "Israel Rodríguez Zavala"
      - text: "Deadline: 29 JUN 2026"
    - 'button "Project Beta Owner: User (Changed) Test Planning Medium Segundo proyecto semilla con alcance reducido. 4 tasks 75% complete Admin Test User (Changed) Test Deadline: 15 JUN 2026"':
      - heading "Project Beta" [level=3]
      - paragraph: "Owner: User (Changed) Test"
      - text: Planning Medium
      - paragraph: Segundo proyecto semilla con alcance reducido.
      - text: 4 tasks 75% complete
      - img "Admin Test"
      - img "User (Changed) Test"
      - text: "Deadline: 15 JUN 2026"
- alert
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | async function login(page: Page) {
  4  |   await page.context().clearCookies();
  5  |   await page.goto('/login');
  6  |   await page.evaluate(() => localStorage.clear());
  7  |   await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@test.com');
  8  |   await page.fill('#password', process.env.ADMIN_PASSWORD || 'Admin123');
  9  |   await page.click('button:has-text("Iniciar sesión")');
  10 |   await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
  11 | }
  12 | 
  13 | test.describe('Sprints', () => {
  14 |   test('TC-005 - Crear sprint con objetivo y tareas vinculadas', async ({ page }) => {
  15 |     await login(page);
  16 |     await page.goto('/milestones');
  17 | 
  18 |     await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible();
> 19 |     await expect(page.getByText('Track project progress and key deliverables across sprints')).toBeVisible();
     |                                                                                                ^ Error: expect(locator).toBeVisible() failed
  20 |     await expect(page.getByRole('heading', { name: 'Sprint 2: Core Features' })).toBeVisible();
  21 |     await page.getByRole('button', { name: /Sprint 2: Core Features/ }).click();
  22 |     await page.getByRole('button', { name: /Sprint 1: Foundation/ }).click();
  23 |     await expect(page.getByRole('heading', { name: 'Sprint 1: Foundation' })).toBeVisible();
  24 |   });
  25 | });
```