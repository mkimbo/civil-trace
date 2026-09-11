import { admin } from './admin'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ROLES } from '@/constants/roles'

export async function verifyAndSyncFirebaseUser(idToken: string) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin is not configured')
  }

  const decodedToken = await admin.auth().verifyIdToken(idToken)
  const { uid, email, phone_number, name } = decodedToken

  const payload = await getPayload({ config })

  // Find user by firebaseUID
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      firebaseUID: {
        equals: uid,
      },
    },
    limit: 1,
  })

  if (existingUsers.docs.length > 0) {
    return existingUsers.docs[0]
  }

  // If email exists, link or create
  if (email) {
    const emailUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (emailUsers.docs.length > 0) {
      const user = emailUsers.docs[0]
      const updated = await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          firebaseUID: uid,
          ...(phone_number && !user.phoneNumber ? { phoneNumber: phone_number } : {}),
        },
      })
      return updated
    }
  }

  // Create new user
  const newUser = await payload.create({
    collection: 'users',
    data: {
      email: email || `${uid}@civiltrace.internal`,
      firebaseUID: uid,
      name: name || 'Citizen Reporter',
      phoneNumber: phone_number || '',
      phoneVerified: Boolean(phone_number),
      roles: [ROLES.USER],
      civicPointsBalance: 50, // Welcome points
    },
  })

  return newUser
}
