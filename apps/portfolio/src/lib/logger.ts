import { pino } from "pino"

import { env } from "@/lib/env"

/**
 * JSON on stdout, which `docker compose logs` shows as it is. `@repo/logger`
 * would do the same, but it reads the starter's environment, which this app
 * does not have.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  }
})
