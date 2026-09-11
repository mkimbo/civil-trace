import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Building, ShieldCheck } from 'lucide-react'
import { DirectoryServer } from '@/components/directory/DirectoryServer'
import { DirectorySkeleton } from '@/components/directory/DirectorySkeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ county?: string; search?: string }>
}

export default async function DashboardDirectoryPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shrink-0">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-foreground">Police & OCS Desk Directory</h1>
                <p className="text-xs text-muted-foreground">
                  Verified emergency hotlines and station command contacts across all 47 counties.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Hotlines</span>
              </span>
            </div>
          </div>
        </div>

        {/* Data Fetching Component wrapped in Suspense with Skeleton */}
        <Suspense fallback={<DirectorySkeleton />}>
          <DirectoryServer county={params.county} search={params.search} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
