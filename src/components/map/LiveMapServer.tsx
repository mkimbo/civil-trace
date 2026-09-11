import { getLiveAlerts } from '@/lib/payload/getLiveAlerts'
import { LiveMapClient } from './LiveMapClient'

interface LiveMapServerProps {
  category?: string
  hideNavbarHeader?: boolean
}

export async function LiveMapServer({ category, hideNavbarHeader = false }: LiveMapServerProps) {
  const result = await getLiveAlerts(category)
  const alerts = result.value || []

  return (
    <LiveMapClient
      initialAlerts={alerts}
      initialCategory={category}
      hideNavbarHeader={hideNavbarHeader}
    />
  )
}
