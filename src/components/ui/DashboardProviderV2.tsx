'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

type MenuState = 'full' | 'collapsed' | 'hidden'

interface DashboardContextType {
  menuState: MenuState
  isMobile: boolean
  isMobileMenuOpen: boolean
  toggleMenuState: () => void
  setMenuState: (state: MenuState) => void
  toggleMobileMenu: () => void
}

const DashboardV2Context = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProviderV2 = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage if available to prevent hydration mismatch
  const [menuState, setMenuState] = useState<MenuState>('full')
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const storedState = localStorage.getItem('patofy-menu-state') as MenuState
    if (storedState) {
      setMenuState(storedState)
    }

    // Initial check for mobile
    const checkMobile = () => window.innerWidth < 1024
    setIsMobile(checkMobile())

    // Debounced resize listener
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const mobile = checkMobile()
        setIsMobile(mobile)
        if (mobile) {
          setMenuState('hidden')
        } else {
          // Restore desktop state if returning from mobile
          const stored = localStorage.getItem('patofy-menu-state') as MenuState
          setMenuState(stored || 'expanded')
        }
      }, 150) // 150ms debounce
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const toggleMenuState = useCallback(() => {
    setMenuState((prev) => {
      const newState = prev === 'full' ? 'collapsed' : 'full'
      localStorage.setItem('patofy-menu-state', newState)
      return newState
    })
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  // Derived state for CSS variables
  // We apply these to the <body> or a root element in the Shell
  useEffect(() => {
    if (!hasMounted) return
    document.documentElement.style.setProperty(
      '--sidebar-width',
      menuState === 'collapsed' ? '64px' : '256px',
    )
    document.documentElement.setAttribute('data-sidebar-state', menuState)
  }, [menuState, hasMounted])

  const value = {
    menuState,
    isMobile,
    isMobileMenuOpen,
    toggleMenuState,
    setMenuState,
    toggleMobileMenu,
  }

  // Prevent hydration mismatch by rendering children only after mount or with a specific key
  return <DashboardV2Context.Provider value={value}>{children}</DashboardV2Context.Provider>
}

export const useDashboardV2 = (): DashboardContextType => {
  const context = useContext(DashboardV2Context)
  if (!context) {
    throw new Error('useDashboardV2 must be used within a DashboardProviderV2')
  }
  return context
}
