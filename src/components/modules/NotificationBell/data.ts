export const now = new Date();

export const date = new Date(dateStr);

export const diffMs = now.getTime() - date.getTime();

export const diffMin = Math.floor(diffMs / 60000);

export const diffH = Math.floor(diffMs / 3600000);

export const diffD = Math.floor(diffMs / 86400000);

export const { t } = useTranslation();

export const { setActiveModule } = useAppStore();

export const res = await fetch('/api/notifications?limit=10');

export const data = await res.json();

export const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

export const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

export const markAsRead = async (id: string) => {
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

export const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // Silent fail
    }
  }

export const deleteNotification = async (id: string) => {
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

export const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }
    if (notif.actionUrl) {
      setActiveModule(notif.actionUrl as 'fakture' | 'magacin' | 'partneri' | 'dashboard' | 'crm')
    }
    setIsOpen(false)
  }

export function getNotificationIcon(type: string) {
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

export function getPriorityColor(priority: string) {
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

export function formatTimeAgo(dateStr: string, t: (key: string) => string): string {
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
