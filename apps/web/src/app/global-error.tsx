"use client"

import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"

import "./globals.css"

/**
 * The last resort: an error in the root layout itself.
 *
 * This replaces the whole document, so it has to render `<html>` and `<body>`.
 * The stylesheet is imported here because the broken layout no longer provides it.
 * The message is deliberately not rendered: it can carry query fragments or
 * internal detail, and the digest is what actually correlates with a server log.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <main className="mx-auto flex max-w-sm flex-col justify-center px-6 py-24">
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {error.digest === undefined
                  ? "Try again in a moment."
                  : `Reference: ${error.digest}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={reset}>Try again</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  )
}
