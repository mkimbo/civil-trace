export function AlertsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-9 w-full sm:w-72 rounded-xl bg-muted" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-40 w-full rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded-xl bg-muted" />
                <div className="h-8 rounded-xl bg-muted" />
              </div>
              <div className="h-9 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
