import { getPayload } from 'payload'
import config from '@payload-config'
import * as Sentry from '@sentry/nextjs'
import { withSafeAction } from '@/lib/safe-action'
import { sendGeoRadiusPush } from '@/lib/fcm/push'
import { revalidateTag, revalidatePath } from 'next/cache'
import { subMinutes } from 'date-fns'

const runReconcilePaystackTransactions = async () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return

  const payload = await getPayload({ config })

  try {
    const fifteenMinutesAgo = subMinutes(new Date(), 15)

    const pendingTxns = await payload.find({
      collection: 'transactions',
      where: {
        status: { equals: 'pending' },
        createdAt: { less_than: fifteenMinutesAgo.toISOString() },
      },
      limit: 20,
    })

    if (pendingTxns.docs.length === 0) return

    payload.logger.info(`[CRON] Reconciling ${pendingTxns.docs.length} pending Paystack transactions...`)

    for (const txn of pendingTxns.docs) {
      if (!txn.reference) continue

      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(txn.reference)}`,
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
            },
          }
        )

        if (!verifyRes.ok) continue
        const body = await verifyRes.json()

        if (body?.data?.status === 'success') {
          await payload.update({
            collection: 'transactions',
            id: txn.id,
            data: {
              status: 'completed',
              paystackTransactionId: String(body.data.id || ''),
              metadata: {
                ...(typeof txn.metadata === 'object' ? txn.metadata : {}),
                reconciledByCron: true,
                reconciledAt: new Date().toISOString(),
                paystackData: body.data,
              },
            },
          })

          const alertId = typeof txn.alert === 'object' ? (txn.alert as any)?.id : txn.alert
          if (alertId) {
            const alertDoc = await payload.findByID({
              collection: 'alerts',
              id: alertId,
              depth: 0,
            })

            if (alertDoc) {
              await payload.update({
                collection: 'alerts',
                id: alertId,
                data: {
                  isPaidBroadcast: true,
                },
              })

              const coords = alertDoc.lastSeenLocation as [number, number] | undefined
              if (coords && Array.isArray(coords) && coords.length === 2) {
                try {
                  await sendGeoRadiusPush(
                    alertDoc.id,
                    `🚨 HIGH-PRIORITY BROADCAST: ${alertDoc.title}`,
                    `Police OB: ${alertDoc.obNumber} (${alertDoc.policeStation}). Last seen near ${alertDoc.lastSeenLocationName || 'Kenya'}.`,
                    coords,
                    10000
                  )
                } catch (pushErr) {
                  payload.logger.error(pushErr as any, 'Failed geo push during cron reconciliation')
                }
              }
            }
          }

          try {
            revalidateTag('alerts')
            revalidateTag('live-alerts')
            revalidatePath('/map')
          } catch {
            // Outside request context
          }
          payload.logger.info(`[CRON] Successfully reconciled transaction ${txn.reference}`)
        } else if (body?.data?.status === 'failed' || body?.data?.status === 'abandoned') {
          await payload.update({
            collection: 'transactions',
            id: txn.id,
            data: {
              status: 'failed',
            },
          })
        }
      } catch (err: any) {
        payload.logger.warn(`[CRON] Paystack check failed for reference ${txn.reference}: ${err.message}`)
      }
    }
  } catch (error) {
    payload.logger.error(error as any, '❌ [CRON] Error in reconcilePaystackTransactions')
    Sentry.captureException(error)
    throw error
  }
}

export const reconcilePaystackTransactions = withSafeAction(runReconcilePaystackTransactions, {
  contextName: 'Cron: Reconcile Paystack Transactions',
  fallbackValue: undefined,
})
