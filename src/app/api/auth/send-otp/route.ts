import { cookies } from 'next/headers'
import { sendSMS } from '@/lib/sms/adapter'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber || phoneNumber.length < 9) {
      return Response.json({ success: false, error: 'Please enter a valid phone number' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Send SMS via Africa's Talking or dev mock
    const smsResult = await sendSMS(
      phoneNumber,
      `Your CivilTrace verification code is ${code}. Never share this code with anyone.`
    )

    if (!smsResult.success) {
      return Response.json({ success: false, error: smsResult.error || 'Failed to dispatch SMS code' }, { status: 500 })
    }

    // Store in cookie for verification (expires in 10 minutes)
    const cookieStore = await cookies()
    const otpPayload = Buffer.from(JSON.stringify({ phone: phoneNumber, code, exp: Date.now() + 10 * 60 * 1000 })).toString('base64')

    cookieStore.set('pending-otp', otpPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60,
    })

    return Response.json({ success: true, message: 'Verification code sent via SMS' })
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}