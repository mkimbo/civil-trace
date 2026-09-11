'use client'

import Link from 'next/link'
import {
  Clock,
  Eye,
  MapPin,
  Phone,
  Printer,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function extractText(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (content.root?.children) {
    return content.root.children
      .map((node: any) => node.children?.map((c: any) => c.text).join('') || '')
      .join('\n')
  }
  return ''
}

interface AlertDetailClientProps {
  alert: any
}

export function AlertDetailClient({ alert }: AlertDetailClientProps) {
  const photoDoc: any = alert.photo
  const photoUrl = photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)
  const descriptionText = extractText(alert.description)
  const isMissingPerson = alert.category === 'missing-person'

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Incident Photo */}
        <div className="w-full md:w-80 shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={alert.title}
              className="w-full h-72 sm:h-80 object-cover rounded-2xl border border-border shadow-xs"
            />
          ) : (
            <div className="w-full h-72 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
              <ShieldAlert className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-mono font-bold text-foreground mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Police OB: {alert.obNumber}</span>
              <span>•</span>
              <span>{alert.policeStation}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              {alert.title}
            </h1>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>
                Last Seen: <strong className="text-foreground">{alert.lastSeenLocationName || 'Kenya'}</strong>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Reported: <strong className="text-foreground">{new Date(alert.createdAt).toLocaleString('en-KE')}</strong>
              </span>
            </p>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-foreground">Distinguishing Description:</h4>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {descriptionText || 'No additional description provided.'}
            </p>
          </div>

          {/* Category specifics if available */}
          {alert.personDetails && isMissingPerson && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {alert.personDetails.age && (
                <div className="rounded-xl border border-border p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Age</span>
                  <strong className="text-foreground">{alert.personDetails.age} years</strong>
                </div>
              )}
              {alert.personDetails.gender && (
                <div className="rounded-xl border border-border p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Gender</span>
                  <strong className="text-foreground capitalize">{alert.personDetails.gender}</strong>
                </div>
              )}
              {alert.personDetails.height && (
                <div className="rounded-xl border border-border p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Height</span>
                  <strong className="text-foreground">{alert.personDetails.height}</strong>
                </div>
              )}
            </div>
          )}

          {/* Actions Button Group */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a href={`tel:${alert.contactPhone || '999'}`} className="flex-1">
              <Button className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-sm py-5 hover:bg-primary/90 shadow-xs">
                <Phone className="h-4 w-4" />
                <span>Call Emergency Hotline: {alert.contactPhone || '999'}</span>
              </Button>
            </a>

            <Link href={`/dashboard/sightings?alertId=${alert.id}`} className="flex-1">
              <Button variant="secondary" className="w-full gap-2 rounded-2xl font-bold text-sm py-5">
                <Eye className="h-4 w-4" />
                <span>Report Sighting</span>
              </Button>
            </Link>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={`/api/alerts/${alert.id}/poster?print=true`}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                <span>Print Emergency Poster (PDF)</span>
              </Button>
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `URGENT ALERT: ${alert.title}\nPolice OB: ${alert.obNumber} (${alert.policeStation})\nLast Seen: ${alert.lastSeenLocationName || 'Kenya'}\nCall: ${alert.contactPhone || '999'}\nDetails: https://civiltrace.org/alerts/${alert.id}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span>Share on WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
