export function SightingsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 space-y-4">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-10 w-full rounded-xl bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-10 w-full rounded-xl bg-muted" />
        <div className="h-4 w-44 rounded bg-muted" />
        <div className="h-24 w-full rounded-xl bg-muted" />
        <div className="h-28 w-full rounded-2xl bg-muted" />
        <div className="h-12 w-full rounded-2xl bg-muted" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 space-y-4">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-background p-4" />
          ))}
        </div>
      </div>
    </div>
  )
}
