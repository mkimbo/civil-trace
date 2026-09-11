'use client'

import { cn } from '@/lib/utils'
import { useDashboard } from '@/components/providers/DashboardProvider'
import type { User } from '@/payload-types'
import { sidebarSections } from './sidebar-config'
import { SidebarHeader } from './SidebarHeader'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Award, LogOut, User as UserIcon } from 'lucide-react'

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
}) => {
  const { menuState, isMobile } = useDashboard()
  const showText = menuState === 'full' || isMobile
  const showTooltip = menuState === 'collapsed' && !isMobile

  const link = (
    <Link
      href={href}
      className={cn(
        'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-inner',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span
        className={cn(
          'whitespace-nowrap transition-all duration-200',
          showText ? 'ml-3 opacity-100' : 'pointer-events-none opacity-0 w-0 h-0 overflow-hidden',
        )}
      >
        {label}
      </span>
    </Link>
  )

  if (showTooltip) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-semibold">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

interface SidebarProps {
  user?: User | null
}

export function Sidebar({ user }: SidebarProps) {
  const { menuState, isMobile, isMobileMenuOpen, toggleMobileMenu } = useDashboard()
  const pathname = usePathname()

  const showText = menuState === 'full' || isMobile
  const userRoles = (user?.roles as string[]) || ['user']

  const getWidth = () => {
    if (isMobile) return '16rem'
    if (menuState === 'collapsed') return '4.5rem'
    return '16rem'
  }

  const hasAccess = (requiredRoles: string[]) => {
    return requiredRoles.some((role) => userRoles.includes(role.toLowerCase()))
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
          isMobile && !isMobileMenuOpen && '-translate-x-full',
        )}
        style={{ width: getWidth() }}
      >
        <SidebarHeader showText={showText} user={user || undefined} />

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sidebarSections.map((section, idx) => {
            const accessibleLinks = section.links.filter((link) => hasAccess(link.roles as string[]))
            if (accessibleLinks.length === 0) return null

            return (
              <div key={idx} className="space-y-1">
                {showText && section.label && (
                  <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {section.label}
                  </h4>
                )}
                <div className="space-y-1">
                  {accessibleLinks.map((link) => (
                    <NavItem
                      key={link.href}
                      href={link.href}
                      icon={link.icon}
                      label={link.label}
                      isActive={pathname === link.href}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* User Footer / Civic Points Card */}
        {user && (
          <div className="border-t p-3">
            <div
              className={cn(
                'flex items-center rounded-xl bg-background/80 p-2.5 shadow-sm border border-border/40',
                !showText && 'justify-center',
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              {showText && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {user.name || user.email}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Award className="h-3 w-3 text-amber-500" />
                    <span>{user.civicPointsBalance || 0} pts</span>
                    <span className="capitalize">• {userRoles[0]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}