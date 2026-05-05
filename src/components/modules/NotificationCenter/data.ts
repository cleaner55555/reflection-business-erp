export const map: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-muted text-muted-foreground',
  }

export const labels: Record<string, string> = {
    urgent: t('notifications.priorityUrgent'),
    high: t('notifications.priorityHigh'),
    medium: t('notifications.priorityMedium'),
    low: t('notifications.priorityLow'),
  }

export const now = new Date();

export const date = new Date(dateStr);

export const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

export const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86400000);

export const { t } = useTranslation();

export const { setActiveModule } = useAppStore();

export const res = await fetch('/api/notifications?limit=100');

export const data = await res.json();

export const unreadCount = notifications.filter((n) => !n.isRead).length;

export const filteredNotifications = notifications.filter((n) => {
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
  });

export const grouped = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = formatRelativeDate(n.createdAt, t)
    if (!acc[group]) acc[group] = []
    acc[group].push(n)
    return acc
  }, {});

export const groupOrder = [t('common.today'), t('common.yesterday'), t('common.thisWeek'), t('dashboard.earlier')]

export const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch {
      // Silent fail
    }
  }

export const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // Silent fail
    }
  }

export const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // Silent fail
    }
  }

export const deleteAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => !n.isRead))
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
  }

export const tabs: { value: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { value: 'all', label: t('notifications.all'), icon: <Bell className="h-3.5 w-3.5" />, count: notifications.length },
    { value: 'unread', label: t('notifications.unread'), icon: <BellDot className="h-3.5 w-3.5" />, count: unreadCount },
    { value: 'overdue', label: t('notifications.overdue'), icon: <AlertTriangle className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'overdue_invoice').length },
    { value: 'low_stock', label: t('notifications.lowStock'), icon: <Package className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'low_stock').length },
    { value: 'system', label: t('notifications.system'), icon: <Info className="h-3.5 w-3.5" />, count: notifications.filter((n) => n.type === 'system').length },
  ]

export const priority = getPriorityBadge(notif.priority, t);

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

export function getPriorityBadge(priority: string, t: (key: string) => string) {
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

export function formatRelativeDate(dateStr: string, t: (key: string) => string): string {
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

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
