'use client'

import { createContext, ReactNode, TransitionStartFunction, useContext, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface CustomNavigationContextType {
  isPending: boolean
  isGlobalPending: boolean
  // A function that accepts the new search params and handles the transition
  handleNavigation: (params: URLSearchParams) => void
  startGlobalTransition: TransitionStartFunction
  startTransition: TransitionStartFunction
  navigate: (href: string) => void
  back: () => void
}

const CustomNavigationContext = createContext<CustomNavigationContextType | undefined>(undefined)

export const CustomNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isPending, startTransition] = useTransition() // For local params (search, etc)
  const [isGlobalPending, startGlobalTransition] = useTransition() // For global page navigation
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (params: URLSearchParams) => {
    startTransition(() => {
      // Use router.replace to avoid cluttering browser history with minor date changes
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const navigate = (href: string) => {
    startGlobalTransition(() => {
      router.push(href)
    })
  }

  const back = () => {
    startGlobalTransition(() => {
      router.back()
    })
  }

  return (
    <CustomNavigationContext.Provider
      value={{
        isPending,
        isGlobalPending,
        handleNavigation,
        navigate,
        back,
        startGlobalTransition,
        startTransition,
      }}
    >
      {children}
    </CustomNavigationContext.Provider>
  )
}

// A custom hook for easy consumption
export const useCustomNavigation = (): CustomNavigationContextType => {
  const context = useContext(CustomNavigationContext)
  if (!context) {
    throw new Error('useCustomNavigation must be used within a CustomNavigationProvider')
  }
  return context
}
