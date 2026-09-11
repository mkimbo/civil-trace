import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'
import { ROLES } from '@/constants/roles'
import { awardCivicPoints } from '@/lib/points/award'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (!['verified', 'rejected', 'led-to-recovery'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid verification action. Must be "verified", "rejected", or "led-to-recovery".' },
        { status: 400 }
      )
    }

    const roles: string[] = (user as any).roles || []
    const isModerator =
      roles.includes(ROLES.MODERATOR) ||
      roles.includes(ROLES.SUPER_ADMIN) ||
      roles.includes(ROLES.WARDEN)

    const payload = await getPayload({ config })

    const sighting = await payload.findByID({
      collection: 'sightings',
      id,
      depth: 1,
    })

    if (!sighting) {
      return NextResponse.json({ error: 'Sighting record not found' }, { status: 404 })
    }

    // Check if user is moderator or alert owner
    const alertDoc: any = sighting.alert
    const isAlertOwner = alertDoc?.submittedBy === user.id || alertDoc?.submittedBy?.id === user.id

    if (!isModerator && !isAlertOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to verify this sighting' },
        { status: 403 }
      )
    }

    // Update sighting status
    await payload.update({
      collection: 'sightings',
      id,
      data: {
        verificationStatus: action as any,
        verifiedBy: user.id as any,
        verifiedAt: new Date().toISOString(),
      },
    })

    // Award bonus points to reporter
    const reporterId = typeof sighting.reporter === 'object' ? (sighting.reporter as any).id : sighting.reporter

    if (reporterId) {
      if (action === 'verified') {
        await awardCivicPoints({
          userId: reporterId,
          action: 'sighting-verified',
          points: 150,
          description: `Eyewitness sighting verified for alert ${alertDoc?.title || ''}`,
          relatedAlertId: alertDoc?.id,
        })
      } else if (action === 'led-to-recovery') {
        await awardCivicPoints({
          userId: reporterId,
          action: 'sighting-verified',
          points: 500,
          description: `Critical sighting led to safe recovery for alert ${alertDoc?.title || ''}`,
          relatedAlertId: alertDoc?.id,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sighting updated to status: ${action}`,
    })
  } catch (error: any) {
    console.error('Error verifying sighting:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update sighting' },
      { status: 500 }
    )
  }
}
