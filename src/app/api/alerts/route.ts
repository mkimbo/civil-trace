import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'
import { extractOGMetadata } from '@/lib/og-metadata/extract'
import { checkParity } from '@/lib/ai-parity/check'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'
import { awardCivicPoints } from '@/lib/points/award'
import { textToLexical } from '@/lib/lexical/convert'
import { initializePaystackTransaction } from '@/lib/paystack/initialize'

export const dynamic = 'force-dynamic'

// GET /api/alerts - List alerts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'published'
    const mine = searchParams.get('mine') === 'true'
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const search = searchParams.get('search')

    const payload = await getPayload({ config })
    const user = await getAuthUser()

    const where: any = {}

    // If requested user's own alerts
    if (mine) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      where.submittedBy = { equals: user.id }
    } else if (status !== 'all') {
      where._status = { equals: status }
    }

    if (category) {
      where.category = { equals: category }
    }

    if (search) {
      where.or = [
        { title: { contains: search } },
        { obNumber: { contains: search } },
        { policeStation: { contains: search } },
        { lastSeenLocationName: { contains: search } },
      ]
    }

    const alerts = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json({
      success: true,
      docs: alerts.docs,
      totalDocs: alerts.totalDocs,
      page: alerts.page,
      totalPages: alerts.totalPages,
    })
  } catch (error: any) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch alerts' }, { status: 500 })
  }
}

// POST /api/alerts - Create alert
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    const payload = await getPayload({ config })

    const formData = await req.formData()

    const category = formData.get('category') as string
    const title = formData.get('title') as string
    const obNumber = formData.get('obNumber') as string
    const policeStation = formData.get('policeStation') as string
    const socialMediaURL = formData.get('socialMediaURL') as string
    const locationName = (formData.get('locationName') as string) || ''
    const contactPhone = (formData.get('contactPhone') as string) || ''
    const description = (formData.get('description') as string) || ''
    const paymentOption = (formData.get('paymentOption') as string) || 'standard'
    const rawCoords = formData.get('coordinates') as string

    // Validate essential inputs
    if (!title || !obNumber || !policeStation || !socialMediaURL) {
      return NextResponse.json(
        { error: 'Title, Police OB Number, Police Station, and Social Media URL are required.' },
        { status: 400 }
      )
    }

    // Check duplicate OB number
    const existingOB = await payload.find({
      collection: 'alerts',
      where: {
        obNumber: { equals: obNumber.trim() },
      },
      limit: 1,
    })

    if (existingOB.docs.length > 0) {
      return NextResponse.json(
        { error: `An alert with Police OB Number "${obNumber}" has already been submitted.` },
        { status: 409 }
      )
    }

    // Handle photo file upload
    const photoFile = formData.get('photo') as File | null
    let photoId: string | null = null

    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Incident: ${title} (${obNumber})`,
          caption: `Submitted to CivilTrace. Reporting station: ${policeStation}`,
        },
        file: {
          data: buffer,
          mimetype: photoFile.type || 'image/jpeg',
          name: photoFile.name || `evidence-${Date.now()}.jpg`,
          size: buffer.length,
        },
      })
      photoId = mediaDoc.id as string
    }

    if (!photoId) {
      return NextResponse.json(
        { error: 'An evidence photo or missing person image is required.' },
        { status: 400 }
      )
    }

    // Geolocation coordinates: default to Nairobi [36.8219, -1.2921] if not provided
    let coordinates: [number, number] = [36.8219, -1.2921]
    if (rawCoords) {
      try {
        const parsed = JSON.parse(rawCoords)
        if (Array.isArray(parsed) && parsed.length === 2) {
          coordinates = [Number(parsed[0]), Number(parsed[1])]
        }
      } catch {
        // use default
      }
    }

    // AI & OpenGraph Verification Pipeline
    let ogData = { title: '', description: '', image: null as string | null, siteName: '' }
    try {
      ogData = await extractOGMetadata(socialMediaURL)
    } catch (err) {
      console.warn('OG extraction warning:', err)
    }

    // Multimodal AI Parity Check with Gemini
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const uploadedImageUrl = `${serverUrl}/media/${photoId}`
    const parityResult = await checkParity(
      uploadedImageUrl,
      `${title}. ${description}. Reported at ${policeStation}, OB ${obNumber}.`,
      ogData.image
    )

    // Category specifics
    let vehicleDetails = undefined
    let personDetails = undefined

    if (category === 'missing-person') {
      personDetails = {
        fullName: (formData.get('fullName') as string) || title,
        age: formData.get('age') ? Number(formData.get('age')) : undefined,
        gender: (formData.get('gender') as any) || 'other',
        height: (formData.get('height') as string) || '',
        clothingLastSeen: (formData.get('clothingLastSeen') as string) || '',
      }
    } else {
      vehicleDetails = {
        registrationNumber: (formData.get('registrationNumber') as string) || '',
        make: (formData.get('make') as string) || '',
        model: (formData.get('model') as string) || '',
        color: (formData.get('color') as string) || '',
        yearOfManufacture: formData.get('yearOfManufacture') ? Number(formData.get('yearOfManufacture')) : undefined,
      }
    }

    // Create draft Alert
    const newAlert = await payload.create({
      collection: 'alerts',
      data: {
        title: title.trim(),
        category: category as any,
        obNumber: obNumber.trim(),
        policeStation: policeStation.trim(),
        socialMediaURL: socialMediaURL.trim(),
        socialMediaValid: true,
        parityScore: parityResult.score,
        parityReasoning: parityResult.reasoning,
        description: textToLexical(description) as any,
        photo: photoId,
        lastSeenLocation: coordinates,
        lastSeenLocationName: locationName.trim(),
        lastSeenDate: new Date().toISOString(),
        alertRadius: 5000,
        contactPhone: contactPhone.trim(),
        submittedBy: user ? (user.id as any) : undefined,
        vehicleDetails,
        personDetails,
        isPaidBroadcast: paymentOption === 'mpesa-boost',
        _status: 'draft',
      },
    })

    // Push notification to Moderator Triage topic
    await notifyTopic(
      TOPICS.MODERATOR_TRIAGE,
      `New Alert Pending Triage: ${category.toUpperCase()}`,
      `OB ${obNumber} at ${policeStation}. AI Parity: ${parityResult.score}%`,
      {
        alertId: newAlert.id,
        category,
        obNumber,
        parityScore: String(parityResult.score),
      }
    )

    // Award civic points if user is authenticated
    if (user) {
      await awardCivicPoints({
        userId: user.id as string,
        action: 'alert-submitted',
        points: 100,
        description: `Submitted emergency alert: ${title} (OB: ${obNumber})`,
        relatedAlertId: newAlert.id,
      })
    }

    // Optional Paystack Broadcast Boost
    let paymentUrl: string | null = null
    if (paymentOption === 'mpesa-boost') {
      const paystackRes = await initializePaystackTransaction({
        email: user?.email || 'contributor@civiltrace.org',
        amount: 150,
        reference: `CT-BOOST-${newAlert.id}-${Date.now()}`,
        metadata: {
          alertId: newAlert.id,
          type: 'lost-property-broadcast',
          phoneNumber: contactPhone,
        },
      })
      paymentUrl = paystackRes?.authorization_url || null
    }

    return NextResponse.json(
      {
        success: true,
        alertId: newAlert.id,
        parityScore: parityResult.score,
        parityReasoning: parityResult.reasoning,
        paymentUrl,
        message: 'Alert submitted successfully and routed to moderator triage.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during alert creation.' },
      { status: 500 }
    )
  }
}
