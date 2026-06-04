# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task.spec.ts >> Tareas y comentarios >> TC-008 - Cambio de estado de tarea y recálculo
- Location: tests/task.spec.ts:14:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/dashboard/user"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - img "FrontPM Logo" [ref=e5]
      - generic [ref=e6]:
        - generic [ref=e8]:
          - img [ref=e9]
          - searchbox "Search projects, sprints, tasks" [ref=e11]
        - button "Abrir notificaciones" [ref=e13]:
          - img [ref=e14]
        - generic [ref=e17]:
          - generic [ref=e18]:
            - paragraph [ref=e19]: User (Changed) Test
            - paragraph [ref=e20]: user@test.com
          - button "User" [ref=e22]:
            - img "User" [ref=e25]
  - generic [ref=e27]:
    - list [ref=e32]:
      - listitem [ref=e33]:
        - link "Dashboard" [ref=e34] [cursor=pointer]:
          - /url: /dashboard/user
          - img [ref=e35]
          - text: Dashboard
      - listitem [ref=e40]:
        - link "Finance" [ref=e41] [cursor=pointer]:
          - /url: /finance
          - img [ref=e42]
          - text: Finance
      - listitem [ref=e45]:
        - link "Projects" [ref=e46] [cursor=pointer]:
          - /url: /projects
          - img [ref=e47]
          - text: Projects
      - listitem [ref=e49]:
        - link "Milestones" [ref=e50] [cursor=pointer]:
          - /url: /milestones
          - img [ref=e51]
          - text: Milestones
      - listitem [ref=e53]:
        - link "Work Logs" [ref=e54] [cursor=pointer]:
          - /url: /worklogs
          - img [ref=e55]
          - text: Work Logs
      - listitem [ref=e62]:
        - link "Profile" [ref=e63] [cursor=pointer]:
          - /url: /profile
          - img [ref=e64]
          - text: Profile
    - main [ref=e68]:
      - generic [ref=e69]:
        - generic [ref=e70]:
          - heading "Dashboard" [level=1] [ref=e71]
          - button "Filtro" [ref=e74]:
            - img [ref=e75]
            - text: Filtro
        - generic [ref=e77]:
          - generic [ref=e80]:
            - heading "Tasks" [level=2] [ref=e82]
            - generic [ref=e83]:
              - button "All" [ref=e84]
              - button "Completed (0)" [ref=e85]
              - button "In Progress (0)" [ref=e86]
              - button "Pending (2)" [ref=e87]
              - button "Overdue (2)" [ref=e88]
            - generic [ref=e89]:
              - generic [ref=e90] [cursor=pointer]:
                - generic [ref=e91]:
                  - generic [ref=e92]: test planned
                  - generic [ref=e93]: Project de automatizacion 1
                - generic [ref=e94]:
                  - generic [ref=e95]: Medium
                  - generic:
                    - generic: "Priority: Medium | Status: Overdue"
              - generic [ref=e97] [cursor=pointer]:
                - generic [ref=e98]:
                  - generic [ref=e99]: Prueba automatizacion 1
                  - generic [ref=e100]: Project de automatizacion 1
                - generic [ref=e101]:
                  - generic [ref=e102]: Low
                  - generic:
                    - generic: "Priority: Low | Status: Overdue"
          - generic [ref=e104]:
            - generic [ref=e107]:
              - generic [ref=e108]:
                - heading "Project Progress" [level=3] [ref=e109]
                - paragraph [ref=e110]: Total progress of based on completed tasks
              - generic [ref=e113]: 0%
            - generic [ref=e118]:
              - generic [ref=e119]:
                - heading "Overdue Tasks" [level=3] [ref=e120]
                - paragraph [ref=e121]: Total overdue
              - generic [ref=e122]:
                - generic [ref=e124]: "2"
                - paragraph [ref=e128]: 100% of tasks are overdue
          - generic [ref=e132]:
            - generic [ref=e133]:
              - heading "Leaderboard" [level=3] [ref=e134]
              - paragraph [ref=e135]: Top performers this sprint
            - generic [ref=e137]:
              - generic [ref=e138]:
                - generic [ref=e139]:
                  - img "Admin Test" [ref=e142]
                  - generic [ref=e143]: Admin Test
                - generic [ref=e144]: "0"
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - img "Israel Rodríguez Zavala" [ref=e149]
                  - generic [ref=e150]: Israel Rodríguez Zavala
                - generic [ref=e151]: "0"
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - img "Random nose" [ref=e156]
                  - generic [ref=e157]: Random nose
                - generic [ref=e158]: "0"
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - img "Samira Hazim" [ref=e163]
                  - generic [ref=e164]: Samira Hazim
                - generic [ref=e165]: "0"
              - generic [ref=e166]:
                - generic [ref=e167]:
                  - img "User (Changed) Test" [ref=e170]
                  - generic [ref=e171]: User (Changed) Test
                - generic [ref=e172]: "0"
        - generic [ref=e175]:
          - generic [ref=e176]:
            - heading "Detail Progress" [level=3] [ref=e177]
            - paragraph [ref=e178]: 27 may – 3 jun 2026
          - img [ref=e180]
  - button "Open Next.js Dev Tools" [ref=e186] [cursor=pointer]:
    - img [ref=e187]
  - alert [ref=e190]
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | async function login(page: Page) {
  4  |   await page.context().clearCookies();
  5  |   await page.goto('/login');
  6  |   await page.evaluate(() => localStorage.clear());
  7  |   await page.fill('#email', process.env.USER_EMAIL || 'user@test.com');
  8  |   await page.fill('#password', process.env.USER_PASSWORD || 'User123');
  9  |   await page.click('button:has-text("Iniciar sesión")');
> 10 |   await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  11 | }
  12 | 
  13 | test.describe('Tareas y comentarios', () => {
  14 |   test('TC-008 - Cambio de estado de tarea y recálculo', async ({ page }) => {
  15 |     await login(page);
  16 |     await page.goto('/projects');
  17 | 
  18 |     await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
  19 |     await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  20 | 
  21 |     const firstBacklogTask = page.locator('article').first();
  22 |     const completedColumn = page.getByRole('heading', { name: 'Completed' }).locator('..').locator('..');
  23 | 
  24 |     await expect(firstBacklogTask).toBeVisible();
  25 |     await firstBacklogTask.dragTo(completedColumn);
  26 |     await expect(page.getByRole('heading', { name: 'Completed' })).toBeVisible();
  27 |   });
  28 | 
  29 |   test('TC-010 - Crear comentario en tarea', async ({ page }) => {
  30 |     await login(page);
  31 |     await page.goto('/projects');
  32 | 
  33 |     await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
  34 |     await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  35 | 
  36 |     await page.locator('article').first().click();
  37 |     await expect(page.getByText('Project / Task ID -')).toBeVisible();
  38 | 
  39 |     const commentBox = page.locator('textarea[placeholder="Add attachment or add comment to describe the issue..."]');
  40 |     await commentBox.fill('Comentario desde Playwright');
  41 |     await expect(commentBox).toHaveValue('Comentario desde Playwright');
  42 |     await page.getByRole('button', { name: 'Save' }).click();
  43 |   });
  44 | 
  45 |   test('TC-014 - Asignar tarea a miembro', async ({ page }) => {
  46 |     await login(page);
  47 |     await page.goto('/projects');
  48 | 
  49 |     await page.locator('article').first().getByRole('link', { name: 'View Tasks' }).click();
  50 |     await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  51 | 
  52 |     await page.getByRole('button', { name: '+ New Task' }).click();
  53 |     const taskTitle = `Tarea Playwright ${Date.now()}`;
  54 |     await page.fill('input[placeholder="Task Title"]', taskTitle);
  55 |     await page.fill('input[placeholder="Assignee"]', 'Nuevo Miembro');
  56 |     await page.fill('input[placeholder="Manager"]', 'Project Manager');
  57 |     await page.fill('textarea[placeholder="Task Description"]', 'Tarea creada para validar asignación');
  58 |     await page.locator('input[type="date"]').fill('2026-05-20');
  59 |     await page.getByRole('button', { name: 'Create Task' }).click();
  60 | 
  61 |     await expect(page.getByText(taskTitle)).toBeVisible();
  62 |     await expect(page.getByText('NM').first()).toBeVisible();
  63 |   });
  64 | });
```