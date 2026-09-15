import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import {
  card,
  column,
  comment,
  member,
  notification,
  organization,
  subtask,
  user
} from "@/db/schema.ts"
import { priorities } from "@/lib/card-filters.ts"
import { applyCardMove } from "@/lib/move-card.ts"

import { loadBoard, loadCardDetail, listNotifications } from "./board-queries.ts"
import { broadcastBoardEvent } from "./broadcast.ts"
import { orgProcedure, publicProcedure } from "./procedures.ts"
import { requirePermission } from "./require-permission.ts"

export const appRouter = {
  health: publicProcedure.handler(() => ({ status: "ok" as const })),

  organization: {
    current: orgProcedure.handler(async ({ context }) => {
      const [row] = await context.db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          role: member.role
        })
        .from(member)
        .innerJoin(organization, eq(organization.id, member.organizationId))
        .where(
          and(eq(member.organizationId, context.organizationId), eq(member.userId, context.user.id))
        )
        .limit(1)

      if (row === undefined) {
        throw new ORPCError("FORBIDDEN", { message: "Not a member of the active organization" })
      }

      return row
    })
  },

  board: {
    get: orgProcedure.handler(({ context }) => loadBoard(context.db, context.organizationId))
  },

  column: {
    create: requirePermission({ column: ["create"] })
      .input(z.object({ name: z.string().trim().min(1).max(80), boardId: z.string().min(1) }))
      .handler(async ({ input, context }) => {
        const existing = await context.db
          .select({ id: column.id, position: column.position })
          .from(column)
          .where(
            and(
              eq(column.organizationId, context.organizationId),
              eq(column.boardId, input.boardId)
            )
          )

        const createdAt = new Date()
        const id = crypto.randomUUID()
        await context.db.insert(column).values({
          id,
          organizationId: context.organizationId,
          boardId: input.boardId,
          name: input.name,
          position: existing.length,
          createdAt
        })

        await broadcastBoardEvent(context.boardRoom, {
          kind: "column.created",
          boardId: input.boardId,
          actorId: context.user.id,
          payload: { columnId: id, name: input.name },
          at: createdAt.toISOString()
        })

        return { id, name: input.name, position: existing.length }
      })
  },

  card: {
    create: requirePermission({ card: ["create"] })
      .input(
        z.object({
          boardId: z.string().min(1),
          columnId: z.string().min(1),
          title: z.string().trim().min(1).max(200),
          description: z.string().trim().max(2000).default("")
        })
      )
      .handler(async ({ input, context }) => {
        const siblings = await context.db
          .select({ id: card.id })
          .from(card)
          .where(
            and(eq(card.organizationId, context.organizationId), eq(card.columnId, input.columnId))
          )

        const createdAt = new Date()
        const id = crypto.randomUUID()
        await context.db.insert(card).values({
          id,
          organizationId: context.organizationId,
          boardId: input.boardId,
          columnId: input.columnId,
          title: input.title,
          description: input.description,
          priority: "medium",
          progress: 0,
          position: siblings.length,
          createdAt,
          updatedAt: createdAt
        })

        await broadcastBoardEvent(context.boardRoom, {
          kind: "card.created",
          boardId: input.boardId,
          actorId: context.user.id,
          payload: { cardId: id, columnId: input.columnId, title: input.title },
          at: createdAt.toISOString()
        })

        return { id }
      }),

    move: requirePermission({ card: ["update"] })
      .input(
        z.object({
          cardId: z.string().min(1),
          toColumnId: z.string().min(1),
          position: z.number().int().min(0)
        })
      )
      .handler(async ({ input, context }) => {
        const rows = await context.db
          .select({
            id: card.id,
            columnId: card.columnId,
            position: card.position,
            boardId: card.boardId
          })
          .from(card)
          .where(eq(card.organizationId, context.organizationId))

        const moving = rows.find((row) => row.id === input.cardId)
        if (moving === undefined) {
          throw new ORPCError("NOT_FOUND", { message: "Card not found" })
        }

        const next = applyCardMove(rows, input)
        const updatedAt = new Date()

        for (const row of next) {
          const previous = rows.find((item) => item.id === row.id)
          if (previous === undefined) {
            continue
          }
          if (previous.columnId === row.columnId && previous.position === row.position) {
            continue
          }
          await context.db
            .update(card)
            .set({ columnId: row.columnId, position: row.position, updatedAt })
            .where(and(eq(card.id, row.id), eq(card.organizationId, context.organizationId)))
        }

        await broadcastBoardEvent(context.boardRoom, {
          kind: "card.moved",
          boardId: moving.boardId,
          actorId: context.user.id,
          payload: { cardId: input.cardId, toColumnId: input.toColumnId, position: input.position },
          at: updatedAt.toISOString()
        })

        await notifyOrg(context.db, context.organizationId, context.user.id, {
          kind: "card.moved",
          title: "Card moved",
          body: `A card moved to another column.`
        })

        return { id: input.cardId }
      }),

    update: requirePermission({ card: ["update"] })
      .input(
        z.object({
          cardId: z.string().min(1),
          title: z.string().trim().min(1).max(200).optional(),
          description: z.string().trim().max(2000).optional(),
          priority: z.enum(priorities).optional(),
          dueDate: z.string().nullable().optional(),
          progress: z.number().int().min(0).max(100).optional(),
          columnId: z.string().min(1).optional()
        })
      )
      .handler(async ({ input, context }) => {
        const [owned] = await context.db
          .select({ id: card.id, boardId: card.boardId })
          .from(card)
          .where(and(eq(card.id, input.cardId), eq(card.organizationId, context.organizationId)))
          .limit(1)

        if (owned === undefined) {
          throw new ORPCError("NOT_FOUND", { message: "Card not found" })
        }

        const updatedAt = new Date()
        await context.db
          .update(card)
          .set({
            ...(input.title === undefined ? {} : { title: input.title }),
            ...(input.description === undefined ? {} : { description: input.description }),
            ...(input.priority === undefined ? {} : { priority: input.priority }),
            ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate }),
            ...(input.progress === undefined ? {} : { progress: input.progress }),
            ...(input.columnId === undefined ? {} : { columnId: input.columnId }),
            updatedAt
          })
          .where(and(eq(card.id, input.cardId), eq(card.organizationId, context.organizationId)))

        await broadcastBoardEvent(context.boardRoom, {
          kind: "card.updated",
          boardId: owned.boardId,
          actorId: context.user.id,
          payload: { cardId: input.cardId },
          at: updatedAt.toISOString()
        })

        return { id: input.cardId }
      }),

    detail: orgProcedure
      .input(z.object({ cardId: z.string().min(1) }))
      .handler(({ input, context }) =>
        loadCardDetail(context.db, context.organizationId, input.cardId)
      ),

    addSubtask: requirePermission({ card: ["update"] })
      .input(z.object({ cardId: z.string().min(1), title: z.string().trim().min(1).max(200) }))
      .handler(async ({ input, context }) => {
        const [owned] = await context.db
          .select({ id: card.id, boardId: card.boardId })
          .from(card)
          .where(and(eq(card.id, input.cardId), eq(card.organizationId, context.organizationId)))
          .limit(1)

        if (owned === undefined) {
          throw new ORPCError("NOT_FOUND", { message: "Card not found" })
        }

        const siblings = await context.db
          .select({ id: subtask.id })
          .from(subtask)
          .where(
            and(
              eq(subtask.organizationId, context.organizationId),
              eq(subtask.cardId, input.cardId)
            )
          )

        const id = crypto.randomUUID()
        const createdAt = new Date()
        await context.db.insert(subtask).values({
          id,
          organizationId: context.organizationId,
          cardId: input.cardId,
          title: input.title,
          done: false,
          position: siblings.length,
          createdAt
        })

        await broadcastBoardEvent(context.boardRoom, {
          kind: "card.updated",
          boardId: owned.boardId,
          actorId: context.user.id,
          payload: { cardId: input.cardId, subtaskId: id },
          at: createdAt.toISOString()
        })

        return { id }
      }),

    toggleSubtask: requirePermission({ card: ["update"] })
      .input(
        z.object({ cardId: z.string().min(1), subtaskId: z.string().min(1), done: z.boolean() })
      )
      .handler(async ({ input, context }) => {
        await context.db
          .update(subtask)
          .set({ done: input.done })
          .where(
            and(
              eq(subtask.id, input.subtaskId),
              eq(subtask.cardId, input.cardId),
              eq(subtask.organizationId, context.organizationId)
            )
          )
        return { id: input.subtaskId, done: input.done }
      })
  },

  comment: {
    add: requirePermission({ card: ["comment"] })
      .input(z.object({ cardId: z.string().min(1), body: z.string().trim().min(1).max(4000) }))
      .handler(async ({ input, context }) => {
        const [owned] = await context.db
          .select({ id: card.id, boardId: card.boardId })
          .from(card)
          .where(and(eq(card.id, input.cardId), eq(card.organizationId, context.organizationId)))
          .limit(1)

        if (owned === undefined) {
          throw new ORPCError("NOT_FOUND", { message: "Card not found" })
        }

        const id = crypto.randomUUID()
        const createdAt = new Date()
        await context.db.insert(comment).values({
          id,
          organizationId: context.organizationId,
          cardId: input.cardId,
          userId: context.user.id,
          body: input.body,
          createdAt
        })

        await broadcastBoardEvent(context.boardRoom, {
          kind: "comment.added",
          boardId: owned.boardId,
          actorId: context.user.id,
          payload: { cardId: input.cardId, commentId: id },
          at: createdAt.toISOString()
        })

        await notifyOrg(context.db, context.organizationId, context.user.id, {
          kind: "comment.added",
          title: "New comment",
          body: context.user.name
        })

        return { id, createdAt: createdAt.toISOString() }
      })
  },

  notification: {
    list: orgProcedure.handler(({ context }) =>
      listNotifications(context.db, context.organizationId, context.user.id)
    )
  },

  members: {
    list: orgProcedure.handler(({ context }) =>
      context.db
        .select({ id: user.id, name: user.name, image: user.image })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, context.organizationId))
    )
  }
}

export type AppRouter = typeof appRouter

async function notifyOrg(
  db: Parameters<typeof listNotifications>[0],
  organizationId: string,
  actorId: string,
  input: { kind: string; title: string; body: string }
): Promise<void> {
  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, organizationId))

  const createdAt = new Date()
  for (const row of members) {
    if (row.userId === actorId) {
      continue
    }
    await db.insert(notification).values({
      id: crypto.randomUUID(),
      organizationId,
      userId: row.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      read: false,
      createdAt
    })
  }
}
