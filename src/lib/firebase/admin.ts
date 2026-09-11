import admin from 'firebase-admin'

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GCS_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GCS_CLIENT_EMAIL
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCS_PROJECT_ID

  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      })
    } catch (error) {
      console.error('Firebase Admin Initialization Failed:', error)
    }
  }
}

export { admin }
