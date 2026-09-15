"use client"

import { cn } from "cn"
import { LayoutGridIcon, ListIcon, SearchIcon, TableIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export function BoardChrome({
  search,
  onSearch,
  priority,
  onPriority
}: {
  search: string
  onSearch: (value: string) => void
  priority: Priority | "all"
  onPriority: (value: Priority | "all") => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
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
      <div className="flex flex-wrap items-center gap-2">
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
