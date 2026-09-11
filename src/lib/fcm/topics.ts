import { admin } from '../firebase/admin'

export const TOPICS = {
  MODERATOR_TRIAGE: 'moderator-triage',
  EMERGENCY_BROADCAST: 'emergency-broadcast',
} as const

export async function notifyTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!admin.apps.length) return
  try {
    await admin.messaging().send({
      topic,
      notification: { title, body },
      data: data || {},
    })
  } catch (err) {
    console.error(`Failed to send notification to topic ${topic}:`, err)
  }
}
