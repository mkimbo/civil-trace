import { getAlerts } from '@/lib/payload/getAlerts'
import { getSightings } from '@/lib/payload/getSightings'
import { getAuthenticatedUser } from '@/utilities/getAuthenticatedUser'
import { SightingsClient } from './SightingsClient'

interface SightingsServerProps {
  alertId?: string
}

export async function SightingsServer({ alertId }: SightingsServerProps) {
  const user = await getAuthenticatedUser()

  const [alertsRes, sightingsRes] = await Promise.all([
    getAlerts({ status: 'published', limit: 100 }),
    getSightings({
      userId: user?.id ? String(user.id) : undefined,
      alertId: alertId || undefined,
    }),
  ])

  const activeAlerts = alertsRes.value?.docs || []
  const sightings = sightingsRes.value || []

  return (
    <SightingsClient
      initialAlerts={activeAlerts}
      initialSightings={sightings}
      selectedAlertId={alertId}
    />
  )
}
