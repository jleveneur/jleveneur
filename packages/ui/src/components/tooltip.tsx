"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"
import type { ReactNode } from "react"

function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delay={200}>{children}</TooltipPrimitive.Provider>
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  children,
  side = "top",
  align = "center",
  ...props
}: TooltipPrimitive.Popup.Props & {
  side?: TooltipPrimitive.Positioner.Props["side"]
  align?: TooltipPrimitive.Positioner.Props["align"]
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={6}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
