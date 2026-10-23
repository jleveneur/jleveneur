import type { Metadata } from "next"
import localFont from "next/font/local"
import Script from "next/script"
import type { ReactNode } from "react"

import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans"
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono"
})

// Umami on stats.jleveneur.com. The website ID is public: it ends up
// in the page anyway. `data-domains` keeps `next dev` and the e2e runs, which
// load the same script, from recording visits.
const UMAMI_SCRIPT_URL = "https://stats.jleveneur.com/script.js"
const UMAMI_WEBSITE_ID = "fdbed73e-0ec4-4ab7-902c-902d0244b0bf"

export const metadata: Metadata = {
  title: "Julien Leveneur",
  description: "Full-stack developer building web apps with TypeScript and React."
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh`}>
        {children}
        <Script
          src={UMAMI_SCRIPT_URL}
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains="jleveneur.com"
        />
      </body>
    </html>
  )
}
