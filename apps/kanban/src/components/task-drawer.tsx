"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, PaperclipIcon, PlusIcon, SendIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@repo/ui/components/button"
import { Checkbox } from "@repo/ui/components/checkbox"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@repo/ui/components/drawer"
import { Input } from "@repo/ui/components/input"
import { Progress } from "@repo/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui/components/select"
import { Separator } from "@repo/ui/components/separator"

import { priorities } from "@/lib/card-filters.ts"
import { orpc, rpc } from "@/lib/orpc.ts"

import { UserAvatar } from "./user-avatar.tsx"

export function TaskDrawer({
  cardId,
  open,
  onOpenChange
}: {
  cardId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerTitle className="sr-only">Task Detail</DrawerTitle>
        {cardId === null ? null : <TaskDrawerBody cardId={cardId} />}
      </DrawerContent>
    </Drawer>
  )
}

function TaskDrawerBody({ cardId }: { cardId: string }) {
  const queryClient = useQueryClient()
  const detail = useQuery(orpc.card.detail.queryOptions({ input: { cardId } }))
  const [comment, setComment] = useState("")
  const [subtask, setSubtask] = useState("")

  useEffect(() => {
    setComment("")
    setSubtask("")
  }, [cardId])

  const addComment = useMutation({
    mutationFn: (body: string) => rpc.comment.add({ cardId, body }),
    onSuccess: async () => {
      setComment("")
      await queryClient.invalidateQueries()
    }
  })

  const addSubtask = useMutation({
    mutationFn: (title: string) => rpc.card.addSubtask({ cardId, title }),
    onSuccess: async () => {
      setSubtask("")
      await queryClient.invalidateQueries()
    }
  })

  const toggleSubtask = useMutation({
    mutationFn: (input: { subtaskId: string; done: boolean }) =>
      rpc.card.toggleSubtask({ cardId, ...input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    }
  })

  const updateCard = useMutation({
    mutationFn: (input: { priority?: "low" | "medium" | "high"; columnId?: string }) =>
      rpc.card.update({ cardId, ...input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    }
  })

  const uploadFile = useMutation({
    mutationFn: (file: File) => uploadAttachment(cardId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    }
  })

  if (detail.data === undefined) {
    return (
      <DrawerBody>
        <p className="text-sm text-muted-foreground">Loading task…</p>
      </DrawerBody>
    )
  }

  const card = detail.data
  const doneCount = card.subtasks.filter((item) => item.done).length

  return (
    <>
      <DrawerHeader className="relative pr-12">
        <p className="text-xs font-medium text-muted-foreground">Task Detail</p>
        <DrawerTitle>{card.title}</DrawerTitle>
        <DrawerDescription>{card.description}</DrawerDescription>
        <DrawerClose
          render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DrawerClose>
      </DrawerHeader>
      <DrawerBody className="flex flex-col gap-6">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Select
              value={card.columnId}
              items={Object.fromEntries(card.columns.map((item) => [item.id, item.name]))}
              onValueChange={(value) => {
                if (value !== null) {
                  updateCard.mutate({ columnId: value })
                }
              }}
            >
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {card.columns.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </dd>
          <dt className="text-muted-foreground">Priority</dt>
          <dd>
            <Select
              value={card.priority}
              items={Object.fromEntries(priorities.map((item) => [item, item]))}
              onValueChange={(value) => {
                if (value === "low" || value === "medium" || value === "high") {
                  updateCard.mutate({ priority: value })
                }
              }}
            >
              <SelectTrigger aria-label="Priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {priorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </dd>
          <dt className="text-muted-foreground">Due date</dt>
          <dd className="inline-flex items-center gap-2">
            <CalendarIcon />
            {card.dueDate ?? "None"}
          </dd>
          <dt className="text-muted-foreground">Assignees</dt>
          <dd className="flex flex-wrap items-center gap-2">
            {card.assignees.map((person) => (
              <span key={person.id} className="inline-flex items-center gap-1">
                <UserAvatar name={person.name} image={person.image} />
                {person.name}
              </span>
            ))}
          </dd>
          <dt className="text-muted-foreground">Progress</dt>
          <dd className="flex items-center gap-2">
            <Progress value={card.progress} />
            <span className="text-muted-foreground">{card.progress}%</span>
          </dd>
        </dl>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <h3 className="font-medium">Subtasks {card.subtasks.length}</h3>
            <span className="text-muted-foreground">
              {doneCount} of {card.subtasks.length} done
            </span>
          </div>
          {card.subtasks.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={item.done}
                onCheckedChange={(checked) => {
                  if (typeof checked === "boolean") {
                    toggleSubtask.mutate({ subtaskId: item.id, done: checked })
                  }
                }}
              />
              <span className={item.done ? "text-muted-foreground line-through" : undefined}>
                {item.title}
              </span>
            </label>
          ))}
          <form
            className="flex gap-2"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (subtask.trim() !== "") {
                addSubtask.mutate(subtask)
              }
            }}
          >
            <Input
              value={subtask}
              onChange={(event) => {
                setSubtask(event.target.value)
              }}
              placeholder="Add a subtask..."
            />
            <Button type="submit" size="icon" aria-label="Add subtask">
              <PlusIcon />
            </Button>
          </form>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <h3 className="inline-flex items-center gap-2 font-medium">
              <PaperclipIcon />
              Attachments {card.attachments.length}
            </h3>
            <label className="text-sm font-medium">
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file === undefined) {
                    return
                  }
                  uploadFile.mutate(file)
                  event.target.value = ""
                }}
              />
              + Add file
            </label>
          </div>
          {uploadFile.isError ? (
            <p className="text-sm text-destructive">Upload to R2 failed. Try another file.</p>
          ) : null}
          {card.attachments.map((item) => (
            <a
              key={item.id}
              href={`/api/attachments/${item.id}`}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
            >
              <span>{item.fileName}</span>
              <span className="text-muted-foreground">{formatBytes(item.byteSize)}</span>
            </a>
          ))}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="font-medium">Comments {card.comments.length}</h3>
          <form
            className="flex gap-2"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (comment.trim() !== "") {
                addComment.mutate(comment)
              }
            }}
          >
            <Input
              value={comment}
              onChange={(event) => {
                setComment(event.target.value)
              }}
              placeholder="Write a comment..."
              aria-label="Write a comment"
            />
            <Button type="submit" size="icon" aria-label="Send comment">
              <SendIcon />
            </Button>
          </form>
          {card.comments.map((item) => (
            <article key={item.id} className="flex gap-2 text-sm">
              <UserAvatar name={item.author.name} image={item.author.image} />
              <div className="flex flex-col gap-1">
                <p>
                  <span className="font-medium">{item.author.name}</span>{" "}
                  <span className="text-muted-foreground">{formatStamp(item.createdAt)}</span>
                </p>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </section>
      </DrawerBody>
    </>
  )
}

async function uploadAttachment(cardId: string, file: File): Promise<void> {
  const body = new FormData()
  body.set("cardId", cardId)
  body.set("file", file)
  const response = await fetch("/api/attachments", { method: "POST", body })
  if (!response.ok) {
    throw new Error("Upload failed")
  }
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`
  }
  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function formatStamp(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}
