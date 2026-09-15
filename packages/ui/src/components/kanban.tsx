"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DropAnimation,
  type Modifiers,
  type UniqueIdentifier
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges
} from "@dnd-kit/sortable"
import { CSS, type Transform } from "@dnd-kit/utilities"
import { cn } from "cn"
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ComponentProps,
  type ReactNode
} from "react"
import { createPortal } from "react-dom"

// ReUI Base Kanban — https://reui.io/docs/components/base/kanban
// Source: @reui registry item `kanban` (base-nova). Types are narrowed for
// this repo (no `any`, noUncheckedIndexedAccess). Behaviour matches ReUI.

type KanbanContextValue = {
  itemIdsByColumn: Record<string, string[]>
  columnIds: string[]
  activeId: UniqueIdentifier | null
  setActiveId: (id: UniqueIdentifier | null) => void
  findContainer: (id: UniqueIdentifier) => string | undefined
  isColumn: (id: UniqueIdentifier) => boolean
  modifiers?: Modifiers
}

const KanbanContext = createContext<KanbanContextValue>({
  itemIdsByColumn: {},
  columnIds: [],
  activeId: null,
  setActiveId: () => {
    return
  },
  findContainer: () => undefined,
  isColumn: () => false
})

const EMPTY_DRAGGABLE_ATTRIBUTES: DraggableAttributes = {
  role: "button",
  tabIndex: 0,
  "aria-disabled": false,
  "aria-pressed": undefined,
  "aria-roledescription": "sortable",
  "aria-describedby": ""
}

const ColumnContext = createContext<{
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners | undefined
  isDragging?: boolean
  disabled?: boolean
}>({
  attributes: EMPTY_DRAGGABLE_ATTRIBUTES,
  listeners: undefined,
  isDragging: false,
  disabled: false
})

const ItemContext = createContext<{
  listeners: DraggableSyntheticListeners | undefined
  isDragging?: boolean
  disabled?: boolean
}>({
  listeners: undefined,
  isDragging: false,
  disabled: false
})

const IsOverlayContext = createContext(false)

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4"
      }
    }
  })
}

const subscribeToNothing = () => () => {
  return
}
const getIsMounted = () => true
const getIsMountedOnServer = () => false

const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 10 } }
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 5 }
}
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates
}
const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.Always }
}

export function identifierToString(id: UniqueIdentifier): string {
  return typeof id === "string" ? id : String(id)
}

function itemsOf<T>(columns: Record<string, T[]>, columnId: string): T[] | undefined {
  return Object.hasOwn(columns, columnId) ? columns[columnId] : undefined
}

function sortableStyle(transition: string | undefined, transform: Transform | null): CSSProperties {
  const transformCss = CSS.Transform.toString(transform)
  return {
    ...(transition === undefined ? {} : { transition }),
    ...(transformCss === undefined ? {} : { transform: transformCss })
  }
}

export type KanbanMoveEvent = {
  event: DragEndEvent
  activeContainer: string
  activeIndex: number
  overContainer: string
  overIndex: number
}

export type KanbanCommitMeta<T> = {
  kind: "item" | "column"
  event: DragEndEvent
  activeContainer: string
  activeIndex: number
  overContainer: string
  overIndex: number
  previousValue: Record<string, T[]>
}

export type KanbanRootProps<T> = Omit<
  useRender.ComponentProps<"div">,
  "children" | "onDragStart" | "onDragEnd"
> & {
  value: Record<string, T[]>
  onValueChange: (value: Record<string, T[]>) => void
  getItemValue: (item: T) => string
  children: ReactNode
  onMove?: (event: KanbanMoveEvent) => void
  onValueCommit?: (value: Record<string, T[]>, meta: KanbanCommitMeta<T>) => void
  restoreOnCancel?: boolean
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragCancel?: (event: DragCancelEvent) => void
  accessibility?: ComponentProps<typeof DndContext>["accessibility"]
  modifiers?: Modifiers
}

