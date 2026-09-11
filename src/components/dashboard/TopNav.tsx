'use client'

import { Bell, Menu, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/payload-types'
import { useDashboard } from '../providers/DashboardProvider'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import { useState } from 'react'

export function TopNav({ user }: { user?: User | null }) {
  const { toggleMenuState, toggleMobileMenu, isMobile } = useDashboard()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user: hookUser, logout } = useUser()

  const activeUser = user || (hookUser as any)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/90 px-3 sm:px-4 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobile ? toggleMobileMenu : toggleMenuState}
          className="rounded-xl hover:bg-muted text-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Live Network Status Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-muted-foreground shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="truncate max-w-[130px] sm:max-w-none">Kenya Mesh Active</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Quick Report Alert CTA */}
        <Link href="/dashboard/create-alert" className="hidden sm:inline-flex">
          <Button size="sm" className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-bold">
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </Button>
        </Link>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative rounded-xl hover:bg-muted text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        {/* User Badge / Avatar */}
        {activeUser ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard/points" className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted transition" aria-label="Profile">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary font-bold text-xs border border-primary/20">
                {(activeUser.name || activeUser.email || 'U')[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold leading-tight text-foreground truncate max-w-[120px]">{activeUser.name || activeUser.email || 'Citizen'}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{activeUser.civicPointsBalance ?? 0} pts</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
