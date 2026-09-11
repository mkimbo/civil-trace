'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Optional: Listen for background sync or updates
          })
          .catch((err) => {
            console.warn('CivilTrace Service Worker registration failed:', err)
          })
      })
    }
  }, [])

  return null
}