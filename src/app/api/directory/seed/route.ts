import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { KENYA_POLICE_STATIONS } from '@/data/kenya-police-directory'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    let seeded = 0
    for (const s of KENYA_POLICE_STATIONS) {
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

    try {
      revalidateTag('ocs-directory')
    } catch {}

    const total = await payload.count({ collection: 'ocs-directory' })

    return NextResponse.json({
      success: true,
      message: `Database synchronized with ${total.totalDocs} police stations. Newly inserted: ${seeded}`,
      totalStations: total.totalDocs,
      newlySeeded: seeded,
    })
  } catch (error: any) {
    console.error('Error seeding directory:', error)
    return NextResponse.json({ error: error.message || 'Failed to seed directory' }, { status: 500 })
  }
}
