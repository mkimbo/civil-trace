import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

export interface GetSightingsParams {
  alertId?: string
  userId?: string
  status?: string
}

const _getSightings = withSafeAction(
  async (params: GetSightingsParams) => {
    const payload = await getPayload({ config })

    const where: Where = {}

    if (params.alertId) {
      where.alert = { equals: params.alertId }
    }

    if (params.userId) {
      where.reporter = { equals: params.userId }
    }

    if (params.status) {
      where.verificationStatus = { equals: params.status }
    }

    const result = await payload.find({
      collection: 'sightings',
      where,
      depth: 2,
      limit: 50,
      sort: '-createdAt',
    })

    return result.docs
  },
  {
    contextName: 'getSightings',
    fallbackValue: [],
    shouldRethrow: false,
  }
)

export const getSightings = async (params: GetSightingsParams) => {
  const cacheKey = `sightings-${params.alertId || 'all'}-${params.userId || 'any'}-${params.status || 'all'}`
  return unstable_cache(
    async () => _getSightings(params),
    [cacheKey],
    {
      tags: ['sightings'],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
