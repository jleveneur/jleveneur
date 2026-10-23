import { defineConfig, devices } from "@playwright/test"

const PORT = 3112
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: process.env["CI"] !== undefined,
  retries: process.env["CI"] === undefined ? 0 : 1,
  reporter: process.env["CI"] === undefined ? "list" : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "retain-on-failure"
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Built through Turbo, so an app whose inputs and build variables have not
  // changed comes back from the cache instead of being rebuilt.
  webServer: {
    command: `bun run --cwd ../.. build --filter=@repo/portfolio && bun run start --port ${String(PORT)}`,
    url: baseURL,
    reuseExistingServer: process.env["CI"] === undefined,
    timeout: 180_000
  }
})
