import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests-e2e-entrega",
  timeout: 60 * 1000,
  expect: { timeout: 12000 },
  // Un solo worker para no saturar el servidor Next.js dev con peticiones concurrentes
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-entrega" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: process.env.HEADLESS !== "false",
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Disable Chrome's auto-translate feature so Spanish words in test data
        // (project names, task titles) are not silently translated to English,
        // which would cause locator mismatches when the test looks for the original string.
        launchOptions: { args: ["--disable-features=Translate"] },
      },
    },
  ],
  webServer: {
    command: 'echo "Asegúrate de que la app esté corriendo en http://localhost:3000"',
    port: 3000,
    reuseExistingServer: true,
  },
})
