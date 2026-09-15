"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { cardIdFromEvent } from "@/lib/card-id-from-event.ts"
import type { BoardEvent, PresenceUser, RealtimeMessage } from "@/lib/realtime-types.ts"

function isRealtimeMessage(value: unknown): value is RealtimeMessage {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const type = (value as { type?: unknown }).type
  return type === "presence" || type === "event"
}

export function useBoardRealtime(
  boardId: string,
  user: PresenceUser,
  onEvent: (event: BoardEvent) => void,
  onOpenCard: (cardId: string) => void
): PresenceUser[] {
  const [presence, setPresence] = useState<PresenceUser[]>([])
  const { userId, name, image } = user

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/realtime/${boardId}`)
    const joined = { userId, name, image }

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "join", user: joined }))
    })

    socket.addEventListener("message", (message) => {
      if (typeof message.data !== "string") {
        return
      }
      let parsed: unknown
      try {
        parsed = JSON.parse(message.data)
      } catch {
        return
      }
      if (!isRealtimeMessage(parsed)) {
        return
      }
      if (parsed.type === "presence") {
        setPresence(parsed.users)
        return
      }
      if (parsed.event.actorId !== userId) {
        const cardId = cardIdFromEvent(parsed.event)
        toast(labelFor(parsed.event), {
          description: parsed.event.kind,
          ...(cardId === null
            ? {}
            : {
                action: {
                  label: "Open",
                  onClick: () => {
                    onOpenCard(cardId)
                  }
                }
              })
        })
      }
      onEvent(parsed.event)
    })

    return () => {
      socket.close()
    }
  }, [boardId, image, name, onEvent, onOpenCard, userId])

  return presence
}

function labelFor(event: BoardEvent): string {
  switch (event.kind) {
    case "card.created":
      return "A card was created"
    case "card.moved":
      return "A card was moved"
    case "card.updated":
      return "A card was updated"
    case "column.created":
      return "A column was added"
    case "comment.added":
      return "New comment"
    case "attachment.added":
      return "New attachment"
    default:
      return "Board updated"
  }
}
