import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { PointsServer } from '@/components/points/PointsServer'
import { PointsSkeleton } from '@/components/points/PointsSkeleton'

export const metadata = {
  title: 'Community Trust & Verification | CivilTrace Sentinel',
  description: 'Track community trust standing, milestone verification levels, and civic action logs.',
}

export default function CivicPointsPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<PointsSkeleton />}>
        <PointsServer />
      </Suspense>
    </DashboardShell>
  )
}