function Kanban<T>({
  value,
  onValueChange,
  getItemValue,
  children,
  className,
  render,
  onMove,
  onValueCommit,
  restoreOnCancel = false,
  onDragStart,
  onDragEnd,
  onDragCancel,
  accessibility,
  modifiers,
  ...props
}: KanbanRootProps<T>) {
  const columns = value
  const setColumns = onValueChange
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const valueRef = useRef(value)
  const getItemValueRef = useRef(getItemValue)
  useLayoutEffect(() => {
    valueRef.current = value
    getItemValueRef.current = getItemValue
  })
  const dragOriginRef = useRef<{
    value: Record<string, T[]>
    container: string | undefined
    index: number
  } | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS)
  )

  const columnIds = useMemo(() => {
    const keys = Object.keys(columns)
    const seen = new Set<string>()
    for (const key of keys) {
      const columnItems = itemsOf(columns, key)
      if (columnItems === undefined) {
        continue
      }
      for (const item of columnItems) {
        const itemId = getItemValue(item)
        if (seen.has(itemId)) {
          console.warn(
            `[Kanban] Duplicate item id "${itemId}". Item ids must be unique across all columns, or drag and drop will misbehave.`
          )
          break
        }
        seen.add(itemId)
      }
    }
    return keys
  }, [columns, getItemValue])

  const isColumn = useCallback(
    (id: UniqueIdentifier) => columnIds.includes(identifierToString(id)),
    [columnIds]
  )

  const findContainer = useCallback(
    (id: UniqueIdentifier) => {
      if (isColumn(id)) {
        return identifierToString(id)
      }
      return columnIds.find((key) => {
        const columnItems = itemsOf(columns, key)
        return columnItems?.some((item) => getItemValue(item) === identifierToString(id)) ?? false
      })
    },
    [columns, columnIds, getItemValue, isColumn]
  )

  const commitChange = useCallback(
    (finalValue: Record<string, T[]>, event: DragEndEvent, kind: "item" | "column") => {
      if (onValueCommit === undefined) {
        return
      }
      const origin = dragOriginRef.current
      if (origin === null) {
        return
      }

      const id = identifierToString(event.active.id)

      if (kind === "column") {
        const keys = Object.keys(finalValue)
        const overIndex = keys.indexOf(id)
        if (overIndex === -1 || overIndex === origin.index) {
          return
        }
        onValueCommit(finalValue, {
          kind: "column",
          event,
          activeContainer: id,
          activeIndex: origin.index,
          overContainer: event.over === null ? id : identifierToString(event.over.id),
          overIndex,
          previousValue: origin.value
        })
        return
      }

      const getId = getItemValueRef.current
      let overContainer: string | undefined
      let overIndex = -1
      for (const key of Object.keys(finalValue)) {
        const columnItems = itemsOf(finalValue, key)
        if (columnItems === undefined) {
          continue
        }
        const found = columnItems.findIndex((item) => getId(item) === id)
        if (found !== -1) {
          overContainer = key
          overIndex = found
          break
        }
      }
      if (overContainer === undefined) {
        return
      }
      if (overContainer === origin.container && overIndex === origin.index) {
        return
      }
      onValueCommit(finalValue, {
        kind: "item",
        event,
        activeContainer: origin.container ?? overContainer,
        activeIndex: origin.index,
        overContainer,
        overIndex,
        previousValue: origin.value
      })
    },
    [onValueCommit]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id)
      onDragStart?.(event)

      if (onValueCommit !== undefined || restoreOnCancel) {
        const snapshot = valueRef.current
        const id = identifierToString(event.active.id)
        const keys = Object.keys(snapshot)
        if (keys.includes(id)) {
          dragOriginRef.current = {
            value: snapshot,
            container: id,
            index: keys.indexOf(id)
          }
        } else {
          const getId = getItemValueRef.current
          let container: string | undefined
          let index = -1
          for (const key of keys) {
            const columnItems = itemsOf(snapshot, key)
            if (columnItems === undefined) {
              continue
            }
            const found = columnItems.findIndex((item) => getId(item) === id)
            if (found !== -1) {
              container = key
              index = found
              break
            }
          }
          dragOriginRef.current = { value: snapshot, container, index }
        }
      }
    },
    [onDragStart, onValueCommit, restoreOnCancel]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (onMove !== undefined) {
        return
      }

      const { active, over } = event
      if (over === null) {
        return
      }

      if (isColumn(active.id)) {
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)

      if (activeContainer === undefined || overContainer === undefined) {
        return
      }

      const activeItems = itemsOf(columns, activeContainer)
      const overItems = itemsOf(columns, overContainer)
      if (activeItems === undefined || overItems === undefined) {
        return
      }

      if (activeContainer !== overContainer) {
        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === identifierToString(active.id)
        )
        let overIndex = overItems.findIndex(
          (item) => getItemValue(item) === identifierToString(over.id)
        )

        if (isColumn(over.id)) {
          overIndex = overItems.length
        }

        const movedItem = activeItems[activeIndex]
        if (movedItem === undefined || activeIndex < 0) {
          return
        }

        const newActiveItems = activeItems.filter((_, index) => index !== activeIndex)
        const insertAt = overIndex < 0 ? overItems.length : overIndex
        const newOverItems = [
          ...overItems.slice(0, insertAt),
          movedItem,
          ...overItems.slice(insertAt)
        ]

        setColumns({
          ...columns,
          [activeContainer]: newActiveItems,
          [overContainer]: newOverItems
        })
        return
      }

      const container = activeContainer
      const containerItems = itemsOf(columns, container)
      if (containerItems === undefined) {
        return
      }
      const activeIndex = containerItems.findIndex(
        (item) => getItemValue(item) === identifierToString(active.id)
      )
      const overIndex = containerItems.findIndex(
        (item) => getItemValue(item) === identifierToString(over.id)
      )

      if (activeIndex !== overIndex && activeIndex >= 0 && overIndex >= 0) {
        setColumns({
          ...columns,
          [container]: arrayMove(containerItems, activeIndex, overIndex)
        })
      }
    },
    [findContainer, getItemValue, isColumn, setColumns, columns, onMove]
  )

  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      const origin = dragOriginRef.current

      if (restoreOnCancel && origin !== null && onMove === undefined) {
        setColumns(origin.value)
      } else if (onValueCommit !== undefined && origin !== null && onMove === undefined) {
        commitChange(valueRef.current, event, "item")
      }

      dragOriginRef.current = null
      setActiveId(null)
      onDragCancel?.(event)
    },
    [restoreOnCancel, onMove, onValueCommit, setColumns, onDragCancel, commitChange]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      onDragEnd?.(event)

      if (over === null) {
        commitChange(valueRef.current, event, "item")
        dragOriginRef.current = null
        return
      }

      if (onMove !== undefined && !isColumn(active.id)) {
        const activeContainer = findContainer(active.id)
        const overContainer = findContainer(over.id)

        if (activeContainer !== undefined && overContainer !== undefined) {
          const activeItems = itemsOf(columns, activeContainer)
          const overItems = itemsOf(columns, overContainer)
          if (activeItems !== undefined && overItems !== undefined) {
            const activeIndex = activeItems.findIndex(
              (item) => getItemValue(item) === identifierToString(active.id)
            )
            const overIndex = isColumn(over.id)
              ? overItems.length
              : overItems.findIndex((item) => getItemValue(item) === identifierToString(over.id))

            onMove({
              event,
              activeContainer,
              activeIndex,
              overContainer,
              overIndex
            })
          }
        }
        dragOriginRef.current = null
        return
      }

      if (isColumn(active.id) && isColumn(over.id)) {
        const activeIndex = columnIds.indexOf(identifierToString(active.id))
        const overIndex = columnIds.indexOf(identifierToString(over.id))
        if (activeIndex !== overIndex && activeIndex >= 0 && overIndex >= 0) {
          const newOrder = arrayMove(Object.keys(columns), activeIndex, overIndex)
          const newColumns: Record<string, T[]> = {}
          for (const key of newOrder) {
            const columnItems = itemsOf(columns, key)
            if (columnItems !== undefined) {
              newColumns[key] = columnItems
            }
          }
          setColumns(newColumns)
          commitChange(newColumns, event, "column")
        }
        dragOriginRef.current = null
        return
      }

      if (isColumn(active.id)) {
        dragOriginRef.current = null
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over.id)

      if (
        activeContainer !== undefined &&
        overContainer !== undefined &&
        activeContainer === overContainer
      ) {
        const containerItems = itemsOf(columns, activeContainer)
        if (containerItems === undefined) {
          commitChange(columns, event, "item")
          dragOriginRef.current = null
          return
        }
        const activeIndex = containerItems.findIndex(
          (item) => getItemValue(item) === identifierToString(active.id)
        )
        const overIndex = containerItems.findIndex(
          (item) => getItemValue(item) === identifierToString(over.id)
        )

        if (activeIndex !== overIndex && activeIndex >= 0 && overIndex >= 0) {
          const newColumns = {
            ...columns,
            [activeContainer]: arrayMove(containerItems, activeIndex, overIndex)
          }
          setColumns(newColumns)
          commitChange(newColumns, event, "item")
        } else {
          commitChange(columns, event, "item")
        }
      } else {
        commitChange(columns, event, "item")
      }
      dragOriginRef.current = null
    },
    [
      columnIds,
      columns,
      findContainer,
      getItemValue,
      isColumn,
      setColumns,
      onMove,
      onDragEnd,
      commitChange
    ]
  )

  const itemIdsByColumn = useMemo(() => {
    const ids: Record<string, string[]> = {}
    for (const columnId of columnIds) {
      const columnItems = itemsOf(columns, columnId)
      ids[columnId] = columnItems === undefined ? [] : columnItems.map(getItemValue)
    }
    return ids
  }, [columnIds, columns, getItemValue])

  const contextValue = useMemo<KanbanContextValue>(() => {
    const next: KanbanContextValue = {
      itemIdsByColumn,
      columnIds,
      activeId,
      setActiveId,
      findContainer,
      isColumn
    }
    if (modifiers !== undefined) {
      next.modifiers = modifiers
    }
    return next
  }, [itemIdsByColumn, columnIds, activeId, findContainer, isColumn, modifiers])

  const defaultProps = {
    "data-slot": "kanban",
    "data-dragging": activeId !== null,
    className: cn(activeId !== null && "cursor-grabbing!", className),
    children
  }

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        {...(modifiers === undefined ? {} : { modifiers })}
        {...(accessibility === undefined ? {} : { accessibility })}
        measuring={MEASURING_CONFIG}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {useRender({
          defaultTagName: "div",
          render,
          props: mergeProps<"div">(defaultProps, props)
        })}
      </DndContext>
    </KanbanContext.Provider>
  )
}

