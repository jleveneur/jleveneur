import { useId } from "react"

import { InkFilter } from "@/components/ink"
import type { Locale } from "@/i18n/config"
import { connectorPath, type Schematic, type SchematicNode } from "@/lib/schematic"

type SchematicFigureProps = {
  schematic: Schematic
  locale: Locale
  /** Read by screen readers in place of the drawing. */
  label: string
}

/**
 * A project's diagram, inked: heavy outlines with a drop shadow, roughened
 * by a filter. The lettering stays crisp so it can be read.
 */
export function SchematicFigure({ schematic, locale, label }: SchematicFigureProps) {
  const id = useId()
  const arrowId = `${id}-arrow`
  const inkId = `${id}-ink`
  const nodes = new Map(schematic.nodes.map((node) => [node.id, node]))

  return (
    <svg
      viewBox={`0 0 ${String(schematic.width)} ${String(schematic.height)}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full overflow-visible text-ink"
    >
      <defs>
        <InkFilter id={inkId} />
        <marker
          id={arrowId}
          viewBox="0 0 8 8"
          refX="7.5"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0.5 L8 4 L0 7.5 z" className="fill-ink" />
        </marker>
      </defs>

      <g filter={`url(#${inkId})`}>
        <g className="stroke-ink" fill="none" strokeWidth="2" strokeLinejoin="round">
          {schematic.edges.map((edge) => {
            const from = nodes.get(edge.from)
            const to = nodes.get(edge.to)
            if (from === undefined || to === undefined) {
              return null
            }
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={connectorPath(from, to)}
                markerEnd={`url(#${arrowId})`}
              />
            )
          })}
        </g>
        {schematic.nodes.map((node) => (
          <SchematicBox key={node.id} node={node} />
        ))}
      </g>

      {schematic.nodes.map((node) => (
        <SchematicLabel key={node.id} node={node} locale={locale} />
      ))}
    </svg>
  )
}

/** A dashed box is outside the system, so it casts no shadow. */
function SchematicBox({ node }: { node: SchematicNode }) {
  const accent = node.tone === "accent"
  const dashed = node.tone === "dashed"
  return (
    <g>
      {dashed ? null : (
        <rect x={node.x + 4} y={node.y + 4} width={node.w} height={node.h} className="fill-ink" />
      )}
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        className={accent ? "fill-signal stroke-ink" : "fill-paper-raised stroke-ink"}
        strokeWidth="2.5"
        strokeDasharray={dashed ? "6 4" : undefined}
      />
    </g>
  )
}

function SchematicLabel({ node, locale }: { node: SchematicNode; locale: Locale }) {
  const cx = node.x + node.w / 2
  const cy = node.y + node.h / 2
  const accent = node.tone === "accent"

  return (
    <g>
      <text
        x={cx}
        y={node.note === undefined ? cy : cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        className={accent ? "fill-signal-ink font-mono font-bold" : "fill-ink font-mono font-bold"}
      >
        {typeof node.label === "string" ? node.label : node.label[locale]}
      </text>
      {node.note === undefined ? null : (
        <text
          x={cx}
          y={cy + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          className={
            accent ? "fill-signal-ink font-mono uppercase" : "fill-ink-muted font-mono uppercase"
          }
        >
          {node.note}
        </text>
      )}
    </g>
  )
}
