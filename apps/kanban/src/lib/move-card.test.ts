import { describe, expect, it } from "vitest"

import { applyCardMove } from "./move-card.ts"

describe("applyCardMove", () => {
  const cards = [
    { id: "a", columnId: "backlog", position: 0 },
    { id: "b", columnId: "progress", position: 0 }
  ]

  it("moves a card into another column", () => {
    const next = applyCardMove(cards, { cardId: "a", toColumnId: "progress", position: 1 })
    const moved = next.find((card) => card.id === "a")

    expect(moved?.columnId).toBe("progress")
    expect(moved?.position).toBe(1)
  })

  it("leaves unknown cards unchanged", () => {
    expect(
      applyCardMove(cards, { cardId: "missing", toColumnId: "progress", position: 0 })
    ).toStrictEqual(cards)
  })
})
