import type { Period } from "@/content/experience"
import type { Locale } from "@/i18n/config"

/** "févr. 2025 — aujourd'hui", "Sep 2021 — Oct 2022". */
export function formatPeriod(period: Period, locale: Locale, present: string): string {
  return `${formatMonth(period.start, locale)} — ${
    period.end === undefined ? present : formatMonth(period.end, locale)
  }`
}

function formatMonth(month: string, locale: Locale): string {
  const [year = "", value = "1"] = month.split("-")
  // Noon UTC, so no time zone moves the date into the neighbouring month.
  const date = new Date(Date.UTC(Number(year), Number(value) - 1, 1, 12))
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date)
}
