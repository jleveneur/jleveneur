import { anonymousClient } from "better-auth/client/plugins"
import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { ac, roles } from "@repo/authz"

export const authClient = createAuthClient({
  plugins: [anonymousClient(), organizationClient({ ac, roles })]
})

export const { signIn, signOut, useSession } = authClient
