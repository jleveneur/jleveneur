import type { Metadata } from "next"
import type { ReactNode } from "react"

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
          <GuestSession>{children}</GuestSession>
        </Providers>
      </body>
    </html>
  )
}
