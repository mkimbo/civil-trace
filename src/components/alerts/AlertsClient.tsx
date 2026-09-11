'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Search,
  MapPin,
  Eye,
  Printer,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AlertsClientProps {
  initialAlerts: any[]
  initialCategory?: string
  initialSearch?: string
}

export function AlertsClient({
  initialAlerts,
  initialCategory = 'all',
  initialSearch = '',
}: AlertsClientProps) {
  const [filter, setFilter] = useState(initialCategory)
  const [query, setQuery] = useState(initialSearch)

  const filtered = useMemo(() => {
    return initialAlerts.filter((a) => {
      const matchCat = filter === 'all' || a.category === filter
      const q = query.toLowerCase().trim()
      if (!q) return matchCat

      const matchQ =
        a.title?.toLowerCase().includes(q) ||
        a.obNumber?.toLowerCase().includes(q) ||
        a.policeStation?.toLowerCase().includes(q) ||
        a.lastSeenLocationName?.toLowerCase().includes(q)

      return matchCat && matchQ
    })
  }, [initialAlerts, filter, query])

  const shareWhatsApp = (a: any) => {
    const text = `URGENT ALERT: ${a.title}\nPolice OB: ${a.obNumber} (${a.policeStation})\nLast Seen: ${a.lastSeenLocationName || 'Kenya'}\nCall: ${a.contactPhone || '999'}\nDetails: https://civiltrace.org/alerts/${a.id}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Category filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Incidents' },
            { id: 'missing-person', label: 'Missing Persons' },
            { id: 'lost-motorbike', label: 'Boda Bodas' },
            { id: 'lost-vehicle', label: 'Vehicles' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === f.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search OB, station or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-xl pl-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
          <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No alerts found</h3>
          <p className="text-xs text-muted-foreground">
            No reports match your current query or category filter.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((alert) => {
            const photoDoc = alert.photo
            const photoUrl =
              photoDoc?.url || (photoDoc?.filename ? `/media/${photoDoc.filename}` : null)
            const isPublished = alert._status === 'published'

            return (
              <div
                key={alert.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        alert.category === 'missing-person'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {alert.category === 'missing-person' ? 'Missing Person' : 'Property Alert'}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Under Triage'}
                    </span>
                  </div>

                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt={alert.title}
                      className="w-full h-40 object-cover rounded-2xl border border-border"
                    />
                  )}

                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {alert.obNumber}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-0.5 leading-snug line-clamp-1">
                      {alert.title}
                    </h3>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{alert.lastSeenLocationName || alert.policeStation}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{alert.policeStation}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/api/alerts/${alert.id}/poster?print=true`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button size="sm" variant="outline" className="w-full rounded-xl text-[11px] font-bold gap-1">
                        <Printer className="h-3 w-3" />
                        <span>Poster</span>
                      </Button>
                    </a>
                    <Link href={`/dashboard/sightings?alertId=${alert.id}`} className="w-full">
                      <Button size="sm" variant="outline" className="w-full rounded-xl text-[11px] font-bold gap-1">
                        <Eye className="h-3 w-3" />
                        <span>Sightings</span>
                      </Button>
                    </Link>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => shareWhatsApp(alert)}
                    className="w-full rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1.5 py-4 hover:bg-primary/90"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share on WhatsApp</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
