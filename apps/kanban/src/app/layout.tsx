import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar.tsx"
import { GuestSession } from "@/components/guest-session.tsx"
import { Providers } from "@/components/providers.tsx"

import "./globals.css"

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Realtime Kanban dashboard on Cloudflare."
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>
          <GuestSession>
            <div className="flex min-h-dvh">
              <AppSidebar />
              <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            </div>
          </GuestSession>
        </Providers>
      </body>
    </html>
  )
}