export type KanbanBoardProps = useRender.ComponentProps<"div">

function KanbanBoard({ className, render, ...props }: KanbanBoardProps) {
  const { columnIds } = useContext(KanbanContext)

  const defaultProps = {
    "data-slot": "kanban-board",
    className: cn("grid auto-rows-fr gap-4 sm:grid-cols-3", className),
    children: props.children
  }

  return (
    <SortableContext items={columnIds} strategy={rectSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props)
      })}
    </SortableContext>
  )
}

export type KanbanColumnProps = useRender.ComponentProps<"div"> & {
  value: string
  disabled?: boolean
}

function KanbanColumn({ value, className, render, disabled, ...props }: KanbanColumnProps) {
  const isOverlay = useContext(IsOverlayContext)

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging
  } = useSortable({
    id: value,
    disabled: disabled === true || isOverlay,
    animateLayoutChanges
  })

  const { activeId, isColumn } = useContext(KanbanContext)
  const isColumnDragging = activeId === null ? false : isColumn(activeId)
  const style = sortableStyle(transition, transform)

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": true,
        className: cn("group/kanban-column flex flex-col", className),
        children: props.children
      }
    : {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": isSortableDragging,
        "data-disabled": disabled,
        ref: setNodeRef,
        style,
        className: cn(
          "group/kanban-column flex flex-col",
          isSortableDragging && "opacity-50 z-50",
          disabled === true && "opacity-50",
          className
        ),
        children: props.children
      }

  return (
    <ColumnContext.Provider
      value={
        isOverlay
          ? {
              attributes: EMPTY_DRAGGABLE_ATTRIBUTES,
              listeners: undefined,
              isDragging: true,
              disabled: false
            }
          : {
              attributes,
              listeners,
              isDragging: isColumnDragging,
              ...(disabled === undefined ? {} : { disabled })
            }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props)
      })}
    </ColumnContext.Provider>
  )
}

