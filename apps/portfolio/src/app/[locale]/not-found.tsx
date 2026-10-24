"use client"

import { usePathname } from "next/navigation"

import { NotFoundSheet } from "@/components/not-found-sheet"
import { splitLocale } from "@/i18n/config"

/** Not-found boundaries receive no params, so the locale comes from the URL. */
export default function LocaleNotFound() {
  const { locale } = splitLocale(usePathname())
  return <NotFoundSheet locale={locale} />
}
