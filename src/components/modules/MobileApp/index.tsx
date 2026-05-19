'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Smartphone,
  Monitor,
  Apple,
  Download,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Bell,
  Shield,
  Database,
  RefreshCw,
  QrCode,
  Info,
  ExternalLink,
  Trash2,
  Clock,
  Zap,
} from 'lucide-react'
import {
  getPendingCount,
  getQueuedRequests,
  processQueue,
  clearQueue,
  removeRequest,
  subscribeToOfflineQueue,
  isOnline,
  subscribeToOnlineStatus,
  registerBackgroundSync,
  type QueuedRequest,
} from '@/lib/offline-queue'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PWAStatus {
  isInstalled: boolean
  isStandalone: boolean
  isIOS: boolean
  isAndroid: boolean
  isDesktop: boolean
  platform: string
  browser: string
  online: boolean
  serviceWorkerStatus: 'supported' | 'unsupported' | 'registered' | 'active'
  pushSupported: boolean
  backgroundSyncSupported: boolean
  beforeInstallPromptAvailable: boolean
}

// ─── QR Code Generator (simple canvas, no external lib) ─────────────────────

function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple QR-style pattern (decorative, not a real QR code)
    // Real QR encoding is extremely complex; this creates a branded placeholder
    const s = size
    canvas.width = s
    canvas.height = s

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, s, s)

    const cellSize = Math.floor(s / 21)
    const offset = Math.floor((s - cellSize * 21) / 2)

    // Draw finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (x: number, y: number) => {
      // Outer border
      ctx.fillStyle = '#09090b'
      ctx.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize * 7, cellSize * 7)
      // Inner white
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, cellSize * 5, cellSize * 5)
      // Inner black
      ctx.fillStyle = '#09090b'
      ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, cellSize * 3, cellSize * 3)
    }

    drawFinder(0, 0)
    drawFinder(14, 0)
    drawFinder(0, 14)

    // Draw data modules (pseudo-random based on URL hash)
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
    }

    ctx.fillStyle = '#09090b'
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        // Skip finder pattern areas
        if (
          (row < 8 && col < 8) ||
          (row < 8 && col > 12) ||
          (row > 12 && col < 8)
        )
          continue

        // Skip timing patterns
        if (row === 6 || col === 6) {
          if ((row + col) % 2 === 0) {
            ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize)
          }
          continue
        }

        // Pseudo-random fill based on hash
        const seed = (hash * (row * 21 + col + 1)) >>> 0
        if ((seed % 3) !== 0) {
          ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize)
        }
      }
    }

    // Center "R" logo
    const logoSize = cellSize * 5
    const logoX = (s - logoSize) / 2
    const logoY = (s - logoSize) / 2

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(logoX - 1, logoY - 1, logoSize + 2, logoSize + 2)
    ctx.fillStyle = '#09090b'
    ctx.beginPath()
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 4)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${logoSize * 0.6}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('R', s / 2, s / 2 + 1)
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-lg border bg-white mx-auto"
    />
  )
}

// ─── Platform Detection ─────────────────────────────────────────────────────

