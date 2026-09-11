import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LiveMapServer } from '@/components/map/LiveMapServer'
import { LiveMapSkeleton } from '@/components/map/LiveMapSkeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function DashboardMapPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <DashboardShell>
      <div className="h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-border">
        <Suspense fallback={<LiveMapSkeleton />}>
          <LiveMapServer category={params.category} hideNavbarHeader={true} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
