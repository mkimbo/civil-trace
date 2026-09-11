'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Plus,
  PhoneCall,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Feed', icon: LayoutDashboard },
    { href: '/dashboard/map', label: 'Map', icon: MapPin },
    { href: '/dashboard/create-alert', label: 'Report', icon: Plus, isSpecial: true },
    { href: '/dashboard/directory', label: 'OCS', icon: PhoneCall },
    { href: '/dashboard/points', label: 'Points', icon: Award },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-border bg-card/95 backdrop-blur-lg px-2 py-1 shadow-lg">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5"
                aria-label={item.label}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-foreground mt-0.5">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-1 px-3 rounded-xl',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}