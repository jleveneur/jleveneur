import { z } from "zod"

import type { ContactErrorCode } from "@/i18n/dictionaries"

/**
 * The contact form's fields. Messages are error codes, not sentences: the
 * form translates them, so the server never needs to know the page's
 * language to reject a field.
 */
export const contactSchema = z.object({
  name: z
    .string({ error: "required" })
    .trim()
    .min(1, "required")
    .min(2, "too_short")
    .max(100, "too_long"),
  email: z
    .string({ error: "required" })
    .trim()
    .min(1, "required")
    .max(254, "too_long")
    .pipe(z.email("invalid_email")),
  company: z.string().trim().max(100, "too_long").optional().default(""),
  message: z
    .string({ error: "required" })
    .trim()
    .min(1, "required")
    .min(10, "too_short")
    .max(5000, "too_long")
})

export type ContactMessage = z.infer<typeof contactSchema>

export type ContactField = keyof ContactMessage

export type ContactFormState =
  | { status: "idle" }
  | {
      status: "error"
      fieldErrors: Partial<Record<ContactField, ContactErrorCode>>
      formError?: ContactErrorCode
      values: Partial<Record<ContactField, string>>
    }
  | { status: "sent"; reference: string }

export const initialContactState: ContactFormState = { status: "idle" }

const ERROR_CODES = new Set<string>([
  "required",
  "too_short",
  "too_long",
  "invalid_email"
] satisfies ContactErrorCode[])

function isFieldErrorCode(value: string | undefined): value is ContactErrorCode {
  return value !== undefined && ERROR_CODES.has(value)
}

/** The first error of each field, as a code the form can translate. */
export function fieldErrors(
  error: z.ZodError<ContactMessage>
): Partial<Record<ContactField, ContactErrorCode>> {
  const flat = z.flattenError(error).fieldErrors
  const result: Partial<Record<ContactField, ContactErrorCode>> = {}
  for (const field of ["name", "email", "company", "message"] as const) {
    const code = flat[field]?.[0]
    if (isFieldErrorCode(code)) {
      result[field] = code
    }
  }
  return result
}

/** A short code quoted back to the visitor and in the subject, to find the email. */
export function contactReference(): string {
  return crypto.randomUUID().slice(0, 8).toUpperCase()
}

export type RenderedEmail = { subject: string; html: string; text: string }

/**
 * The email that reaches the inbox. Everything the visitor typed is escaped:
 * it is untrusted input rendered as HTML in a mail client.
 */
export function renderContactEmail(message: ContactMessage, reference: string): RenderedEmail {
  const from = message.company === "" ? message.name : `${message.name} (${message.company})`
  const subject = `[jleveneur.com] ${message.name} — ${reference}`

  const text = [
    `De : ${from}`,
    `E-mail : ${message.email}`,
    `Réf. : ${reference}`,
    "",
    message.message
  ].join("\n")

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f4f7fb;font-family:ui-sans-serif,system-ui,sans-serif;color:#13294b">
    <table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #c9d6ea">
      <tr><td style="padding:20px 24px;border-bottom:1px solid #c9d6ea;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase">
        Nouveau message — jleveneur.com · Réf. ${escapeHtml(reference)}
      </td></tr>
      <tr><td style="padding:20px 24px;font-size:14px;line-height:1.6">
        <p style="margin:0 0 4px"><strong>${escapeHtml(from)}</strong></p>
        <p style="margin:0 0 20px"><a href="mailto:${escapeHtml(message.email)}" style="color:#1d4ed8">${escapeHtml(message.email)}</a></p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(message.message)}</p>
      </td></tr>
    </table>
  </body>
</html>`

  return { subject, html, text }
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}

export function escapeHtml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}
