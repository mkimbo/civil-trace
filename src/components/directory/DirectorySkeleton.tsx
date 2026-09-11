import { Building } from 'lucide-react'

export function DirectorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-md bg-muted" />
                <div className="h-5 w-44 rounded-md bg-muted" />
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-32 rounded-md bg-muted" />
              <div className="h-3 w-28 rounded-md bg-muted" />
            </div>
            <div className="h-10 w-full rounded-2xl bg-muted pt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
