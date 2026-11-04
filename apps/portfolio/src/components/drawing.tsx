import type { ReactNode } from "react"

/**
 * A caption box: the narration strip pinned to a panel's edge. Decorative —
 * the label repeats something already on the page.
 */
export function Caption({ label }: { label: string }) {
  return (
    <p
      aria-hidden="true"
      className="inline-block -rotate-1 border-3 border-ink bg-paper-raised px-3 py-1.5 font-mono text-xs font-semibold tracking-widest uppercase shadow-panel"
    >
      {label}
    </p>
  )
}

type SectionHeadingProps = {
  id: string
  code: string
  title: string
  intro?: string
  level?: 1 | 2
}

/** A burst with the section's number, the title, and a heavy rule. */
export function SectionHeading({ id, code, title, intro, level = 2 }: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2"
  return (
    <header className="grid gap-4">
      <div className="flex items-center gap-4">
        <Burst size="sm">{code}</Burst>
        <Heading
          id={id}
          className={
            level === 1
              ? "font-display text-6xl leading-none tracking-wide uppercase text-shadow-pop sm:text-8xl"
              : "font-display text-4xl leading-none tracking-wide uppercase text-shadow-pop sm:text-6xl"
          }
        >
          {title}
        </Heading>
        <span aria-hidden="true" className="hidden h-1 flex-1 bg-ink sm:block" />
      </div>
      {intro === undefined ? null : (
        <p className="max-w-2xl text-base text-ink-muted sm:pl-18 sm:text-lg">{intro}</p>
      )}
    </header>
  )
}

/** A comic panel: a heavy border, a drop shadow, and a caption on its edge. */
export function Panel({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative border-3 border-ink bg-paper-raised p-5 shadow-panel-lg sm:p-8">
      {label === undefined ? null : (
        <span className="absolute -top-4 left-5 -rotate-2 border-3 border-ink bg-paper-raised px-2 py-0.5 font-mono text-xs font-semibold tracking-widest uppercase">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

type BurstProps = { children: ReactNode; size?: "sm" | "lg" }

/**
 * A sound effect's balloon: an ink outline around a blue burst. Decorative,
 * so a word in it must not be the only place the page says it.
 */
export function Burst({ children, size = "lg" }: BurstProps) {
  return (
    <span
      aria-hidden="true"
      className={
        size === "lg"
          ? "relative grid size-36 shrink-0 rotate-12 place-items-center sm:size-44"
          : "relative grid size-14 shrink-0 -rotate-6 place-items-center"
      }
    >
      <span className="absolute inset-0 burst bg-ink" />
      <span
        className={
          size === "lg" ? "absolute inset-1.5 burst bg-signal" : "absolute inset-1 burst bg-signal"
        }
      />
      <span
        className={
          size === "lg"
            ? "relative font-display text-3xl tracking-wide text-signal-ink uppercase sm:text-4xl"
            : "relative font-display text-xl tracking-wide text-signal-ink"
        }
      >
        {children}
      </span>
    </span>
  )
}

/** A short technology label. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-ink bg-paper-raised px-2.5 py-0.5 font-mono text-xs font-semibold">
      {children}
    </span>
  )
}
