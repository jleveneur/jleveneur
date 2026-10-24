type Layer = { name: string; tools: string }

const CX = 120
const HALF_W = 104
const HALF_H = 38
const THICKNESS = 10
const PITCH = 78

/**
 * An exploded axonometric view of a web application's layers, top to bottom,
 * each plate called out to its tools. Decorative: the same layers are listed
 * as text in its accessible name.
 */
export function StackSection({ layers, label }: { layers: Layer[]; label: string }) {
  const height = (layers.length - 1) * PITCH + HALF_H * 2 + THICKNESS + 8
  const plates = layers.map((layer, index) => ({ ...layer, index, y: 4 + index * PITCH }))

  return (
    <svg
      viewBox={`0 0 440 ${String(height)}`}
      role="img"
      aria-label={`${label}: ${layers.map((layer) => `${layer.name} (${layer.tools})`).join(", ")}`}
      className="block h-auto w-full text-ink"
    >
      {/* The axes the plates were pulled apart along. */}
      <g className="stroke-ink" strokeOpacity="0.35" strokeDasharray="2 4" fill="none">
        <path d={`M ${String(CX - HALF_W)} ${String(4 + HALF_H)} V ${String(height - HALF_H)}`} />
        <path d={`M ${String(CX + HALF_W)} ${String(4 + HALF_H)} V ${String(height - HALF_H)}`} />
        <path d={`M ${String(CX)} ${String(4 + HALF_H * 2)} V ${String(height)}`} />
      </g>

      {plates.toReversed().map((plate) => {
        const top = plate.y
        const mid = top + HALF_H
        const bottom = top + HALF_H * 2
        const accent = plate.index === 0
        const stroke = accent ? "stroke-signal" : "stroke-ink"
        const left = CX - HALF_W
        const right = CX + HALF_W
        return (
          <g key={plate.name}>
            <polygon
              points={`${String(left)},${String(mid)} ${String(CX)},${String(bottom)} ${String(CX)},${String(bottom + THICKNESS)} ${String(left)},${String(mid + THICKNESS)}`}
              className={`fill-paper-deep ${stroke}`}
            />
            <polygon
              points={`${String(CX)},${String(bottom)} ${String(right)},${String(mid)} ${String(right)},${String(mid + THICKNESS)} ${String(CX)},${String(bottom + THICKNESS)}`}
              className={`fill-paper ${stroke}`}
            />
            <polygon
              points={`${String(CX)},${String(top)} ${String(right)},${String(mid)} ${String(CX)},${String(bottom)} ${String(left)},${String(mid)}`}
              className={`fill-paper-raised ${stroke}`}
              strokeWidth={accent ? 1.5 : 1}
            />
            <text
              x={CX}
              y={mid}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              className={accent ? "fill-signal font-mono" : "fill-ink font-mono"}
            >
              {String(plate.index + 1).padStart(2, "0")}
            </text>
            <path
              d={`M ${String(right)} ${String(mid)} H 252`}
              className="stroke-ink"
              strokeOpacity="0.6"
              fill="none"
            />
            <circle cx={right} cy={mid} r="2.5" className="fill-ink" />
            <text
              x="260"
              y={mid - 8}
              fontSize="15"
              className="fill-ink font-sans font-bold uppercase"
            >
              {plate.name}
            </text>
            <text x="260" y={mid + 12} fontSize="11" className="fill-ink-muted font-mono">
              {plate.tools}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
