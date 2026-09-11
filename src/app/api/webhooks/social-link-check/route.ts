import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
      }
    }

    const payload = await getPayload({ config })

    const activeAlerts = await payload.find({
      collection: 'alerts',
      where: {
        _status: {
          equals: 'published',
        },
        socialMediaValid: {
          equals: true,
        },
      },
      limit: 100,
    })

    const results = []

    for (const alert of activeAlerts.docs) {
      if (!alert.socialMediaURL) continue

      try {
        const headRes = await fetch(alert.socialMediaURL, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'CivilTraceBot/1.0 (+https://civiltrace.org)',
          },
        })

        if (headRes.status === 404 || headRes.status === 410) {
          // Post deleted or removed on social media - mark invalid and unpublish (ODPC Compliance)
          await payload.update({
            collection: 'alerts',
            id: alert.id,
            data: {
              socialMediaValid: false,
              _status: 'draft',
            },
          })

          await payload.create({
            collection: 'audit-logs',
            data: {
              action: 'social_link_auto_deletion',
              entity: 'alerts',
              entityId: alert.id,
              details: { url: alert.socialMediaURL, status: headRes.status },
            },
          })

          results.push({ id: alert.id, status: 'unregistered', code: headRes.status })
        } else {
          results.push({ id: alert.id, status: 'active', code: headRes.status })
        }
      } catch (err: any) {
        results.push({ id: alert.id, status: 'check_error', error: err.message })
      }
    }

    return Response.json({ success: true, processed: results.length, details: results })
  } catch (error: any) {
    console.error('Social link check cron error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
