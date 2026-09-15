export type Positioned = {
  id: string
  columnId: string
  position: number
}

export function applyCardMove<T extends Positioned>(
  cards: T[],
  input: { cardId: string; toColumnId: string; position: number }
): T[] {
  const moving = cards.find((card) => card.id === input.cardId)
  if (moving === undefined) {
    return cards
  }

  const others = cards.filter((card) => card.id !== input.cardId)
  const target = others
    .filter((card) => card.columnId === input.toColumnId)
    .toSorted((a, b) => a.position - b.position)

  const insertAt = Math.max(0, Math.min(input.position, target.length))
  target.splice(insertAt, 0, { ...moving, columnId: input.toColumnId, position: insertAt })

  const rest = others.filter((card) => card.columnId !== input.toColumnId)
  const reindexed = target.map((card, index) => ({ ...card, position: index }))
  return [...rest, ...reindexed]
}
