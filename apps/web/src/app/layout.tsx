import type { Metadata } from "next"
import localFont from "next/font/local"
import type { ReactNode } from "react"

import { Providers } from "@/components/providers.tsx"

import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Julien Leveneur",
  description: "Full-stack developer building web apps with TypeScript and React.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
