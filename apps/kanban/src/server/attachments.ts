import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"

import { attachment, card, member } from "@/db/schema.ts"

import { createAuth } from "./auth.ts"
import { broadcastBoardEvent } from "./broadcast.ts"
import type { Context } from "./context.ts"
import { deleteAttachmentObject, getAttachmentObject, putAttachmentObject } from "./r2.ts"

const MAX_BYTES = 10 * 1024 * 1024

export async function uploadCardAttachment(
  context: Context,
  input: { cardId: string; fileName: string; contentType: string; body: ArrayBuffer }
) {
  if (context.session === null) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  const organizationId = context.session.session.activeOrganizationId
  if (organizationId === null || organizationId === undefined) {
    throw new ORPCError("FORBIDDEN", { message: "No active organization" })
  }

  if (input.body.byteLength === 0 || input.body.byteLength > MAX_BYTES) {
    throw new ORPCError("BAD_REQUEST", { message: "File must be between 1 byte and 10 MB" })
  }

  const [membership] = await context.db
    .select({ id: member.id })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, context.session.user.id))
    )
    .limit(1)

  if (membership === undefined) {
    throw new ORPCError("FORBIDDEN", { message: "Not a member of the active organization" })
  }

  const auth = createAuth(context.db)
  const allowed = await auth.api.hasPermission({
    headers: context.headers,
    body: { organizationId, permissions: { card: ["attach"] } }
  })
  if (!allowed.success) {
    throw new ORPCError("FORBIDDEN", { message: "Your role does not allow attach on card" })
  }

  const [owned] = await context.db
    .select({ id: card.id, boardId: card.boardId })
    .from(card)
    .where(and(eq(card.id, input.cardId), eq(card.organizationId, organizationId)))
    .limit(1)

  if (owned === undefined) {
    throw new ORPCError("NOT_FOUND", { message: "Card not found" })
  }

  const attachmentId = crypto.randomUUID()
  const r2Key = await putAttachmentObject(context.attachments, {
    organizationId,
    cardId: input.cardId,
    attachmentId,
    fileName: input.fileName,
    contentType: input.contentType,
    body: input.body
  })

  const createdAt = new Date()

  try {
    await context.db.insert(attachment).values({
      id: attachmentId,
      organizationId,
      cardId: input.cardId,
      fileName: input.fileName,
      contentType: input.contentType,
      byteSize: input.body.byteLength,
      r2Key,
      createdAt
    })
  } catch (error) {
    await deleteAttachmentObject(context.attachments, r2Key)
    throw error
  }

  await broadcastBoardEvent(context.boardRoom, {
    kind: "attachment.added",
    boardId: owned.boardId,
    actorId: context.session.user.id,
    payload: { cardId: input.cardId, attachmentId, fileName: input.fileName },
    at: createdAt.toISOString()
  })

  return {
    id: attachmentId,
    fileName: input.fileName,
    contentType: input.contentType,
    byteSize: input.body.byteLength,
    createdAt: createdAt.toISOString()
  }
}

export async function downloadCardAttachment(context: Context, attachmentId: string) {
  if (context.session === null) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  const organizationId = context.session.session.activeOrganizationId
  if (organizationId === null || organizationId === undefined) {
    throw new ORPCError("FORBIDDEN", { message: "No active organization" })
  }

  const [row] = await context.db
    .select({
      id: attachment.id,
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      r2Key: attachment.r2Key
    })
    .from(attachment)
    .where(and(eq(attachment.id, attachmentId), eq(attachment.organizationId, organizationId)))
    .limit(1)

  if (row === undefined) {
    throw new ORPCError("NOT_FOUND", { message: "Attachment not found" })
  }

  const object = await getAttachmentObject(context.attachments, row.r2Key)
  if (object === null) {
    throw new ORPCError("NOT_FOUND", { message: "Attachment object missing from R2" })
  }

  return { metadata: row, object }
}
