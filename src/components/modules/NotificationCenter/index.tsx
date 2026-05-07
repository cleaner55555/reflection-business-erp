'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Bell,
  BellDot,
  AlertTriangle,
  Package,
  FileText,
  Check,
  Trash2,
  Clock,
  Info,
  CheckCircle2,
  Inbox,
  Filter,
  BellRing,
} from 'lucide-react'
import type { Notification } from '@/components/modules/NotificationBell'

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

function getPriorityBadge(priority: string, t: (key: string) => string) {
  const map: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-muted text-muted-foreground',
  }
  const labels: Record<string, string> = {
    urgent: t('notifications.priorityUrgent'),
    high: t('notifications.priorityHigh'),
    medium: t('notifications.priorityMedium'),
    low: t('notifications.priorityLow'),
  }
  return { className: map[priority] || map.low, label: labels[priority] || priority }
}

function formatRelativeDate(dateStr: string, t: (key: string) => string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000)
  const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86400000)

  if (date >= startOfToday) return t('common.today')
  if (date >= startOfYesterday) return t('common.yesterday')
  if (date >= startOfWeek) return t('common.thisWeek')
  return t('dashboard.earlier')
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type FilterTab = 'all' | 'unread' | 'overdue' | 'low_stock' | 'system'

export function NotificationCenter() {
  const { t } = useTranslation()
  const { setActiveModule } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=100')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
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

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((n) => {
    switch (activeTab) {
      case 'unread':
        return !n.isRead
      case 'overdue':
        return n.type === 'overdue_invoice'
      case 'low_stock':
        return n.type === 'low_stock'
      case 'system':
        return n.type === 'system'
      default:
        return true
    }
  })

  // Group by date
  const grouped = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = formatRelativeDate(n.createdAt, t)
    if (!acc[group]) acc[group] = []
    acc[group].push(n)
    return acc
  }, {})

  const groupOrder = [t('common.today'), t('common.yesterday'), t('common.thisWeek'), t('dashboard.earlier')]

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch {
      // Silent fail
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // Silent fail
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // Silent fail
    }
  }

  const deleteAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => !n.isRead))
    } catch {
      // Silent fail
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }
    if (notif.actionUrl) {
      setActiveModule(notif.actionUrl as 'fakture' | 'magacin' | 'partneri' | 'dashboard' | 'crm')
    }
  }

  const tabs: { value: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { value: 'all', label: t('notifications.all'), icon: <Bell className="h-3.5 w-3.5" />, count: notifications.length },
    { value: 'unread', label: t('notifications.unread'), icon: <BellDot className="h-3.5 w-3.5" />, count: unreadCount },
    { value: 'overdue', label: t('notifications.overdue'), icon: <AlertTriangle className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'overdue_invoice').length },
    { value: 'low_stock', label: t('notifications.lowStock'), icon: <Package className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'low_stock').length },
    { value: 'system', label: t('notifications.system'), icon: <Info className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'system').length },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BellRing className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('notifications.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} ${t('notifications.unreadNotifications')}`
                : t('notifications.allCaughtUp')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="h-8 text-xs">
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {t('notifications.markAllRead')}
            </Button>
          )}
          {notifications.some((n) => n.isRead) && (
            <Button variant="outline" size="sm" onClick={deleteAllRead} className="h-8 text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {t('notifications.deleteRead')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchNotifications} className="h-8 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList className="w-full sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 px-3">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-4">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All tab content */}
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">{t('notifications.noNotifications')}</p>
                  <p className="text-xs mt-1 opacity-70">{t('notifications.noNotificationsDesc')}</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  {groupOrder
                    .filter((g) => grouped[g] && grouped[g].length > 0)
                    .map((group) => (
                      <div key={group}>
                        <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-2 border-b">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {group}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({grouped[group].length})
                          </span>
                        </div>
                        {grouped[group].map((notif) => {
                          const priority = getPriorityBadge(notif.priority, t)
                          return (
                            <div
                              key={notif.id}
                              className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer ${
                                !notif.isRead ? 'bg-accent/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {!notif.isRead && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  )}
                                  <span className={`text-sm font-medium ${!notif.isRead ? '' : 'text-muted-foreground'}`}>
                                    {notif.title}
                                  </span>
                                  <Badge className={`text-[10px] px-1.5 py-0 h-4 ${priority.className}`}>
                                    {priority.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                  {formatFullDate(notif.createdAt)}
                                </p>
                              </div>

                              <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.isRead && (
                                  <button
                                    className="p-1.5 rounded-md hover:bg-muted"
                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                                    title={t('notifications.markRead')}
                                  >
                                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                )}
                                <button
                                  className="p-1.5 rounded-md hover:bg-destructive/10"
                                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                                  title={t('common.delete')}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
