import { useId } from "react"

import type { Locale } from "@/i18n/config"
import { connectorPath, type Schematic, type SchematicNode } from "@/lib/schematic"

type SchematicFigureProps = {
  schematic: Schematic
  locale: Locale
  /** Read by screen readers in place of the drawing. */
  label: string
}

/** A project's diagram, drawn in the blueprint's line work. */
export function SchematicFigure({ schematic, locale, label }: SchematicFigureProps) {
  const arrowId = `${useId()}-arrow`
  const nodes = new Map(schematic.nodes.map((node) => [node.id, node]))

  return (
    <svg
      viewBox={`0 0 ${String(schematic.width)} ${String(schematic.height)}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full overflow-visible text-ink"
    >
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 8 8"
          refX="7.5"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0.5 L8 4 L0 7.5 z" className="fill-ink" />
        </marker>
      </defs>

      <g className="stroke-ink" fill="none" strokeWidth="1" strokeOpacity="0.75">
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
        <SchematicBox key={node.id} node={node} locale={locale} />
      ))}
    </svg>
  )
}

function SchematicBox({ node, locale }: { node: SchematicNode; locale: Locale }) {
  const cx = node.x + node.w / 2
  const cy = node.y + node.h / 2
  const accent = node.tone === "accent"

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        className={accent ? "fill-paper-deep stroke-signal" : "fill-paper-deep stroke-ink"}
        strokeWidth={accent ? 1.5 : 1}
        strokeDasharray={node.tone === "dashed" ? "4 3" : undefined}
      />
      <text
        x={cx}
        y={node.note === undefined ? cy : cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        className={accent ? "fill-signal font-mono" : "fill-ink font-mono"}
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
          className="fill-ink-muted font-mono uppercase"
        >
          {node.note}
        </text>
      )}
    </g>
  )
}
