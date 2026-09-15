export type PresenceUser = {
  userId: string
  name: string
  image: string | null
}

export type BoardEventKind =
  | "card.created"
  | "card.moved"
  | "card.updated"
  | "column.created"
  | "comment.added"
  | "attachment.added"

export type BoardEvent = {
  kind: BoardEventKind
  boardId: string
  actorId: string
  payload: Record<string, unknown>
  at: string
}

export type RealtimeMessage =
  | { type: "presence"; users: PresenceUser[] }
  | { type: "event"; event: BoardEvent }
