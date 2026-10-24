"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { type Locale, localePath, locales, splitLocale } from "@/i18n/config"

export type NavItem = { code: string; label: string; path: string }

/** Rendered twice: inline from `md`, as a row under the header below it. */
export function NavLinks({ items, label }: { items: NavItem[]; label: string }) {
  const { locale, path } = splitLocale(usePathname())

  return (
    <nav aria-label={label}>
      <ul className="grid grid-cols-4 md:flex md:items-center md:gap-1">
        {items.map((item) => {
          const current = path === item.path || path.startsWith(`${item.path}/`)
          return (
            <li key={item.path}>
              <Link
                href={localePath(locale, item.path)}
                aria-current={current ? "page" : undefined}
                className={
                  current
                    ? "flex flex-col items-center gap-0.5 px-1 py-2 text-signal md:flex-row md:gap-2 md:px-3"
                    : "flex flex-col items-center gap-0.5 px-1 py-2 text-ink transition-colors hover:text-signal md:flex-row md:gap-2 md:px-3"
                }
              >
                <span aria-hidden="true" className="font-mono text-xs text-ink-muted">
                  {item.code}
                </span>
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap uppercase sm:text-sm">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

type LocaleSwitchProps = {
  label: string
  names: Record<Locale, string>
}

/** The same page in the other language: both share their slugs. */
export function LocaleSwitch({ label, names }: LocaleSwitchProps) {
  const { locale: current, path } = splitLocale(usePathname())

  return (
    <nav aria-label={label}>
      <ul className="flex border border-line">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={localePath(locale, path)}
              hrefLang={locale}
              lang={locale}
              aria-label={names[locale]}
              aria-current={locale === current ? "true" : undefined}
              className={
                locale === current
                  ? "block bg-ink px-2.5 py-1 font-mono text-xs font-semibold text-paper uppercase"
                  : "block px-2.5 py-1 font-mono text-xs text-ink-muted uppercase transition-colors hover:text-ink"
              }
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
