import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { Result, withSafeAction } from '../safe-action'
import { unstable_cache } from 'next/cache'
import { CACHE_TTL } from '@/constants/caching'
import { KENYA_POLICE_STATIONS } from '@/data/kenya-police-directory'

export interface DirectoryStation {
  id: string
  stationName: string
  ocsName?: string
  phoneNumber: string
  alternatePhone?: string
  county: string
  subCounty?: string
  ward?: string
  isActive?: boolean
}

const _getDirectoryStations = withSafeAction(
  async (county?: string, search?: string): Promise<DirectoryStation[]> => {
    const stationMap = new Map<string, DirectoryStation>()

    // 1. Always preload all 218+ verified national police stations from dataset
    for (const s of KENYA_POLICE_STATIONS) {
      stationMap.set(s.stationName.toLowerCase().trim(), {
        id: s.stationName,
        stationName: s.stationName,
        ocsName: s.ocsName,
        phoneNumber: s.phoneNumber,
        alternatePhone: s.alternatePhone,
        county: s.county,
        subCounty: s.subCounty,
        ward: s.ward,
        isActive: true,
      })
    }

    // 2. Fetch from MongoDB Atlas to merge live database overrides and IDs
    try {
      const payload = await getPayload({ config })
      const where: Where = {
        isActive: { equals: true },
      }

      if (county && county !== 'All' && county !== 'All Counties') {
        where.county = { equals: county }
      }

      if (search) {
        where.or = [
          { stationName: { contains: search } },
          { ocsName: { contains: search } },
          { subCounty: { contains: search } },
          { phoneNumber: { contains: search } },
        ]
      }

      const result = await payload.find({
        collection: 'ocs-directory',
        where,
        depth: 0,
        limit: 300,
        sort: 'stationName',
      })

      for (const d of result.docs as any[]) {
        const key = d.stationName.toLowerCase().trim()
        const existing = stationMap.get(key)
        stationMap.set(key, {
          ...(existing || {}),
          id: d.id,
          stationName: d.stationName,
          ocsName: d.ocsName || existing?.ocsName,
          phoneNumber: d.phoneNumber || existing?.phoneNumber || '',
          alternatePhone: d.alternatePhone || existing?.alternatePhone,
          county: d.county || existing?.county || 'Nairobi',
          subCounty: d.subCounty || existing?.subCounty,
          ward: d.ward || existing?.ward,
          isActive: d.isActive,
        })
      }
    } catch {
      // Fallback cleanly to verified static stations if DB query is connecting
    }

    let list = Array.from(stationMap.values())

    if (county && county !== 'All' && county !== 'All Counties') {
      list = list.filter((s) => s.county.toLowerCase() === county.toLowerCase())
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.stationName.toLowerCase().includes(q) ||
          s.county.toLowerCase().includes(q) ||
          (s.subCounty && s.subCounty.toLowerCase().includes(q)) ||
          (s.ocsName && s.ocsName.toLowerCase().includes(q)) ||
          s.phoneNumber.includes(q)
      )
    }

    return list.sort((a, b) => {
      if (a.county.toLowerCase() === b.county.toLowerCase()) {
        return a.stationName.localeCompare(b.stationName)
      }
      return a.county.localeCompare(b.county)
    })
  },
  {
    contextName: 'getDirectoryStations',
    fallbackValue: [],
    shouldRethrow: false,
  }
)

export const getDirectoryStations = async (
  county?: string,
  search?: string
): Promise<Result<DirectoryStation[]>> => {
  return unstable_cache(
    async () => _getDirectoryStations(county, search),
    [`directory-stations-${county || 'all'}-${search || ''}`],
    {
      tags: ['ocs-directory'],
      revalidate: CACHE_TTL.SHORT,
    }
  )()
}
