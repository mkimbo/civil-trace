export function LiveMapSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground animate-pulse overflow-hidden w-full">
      <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="h-5 w-36 rounded-md bg-muted" />
        <div className="h-8 w-24 rounded-xl bg-muted" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-96 flex-col border-r border-border bg-card p-4 space-y-3">
          <div className="h-9 w-full rounded-xl bg-muted" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-20 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-muted/40 relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-muted animate-ping" />
        </div>
      </div>
    </div>
  )
}
