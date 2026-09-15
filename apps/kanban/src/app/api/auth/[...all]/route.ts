import { toNextJsHandler } from "better-auth/next-js"

import { createAuth } from "@/server/auth.ts"
import { createContext } from "@/server/context.ts"

async function handler(request: Request): Promise<Response> {
  const context = await createContext(request.headers)
  return toNextJsHandler(createAuth(context.db)).GET(request)
}

export async function GET(request: Request): Promise<Response> {
  return handler(request)
}

export async function POST(request: Request): Promise<Response> {
  const context = await createContext(request.headers)
  return toNextJsHandler(createAuth(context.db)).POST(request)
}
