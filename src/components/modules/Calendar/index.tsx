'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Dialog removed - converted to inline Card
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus, ChevronLeft, ChevronRight, CalendarDays, ArrowLeft,
  RefreshCw, Search, Eye, Trash2, Edit3, Clock, MapPin,
  Users, Bell, BellOff, CheckCircle2, AlertTriangle, X,
  Calendar as CalendarIcon, List, Grid3X3, LayoutGrid, Copy, Star, Filter,
  MoreVertical, ChevronDown, Tag, Circle, Timer, Repeat,
  Cake, Briefcase, GraduationCap, Plane, Heart, Music,
  Coffee, Dumbbell, ShoppingBag, Utensils, Car, Stethoscope,
  Home, Palette, Zap, Globe, Sun, Moon, BarChart3
} from 'lucide-react'

// ============ TYPES ============

interface CalEvent {
  id: string; title: string; description: string | null; startTime: string; endTime: string | null
  allDay: boolean; color: string; type: string; createdAt: string
  location?: string | null; attendees?: string; reminder?: string | null
  recurrence?: string | null; priority?: string
}

// ============ CONSTANTS ============

const COLORS: Record<string, string> = {
  primary: 'bg-primary/15 border-primary/30 text-primary',
  red: 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  green: 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  blue: 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  orange: 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  purple: 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pink: 'bg-pink-100 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  teal: 'bg-teal-100 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const COLOR_DOTS: Record<string, string> = {
  primary: 'bg-primary', red: 'bg-red-500', green: 'bg-emerald-500', blue: 'bg-blue-500',
  orange: 'bg-amber-500', purple: 'bg-purple-500', pink: 'bg-pink-500', teal: 'bg-teal-500',
}

const MONTHS_SR = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
const DAYS_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
const DAYS_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja']

const EVENT_TYPES = [
  { value: 'sastanak', label: 'Sastanak', icon: Users },
  { value: 'rok', label: 'Rok / Deadline', icon: Timer },
  { value: 'task', label: 'Zadatak', icon: CheckCircle2 },
  { value: 'podsetnik', label: 'Podsetnik', icon: Bell },
  { value: 'rođendan', label: 'Rođendan', icon: Cake },
  { value: 'putovanje', label: 'Putovanje', icon: Plane },
  { value: 'obuka', label: 'Obuka / Edukacija', icon: GraduationCap },
  { value: 'licni', label: 'Lično', icon: Heart },
  { value: 'ostalo', label: 'Ostalo', icon: CalendarIcon },
]

const REMINDER_OPTIONS = [
  { value: 'none', label: 'Bez podsetnika' },
  { value: '0', label: 'U trenutku' },
  { value: '5', label: '5 min pre' },
  { value: '15', label: '15 min pre' },
  { value: '30', label: '30 min pre' },
  { value: '60', label: '1 sat pre' },
  { value: '1440', label: '1 dan pre' },
  { value: '10080', label: '1 nedelja pre' },
]

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Bez ponavljanja' },
  { value: 'daily', label: 'Dnevno' },
  { value: 'weekly', label: 'Nedeljno' },
  { value: 'biweekly', label: 'Dvonedeljno' },
  { value: 'monthly', label: 'Mesečno' },
  { value: 'yearly', label: 'Godišnje' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Nizak', color: 'text-green-500' },
  { value: 'medium', label: 'Srednji', color: 'text-amber-500' },
  { value: 'high', label: 'Visok', color: 'text-orange-500' },
  { value: 'urgent', label: 'Hitno', color: 'text-red-500' },
]

// ============ HELPERS ============

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

const formatDateShort = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })
}

const formatDateFull = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const getEventDuration = (start: string, end: string | null): string => {
  if (!end) return ''
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms <= 0) return ''
  const hours = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

const isEventUpcoming = (start: string): boolean => {
  const now = Date.now()
  const startMs = new Date(start).getTime()
  return startMs > now && startMs - now < 24 * 60 * 60 * 1000
}

const isEventPast = (end: string | null, start: string): boolean => {
  const endMs = end ? new Date(end).getTime() : new Date(start).getTime() + 3600000
  return endMs < Date.now()
}

// ============ MAIN COMPONENT ============

