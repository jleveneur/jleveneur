import type { Metadata } from "next"

import { NotFoundSheet } from "@/components/not-found-sheet"
import { defaultLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { fontVariables } from "@/lib/fonts"

import "./globals.css"

const dict = getDictionary(defaultLocale)

export const metadata: Metadata = {
  title: dict.notFound.title
}

/** A URL outside every `[locale]` page, answered in the default locale. */
export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale} className={fontVariables}>
      <body className="min-h-dvh">
        <NotFoundSheet locale={defaultLocale} />
      </body>
    </html>
  )
}
