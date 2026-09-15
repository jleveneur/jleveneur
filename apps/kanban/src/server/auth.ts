import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { anonymous } from "better-auth/plugins"
import { organization } from "better-auth/plugins/organization"
import { eq } from "drizzle-orm"

import { ac, roles } from "@repo/authz"

import type { Database } from "@/db/client.ts"
import * as schema from "@/db/schema.ts"
import { ensureDemoWorkspace } from "@/db/seed.ts"

import { workerVars } from "./cloudflare.ts"

const DAY_IN_SECONDS = 60 * 60 * 24

export function createAuth(db: Database) {
  const vars = workerVars()

  return betterAuth({
    baseURL: vars.BETTER_AUTH_URL,
    secret: vars.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        organization: schema.organization,
        member: schema.member,
        invitation: schema.invitation
      }
    }),
    emailAndPassword: { enabled: false },
    session: {
      expiresIn: DAY_IN_SECONDS * 30,
      updateAge: DAY_IN_SECONDS,
      cookieCache: { enabled: true, maxAge: 5 * 60 }
    },
    rateLimit: { enabled: vars.AUTH_RATE_LIMIT === "on" },
    advanced: {
      useSecureCookies: new URL(vars.BETTER_AUTH_URL).protocol === "https:"
    },
    plugins: [
      anonymous(),
      organization({
        ac,
        roles,
        creatorRole: "owner"
      })
    ],
    databaseHooks: {
      session: {
        create: {
          before: async (created) => ({
            data: {
              ...created,
              activeOrganizationId: await ensureDemoWorkspace(db, created.userId)
            }
          })
        },
        update: {
          after: async (updated) => {
            const active = updated["activeOrganizationId"]
            if (typeof active === "string") {
              await db
                .update(schema.user)
                .set({ lastActiveOrganizationId: active })
                .where(eq(schema.user.id, updated.userId))
            }
          }
        }
      }
    }
  })
}

export type Auth = ReturnType<typeof createAuth>
export type Session = Auth["$Infer"]["Session"]
