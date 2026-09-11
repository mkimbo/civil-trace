import { getCivicLedger } from '@/lib/payload/getCivicLedger'
import { getAuthenticatedUser } from '@/utilities/getAuthenticatedUser'
import { PointsClient } from './PointsClient'

export async function PointsServer() {
  const user = await getAuthenticatedUser()
  const result = await getCivicLedger(user?.id ? String(user.id) : '')

  const data = result.value || {
    balance: 0,
    rank: 'Citizen Contributor',
    nextMilestone: 250,
    history: [],
    totalTransactions: 0,
  }

  return <PointsClient initialData={data} />
}
