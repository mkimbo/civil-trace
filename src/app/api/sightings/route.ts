import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'
import { awardCivicPoints } from '@/lib/points/award'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'

export const dynamic = 'force-dynamic'

// GET /api/sightings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const alertId = searchParams.get('alertId')
    const mine = searchParams.get('mine') === 'true'
    const status = searchParams.get('status')

    const payload = await getPayload({ config })
    const user = await getAuthUser()

    const where: any = {}

    if (alertId) {
      where.alert = { equals: alertId }
    }

    if (mine) {
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      where.reporter = { equals: user.id }
    }

    if (status) {
      where.verificationStatus = { equals: status }
    }

    const sightings = await payload.find({
      collection: 'sightings',
      where,
      depth: 2,
      limit: 50,
      sort: '-createdAt',
    })

    return NextResponse.json({
      success: true,
      docs: sightings.docs,
      totalDocs: sightings.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching sightings:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch sightings' }, { status: 500 })
  }
}

// POST /api/sightings - Report an eyewitness sighting
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to report a sighting.' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const alertId = formData.get('alertId') as string
    const description = (formData.get('description') as string) || ''
    const locationName = (formData.get('locationName') as string) || ''
    const rawCoords = formData.get('coordinates') as string
    const photoFile = formData.get('photo') as File | null

    if (!alertId || !description) {
      return NextResponse.json(
        { error: 'Alert reference ID and detailed description are required.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Verify alert exists
    const alert = await payload.findByID({
      collection: 'alerts',
      id: alertId,
      depth: 0,
    })

    if (!alert) {
      return NextResponse.json({ error: 'Referenced emergency alert does not exist' }, { status: 404 })
    }

    // Optional photo upload
    let photoId: string | undefined = undefined
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Sighting photo for alert: ${alert.title}`,
          caption: `Reported at: ${locationName || 'Kenya'}`,
        },
        file: {
          data: buffer,
          mimetype: photoFile.type || 'image/jpeg',
          name: photoFile.name || `sighting-${Date.now()}.jpg`,
          size: buffer.length,
        },
      })
      photoId = mediaDoc.id as string
    }

    // Coordinates default to alert coordinates or Nairobi
    let coordinates: [number, number] = Array.isArray(alert.lastSeenLocation)
      ? (alert.lastSeenLocation as [number, number])
      : [36.8219, -1.2921]

    if (rawCoords) {
      try {
        const parsed = JSON.parse(rawCoords)
        if (Array.isArray(parsed) && parsed.length === 2) {
          coordinates = [Number(parsed[0]), Number(parsed[1])]
        }
      } catch {
        // use fallback
      }
    }

    // Create sighting document
    const newSighting = await payload.create({
      collection: 'sightings',
      data: {
        alert: alertId,
        reporter: user.id as any,
        location: coordinates,
        locationName: locationName.trim(),
        sightingDate: new Date().toISOString(),
        description: description.trim(),
        photo: photoId,
        verificationStatus: 'pending',
      },
    })

    // Award reporter submission points
    await awardCivicPoints({
      userId: user.id as string,
      action: 'alert-shared',
      points: 50,
      description: `Submitted eyewitness sighting for alert "${alert.title}"`,
      relatedAlertId: alert.id,
    })

    // Alert moderators of new incoming sighting
    await notifyTopic(
      TOPICS.MODERATOR_TRIAGE,
      'New Eyewitness Sighting Reported',
      `New sighting at ${locationName || 'Kenya'} for OB ${alert.obNumber}.`,
      {
        alertId: alert.id,
        sightingId: newSighting.id,
      }
    )

    return NextResponse.json({
      success: true,
      sightingId: newSighting.id,
      message: 'Eyewitness sighting submitted successfully. Thank you for contributing to safe recovery.',
    })
  } catch (error: any) {
    console.error('Error reporting sighting:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit sighting' },
      { status: 500 }
    )
  }
}
