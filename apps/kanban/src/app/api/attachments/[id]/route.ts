import { ORPCError } from "@orpc/server"

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
    return new Response(downloaded.object.body, {
      headers: {
        "content-type": downloaded.metadata.contentType,
        "content-disposition": `inline; filename="${downloaded.metadata.fileName}"`
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
