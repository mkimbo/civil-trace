import { getPayload } from 'payload'
import config from '@payload-config'
import * as Sentry from '@sentry/nextjs'
import { withSafeAction } from '@/lib/safe-action'
import { notifyTopic, TOPICS } from '@/lib/fcm/topics'
import { subHours } from 'date-fns'

const runProcessStaleTriage = async () => {
  const payload = await getPayload({ config })
  payload.logger.info('[CRON] Scanning for stale unreviewed triage alerts...')

  try {
    const twoDaysAgo = subHours(new Date(), 48)

    const staleAlerts = await payload.find({
      collection: 'alerts',
      where: {
        _status: { equals: 'draft' },
        createdAt: { less_than: twoDaysAgo.toISOString() },
      },
      limit: 50,
    })

    if (staleAlerts.docs.length === 0) {
      return
    }

    payload.logger.warn(`[CRON] Found ${staleAlerts.docs.length} stale unreviewed triage alerts.`)

    await notifyTopic(
      TOPICS.MODERATOR_TRIAGE,
      'Attention: Pending Triage Queue Backlog',
      `There are ${staleAlerts.docs.length} unreviewed reports awaiting verification over 48 hours.`,
      { staleCount: String(staleAlerts.docs.length) }
    )
  } catch (error) {
    payload.logger.error(error as any, '❌ [CRON] Error in processStaleTriage')
    Sentry.captureException(error)
    throw error
  }
}

export const processStaleTriage = withSafeAction(runProcessStaleTriage, {
  contextName: 'Cron: Process Stale Triage Alerts',
  fallbackValue: undefined,
})
