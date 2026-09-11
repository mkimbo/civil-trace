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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [menuState, setMenuState] = useState<MenuState>('full')
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [previousDesktopState, setPreviousDesktopState] = useState<MenuState>('full')

  const toggleMenuState = useCallback(() => {
    setMenuState((prev) => (prev === 'full' ? 'collapsed' : 'full'))
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024
      setIsMobile(!isDesktop)

      if (!isDesktop && menuState !== 'hidden') {
        setPreviousDesktopState(menuState)
        setMenuState('hidden')
      } else if (isDesktop && menuState === 'hidden') {
        setMenuState(previousDesktopState)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [menuState, previousDesktopState])

  const value = {
    menuState,
    isMobile,
    isMobileMenuOpen,
    toggleMenuState,
    setMenuState,
    toggleMobileMenu,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
