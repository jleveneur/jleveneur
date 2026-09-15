import { cn } from "cn"
import type { ComponentProps } from "react"

function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, alt, ...props }: ComponentProps<"img">) {
  return (
    <img
      alt={alt}
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center text-xs font-medium", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
