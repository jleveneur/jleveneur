import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { defineConfig, devices } from "@playwright/test"

const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url))
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

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
    trace: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "pnpm build && pnpm start --port " + String(PORT),
    url: baseURL,
    reuseExistingServer: process.env["CI"] === undefined,
    timeout: 180_000,
  },
})
