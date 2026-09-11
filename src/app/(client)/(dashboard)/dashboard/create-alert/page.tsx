'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import {
  FilePlus,
  ShieldAlert,
  MapPin,
  Car,
  Bike,
  User,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Phone,
  Link2,
  Upload,
  X,
  Navigation,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhoneVerificationModal } from '@/components/auth/PhoneVerificationModal'
import { PoliceStationSelect } from '@/components/directory/PoliceStationSelect'
import { createAlertAction } from '@/app/actions/alerts'
import { useUser } from '@/hooks/useUser'

export default function CreateAlertPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()

  const [category, setCategory] = useState<'missing-person' | 'lost-vehicle' | 'lost-motorbike'>('missing-person')
  const [title, setTitle] = useState('')
  const [obNumber, setObNumber] = useState('')
  const [policeStation, setPoliceStation] = useState('')
  const [socialMediaURL, setSocialMediaURL] = useState('')
  const [locationName, setLocationName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [description, setDescription] = useState('')
  const [coordinates, setCoordinates] = useState<[number, number]>([36.8219, -1.2921])
  const [locationDetecting, setLocationDetecting] = useState(false)

  // Category specifics
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [height, setHeight] = useState('')
  const [clothingLastSeen, setClothingLastSeen] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [yearOfManufacture, setYearOfManufacture] = useState('')

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Payment option
  const [paymentOption, setPaymentOption] = useState<'standard' | 'mpesa-boost'>('standard')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionProgress, setSubmissionProgress] = useState('')
  const [submissionResult, setSubmissionResult] = useState<{
    alertId?: string
    parityScore?: number
    parityReasoning?: string
    paymentUrl?: string | null
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Phone verification gating for critical action
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  useEffect(() => {
    if (user?.phoneVerified || localStorage.getItem('civiltrace_phone_verified') === 'true') {
      setIsPhoneVerified(true)
    }
    if (user?.phoneNumber && !contactPhone) {
      setContactPhone(user.phoneNumber)
    }
  }, [user, contactPhone])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLocationDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.longitude, pos.coords.latitude])
        setLocationDetecting(false)
      },
      () => {
        setLocationDetecting(false)
        alert('Could not access your location. Defaulting to Nairobi area.')
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!photoFile) {
      setErrorMessage('Please upload an evidence photograph or missing person portrait.')
      return
    }

    if (!isPhoneVerified) {
      setShowPhoneModal(true)
      return
    }

    await proceedSubmit()
  }

  const proceedSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSubmissionProgress('Preparing incident evidence...')

    try {
      const formData = new FormData()
      formData.append('category', category)
      formData.append('title', title)
      formData.append('obNumber', obNumber)
      formData.append('policeStation', policeStation)
      formData.append('socialMediaURL', socialMediaURL)
      formData.append('locationName', locationName)
      formData.append('contactPhone', contactPhone)
      formData.append('description', description)
      formData.append('paymentOption', paymentOption)
      formData.append('coordinates', JSON.stringify(coordinates))
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      if (category === 'missing-person') {
        formData.append('fullName', fullName || title)
        if (age) formData.append('age', age)
        formData.append('gender', gender)
        formData.append('height', height)
        formData.append('clothingLastSeen', clothingLastSeen)
      } else {
        formData.append('registrationNumber', registrationNumber)
        formData.append('make', make)
        formData.append('model', model)
        formData.append('color', color)
        if (yearOfManufacture) formData.append('yearOfManufacture', yearOfManufacture)
      }

      setSubmissionProgress('Analyzing with Gemini AI parity verification...')

      const data = await createAlertAction(formData)

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit alert')
      }

      setSubmissionResult({
        alertId: data.alertId,
        parityScore: data.parityScore,
        parityReasoning: data.parityReasoning,
        paymentUrl: data.paymentUrl,
      })
    } catch (err: any) {
      console.error('Submission error:', err)
      setErrorMessage(err.message || 'An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
      setSubmissionProgress('')
    }
  }

  const handlePhoneVerified = () => {
    setIsPhoneVerified(true)
    localStorage.setItem('civiltrace_phone_verified', 'true')
    setShowPhoneModal(false)
    proceedSubmit()
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shrink-0">
                <FilePlus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-foreground">Report Civil Emergency Alert</h1>
                <p className="text-xs text-muted-foreground">
                  Submissions undergo forensic OB validation & Gemini multimodal AI parity scoring.
                </p>
              </div>
            </div>

            {/* Verification Status Pill */}
            {isPhoneVerified ? (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Phone Verified</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Verify Phone (Required)</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Alert Banner if Unverified */}
        {!isPhoneVerified && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  Phone verification required before submitting alerts
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Protects the community mesh from false reports and allows dispatchers to verify your police OB record.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowPhoneModal(true)}
              className="rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0"
            >
              Verify Now
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-400 flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submissionResult ? (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 text-center shadow-lg space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Alert Routed to Triage</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mt-1">
                Your report has entered the <strong>Forensic Triage Pipeline</strong>. Our moderation team has been notified via FCM broadcast.
              </p>
            </div>

            {/* AI Parity Result Card */}
            {submissionResult.parityScore !== undefined && (
              <div className="rounded-2xl border border-border bg-muted/40 p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gemini AI Parity Score
                  </span>
                  <span className="rounded-full bg-primary/10 text-primary font-black px-2.5 py-0.5 text-xs">
                    {submissionResult.parityScore}% Confidence
                  </span>
                </div>
                {submissionResult.parityReasoning && (
                  <p className="text-xs text-muted-foreground italic">
                    "{submissionResult.parityReasoning}"
                  </p>
                )}
              </div>
            )}

            <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
              {submissionResult.paymentUrl && (
                <a href={submissionResult.paymentUrl} target="_blank" rel="noreferrer">
                  <Button className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm gap-2">
                    <CreditCard className="h-4 w-4" />
                    Complete M-PESA Push Broadcast (KES 150)
                  </Button>
                </a>
              )}
              <Button
                onClick={() => {
                  setSubmissionResult(null)
                  setTitle('')
                  setObNumber('')
                  setPoliceStation('')
                  setDescription('')
                  setSocialMediaURL('')
                  setPhotoFile(null)
                  setPhotoPreview(null)
                }}
                variant="outline"
                className="rounded-xl text-xs sm:text-sm font-semibold"
              >
                Submit Another Alert
              </Button>
              <Button
                onClick={() => router.push('/dashboard/alerts')}
                className="rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
              >
                View in My Alerts
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Incident Category
              </label>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'missing-person', label: 'Missing Person', icon: User, fee: '100% Free' },
                  { id: 'lost-motorbike', label: 'Lost Motorbike', icon: Bike, fee: 'Boda Alert' },
                  { id: 'lost-vehicle', label: 'Stolen Vehicle', icon: Car, fee: 'Car Alert' },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as any)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-4 transition ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs'
                          : 'border-border bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-1.5" />
                      <span className="font-bold text-xs">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.fee}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Incident Photo / Portrait Evidence <span className="text-red-500">*</span>
              </label>
              {photoPreview ? (
                <div className="relative rounded-2xl border border-border overflow-hidden bg-background max-w-xs mx-auto sm:mx-0">
                  <img src={photoPreview} alt="Evidence Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition bg-muted/20">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-bold text-foreground">Click to upload image</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG or WebP (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Title & Police OB */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={category === 'missing-person' ? 'e.g. John Doe (14 yrs)' : 'e.g. Red Boxer 150 (KMDF 412X)'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Police OB Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. OB 45/12/09/2026"
                  value={obNumber}
                  onChange={(e) => setObNumber(e.target.value)}
                  required
                  className="mt-1.5 rounded-xl bg-background font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Police Station & Location Landmark */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reporting Police Station <span className="text-red-500">*</span>
                </label>
                <PoliceStationSelect
                  value={policeStation}
                  onChange={(val, stationData) => {
                    setPoliceStation(val)
                    if (stationData?.county && !locationName) {
                      setLocationName(stationData.county)
                    }
                  }}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Last Known Area / Landmark
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationDetecting}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>{locationDetecting ? 'Detecting...' : 'Detect GPS'}</span>
                  </button>
                </div>
                <Input
                  placeholder="e.g. Roysambu Roundabout, Nairobi"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Category Specific Fields */}
            {category === 'missing-person' ? (
              <div className="grid sm:grid-cols-3 gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Estimated Age
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 14"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-hidden"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Estimated Height
                  </label>
                  <Input
                    placeholder="e.g. 5ft 4in"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Plate / Reg. No.
                  </label>
                  <Input
                    placeholder="e.g. KDF 123A"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background font-mono text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Make
                  </label>
                  <Input
                    placeholder="e.g. Toyota / Boxer"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Model
                  </label>
                  <Input
                    placeholder="e.g. Fielder / 150"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Color
                  </label>
                  <Input
                    placeholder="e.g. Silver"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Social Media Link & Parity Verification Source */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Social Media Post URL (Facebook, X, or TikTok) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://www.facebook.com/... or https://x.com/..."
                  value={socialMediaURL}
                  onChange={(e) => setSocialMediaURL(e.target.value)}
                  required
                  className="rounded-xl pl-10 bg-background text-xs sm:text-sm"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Used by Gemini AI to extract Open Graph metadata and cross-verify with your police OB record.
              </p>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Detailed Description & Distinguishing Features <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Include physical description, clothing, scratches, engine numbers, stickers, or unique markings..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1.5 rounded-xl bg-background text-xs sm:text-sm"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Emergency Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="0712 345 678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="rounded-xl pl-10 bg-background text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* M-PESA Push Broadcast Option (for Lost Vehicle / Motorbike) */}
            {category !== 'missing-person' && (
              <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">FCM Geo-Radius Broadcast Push</h4>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Paystack M-PESA
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard alerts are queued for free. An optional M-PESA broadcast triggers instant push notifications
                  to all boda-boda riders, mechanics, and citizens within a 10km radius.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div
                    onClick={() => setPaymentOption('standard')}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      paymentOption === 'standard'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-bold text-xs">Standard Queue</p>
                    <p className="text-[11px] text-muted-foreground">Free - Moderated community feed</p>
                  </div>
                  <div
                    onClick={() => setPaymentOption('mpesa-boost')}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      paymentOption === 'mpesa-boost'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">M-PESA Push Broadcast (KES 150)</p>
                    <p className="text-[11px] text-muted-foreground">Instant STK Push - 10km notification burst</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base py-5 sm:py-6 shadow-lg hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{submissionProgress || 'Submitting to Triage...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5" />
                    <span>
                      {!isPhoneVerified
                        ? 'Verify Phone & Submit Alert'
                        : 'Submit Alert for Verification'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
      />
    </DashboardShell>
  )
}
