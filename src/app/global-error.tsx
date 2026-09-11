'use client'

import * as Sentry from '@sentry/nextjs'
import Error from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
        <div className="text-center max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-lg">
          <h2 className="text-2xl font-black text-foreground">Something went wrong</h2>
          <p className="text-xs text-muted-foreground">
            A critical application error occurred and has been captured for engineering investigation.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}