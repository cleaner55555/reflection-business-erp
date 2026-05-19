'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { useAppStore, type ModuleType } from '@/lib/store'
import { useRealtime } from '@/hooks/useRealtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  BellDot,
  AlertTriangle,
  Package,
  FileText,
  Check,
  Trash2,
  X,
  Clock,
  Info,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  entityType?: string | null
  entityId?: string | null
  isRead: boolean
  priority: string
  actionUrl?: string | null
  createdAt: string
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'overdue_invoice':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'low_stock':
      return <Package className="h-4 w-4 text-amber-500" />
    case 'due_today':
      return <Clock className="h-4 w-4 text-orange-500" />
    case 'payment_received':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'task_due':
      return <FileText className="h-4 w-4 text-blue-500" />
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-muted'
    default:
      return 'bg-muted'
  }
}

function formatTimeAgo(dateStr: string, t: (key: string) => string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return t('notifications.justNow')
  if (diffMin < 60) return `${diffMin} ${t('notifications.minutesAgo')}`
  if (diffH < 24) return `${diffH} ${t('notifications.hoursAgo')}`
  if (diffD === 1) return t('common.yesterday')
  if (diffD < 7) return `${diffD} ${t('notifications.daysAgo')}`
  return date.toLocaleDateString('sr-RS')
}

// Sound effect for new notifications (using Web Audio API)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

// Request browser notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// Show browser push notification
function showBrowserNotification(title: string, body: string, url?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-72.svg',
      tag: 'reflection-notification',
      data: { url: url || '/' },
    })
  }
}

export function NotificationBell() {
  const { t } = useTranslation()
  const { setActiveModule, currentUser, activeCompanyId } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pulseNew, setPulseNew] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const prevUnreadRef = useRef(0)

  // WebSocket for real-time notifications
  const { connected: realtimeConnected, on, off } = useRealtime({
    companyId: activeCompanyId || undefined,
    userId: currentUser?.id || undefined,
  })

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        prevUnreadRef.current = data.unreadCount || 0
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // WebSocket: listen for real-time notifications
  useEffect(() => {
    if (!realtimeConnected) return

    const handleNotification = (data: Notification) => {
      // Add to top of list
      setNotifications(prev => [data, ...prev].slice(0, 20))
      if (!data.isRead) {
        setUnreadCount(prev => prev + 1)
        // Visual pulse
        setPulseNew(true)
        setTimeout(() => setPulseNew(false), 600)
        // Sound
        playNotificationSound()
        // Browser push notification
        showBrowserNotification(data.title, data.message, data.actionUrl || undefined)
      }
    }

    const handleNotificationRead = (data: { id: string }) => {
      setNotifications(prev => prev.map(n => n.id === data.id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleNotificationDeleted = (data: { id: string }) => {
      setNotifications(prev => {
        const n = prev.find(x => x.id === data.id)
        if (n && !n.isRead) setUnreadCount(c => Math.max(0, c - 1))
        return prev.filter(x => x.id !== data.id)
      })
    }

    const handleCountUpdate = (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount)
    }

    on('notification', handleNotification)
    on('notification:read', handleNotificationRead)
    on('notification:deleted', handleNotificationDeleted)
    on('notification:count', handleCountUpdate)

    return () => {
      off('notification', handleNotification)
      off('notification:read', handleNotificationRead)
      off('notification:deleted', handleNotificationDeleted)
      off('notification:count', handleCountUpdate)
    }
  }, [realtimeConnected, on, off])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Silent fail
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // Silent fail
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications((prev) => {
        const n = prev.find((x) => x.id === id)
        if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1))
        return prev.filter((x) => x.id !== id)
      })
    } catch {
      // Silent fail
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }
    if (notif.actionUrl) {
      setActiveModule(notif.actionUrl as ModuleType)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('notifications.title')}
      >
        {unreadCount > 0 ? (
          <motion.div
            animate={pulseNew ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <BellDot className="h-4 w-4" />
          </motion.div>
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Real-time connection indicator (tiny dot) */}
      <div
        className={`absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full border border-background transition-colors ${
          realtimeConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        }`}
        title={realtimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-lg border bg-popover shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">
                  {t('notifications.title')}
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Real-time status */}
                <div className="flex items-center gap-1 mr-1 text-[10px] text-muted-foreground">
                  {realtimeConnected ? (
                    <Wifi className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={markAllRead}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {t('notifications.markAllRead')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Notification list */}
            <ScrollArea className="max-h-80">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={notif.isRead ? {} : { backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
                      transition={{ duration: 2 }}
                      className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer ${
                        !notif.isRead ? 'bg-accent/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {/* Priority indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${getPriorityColor(notif.priority)}`} />

                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!notif.isRead && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <p className={`text-sm font-medium truncate ${!notif.isRead ? '' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatTimeAgo(notif.createdAt, t)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.isRead && (
                          <button
                            className="p-1 rounded hover:bg-muted"
                            onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                            title={t('notifications.markRead')}
                          >
                            <Check className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          className="p-1 rounded hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2">
                  <button
                    className="text-xs text-center w-full text-primary hover:underline"
                    onClick={() => {
                      setActiveModule('notifications')
                      setIsOpen(false)
                    }}
                  >
                    {t('notifications.viewAll')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
