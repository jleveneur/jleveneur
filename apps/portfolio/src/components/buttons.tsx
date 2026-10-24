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
          ? "inline-flex items-center gap-3 bg-signal px-5 py-3 text-sm font-bold tracking-wide text-signal-ink uppercase transition-colors hover:bg-ink"
          : "inline-flex items-center gap-3 border border-ink px-5 py-3 text-sm font-bold tracking-wide uppercase transition-colors hover:bg-ink hover:text-paper"
      }
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
