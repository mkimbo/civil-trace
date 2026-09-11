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
  isAuthReady: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [menuState, setMenuState] = useState<MenuState>('full')
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(true)

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
      if (!isDesktop) {
        setMenuState('collapsed')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        menuState,
        isMobile,
        isMobileMenuOpen,
        toggleMenuState,
        setMenuState,
        toggleMobileMenu,
        isAuthReady,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}