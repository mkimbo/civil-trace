export function DashboardKPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-8 rounded-xl bg-muted" />
          </div>
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
