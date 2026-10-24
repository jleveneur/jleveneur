import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/**
 * The portfolio's environment, validated when a server module first imports
 * it. Separate from `@repo/env`, which describes the starter's deployment
 * (a database, Better Auth) and would refuse to load without it.
 *
 * Nothing here is `NEXT_PUBLIC_`: the contact form runs on the server, and the
 * Resend key never reaches the browser.
 */
export const env = createEnv({
  server: {
    /**
     * Unset, the contact form still works: messages are appended to a local
     * outbox and logged, so the form can be tried and tested without an
     * account. Production's compose file requires it.
     */
    RESEND_API_KEY: z.string().min(1).optional(),

    /** The sender, on a domain verified in Resend. */
    EMAIL_FROM: z.email().default("onboarding@resend.dev"),

    /** Where contact messages are delivered. */
    CONTACT_TO: z.email().default("jleveneur.pro@gmail.com"),

    /** Where the local outbox is written when `RESEND_API_KEY` is unset. */
    MAIL_OUTBOX_DIR: z.string().min(1).optional(),

    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info")
  },
  client: {},
  experimental__runtimeEnv: {},
  // `RESEND_API_KEY=` in a `.env` file means unset, not an empty key.
  emptyStringAsUndefined: true
})
