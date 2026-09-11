import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'
import { AlertDetailServer } from '@/components/alerts/detail/AlertDetailServer'
import { AlertDetailSkeleton } from '@/components/alerts/detail/AlertDetailSkeleton'
import { getAlertById } from '@/lib/payload/getAlertById'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params
    const result = await getAlertById(id)
    const alert = result.value

    if (!alert) return { title: 'Emergency Alert | CivilTrace' }

    const photoDoc: any = alert.photo
    const photoUrl = photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)

    return {
      title: `${alert.title} | OB ${alert.obNumber} | CivilTrace`,
      description: `Verified Emergency Report at ${alert.policeStation}. If you have information or sightings, contact ${alert.contactPhone || '999'}.`,
      openGraph: {
        title: `URGENT: ${alert.title} (OB: ${alert.obNumber})`,
        description: `Verified Emergency Report at ${alert.policeStation}. If you have information or sightings, contact ${alert.contactPhone || '999'}.`,
        images: photoUrl ? [photoUrl] : [],
      },
    }
  } catch {
    return { title: 'Emergency Alert | CivilTrace' }
  }
}

export default async function PublicAlertDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Live Map</span>
          </Link>
        </div>

        <Suspense fallback={<AlertDetailSkeleton />}>
          <AlertDetailServer id={id} />
        </Suspense>
      </main>
    </div>
  )
}
