import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

export interface GetAlertsParams {
  category?: string
  status?: string
  userId?: string
  limit?: number
  search?: string
}

const _getAlerts = withSafeAction(
  async (params: GetAlertsParams) => {
    const payload = await getPayload({ config })

    const where: Where = {}

    if (params.userId) {
      where.submittedBy = { equals: params.userId }
    } else if (params.status && params.status !== 'all') {
      where._status = { equals: params.status }
    } else if (!params.status) {
      where._status = { equals: 'published' }
    }

    if (params.category && params.category !== 'all') {
      where.category = { equals: params.category }
    }

    if (params.search) {
      where.or = [
        { title: { contains: params.search } },
        { obNumber: { contains: params.search } },
        { policeStation: { contains: params.search } },
        { lastSeenLocationName: { contains: params.search } },
      ]
    }

    const result = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit: params.limit || 25,
      sort: '-createdAt',
    })

    return {
      docs: result.docs,
      totalDocs: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    }
  },
  {
    contextName: 'getAlerts',
    fallbackValue: { docs: [], totalDocs: 0, page: 1, totalPages: 0 },
    shouldRethrow: false,
  }
)

export const getAlerts = async (params: GetAlertsParams) => {
  const cacheKey = `alerts-${params.category || 'all'}-${params.status || 'pub'}-${params.userId || 'any'}-${params.search || ''}-${params.limit || 25}`
  return unstable_cache(
    async () => _getAlerts(params),
    [cacheKey],
    {
      tags: ['alerts'],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
