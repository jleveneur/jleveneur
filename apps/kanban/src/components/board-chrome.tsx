"use client"

import { cn } from "cn"
import { BellIcon, LayoutGridIcon, ListIcon, PlusIcon, SearchIcon, TableIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui/components/select"

import { priorities, type Priority } from "@/lib/card-filters.ts"
import type { PresenceUser } from "@/lib/realtime-types.ts"

import { UserAvatar } from "./user-avatar.tsx"

export function BoardChrome({
  title,
  orgName,
  search,
  onSearch,
  priority,
  onPriority,
  presence,
  notificationCount,
  onAdd
}: {
  title: string
  orgName: string
  search: string
  onSearch: (value: string) => void
  priority: Priority | "all"
  onPriority: (value: Priority | "all") => void
  presence: PresenceUser[]
  notificationCount: number
  onAdd: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" />
          {orgName}
        </div>
        <div className="flex items-center gap-3">
          <label className="relative hidden w-64 md:block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search..."
              value={search}
              onChange={(event) => {
                onSearch(event.target.value)
              }}
              aria-label="Search"
            />
          </label>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <BellIcon />
            {notificationCount > 0 ? (
              <Badge className="absolute -top-1 -right-1 size-4 p-0">{notificationCount}</Badge>
            ) : null}
          </Button>
          <div className="flex [&>*:not(:first-child)]:-ml-2">
            {presence.slice(0, 4).map((person) => (
              <UserAvatar key={person.userId} name={person.name} image={person.image} />
            ))}
          </div>
          <Button onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            <ViewLink
              href="/board"
              active={pathname === "/board"}
              icon={LayoutGridIcon}
              label="Board"
            />
            <ViewLink href="/list" active={pathname === "/list"} icon={ListIcon} label="List" />
            <ViewLink href="/table" active={pathname === "/table"} icon={TableIcon} label="Table" />
          </div>
          <label className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                onSearch(event.target.value)
              }}
              className="w-56 pl-8"
              placeholder="Search tasks..."
              aria-label="Search tasks"
            />
          </label>
          <Select
            value={priority}
            items={{
              all: "All priorities",
              low: "low",
              medium: "medium",
              high: "high"
            }}
            onValueChange={(value) => {
              if (value === null) {
                return
              }
              onPriority(
                value === "all" || value === "low" || value === "medium" || value === "high"
                  ? value
                  : "all"
              )
            }}
          >
            <SelectTrigger className="w-36" aria-label="Priority">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All priorities</SelectItem>
                {priorities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function ViewLink({
  href,
  active,
  icon: Icon,
  label
}: {
  href: string
  active: boolean
  icon: typeof LayoutGridIcon
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
      )}
    >
      <Icon />
      {label}
    </Link>
  )
}
