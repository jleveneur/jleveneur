/**
 * SVG definitions shared by the drawings: place them in an SVG's `<defs>` and
 * refer to them by the id passed in, which `useId` keeps unique per drawing.
 */

/** Roughens a stroke's edge, so a vector line reads as pen and ink. */
export function InkFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" />
      <feDisplacementMap in="SourceGraphic" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  )
}

/** A halftone screen, to fill a shape with a mid tone. */
export function HalftonePattern({ id }: { id: string }) {
  return (
    <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="2.5" cy="2.5" r="1.15" className="fill-ink" />
    </pattern>
  )
}
