# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project.spec.ts >> Proyectos >> TC-003 - Crear nuevo proyecto
- Location: tests/project.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Proyecto Test 1780513120611' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Proyecto Test 1780513120611' })

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
    - heading "Projects" [level=1]
    - button "+ New Project"
    - paragraph: New Project
    - heading "Create Project" [level=2]
    - paragraph: Fill out the essentials first, then open advanced settings if you need budget or billing details.
    - paragraph: Project basics
    - paragraph: What defines the project and its timeline.
    - text: Required Project Name
    - textbox "Project Name" [disabled]: Proyecto Test 1780513120611
    - text: Client
    - textbox "Acme Corp" [disabled]
    - text: Project Type
    - textbox "Web app" [disabled]
    - text: Methodology
    - combobox [disabled]:
      - option "Scrum" [selected]
      - option "Kanban"
      - option "Waterfall"
      - option "Hybrid"
    - text: Start Date
    - textbox [disabled]: 2026-05-13
    - text: End Date
    - textbox [disabled]: 2026-08-13
    - text: Project Description
    - textbox "Project Description" [disabled]: Descripción del proyecto
    - text: Project Objective
    - textbox "Launch a central portal for customer onboarding" [disabled]: Lanzar un portal central para el onboarding de clientes
    - text: Priority
    - combobox [disabled]:
      - option "High Priority"
      - option "Medium Priority" [selected]
      - option "Low Priority"
    - text: Status
    - combobox [disabled]:
      - option "Planning" [selected]
      - option "In Progress"
      - option "Completed"
    - paragraph: Smart member suggestions
    - paragraph: Ranked by skill fit and completed tasks
    - text: Analyzing...
    - paragraph: Generating recommendations...
    - text: Project Users
    - textbox "Search by name or email" [disabled]
    - button "Advanced settings Optional fields for planning, finance, and billing. ▾":
      - paragraph: Advanced settings
      - paragraph: Optional fields for planning, finance, and billing.
      - text: ▾
    - text: Estimated sprints
    - spinbutton [disabled]: "6"
    - text: Budget
    - spinbutton [disabled]: "25000"
    - text: Monthly cost
    - spinbutton [disabled]: "3200"
    - text: Billing model
    - combobox [disabled]:
      - option "Fixed price" [selected]
      - option "Monthly retainer"
      - option "Time and materials"
      - option "Other"
    - button "Cancel" [disabled]
    - button "Creating..." [disabled]
    - article:
      - heading "test" [level=2]
      - button "Edit test":
        - img
      - text: Planning
      - paragraph: Descripcion bien chida
      - paragraph: "Deadline : 02 JUL 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/test/tasks
      - link "Progress":
        - /url: /projects/test/progress
    - article:
      - heading "Inserta namechido" [level=2]
      - button "Edit Inserta namechido":
        - img
      - text: Planning
      - paragraph: Inseta descripcion
      - paragraph: "Deadline : 05 JUN 2026"
      - text: RA
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/inserta-nombre-chido/tasks
      - link "Progress":
        - /url: /projects/inserta-nombre-chido/progress
    - article:
      - heading "NewTry" [level=2]
      - button "Edit NewTry":
        - img
      - text: Planning
      - paragraph: Descripcion super pro
      - paragraph: "Deadline : 30 DEC 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/newtry/tasks
      - link "Progress":
        - /url: /projects/newtry/progress
    - article:
      - heading "Test" [level=2]
      - button "Edit Test":
        - img
      - text: Planning
      - paragraph: test1
      - paragraph: "Deadline : 02 JUN 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/test/tasks
      - link "Progress":
        - /url: /projects/test/progress
    - article:
      - heading "IOS_App" [level=2]
      - button "Edit IOS_App":
        - img
      - text: Planning
      - paragraph: Hola
      - paragraph: "Deadline : 02 JUN 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/ios-app/tasks
      - link "Progress":
        - /url: /projects/ios-app/progress
    - article:
      - heading "[SEED] Juniper Data" [level=2]
      - button "Edit [SEED] Juniper Data":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Juniper Labs (Data platform).
      - paragraph: "Deadline : 16 JUL 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-juniper-data/tasks
      - link "Progress":
        - /url: /projects/seed-juniper-data/progress
    - article:
      - heading "[SEED] Ivory Scheduler" [level=2]
      - button "Edit [SEED] Ivory Scheduler":
        - img
      - text: Planning
      - paragraph: Registro de prueba para Ivory Education (Scheduling system).
      - paragraph: "Deadline : 23 AUG 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-ivory-scheduler/tasks
      - link "Progress":
        - /url: /projects/seed-ivory-scheduler/progress
    - article:
      - heading "[SEED] Harbor Admin" [level=2]
      - button "Edit [SEED] Harbor Admin":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Harbor Fintech (Admin panel).
      - paragraph: "Deadline : 19 JUL 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-harbor-admin/tasks
      - link "Progress":
        - /url: /projects/seed-harbor-admin/progress
    - article:
      - heading "[SEED] Grove CRM" [level=2]
      - button "Edit [SEED] Grove CRM":
        - img
      - text: Completed
      - paragraph: Registro de prueba para Grove Realty (CRM).
      - paragraph: "Deadline : 10 MAY 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-grove-crm/tasks
      - link "Progress":
        - /url: /projects/seed-grove-crm/progress
    - article:
      - heading "[SEED] Flux Support" [level=2]
      - button "Edit [SEED] Flux Support":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Flux Studio (Support portal).
      - paragraph: "Deadline : 14 JUN 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-flux-support/tasks
      - link "Progress":
        - /url: /projects/seed-flux-support/progress
    - article:
      - heading "[SEED] Ember Insights" [level=2]
      - button "Edit [SEED] Ember Insights":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Ember Analytics (Analytics suite).
      - paragraph: "Deadline : 08 AUG 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-ember-insights/tasks
      - link "Progress":
        - /url: /projects/seed-ember-insights/progress
    - article:
      - heading "[SEED] Drift Commerce" [level=2]
      - button "Edit [SEED] Drift Commerce":
        - img
      - text: Planning
      - paragraph: Registro de prueba para Drift Commerce (E-commerce).
      - paragraph: "Deadline : 24 JUL 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-drift-commerce/tasks
      - link "Progress":
        - /url: /projects/seed-drift-commerce/progress
    - article:
      - heading "[SEED] Cinder Ops" [level=2]
      - button "Edit [SEED] Cinder Ops":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Cinder Logistics (Internal tooling).
      - paragraph: "Deadline : 24 JUN 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-cinder-ops/tasks
      - link "Progress":
        - /url: /projects/seed-cinder-ops/progress
    - article:
      - heading "[SEED] Boreal Mobile" [level=2]
      - button "Edit [SEED] Boreal Mobile":
        - img
      - text: In_progress
      - paragraph: Registro de prueba para Boreal Health (Mobile app).
      - paragraph: "Deadline : 09 JUL 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-boreal-mobile/tasks
      - link "Progress":
        - /url: /projects/seed-boreal-mobile/progress
    - article:
      - heading "[SEED] Atlas Platform" [level=2]
      - button "Edit [SEED] Atlas Platform":
        - img
      - text: Planning
      - paragraph: Registro de prueba para Atlas Foods (Web platform).
      - paragraph: "Deadline : 03 AUG 2026"
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/seed-atlas-platform/tasks
      - link "Progress":
        - /url: /projects/seed-atlas-platform/progress
    - article:
      - heading "Retroalimentacion ppt" [level=2]
      - button "Edit Retroalimentacion ppt":
        - img
      - text: Planning
      - paragraph: generar feedback
      - paragraph: "Deadline : 30 MAY 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/retroalimentacion-ppt/tasks
      - link "Progress":
        - /url: /projects/retroalimentacion-ppt/progress
    - article:
      - heading "Project de automatizacion 1" [level=2]
      - button "Edit Project de automatizacion 1":
        - img
      - text: Planning
      - paragraph: pruebas
      - paragraph: "Deadline : 29 MAY 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/proyecto-de-automatizacion-1/tasks
      - link "Progress":
        - /url: /projects/proyecto-de-automatizacion-1/progress
    - article:
      - heading "Landing Page" [level=2]
      - button "Edit Landing Page":
        - img
      - text: Planning
      - paragraph: Portfolio UI/UX
      - paragraph: "Deadline : 28 MAY 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/landing-page/tasks
      - link "Progress":
        - /url: /projects/landing-page/progress
    - article:
      - heading "Proyect Manager Site" [level=2]
      - button "Edit Proyect Manager Site":
        - img
      - text: Planning
      - paragraph: Gestor de proyectos para una empresa
      - paragraph: "Deadline : 29 MAY 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/proyect-manager-site/tasks
      - link "Progress":
        - /url: /projects/proyect-manager-site/progress
    - article:
      - heading "Frontend Development" [level=2]
      - button "Edit Frontend Development":
        - img
      - text: Planning
      - paragraph: React responsive site
      - paragraph: "Deadline : 24 MAY 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/frontend-development/tasks
      - link "Progress":
        - /url: /projects/frontend-development/progress
    - article:
      - heading "Project Alpha" [level=2]
      - button "Edit Project Alpha":
        - img
      - text: In_progress
      - paragraph: Project semilla para demostrar la estructura principal.
      - paragraph: "Deadline : 29 JUN 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/proyecto-alpha/tasks
      - link "Progress":
        - /url: /projects/proyecto-alpha/progress
    - article:
      - heading "Project Beta" [level=2]
      - button "Edit Project Beta":
        - img
      - text: Planning
      - paragraph: Segundo proyecto semilla con alcance reducido.
      - paragraph: "Deadline : 15 JUN 2026"
      - text: US
      - img
      - text: 0 issues
      - link "View Tasks":
        - /url: /projects/proyecto-beta/tasks
      - link "Progress":
        - /url: /projects/proyecto-beta/progress
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
  13 | test.describe('Proyectos', () => {
  14 |   test('TC-003 - Crear nuevo proyecto', async ({ page }) => {
  15 |     await login(page);
  16 |     await page.goto('/projects');
  17 | 
  18 |     await page.click('button:has-text("+ New Project")');
  19 | 
  20 |     const projectName = `Proyecto Test ${Date.now()}`;
  21 |     await page.fill('input[placeholder="Project Name"]', projectName);
  22 |     await page.fill('textarea[placeholder="Project Description"]', 'Descripción del proyecto');
  23 |     await page.fill('input[placeholder="Acme Corp"]', 'Acme Corp');
  24 |     await page.fill('input[placeholder="Web app"]', 'Web app');
  25 |     await page.fill('textarea[placeholder="Launch a central portal for customer onboarding"]', 'Lanzar un portal central para el onboarding de clientes');
  26 | 
  27 |     await page.locator('button:has-text("Advanced settings")').click();
  28 |     await page.fill('input[placeholder="6"]', '6');
  29 |     await page.fill('input[placeholder="25000"]', '25000');
  30 |     await page.fill('input[placeholder="3200"]', '3200');
  31 | 
  32 |     const dateFields = page.locator('input[type="date"]');
  33 |     await dateFields.nth(0).fill('2026-05-13');
  34 |     await dateFields.nth(1).fill('2026-08-13');
  35 | 
  36 |     await page.click('button:has-text("Create Project")');
> 37 |     await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  38 |   });
  39 | 
  40 |   test('TC-007 - Visualización vista unificada de proyecto', async ({ page }) => {
  41 |     await login(page);
  42 |     await page.goto('/projects');
  43 | 
  44 |     const firstProject = page.locator('article').first();
  45 |     await expect(firstProject.getByRole('heading')).toBeVisible();
  46 |     await expect(firstProject.getByText('Deadline :')).toBeVisible();
  47 |     await expect(firstProject.getByText('issues')).toBeVisible();
  48 |     await expect(firstProject.getByRole('link', { name: 'View Tasks' })).toBeVisible();
  49 |   });
  50 | 
  51 |   test('TC-013 - Crear sprint (duplicado de TC-005)', async ({ page }) => {
  52 |     await login(page);
  53 |     await page.goto('/milestones');
  54 | 
  55 |     await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible();
  56 |     await expect(page.getByText('Select Sprint')).toBeVisible();
  57 |     await page.getByRole('button', { name: /Sprint 1: Foundation/ }).click();
  58 |     await expect(page.getByText('Sprint Progress')).toBeVisible();
  59 |   });
  60 | });
```