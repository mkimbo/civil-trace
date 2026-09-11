import { headers } from 'next/headers'
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    const body = await request.text()

    if (secret) {
      const signature = (await headers()).get('x-paystack-signature')
      const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
      if (hash !== signature) {
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const payload = await getPayload({ config })

    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference

      const transactions = await payload.find({
        collection: 'transactions',
        where: {
          reference: {
            equals: reference,
          },
        },
        limit: 1,
      })

      if (transactions.docs.length > 0) {
        const tx = transactions.docs[0]
        await payload.update({
          collection: 'transactions',
          id: tx.id,
          data: {
            status: 'completed',
            paystackTransactionId: String(data.id || ''),
          },
        })

        if (tx.alert) {
          const alertId = typeof tx.alert === 'object' ? (tx.alert as any).id : tx.alert
          await payload.update({
            collection: 'alerts',
            id: alertId,
            data: {
              isPaidBroadcast: true,
              _status: 'published',
            },
          })
        }

        if (tx.user) {
          const userId = typeof tx.user === 'object' ? (tx.user as any).id : tx.user
          await payload.create({
            collection: 'civic-point-ledger',
            data: {
              user: userId,
              action: 'alert-submitted',
              points: 50,
              description: `M-PESA Broadcast payment completed (${reference})`,
            },
          })
        }
      }
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error: any) {
    console.error('Paystack webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
