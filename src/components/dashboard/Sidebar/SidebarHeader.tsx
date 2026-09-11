'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/payload-types'

interface SidebarHeaderProps {
  user?: User
  showText: boolean
}

export function SidebarHeader({ showText }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center border-b px-3 dark:border-slate-800">
      <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className={cn('flex flex-col whitespace-nowrap transition-opacity duration-200', !showText && 'hidden')}>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-foreground">CivilTrace</span>
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
              KE
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Community Safety</span>
        </div>
      </Link>
    </div>
  )
}