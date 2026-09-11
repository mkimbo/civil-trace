export function AlertDetailSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs animate-pulse space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-80 h-72 sm:h-80 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-9 w-3/4 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
          <div className="h-24 w-full rounded-2xl bg-muted" />
          <div className="h-12 w-full rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
