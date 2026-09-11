import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// GET /api/alerts/live - Public live alerts with coordinates for maps and emergency feeds
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const payload = await getPayload({ config })

    const where: any = {
      _status: { equals: 'published' },
    }

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    const alerts = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit,
      sort: '-createdAt',
    })

    // Map into geojson-friendly format for Leaflet
    const features = alerts.docs.map((alert: any) => {
      const coords = Array.isArray(alert.lastSeenLocation) ? alert.lastSeenLocation : [36.8219, -1.2921]
      const photoDoc = alert.photo
      const photoUrl = photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)

      return {
        id: alert.id,
        title: alert.title,
        category: alert.category,
        obNumber: alert.obNumber,
        policeStation: alert.policeStation,
        locationName: alert.lastSeenLocationName,
        coordinates: coords, // [lng, lat]
        contactPhone: alert.contactPhone,
        photoUrl,
        isPaidBroadcast: alert.isPaidBroadcast,
        createdAt: alert.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      count: features.length,
      alerts: features,
    })
  } catch (error: any) {
    console.error('Error fetching live alerts:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch live alerts' }, { status: 500 })
  }
}
