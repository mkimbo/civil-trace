import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { TriageServer } from '@/components/triage/TriageServer'
import { TriageSkeleton } from '@/components/triage/TriageSkeleton'
import { Radio } from 'lucide-react'

export const metadata = {
  title: 'OB Verification Queue | CivilTrace Sentinel',
  description: 'Review pending incident records and verify against national police OB logs.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TriagePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">Live Intake</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              OB Verification & Triage
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and cross-reference citizen and field reports before initiating nationwide broadcast.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-primary">
            <Radio className="h-4 w-4 shrink-0 animate-pulse" />
            <span className="text-xs font-black">Active Triage Protocol</span>
          </div>
        </div>

        <Suspense fallback={<TriageSkeleton />}>
          <TriageServer category={category} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
