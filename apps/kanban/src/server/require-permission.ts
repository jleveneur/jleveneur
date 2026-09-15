import { ORPCError } from "@orpc/server"

import type { statement } from "@repo/authz"

import { createAuth } from "./auth.ts"
import { orgProcedure } from "./procedures.ts"

export type Permissions = Partial<{
  [K in keyof typeof statement]: (typeof statement)[K][number][]
}>

export function requirePermission(permissions: Permissions) {
  return orgProcedure.use(async ({ context, next }) => {
    const auth = createAuth(context.db)
    const allowed = await auth.api.hasPermission({
      headers: context.headers,
      body: { organizationId: context.organizationId, permissions }
    })

    if (!allowed.success) {
      throw new ORPCError("FORBIDDEN", {
        message: `Your role does not allow ${describe(permissions)}`
      })
    }

    return next()
  })
}

function describe(permissions: Permissions): string {
  return Object.entries(permissions)
    .map(([resource, actions]) => `${actions?.join("/") ?? ""} on ${resource}`)
    .join(", ")
}
