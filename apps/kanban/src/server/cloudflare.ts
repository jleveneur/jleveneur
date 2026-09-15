import { env } from "cloudflare:workers"

import { parseKanbanEnv, type KanbanEnv } from "@repo/env/kanban"

export function workerBindings(): Cloudflare.Env {
  return env
}

export function workerVars(): KanbanEnv {
  return parseKanbanEnv({
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    LOG_LEVEL: env.LOG_LEVEL,
    AUTH_RATE_LIMIT: env.AUTH_RATE_LIMIT
  })
}
