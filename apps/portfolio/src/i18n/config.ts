export const locales = ["fr", "en"] as const

export type Locale = (typeof locales)[number]

/** Served without a prefix: `/contact` is French, `/en/contact` English. */
export const defaultLocale: Locale = "fr"

/** A value in each language, for content that is not a UI string. */
export type Localized<T = string> = Record<Locale, T>

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

/**
 * The public URL of `path` in `locale`. Both languages share the same slugs,
 * so switching language only adds or removes the prefix.
 */
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (locale === defaultLocale) {
    return normalized
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`
}

/** The locale a public URL is in, and the path without its prefix. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first = "", ...rest] = pathname.split("/")
  if (isLocale(first) && first !== defaultLocale) {
    return { locale: first, path: `/${rest.join("/")}` }
  }
  return { locale: defaultLocale, path: pathname === "" ? "/" : pathname }
}
