import { ORPCError } from "@orpc/server"

import { uploadCardAttachment } from "@/server/attachments.ts"
import { createContext } from "@/server/context.ts"

export async function POST(request: Request): Promise<Response> {
  const context = await createContext(request.headers)
  const form = await request.formData()
  const cardIdValue = form.get("cardId")
  const fileValue = form.get("file")

  if (typeof cardIdValue !== "string" || !(fileValue instanceof File)) {
    return Response.json({ message: "cardId and file are required" }, { status: 400 })
  }

  try {
    const created = await uploadCardAttachment(context, {
      cardId: cardIdValue,
      fileName: fileValue.name,
      contentType: fileValue.type === "" ? "application/octet-stream" : fileValue.type,
      body: await fileValue.arrayBuffer()
    })
    return Response.json(created)
  } catch (error) {
    return orpcResponse(error)
  }
}

function orpcResponse(error: unknown): Response {
  if (error instanceof ORPCError) {
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "FORBIDDEN"
          ? 403
          : error.code === "NOT_FOUND"
            ? 404
            : 400
    return Response.json({ message: error.message }, { status })
  }
  throw error
}
