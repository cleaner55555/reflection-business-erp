'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/helpers'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('pwa_install_dismissed')
      if (wasDismissed) {
        const dismissTime = parseInt(wasDismissed, 10)
        // Show again after 7 days
        if (Date.now() - dismissTime < 7 * 24 * 60 * 60 * 1000) {
          setDismissed(true)
          return
        }
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after a short delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', String(Date.now()))
  }

  if (!showPrompt || dismissed || !deferredPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-xl border bg-background shadow-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Instaliraj aplikaciju</p>
              <p className="text-xs text-muted-foreground">
                Pristupajte brže sa ikone na početnom ekranu
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5" />
          <span>Radi offline · Brže učitavanje · Native osećaj</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleInstall}
          >
            <Download className="h-3.5 w-3.5" />
            Instaliraj
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
          >
            Kasnije
          </Button>
        </div>
      </div>
    </div>
  )
}
