import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

const _getPendingTriageAlerts = withSafeAction(
  async (category?: string) => {
    const payload = await getPayload({ config })

    const where: Where = {
      _status: { equals: 'draft' },
    }

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit: 50,
      sort: '-createdAt',
    })

    return result.docs
  },
  {
    contextName: 'getPendingTriageAlerts',
    fallbackValue: [],
    shouldRethrow: false,
  }
)

export const getPendingTriageAlerts = async (category?: string) => {
  return unstable_cache(
    async () => _getPendingTriageAlerts(category),
    [`pending-triage-${category || 'all'}`],
    {
      tags: ['triage-alerts', 'alerts'],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
