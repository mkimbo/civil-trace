'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CivilUser {
  id: string
  name?: string
  email: string
  phoneNumber?: string
  phoneVerified?: boolean
  roles?: string[]
  civicPointsBalance?: number
}

export function useUser() {
  const [user, setUser] = useState<CivilUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      window.location.href = '/'
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshUser: fetchUser,
    logout,
  }
}
