import { describe, expect, test } from "bun:test"

import { contactSchema, escapeHtml, fieldErrors, renderContactEmail } from "./contact.ts"
import { createRateLimiter } from "./rate-limit.ts"

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Bonjour, j'aurais une question sur un projet."
}

describe("contactSchema", () => {
  test("accepts a complete message and trims it", () => {
    const parsed = contactSchema.parse({ ...valid, name: "  Ada Lovelace  " })
    expect(parsed.name).toBe("Ada Lovelace")
    expect(parsed.company).toBe("")
  })

  test("reports one translatable code per field", () => {
    const result = contactSchema.safeParse({ name: "A", email: "not-an-email", message: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error)).toEqual({
        name: "too_short",
        email: "invalid_email",
        message: "required"
      })
    }
  })

  test("treats missing fields as required", () => {
    const result = contactSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(fieldErrors(result.error)).toEqual({
        name: "required",
        email: "required",
        message: "required"
      })
    }
  })

  test("caps the message length", () => {
    const result = contactSchema.safeParse({ ...valid, message: "x".repeat(5001) })
    expect(result.success).toBe(false)
  })
})

describe("renderContactEmail", () => {
  test("escapes everything the visitor typed", () => {
    const email = renderContactEmail(
      { ...valid, name: '<img src=x onerror="alert(1)">', company: "", message: "<script>" },
      "ABC123"
    )
    expect(email.html).not.toContain("<script>")
    expect(email.html).not.toContain("<img")
    expect(email.html).toContain("&lt;script&gt;")
    expect(email.text).toContain("<script>")
    expect(email.subject).toContain("ABC123")
  })

  test("names the company when there is one", () => {
    const email = renderContactEmail({ ...valid, company: "Analytical Engines" }, "R")
    expect(email.text).toContain("Ada Lovelace (Analytical Engines)")
  })
})

test("escapeHtml covers the five significant characters", () => {
  expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;")
})

describe("createRateLimiter", () => {
  test("allows up to the limit per key and window", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(allow("a", 0)).toBe(true)
    expect(allow("a", 10)).toBe(true)
    expect(allow("a", 20)).toBe(false)
    expect(allow("b", 20)).toBe(true)
  })

  test("starts a new window once the old one expires", () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(allow("a", 0)).toBe(true)
    expect(allow("a", 999)).toBe(false)
    expect(allow("a", 1000)).toBe(true)
  })
})
