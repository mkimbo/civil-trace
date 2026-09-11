import { getAlerts } from '@/lib/payload/getAlerts'
import { AlertsClient } from './AlertsClient'

interface AlertsServerProps {
  category?: string
  search?: string
}

export async function AlertsServer({ category, search }: AlertsServerProps) {
  const result = await getAlerts({
    category,
    search,
    limit: 50,
  })

  const alerts = result.value?.docs || []

  return (
    <AlertsClient
      initialAlerts={alerts}
      initialCategory={category}
      initialSearch={search}
    />
  )
}
