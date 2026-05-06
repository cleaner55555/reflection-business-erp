import { useState, useEffect, useCallback, useMemo } from 'react'

export function useCalendar() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // Data
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('month')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterColor, setFilterColor] = useState('all')

  // Dialogs
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Form
  const emptyForm = { title: '', description: '', startTime: '', endTime: '', allDay: false, color: 'primary', type: 'sastanak', location: '', attendees: '', reminder: '15', recurrence: 'none', priority: 'medium' }
  const [eventForm, setEventForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // ============ DATA LOADING ============

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/calendar?month=${month + 1}&year=${year}`)
      if (res.ok) setEvents(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [month, year])

  useEffect(() => { loadEvents() }, [loadEvents])

  // ============ FILTERED EVENTS ============

  const filteredEvents = useMemo(() => {
    let result = [...events]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q))
    }
    if (filterType !== 'all') result = result.filter(e => e.type === filterType)
    if (filterColor !== 'all') result = result.filter(e => e.color === filterColor)
    return result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [events, searchQuery, filterType, filterColor])

  const todayEvents = useMemo(() => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return events.filter(e => e.startTime.startsWith(dateStr)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [events])

  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return events.filter(e => new Date(e.startTime).getTime() > now).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 10)
  }, [events])

  // ============ CALENDAR HELPERS ============

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }
  const goToday = () => setCurrentDate(new Date())

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredEvents.filter(e => e.startTime.startsWith(dateStr))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  // Week view helpers
  const getWeekDays = useMemo(() => {
    const start = new Date(currentDate)
    const dayOfWeek = start.getDay() - 1
    if (dayOfWeek < 0) start.setDate(start.getDate() - 6)
    else start.setDate(start.getDate() - dayOfWeek)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentDate])

  const getEventsForWeekDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredEvents.filter(e => e.startTime.startsWith(dateStr))
  }

  // ============ ACTIONS ============

  const openNewEvent = (date?: Date) => {
    setEditingEvent(null)
    const startStr = date ? `${date.toISOString().slice(0, 10)}T09:00` : `${new Date().toISOString().slice(0, 10)}T${new Date().toTimeString().slice(0, 5)}`
    setEventForm({ ...emptyForm, startTime: startStr, endTime: '' })
    setEventDialogOpen(true)
  }

  const openEditEvent = (ev: CalEvent) => {
    setEditingEvent(ev)
    setEventForm({
      title: ev.title || '', description: ev.description || '',
      startTime: ev.startTime?.slice(0, 16) || '', endTime: ev.endTime?.slice(0, 16) || '',
      allDay: ev.allDay || false, color: ev.color || 'primary', type: ev.type || 'sastanak',
      location: ev.location || '', attendees: ev.attendees || '',
      reminder: ev.reminder || '15', recurrence: ev.recurrence || 'none', priority: ev.priority || 'medium',
    })
    setEventDialogOpen(true)
  }

  const handleSubmitEvent = async () => {
    if (!eventForm.title.trim()) { showToast('Naslov je obavezan'); return }
    setSubmitting(true)
    try {
      const body = {
        title: eventForm.title, description: eventForm.description || null,
        startTime: eventForm.startTime, endTime: eventForm.endTime || null,
        allDay: eventForm.allDay, color: eventForm.color, type: eventForm.type,
        location: eventForm.location || null, attendees: eventForm.attendees || null,
        reminder: eventForm.reminder, recurrence: eventForm.recurrence, priority: eventForm.priority,
      }
      const url = editingEvent ? `/api/calendar/${editingEvent.id}` : '/api/calendar'
      const res = await fetch(url, { method: editingEvent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setEventDialogOpen(false); loadEvents(); showToast(editingEvent ? 'Događaj ažuriran' : 'Događaj kreiran') }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    try { await fetch(`/api/calendar/${selectedEvent.id}`, { method: 'DELETE' }); setDeleteConfirmOpen(false); setSelectedEvent(null); loadEvents(); showToast('Događaj obrisan') }
    catch { showToast('Greška') }
  }

  // ============ KPI ============

  const Kpi = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color?: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  )

  // ============ STATS ============

  const stats = useMemo(() => {
    const total = events.length
    const today = todayEvents.length
    const upcoming = events.filter(e => new Date(e.startTime).getTime() > Date.now()).length
    const meetings = events.filter(e => e.type === 'sastanak').length
    const deadlines = events.filter(e => e.type === 'rok').length
    const tasks = events.filter(e => e.type === 'task').length
    const withReminder = events.filter(e => e.reminder && e.reminder !== 'none').length
    const recurring = events.filter(e => e.recurrence && e.recurrence !== 'none').length

    const byType: Record<string, number> = {}
    events.forEach(e => { byType[e.type || 'ostalo'] = (byType[e.type || 'ostalo'] || 0) + 1 })

    const byColor: Record<string, number> = {}
    events.forEach(e => { byColor[e.color || 'primary'] = (byColor[e.color || 'primary'] || 0) + 1 })

    return { total, today, upcoming, meetings, deadlines, tasks, withReminder, recurring, byType, byColor }
  }, [events, todayEvents])

  // ============ RENDER ============

  return {
    activeTab,
    c,
    dayEvents,
    days,
    deleteConfirmOpen,
    editingEvent,
    eventDetailOpen,
    eventDialogOpen,
    filterColor,
    filterType,
    filteredEvents,
    getWeekDays,
    goToday,
    handleDeleteEvent,
    handleSubmitEvent,
    info,
    isSelected,
    isTodayDate,
    k,
    loadEvents,
    loading,
    nextMonth,
    nextWeek,
    past,
    prevMonth,
    prevWeek,
    searchQuery,
    selectedEvent,
    setActiveTab,
    setDeleteConfirmOpen,
    setEventDetailOpen,
    setEventDialogOpen,
    setFilterColor,
    setFilterType,
    submitting,
    toastMsg,
    todayEvents,
    type,
    upcoming,
    upcomingEvents,
  }
}
