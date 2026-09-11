import { admin } from '../firebase/admin'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function sendGeoRadiusPush(
  alertId: string,
  title: string,
  body: string,
  center: [number, number],
  radiusMeters: number
): Promise<number> {
  if (!admin.apps.length) {
    console.warn('Firebase admin not initialized, skipping FCM push')
    return 0
  }

  const payload = await getPayload({ config })

  const usersWithTokens = await payload.find({
    collection: 'users',
    where: {
      location: {
        near: [center[0], center[1], radiusMeters],
      },
    },
    limit: 500,
  })

  const tokens: string[] = []
  for (const doc of usersWithTokens.docs) {
    if (Array.isArray(doc.fcmTokens)) {
      for (const t of doc.fcmTokens) {
        if (typeof t === 'string' && t.trim()) {
          tokens.push(t.trim())
        }
      }
    }
  }

  if (tokens.length === 0) return 0

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    data: {
      alertId,
      url: `/map?alert=${alertId}`,
    },
  })

  return response.successCount
}
