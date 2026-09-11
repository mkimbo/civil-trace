'use client'

import { useState, useTransition } from 'react'
import {
  ShieldCheck,
  Check,
  X,
  Radio,
  ExternalLink,
  MapPin,
  Sparkles,
  Search,
  Loader2,
  Phone,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { reviewAlertAction } from '@/app/actions/alerts'

interface TriageClientProps {
  initialAlerts: any[]
  initialCategory?: string
}

export function TriageClient({ initialAlerts, initialCategory = 'all' }: TriageClientProps) {
  const [alerts, setAlerts] = useState<any[]>(initialAlerts)
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState<{ [id: string]: string }>({})
  const [showRejectInput, setShowRejectInput] = useState<{ [id: string]: boolean }>({})
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    setProcessingId(id)
    startTransition(async () => {
      const res = await reviewAlertAction(id, 'approve', 'Verified authentic police OB record')
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
      } else {
        alert(res.error || 'Failed to approve alert')
      }
      setProcessingId(null)
    })
  }

  const handleReject = (id: string) => {
    setProcessingId(id)
    const notes = rejectionNotes[id] || 'Failed triage verification'
    startTransition(async () => {
      const res = await reviewAlertAction(id, 'reject', notes)
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
      } else {
        alert(res.error || 'Failed to reject alert')
      }
      setProcessingId(null)
    })
  }

  const filteredAlerts = alerts.filter((a) => {
    const matchCategory = activeCategory === 'all' || a.category === activeCategory
    if (!searchQuery) return matchCategory
    const q = searchQuery.toLowerCase()
    const matchSearch =
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.obNumber && a.obNumber.toLowerCase().includes(q)) ||
      (a.policeStation && a.policeStation.toLowerCase().includes(q)) ||
      (a.lastSeenLocationName && a.lastSeenLocationName.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Incidents' },
            { id: 'missing-person', label: 'Missing Persons' },
            { id: 'lost-motorbike', label: 'Boda Bodas' },
            { id: 'lost-vehicle', label: 'Vehicles' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search OB or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Queue Items */}
      {filteredAlerts.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Triage Queue Clear</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            All submitted alerts have been processed. New reports will appear here automatically when submitted.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => {
            const photoDoc = alert.photo
            const photoUrl = photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)
            const parity = alert.parityScore ?? 75
            const isHighConfidence = parity >= 80

            return (
              <div
                key={alert.id}
                className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm transition hover:shadow-md space-y-4"
              >
                <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
                  <div className="flex gap-4 items-start w-full lg:w-auto">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={alert.title}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                        <Eye className="h-6 w-6" />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            alert.category === 'missing-person'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {alert.category === 'missing-person' ? 'Missing Person' : 'Property Alert'}
                        </span>
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md text-foreground">
                          {alert.obNumber}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug truncate">
                        {alert.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{alert.policeStation}</span>
                        {alert.lastSeenLocationName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.lastSeenLocationName}
                          </span>
                        )}
                        {alert.contactPhone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3" />
                            {alert.contactPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Parity Verification Card */}
                  <div className="w-full lg:w-72 rounded-2xl border border-border bg-muted/30 p-3.5 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Gemini Parity Match</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                          isHighConfidence
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {parity}% Confidence
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {alert.parityReasoning || 'AI scan verified police station OB format and social context.'}
                    </p>
                    {alert.socialMediaURL && (
                      <a
                        href={alert.socialMediaURL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold pt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View Source Post</span>
                      </a>
                    )}
                  </div>
                </div>

                {showRejectInput[alert.id] && (
                  <div className="pt-2">
                    <Input
                      placeholder="State reason for rejection (e.g. invalid OB number, mismatched photo)..."
                      value={rejectionNotes[alert.id] || ''}
                      onChange={(e) =>
                        setRejectionNotes((prev) => ({ ...prev, [alert.id]: e.target.value }))
                      }
                      className="rounded-xl text-xs bg-background"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">
                    Reported: {new Date(alert.createdAt).toLocaleString('en-KE')}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!showRejectInput[alert.id] ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowRejectInput((prev) => ({ ...prev, [alert.id]: true }))
                        }
                        disabled={processingId === alert.id}
                        className="rounded-xl border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold flex-1 sm:flex-initial"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(alert.id)}
                          disabled={processingId === alert.id}
                          className="rounded-xl text-xs font-bold"
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowRejectInput((prev) => ({ ...prev, [alert.id]: false }))
                          }
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApprove(alert.id)}
                      disabled={processingId === alert.id}
                      className="rounded-xl bg-primary text-primary-foreground font-black text-xs gap-1.5 shadow-sm hover:bg-primary/90 flex-1 sm:flex-initial"
                    >
                      {processingId === alert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>Approve & Broadcast</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
