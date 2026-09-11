// Expose AsyncLocalStorage on globalThis before any Next.js or Payload internals are evaluated
import { AsyncLocalStorage } from 'node:async_hooks'

if (typeof (globalThis as any).AsyncLocalStorage !== 'function') {
  ;(globalThis as any).AsyncLocalStorage = AsyncLocalStorage
}

import 'dotenv/config'
import next from 'next'
import { createServer } from 'http'
import { parse } from 'url'
import cron from 'node-cron'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const start = async () => {
  // 1. Initialize Next.js FIRST (Prepares runtime environment and AsyncLocalStorage context)
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  await app.prepare()

  // 2. Initialize Payload Local API (Database Connection) AFTER Next.js is prepared
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })
  payload.logger.info('Success: CivilTrace Payload Initialized')

  // 3. One-time Bootstrap tasks (Police station directory check)
  const { seedDirectoryIfEmpty } = await import('@/cron/bootstrap/seedDirectoryIfEmpty')
  await seedDirectoryIfEmpty()

  // 4. START CRON SCHEDULER (VPS background jobs)
  if (!dev && !process.env.NEXT_MANUAL_SIG_HANDLE) {
    payload.logger.info('Loading: Starting CivilTrace VPS Cron Scheduler...')

    const { verifySocialLinks } = await import('@/cron/alerts/verifySocialLinks')
    const { processStaleTriage } = await import('@/cron/alerts/processStaleTriage')
    const { reconcilePaystackTransactions } = await import('@/cron/billing/reconcilePaystackTransactions')

    // Every hour - Verify active social links (ODPC Right to be Forgotten)
    cron.schedule('0 * * * *', () => {
      verifySocialLinks()
    })

    // Every 6 hours - Scan for unreviewed triage backlog & alert moderators
    cron.schedule('0 */6 * * *', () => {
      processStaleTriage()
    })

    // Every 30 minutes - Reconcile pending Paystack transactions
    cron.schedule('*/30 * * * *', () => {
      reconcilePaystackTransactions()
    })

    payload.logger.info('Success: CivilTrace Cron Scheduler Active (Social Links, Triage Queue, Paystack Reconciliation)')
  }

  // 5. Start the HTTP Server
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error('Fatal Server Error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      payload.logger.info(`Success: CivilTrace ready on http://${hostname}:${port}`)
    })
}

start()
