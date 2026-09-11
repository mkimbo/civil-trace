import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const county = searchParams.get('county')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const payload = await getPayload({ config })

    const where: any = {
      isActive: { equals: true },
    }

    if (county && county !== 'All') {
      where.county = { equals: county }
    }

    if (search) {
      where.or = [
        { stationName: { contains: search } },
        { ocsName: { contains: search } },
        { phoneNumber: { contains: search } },
        { subCounty: { contains: search } },
      ]
    }

    const stations = await payload.find({
      collection: 'ocs-directory',
      where,
      depth: 0,
      limit,
      sort: 'stationName',
    })

    return NextResponse.json({
      success: true,
      docs: stations.docs,
      totalDocs: stations.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching OCS directory:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch directory' }, { status: 500 })
  }
}
