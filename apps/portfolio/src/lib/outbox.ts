import { appendFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

export type OutboxEntry = {
  to: string
  replyTo: string
  subject: string
  html: string
  text: string
  sentAt: string
}

export const OUTBOX_FILE = "outbox.jsonl"

/**
 * Where contact messages go when there is no Resend key: one JSON object per
 * line, appended synchronously so the e2e suite reads a complete record
 * straight after the request. The same seam as `@repo/email`'s outbox, which
 * this app cannot import: that package reads the starter's environment.
 */
export function writeToOutbox(directory: string, entry: OutboxEntry): void {
  mkdirSync(directory, { recursive: true })
  appendFileSync(join(directory, OUTBOX_FILE), `${JSON.stringify(entry)}\n`, "utf8")
}

/** Parses outbox contents. Exported so tests read it the way it is written. */
export function parseOutbox(contents: string): OutboxEntry[] {
  return contents
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line): unknown => JSON.parse(line))
    .filter((value): value is OutboxEntry => isOutboxEntry(value))
}

function isOutboxEntry(value: unknown): value is OutboxEntry {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const entry: Record<string, unknown> = { ...value }
  return (
    typeof entry["to"] === "string" &&
    typeof entry["replyTo"] === "string" &&
    typeof entry["subject"] === "string" &&
    typeof entry["html"] === "string" &&
    typeof entry["text"] === "string"
  )
}
