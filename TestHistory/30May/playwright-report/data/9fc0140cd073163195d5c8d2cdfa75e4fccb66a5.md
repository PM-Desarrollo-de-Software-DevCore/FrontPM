# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard y métricas >> TC-009 - Visualización métricas por miembro
- Location: tests/dashboard.spec.ts:31:7

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
  20 |     await expect(page.locator('label', { hasText: 'Sprint' }).first()).toBeVisible();
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
> 33 |     await page.waitForURL(/\/dashboard\/admin$/, { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  34 | 
  35 |     await expect(page.getByText('Performance')).toBeVisible();
  36 |     await expect(page.getByText('Page load time over time')).toBeVisible();
  37 |     await expect(page.getByText('Sistema de Gestión').first()).toBeVisible();
  38 |   });
  39 | });
```