export type KanbanColumnHandleProps = useRender.ComponentProps<"div"> & {
  cursor?: boolean
}

function KanbanColumnHandle({
  className,
  render,
  cursor = true,
  ...props
}: KanbanColumnHandleProps) {
  const { attributes, listeners, isDragging, disabled } = useContext(ColumnContext)

  const defaultProps = {
    "data-slot": "kanban-column-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...attributes,
    ...listeners,
    className: cn(
      "opacity-0 transition-opacity group-hover/kanban-column:opacity-100",
      cursor && (isDragging === true ? "cursor-grabbing!" : "cursor-grab!"),
      className
    ),
    children: props.children
  }

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props)
  })
}

export type KanbanItemProps = useRender.ComponentProps<"div"> & {
  value: string
  disabled?: boolean
}

function KanbanItem({ value, className, render, disabled, ...props }: KanbanItemProps) {
  const isOverlay = useContext(IsOverlayContext)

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging
  } = useSortable({
    id: value,
    disabled: disabled === true || isOverlay,
    animateLayoutChanges
  })

  const { activeId, isColumn } = useContext(KanbanContext)
  const isItemDragging = activeId === null ? false : !isColumn(activeId)
  const style = sortableStyle(transition, transform)

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": true,
        className: cn(className),
        children: props.children
      }
    : {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": isSortableDragging,
        "data-disabled": disabled,
        ref: setNodeRef,
        style,
        ...attributes,
        className: cn(
          isSortableDragging && "opacity-50 z-50",
          disabled === true && "opacity-50",
          className
        ),
        children: props.children
      }

  return (
    <ItemContext.Provider
      value={
        isOverlay
          ? { listeners: undefined, isDragging: true, disabled: false }
          : {
              listeners,
              isDragging: isItemDragging,
              ...(disabled === undefined ? {} : { disabled })
            }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props)
      })}
    </ItemContext.Provider>
  )
}

