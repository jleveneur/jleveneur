"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { Skeleton } from "@repo/ui/components/skeleton"

import { useSession } from "@/lib/auth-client.ts"
import { authClient } from "@/lib/auth-client.ts"

export function GuestSession({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data, isPending } = useSession()

  useEffect(() => {
    if (isPending || data != null) {
      return
    }

    void authClient.signIn.anonymous().then(() => {
      router.refresh()
    })
  }, [data, isPending, router])

  if (isPending || data == null) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    )
  }

  return children
}
