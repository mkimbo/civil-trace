import { AlertTriangle, Award, Eye, Zap } from 'lucide-react'
import { getDashboardStats } from '@/lib/payload/getDashboardStats'
import { getAuthenticatedUser } from '@/utilities/getAuthenticatedUser'

export async function DashboardKPIServer() {
  const user = await getAuthenticatedUser()
  const statsRes = await getDashboardStats(user?.id ? String(user.id) : undefined)
  const { activeAlertsCount, sightingsCount, pointsBalance } = statsRes.value

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Active Incidents */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Active Emergency Alerts</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-black text-foreground">{activeAlertsCount}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Verified live incidents</p>
      </div>

      {/* Trust & Civic Standing */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Civic Standing</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-black text-foreground">{pointsBalance}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {pointsBalance >= 500 ? 'Community Warden' : `${Math.max(0, 500 - pointsBalance)} pts to Warden`}
        </p>
      </div>

      {/* FCM Geo-Radius */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">FCM Geo-Radius</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-black text-foreground">5.0 km</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Standard mesh broadcast</p>
      </div>

      {/* Field Sightings */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Field Sightings</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Eye className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-black text-foreground">{sightingsCount}</p>
        <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">Community reports</p>
      </div>
    </div>
  )
}
