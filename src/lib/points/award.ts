import { getPayload } from 'payload'
import config from '@payload-config'

export interface AwardPointsParams {
  userId: string
  action:
    | 'alert-submitted'
    | 'sighting-verified'
    | 'poster-uploaded'
    | 'directory-verified'
    | 'alert-shared'
    | 'active-standby'
    | 'points-redeemed'
    | 'warden-promotion'
  points: number
  description: string
  relatedAlertId?: string
}

export async function awardCivicPoints(params: AwardPointsParams) {
  try {
    const payload = await getPayload({ config })

    // Create immutable ledger entry
    await payload.create({
      collection: 'civic-point-ledger',
      data: {
        user: params.userId,
        action: params.action,
        points: params.points,
        description: params.description,
        ...(params.relatedAlertId ? { relatedAlert: params.relatedAlertId } : {}),
      },
    })

    // Retrieve user and update civicPointsBalance
    const user = await payload.findByID({
      collection: 'users',
      id: params.userId,
      depth: 0,
    })

    if (user) {
      const currentBalance = (user as any).civicPointsBalance || 0
      const newBalance = Math.max(0, currentBalance + params.points)

      await payload.update({
        collection: 'users',
        id: params.userId,
        data: {
          civicPointsBalance: newBalance,
        },
      })
    }
  } catch (error) {
    console.error('Failed to award civic points:', error)
  }
}
