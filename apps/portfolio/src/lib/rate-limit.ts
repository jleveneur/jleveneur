/**
 * A fixed-window counter per key, in this process's memory.
 *
 * Enough for one server behind one proxy, which is what runs: it caps how
 * many messages one address can send, so a script cannot flood the inbox or
 * spend the Resend quota. It forgets on restart, which only ever errs on the
 * side of letting someone write.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return function allow(key: string, now = Date.now()): boolean {
    // Expired windows are dropped as they are met, so the map stays bounded
    // by the addresses seen in one window.
    for (const [other, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(other)
      }
    }

    const entry = hits.get(key)
    if (entry === undefined) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (entry.count >= limit) {
      return false
    }
    entry.count += 1
    return true
  }
}
