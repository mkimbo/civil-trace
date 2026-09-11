import { getPayload } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'

const _getAlertById = withSafeAction(
  async (id: string) => {
    const payload = await getPayload({ config })
    const alert = await payload.findByID({
      collection: 'alerts',
      id,
      depth: 1,
    })
    return alert
  },
  {
    contextName: 'getAlertById',
    fallbackValue: null,
    shouldRethrow: false,
  }
)

export const getAlertById = async (id: string) => {
  return unstable_cache(
    async () => _getAlertById(id),
    [`alert-${id}`],
    {
      tags: ['alerts', `alert-${id}`],
      revalidate: CACHE_TTL.FRESH,
    }
  )()
}
