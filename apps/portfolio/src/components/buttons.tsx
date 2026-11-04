import Link from "next/link"
import type { ReactNode } from "react"

type ButtonLinkProps = {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary"
}

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex items-center gap-3 border-3 border-ink bg-signal px-5 py-2.5 font-display text-xl tracking-wider text-signal-ink uppercase shadow-panel transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-panel-lg active:translate-x-1 active:translate-y-1 active:shadow-none"
          : "inline-flex items-center gap-3 border-3 border-ink bg-paper-raised px-5 py-2.5 font-display text-xl tracking-wider uppercase shadow-panel transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-ink hover:text-paper hover:shadow-panel-lg active:translate-x-1 active:translate-y-1 active:shadow-none"
      }
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
