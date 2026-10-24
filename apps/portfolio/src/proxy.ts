import { type NextRequest, NextResponse } from "next/server"

import { defaultLocale, isLocale } from "@/i18n/config"

/**
 * French is served without a prefix and English under `/en`, while the App
 * Router sees every page under `[locale]`.
 *
 * An unprefixed path is rewritten onto the default locale, so `/contact`
 * renders `/fr/contact` without the visitor seeing it. The prefixed form of
 * the default locale is redirected away, so each page has one URL per
 * language and not two.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const [, first = ""] = pathname.split("/")

  if (first === defaultLocale) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/"
    url.search = search
    return NextResponse.redirect(url, 308)
  }

  if (isLocale(first)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

/**
 * Every page path. Build assets and files with an extension (the icons,
 * `robots.txt`, `sitemap.xml`) are served as they are. A literal, as Next
 * reads it at build time.
 */
export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"]
}
