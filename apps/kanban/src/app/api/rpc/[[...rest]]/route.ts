import { ORPCError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"

import { createContext } from "@/server/context.ts"
import { getLogger } from "@/server/logger.ts"
import { appRouter } from "@/server/router.ts"

const EXPECTED = new Set(["UNAUTHORIZED", "FORBIDDEN", "BAD_REQUEST", "NOT_FOUND", "CONFLICT"])

function expectedCode(error: unknown): string | null {
  if (!(error instanceof ORPCError)) {
    return null
  }

  const code: unknown = error.code
  return typeof code === "string" && EXPECTED.has(code) ? code : null
}

const handler = new RPCHandler(appRouter, {
  allowMethods: ["POST"],
  clientInterceptors: [
    async (options) => {
      try {
        return await options.next()
      } catch (error) {
        const path = options.path.join(".")
        const expected = expectedCode(error)
        const logger = getLogger()

        if (expected === null) {
          logger.error({ err: error, path }, "rpc failed")
        } else {
          logger.warn({ path, code: expected }, "rpc rejected")
        }

        throw error
      }
    }
  ]
})

export async function POST(request: Request): Promise<Response> {
  const { matched, response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext(request.headers)
  })

  if (!matched) {
    getLogger().warn({ url: request.url }, "rpc route not matched")
    return new Response("Not found", { status: 404 })
  }

  return response
}
