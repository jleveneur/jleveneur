"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem
} from "@repo/ui/components/kanban"
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
import type { BoardSnapshot, CardSummary } from "@/server/board-queries.ts"

import { BoardChrome } from "./board-chrome.tsx"
import { TaskCard } from "./task-card.tsx"
import { TaskDrawer } from "./task-drawer.tsx"
import { useBoardRealtime } from "./use-board-realtime.ts"
import { UserAvatar } from "./user-avatar.tsx"

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

  const presence = useBoardRealtime(
    data.board.id,
    { userId: user.id, name: user.name, image: user.image },
    onEvent
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BoardChrome
        title={data.board.name}
        orgName="Shadowon Outlet"
        search={search}
        onSearch={setSearch}
        priority={priority}
        onPriority={setPriority}
        presence={presence}
        notificationCount={notifications.data?.filter((item) => !item.read).length ?? 0}
        onAdd={() => {
          const first = data.columns[0]
          if (first !== undefined) {
            setDraftColumn(first.id)
          }
        }}
      />
      <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
        {view === "board" ? (
          <div className="flex flex-col gap-4">
            <Kanban
              value={columns}
              onValueChange={setColumns}
              getItemValue={(item) => item.id}
              onMove={(event) => {
                move.mutate({
                  cardId: event.itemId,
                  toColumnId: event.overContainer,
                  position: event.overIndex
                })
              }}
            >
              <KanbanBoard>
                {data.columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    value={column.id}
                    className="rounded-xl bg-muted/40 p-3"
                  >
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-medium" data-column-name={column.name}>
                        {column.name}{" "}
                        <span className="text-muted-foreground">
                          {(columns[column.id] ?? []).length}
                        </span>
                      </h2>
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
                    <KanbanColumnContent value={column.id}>
                      {(columns[column.id] ?? []).map((item) => (
                        <KanbanItem key={item.id} value={item.id}>
                          <TaskCard card={item} onOpen={() => setOpenCardId(item.id)} />
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
