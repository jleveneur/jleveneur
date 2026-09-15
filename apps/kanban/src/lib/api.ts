import { createRouterClient } from "@orpc/server"
import { headers } from "next/headers"

import { createContext } from "@/server/context.ts"
import { appRouter } from "@/server/router.ts"

export const api = createRouterClient(appRouter, {
  context: async () => createContext(await headers())
})
