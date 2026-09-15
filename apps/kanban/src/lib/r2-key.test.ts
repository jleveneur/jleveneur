import { describe, expect, it } from "vitest"

import { buildAttachmentKey, sanitizeFileName } from "./r2-key.ts"

describe("buildAttachmentKey", () => {
  it("nests the object under org, card, and attachment ids", () => {
    expect(
      buildAttachmentKey({
        organizationId: "org_1",
        cardId: "card_2",
        attachmentId: "att_3",
        fileName: "payment-flow.png"
      })
    ).toBe("org/org_1/card/card_2/att_3/payment-flow.png")
  })

  it("never produces a D1-style blob path", () => {
    const key = buildAttachmentKey({
      organizationId: "org_1",
      cardId: "card_2",
      attachmentId: "att_3",
      fileName: "notes.pdf"
    })

    expect(key.includes("blob:")).toBe(false)
    expect(key.startsWith("org/")).toBe(true)
  })
})

describe("sanitizeFileName", () => {
  it("strips path separators", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("..-..-etc-passwd")
  })
})
