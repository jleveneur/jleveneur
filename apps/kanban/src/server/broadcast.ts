import type { BoardEvent } from "@/lib/realtime-types.ts"

export async function broadcastBoardEvent(
  namespace: DurableObjectNamespace,
  event: BoardEvent
): Promise<void> {
  const stub = namespace.getByName(event.boardId)
  await stub.fetch(
    new Request("https://board-room/broadcast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event)
    })
  )
}
