export interface InitializePaystackParams {
  email: string
  amount: number // in KES
  reference: string
  metadata?: Record<string, any>
  callback_url?: string
}

export async function initializePaystackTransaction(params: InitializePaystackParams) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.warn('PAYSTACK_SECRET_KEY is not set. Returning mock payment URL.')
    return {
      authorization_url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/dashboard/payments/mock?ref=${params.reference}`,
      access_code: `mock-access-${params.reference}`,
      reference: params.reference,
    }
  }

  const amountMinor = Math.round(params.amount * 100)

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountMinor,
      currency: 'KES',
      reference: params.reference,
      channels: ['mobile_money', 'card'],
      metadata: params.metadata || {},
      callback_url:
        params.callback_url ||
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/dashboard/payments/callback`,
    }),
  })

  const data = await response.json()
  if (!data.status) {
    throw new Error(data.message || 'Failed to initialize Paystack payment')
  }

  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code,
    reference: data.data.reference,
  }
}
