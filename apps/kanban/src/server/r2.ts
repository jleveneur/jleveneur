import { buildAttachmentKey } from "@/lib/r2-key.ts"

/**
 * Writes file bytes to Cloudflare R2. Callers persist only the returned key
 * in D1 — never the body.
 */
export async function putAttachmentObject(
  bucket: R2Bucket,
  input: {
    organizationId: string
    cardId: string
    attachmentId: string
    fileName: string
    contentType: string
    body: ArrayBuffer
  }
): Promise<string> {
  const key = buildAttachmentKey(input)
  await bucket.put(key, input.body, {
    httpMetadata: { contentType: input.contentType }
  })
  return key
}

export async function getAttachmentObject(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key)
}

export async function deleteAttachmentObject(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}
