export type FilterTab = 'all' | 'unread' | 'overdue' | 'low_stock' | 'system'

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

  const tabs: { value: FilterTab;
