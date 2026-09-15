export function CircularProgress({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <svg viewBox="0 0 28 28" className="size-5 -rotate-90" aria-hidden="true">
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-muted"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground"
        />
      </svg>
      {clamped}%
    </span>
  )
}
