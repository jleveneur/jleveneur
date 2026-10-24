"use server"

import { headers } from "next/headers"

import {
  type ContactField,
  type ContactFormState,
  contactReference,
  contactSchema,
  fieldErrors,
  renderContactEmail
} from "@/lib/contact"
import { logger } from "@/lib/logger"
import { deliver } from "@/lib/mailer"
import { createRateLimiter } from "@/lib/rate-limit"

const FIELDS = ["name", "email", "company", "message"] as const satisfies ContactField[]

// Five messages per address every ten minutes: more than a person writes,
// fewer than a script would like.
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

/**
 * The contact form's action. Validates with Zod, drops what the honeypot
 * caught, limits each address, and hands the message to Resend. Every outcome
 * is a state the form renders; nothing here throws to the page.
 */
export async function sendContactMessage(
  _previous: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const values: Partial<Record<ContactField, string>> = {}
  for (const field of FIELDS) {
    const value = formData.get(field)
    if (typeof value === "string") {
      values[field] = value
    }
  }

  // A field people never see, so only a bot fills it in. It is told the
  // message went through, so it has no reason to try another way.
  const honeypot = formData.get("website")
  if (typeof honeypot === "string" && honeypot !== "") {
    logger.info("contact message dropped: honeypot filled")
    return { status: "sent", reference: contactReference() }
  }

  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error), values }
  }

  // Caddy replaces any X-Forwarded-For a client sends with the address it
  // saw, so the first entry is the visitor's.
  const forwarded = (await headers()).get("x-forwarded-for")
  const address = forwarded?.split(",")[0]?.trim() ?? "unknown"
  if (!allow(address)) {
    logger.warn("contact message refused: rate limited")
    return { status: "error", fieldErrors: {}, formError: "rate_limited", values }
  }

  const reference = contactReference()
  try {
    await deliver(renderContactEmail(parsed.data, reference), parsed.data.email)
  } catch (error) {
    logger.error({ err: error, reference }, "contact message failed")
    return { status: "error", fieldErrors: {}, formError: "send_failed", values }
  }

  logger.info({ reference }, "contact message sent")
  return { status: "sent", reference }
}
