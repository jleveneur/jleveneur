import type { Metadata } from "next"

import { defaultLocale, type Locale, localePath, locales } from "@/i18n/config"

/**
 * A page's canonical URL and its other-language versions, so search engines
 * pair `/contact` with `/en/contact` instead of treating them as duplicates.
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  fields: { title?: string; description?: string }
): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((other) => [other, localePath(other, path)])
  )
  languages["x-default"] = localePath(defaultLocale, path)

  return {
    ...(fields.title === undefined ? {} : { title: fields.title }),
    ...(fields.description === undefined ? {} : { description: fields.description }),
    alternates: { canonical: localePath(locale, path), languages },
    openGraph: {
      ...(fields.title === undefined ? {} : { title: fields.title }),
      ...(fields.description === undefined ? {} : { description: fields.description }),
      url: localePath(locale, path),
      locale: locale === "fr" ? "fr_FR" : "en_US"
    }
  }
}
