'use client'

import { useState, useTransition } from 'react'
import {
  Camera,
  CheckCircle,
  Eye,
  Loader2,
  Navigation,
  Send,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { reportSightingAction } from '@/app/actions/sightings'

interface SightingsClientProps {
  initialAlerts: any[]
  initialSightings: any[]
  selectedAlertId?: string
}

export function SightingsClient({
  initialAlerts,
  initialSightings,
  selectedAlertId,
}: SightingsClientProps) {
  const [alertId, setAlertId] = useState(
    selectedAlertId || (initialAlerts.length > 0 ? initialAlerts[0].id : '')
  )
  const [locationName, setLocationName] = useState('')
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [isSubmitting, startTransition] = useTransition()
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [mySightings, setMySightings] = useState<any[]>(initialSightings)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.longitude, pos.coords.latitude])
        setDetectingLocation(false)
      },
      (err) => {
        console.error('GPS detection error:', err)
        setDetectingLocation(false)
        alert('Could not acquire your current GPS coordinates. Please type the location manually.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!alertId) {
      setErrorMessage('Please select or specify the alert reference.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Please describe what you observed.')
      return
    }

    const formData = new FormData()
    formData.append('alertId', alertId)
    formData.append('description', description)
    formData.append('locationName', locationName)

    if (coordinates) {
      formData.append('coordinates', JSON.stringify(coordinates))
    }
    if (photoFile) {
      formData.append('photo', photoFile)
    }

    startTransition(async () => {
      const res = await reportSightingAction(formData)
      if (res.success) {
        setSubmittedSuccess(true)
        // Prepend optimistic item
        setMySightings((prev) => [
          {
            id: res.sightingId || String(Date.now()),
            alert: alertId,
            description,
            locationName: locationName || 'Field Location',
            verificationStatus: 'pending',
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
        setDescription('')
        setLocationName('')
        setCoordinates(null)
        setPhotoFile(null)
        setPhotoPreview(null)
      } else {
        setErrorMessage(res.error || 'Failed to submit sighting.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
          {errorMessage}
        </div>
      )}

      {submittedSuccess ? (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Eyewitness Report Submitted
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Your sighting has been logged and transmitted to field moderators for verification. +50 Civic Points have been credited.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => setSubmittedSuccess(false)}
              className="rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
            >
              Report Another Sighting
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Target Emergency Alert Reference
            </label>
            {initialAlerts.length > 0 ? (
              <select
                value={alertId}
                onChange={(e) => setAlertId(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground focus:outline-hidden"
              >
                {initialAlerts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.obNumber} - {a.policeStation})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="Paste Alert ID or OB Number..."
                value={alertId}
                onChange={(e) => setAlertId(e.target.value)}
                required
                className="rounded-xl text-xs sm:text-sm bg-background font-mono"
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sighting Location / Landmark
              </label>
              <button
                type="button"
                onClick={detectGPS}
                disabled={detectingLocation}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
              >
                <Navigation className="h-3 w-3" />
                <span>{detectingLocation ? 'Locating...' : 'Stamp My GPS'}</span>
              </button>
            </div>
            <Input
              placeholder="e.g. Stage near Total Petrol Station, Kangundo Rd"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              className="rounded-xl text-xs sm:text-sm bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Eyewitness Observations & Details
            </label>
            <Textarea
              placeholder="Describe what you saw: direction of travel, companions, condition, vehicle registration plate, or specific time observed..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="rounded-xl text-xs sm:text-sm bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Optional Sighting Photo Evidence
            </label>
            {photoPreview ? (
              <div className="relative rounded-2xl border border-border overflow-hidden bg-background max-w-xs">
                <img src={photoPreview} alt="Sighting Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition bg-muted/20">
                <Camera className="h-7 w-7 text-muted-foreground mb-1.5" />
                <span className="text-xs font-bold text-foreground">Attach Sighting Photograph</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG or WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-sm py-5 shadow-xs hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Transmitting to Dispatch...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Transmit Eyewitness Sighting</span>
              </>
            )}
          </Button>
        </form>
      )}

      {/* Sighting History Section */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <Eye className="h-4 w-4 text-primary" />
          <span>Your Field Submissions History</span>
        </div>
        {mySightings.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            You have not submitted any field sightings yet.
          </p>
        ) : (
          <div className="space-y-3">
            {mySightings.map((s) => {
              const status = s.verificationStatus || 'pending'
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-border p-4 bg-background flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : status === 'led-to-recovery'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {status === 'led-to-recovery' ? 'Safe Recovery Match' : status}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('en-KE')}
                      </span>
                    </div>
                    <p className="font-bold text-foreground">{s.locationName || 'Field Location'}</p>
                    <p className="text-muted-foreground">{s.description}</p>
                  </div>

                  <span className="font-bold text-primary shrink-0">
                    {status === 'led-to-recovery' ? '+500 pts' : status === 'verified' ? '+200 pts' : '+50 pts'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
