"use client"

import { BellIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/components/dropdown-menu"
import { Input } from "@repo/ui/components/input"
import { ScrollArea } from "@repo/ui/components/scroll-area"
import { Separator } from "@repo/ui/components/separator"
import { SidebarTrigger } from "@repo/ui/components/sidebar"

import type { PresenceUser } from "@/lib/realtime-types.ts"
import type { BoardNotification } from "@/server/board-queries.ts"

import { UserAvatar } from "./user-avatar.tsx"

export function SiteHeader({
  title,
  search,
  onSearch,
  presence,
  notifications,
  onNotificationOpen,
  onAdd
}: {
  title: string
  search: string
  onSearch: (value: string) => void
  presence: PresenceUser[]
  notifications: BoardNotification[]
  onNotificationOpen: (item: BoardNotification) => void
  onAdd: () => void
}) {
  const unread = notifications.filter((item) => !item.read).length

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-vertical:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                />
              }
            >
              <BellIcon />
              {unread > 0 ? (
                <Badge className="absolute -top-1 -right-1 size-4 p-0">{unread}</Badge>
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-1" aria-label="Notification list">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Notifications</p>
              {notifications.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <ScrollArea className="max-h-80">
                  <DropdownMenuGroup>
                    {notifications.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        className="flex-col items-start gap-0.5"
                        data-notification-id={item.id}
                        data-notification-title={item.title}
                        onClick={() => {
                          onNotificationOpen(item)
                        }}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.read ? null : (
                            <Badge variant="secondary" className="shrink-0">
                              New
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.body}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>
    </header>
  )
}
