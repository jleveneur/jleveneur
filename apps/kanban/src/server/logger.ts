import { createLogger } from "@repo/logger/create"

import { workerVars } from "./cloudflare.ts"

export function getLogger() {
  return createLogger(workerVars().LOG_LEVEL)
}
