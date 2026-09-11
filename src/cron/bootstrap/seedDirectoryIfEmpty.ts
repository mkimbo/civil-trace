import { getPayload } from 'payload'
import config from '@payload-config'
import * as Sentry from '@sentry/nextjs'
import { withSafeAction } from '@/lib/safe-action'
import { KENYA_POLICE_STATIONS } from '@/data/kenya-police-directory'
import { revalidateTag } from 'next/cache'

const runSeedDirectoryIfEmpty = async () => {
  const payload = await getPayload({ config })

  try {
    const countRes = await payload.count({
      collection: 'ocs-directory',
    })

    if (countRes.totalDocs >= KENYA_POLICE_STATIONS.length) {
      payload.logger.info(`[BOOTSTRAP] Police station directory ready (${countRes.totalDocs} stations registered).`)
      return
    }

    payload.logger.info('[BOOTSTRAP] Police station directory is empty or incomplete. Seeding national police stations...')

    let seeded = 0
    for (const s of KENYA_POLICE_STATIONS) {
      // Avoid duplicate station name insert
      const exists = await payload.find({
        collection: 'ocs-directory',
        where: {
          stationName: { equals: s.stationName },
        },
        limit: 1,
      })

      if (exists.totalDocs === 0) {
        await payload.create({
          collection: 'ocs-directory',
          data: {
            stationName: s.stationName,
            ocsName: s.ocsName,
            phoneNumber: s.phoneNumber,
            alternatePhone: s.alternatePhone,
            county: s.county,
            subCounty: s.subCounty,
            ward: s.ward,
            location: s.location,
            isActive: true,
            lastVerified: new Date().toISOString(),
          },
        })
        seeded++
      }
    }

    if (seeded > 0) {
      try {
        revalidateTag('ocs-directory')
      } catch {
        // No request context during early bootstrap
      }
      payload.logger.info(`[BOOTSTRAP] Successfully seeded ${seeded} national police stations into OCSDirectory.`)
    }
  } catch (error) {
    payload.logger.error(error as any, '❌ [BOOTSTRAP] Error seeding police station directory')
    Sentry.captureException(error)
  }
}

export const seedDirectoryIfEmpty = withSafeAction(runSeedDirectoryIfEmpty, {
  contextName: 'Bootstrap: Seed Police Station Directory',
  fallbackValue: undefined,
})
