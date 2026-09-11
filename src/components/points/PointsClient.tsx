'use client'

import {
  CheckCircle,
  Shield,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { UserLedgerData } from '@/lib/payload/getCivicLedger'

interface PointsClientProps {
  initialData: UserLedgerData
}

export function PointsClient({ initialData }: PointsClientProps) {
  const { balance, rank, nextMilestone, history } = initialData

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Points Header Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Community Trust Standing
            </span>
            <span className="text-xs text-muted-foreground">• {rank}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Community Trust & Verification
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md">
            Track your verified incident reports, confirmed sightings, and contributions to safe civil recovery across Kenya.
          </p>
        </div>

        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg flex flex-col items-center sm:items-end w-full sm:w-auto shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
            Trust Standing Points
          </span>
          <span className="text-4xl sm:text-5xl font-black mt-1">
            {balance}
          </span>
          <span className="text-[11px] text-primary-foreground/90 mt-1 font-medium">
            Next milestone: {nextMilestone} pts ({rank})
          </span>
        </div>
      </div>

      {/* Community Trust Milestones */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Verified Citizen</h4>
              <p className="text-[11px] text-muted-foreground">Standard Status (0+ pts)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Direct access to submit civil alerts and verified field sightings into the triage queue.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Active Standby</h4>
              <p className="text-[11px] text-muted-foreground">Trusted Mesh (250+ pts)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Receives high-priority geo-radius notifications for rapid eyewitness corroboration.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Community Warden</h4>
              <p className="text-[11px] text-muted-foreground">Triage Clearance (500+ pts)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Eligible to review and verify eyewitness sightings and police station directory hotlines.
          </p>
        </div>
      </div>

      {/* Ledger Activity History */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Verification Ledger</h3>
            <p className="text-xs text-muted-foreground">
              Tamper-proof record of points earned through validated civic actions.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono font-semibold">
            {history.length} Entries
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground italic">
            No ledger activity recorded yet. Submit an alert or report a sighting to earn trust standing.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl border border-border/80 p-4 hover:bg-muted/30 transition text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs sm:text-sm">
                      {entry.description || entry.action}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString('en-KE')}
                    </p>
                  </div>
                </div>

                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base shrink-0">
                  +{entry.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
