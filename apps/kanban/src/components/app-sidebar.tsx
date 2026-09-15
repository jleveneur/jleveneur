import {
  BarChart3Icon,
  Building2Icon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  FileIcon,
  FilterIcon,
  GraduationCapIcon,
  HospitalIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Separator } from "@repo/ui/components/separator"

const NAV = [
  { href: "/board", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/board", label: "Reports", icon: BarChart3Icon },
  { href: "/list", label: "Project List", icon: ListIcon },
  { href: "/board", label: "Project Detail", icon: FileIcon }
] as const

const GROUPS = [
  {
    label: "Real Estate",
    items: [
      { label: "Dashboard" },
      { label: "Listings" },
      { label: "Detail Page" },
      { label: "Filter" }
    ]
  }
] as const

const APPS: { label: string; icon: typeof LayoutDashboardIcon; badge?: string }[] = [
  { label: "Sales", icon: CircleDollarSignIcon },
  { label: "HR", icon: UsersIcon, badge: "New" },
  { label: "CRM", icon: Building2Icon },
  { label: "Website Analytics", icon: BarChart3Icon },
  { label: "AI Analytics", icon: SparklesIcon, badge: "New" },
  { label: "File Manager", icon: FileIcon },
  { label: "Crypto", icon: WalletIcon },
  { label: "Academy / School", icon: GraduationCapIcon },
  { label: "Hospital Management", icon: HospitalIcon },
  { label: "Finance Dashboard", icon: CircleDollarSignIcon }
]

export function AppSidebar() {
  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background">
          S
        </span>
        <span className="text-sm font-semibold">Shadcn UI Kit</span>
      </div>
      <div className="px-3">
        <label className="flex h-8 items-center gap-2 rounded-lg border bg-background px-2 text-sm text-muted-foreground">
          <SearchIcon />
          <span>Search...</span>
        </label>
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          <p className="px-2 text-xs font-medium text-muted-foreground">Project Management</p>
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sidebar-accent"
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </div>
        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
              {group.label}
              <ChevronDownIcon />
            </p>
            {group.items.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground"
              >
                {item.label === "Filter" ? <FilterIcon /> : <LayoutDashboardIcon />}
                {item.label}
              </span>
            ))}
          </div>
        ))}
        <div className="flex flex-col gap-1">
          {APPS.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground"
            >
              <item.icon />
              <span className="flex-1">{item.label}</span>
              {item.badge === undefined ? null : <Badge variant="secondary">{item.badge}</Badge>}
            </span>
          ))}
        </div>
      </nav>
      <Separator />
      <div className="flex flex-col gap-3 p-3">
        <div className="rounded-xl border bg-background p-3">
          <p className="text-sm font-medium">Get This Template</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Download the full source code. Every dashboard you see in this demo is included.
          </p>
          <Button className="mt-3 w-full" size="sm">
            Download Template
          </Button>
        </div>
      </div>
    </aside>
  )
}
