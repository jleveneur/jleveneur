import { ORPCError } from "@orpc/server"

import { attachmentContentDisposition } from "@/lib/r2-key.ts"
import { downloadCardAttachment } from "@/server/attachments.ts"
import { createContext } from "@/server/context.ts"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params
  const appContext = await createContext(request.headers)

  try {
    const downloaded = await downloadCardAttachment(appContext, id)
    const contentType =
      downloaded.object.httpMetadata?.contentType ?? downloaded.metadata.contentType
    return new Response(downloaded.object.body, {
      headers: {
        "content-type": contentType,
        "content-disposition": attachmentContentDisposition(downloaded.metadata.fileName)
      }
    })
  } catch (error) {
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
}
