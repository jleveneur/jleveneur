import { useId } from "react"

import { HalftonePattern, InkFilter } from "@/components/ink"

type Layer = { name: string; tools: string }

const CX = 120
const HALF_W = 104
const HALF_H = 38
const THICKNESS = 12
const PITCH = 78

/**
 * An exploded axonometric view of a web application's layers, top to bottom,
 * each plate called out to its tools. Inked like a comic panel: a white top,
 * a halftone side and a solid black one. Decorative: the same layers are
 * listed as text in its accessible name.
 */
export function StackSection({ layers, label }: { layers: Layer[]; label: string }) {
  const id = useId()
  const inkId = `${id}-ink`
  const dotsId = `${id}-dots`
  const height = (layers.length - 1) * PITCH + HALF_H * 2 + THICKNESS + 8
  const plates = layers.map((layer, index) => ({ ...layer, index, y: 4 + index * PITCH }))

  return (
    <svg
      viewBox={`0 0 440 ${String(height)}`}
      role="img"
      aria-label={`${label}: ${layers.map((layer) => `${layer.name} (${layer.tools})`).join(", ")}`}
      className="block h-auto w-full text-ink"
    >
      <defs>
        <InkFilter id={inkId} />
        <HalftonePattern id={dotsId} />
      </defs>

      <g filter={`url(#${inkId})`}>
        {/* The axes the plates were pulled apart along. */}
        <g className="stroke-ink" strokeWidth="1.5" strokeDasharray="3 5" fill="none">
          <path d={`M ${String(CX - HALF_W)} ${String(4 + HALF_H)} V ${String(height - HALF_H)}`} />
          <path d={`M ${String(CX + HALF_W)} ${String(4 + HALF_H)} V ${String(height - HALF_H)}`} />
          <path d={`M ${String(CX)} ${String(4 + HALF_H * 2)} V ${String(height)}`} />
        </g>

        {plates.toReversed().map((plate) => {
          const top = plate.y
          const mid = top + HALF_H
          const bottom = top + HALF_H * 2
          const left = CX - HALF_W
          const right = CX + HALF_W
          return (
            <g key={plate.name} className="stroke-ink" strokeWidth="2.5" strokeLinejoin="round">
              <polygon
                points={`${String(left)},${String(mid)} ${String(CX)},${String(bottom)} ${String(CX)},${String(bottom + THICKNESS)} ${String(left)},${String(mid + THICKNESS)}`}
                className="fill-paper-raised"
              />
              <polygon
                points={`${String(left)},${String(mid)} ${String(CX)},${String(bottom)} ${String(CX)},${String(bottom + THICKNESS)} ${String(left)},${String(mid + THICKNESS)}`}
                fill={`url(#${dotsId})`}
              />
              <polygon
                points={`${String(CX)},${String(bottom)} ${String(right)},${String(mid)} ${String(right)},${String(mid + THICKNESS)} ${String(CX)},${String(bottom + THICKNESS)}`}
                className="fill-ink"
              />
              <polygon
                points={`${String(CX)},${String(top)} ${String(right)},${String(mid)} ${String(CX)},${String(bottom)} ${String(left)},${String(mid)}`}
                className={plate.index === 0 ? "fill-signal" : "fill-paper-raised"}
              />
              <path d={`M ${String(right)} ${String(mid)} H 252`} fill="none" strokeWidth="2" />
              <circle cx={right} cy={mid} r="3.5" className="fill-ink" />
            </g>
          )
        })}
      </g>

      {plates.map((plate) => {
        const mid = plate.y + HALF_H
        return (
          <g key={plate.name}>
            <text
              x={CX}
              y={mid}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="22"
              className={
                plate.index === 0 ? "fill-signal-ink font-display" : "fill-ink font-display"
              }
            >
              {String(plate.index + 1).padStart(2, "0")}
            </text>
            <text
              x="260"
              y={mid - 8}
              fontSize="22"
              className="fill-ink font-display uppercase"
              letterSpacing="1"
            >
              {plate.name}
            </text>
            <text x="260" y={mid + 14} fontSize="11" className="fill-ink-muted font-mono">
              {plate.tools}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
