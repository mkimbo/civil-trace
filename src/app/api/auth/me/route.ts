import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jwtVerify } from 'jose'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return Response.json({ authenticated: false, user: null })
    }

    const payload = await getPayload({ config })
    const secretKey = new TextEncoder().encode(payload.secret)

    try {
      const { payload: decoded } = await jwtVerify(token, secretKey)
      if (!decoded?.id || !decoded?.collection) {
        return Response.json({ authenticated: false, user: null })
      }

      const user = await payload.findByID({
        collection: decoded.collection as any,
        id: decoded.id as string,
        depth: 0,
      })

      if (!user) {
        return Response.json({ authenticated: false, user: null })
      }

      return Response.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: (user as any).phoneNumber,
          phoneVerified: Boolean((user as any).phoneVerified),
          roles: (user as any).roles,
          civicPointsBalance: (user as any).civicPointsBalance || 0,
        },
      })
    } catch {
      return Response.json({ authenticated: false, user: null })
    }
  } catch (error: any) {
    console.error('API /auth/me Error:', error)
    return Response.json({ authenticated: false, error: error.message }, { status: 500 })
  }
}