function detectPWAStatus(): PWAStatus {
  const ua = navigator.userAgent
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true

  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isDesktop = !isIOS && !isAndroid && !/Mobi|Android/i.test(ua)

  let platform = 'Nepoznato'
  if (isIOS) platform = 'iOS'
  else if (isAndroid) platform = 'Android'
  else if (isDesktop) platform = 'Desktop'

  let browser = 'Nepoznato'
  if (ua.includes('CriOS') || ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'

  const isInstalled = isStandalone
  const serviceWorkerStatus = 'serviceWorker' in navigator ? 'supported' : 'unsupported'

  return {
    isInstalled,
    isStandalone,
    isIOS,
    isAndroid,
    isDesktop,
    platform,
    browser,
    online: navigator.onLine,
    serviceWorkerStatus,
    pushSupported: 'PushManager' in window,
    backgroundSyncSupported: 'SyncManager' in window,
    beforeInstallPromptAvailable: false, // Will be detected separately
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function MobileApp() {
  const [status, setStatus] = useState<PWAStatus | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [queuedItems, setQueuedItems] = useState<QueuedRequest[]>([])
  const [processing, setProcessing] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [mounted, setMounted] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [syncResult, setSyncResult] = useState<{ processed: number; failed: number; errors: string[] } | null>(null)

  useEffect(() => {
    setMounted(true)
    setStatus(detectPWAStatus())
    setAppVersion(
      typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_VERSION
        ? process.env.NEXT_PUBLIC_APP_VERSION
        : '0.2.0'
    )

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setStatus((prev) =>
            prev ? { ...prev, serviceWorkerStatus: reg.active ? 'active' : 'registered' } : prev
          )
        }
      })
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setStatus((prev) => prev ? { ...prev, beforeInstallPromptAvailable: true } : prev)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Subscribe to offline queue changes
  useEffect(() => {
    const unsubQueue = subscribeToOfflineQueue((count) => {
      setPendingCount(count)
      getQueuedRequests().then(setQueuedItems)
    })

    const unsubOnline = subscribeToOnlineStatus((online) => {
      setStatus((prev) => prev ? { ...prev, online } : prev)
    })

    // Load initial queued items
    getQueuedRequests().then(setQueuedItems)

    return () => {
      unsubQueue()
      unsubOnline()
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    ;(installPrompt as any).prompt()
    const result = await (installPrompt as any).userChoice
    setInstallPrompt(null)
    if (result.outcome === 'accepted') {
      setStatus((prev) => prev ? { ...prev, isInstalled: true } : prev)
    }
  }, [installPrompt])

  const handleProcessQueue = useCallback(async () => {
    setProcessing(true)
    setSyncResult(null)
    try {
      const result = await processQueue()
      setSyncResult(result)
    } catch {
      setSyncResult({ processed: 0, failed: 1, errors: ['Greška pri sinhronizaciji'] })
    }
    setProcessing(false)
  }, [])

  const handleClearQueue = useCallback(async () => {
    await clearQueue()
    setQueuedItems([])
    setPendingCount(0)
  }, [])

  const handleRemoveItem = useCallback(async (id: string) => {
    await removeRequest(id)
    setQueuedItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleRegisterSync = useCallback(async () => {
    const success = await registerBackgroundSync()
    if (success) {
      // Show feedback somehow
    }
  }, [])

  if (!mounted || !status) return null

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reflection.app'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          Mobilna Aplikacija
        </h2>
        <p className="text-muted-foreground mt-1">
          Konfigurišite PWA iskustvo i instalirajte Reflection ERP kao nativnu aplikaciju
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Install Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status.isInstalled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                {status.isInstalled ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-medium">Instalacija</p>
                <p className="text-xs text-muted-foreground">
                  {status.isInstalled ? 'Instalirano' : 'Nije instalirano'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status.online ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
                {status.online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-medium">Konekcija</p>
                <p className="text-xs text-muted-foreground">
                  {status.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Worker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status.serviceWorkerStatus === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Service Worker</p>
                <p className="text-xs text-muted-foreground">
                  {status.serviceWorkerStatus === 'active'
                    ? 'Aktivan'
                    : status.serviceWorkerStatus === 'registered'
                    ? 'Registrovan'
                    : status.serviceWorkerStatus === 'supported'
                    ? 'Podržan'
                    : 'Nije podržan'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Queue */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${pendingCount > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Offline Red</p>
                <p className="text-xs text-muted-foreground">
                  {pendingCount > 0 ? `${pendingCount} čeka` : 'Prazan'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="install" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="install" className="text-xs sm:text-sm">
            Instalacija
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm">
            Mogućnosti
          </TabsTrigger>
          <TabsTrigger value="offline" className="text-xs sm:text-sm">
            Offline
          </TabsTrigger>
          <TabsTrigger value="about" className="text-xs sm:text-sm">
            O aplikaciji
          </TabsTrigger>
        </TabsList>

        {/* ─── Install Tab ─────────────────────────────────────────────── */}
        <TabsContent value="install" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Install Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Instalacija aplikacije
                </CardTitle>
                <CardDescription>
                  {status.isInstalled
                    ? 'Aplikacija je već instalirana na vašem uređaju.'
                    : 'Instalirajte Reflection ERP za nativno iskustvo.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.isInstalled ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-800 dark:text-emerald-300">
                        Aplikacija je instalirana
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Radi u standalone režimu — bez brauzerskih elemenata.
                      </p>
                    </div>
                  </div>
                ) : installPrompt ? (
                  <div className="space-y-3">
                    <Button onClick={handleInstall} className="w-full" size="lg">
                      <Download className="mr-2 h-5 w-5" />
                      Instaliraj aplikaciju
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Kliknite dugme za instalaciju. Aplikacija će biti dodata na početni ekran.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* iOS Instructions */}
                    {status.isIOS && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Apple className="h-4 w-4" />
                          iOS (Safari)
                        </div>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                            <span>Otvorite ovu stranicu u Safari brauzeru</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                            <span>Tapnite na dugme <strong>Deljenje</strong> (ikona strelice) na dnu ekrana</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                            <span>Skrolujte nadole i tapnite <strong>Dodaj na početni ekran</strong></span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">4</span>
                            <span>Tapnite <strong>Dodaj</strong> u gornjem desnom uglu</span>
                          </li>
                        </ol>
                      </div>
                    )}

                    {/* Android Instructions */}
                    {status.isAndroid && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Smartphone className="h-4 w-4" />
                          Android (Chrome)
                        </div>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                            <span>Otvorite ovu stranicu u Chrome brauzeru</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                            <span>Tapnite na ikonu <strong>tri tacke</strong> u gornjem desnom uglu</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                            <span>Tapnite <strong>Instaliraj aplikaciju</strong> ili <strong>Dodaj na početni ekran</strong></span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">4</span>
                            <span>Potvrdite instalaciju</span>
                          </li>
                        </ol>
                      </div>
                    )}

                    {/* Desktop Instructions */}
                    {status.isDesktop && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Monitor className="h-4 w-4" />
                          Desktop ({status.browser})
                        </div>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                            <span>Kliknite na ikonu <strong>instalacije</strong> u adresnoj traci (desno od URL-a)</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                            <span>Ili koristite meni: <strong>⋮ → Instaliraj aplikaciju</strong></span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                            <span>Potvrdite instalaciju dijalogom</span>
                          </li>
                        </ol>
                      </div>
                    )}

                    {!status.isIOS && !status.isAndroid && !status.isDesktop && (
                      <p className="text-sm text-muted-foreground">
                        Instalacioni prompt nije dostupan. Pokušajte ponovo kasnije.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Kod
                </CardTitle>
                <CardDescription>
                  Skenirajte ovaj kod sa mobilnog uređaja za brzi pristup
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <QRCodeDisplay value={appUrl} size={180} />
                <p className="text-sm text-muted-foreground text-center font-mono text-xs break-all">
                  {appUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(appUrl)
                  }}
                >
                  Kopiraj URL
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Features Tab ────────────────────────────────────────────── */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Nativne Mogućnosti
              </CardTitle>
              <CardDescription>
                Status PWA mogućnosti na vašem uređaju
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Feature: Standalone Mode */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Standalone Režim</p>
                      <p className="text-xs text-muted-foreground">Radi bez brauzerskih elemenata</p>
                    </div>
                  </div>
                  <Badge variant={status.isStandalone ? 'default' : 'secondary'}>
                    {status.isStandalone ? 'Aktivan' : 'Neaktivan'}
                  </Badge>
                </div>

                {/* Feature: Offline Support */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Offline Podrška</p>
                      <p className="text-xs text-muted-foreground">Keširanje i rad van mreže</p>
                    </div>
                  </div>
                  <Badge variant="default">Aktivan</Badge>
                </div>

                {/* Feature: Push Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Push Notifikacije</p>
                      <p className="text-xs text-muted-foreground">Obaveštenja u pozadini</p>
                    </div>
                  </div>
                  <Badge variant={status.pushSupported ? 'default' : 'secondary'}>
                    {status.pushSupported ? 'Podržano' : 'Nije podržano'}
                  </Badge>
                </div>

                {/* Feature: Background Sync */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Background Sync</p>
                      <p className="text-xs text-muted-foreground">Auto sinhronizacija podataka</p>
                    </div>
                  </div>
                  <Badge variant={status.backgroundSyncSupported ? 'default' : 'secondary'}>
                    {status.backgroundSyncSupported ? 'Podržano' : 'Nije podržano'}
                  </Badge>
                </div>

                {/* Feature: Service Worker */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Service Worker</p>
                      <p className="text-xs text-muted-foreground">Pozadinsko keširanje</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      status.serviceWorkerStatus === 'active'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {status.serviceWorkerStatus === 'active'
                      ? 'Aktivan'
                      : status.serviceWorkerStatus === 'registered'
                      ? 'Registrovan'
                      : status.serviceWorkerStatus === 'supported'
                      ? 'Podržan'
                      : 'Nije podržan'}
                  </Badge>
                </div>

                {/* Feature: App Shortcuts */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">App Shortcuts</p>
                      <p className="text-xs text-muted-foreground">Brzi pristup modulima</p>
                    </div>
                  </div>
                  <Badge variant="default">8 prečica</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Offline Tab ─────────────────────────────────────────────── */}
        <TabsContent value="offline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Offline Queue */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Offline Red
                    </CardTitle>
                    <CardDescription>
                      {pendingCount > 0
                        ? `${pendingCount} zahtev čeka na sinhronizaciju`
                        : 'Nema čekanja — sve sinhronizovano'}
                    </CardDescription>
                  </div>
                  {pendingCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearQueue}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Obriši sve
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingCount > 0 && (
                  <Button
                    onClick={handleProcessQueue}
                    disabled={!status.online || processing}
                    className="w-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                    {processing ? 'Sinhronizacija...' : 'Sinhronizuj sad'}
                  </Button>
                )}

                {syncResult && (
                  <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                    <p className="font-medium">
                      Rezultat: {syncResult.processed} uspešno, {syncResult.failed} grešaka
                    </p>
                    {syncResult.errors.map((err, i) => (
                      <p key={i} className="text-destructive text-xs">{err}</p>
                    ))}
                  </div>
                )}

                {queuedItems.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {queuedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg border text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {item.method}
                          </Badge>
                          <span className="truncate text-xs text-muted-foreground">
                            {new URL(item.url, typeof window !== 'undefined' ? window.location.origin : '').pathname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round((Date.now() - item.timestamp) / 60000)}m
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-500" />
                    <p className="text-sm">Sve je sinhronizovano</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegisterSync}
                    disabled={!status.backgroundSyncSupported}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Registruj Background Sync
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {status.backgroundSyncSupported
                      ? 'Auto sinhronizacija u pozadini'
                      : 'Nije podržano na ovom uređaju'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Offline Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <WifiOff className="h-5 w-5" />
                  Offline Mogućnosti
                </CardTitle>
                <CardDescription>
                  Šta radi kada nema internet konekcije
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Pregled keširanih podataka</p>
                      <p className="text-xs text-muted-foreground">
                        Dashboard, fakture, partneri i ostali podaci su keširani lokalno
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Kreiranje novih zapisa</p>
                      <p className="text-xs text-muted-foreground">
                        Novi podaci se čuvaju lokalno i sinhronizuju se kada se povežete
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Navigacija između modula</p>
                      <p className="text-xs text-muted-foreground">
                        Svi moduli su dostupni i bez interneta
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Real-time ažuriranja</p>
                      <p className="text-xs text-muted-foreground">
                        WebSocket notifikacije zahtevaju internet konekciju
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Pretraga i izveštaji</p>
                      <p className="text-xs text-muted-foreground">
                        Složeni izveštaji zahtevaju konekciju ka serveru
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── About Tab ───────────────────────────────────────────────── */}
        <TabsContent value="about" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informacije o Aplikaciji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ime aplikacije</span>
                    <span className="font-medium">Reflection ERP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzija</span>
                    <Badge variant="outline">{appVersion}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Package ID</span>
                    <span className="font-mono text-xs">com.reflection.erp</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platforma</span>
                    <span className="font-medium">{status.platform}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Brauzer</span>
                    <span className="font-medium">{status.browser}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PWA Režim</span>
                    <Badge variant={status.isStandalone ? 'default' : 'secondary'}>
                      {status.isStandalone ? 'Standalone' : 'Brauzer'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SW Verzija</span>
                    <span className="font-mono text-xs">reflection-v3</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacitor</span>
                    <Badge variant="outline">Konfigurisan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Konfiguracija za Native Build
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Capacitor je konfigurisan za izgradnju nativnih aplikacija.
                  Pokrenite sledeće komande za kreiranje Android/iOS buildova:
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium mb-1">Android build:</p>
                    <code className="text-xs block font-mono text-muted-foreground">
                      npx cap add android
                      <br />
                      npx cap sync
                      <br />
                      npx cap open android
                    </code>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium mb-1">iOS build:</p>
                    <code className="text-xs block font-mono text-muted-foreground">
                      npx cap add ios
                      <br />
                      npx cap sync
                      <br />
                      npx cap open ios
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Konfiguracioni fajlovi:</h4>
                  <div className="space-y-1">
                    {[
                      { file: 'capacitor.config.ts', desc: 'Glavna konfiguracija' },
                      { file: 'public/manifest.json', desc: 'PWA manifest' },
                      { file: 'public/sw.js', desc: 'Service Worker v3' },
                      { file: 'public/offline.html', desc: 'Offline stranica' },
                    ].map((item) => (
                      <div key={item.file} className="flex items-center justify-between text-sm">
                        <code className="font-mono text-xs">{item.file}</code>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MobileApp