export type KanbanItemHandleProps = useRender.ComponentProps<"div"> & {
  cursor?: boolean
}

function KanbanItemHandle({ className, render, cursor = true, ...props }: KanbanItemHandleProps) {
  const { listeners, isDragging, disabled } = useContext(ItemContext)

  const defaultProps = {
    "data-slot": "kanban-item-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...listeners,
    className: cn(cursor && (isDragging === true ? "cursor-grabbing!" : "cursor-grab!"), className),
    children: props.children
  }

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props)
  })
}

export type KanbanColumnContentProps = useRender.ComponentProps<"div"> & {
  value: string
}

function KanbanColumnContent({ value, className, render, ...props }: KanbanColumnContentProps) {
  const { itemIdsByColumn } = useContext(KanbanContext)

  const itemIds = useMemo(() => {
    const ids = Object.hasOwn(itemIdsByColumn, value) ? itemIdsByColumn[value] : undefined
    if (ids === undefined) {
      throw new Error(
        `KanbanColumnContent: column "${value}" was not found in the Kanban value. ` +
          `Available columns: ${Object.keys(itemIdsByColumn).join(", ") || "(none)"}.`
      )
    }
    return ids
  }, [itemIdsByColumn, value])

  const defaultProps = {
    "data-slot": "kanban-column-content",
    className: cn("flex flex-col gap-2", className),
    children: props.children
  }

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props)
      })}
    </SortableContext>
  )
}

export type KanbanOverlayProps = Omit<ComponentProps<typeof DragOverlay>, "children"> & {
  children?:
    | ReactNode
    | ((params: { value: UniqueIdentifier; variant: "column" | "item" }) => ReactNode)
}

function KanbanOverlay({ children, className, ...props }: KanbanOverlayProps) {
  const { activeId, isColumn, modifiers } = useContext(KanbanContext)
  const mounted = useSyncExternalStore(subscribeToNothing, getIsMounted, getIsMountedOnServer)

  const variant = activeId === null ? "item" : isColumn(activeId) ? "column" : "item"

  const content =
    activeId !== null && children !== undefined
      ? typeof children === "function"
        ? children({ value: activeId, variant })
        : children
      : null

  if (!mounted) {
    return null
  }

  return createPortal(
    <DragOverlay
      dropAnimation={dropAnimationConfig}
      {...(modifiers === undefined ? {} : { modifiers })}
      className={cn("z-50", activeId !== null && "cursor-grabbing", className)}
      {...props}
    >
      <IsOverlayContext.Provider value={true}>{content}</IsOverlayContext.Provider>
    </DragOverlay>,
    document.body
  )
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay
}
