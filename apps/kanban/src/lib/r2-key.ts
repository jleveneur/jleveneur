const SAFE_FILE_NAME = /[^a-zA-Z0-9._-]/g

export function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim().slice(0, 180)
  const safe = trimmed.replaceAll(SAFE_FILE_NAME, "-")
  return safe.length > 0 ? safe : "file"
}

export function attachmentContentDisposition(fileName: string): string {
  return `inline; filename="${sanitizeFileName(fileName)}"`
}

/**
 * Object key for a card attachment in R2.
 *
 * Bytes never go in D1. The attachment row stores this key plus filename,
 * content type, and size.
 */
export function buildAttachmentKey(input: {
  organizationId: string
  cardId: string
  attachmentId: string
  fileName: string
}): string {
  return [
    "org",
    input.organizationId,
    "card",
    input.cardId,
    input.attachmentId,
    sanitizeFileName(input.fileName)
  ].join("/")
}
