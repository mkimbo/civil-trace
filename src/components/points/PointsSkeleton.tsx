export function PointsSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-28 w-48 rounded-3xl bg-muted shrink-0" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
            <div className="h-8 w-full rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  )
}
