import { pino, type LoggerOptions } from "pino"

/**
 * Paths scrubbed from every log line.
 *
 * Redaction is configured here rather than left to call sites because the
 * dangerous case is the one nobody wrote deliberately: an error object or a
 * request that happens to carry a cookie, dragged into a log by `{ err }`.
 */
export const REDACTED_PATHS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.authorization",
  "*.cookie",
  "headers.authorization",
  "headers.cookie"
] as const

const options = (level: string): LoggerOptions => ({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  },
  redact: { paths: [...REDACTED_PATHS], censor: "[redacted]" }
})

/**
 * Builds a structured logger without reading `@repo/env`.
 *
 * The default export in `index.ts` still binds the process-wide logger to the
 * validated Next/Postgres environment. Cloudflare Workers cannot import that
 * module — it demands `DATABASE_URL` — so the Kanban worker constructs its own
 * instance from wrangler vars.
 */
export function createLogger(level: string) {
  return pino(options(level))
}
