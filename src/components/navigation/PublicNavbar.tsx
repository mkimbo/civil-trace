'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  MapPin,
  PhoneCall,
  Menu,
  X,
  Radio,
  UserCheck,
  PhoneForwarded,
  ArrowRight,
  LogIn,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { useUser } from '@/hooks/useUser'

interface PublicNavbarProps {
  activePage?: 'home' | 'map' | 'directory' | 'triage' | 'portal'
}

export function PublicNavbar({ activePage }: PublicNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo - Compact on mobile */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shrink-0">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-foreground leading-tight">
                CivilTrace
              </span>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-primary leading-none">
                KE
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium hidden md:block leading-none mt-0.5">
              Community Safety Mesh
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
          <Link
            href="/map"
            className={`transition hover:text-foreground ${
              activePage === 'map' ? 'text-primary font-bold' : ''
            }`}
          >
            Live Map
          </Link>
          <Link
            href="/directory"
            className={`transition hover:text-foreground ${
              activePage === 'directory' ? 'text-primary font-bold' : ''
            }`}
          >
            OCS Directory
          </Link>
          <Link
            href="/dashboard/triage"
            className={`transition hover:text-foreground ${
              activePage === 'triage' ? 'text-primary font-bold' : ''
            }`}
          >
            Moderator Triage
          </Link>
          <Link
            href="/dashboard"
            className={`transition hover:text-foreground ${
              activePage === 'portal' ? 'text-primary font-bold' : ''
            }`}
          >
            Citizen Portal
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Desktop User Status / Sign In */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs font-semibold h-9 border border-border">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name || user.email.split('@')[0]}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs sm:text-sm font-semibold h-9">
                Sign In
              </Button>
            </Link>
          )}

          {/* Emergency Report Button - Scaled & Touch Friendly */}
          <Link href="/dashboard/create-alert" className="shrink-0">
            <Button
              size="sm"
              className="gap-1 sm:gap-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm shrink-0"
            >
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Report Incident</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition shrink-0"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/98 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/map"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Live Alert Map</span>
            </Link>

            <Link
              href="/directory"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <PhoneCall className="h-4 w-4 text-primary shrink-0" />
              <span>OCS Directory</span>
            </Link>

            <Link
              href="/dashboard/triage"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Radio className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Forensic Triage</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Citizen Portal</span>
            </Link>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground leading-tight">{user.name || 'Verified User'}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  <span>Out</span>
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                <Button variant="outline" className="w-full gap-2 rounded-xl text-xs font-bold py-4">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In with Social SSO</span>
                </Button>
              </Link>
            )}

            <a href="tel:999" className="block w-full">
              <Button variant="ghost" className="w-full gap-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10">
                <PhoneForwarded className="h-3.5 w-3.5" />
                <span>National Emergency: Call 999</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
