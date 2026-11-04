import Link from "next/link"

import { LocaleSwitch, type NavItem, NavLinks } from "@/components/site-nav"
import { name } from "@/content/site"
import { type Locale, localePath } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items: NavItem[] = [
    { code: "A", label: dict.nav.projects, path: "/projects" },
    { code: "B", label: dict.nav.experience, path: "/experience" },
    { code: "C", label: dict.nav.about, path: "/about" },
    { code: "D", label: dict.nav.contact, path: "/contact" }
  ]

  return (
    <header className="sticky top-0 z-20 border-b-3 border-ink bg-paper">
      <a
        href="#content"
        className="sr-only bg-signal px-3 py-2 text-signal-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {dict.skipLink}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={localePath(locale, "/")} className="group flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 -rotate-6 place-items-center border-3 border-ink bg-ink font-display text-xl tracking-wide text-paper transition group-hover:rotate-0 group-hover:bg-signal"
          >
            JL
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl leading-none tracking-wider uppercase">
              {name}
            </span>
            <span className="block font-mono text-xs text-ink-muted">{dict.role}</span>
          </span>
        </Link>
        <div className="ml-auto hidden md:block">
          <NavLinks items={items} label={dict.nav.label} />
        </div>
        <div className="ml-auto md:ml-2">
          <LocaleSwitch
            label={dict.localeSwitch.label}
            names={{ fr: dict.localeSwitch.fr, en: dict.localeSwitch.en }}
          />
        </div>
      </div>
      <div className="border-t-2 border-ink md:hidden">
        <NavLinks items={items} label={dict.nav.label} />
      </div>
    </header>
  )
}
