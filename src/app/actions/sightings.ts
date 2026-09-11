'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthenticatedUser } from '@/utilities/getAuthenticatedUser'
import { awardCivicPoints } from '@/lib/points/award'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'
import { ROLES } from '@/constants/roles'

export async function reportSightingAction(formData: FormData) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'Authentication required. Please sign in.' }
    }

    const alertId = formData.get('alertId') as string
    const description = (formData.get('description') as string) || ''
    const locationName = (formData.get('locationName') as string) || ''
    const rawCoords = formData.get('coordinates') as string
    const photoFile = formData.get('photo') as File | null

    if (!alertId || !description) {
      return { success: false, error: 'Alert reference and description are required.' }
    }

    const payload = await getPayload({ config })

    const alert = await payload.findByID({
      collection: 'alerts',
      id: alertId,
      depth: 0,
    })

    if (!alert) {
      return { success: false, error: 'Referenced emergency alert not found.' }
    }

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
        // default
      }
    }

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

    await awardCivicPoints({
      userId: user.id as string,
      action: 'alert-shared',
      points: 50,
      description: `Submitted field sighting for alert "${alert.title}"`,
      relatedAlertId: alert.id,
    })

    await notifyTopic(
      TOPICS.MODERATOR_TRIAGE,
      'New Eyewitness Sighting Reported',
      `Field report at ${locationName || 'Kenya'} for OB ${alert.obNumber}.`,
      { alertId: alert.id, sightingId: newSighting.id }
    )

    revalidateTag('sightings')
    revalidatePath('/dashboard/sightings')

    return { success: true, sightingId: newSighting.id }
  } catch (error: any) {
    console.error('[reportSightingAction] Error:', error)
    return { success: false, error: error.message || 'Failed to submit sighting' }
  }
}

export async function verifySightingAction(sightingId: string, action: 'verified' | 'rejected' | 'led-to-recovery') {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const roles: string[] = (user as any).roles || []
    const isModerator =
      roles.includes(ROLES.MODERATOR) ||
      roles.includes(ROLES.SUPER_ADMIN) ||
      roles.includes(ROLES.WARDEN)

    const payload = await getPayload({ config })
    const sighting = await payload.findByID({
      collection: 'sightings',
      id: sightingId,
      depth: 1,
    })

    if (!sighting) return { success: false, error: 'Sighting not found' }

    const alertDoc: any = sighting.alert
    const isAlertOwner = alertDoc?.submittedBy === user.id || alertDoc?.submittedBy?.id === user.id

    if (!isModerator && !isAlertOwner) {
      return { success: false, error: 'Unauthorized to verify this sighting' }
    }

    await payload.update({
      collection: 'sightings',
      id: sightingId,
      data: {
        verificationStatus: action as any,
        verifiedBy: user.id as any,
        verifiedAt: new Date().toISOString(),
      },
    })

    const reporterId = typeof sighting.reporter === 'object' ? (sighting.reporter as any).id : sighting.reporter
    if (reporterId) {
      if (action === 'verified') {
        await awardCivicPoints({
          userId: reporterId,
          action: 'sighting-verified',
          points: 150,
          description: `Sighting verified for ${alertDoc?.title || ''}`,
          relatedAlertId: alertDoc?.id,
        })
      } else if (action === 'led-to-recovery') {
        await awardCivicPoints({
          userId: reporterId,
          action: 'sighting-verified',
          points: 500,
          description: `Critical sighting led to safe recovery (${alertDoc?.title || ''})`,
          relatedAlertId: alertDoc?.id,
        })
      }
    }

    revalidateTag('sightings')
    revalidatePath('/dashboard/sightings')

    return { success: true }
  } catch (error: any) {
    console.error('[verifySightingAction] Error:', error)
    return { success: false, error: error.message || 'Failed to verify sighting' }
  }
}
