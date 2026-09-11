import { Suspense } from 'react'
import { LiveMapServer } from '@/components/map/LiveMapServer'
import { LiveMapSkeleton } from '@/components/map/LiveMapSkeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function PublicMapPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <Suspense fallback={<LiveMapSkeleton />}>
      <LiveMapServer category={params.category} />
    </Suspense>
  )
}
