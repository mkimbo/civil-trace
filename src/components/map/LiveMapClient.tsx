'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  MapPin,
  Search,
  ArrowLeft,
  Car,
  Bike,
  User,
  Clock,
  Share2,
  Phone,
  Eye,
  List,
  Map as MapIcon,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import type { LiveAlertItem } from '@/lib/payload/getLiveAlerts'

interface LiveMapClientProps {
  initialAlerts: LiveAlertItem[]
  initialCategory?: string
  hideNavbarHeader?: boolean
}

export function LiveMapClient({
  initialAlerts,
  initialCategory = 'all',
  hideNavbarHeader = false,
}: LiveMapClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<LiveAlertItem | null>(
    initialAlerts.length > 0 ? initialAlerts[0] : null
  )
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('map')

  const filteredAlerts = useMemo(() => {
    return initialAlerts.filter((alert) => {
      const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        alert.title.toLowerCase().includes(q) ||
        alert.locationName.toLowerCase().includes(q) ||
        alert.obNumber.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [initialAlerts, selectedCategory, searchQuery])

  const getMapPosition = (lat: number, lng: number) => {
    const dLat = (lat - -1.2921) * 300
    const dLng = (lng - 36.8219) * 300
    const top = Math.max(10, Math.min(90, 50 - dLat))
    const left = Math.max(10, Math.min(90, 50 + dLng))
    return { top: `${top}%`, left: `${left}%` }
  }

  const shareAlert = (alert: LiveAlertItem) => {
    const text = `URGENT ALERT: ${alert.title}\nPolice OB: ${alert.obNumber} (${alert.policeStation})\nLast Seen: ${alert.locationName}\nContact: ${alert.contactPhone}\nReport sightings online at https://civiltrace.org`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden w-full max-w-full">
      {/* Top Header */}
      {!hideNavbarHeader && (
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-6 z-20 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <span className="font-black text-xs sm:text-sm leading-tight block">Live Incident Map</span>
                <span className="text-[10px] text-muted-foreground hidden md:block">Real-time incident pins & geo-radius</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeSwitcher />
            <Link href="/dashboard/create-alert" className="shrink-0">
              <Button
                size="sm"
                className="gap-1 sm:gap-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-sm h-8 sm:h-9 px-2.5 sm:px-3.5 shrink-0 hover:bg-primary/90"
              >
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Report Alert</span>
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* Mobile-Only Segment Control Bar */}
      <div className="flex md:hidden border-b border-border bg-card/95 px-3 py-1.5 z-10 w-full shrink-0">
        <div className="flex w-full items-center rounded-xl border border-border bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
              mobileTab === 'list'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Incidents ({filteredAlerts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
              mobileTab === 'map'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex flex-1 overflow-hidden w-full max-w-full">
        {/* Incident List Drawer */}
        <div
          className={`${
            mobileTab === 'list' ? 'flex' : 'hidden'
          } md:flex w-full md:w-96 flex-col border-r border-border bg-card shrink-0 z-10 overflow-hidden`}
        >
          <div className="p-3 sm:p-4 border-b border-border space-y-2.5 bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl pl-9 bg-background text-xs sm:text-sm h-9"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'missing-person', label: 'Persons' },
                { id: 'lost-vehicle', label: 'Vehicles' },
                { id: 'lost-motorbike', label: 'Boda Bodas' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === item.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'border border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No active alerts match your search.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id
                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlert(alert)
                      setMobileTab('map')
                    }}
                    className={`rounded-2xl border p-3 cursor-pointer transition ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-xs'
                        : 'border-border bg-background hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          alert.category === 'missing-person'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {alert.category === 'missing-person' ? 'Missing Person' : 'Property Alert'}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground font-bold">
                        {alert.obNumber}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-foreground leading-snug line-clamp-1">
                      {alert.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{alert.locationName}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Map View & Active Incident Detail Overlay */}
        <div
          className={`${
            mobileTab === 'map' ? 'flex' : 'hidden'
          } md:flex flex-1 relative bg-muted/40 overflow-hidden items-center justify-center`}
        >
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Interactive Radar Pins */}
          {filteredAlerts.map((alert) => {
            const pos = getMapPosition(alert.lat, alert.lng)
            const isSelected = selectedAlert?.id === alert.id

            return (
              <div
                key={alert.id}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => setSelectedAlert(alert)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              >
                <span className="absolute -inset-2 rounded-full bg-primary/30 animate-ping opacity-75" />
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg border-2 transition transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-white ring-4 ring-primary/30 scale-110'
                      : 'bg-card text-primary border-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {alert.category === 'missing-person' ? (
                    <User className="h-5 w-5" />
                  ) : alert.category === 'lost-motorbike' ? (
                    <Bike className="h-5 w-5" />
                  ) : (
                    <Car className="h-5 w-5" />
                  )}
                </div>
                <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground/90 px-1.5 py-0.5 text-[9px] font-bold text-background shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition">
                  {alert.obNumber}
                </div>
              </div>
            )
          })}

          {/* Selected Alert Details Floating Card */}
          {selectedAlert && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xl z-20 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      selectedAlert.category === 'missing-person'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {selectedAlert.category === 'missing-person' ? 'Missing Person' : 'Stolen Property'}
                  </span>
                  <h3 className="text-base font-black text-foreground mt-1 leading-snug">
                    {selectedAlert.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {selectedAlert.photoUrl && (
                <img
                  src={selectedAlert.photoUrl}
                  alt={selectedAlert.title}
                  className="w-full h-36 object-cover rounded-2xl border border-border"
                />
              )}

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-mono bg-muted/60 p-2 rounded-xl text-foreground font-bold">
                  <span>Police OB:</span>
                  <span>{selectedAlert.obNumber}</span>
                  <span>•</span>
                  <span>{selectedAlert.policeStation}</span>
                </div>

                <p className="flex items-center gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground font-semibold">{selectedAlert.locationName}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <a href={`tel:${selectedAlert.contactPhone}`} className="w-full">
                  <Button size="sm" className="w-full rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1 py-4">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Hotline</span>
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareAlert(selectedAlert)}
                  className="w-full rounded-xl text-xs font-bold gap-1 py-4"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/api/alerts/${selectedAlert.id}/poster?print=true`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" variant="secondary" className="w-full rounded-xl text-[11px] font-bold gap-1">
                    <Printer className="h-3 w-3" />
                    <span>Print Poster</span>
                  </Button>
                </a>
                <Link href={`/dashboard/sightings?alertId=${selectedAlert.id}`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full rounded-xl text-[11px] font-bold gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Sighting</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
