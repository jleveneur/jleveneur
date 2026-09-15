import { headers } from "next/headers"

import { createAuth, type Session } from "@/server/auth.ts"
import { createContext } from "@/server/context.ts"

export async function getSession(): Promise<Session | null> {
  const context = await createContext(await headers())
  const auth = createAuth(context.db)
  return auth.api.getSession({ headers: await headers() })
}
