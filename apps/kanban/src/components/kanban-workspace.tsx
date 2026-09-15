"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GripVerticalIcon, PlusIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"

import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  identifierToString
} from "@repo/ui/components/kanban"
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui/components/table"

import { matchesCardFilters, type Priority } from "@/lib/card-filters.ts"
import { orpc, rpc } from "@/lib/orpc.ts"
import type { BoardEvent } from "@/lib/realtime-types.ts"
import type { BoardNotification, BoardSnapshot, CardSummary } from "@/server/board-queries.ts"

import { AppSidebar } from "./app-sidebar.tsx"
import { BoardChrome } from "./board-chrome.tsx"
import { SiteHeader } from "./site-header.tsx"
import { TaskCard } from "./task-card.tsx"
import { TaskDrawer } from "./task-drawer.tsx"
import { useBoardRealtime } from "./use-board-realtime.ts"
import { UserAvatar } from "./user-avatar.tsx"

const workspaceSidebarStyle: CSSProperties = {}
Object.assign(workspaceSidebarStyle, {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)"
})

export function KanbanWorkspace({
  initial,
  view,
  user
}: {
  initial: BoardSnapshot
  view: "board" | "list" | "table"
  user: { id: string; name: string; image: string | null }
}) {
  const queryClient = useQueryClient()
  const board = useQuery({
    ...orpc.board.get.queryOptions(),
    initialData: initial
  })
  const notifications = useQuery(orpc.notification.list.queryOptions())
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState<Priority | "all">("all")
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftColumn, setDraftColumn] = useState<string | null>(null)
  const [columnName, setColumnName] = useState("")

  const data = board.data ?? initial
  const filtered = useMemo(
    () => data.cards.filter((card) => matchesCardFilters(card, search, priority)),
    [data.cards, priority, search]
  )

  const serverColumns = useMemo(
    () => groupCardsByColumn(data.columns, filtered),
    [data.columns, filtered]
  )
  const [columns, setColumns] = useState(serverColumns)

  useEffect(() => {
    setColumns(serverColumns)
  }, [serverColumns])

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries()
  }, [queryClient])

  const onEvent = useCallback(
    (_event: BoardEvent) => {
      refresh()
    },
    [refresh]
  )

  const onOpenCard = useCallback((cardId: string) => {
    setOpenCardId(cardId)
  }, [])

  const markRead = useMutation({
    mutationFn: (notificationId: string) => rpc.notification.markRead({ notificationId }),
    onSuccess: refresh
  })

  const onNotificationOpen = (item: BoardNotification) => {
    if (item.cardId !== null) {
      setOpenCardId(item.cardId)
    }
    if (!item.read) {
      markRead.mutate(item.id)
    }
  }

  const presence = useBoardRealtime(
    data.board.id,
    { userId: user.id, name: user.name, image: user.image },
    onEvent,
    onOpenCard
  )

  const move = useMutation({
    mutationFn: (input: { cardId: string; toColumnId: string; position: number }) =>
      rpc.card.move(input),
    onError: () => {
      setColumns(serverColumns)
    },
    onSuccess: refresh
  })

  const createCard = useMutation({
    mutationFn: (input: { columnId: string; title: string }) =>
      rpc.card.create({
        boardId: data.board.id,
        columnId: input.columnId,
        title: input.title,
        description: ""
      }),
    onSuccess: () => {
      setDraftTitle("")
      setDraftColumn(null)
      refresh()
    }
  })

  const createColumn = useMutation({
    mutationFn: (name: string) => rpc.column.create({ boardId: data.board.id, name }),
    onSuccess: () => {
      setColumnName("")
      refresh()
    }
  })

  const startAdd = () => {
    const first = data.columns[0]
    if (first !== undefined) {
      setDraftColumn(first.id)
    }
  }

  return (
    <SidebarProvider style={workspaceSidebarStyle}>
      <AppSidebar user={user} onAdd={startAdd} />
      <SidebarInset>
        <SiteHeader
          title={data.board.name}
          search={search}
          onSearch={setSearch}
          presence={presence}
          notifications={notifications.data ?? []}
          onNotificationOpen={onNotificationOpen}
          onAdd={startAdd}
        />
        <div className="@container/main flex min-h-0 flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <BoardChrome
            search={search}
            onSearch={setSearch}
            priority={priority}
            onPriority={setPriority}
          />
          <div className="min-h-0 flex-1 overflow-auto px-4 lg:px-6">
            {view === "board" ? (
              <div className="flex flex-col gap-4">
                <Kanban
                  value={columns}
                  onValueChange={setColumns}
                  getItemValue={(item) => item.id}
                  restoreOnCancel
                  onValueCommit={(_next, meta) => {
                    if (meta.kind !== "item") {
                      return
                    }
                    move.mutate({
                      cardId: identifierToString(meta.event.active.id),
                      toColumnId: meta.overContainer,
                      position: meta.overIndex
                    })
                  }}
                >
                  <KanbanBoard className="flex auto-rows-auto grid-cols-none gap-4 overflow-x-auto pb-2">
                    {data.columns.map((column) => (
                      <KanbanColumn
                        key={column.id}
                        value={column.id}
                        className="w-80 shrink-0 rounded-xl bg-muted/50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 px-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <KanbanColumnHandle className="opacity-100">
                              <GripVerticalIcon />
                              <span className="sr-only">Reorder {column.name}</span>
                            </KanbanColumnHandle>
                            <h2
                              className="inline-flex items-center gap-2 truncate text-sm font-medium"
                              data-column-name={column.name}
                            >
                              {column.name}
                              <Badge variant="secondary">{(columns[column.id] ?? []).length}</Badge>
                            </h2>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Add card to ${column.name}`}
                            onClick={() => {
                              setDraftColumn(column.id)
                            }}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                        <KanbanColumnContent
                          value={column.id}
                          className="min-h-40 max-h-[min(36rem,calc(100dvh-18rem))] overflow-y-auto"
                        >
                          {(columns[column.id] ?? []).map((item) => (
                            <KanbanItem key={item.id} value={item.id}>
                              <KanbanItemHandle>
                                <TaskCard card={item} onOpen={() => setOpenCardId(item.id)} />
                              </KanbanItemHandle>
                            </KanbanItem>
                          ))}
                        </KanbanColumnContent>
                        {draftColumn === column.id ? (
                          <form
                            className="flex flex-col gap-2"
                            noValidate
                            onSubmit={(event) => {
                              event.preventDefault()
                              if (draftTitle.trim() !== "") {
                                createCard.mutate({ columnId: column.id, title: draftTitle })
                              }
                            }}
                          >
                            <Input
                              autoFocus
                              value={draftTitle}
                              onChange={(event) => {
                                setDraftTitle(event.target.value)
                              }}
                              placeholder="Card title"
                              aria-label="New card title"
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">
                                Create
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDraftColumn(null)
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : null}
                      </KanbanColumn>
                    ))}
                  </KanbanBoard>
                  <KanbanOverlay>
                    {({ value, variant }) => {
                      if (variant !== "item") {
                        return <div className="size-full rounded-xl bg-muted" />
                      }
                      const card = findCard(columns, identifierToString(value))
                      if (card === undefined) {
                        return null
                      }
                      return <TaskCard card={card} onOpen={() => undefined} />
                    }}
                  </KanbanOverlay>
                </Kanban>
                <form
                  className="flex max-w-sm gap-2"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (columnName.trim() !== "") {
                      createColumn.mutate(columnName)
                    }
                  }}
                >
                  <Input
                    value={columnName}
                    onChange={(event) => {
                      setColumnName(event.target.value)
                    }}
                    placeholder="Add a column"
                    aria-label="New column name"
                  />
                  <Button type="submit" variant="outline">
                    Add column
                  </Button>
                </form>
              </div>
            ) : null}

            {view === "list" ? (
              <div className="flex flex-col gap-6">
                {data.columns.map((column) => (
                  <section key={column.id} className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium">{column.name}</h2>
                    {(columns[column.id] ?? []).map((item) => (
                      <TaskCard key={item.id} card={item} onOpen={() => setOpenCardId(item.id)} />
                    ))}
                  </section>
                ))}
              </div>
            ) : null}

            {view === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assignees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const status = data.columns.find((column) => column.id === item.columnId)
                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setOpenCardId(item.id)
                        }}
                      >
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{status?.name ?? ""}</TableCell>
                        <TableCell>{item.priority}</TableCell>
                        <TableCell>{item.dueDate ?? ""}</TableCell>
                        <TableCell>{item.progress}%</TableCell>
                        <TableCell>
                          <div className="flex [&>*:not(:first-child)]:-ml-2">
                            {item.assignees.map((person) => (
                              <UserAvatar key={person.id} name={person.name} image={person.image} />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
          </div>
          <TaskDrawer
            cardId={openCardId}
            open={openCardId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setOpenCardId(null)
              }
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function groupCardsByColumn(
  columns: BoardSnapshot["columns"],
  cards: CardSummary[]
): Record<string, CardSummary[]> {
  const grouped: Record<string, CardSummary[]> = {}
  for (const column of columns) {
    grouped[column.id] = cards
      .filter((card) => card.columnId === column.id)
      .toSorted((a, b) => a.position - b.position)
  }
  return grouped
}

function findCard(columns: Record<string, CardSummary[]>, cardId: string): CardSummary | undefined {
  for (const items of Object.values(columns)) {
    const found = items.find((item) => item.id === cardId)
    if (found !== undefined) {
      return found
    }
  }
  return undefined
}
