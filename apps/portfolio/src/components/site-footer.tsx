import Link from "next/link"
import type { ReactNode } from "react"

import { email, name, socialLinks, sourceUrl } from "@/content/site"
import { type Locale, localePath } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"

/**
 * The drawing's title block. The revision is the day the page was rendered,
 * which for prerendered pages is the day of the build that shipped it.
 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const revision = new Date().toISOString().slice(0, 10)

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-px border border-ink bg-line-faint sm:grid-cols-2 lg:grid-cols-6">
          <Cell label={dict.footer.project}>jleveneur.com</Cell>
          <Cell label={dict.footer.drawnBy}>{name}</Cell>
          <Cell label={dict.footer.scale}>1:1</Cell>
          <Cell label={dict.footer.revision}>
            <time dateTime={revision}>{revision}</time>
          </Cell>
          <div className="bg-paper p-4 sm:col-span-2">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:text-signal hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${email}`}
                  className="underline-offset-4 hover:text-signal hover:underline"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-xs text-ink-muted">
          <p>
            © {new Date().getFullYear()} {name}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href={localePath(locale, "/legal")}
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {dict.footer.legal}
            </Link>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {dict.footer.source} ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-paper p-4">
      <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold">{children}</p>
    </div>
  )
}
