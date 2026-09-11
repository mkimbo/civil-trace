import { getPayload } from 'payload'
import config from '@payload-config'
import * as Sentry from '@sentry/nextjs'
import { withSafeAction } from '@/lib/safe-action'
import { revalidateTag, revalidatePath } from 'next/cache'

const runVerifySocialLinks = async () => {
  const payload = await getPayload({ config })
  payload.logger.info('[CRON] Starting social link parity verification...')

  try {
    const activeAlerts = await payload.find({
      collection: 'alerts',
      where: {
        _status: { equals: 'published' },
        socialMediaValid: { equals: true },
      },
      limit: 100,
    })

    if (activeAlerts.docs.length === 0) {
      payload.logger.info('[CRON] No active published alerts to verify.')
      return
    }

    let unverifiedCount = 0

    for (const alert of activeAlerts.docs) {
      if (!alert.socialMediaURL) continue

      try {
        const headRes = await fetch(alert.socialMediaURL, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'CivilTraceBot/1.0 (+https://civiltrace.org)',
          },
        })

        // Post deleted or removed on social media - mark invalid and unpublish (ODPC Compliance)
        if (headRes.status === 404 || headRes.status === 410) {
          await payload.update({
            collection: 'alerts',
            id: alert.id,
            data: {
              socialMediaValid: false,
              _status: 'draft',
              parityReasoning: `${alert.parityReasoning || ''}\n[CRON]: Source social media post removed (${headRes.status}). Unpublished for ODPC compliance.`,
            },
          })

          await payload.create({
            collection: 'audit-logs',
            data: {
              action: 'social_link_auto_deletion',
              entity: 'alerts',
              entityId: alert.id,
              details: {
                url: alert.socialMediaURL,
                status: headRes.status,
                reason: 'Source post removed or deleted (ODPC Right to be Forgotten)',
              },
            },
          })

          unverifiedCount++
        }
      } catch (err: any) {
        payload.logger.warn(`[CRON] Could not reach social link for alert ${alert.id}: ${err.message}`)
      }
    }

    if (unverifiedCount > 0) {
      try {
        revalidateTag('alerts')
        revalidateTag('live-alerts')
        revalidatePath('/map')
        revalidatePath('/dashboard/alerts')
      } catch {
        // Safe fallback outside request lifecycle
      }
      payload.logger.info(`[CRON] Unpublished ${unverifiedCount} alerts due to deleted social posts.`)
    } else {
      payload.logger.info(`[CRON] Verified ${activeAlerts.docs.length} active alert social links. All intact.`)
    }
  } catch (error) {
    payload.logger.error(error as any, '❌ [CRON] Critical error in verifySocialLinks')
    Sentry.captureException(error)
    throw error
  }
}

export const verifySocialLinks = withSafeAction(runVerifySocialLinks, {
  contextName: 'Cron: Verify Social Media Links',
  fallbackValue: undefined,
})
