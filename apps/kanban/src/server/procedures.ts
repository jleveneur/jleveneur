import { ORPCError, os } from "@orpc/server"

import type { Context } from "./context.ts"

export const publicProcedure = os.$context<Context>()

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
  if (context.session === null) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  return next({ context: { user: context.session.user } })
})

export const orgProcedure = protectedProcedure.use(({ context, next }) => {
  const organizationId = context.session?.session.activeOrganizationId

  if (organizationId === null || organizationId === undefined) {
    throw new ORPCError("FORBIDDEN", { message: "No active organization" })
  }

  return next({ context: { organizationId } })
})
