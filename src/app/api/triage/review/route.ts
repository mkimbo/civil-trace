import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'
import { ROLES } from '@/constants/roles'
import { sendGeoRadiusPush } from '@/lib/fcm/push'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'
import { awardCivicPoints } from '@/lib/points/award'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const roles: string[] = (user as any).roles || []
    const isAuthorized =
      roles.includes(ROLES.MODERATOR) ||
      roles.includes(ROLES.SUPER_ADMIN) ||
      roles.includes(ROLES.WARDEN)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. Moderator clearance required.' }, { status: 403 })
    }

    const body = await req.json()
    const { alertId, action, notes } = body

    if (!alertId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid alertId and action ("approve" | "reject") are required.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    const alert = await payload.findByID({
      collection: 'alerts',
      id: alertId,
      depth: 1,
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Transition to published
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

      // Send emergency FCM Geo Radius broadcast
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
          console.error('Geo push notification error:', pushErr)
        }
      }

      // Send topic push to emergency broadcast subscribers
      await notifyTopic(
        TOPICS.EMERGENCY_BROADCAST,
        `EMERGENCY ALERT: ${alert.title}`,
        `OB: ${alert.obNumber} - ${alert.policeStation}. Last seen: ${alert.lastSeenLocationName || 'Kenya'}.`,
        {
          alertId: alert.id,
          category: alert.category,
          obNumber: alert.obNumber,
        }
      )

      // Record in audit logs
      await payload.create({
        collection: 'audit-logs',
        data: {
          action: 'ALERT_VERIFIED_AND_PUBLISHED',
          performedBy: user.id as any,
          entity: 'alerts',
          entityId: alert.id,
          details: {
            obNumber: alert.obNumber,
            category: alert.category,
            notes: notes || 'Verified authentic OB record',
          },
        },
      })

      // Award civic points to moderator
      await awardCivicPoints({
        userId: user.id as string,
        action: 'active-standby',
        points: 50,
        description: `Verified and published alert ${alert.obNumber}`,
        relatedAlertId: alert.id,
      })

      return NextResponse.json({
        success: true,
        message: `Alert ${alert.obNumber} has been approved and published to the public network.`,
      })
    } else {
      // Rejection
      await payload.update({
        collection: 'alerts',
        id: alertId,
        data: {
          parityReasoning: `${alert.parityReasoning || ''}\n[Moderator Rejected]: ${notes || 'Verification failed (invalid OB or unverified incident)'}`,
        },
      })

      // Record in audit logs
      await payload.create({
        collection: 'audit-logs',
        data: {
          action: 'ALERT_REJECTED_IN_TRIAGE',
          performedBy: user.id as any,
          entity: 'alerts',
          entityId: alert.id,
          details: {
            obNumber: alert.obNumber,
            reason: notes || 'Unverified OB or fraudulent report',
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Alert ${alert.obNumber} was rejected from publication.`,
      })
    }
  } catch (error: any) {
    console.error('Error reviewing alert:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to review alert' },
      { status: 500 }
    )
  }
}
