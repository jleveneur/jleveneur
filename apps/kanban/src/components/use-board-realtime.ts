"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

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
  onEvent: (event: BoardEvent) => void
): PresenceUser[] {
  const [presence, setPresence] = useState<PresenceUser[]>([])

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/realtime/${boardId}`)

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "join", user }))
    })

    socket.addEventListener("message", (message) => {
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
      if (parsed.event.actorId !== user.userId) {
        toast(labelFor(parsed.event))
      }
      onEvent(parsed.event)
    })

    return () => {
      socket.close()
    }
  }, [boardId, onEvent, user])

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
  }
}
