import { env } from "@repo/env"

import { createLogger } from "./create-logger.ts"

/**
 * The application logger.
 *
 * JSON on stdout, with no transport. Pino's pretty-printing transport runs in
 * a worker thread, which Next's bundler does not reliably carry through a
 * build — and structured output is what a log aggregator wants anyway. For a
 * readable local stream, pipe it: `pnpm dev | pnpm dlx pino-pretty`.
 */
export const logger = createLogger(env.LOG_LEVEL)

export type Logger = typeof logger

export { createLogger, REDACTED_PATHS } from "./create-logger.ts"
