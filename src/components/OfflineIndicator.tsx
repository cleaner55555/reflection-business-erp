'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const handleOnline = () => {
      setIsOffline(false)
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
        isOffline
          ? 'bg-amber-500 text-white'
          : 'bg-emerald-500 text-white'
      }`}
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Niste povezani sa internetom. Neke funkcije možda neće raditi.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>Povezani ste sa internetom</span>
        </>
      )}
    </div>
  )
}
