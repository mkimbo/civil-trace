'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Building, Search, Check, X, MapPin, ChevronDown } from 'lucide-react'
import { KENYA_POLICE_STATIONS } from '@/data/kenya-police-directory'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PoliceStationSelectProps {
  value: string
  onChange: (value: string, stationData?: { county: string; phone?: string }) => void
  required?: boolean
}

export function PoliceStationSelect({ value, onChange, required }: PoliceStationSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredStations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return KENYA_POLICE_STATIONS.slice(0, 15) // Show top 15 by default
    return KENYA_POLICE_STATIONS.filter((st) => {
      return (
        st.stationName.toLowerCase().includes(q) ||
        st.county.toLowerCase().includes(q) ||
        (st.subCounty && st.subCounty.toLowerCase().includes(q))
      )
    }).slice(0, 30) // Limit to top 30 matches for snappy rendering
  }, [searchQuery])

  const selectedStation = useMemo(() => {
    if (!value) return null
    return KENYA_POLICE_STATIONS.find(
      (st) =>
        st.stationName.toLowerCase() === value.toLowerCase() ||
        `${st.stationName} (${st.county})`.toLowerCase() === value.toLowerCase()
    )
  }, [value])

  const handleSelect = (stationName: string, county: string, phone?: string) => {
    const formatted = `${stationName} (${county})`
    onChange(formatted, { county, phone })
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCustomUse = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim())
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative mt-1.5">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs sm:text-sm cursor-pointer hover:border-primary/50 transition"
        >
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4 text-primary shrink-0" />
            {value ? (
              <span className="font-semibold text-foreground truncate">{value}</span>
            ) : (
              <span className="text-muted-foreground">Select official police station...</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl border border-border bg-card p-2.5 shadow-xl space-y-2 max-h-80 overflow-hidden flex flex-col">
          {/* Search Bar inside popover */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search station or county (e.g. Kasarani, Mombasa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs bg-muted/30 border-border"
            />
          </div>

          {/* List of Stations */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1">
            {filteredStations.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">No official station matching "{searchQuery}"</p>
                {searchQuery.trim() && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleCustomUse}
                    className="rounded-xl text-xs font-bold"
                  >
                    Use "{searchQuery.trim()}"
                  </Button>
                )}
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected =
                  value === `${station.stationName} (${station.county})` || value === station.stationName

                return (
                  <div
                    key={station.stationName}
                    onClick={() => handleSelect(station.stationName, station.county, station.phoneNumber)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                      isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="font-semibold truncate">{station.stationName}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {station.county} County
                        </span>
                        {station.phoneNumber && <span>• Tel: {station.phoneNumber}</span>}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                )
              })
            )}
          </div>

          {/* Prompt to use custom name if not found */}
          {searchQuery.trim() && filteredStations.length > 0 && (
            <div className="pt-2 border-t border-border shrink-0 flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Can't find a remote post?</span>
              <button
                type="button"
                onClick={handleCustomUse}
                className="text-primary font-bold hover:underline"
              >
                Use custom text
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
