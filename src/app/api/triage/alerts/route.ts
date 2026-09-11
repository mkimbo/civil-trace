import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAuthUser } from '@/lib/auth/session'
import { ROLES } from '@/constants/roles'

export const dynamic = 'force-dynamic'

// GET /api/triage/alerts - Fetch drafts pending moderator triage
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const payload = await getPayload({ config })

    const where: any = {
      _status: { equals: 'draft' },
    }

    if (category) {
      where.category = { equals: category }
    }

    const drafts = await payload.find({
      collection: 'alerts',
      where,
      depth: 1,
      limit: 50,
      sort: '-createdAt',
    })

    return NextResponse.json({
      success: true,
      docs: drafts.docs,
      totalDocs: drafts.totalDocs,
    })
  } catch (error: any) {
    console.error('Error in /api/triage/alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch triage alerts' },
      { status: 500 }
    )
  }
}
