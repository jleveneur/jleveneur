import type { ReactNode } from "react"

/**
 * A dimension line: end ticks, a rule, and the measure written in the middle.
 * Decorative — the label repeats something already on the page.
 */
export function DimensionLine({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 text-ink-muted">
      <span className="h-3 w-px bg-ink" />
      <span className="h-px flex-1 bg-line" />
      <span className="font-mono text-xs tracking-widest uppercase">{label}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="h-3 w-px bg-ink" />
    </div>
  )
}

type SectionHeadingProps = {
  id: string
  code: string
  title: string
  intro?: string
  level?: 1 | 2
}

/** `[A] TITLE ────` with an optional lead paragraph underneath. */
export function SectionHeading({ id, code, title, intro, level = 2 }: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2"
  return (
    <header className="grid gap-4">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center border border-ink font-mono text-sm font-semibold"
        >
          {code}
        </span>
        <Heading
          id={id}
          className={
            level === 1
              ? "font-stretch-75% text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-7xl"
              : "font-stretch-75% text-3xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl"
          }
        >
          {title}
        </Heading>
        <span aria-hidden="true" className="hidden h-px flex-1 bg-line sm:block" />
      </div>
      {intro === undefined ? null : (
        <p className="max-w-2xl text-base text-ink-muted sm:pl-14 sm:text-lg">{intro}</p>
      )}
    </header>
  )
}

/** A panel with the drawing sheet's corner brackets. */
export function Sheet({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative border border-line-faint bg-paper-deep/40 corner-marks p-5 sm:p-8">
      {label === undefined ? null : (
        <span className="absolute -top-2.5 left-5 bg-paper px-2 font-mono text-xs tracking-widest text-ink-muted uppercase">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

/** A short technology label. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-line-faint px-2 py-0.5 font-mono text-xs text-ink-muted">
      {children}
    </span>
  )
}
