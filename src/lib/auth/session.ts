import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jwtVerify } from 'jose'

export async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) return null

    const payload = await getPayload({ config })
    const secretKey = new TextEncoder().encode(payload.secret)

    const { payload: decoded } = await jwtVerify(token, secretKey)
    if (!decoded?.id || !decoded?.collection) return null

    const user = await payload.findByID({
      collection: decoded.collection as any,
      id: decoded.id as string,
      depth: 0,
    })

    return user || null
  } catch {
    return null
  }
}
