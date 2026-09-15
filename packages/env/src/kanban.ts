import { z } from "zod"

import { kanbanServer } from "./schema.ts"

const schema = z.object(kanbanServer)

export type KanbanEnv = z.infer<typeof schema>

/**
 * Validates the Kanban worker's wrangler vars.
 *
 * Cloudflare bindings are not in this object. Call this with the string vars
 * from `cloudflare:workers` (or `.dev.vars` locally) so a missing secret fails
 * at the edge instead of inside Better Auth.
 */
export function parseKanbanEnv(input: unknown): KanbanEnv {
  return schema.parse(input)
}
