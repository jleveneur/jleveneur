import { DurableObject } from "cloudflare:workers"

import type { BoardEvent, PresenceUser, RealtimeMessage } from "../src/lib/realtime-types.ts"

export type { BoardEvent, PresenceUser, RealtimeMessage }

function isPresenceUser(value: unknown): value is PresenceUser {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record["userId"] === "string" && typeof record["name"] === "string"
}

export class BoardRoom extends DurableObject<Cloudflare.Env> {
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair()
      this.ctx.acceptWebSocket(pair[1])
      return new Response(null, { status: 101, webSocket: pair[0] })
    }

    if (request.method === "POST") {
      const event: unknown = await request.json()
      this.broadcast({ type: "event", event: event as BoardEvent })
      return new Response(null, { status: 204 })
    }

    return new Response("Not found", { status: 404 })
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") {
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(message)
    } catch {
      return
    }

    if (typeof parsed !== "object" || parsed === null) {
      return
    }

    const record = parsed as Record<string, unknown>
    if (record["type"] !== "join" || !isPresenceUser(record["user"])) {
      return
    }

    socket.serializeAttachment(record["user"])
    this.broadcastPresence()
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
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
