import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"

export function UserAvatar({
  name,
  image,
  className
}: {
  name: string
  image: string | null
  className?: string
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn("size-7 ring-2 ring-background", className)}>
      {image === null ? null : <AvatarImage src={image} alt={name} />}
      <AvatarFallback>{initials || "?"}</AvatarFallback>
    </Avatar>
  )
}
