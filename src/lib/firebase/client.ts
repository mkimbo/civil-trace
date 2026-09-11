import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyFakeKeyForPrerenderSafeBuild12345',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'civiltrace-ke.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'civiltrace-ke',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'civiltrace-ke.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
}

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null
  try {
    if (!firebaseApp) {
      firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    }
    if (!auth && firebaseApp) {
      auth = getAuth(firebaseApp)
    }
    return auth
  } catch (e) {
    console.warn('Firebase client auth initialization skipped:', e)
    return null
  }
}

export const facebookProvider = new FacebookAuthProvider()
export const twitterProvider = new TwitterAuthProvider()
export const googleProvider = new GoogleAuthProvider()

export { signInWithPopup }