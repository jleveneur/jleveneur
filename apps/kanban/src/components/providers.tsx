"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { Toaster } from "sonner"

import { TooltipProvider } from "@repo/ui/components/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000 } } })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
