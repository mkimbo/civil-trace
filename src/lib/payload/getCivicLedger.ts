import { getPayload } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

export interface UserLedgerData {
  balance: number
  rank: string
  nextMilestone: number
  history: any[]
  totalTransactions: number
}

const _getCivicLedger = withSafeAction(
  async (userId: string): Promise<UserLedgerData> => {
    if (!userId) {
      return { balance: 0, rank: 'Citizen Contributor', nextMilestone: 250, history: [], totalTransactions: 0 }
    }

    const payload = await getPayload({ config })

    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })

    const ledger = await payload.find({
      collection: 'civic-point-ledger',
      where: {
        user: { equals: userId },
      },
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })

    const balance = (user as any)?.civicPointsBalance || 0

    let rank = 'Citizen Contributor'
    let nextMilestone = 250
    if (balance >= 1000) {
      rank = 'Senior Community Warden'
      nextMilestone = 2500
    } else if (balance >= 500) {
      rank = 'Verified Community Warden'
      nextMilestone = 1000
    } else if (balance >= 250) {
      rank = 'Active Standby Contributor'
      nextMilestone = 500
    }

    return {
      balance,
      rank,
      nextMilestone,
      history: ledger.docs,
      totalTransactions: ledger.totalDocs,
    }
  },
  {
    contextName: 'getCivicLedger',
    fallbackValue: { balance: 0, rank: 'Citizen Contributor', nextMilestone: 250, history: [], totalTransactions: 0 },
    shouldRethrow: false,
  }
)

export const getCivicLedger = async (userId: string): Promise<Result<UserLedgerData>> => {
  return unstable_cache(
    async () => _getCivicLedger(userId),
    [`civic-ledger-${userId}`],
    {
      tags: [`civic-ledger-${userId}`, 'civic-ledger'],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
