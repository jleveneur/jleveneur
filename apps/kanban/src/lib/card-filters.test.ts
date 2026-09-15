import { describe, expect, it } from "vitest"

import { matchesCardFilters } from "./card-filters.ts"

const card = {
  title: "Integrate Stripe payment gateway",
  description: "Set up and configure Stripe API",
  priority: "high"
}

describe("matchesCardFilters", () => {
  it("matches a title query", () => {
    expect(matchesCardFilters(card, "stripe", "all")).toBe(true)
  })

  it("rejects a miss", () => {
    expect(matchesCardFilters(card, "payroll", "all")).toBe(false)
  })

  it("filters by priority", () => {
    expect(matchesCardFilters(card, "", "low")).toBe(false)
    expect(matchesCardFilters(card, "", "high")).toBe(true)
  })
})
