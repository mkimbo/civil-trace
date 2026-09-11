import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/shell'
import { AlertsServer } from '@/components/alerts/AlertsServer'
import { AlertsSkeleton } from '@/components/alerts/AlertsSkeleton'
import { Button } from '@/components/ui/button'
import { FilePlus } from 'lucide-react'

export const metadata = {
  title: 'Emergency Alerts Directory | CivilTrace Sentinel',
  description: 'Verified emergency incident alerts directory.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AlertsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">Emergency Alerts Directory</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live civil alerts registered across the community network with verified police OB references.
            </p>
          </div>
          <Link href="/dashboard/create-alert">
            <Button className="gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-xs sm:text-sm py-5 shadow-xs hover:bg-primary/90">
              <FilePlus className="h-4 w-4" />
              <span>Report New Alert</span>
            </Button>
          </Link>
        </div>

        <Suspense fallback={<AlertsSkeleton />}>
          <AlertsServer category={category} search={search} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
