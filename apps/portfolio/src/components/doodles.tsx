import { useId } from "react"

import { InkFilter } from "@/components/ink"

/**
 * Margin doodles, the kind that crowd a sound effect: a smiley with crossed
 * eyes and an eye shedding a tear. Decorative; size them with `className`.
 */
export function Smiley({ className }: { className?: string }) {
  const inkId = `${useId()}-ink`
  return (
    <svg viewBox="0 0 64 72" aria-hidden="true" className={className}>
      <defs>
        <InkFilter id={inkId} />
      </defs>
      <g filter={`url(#${inkId})`} className="stroke-ink" strokeWidth="3.5" strokeLinecap="round">
        <path d="M32 58 C 31 62, 34 64, 33 70" fill="none" />
        <circle cx="32" cy="30" r="27" className="fill-paper-raised" />
        <path d="M18 20 L26 28 M26 20 L18 28 M38 20 L46 28 M46 20 L38 28" fill="none" />
        <path d="M17 38 C 24 50, 40 50, 47 38" fill="none" />
      </g>
    </svg>
  )
}

export function Eye({ className }: { className?: string }) {
  const inkId = `${useId()}-ink`
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true" className={className}>
      <defs>
        <InkFilter id={inkId} />
      </defs>
      <g filter={`url(#${inkId})`} className="stroke-ink" strokeWidth="3.5" strokeLinecap="round">
        <path d="M6 26 C 22 4, 58 4, 74 26 C 58 46, 22 46, 6 26 Z" className="fill-paper-raised" />
        <circle cx="40" cy="26" r="11" className="fill-ink" />
        <path d="M14 14 L8 6 M28 8 L26 0 M52 8 L54 0 M66 14 L72 6" fill="none" />
        <path d="M38 46 C 34 54, 36 60, 40 60 C 44 60, 46 54, 42 46" className="fill-signal" />
      </g>
      <circle cx="44" cy="22" r="3" className="fill-paper-raised" />
    </svg>
  )
}
