import { Suspense } from 'react'
import Link from 'next/link'
import {
  Award,
  FilePlus,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardKPIServer } from '@/components/dashboard/overview/DashboardKPIServer'
import { DashboardKPISkeleton } from '@/components/dashboard/overview/DashboardKPISkeleton'
import { DashboardRecentAlertsServer } from '@/components/dashboard/overview/DashboardRecentAlertsServer'
import { DashboardRecentAlertsSkeleton } from '@/components/dashboard/overview/DashboardRecentAlertsSkeleton'

export const metadata = {
  title: 'Operational Dispatch | CivilTrace Sentinel',
  description: 'Real-time civil safety dashboard, OB telemetry, and emergency dispatch monitor.',
}

export default function DashboardOverviewPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Welcome & Incident Dispatch Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Live Sentinel Radar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
              Operational Command
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live civil alerts, police OB coordination, and real-time field sightings.
            </p>
          </div>
          <Link href="/dashboard/create-alert">
            <Button className="gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-xs sm:text-sm py-5 shadow-xs hover:bg-primary/90">
              <FilePlus className="h-4 w-4" />
              <span>Report Emergency</span>
            </Button>
          </Link>
        </div>

        {/* Dynamic Metric Cards with Suspense */}
        <Suspense fallback={<DashboardKPISkeleton />}>
          <DashboardKPIServer />
        </Suspense>

        {/* Quick Launchpad & Active Feeds */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Incidents Feed with Suspense */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">Active High-Priority Alerts</h3>
              <Link href="/dashboard/alerts" className="text-xs font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>

            <Suspense fallback={<DashboardRecentAlertsSkeleton />}>
              <DashboardRecentAlertsServer />
            </Suspense>
          </div>

          {/* Side Shortcuts & Tools */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Operational Tools</h3>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
              <Link
                href="/dashboard/map"
                className="flex items-center gap-3 rounded-2xl p-3 hover:bg-background/80 transition border border-transparent hover:border-border"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Interactive Alert Map</h4>
                  <p className="text-xs text-muted-foreground">View GPS geofence radar</p>
                </div>
              </Link>

              <Link
                href="/dashboard/directory"
                className="flex items-center gap-3 rounded-2xl p-3 hover:bg-background/80 transition border border-transparent hover:border-border"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">OCS Police Directory</h4>
                  <p className="text-xs text-muted-foreground">Offline cached hotlines</p>
                </div>
              </Link>

              <Link
                href="/dashboard/triage"
                className="flex items-center gap-3 rounded-2xl p-3 hover:bg-background/80 transition border border-transparent hover:border-border"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Forensic Triage Queue</h4>
                  <p className="text-xs text-muted-foreground">Moderator verification queue</p>
                </div>
              </Link>

              <Link
                href="/dashboard/points"
                className="flex items-center gap-3 rounded-2xl p-3 hover:bg-background/80 transition border border-transparent hover:border-border"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Trust & Verification Record</h4>
                  <p className="text-xs text-muted-foreground">Track standing & achievements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
