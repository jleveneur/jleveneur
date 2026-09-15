import { ORPCError } from "@orpc/server"
import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { Database } from "@/db/client.ts"
import {
  attachment,
  board,
  card,
  cardAssignee,
  column,
  comment,
  notification,
  subtask,
  user
} from "@/db/schema.ts"
import { isPriority, type Priority } from "@/lib/card-filters.ts"

export type Assignee = {
  id: string
  name: string
  image: string | null
}

export type CardSummary = {
  id: string
  columnId: string
  boardId: string
  title: string
  description: string
  priority: Priority
  dueDate: string | null
  progress: number
  position: number
  attachmentCount: number
  commentCount: number
  assignees: Assignee[]
}

export type BoardSnapshot = {
  board: { id: string; name: string }
  columns: { id: string; name: string; position: number }[]
  cards: CardSummary[]
}

export async function loadBoard(db: Database, organizationId: string): Promise<BoardSnapshot> {
  const [boardRow] = await db
    .select({ id: board.id, name: board.name })
    .from(board)
    .where(eq(board.organizationId, organizationId))
    .orderBy(asc(board.createdAt))
    .limit(1)

  if (boardRow === undefined) {
    throw new ORPCError("NOT_FOUND", { message: "No board in this organization" })
  }

  const columns = await db
    .select({ id: column.id, name: column.name, position: column.position })
    .from(column)
    .where(and(eq(column.organizationId, organizationId), eq(column.boardId, boardRow.id)))
    .orderBy(asc(column.position))

  const cards = await db
    .select({
      id: card.id,
      columnId: card.columnId,
      boardId: card.boardId,
      title: card.title,
      description: card.description,
      priority: card.priority,
      dueDate: card.dueDate,
      progress: card.progress,
      position: card.position
    })
    .from(card)
    .where(and(eq(card.organizationId, organizationId), eq(card.boardId, boardRow.id)))
    .orderBy(asc(card.position))

  const cardIds = cards.map((item) => item.id)
  const [assignees, attachmentCounts, commentCounts] = await Promise.all([
    loadAssignees(db, organizationId, cardIds),
    countByCard(db, organizationId, cardIds, "attachment"),
    countByCard(db, organizationId, cardIds, "comment")
  ])

  return {
    board: boardRow,
    columns,
    cards: cards.map((item) => {
      const priority = isPriority(item.priority) ? item.priority : "medium"
      return {
        ...item,
        priority,
        attachmentCount: attachmentCounts.get(item.id) ?? 0,
        commentCount: commentCounts.get(item.id) ?? 0,
        assignees: assignees.get(item.id) ?? []
      }
    })
  }
}

async function loadAssignees(
  db: Database,
  organizationId: string,
  cardIds: string[]
): Promise<Map<string, Assignee[]>> {
  const result = new Map<string, Assignee[]>()
  if (cardIds.length === 0) {
    return result
  }

  const rows = await db
    .select({
      cardId: cardAssignee.cardId,
      id: user.id,
      name: user.name,
      image: user.image
    })
    .from(cardAssignee)
    .innerJoin(user, eq(user.id, cardAssignee.userId))
    .where(
      and(eq(cardAssignee.organizationId, organizationId), inArray(cardAssignee.cardId, cardIds))
    )

  for (const row of rows) {
    const list = result.get(row.cardId) ?? []
    list.push({ id: row.id, name: row.name, image: row.image })
    result.set(row.cardId, list)
  }

  return result
}

async function countByCard(
  db: Database,
  organizationId: string,
  cardIds: string[],
  kind: "attachment" | "comment"
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  if (cardIds.length === 0) {
    return result
  }

  if (kind === "attachment") {
    const rows = await db
      .select({ cardId: attachment.cardId, id: attachment.id })
      .from(attachment)
      .where(
        and(eq(attachment.organizationId, organizationId), inArray(attachment.cardId, cardIds))
      )
    for (const row of rows) {
      result.set(row.cardId, (result.get(row.cardId) ?? 0) + 1)
    }
    return result
  }

  const rows = await db
    .select({ cardId: comment.cardId, id: comment.id })
    .from(comment)
    .where(and(eq(comment.organizationId, organizationId), inArray(comment.cardId, cardIds)))
  for (const row of rows) {
    result.set(row.cardId, (result.get(row.cardId) ?? 0) + 1)
  }
  return result
}

export async function loadCardDetail(db: Database, organizationId: string, cardId: string) {
  const snapshot = await loadBoard(db, organizationId)
  const summary = snapshot.cards.find((item) => item.id === cardId)
  if (summary === undefined) {
    throw new ORPCError("NOT_FOUND", { message: "Card not found" })
  }

  const [subtasks, attachments, comments] = await Promise.all([
    db
      .select({
        id: subtask.id,
        title: subtask.title,
        done: subtask.done,
        position: subtask.position
      })
      .from(subtask)
      .where(and(eq(subtask.organizationId, organizationId), eq(subtask.cardId, cardId)))
      .orderBy(asc(subtask.position)),
    db
      .select({
        id: attachment.id,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        byteSize: attachment.byteSize,
        createdAt: attachment.createdAt
      })
      .from(attachment)
      .where(and(eq(attachment.organizationId, organizationId), eq(attachment.cardId, cardId)))
      .orderBy(asc(attachment.createdAt)),
    db
      .select({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        userId: user.id,
        userName: user.name,
        userImage: user.image
      })
      .from(comment)
      .innerJoin(user, eq(user.id, comment.userId))
      .where(and(eq(comment.organizationId, organizationId), eq(comment.cardId, cardId)))
      .orderBy(asc(comment.createdAt))
  ])

  const status = snapshot.columns.find((item) => item.id === summary.columnId)

  return {
    ...summary,
    status: status === undefined ? "Unknown" : status.name,
    columns: snapshot.columns,
    subtasks,
    attachments,
    comments: comments.map((item) => ({
      id: item.id,
      body: item.body,
      createdAt: item.createdAt.toISOString(),
      author: { id: item.userId, name: item.userName, image: item.userImage }
    }))
  }
}

export type BoardNotification = {
  id: string
  kind: string
  title: string
  body: string
  cardId: string | null
  read: boolean
  createdAt: string
}

export async function listNotifications(
  db: Database,
  organizationId: string,
  userId: string
): Promise<BoardNotification[]> {
  const rows = await db
    .select({
      id: notification.id,
      kind: notification.kind,
      title: notification.title,
      body: notification.body,
      cardId: notification.cardId,
      read: notification.read,
      createdAt: notification.createdAt
    })
    .from(notification)
    .where(and(eq(notification.organizationId, organizationId), eq(notification.userId, userId)))
    .orderBy(desc(notification.createdAt))

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    cardId: row.cardId ?? null,
    read: row.read,
    createdAt: row.createdAt.toISOString()
  }))
}
