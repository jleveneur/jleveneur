import { describe, expect, it } from "vitest"

import { ATTACHMENT_TABLE_SQL } from "./ensure-schema.ts"

describe("attachment table", () => {
  it("stores an R2 key and never a file blob column", () => {
    expect(ATTACHMENT_TABLE_SQL).toMatch(/r2_key/)
    expect(ATTACHMENT_TABLE_SQL).not.toMatch(/\bblob\b/i)
    expect(ATTACHMENT_TABLE_SQL).not.toMatch(/\bdata\b/i)
  })
})
