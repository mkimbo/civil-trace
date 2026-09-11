'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar/Sidebar'
import { TopNav } from './TopNav'
import { MobileBottomNav } from './MobileBottomNav'
import type { User } from '@/payload-types'
import { useDashboard, DashboardProvider } from '@/components/providers/DashboardProvider'

interface DashboardShellInnerProps {
  children: ReactNode
  user?: User | null
}

function DashboardShellInner({ children, user }: DashboardShellInnerProps) {
  const { menuState, isMobile } = useDashboard()

  const getMarginLeft = () => {
    if (isMobile) return '0'
    if (menuState === 'collapsed') return '4.5rem'
    return '16rem'
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground ">
      <Sidebar user={user} />
      <div
        className="flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0"
        style={{ marginLeft: getMarginLeft() }}
      >
        <TopNav user={user} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode
  user?: User | null
}) {
  return (
    <DashboardProvider>
      <DashboardShellInner user={user}>{children}</DashboardShellInner>
    </DashboardProvider>
  )
}