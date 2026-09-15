import { describe, expect, it } from "vitest"

import { putAttachmentObject } from "./r2.ts"

class MemoryBucket {
  readonly objects = new Map<string, { body: ArrayBuffer; contentType: string }>()

  async put(key: string, value: ArrayBuffer, options: { httpMetadata?: { contentType?: string } }) {
    this.objects.set(key, {
      body: value,
      contentType: options.httpMetadata?.contentType ?? "application/octet-stream"
    })
    return { key }
  }

  async get(key: string) {
    const found = this.objects.get(key)
    return found === undefined ? null : found
  }

  async delete(key: string) {
    this.objects.delete(key)
  }
}

describe("putAttachmentObject", () => {
  it("writes bytes to R2 and returns the object key", async () => {
    const bucket = new MemoryBucket()
    const body = new TextEncoder().encode("pdf-bytes").buffer

    const key = await putAttachmentObject(bucket as unknown as R2Bucket, {
      organizationId: "org_1",
      cardId: "card_2",
      attachmentId: "att_3",
      fileName: "notes.pdf",
      contentType: "application/pdf",
      body
    })

    expect(key).toBe("org/org_1/card/card_2/att_3/notes.pdf")
    expect(bucket.objects.get(key)?.contentType).toBe("application/pdf")
    expect(bucket.objects.get(key)?.body.byteLength).toBe(9)
  })
})
