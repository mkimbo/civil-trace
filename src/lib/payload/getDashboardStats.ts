import { getPayload } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

const _getDashboardStats = withSafeAction(
  async (userId?: string) => {
    const payload = await getPayload({ config })

    const [activeRes, sightingsRes] = await Promise.all([
      payload.count({
        collection: 'alerts',
        where: { _status: { equals: 'published' } },
      }),
      payload.count({
        collection: 'sightings',
      }),
    ])

    let pointsBalance = 0
    if (userId) {
      try {
        const userDoc = await payload.findByID({
          collection: 'users',
          id: userId,
        })
        pointsBalance = userDoc?.civicPointsBalance || 0
      } catch (err) {
        // fallback
      }
    }

    return {
      activeAlertsCount: activeRes.totalDocs,
      sightingsCount: sightingsRes.totalDocs,
      pointsBalance,
    }
  },
  {
    contextName: 'getDashboardStats',
    fallbackValue: { activeAlertsCount: 0, sightingsCount: 0, pointsBalance: 0 },
    shouldRethrow: false,
  }
)

export const getDashboardStats = async (userId?: string) => {
  return unstable_cache(
    async () => _getDashboardStats(userId),
    [`dashboard-stats-${userId || 'anon'}`],
    {
      tags: ['alerts', 'sightings', 'civic-ledger'],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
