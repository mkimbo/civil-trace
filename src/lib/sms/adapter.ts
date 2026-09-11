interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  const apiKey = process.env.AT_API_KEY
  const username = process.env.AT_USERNAME || 'sandbox'
  const senderId = process.env.AT_SENDER_ID

  if (!apiKey) {
    console.log(`[SMS DEV MOCK] To: ${to} | Message: ${message}`)
    return { success: true, messageId: `mock-${Date.now()}` }
  }

  try {
    const isSandbox = username === 'sandbox'
    const endpoint = isSandbox
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging'

    const body = new URLSearchParams()
    body.append('username', username)
    body.append('to', to)
    body.append('message', message)
    if (senderId) body.append('from', senderId)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'ApiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    })

    const data = await res.json()
    const recipients = data?.SMSMessageData?.Recipients
    if (recipients && recipients.length > 0) {
      return { success: true, messageId: recipients[0].messageId }
    }

    return { success: false, error: data?.SMSMessageData?.Message || 'SMS send failed' }
  } catch (err: any) {
    console.error('SMS Send Error:', err)
    return { success: false, error: err.message || 'Failed to send SMS' }
  }
}