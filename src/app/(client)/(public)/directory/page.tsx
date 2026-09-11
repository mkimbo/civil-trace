import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building } from 'lucide-react'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'
import { DirectoryServer } from '@/components/directory/DirectoryServer'
import { DirectorySkeleton } from '@/components/directory/DirectorySkeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ county?: string; search?: string }>
}

export default async function PublicDirectoryPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Zero-Data Emergency Cache
              </span>
              <span className="text-xs text-muted-foreground">• National Kenya Police Hotlines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Official Police & OCS Directory
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Direct emergency contact desk numbers and Officer Commanding Station (OCS) registries across Kenya.
              Cached locally on your device for instant offline access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-xs text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Police Hotline
              </span>
              <a href="tel:999" className="text-base font-black text-primary hover:underline">
                999 / 112 / 0800 722 203
              </a>
            </div>
          </div>
        </div>

        {/* Data Fetching Component wrapped in Suspense with Skeleton */}
        <Suspense fallback={<DirectorySkeleton />}>
          <DirectoryServer county={params.county} search={params.search} />
        </Suspense>
      </main>
    </div>
  )
}
