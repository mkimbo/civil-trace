import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const ledger = await payload.find({
      collection: 'civic-point-ledger',
      where: {
        user: { equals: user.id },
      },
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })

    const balance = (user as any).civicPointsBalance || 0

    // Compute trust level
    let rank = 'Citizen Contributor'
    let nextMilestone = 250
    if (balance >= 1000) {
      rank = 'Senior Community Warden'
      nextMilestone = 2500
    } else if (balance >= 500) {
      rank = 'Verified Community Warden'
      nextMilestone = 1000
    } else if (balance >= 250) {
      rank = 'Active Standby Contributor'
      nextMilestone = 500
    }

    return NextResponse.json({
      success: true,
      balance,
      rank,
      nextMilestone,
      history: ledger.docs,
      totalTransactions: ledger.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching points:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch points' },
      { status: 500 }
    )
  }
}
