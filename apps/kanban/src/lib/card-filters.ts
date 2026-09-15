export const priorities = ["low", "medium", "high"] as const

export type Priority = (typeof priorities)[number]

export type CardFilterable = {
  title: string
  description: string
  priority: string
}

export function matchesCardFilters(
  card: CardFilterable,
  query: string,
  priority: Priority | "all"
): boolean {
  if (priority !== "all" && card.priority !== priority) {
    return false
  }

  const needle = query.trim().toLowerCase()
  if (needle === "") {
    return true
  }

  return (
    card.title.toLowerCase().includes(needle) || card.description.toLowerCase().includes(needle)
  )
}

export function isPriority(value: string): value is Priority {
  return priorities.some((item) => item === value)
}
