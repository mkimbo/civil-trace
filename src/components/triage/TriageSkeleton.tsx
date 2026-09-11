export function TriageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="space-y-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex gap-4">
              <div className="h-28 w-28 rounded-2xl bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded-md bg-muted" />
                <div className="h-6 w-3/4 rounded-md bg-muted" />
                <div className="h-4 w-1/2 rounded-md bg-muted" />
              </div>
              <div className="h-24 w-72 rounded-2xl bg-muted shrink-0 hidden lg:block" />
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <div className="h-4 w-32 rounded-md bg-muted" />
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded-xl bg-muted" />
                <div className="h-8 w-36 rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
