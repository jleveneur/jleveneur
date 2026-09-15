"use client"

import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from "@dnd-kit/core"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode
} from "react"

type KanbanColumns<T> = Record<string, T[]>

export type KanbanMoveEvent = {
  activeContainer: string
  overContainer: string
  activeIndex: number
  overIndex: number
  itemId: string
}

type KanbanContextValue = {
  itemIdsByColumn: Record<string, string[]>
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

function useKanban(): KanbanContextValue {
  const value = useContext(KanbanContext)
  if (value === null) {
    throw new Error("Kanban components must be rendered inside <Kanban>")
  }
  return value
}

function asId(id: UniqueIdentifier): string {
  return typeof id === "string" ? id : String(id)
}

export function Kanban<T>({
  value,
  onValueChange,
  getItemValue,
  onMove,
  children,
  className
}: {
  value: KanbanColumns<T>
  onValueChange: (value: KanbanColumns<T>) => void
  getItemValue: (item: T) => string
  onMove?: (event: KanbanMoveEvent) => void
  children: ReactNode
  className?: string
}) {
  const columnIds = useMemo(() => Object.keys(value), [value])

  const findContainer = useCallback(
    (id: UniqueIdentifier) => {
      const key = asId(id)
      if (columnIds.includes(key)) {
        return key
      }
      return columnIds.find((columnId) => {
        const items = value[columnId] ?? []
        return items.some((item) => getItemValue(item) === key)
      })
    },
    [columnIds, getItemValue, value]
  )

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (over === null) {
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)
      if (activeContainer === undefined || overContainer === undefined) {
        return
      }
      if (activeContainer === overContainer) {
        return
      }

      const activeItems = value[activeContainer] ?? []
      const overItems = value[overContainer] ?? []
      const activeIndex = activeItems.findIndex((item) => getItemValue(item) === asId(active.id))
      const overIndex = columnIds.includes(asId(over.id))
        ? overItems.length
        : overItems.findIndex((item) => getItemValue(item) === asId(over.id))
      if (activeIndex < 0) {
        return
      }

      const moving = activeItems[activeIndex]
      if (moving === undefined) {
        return
      }

      const insertAt = overIndex < 0 ? overItems.length : overIndex
      onValueChange({
        ...value,
        [activeContainer]: activeItems.filter((_, index) => index !== activeIndex),
        [overContainer]: [...overItems.slice(0, insertAt), moving, ...overItems.slice(insertAt)]
      })
    },
    [columnIds, findContainer, getItemValue, onValueChange, value]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over === null) {
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)
      if (activeContainer === undefined || overContainer === undefined) {
        return
      }

      const activeItems = value[activeContainer] ?? []
      const overItems = value[overContainer] ?? []
      const activeIndex = activeItems.findIndex((item) => getItemValue(item) === asId(active.id))
      const overIndex = columnIds.includes(asId(over.id))
        ? overItems.length
        : overItems.findIndex((item) => getItemValue(item) === asId(over.id))

      if (activeIndex < 0) {
        return
      }

      if (activeContainer === overContainer && overIndex >= 0 && activeIndex !== overIndex) {
        onValueChange({
          ...value,
          [activeContainer]: arrayMove(activeItems, activeIndex, overIndex)
        })
      }

      onMove?.({
        activeContainer,
        overContainer,
        activeIndex,
        overIndex: overIndex < 0 ? overItems.length : overIndex,
        itemId: asId(active.id)
      })
    },
    [columnIds, findContainer, getItemValue, onMove, onValueChange, value]
  )

  const itemIdsByColumn = useMemo(() => {
    const ids: Record<string, string[]> = {}
    for (const columnId of columnIds) {
      ids[columnId] = (value[columnId] ?? []).map((item) => getItemValue(item))
    }
    return ids
  }, [columnIds, getItemValue, value])

  const context = useMemo(() => ({ itemIdsByColumn }), [itemIdsByColumn])

  return (
    <KanbanContext.Provider value={context}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div data-slot="kanban" className={className}>
          {children}
        </div>
      </DndContext>
    </KanbanContext.Provider>
  )
}

export function KanbanBoard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      data-slot="kanban-board"
      className={cn("flex min-h-0 gap-4 overflow-x-auto pb-4", className)}
    >
      {children}
    </div>
  )
}

export function KanbanColumn({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { setNodeRef } = useDroppable({ id: value })

  return (
    <div
      ref={setNodeRef}
      data-slot="kanban-column"
      data-value={value}
      className={cn("flex w-80 shrink-0 flex-col gap-3", className)}
    >
      {children}
    </div>
  )
}

export function KanbanColumnContent({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { itemIdsByColumn } = useKanban()
  const items = itemIdsByColumn[value] ?? []

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div
        data-slot="kanban-column-content"
        className={cn("flex min-h-40 flex-col gap-3", className)}
      >
        {children}
      </div>
    </SortableContext>
  )
}

export function KanbanItem({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-slot="kanban-item"
      data-value={value}
      data-dragging={isDragging}
      className={cn("cursor-grab", isDragging && "cursor-grabbing opacity-50", className)}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
