import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { SightingsServer } from '@/components/sightings/SightingsServer'
import { SightingsSkeleton } from '@/components/sightings/SightingsSkeleton'

export const metadata = {
  title: 'Report Eyewitness Sighting | CivilTrace Sentinel',
  description: 'Submit geo-referenced sightings for active emergency alerts and missing persons.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SightingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const alertId = typeof resolvedParams.alertId === 'string' ? resolvedParams.alertId : undefined

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Eyewitness Transmission Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            Report an Eyewitness Sighting
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Provide precise location, time, and photo evidence to assist ongoing search and rescue efforts.
          </p>
        </div>

        <Suspense fallback={<SightingsSkeleton />}>
          <SightingsServer alertId={alertId} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