export function Calendar() {
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

  // Sub-tabs
  const [eventSubTab, setEventSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)

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
    setActiveTab('list'); setEventSubTab('dodaj')
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
    setActiveTab('list'); setEventSubTab('dodaj')
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
      if (res.ok) { setEventSubTab('pregled'); setEditingEvent(null); loadEvents(); showToast(editingEvent ? 'Događaj ažuriran' : 'Događaj kreiran') }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    try { await fetch(`/api/calendar/${selectedEvent.id}`, { method: 'DELETE' }); setSelectedEvent(null); loadEvents(); showToast('Događaj obrisan') }
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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" /> Kalendar</h1>
          <p className="text-sm text-muted-foreground">Upravljanje događajima, sastancima i rokovima</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={goToday}><Sun className="h-4 w-4 mr-1" /> Danas</Button>
          <Button size="sm" onClick={() => openNewEvent()}><Plus className="h-4 w-4 mr-1" /> Novi događaj</Button>
          <Button variant="outline" size="sm" onClick={loadEvents}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month"><LayoutGrid className="h-4 w-4 mr-1 hidden sm:inline" /> Mesec</TabsTrigger>
          <TabsTrigger value="week"><Grid3X3 className="h-4 w-4 mr-1 hidden sm:inline" /> Nedelja</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-1 hidden sm:inline" /> Lista</TabsTrigger>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
        </TabsList>

        {/* ===== MONTH VIEW ===== */}
        <TabsContent value="month" className="space-y-4">
          {/* Navigation */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <h3 className="text-lg font-semibold min-w-[200px] text-center">{MONTHS_SR[month]} {year}</h3>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Tip" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Calendar Grid */}
          {loading ? <Skeleton className="h-[600px] w-full" /> : (
            <Card>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {DAYS_SR.map((d, i) => (
                  <div key={d} className={`bg-muted p-2 text-center text-xs font-medium ${i >= 5 ? 'text-amber-600' : ''}`}>{d}</div>
                ))}
                {days.map((day, idx) => {
                  if (day === null) return <div key={`e-${idx}`} className="bg-background min-h-[100px] p-1" />
                  const dayEvents = getEventsForDay(day)
                  const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month && selectedDay?.getFullYear() === year
                  return (
                    <div key={day} className={`bg-background min-h-[100px] p-1 cursor-pointer hover:bg-muted/30 transition-colors ${isToday(day) ? 'ring-2 ring-primary/30 bg-primary/5' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                      onClick={() => setSelectedDay(new Date(year, month, day))}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-medium ${isToday(day) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : 'text-muted-foreground'}`}>{day}</span>
                        {dayEvents.length > 0 && <span className="text-xs text-muted-foreground">{dayEvents.length}</span>}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => {
                          const typeInfo = EVENT_TYPES.find(t => t.value === ev.type)
                          const Icon = typeInfo?.icon || CalendarIcon
                          return (
                            <button key={ev.id} className={`w-full text-left text-xs px-1 py-0.5 rounded border truncate flex items-center gap-0.5 ${COLORS[ev.color] || COLORS.primary}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setActiveTab('list'); setEventSubTab('detalji') }}>
                              <Icon className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{ev.title}</span>
                            </button>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <button className="w-full text-left text-xs px-1 py-0.5 text-muted-foreground hover:bg-muted/50 rounded" onClick={(e) => { e.stopPropagation(); setSelectedDay(new Date(year, month, day)); setActiveTab('list') }}>
                            +{dayEvents.length - 3} više...
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ===== WEEK VIEW ===== */}
        <TabsContent value="week" className="space-y-4">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                <h3 className="text-sm font-semibold">
                  {getWeekDays[0].toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })} — {getWeekDays[6].toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Button variant="ghost" size="sm" onClick={goToday}>Danas</Button>
            </div>
          </Card>

          <Card>
            <div className="divide-y">
              {getWeekDays.map((date, i) => {
                const dayEvents = getEventsForWeekDay(date)
                const isTodayDate = date.toDateString() === new Date().toDateString()
                return (
                  <div key={i} className={`p-3 ${isTodayDate ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${isTodayDate ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <span className="text-xs uppercase">{DAYS_SR[i]}</span>
                        <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">{date.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openNewEvent(date)}><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Nema događaja</p>
                    ) : (
                      <div className="space-y-1">
                        {dayEvents.map(ev => (
                          <button key={ev.id} className={`w-full text-left p-2 rounded border flex items-center gap-2 hover:shadow-sm transition-shadow ${COLORS[ev.color] || COLORS.primary}`}
                            onClick={() => { setSelectedEvent(ev); setActiveTab('list'); setEventSubTab('detalji') }}>
                            <Circle className={`h-2 w-2 fill-current ${COLOR_DOTS[ev.color] || 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{ev.title}</p>
                              <p className="text-xs opacity-70">{ev.allDay ? 'Ceo dan' : `${formatTime(ev.startTime)}${ev.endTime ? ` — ${formatTime(ev.endTime)}` : ''}${ev.location ? ` · ${ev.location}` : ''}`}</p>
                            </div>
                            {ev.type && <Badge variant="outline" className="text-xs shrink-0">{EVENT_TYPES.find(t => t.value === ev.type)?.label || ev.type}</Badge>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ===== LIST VIEW ===== */}
        <TabsContent value="list" className="space-y-4">
          <Tabs value={eventSubTab} onValueChange={v => setEventSubTab(v as 'pregled' | 'dodaj' | 'detalji')}>
            <TabsList>
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              {(editingEvent || eventSubTab === 'dodaj') && <TabsTrigger value="dodaj">{editingEvent ? 'Uredi' : 'Dodaj'}</TabsTrigger>}
              {(selectedEvent || eventSubTab === 'detalji') && <TabsTrigger value="detalji">Detalji</TabsTrigger>}
            </TabsList>
            <TabsContent value="pregled" className="mt-4">

          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži događaje..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tip" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterColor} onValueChange={setFilterColor}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Boja" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve boje</SelectItem>
                  {Object.keys(COLORS).map(c => <SelectItem key={c} value={c}>{c === 'primary' ? 'Plava' : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">{filteredEvents.length} događaja</p>

          {loading ? <Skeleton className="h-[400px] w-full" /> : filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema događaja</p>
              <Button className="mt-3" onClick={() => openNewEvent()}><Plus className="h-4 w-4 mr-1" /> Dodaj događaj</Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map(ev => {
                const typeInfo = EVENT_TYPES.find(t => t.value === ev.type)
                const Icon = typeInfo?.icon || CalendarIcon
                const past = isEventPast(ev.endTime, ev.startTime)
                const upcoming = isEventUpcoming(ev.startTime)
                return (
                  <Card key={ev.id} className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${past ? 'opacity-50' : ''} ${upcoming ? 'border-amber-300' : ''}`}
                    onClick={() => { setSelectedEvent(ev); setActiveTab('list'); setEventSubTab('detalji') }}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${COLORS[ev.color] || COLORS.primary}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          {upcoming && <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50">Uskoro</Badge>}
                          {past && <Badge variant="outline" className="text-xs text-gray-400">Prošao</Badge>}
                          {ev.priority === 'urgent' && <Badge variant="outline" className="text-xs text-red-600 bg-red-50"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Hitno</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatDateShort(ev.startTime)}</span>
                          {!ev.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(ev.startTime)}{ev.endTime ? ` — ${formatTime(ev.endTime)}` : ''}</span>}
                          {getEventDuration(ev.startTime, ev.endTime) && <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{getEventDuration(ev.startTime, ev.endTime)}</span>}
                          {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); if (!confirm('Obrisati događaj?')) return; fetch('/api/calendar/' + ev.id, { method: 'DELETE' }).then(() => { loadEvents(); showToast('Događaj obrisan') }) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        
            </TabsContent>
          </Tabs>
        </TabsContent></TabsContent>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Danas" value={stats.today} icon={Sun} color="text-amber-500" />
            <Kpi label="Događaja ukupno" value={stats.total} icon={CalendarDays} color="text-blue-500" />
            <Kpi label="Sastanaka" value={stats.meetings} icon={Users} color="text-green-500" />
            <Kpi label="Rokova" value={stats.deadlines} icon={Timer} color="text-red-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Uskoro" value={stats.upcoming} icon={Clock} color="text-purple-500" />
            <Kpi label="Zadataka" value={stats.tasks} icon={CheckCircle2} color="text-teal-500" />
            <Kpi label="Sa podsetnikom" value={stats.withReminder} icon={Bell} color="text-orange-500" />
            <Kpi label="Ponavljajućih" value={stats.recurring} icon={Repeat} color="text-pink-500" />
          </div>

          {/* Today's Events */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Sun className="h-4 w-4 text-amber-500" /> Današnji događaji</CardTitle>
                <Badge>{todayEvents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nema događaja za danas</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedEvent(ev); setActiveTab('list'); setEventSubTab('detalji') }}>
                      <Circle className={`h-2.5 w-2.5 fill-current ${COLOR_DOTS[ev.color] || 'bg-primary'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">{ev.allDay ? 'Ceo dan' : formatTime(ev.startTime)}{ev.location ? ` · ${ev.location}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-purple-500" /> Nadolazeći događaji</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('list')}>Svi <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nema nadolazećih događaja</p>
                ) : upcomingEvents.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedEvent(ev); setActiveTab('list'); setEventSubTab('detalji') }}>
                    <div className={`h-8 w-8 rounded flex items-center justify-center ${COLORS[ev.color] || COLORS.primary}`}>
                      <span className="text-xs font-bold">{new Date(ev.startTime).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateFull(ev.startTime)} · {ev.allDay ? 'Ceo dan' : formatTime(ev.startTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Type */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipovima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => {
                    const info = EVENT_TYPES.find(t => t.value === type)
                    const max = Math.max(...Object.values(stats.byType), 1)
                    const TypeIcon = info ? info.icon : CalendarIcon
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-20 flex items-center gap-1.5"><TypeIcon className="h-3 w-3 text-muted-foreground" /><span className="text-xs truncate">{info ? info.label : type}</span></div>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Types Reference */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Tipovi događaja</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map(t => (
                    <div key={t.value} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                      <t.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{t.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New/Edit Event */}
      

      {/* Event Detail */}
      

      {/* Delete Confirmation */}
      

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">3 prikaza</p><p className="text-muted-foreground">Mesec, nedelja, lista</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">9 tipova</p><p className="text-muted-foreground">Sastanci, ročevi, zadaci...</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Podsetnici</p><p className="text-muted-foreground">5 min do 1 nedelja</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Ponavljanja</p><p className="text-muted-foreground">Dnevno, nedeljno, mesečno</p></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Prečice na tastaturi</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Novi događaj</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono">N</kbd></div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Sledeći mesec</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono">→</kbd></div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Prethodni mesec</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono">←</kbd></div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Danas</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono">T</kbd></div>
          </div>
        </CardContent>
      </Card>

      {/* Serbian Holidays Reference */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Srpski praznici i važni datumi</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { date: '01-01', name: 'Nova Godina', type: 'Državni praznik' },
              { date: '01-07', name: 'Božić (pravoslavni)', type: 'Verski praznik' },
              { date: '02-15', name: 'Dan državnosti Srbije', type: 'Državni praznik' },
              { date: '03-08', name: 'Dan žena', type: 'Međunarodni' },
              { date: '05-01', name: 'Praznik rada', type: 'Državni praznik' },
              { date: '05-09', name: 'Dan pobede', type: 'Državni praznik' },
              { date: '06-28', name: 'Vidovdan', type: 'Verski praznik' },
              { date: '11-11', name: 'Dan primirja', type: 'Međunarodni' },
            ].map(h => (
              <div key={h.date} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{h.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">{h.date}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Brza statistika</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prosečno događaja po mesecu:</span>
              <span className="font-medium">{stats.total > 0 ? Math.round(stats.total / Math.max(Object.keys(events.reduce((acc, e) => {
                const m = e.startTime?.split('-')?.[1] || '01'
                acc[m] = (acc[m] || 0) + 1
                return acc
              }, {} as Record<string, number>)).length, 1)) : 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Najzastupljeniji tip:</span>
              <span className="font-medium">{(() => {
                const max = Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0]
                return max ? `${EVENT_TYPES.find(t => t.value === max[0])?.label || max[0]} (${max[1]})` : '-'
              })()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Najčešća boja:</span>
              <span className="font-medium">{(() => {
                const max = Object.entries(stats.byColor).sort(([, a], [, b]) => b - a)[0]
                return max ? max[0] : '-'
              })()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dogаđaji sa podsetnikom:</span>
              <span className="font-medium">{stats.total > 0 ? `${Math.round(stats.withReminder / stats.total * 100)}%` : '0%'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Tricks */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Saveti za efikasan kalendar</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Koristite tipove događaja</p><p className="text-muted-foreground">Sastanci, ročevi, zadaci, podsetnici - svaki tip ima svoju boju i ikonu</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Postavite podsetnike</p><p className="text-muted-foreground">5 min, 15 min, 1 sat ili 1 dan pre - ne propustite nijedan sastanak</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Dodajte lokaciju</p><p className="text-muted-foreground">Beležite mesto sastanka za lakše planiranje terenskog rada</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Navedite učesnike</p><p className="text-muted-foreground">Zapamtite ko je na sastanku - samo unesite imena, zarezom odvojena</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Koristite prioritet</p><p className="text-muted-foreground">Označite hitne događaje - videće se u listi sa narandžastim badge-om</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Ponavljanje</p><p className="text-muted-foreground">Dnevni, nedeljni ili mesečni događaji se automatski ponavljaju</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Boje za organizaciju</p><p className="text-muted-foreground">8 boja za vizuelno razlikovanje - sastanci plavi, ročevi crveni, zadaci zeleni</p></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views Comparison */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Prikazi kalendara</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('month')}>
              <div className="flex items-center gap-2 mb-2"><LayoutGrid className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Mesečni prikaz</span></div>
              <p className="text-xs text-muted-foreground">Pregled celog meseca sa svim događajima. Kliknite na dan za detalje, kliknite na događaj za uređivanje.</p>
            </div>
            <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('week')}>
              <div className="flex items-center gap-2 mb-2"><Grid3X3 className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Nedeljni prikaz</span></div>
              <p className="text-xs text-muted-foreground">Pregled aktuelne nedelje sa detaljnim prikazom svakog dana. Idealno za planiranje sedmice.</p>
            </div>
            <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('list')}>
              <div className="flex items-center gap-2 mb-2"><List className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Lista događaja</span></div>
              <p className="text-xs text-muted-foreground">Kronološki prikaz svih događaja sa pretragom i filtriranjem. Brzo pronalaženje i uređivanje.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
