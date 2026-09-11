import Link from 'next/link'
import { Bike, Car, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAlerts } from '@/lib/payload/getAlerts'

export async function DashboardRecentAlertsServer() {
  const result = await getAlerts({ limit: 3, status: 'published' })
  const docs = result.value?.docs || []

  if (docs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
        No active incidents currently reported in your region.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {docs.map((item: any) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-md transition"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {item.category === 'missing-person' ? (
                <User className="h-5 w-5" />
              ) : item.category === 'lost-motorbike' ? (
                <Bike className="h-5 w-5" />
              ) : (
                <Car className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5">
                  {item.category.replace('-', ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">{item.obNumber}</span>
              </div>
              <h4 className="mt-1 font-bold text-sm text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {item.lastSeenLocationName || item.policeStation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-border sm:border-t-0 pt-2 sm:pt-0">
            <Link href={`/dashboard/sightings?alertId=${item.id}`}>
              <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                Report Sighting
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
