"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

function Progress({ className, value, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("flex w-full items-center gap-2", className)}
      {...props}
    >
      <ProgressPrimitive.Track className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <ProgressPrimitive.Indicator className="h-full bg-foreground transition-all" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
