import type { BoardEvent } from "@/lib/realtime-types.ts"

export function cardIdFromEvent(event: BoardEvent): string | null {
  const value = Object.hasOwn(event.payload, "cardId") ? event.payload["cardId"] : undefined
  return typeof value === "string" && value.length > 0 ? value : null
}
