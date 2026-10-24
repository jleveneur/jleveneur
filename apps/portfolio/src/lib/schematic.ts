import type { Localized } from "@/i18n/config"

/**
 * A small technical diagram, drawn as SVG by `components/schematic.tsx`:
 * boxes on a grid of the given size, joined by orthogonal connectors.
 */
export type Schematic = {
  width: number
  height: number
  nodes: SchematicNode[]
  edges: SchematicEdge[]
}

export type SchematicNode = {
  id: string
  /** A name, or a word that differs between languages. */
  label: string | Localized
  note?: string
  x: number
  y: number
  w: number
  h: number
  tone?: "accent" | "dashed"
}

export type SchematicEdge = { from: string; to: string }

type Point = { x: number; y: number }

/**
 * The connector between two boxes, as an SVG path: out of the side that faces
 * the target, one elbow at mid-distance, into the facing side. Horizontal
 * when the target lies clear to one side, vertical otherwise.
 */
export function connectorPath(from: SchematicNode, to: SchematicNode): string {
  if (to.x >= from.x + from.w || to.x + to.w <= from.x) {
    const rightward = to.x >= from.x + from.w
    const start: Point = { x: rightward ? from.x + from.w : from.x, y: from.y + from.h / 2 }
    const end: Point = { x: rightward ? to.x : to.x + to.w, y: to.y + to.h / 2 }
    const mid = (start.x + end.x) / 2
    return `M ${num(start.x)} ${num(start.y)} H ${num(mid)} V ${num(end.y)} H ${num(end.x)}`
  }

  const downward = to.y >= from.y + from.h
  const start: Point = { x: from.x + from.w / 2, y: downward ? from.y + from.h : from.y }
  const end: Point = { x: to.x + to.w / 2, y: downward ? to.y : to.y + to.h }
  const mid = (start.y + end.y) / 2
  return `M ${num(start.x)} ${num(start.y)} V ${num(mid)} H ${num(end.x)} V ${num(end.y)}`
}

function num(value: number): string {
  return String(Math.round(value * 10) / 10)
}
