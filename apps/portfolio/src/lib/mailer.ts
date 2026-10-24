import { Resend } from "resend"

import type { RenderedEmail } from "@/lib/contact"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"
import { writeToOutbox } from "@/lib/outbox"

const resend = env.RESEND_API_KEY === undefined ? null : new Resend(env.RESEND_API_KEY)

/**
 * Delivers a contact message to `CONTACT_TO`, with the visitor as reply-to so
 * answering is one click.
 *
 * Without `RESEND_API_KEY` the message is appended to the local outbox
 * instead (`lib/outbox.ts`), and a warning says nothing was delivered.
 */
export async function deliver(email: RenderedEmail, replyTo: string): Promise<void> {
  if (resend === null) {
    const directory = env.MAIL_OUTBOX_DIR ?? ".mail"
    writeToOutbox(directory, {
      to: env.CONTACT_TO,
      replyTo,
      ...email,
      sentAt: new Date().toISOString()
    })
    logger.warn(
      { subject: email.subject, directory },
      "contact message not sent: no RESEND_API_KEY, written to the local outbox"
    )
    return
  }

  const { error } = await resend.emails.send({
    from: `jleveneur.com <${env.EMAIL_FROM}>`,
    to: env.CONTACT_TO,
    replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text
  })

  if (error) {
    throw new Error(`Resend refused "${email.subject}": ${error.message}`)
  }
}
