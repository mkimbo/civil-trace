'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthenticatedUser } from '@/utilities/getAuthenticatedUser'
import { extractOGMetadata } from '@/lib/og-metadata/extract'
import { checkParity } from '@/lib/ai-parity/check'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'
import { sendGeoRadiusPush } from '@/lib/fcm/push'
import { awardCivicPoints } from '@/lib/points/award'
import { textToLexical } from '@/lib/lexical/convert'
import { initializePaystackTransaction } from '@/lib/paystack/initialize'
import { ROLES } from '@/constants/roles'

export async function createAlertAction(formData: FormData) {
  try {
    const user = await getAuthenticatedUser()
    const payload = await getPayload({ config })

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

    if (!title || !obNumber || !policeStation || !socialMediaURL) {
      return { success: false, error: 'Title, Police OB Number, Police Station, and Social Media URL are required.' }
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
      return { success: false, error: `An alert with Police OB Number "${obNumber}" has already been registered.` }
    }

    // Photo upload to media collection
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
      return { success: false, error: 'An evidence photo or portrait is required.' }
    }

    let coordinates: [number, number] = [36.8219, -1.2921]
    if (rawCoords) {
      try {
        const parsed = JSON.parse(rawCoords)
        if (Array.isArray(parsed) && parsed.length === 2) {
          coordinates = [Number(parsed[0]), Number(parsed[1])]
        }
      } catch {
        // default
      }
    }

    let ogData = { title: '', description: '', image: null as string | null, siteName: '' }
    try {
      ogData = await extractOGMetadata(socialMediaURL)
    } catch (err) {
      console.warn('OG extraction error:', err)
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const uploadedImageUrl = `${serverUrl}/media/${photoId}`
    const parityResult = await checkParity(
      uploadedImageUrl,
      `${title}. ${description}. Reported at ${policeStation}, OB ${obNumber}.`,
      ogData.image
    )

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

    if (user) {
      await awardCivicPoints({
        userId: user.id as string,
        action: 'alert-submitted',
        points: 100,
        description: `Submitted emergency alert: ${title} (OB: ${obNumber})`,
        relatedAlertId: newAlert.id,
      })
    }

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

    revalidateTag('alerts')
    revalidateTag('triage-alerts')
    revalidatePath('/dashboard/alerts')
    revalidatePath('/dashboard/triage')
    revalidatePath('/map')

    return {
      success: true,
      alertId: newAlert.id,
      parityScore: parityResult.score,
      parityReasoning: parityResult.reasoning,
      paymentUrl,
    }
  } catch (error: any) {
    console.error('[createAlertAction] Error:', error)
    return { success: false, error: error.message || 'Failed to submit alert' }
  }
}

export async function reviewAlertAction(alertId: string, action: 'approve' | 'reject', notes?: string) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const roles: string[] = (user as any).roles || []
    const isAuthorized =
      roles.includes(ROLES.MODERATOR) ||
      roles.includes(ROLES.SUPER_ADMIN) ||
      roles.includes(ROLES.WARDEN)

    if (!isAuthorized) return { success: false, error: 'Forbidden. Moderator clearance required.' }

    const payload = await getPayload({ config })
    const alert = await payload.findByID({
      collection: 'alerts',
      id: alertId,
      depth: 1,
    })

    if (!alert) return { success: false, error: 'Alert not found' }

    if (action === 'approve') {
      await payload.update({
        collection: 'alerts',
        id: alertId,
        data: {
          _status: 'published',
          parityReasoning: notes
            ? `${alert.parityReasoning || ''}\n[Moderator Verified]: ${notes}`
            : alert.parityReasoning,
        },
      })

      const coords = alert.lastSeenLocation as [number, number] | undefined
      if (coords && Array.isArray(coords) && coords.length === 2) {
        try {
          await sendGeoRadiusPush(
            alert.id,
            `URGENT ALERT: ${alert.title}`,
            `Police OB: ${alert.obNumber} (${alert.policeStation}). Last seen near ${alert.lastSeenLocationName || 'Kenya'}.`,
            coords,
            alert.alertRadius || 5000
          )
        } catch (pushErr) {
          console.error('Geo push error:', pushErr)
        }
      }

      await notifyTopic(
        TOPICS.EMERGENCY_BROADCAST,
        `EMERGENCY ALERT: ${alert.title}`,
        `OB: ${alert.obNumber} - ${alert.policeStation}.`,
        { alertId: alert.id, category: alert.category, obNumber: alert.obNumber }
      )

      await payload.create({
        collection: 'audit-logs',
        data: {
          action: 'ALERT_VERIFIED_AND_PUBLISHED',
          performedBy: user.id as any,
          entity: 'alerts',
          entityId: alert.id,
          details: { obNumber: alert.obNumber, notes: notes || 'Verified authentic' },
        },
      })

      await awardCivicPoints({
        userId: user.id as string,
        action: 'active-standby',
        points: 50,
        description: `Verified and published alert ${alert.obNumber}`,
        relatedAlertId: alert.id,
      })
    } else {
      await payload.update({
        collection: 'alerts',
        id: alertId,
        data: {
          parityReasoning: `${alert.parityReasoning || ''}\n[Moderator Rejected]: ${notes || 'Verification failed'}`,
        },
      })

      await payload.create({
        collection: 'audit-logs',
        data: {
          action: 'ALERT_REJECTED_IN_TRIAGE',
          performedBy: user.id as any,
          entity: 'alerts',
          entityId: alert.id,
          details: { obNumber: alert.obNumber, reason: notes || 'Rejected' },
        },
      })
    }

    revalidateTag('alerts')
    revalidateTag('live-alerts')
    revalidateTag('triage-alerts')
    revalidatePath('/dashboard/triage')
    revalidatePath('/dashboard/alerts')
    revalidatePath('/map')

    return { success: true, message: action === 'approve' ? 'Alert published' : 'Alert rejected' }
  } catch (error: any) {
    console.error('[reviewAlertAction] Error:', error)
    return { success: false, error: error.message || 'Failed to review alert' }
  }
}
