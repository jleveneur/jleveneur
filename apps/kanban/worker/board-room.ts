import { DurableObject } from "cloudflare:workers"

import type {
  BoardEvent,
  BoardEventKind,
  PresenceUser,
  RealtimeMessage
} from "../src/lib/realtime-types.ts"

function isEventKind(value: unknown): value is BoardEventKind {
  switch (value) {
    case "card.created":
    case "card.moved":
    case "card.updated":
    case "column.created":
    case "comment.added":
    case "attachment.added":
      return true
    default:
      return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isPresenceUser(value: unknown): value is PresenceUser {
  if (!isRecord(value)) {
    return false
  }
  const image = value["image"]
  return (
    typeof value["userId"] === "string" &&
    typeof value["name"] === "string" &&
    (image === null || typeof image === "string")
  )
}

function isBoardEvent(value: unknown): value is BoardEvent {
  if (!isRecord(value)) {
    return false
  }
  return (
    isEventKind(value["kind"]) &&
    typeof value["boardId"] === "string" &&
    typeof value["actorId"] === "string" &&
    typeof value["at"] === "string" &&
    isRecord(value["payload"])
  )
}

export class BoardRoom extends DurableObject {
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair()
      this.ctx.acceptWebSocket(pair[1])
      return new Response(null, { status: 101, webSocket: pair[0] })
    }

    if (request.method === "POST") {
      const event: unknown = await request.json()
      if (isBoardEvent(event)) {
        this.broadcast({ type: "event", event })
      }
      return new Response(null, { status: 204 })
    }

    return new Response("Not found", { status: 404 })
  }

  override webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== "string") {
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(message)
    } catch {
      return
    }

    if (!isRecord(parsed) || parsed["type"] !== "join" || !isPresenceUser(parsed["user"])) {
      return
    }

    socket.serializeAttachment(parsed["user"])
    this.broadcastPresence()
  }

  override webSocketClose(socket: WebSocket): void {
    socket.serializeAttachment(null)
    this.broadcastPresence()
  }

  private broadcastPresence(): void {
    this.broadcast({ type: "presence", users: this.connectedUsers() })
  }

  private connectedUsers(): PresenceUser[] {
    const seen = new Map<string, PresenceUser>()
    for (const socket of this.ctx.getWebSockets()) {
      const attachment: unknown = socket.deserializeAttachment()
      if (isPresenceUser(attachment)) {
        seen.set(attachment.userId, attachment)
      }
    }
    return [...seen.values()]
  }

  private broadcast(message: RealtimeMessage): void {
    const payload = JSON.stringify(message)
    for (const socket of this.ctx.getWebSockets()) {
      socket.send(payload)
    }
  }
}
