'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, X, Smartphone, Apple, Monitor, CheckCircle2 } from 'lucide-react'

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_FOREVER_KEY = 'pwa-install-dismissed-forever'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function getPlatformMessage(platform: 'ios' | 'android' | 'desktop') {
  switch (platform) {
    case 'ios':
      return {
        title: 'Dodaj Reflection ERP na početni ekran',
        description: 'Tapnite ikonu Deljenje u Safari, zatim "Dodaj na početni ekran".',
        action: 'Saznajte kako',
      }
    case 'android':
      return {
        title: 'Instaliraj Reflection ERP',
        description: 'Dodajte aplikaciju na početni ekran za brži pristup i rad van mreže.',
        action: 'Instaliraj',
      }
    case 'desktop':
      return {
        title: 'Instaliraj Reflection ERP',
        description: 'Instalirajte aplikaciju za desktop iskustvo bez brauzerskih elemenata.',
        action: 'Instaliraj',
      }
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [show, setShow] = useState(false)
  const [dismissedForever, setDismissedForever] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    setPlatform(detectPlatform())

    // Check standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    if (isStandalone) {
      setInstalled(true)
      return
    }

    // Check "dismissed forever"
    if (localStorage.getItem(DISMISS_FOREVER_KEY) === 'true') {
      setDismissedForever(true)
      return
    }

    // Check time-limited dismissal
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < DISMISS_DURATION) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Track install completion
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
      setDeferredPrompt(null)
      // Track install event
      try {
        localStorage.setItem('pwa-install-date', String(Date.now()))
      } catch {}
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // For iOS, show after a short delay since there's no beforeinstallprompt
  useEffect(() => {
    if (platform === 'ios' && !installed && !dismissedForever) {
      // Show after 5 seconds on iOS
      const timer = setTimeout(() => setShow(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [platform, installed, dismissedForever])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      ;(deferredPrompt as unknown as { prompt: () => void }).prompt()
      const choice = await (deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice
      setDeferredPrompt(null)
      if (choice.outcome === 'accepted') {
        setShow(false)
      }
    } else {
      // iOS: close prompt (user needs to follow manual instructions)
      setShow(false)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }, [])

  const handleDismissForever = useCallback(() => {
    setShow(false)
    setDismissedForever(true)
    localStorage.setItem(DISMISS_FOREVER_KEY, 'true')
  }, [])

  // Don't render if installed, dismissed forever, or not showing
  if (installed || dismissedForever || !show) return null

  const platformInfo = getPlatformMessage(platform)
  const isIOSManual = platform === 'ios' && !deferredPrompt

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border bg-card p-4 shadow-xl">
        {/* Platform indicator */}
        <div className="flex items-center gap-2 mb-2">
          {platform === 'ios' && <Apple className="h-3.5 w-3.5 text-muted-foreground" />}
          {platform === 'android' && <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />}
          {platform === 'desktop' && <Monitor className="h-3.5 w-3.5 text-muted-foreground" />}
          <Badge variant="secondary" className="text-[10px] h-4">
            {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'}
          </Badge>
          {deferredPrompt && (
            <Badge variant="default" className="text-[10px] h-4">
              Dostupno
            </Badge>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{platformInfo.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {platformInfo.description}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Zatvori"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={handleInstall} className="flex-1">
            {isIOSManual ? (
              <>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Razumem
              </>
            ) : (
              <>
                <Download className="mr-1 h-3.5 w-3.5" />
                {platformInfo.action}
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Kasnije
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismissForever}
            className="text-xs text-muted-foreground"
            title="Ne prikazuj više"
          >
            Nikad
          </Button>
        </div>
      </div>
    </div>
  )
}
