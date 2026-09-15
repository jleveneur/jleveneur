"use client"

import { CalendarIcon, MessageSquareIcon, PaperclipIcon } from "lucide-react"
import { useRef } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"

import type { CardSummary } from "@/server/board-queries.ts"

import { CircularProgress } from "./circular-progress.tsx"
import { UserAvatar } from "./user-avatar.tsx"

const DRAG_CLICK_SLOP_PX = 8

export function TaskCard({ card, onOpen }: { card: CardSummary; onOpen: () => void }) {
  const origin = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)

  return (
    <div
      role="button"
      tabIndex={0}
      data-card-title={card.title}
      className="w-full cursor-grab text-left active:cursor-grabbing"
      onPointerDown={(event) => {
        origin.current = { x: event.clientX, y: event.clientY }
        dragged.current = false
      }}
      onPointerMove={(event) => {
        if (origin.current === null) {
          return
        }
        const dx = event.clientX - origin.current.x
        const dy = event.clientY - origin.current.y
        if (dx * dx + dy * dy > DRAG_CLICK_SLOP_PX * DRAG_CLICK_SLOP_PX) {
          dragged.current = true
        }
      }}
      onClick={() => {
        if (!dragged.current) {
          onOpen()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <Card className="hover:bg-muted/30">
        <CardHeader>
          <CardTitle>{card.title}</CardTitle>
          <CardDescription className="line-clamp-2">{card.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex [&>*:not(:first-child)]:-ml-2">
              {card.assignees.map((person) => (
                <UserAvatar key={person.id} name={person.name} image={person.image} />
              ))}
            </div>
            <CircularProgress value={card.progress} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-destructive" />
              {card.priority}
              {card.dueDate === null ? null : (
                <span className="ml-2 inline-flex items-center gap-1">
                  <CalendarIcon />
                  {formatDue(card.dueDate)}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <PaperclipIcon />
                {card.attachmentCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquareIcon />
                {card.commentCount}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDue(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
