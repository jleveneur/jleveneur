"use client"

import { CirclePlusIcon, CommandIcon, LayoutGridIcon, ListIcon, TableIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@repo/ui/components/sidebar"

const NAV = [
  { title: "Board", url: "/board", icon: LayoutGridIcon },
  { title: "List", url: "/list", icon: ListIcon },
  { title: "Table", url: "/table", icon: TableIcon }
] as const

export function AppSidebar({
  user,
  onAdd,
  ...props
}: ComponentProps<typeof Sidebar> & {
  user: { name: string; image: string | null }
  onAdd: () => void
}) {
  const pathname = usePathname()
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:p-1.5!">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CommandIcon />
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Shadowon Outlet</span>
                <span className="truncate text-xs text-muted-foreground">Kanban</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  onClick={onAdd}
                >
                  <CirclePlusIcon />
                  Quick Create
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                {user.image === null ? null : <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback>{initials || "?"}</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">Guest</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
