import { createDb, type Database } from "@/db/client.ts"
import { ensureSchemaOnce } from "@/db/ensure-schema.ts"

import { createAuth, type Session } from "./auth.ts"
import { workerBindings } from "./cloudflare.ts"
import { getLogger } from "./logger.ts"

export type Context = {
  session: Session | null
  headers: Headers
  db: Database
  attachments: R2Bucket
  boardRoom: DurableObjectNamespace
  logger: ReturnType<typeof getLogger>
}

export async function createContext(headers: Headers): Promise<Context> {
  const bindings = workerBindings()
  await ensureSchemaOnce(bindings.DB)
  const db = createDb(bindings.DB)
  const auth = createAuth(db)
  const session = await auth.api.getSession({ headers })

  return {
    session,
    headers,
    db,
    attachments: bindings.ATTACHMENTS,
    boardRoom: bindings.BOARD_ROOM,
    logger: getLogger()
  }
}
