import { api } from "@/lib/api.ts"
import { getSession } from "@/lib/session.ts"

import { KanbanWorkspace } from "./kanban-workspace.tsx"

export async function BoardPage({ view }: { view: "board" | "list" | "table" }) {
  const session = await getSession()
  if (session === null) {
    return null
  }

  const board = await api.board.get()

  return (
    <KanbanWorkspace
      initial={board}
      view={view}
      user={{ id: session.user.id, name: session.user.name, image: session.user.image ?? null }}
    />
  )
}
