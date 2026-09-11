import { getPendingTriageAlerts } from '@/lib/payload/getPendingTriageAlerts'
import { TriageClient } from './TriageClient'

interface TriageServerProps {
  category?: string
}

export async function TriageServer({ category }: TriageServerProps) {
  const result = await getPendingTriageAlerts(category)
  const alerts = result.value || []

  return (
    <TriageClient
      initialAlerts={alerts}
      initialCategory={category}
    />
  )
}
