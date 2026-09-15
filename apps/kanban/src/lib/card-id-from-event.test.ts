import { describe, expect, it } from "vitest"

import { cardIdFromEvent } from "./card-id-from-event.ts"

describe("cardIdFromEvent", () => {
  it("reads a card id from the realtime payload", () => {
    expect(
      cardIdFromEvent({
        kind: "comment.added",
        boardId: "board_1",
        actorId: "user_1",
        payload: { cardId: "card_stripe" },
        at: "2026-09-15T00:00:00.000Z"
      })
    ).toBe("card_stripe")
  })

  it("returns null when the event is not about a card", () => {
    expect(
      cardIdFromEvent({
        kind: "column.created",
        boardId: "board_1",
        actorId: "user_1",
        payload: { name: "Review" },
        at: "2026-09-15T00:00:00.000Z"
      })
    ).toBeNull()
  })
})
