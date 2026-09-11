import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

export interface LiveAlertItem {
  id: string
  category: 'missing-person' | 'lost-vehicle' | 'lost-motorbike'
  title: string
  obNumber: string
  policeStation: string
  locationName: string
  lat: number
  lng: number
  lastSeenDate: string
  contactPhone: string
  photoUrl: string | null
  isPaidBroadcast?: boolean
}

const _getLiveAlerts = withSafeAction(
  async (category?: string): Promise<LiveAlertItem[]> => {
    const payload = await getPayload({ config })

    const where: Where = {
      _status: { equals: 'published' },
    }

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })

    return result.docs.map((a: any) => {
      const coords = Array.isArray(a.lastSeenLocation) ? a.lastSeenLocation : [36.8219, -1.2921]
      const photoDoc = a.photo
      const photoUrl = photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)

      return {
        id: a.id,
        category: a.category,
        title: a.title,
        obNumber: a.obNumber,
        policeStation: a.policeStation,
        locationName: a.lastSeenLocationName || 'Kenya',
        lat: coords[1],
        lng: coords[0],
        lastSeenDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-KE') : 'Recent',
        contactPhone: a.contactPhone || '999',
        photoUrl,
        isPaidBroadcast: a.isPaidBroadcast,
      }
    })
  },
  {
    contextName: 'getLiveAlerts',
    fallbackValue: [],
    shouldRethrow: false,
  }
)

export const getLiveAlerts = async (category?: string): Promise<Result<LiveAlertItem[]>> => {
  return unstable_cache(
    async () => _getLiveAlerts(category),
    [`live-alerts-${category || 'all'}`],
    {
      tags: ['alerts', 'live-alerts'],
      revalidate: CACHE_TTL.FRESH, // 1 minute
    }
  )()
}
