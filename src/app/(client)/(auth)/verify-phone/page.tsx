'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

export default function VerifyPhonePage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to dispatch code')
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Could not send verification SMS.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, phoneNumber: phone }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Invalid code')
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground p-4 sm:p-6">
      <div className="flex items-center justify-between max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span>CivilTrace</span>
        </Link>
        <ThemeSwitcher />
      </div>

      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm my-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Phone className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">
            Verify Your Phone Number
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Phone verification confirms your identity, helps prevent false reports, and enables verified incident submissions.
          </p>
        </div>



        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
            <p className="font-bold text-base text-foreground">Phone Verified!</p>
            <p className="text-xs text-muted-foreground">Redirecting to citizen dashboard...</p>
          </div>
        ) : step === 'phone' ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Kenyan Phone Number
              </label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="rounded-2xl pl-10 bg-background"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-bold py-5 shadow-sm hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Verification SMS'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                6-Digit SMS Code
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1.5 rounded-2xl text-center text-xl font-mono tracking-widest bg-background"
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Code dispatched to <strong>{phone}</strong>
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-bold py-5 shadow-sm hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Phone Number'}
            </Button>
          </form>
        )}

        {/* SKIPPABLE BUTTON */}
        <div className="border-t border-border pt-4 text-center">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground">
              Skip for now & continue to Dashboard →
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground py-2">
        <Link href="/" className="hover:underline">← Back to Home</Link>
      </div>
    </div>
  )
}