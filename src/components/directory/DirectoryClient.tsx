'use client'

import { useState, useMemo } from 'react'
import {
  PhoneCall,
  Search,
  MapPin,
  Building,
  ShieldCheck,
  Phone,
  Ambulance,
  HeartPulse,
  Copy,
  Check,
  Radio,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DirectoryStation } from '@/lib/payload/getDirectoryStations'
import { KENYA_POLICE_STATIONS } from '@/data/kenya-police-directory'
import { KENYA_EMERGENCY_AMBULANCES } from '@/data/kenya-emergency-services'

interface DirectoryClientProps {
  initialStations: DirectoryStation[]
  initialCounty?: string
  initialSearch?: string
}

const COUNTIES = [
  'All Counties',
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  "Murang'a",
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita Taveta',
  'Tana River',
  'Tharaka Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
]

export function DirectoryClient({
  initialStations,
  initialCounty = 'All Counties',
  initialSearch = '',
}: DirectoryClientProps) {
  const [activeTab, setActiveTab] = useState<'police' | 'ambulance'>('police')
  const [query, setQuery] = useState(initialSearch)
  const [selectedCounty, setSelectedCounty] = useState(initialCounty)
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNumber(num)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  // Merge initialStations with KENYA_POLICE_STATIONS to guarantee all 218+ stations are present
  const allStations = useMemo(() => {
    const stationMap = new Map<string, DirectoryStation>()

    // Seed all 218+ national police stations
    for (const s of KENYA_POLICE_STATIONS) {
      stationMap.set(s.stationName.toLowerCase().trim(), {
        id: s.stationName,
        stationName: s.stationName,
        ocsName: s.ocsName,
        phoneNumber: s.phoneNumber,
        alternatePhone: s.alternatePhone,
        county: s.county,
        subCounty: s.subCounty,
        ward: s.ward,
        isActive: true,
      })
    }

    // Overlay database records
    for (const st of initialStations || []) {
      const key = st.stationName.toLowerCase().trim()
      const existing = stationMap.get(key)
      stationMap.set(key, {
        ...(existing || {}),
        ...st,
        phoneNumber: st.phoneNumber || existing?.phoneNumber || '',
        alternatePhone: st.alternatePhone || existing?.alternatePhone,
        county: st.county || existing?.county || 'Nairobi',
      })
    }

    return Array.from(stationMap.values()).sort((a, b) => {
      if (a.county.toLowerCase() === b.county.toLowerCase()) {
        return a.stationName.localeCompare(b.stationName)
      }
      return a.county.localeCompare(b.county)
    })
  }, [initialStations])

  // Filter police stations
  const filteredStations = useMemo(() => {
    return allStations.filter((st) => {
      const matchCounty =
        selectedCounty === 'All Counties' ||
        selectedCounty === 'All' ||
        st.county.toLowerCase() === selectedCounty.toLowerCase()
      const q = query.toLowerCase()
      const matchQuery =
        !q ||
        (st.stationName && st.stationName.toLowerCase().includes(q)) ||
        (st.subCounty && st.subCounty.toLowerCase().includes(q)) ||
        (st.ocsName && st.ocsName.toLowerCase().includes(q)) ||
        (st.phoneNumber && st.phoneNumber.includes(q)) ||
        (st.alternatePhone && st.alternatePhone.includes(q)) ||
        (st.county && st.county.toLowerCase().includes(q))
      return matchCounty && matchQuery
    })
  }, [allStations, selectedCounty, query])

  // Filter ambulance units
  const filteredAmbulances = useMemo(() => {
    const q = query.toLowerCase()
    return KENYA_EMERGENCY_AMBULANCES.filter((amb) => {
      const matchCounty =
        selectedCounty === 'All Counties' ||
        selectedCounty === 'All' ||
        amb.coverage.toLowerCase().includes(selectedCounty.toLowerCase())
      const matchQuery =
        !q ||
        amb.name.toLowerCase().includes(q) ||
        amb.coverage.toLowerCase().includes(q) ||
        amb.type.toLowerCase().includes(q) ||
        amb.primaryContact.includes(q) ||
        (amb.secondaryContact && amb.secondaryContact.includes(q))
      return matchCounty && matchQuery
    })
  }, [selectedCounty, query])

  return (
    <div className="space-y-6">
      {/* Category Toggle Tabs */}
      <div className="flex p-1.5 bg-muted/60 rounded-2xl border border-border max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('police')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'police'
              ? 'bg-card text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4 text-primary" />
          <span>Police Stations ({filteredStations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ambulance')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'ambulance'
              ? 'bg-card text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ambulance className="h-4 w-4 text-rose-500" />
          <span>Ambulances ({filteredAmbulances.length})</span>
        </button>
      </div>

      {/* Search and County Controls */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === 'police'
                ? 'Search by station, county, area or phone (e.g. Kasarani, Mombasa)...'
                : 'Search ambulance by name, hospital, route or phone...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 rounded-2xl bg-card border-border text-xs sm:text-sm"
          />
        </div>

        <div>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full h-10 px-3.5 rounded-2xl border border-border bg-card text-xs sm:text-sm font-semibold text-foreground focus:outline-hidden cursor-pointer"
          >
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{activeTab === 'police' ? filteredStations.length : filteredAmbulances.length}</strong>{' '}
          {activeTab === 'police' ? 'verified police stations' : 'emergency ambulance dispatch services'}
          {selectedCounty !== 'All Counties' && ` in ${selectedCounty} County`}
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          <Radio className="h-3 w-3 animate-pulse" />
          <span>24/7 Verified Emergency Dispatch</span>
        </span>
      </div>

      {/* POLICE STATIONS TAB */}
      {activeTab === 'police' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center">
              <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-bold text-base text-foreground">No police stations found</p>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or selecting All Counties.</p>
            </div>
          ) : (
            filteredStations.map((station) => (
              <div
                key={station.id || station.stationName}
                className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {station.county} County
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1.5 leading-snug">
                        {station.stationName}
                      </h3>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {station.subCounty && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{station.subCounty} Sub-County</span>
                      </p>
                    )}
                    {station.ocsName && (
                      <p className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-foreground">{station.ocsName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a href={`tel:${station.phoneNumber}`} className="flex-1">
                      <Button className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground font-black text-xs sm:text-sm py-5 hover:bg-primary/90">
                        <Phone className="h-4 w-4" />
                        <span className="truncate">{station.phoneNumber}</span>
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(station.phoneNumber)}
                      className="rounded-2xl h-11 w-11 shrink-0"
                      title="Copy Hotline Number"
                    >
                      {copiedNumber === station.phoneNumber ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {station.alternatePhone && (
                    <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                      <span className="font-mono">Alt: {station.alternatePhone}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(station.alternatePhone!)}
                        className="text-primary hover:underline font-medium"
                      >
                        {copiedNumber === station.alternatePhone ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AMBULANCE & MEDICAL TAB */}
      {activeTab === 'ambulance' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAmbulances.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center">
              <Ambulance className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-bold text-base text-foreground">No ambulance services found</p>
              <p className="text-xs text-muted-foreground mt-1">Try resetting county filter or searching for "National".</p>
            </div>
          ) : (
            filteredAmbulances.map((amb) => (
              <div
                key={amb.name}
                className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {amb.type}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1.5 leading-snug">
                        {amb.name}
                      </h3>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-foreground">{amb.coverage}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Immediate Dispatch Available</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a href={`tel:${amb.primaryContact.replace(/\s+/g, '')}`} className="flex-1">
                      <Button className="w-full gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm py-5 shadow-xs">
                        <Phone className="h-4 w-4" />
                        <span className="truncate">Call {amb.primaryContact}</span>
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(amb.primaryContact)}
                      className="rounded-2xl h-11 w-11 shrink-0"
                      title="Copy Hotline"
                    >
                      {copiedNumber === amb.primaryContact ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {amb.secondaryContact && (
                    <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                      <span className="font-mono">Alt: {amb.secondaryContact}</span>
                      <a
                        href={`tel:${amb.secondaryContact.replace(/\s+/g, '')}`}
                        className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
                      >
                        Call Alt
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
