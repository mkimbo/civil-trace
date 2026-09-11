import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders, cookies } from 'next/headers'
import { jwtVerify } from 'jose'

/**
 * Server-only function for getting the authenticated user.
 * Wrapped in React.cache to de-duplicate calls within a single request.
 */
export const getAuthenticatedUser = cache(async () => {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()

    // 1. Try native payload.auth({ headers })
    try {
      const { user } = await payload.auth({ headers })
      if (user) return user
    } catch {
      // fallback to token extraction
    }

    // 2. Direct cookie fallback
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (!token) return null

    const secretKey = new TextEncoder().encode(payload.secret)
    const { payload: decoded } = await jwtVerify(token, secretKey)
    if (!decoded?.id || !decoded?.collection) return null

    const user = await payload.findByID({
      collection: decoded.collection as any,
      id: decoded.id as string,
      depth: 0,
    })

    return user || null
  } catch (error) {
    return null
  }
})
