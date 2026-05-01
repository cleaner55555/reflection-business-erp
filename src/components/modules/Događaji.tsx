'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { formatRSD } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Calendar, MapPin, Users, Ticket, DollarSign, BarChart3, TrendingUp,
  Plus, Search, Eye, Trash2, Edit3, RefreshCw, CheckCircle2, Clock,
  QrCode, Building2, Star, UserCheck, UserX, Mail, XCircle, ChevronRight,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

// ============ TYPES ============

interface EventItem {
  id: string
  title: string
  type: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  capacity: number
  registered: number
  price: number
  maxAttendees: number
  organizer: string
  notes: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
}

interface RegistrationItem {
  id: string
  attendee: string
  eventId: string
  eventTitle: string
  date: string
  status: 'registered' | 'checked_in' | 'cancelled' | 'no_show'
  ticketType: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  emailSent: boolean
}

interface VenueItem {
  id: string
  name: string
  address: string
  capacity: number
  equipment: string[]
  contact: string
  rating: number
}

interface TicketItem {
  id: string
  eventId: string
  eventTitle: string
  name: string
  tier: string
  price: number
  available: number
  sold: number
}

// ============ CONFIG ============

const EVENT_TYPES = ['conference', 'webinar', 'workshop', 'meeting', 'social'] as const
const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'completed'] as const
const REG_STATUSES = ['registered', 'checked_in', 'cancelled', 'no_show'] as const
const PAYMENT_STATUSES = ['paid', 'pending', 'failed'] as const
const EQUIPMENT_OPTIONS = ['projector', 'wifi', 'sound', 'whiteboard', 'ac', 'parking'] as const
const TICKET_TIERS = ['general', 'vip', 'early_bird', 'student'] as const

const TYPE_KEYS: Record<string, string> = {
  conference: 'events.typeConference',
  webinar: 'events.typeWebinar',
  workshop: 'events.typeWorkshop',
  meeting: 'events.typeMeeting',
  social: 'events.typeSocial',
}

const STATUS_KEYS: Record<string, string> = {
  draft: 'events.statusDraft',
  published: 'events.statusPublished',
  cancelled: 'events.statusCancelled',
  completed: 'events.statusCompleted',
}

const REG_STATUS_KEYS: Record<string, string> = {
  registered: 'events.statusRegistered',
  checked_in: 'events.statusCheckedIn',
  cancelled: 'events.statusRegCancelled',
  no_show: 'events.statusNoShow',
}

const PAYMENT_STATUS_KEYS: Record<string, string> = {
  paid: 'events.paymentPaid',
  pending: 'events.paymentPending',
  failed: 'events.paymentFailed',
}

const TIER_KEYS: Record<string, string> = {
  general: 'events.ticketGeneral',
  vip: 'events.ticketVIP',
  early_bird: 'events.ticketEarlyBird',
  student: 'events.ticketStudent',
}

const EQUIPMENT_KEYS: Record<string, string> = {
  projector: 'events.equipmentProjector',
  wifi: 'events.equipmentWifi',
  sound: 'events.equipmentSound',
  whiteboard: 'events.equipmentWhiteboard',
  ac: 'events.equipmentAC',
  parking: 'events.equipmentParking',
}

const TYPE_COLORS: Record<string, string> = {
  conference: 'bg-violet-100 text-violet-700',
  webinar: 'bg-teal-100 text-teal-700',
  workshop: 'bg-amber-100 text-amber-700',
  meeting: 'bg-sky-100 text-sky-700',
  social: 'bg-rose-100 text-rose-700',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-slate-200 text-slate-700',
}

const REG_STATUS_COLORS: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
}

const CHART_COLORS = ['#8b5cf6', '#14b8a6', '#f59e0b', '#0ea5e9', '#f43f5e']

// ============ MOCK DATA ============

function generateMockEvents(): EventItem[] {
  const venues = ['Beograd Hub', 'Novi Sad Center', 'Niš Space', 'Kragujevac Hall', 'Subotica Venue', 'Zlatibor Resort']
  const organizers = ['Marko Petrović', 'Ana Jovanović', 'Jelena Stanković', 'Nikola Đorđević', 'Ivana Milić']
  const types = EVENT_TYPES
  const statuses: Array<'draft' | 'published' | 'cancelled' | 'completed'> = ['draft', 'published', 'cancelled', 'completed']
  const titles = [
    'Tech Summit 2025', 'AI Workshop', 'Marketing Meetup', 'DevOps Conference',
    'Startup Pitch Night', 'UX Design Sprint', 'Cloud Architecture Day', 'Data Science Forum',
    'Agile Retrospective', 'Product Management Circle', 'Frontend Masters', 'Cybersecurity Bootcamp',
  ]
  return titles.map((title, i) => {
    const month = (i % 12) + 1
    const day = (i * 3 % 28) + 1
    const cap = [100, 50, 80, 200, 30, 60, 150, 120, 40, 70, 90, 110][i]
    const reg = Math.min(cap, Math.floor(cap * (0.3 + Math.random() * 0.7)))
    const price = types[i % 5] === 'social' ? 0 : [2500, 1500, 3500, 5000, 0, 2000, 4000, 3000, 1800, 2200, 1000, 4500][i]
    return {
      id: `ev-${i + 1}`,
      title,
      type: types[i % 5],
      description: `${title} - comprehensive session for professionals in the field.`,
      startDate: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      endDate: `2025-${String(month).padStart(2, '0')}-${String(Math.min(28, day + 1)).padStart(2, '0')}`,
      startTime: `${9 + (i % 4)}:00`,
      endTime: `${17 + (i % 3)}:00`,
      venue: venues[i % 6],
      capacity: cap,
      registered: reg,
      price,
      maxAttendees: cap,
      organizer: organizers[i % 5],
      notes: '',
      status: statuses[i % 4],
    }
  })
}

function generateMockRegistrations(events: EventItem[]): RegistrationItem[] {
  const names = [
    'Luka Matić', 'Sara Popović', 'Miloš Tanasijević', 'Nina Vasić', 'Stefan Ilić',
    'Milica Savić', 'Andrej Nikolić', 'Jovana Radovanović', 'Đorđe Marković', 'Maja Stojanović',
    'Petar Janković', 'Katarina Todorović', 'Vuk Đurđević', 'Lana Bojović', 'Nemanja Kostić',
    'Ivana Pavlović', 'Aleksandar Stojković', 'Tijana Simić', 'Bogdan Zlatanović', 'Emina Hadžić',
  ]
  const ticketTypes = ['General', 'VIP', 'Early Bird', 'Student']
  return names.map((name, i) => {
    const ev = events[i % events.length]
    const payStatuses: Array<'paid' | 'pending' | 'failed'> = ['paid', 'pending', 'failed']
    const regStatuses: Array<'registered' | 'checked_in' | 'cancelled' | 'no_show'> = ['registered', 'checked_in', 'cancelled', 'no_show']
    return {
      id: `reg-${i + 1}`,
      attendee: name,
      eventId: ev.id,
      eventTitle: ev.title,
      date: ev.startDate,
      status: regStatuses[i % 4],
      ticketType: ticketTypes[i % 4],
      paymentStatus: payStatuses[i % 3],
      emailSent: i % 3 !== 2,
    }
  })
}

function generateMockVenues(): VenueItem[] {
  return [
    { id: 'v1', name: 'Beograd Hub', address: 'Knez Mihailova 24, Beograd', capacity: 200, equipment: ['projector', 'wifi', 'sound', 'ac', 'parking'], contact: '+381 11 123 4567', rating: 4.8 },
    { id: 'v2', name: 'Novi Sad Center', address: 'Trg Slobode 5, Novi Sad', capacity: 150, equipment: ['projector', 'wifi', 'sound', 'whiteboard', 'ac'], contact: '+381 21 234 5678', rating: 4.5 },
    { id: 'v3', name: 'Niš Space', address: 'Obrenovićeva 12, Niš', capacity: 100, equipment: ['projector', 'wifi', 'whiteboard'], contact: '+381 18 345 6789', rating: 4.2 },
    { id: 'v4', name: 'Kragujevac Hall', address: 'Terazije 3, Kragujevac', capacity: 300, equipment: ['projector', 'wifi', 'sound', 'ac', 'parking', 'whiteboard'], contact: '+381 34 456 7890', rating: 4.6 },
    { id: 'v5', name: 'Subotica Venue', address: 'Korzo 8, Subotica', capacity: 80, equipment: ['wifi', 'sound', 'ac'], contact: '+381 24 567 8901', rating: 4.0 },
    { id: 'v6', name: 'Zlatibor Resort', address: 'Zlatibor bb, Zlatibor', capacity: 50, equipment: ['wifi', 'whiteboard', 'ac'], contact: '+381 31 678 9012', rating: 4.9 },
  ]
}

function generateMockTickets(events: EventItem[]): TicketItem[] {
  const tiers = TICKET_TIERS
  const prices: Record<string, number> = { general: 2500, vip: 5000, early_bird: 1500, student: 1000 }
  return events.slice(0, 8).flatMap((ev) =>
    tiers.slice(0, 1 + Math.floor(Math.random() * 3)).map((tier, j) => ({
      id: `t-${ev.id}-${tier}`,
      eventId: ev.id,
      eventTitle: ev.title,
      name: `${TIER_KEYS[tier] ? '' : tier} - ${ev.title}`,
      tier,
      price: ev.price > 0 ? prices[tier] : 0,
      available: 20 + Math.floor(Math.random() * 30),
      sold: Math.floor(Math.random() * 25),
    }))
  )
}

// ============ SUB-COMPONENTS ============

function KPICard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtext?: string
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </Card>
  )
}

function FilterBar({ search, onSearchChange, children }: {
  search: string
  onSearchChange: (v: string) => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ statusKey, colorMap }: {
  statusKey: string
  colorMap: Record<string, string>
}) {
  return (
    <Badge variant="outline" className={colorMap[statusKey] || 'bg-gray-100 text-gray-700'}>
      {statusKey}
    </Badge>
  )
}

// ============ MAIN COMPONENT ============

export function Događaji() {
  const { t } = useTranslation()
  const { activeCompanyId } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')

  // Data
  const [events, setEvents] = useState<EventItem[]>(() => generateMockEvents())
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(() => generateMockRegistrations(generateMockEvents()))
  const [venues, setVenues] = useState<VenueItem[]>(() => generateMockVenues())
  const [tickets] = useState<TicketItem[]>(() => generateMockTickets(generateMockEvents()))

  // Filters
  const [eventSearch, setEventSearch] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [eventStatusFilter, setEventStatusFilter] = useState('all')
  const [regSearch, setRegSearch] = useState('')
  const [regEventFilter, setRegEventFilter] = useState('all')
  const [regStatusFilter, setRegStatusFilter] = useState('all')

  // Dialogs
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [venueDialogOpen, setVenueDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<VenueItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Forms
  const emptyEventForm: Omit<EventItem, 'id'> = {
    title: '', type: 'conference', description: '', startDate: '', endDate: '',
    startTime: '09:00', endTime: '17:00', venue: '', capacity: 100,
    registered: 0, price: 0, maxAttendees: 100, organizer: '', notes: '', status: 'draft',
  }
  const [eventForm, setEventForm] = useState(emptyEventForm)

  const emptyVenueForm: Omit<VenueItem, 'id'> = {
    name: '', address: '', capacity: 100, equipment: [], contact: '', rating: 4.0,
  }
  const [venueForm, setVenueForm] = useState(emptyVenueForm)
  const [venueEquip, setVenueEquip] = useState<string[]>([])

  // ============ COMPUTED ============

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === 'published' && new Date(e.startDate) >= new Date()),
    [events]
  )
  const totalAttendees = useMemo(
    () => events.reduce((s, e) => s + e.registered, 0),
    [events]
  )
  const totalRevenue = useMemo(
    () => events.reduce((s, e) => s + e.registered * e.price, 0),
    [events]
  )
  const avgAttendance = useMemo(() => {
    const withCap = events.filter((e) => e.capacity > 0)
    return withCap.length > 0
      ? Math.round(withCap.reduce((s, e) => s + (e.registered / e.capacity) * 100, 0) / withCap.length)
      : 0
  }, [events])
  const eventsThisMonth = useMemo(() => {
    const now = new Date()
    return events.filter((e) => {
      const d = new Date(e.startDate)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [events])
  const activeVenuesCount = useMemo(
    () => new Set(events.map((e) => e.venue)).size,
    [events]
  )

  // Monthly events chart data
  const monthlyEventsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, i) => ({
      month: m,
      events: events.filter((e) => new Date(e.startDate).getMonth() === i).length,
    }))
  }, [events])

  // Event type pie data
  const eventTypePieData = useMemo(() =>
    EVENT_TYPES.map((tp) => ({
      name: t(TYPE_KEYS[tp]),
      value: events.filter((e) => e.type === tp).length,
    })).filter((d) => d.value > 0),
    [events, t]
  )

  // Top events by attendance
  const topEvents = useMemo(
    () => [...events].sort((a, b) => b.registered - a.registered).slice(0, 5),
    [events]
  )

  // Revenue by month
  const revenueByMonthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, i) => ({
      month: m,
      revenue: events
        .filter((e) => new Date(e.startDate).getMonth() === i)
        .reduce((s, e) => s + e.registered * e.price, 0),
    }))
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventSearch && !e.title.toLowerCase().includes(eventSearch.toLowerCase())) return false
      if (eventTypeFilter !== 'all' && e.type !== eventTypeFilter) return false
      if (eventStatusFilter !== 'all' && e.status !== eventStatusFilter) return false
      return true
    })
  }, [events, eventSearch, eventTypeFilter, eventStatusFilter])

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (regSearch && !r.attendee.toLowerCase().includes(regSearch.toLowerCase()) && !r.eventTitle.toLowerCase().includes(regSearch.toLowerCase())) return false
      if (regEventFilter !== 'all' && r.eventId !== regEventFilter) return false
      if (regStatusFilter !== 'all' && r.status !== regStatusFilter) return false
      return true
    })
  }, [registrations, regSearch, regEventFilter, regStatusFilter])

  // Analytics: attendance trend
  const attendanceTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, i) => ({
      month: m,
      attendees: events
        .filter((e) => new Date(e.startDate).getMonth() === i)
        .reduce((s, e) => s + e.registered, 0),
    }))
  }, [events])

  // Analytics: revenue by type
  const revenueByTypeData = useMemo(() =>
    EVENT_TYPES.map((tp) => ({
      type: t(TYPE_KEYS[tp]),
      revenue: events.filter((e) => e.type === tp).reduce((s, e) => s + e.registered * e.price, 0),
    })).filter((d) => d.revenue > 0),
    [events, t]
  )

  // Analytics: funnel data
  const funnelData = useMemo(() => [
    { stage: t('events.funnelViewed'), value: events.reduce((s) => s + Math.floor(50 + Math.random() * 200), 0) },
    { stage: t('events.funnelRegistered'), value: totalAttendees },
    { stage: t('events.funnelAttended'), value: Math.floor(totalAttendees * 0.75) },
  ], [events, totalAttendees, t])

  // Analytics: top venues
  const topVenues = useMemo(() => {
    const count: Record<string, number> = {}
    events.forEach((e) => { count[e.venue] = (count[e.venue] || 0) + 1 })
    return Object.entries(count)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [events])

  // Analytics: monthly attendee chart
  const monthlyAttendeesData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, i) => ({
      month: m,
      attendees: events
        .filter((e) => new Date(e.startDate).getMonth() === i)
        .reduce((s, e) => s + e.registered, 0),
    }))
  }, [events])

  // Analytics: ticket sales pie
  const ticketSalesPie = useMemo(() =>
    TICKET_TIERS.map((tier) => ({
      name: t(TIER_KEYS[tier]),
      value: tickets.filter((tk) => tk.tier === tier).reduce((s, tk) => s + tk.sold, 0),
    })).filter((d) => d.value > 0),
    [tickets, t]
  )

  // ============ HANDLERS ============

  function openCreateEvent() {
    setEventForm(emptyEventForm)
    setIsEditing(false)
    setEventDialogOpen(true)
  }

  function openEditEvent(ev: EventItem) {
    setEventForm(ev)
    setIsEditing(true)
    setEventDialogOpen(true)
  }

  function saveEvent() {
    if (isEditing && selectedEvent) {
      setEvents((prev) => prev.map((e) => e.id === selectedEvent.id ? { ...e, ...eventForm } : e))
    } else {
      setEvents((prev) => [...prev, { ...eventForm, id: `ev-${Date.now()}` }])
    }
    setEventDialogOpen(false)
  }

  function deleteEvent(id: string) {
    if (!confirm(t('events.deleteConfirm'))) return
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function changeEventStatus(id: string, status: EventItem['status']) {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status } : e))
  }

  function checkInRegistration(id: string) {
    setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'checked_in' as const } : r))
  }

  function cancelRegistration(id: string) {
    if (!confirm(t('events.confirmCancelReg'))) return
    setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' as const } : r))
  }

  function toggleEmail(id: string) {
    setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, emailSent: !r.emailSent } : r))
  }

  function openCreateVenue() {
    setVenueForm(emptyVenueForm)
    setVenueEquip([])
    setSelectedVenue(null)
    setIsEditing(false)
    setVenueDialogOpen(true)
  }

  function openEditVenue(v: VenueItem) {
    setVenueForm(v)
    setVenueEquip([...v.equipment])
    setSelectedVenue(v)
    setIsEditing(true)
    setVenueDialogOpen(true)
  }

  function saveVenue() {
    const venueData = { ...venueForm, equipment: venueEquip }
    if (isEditing && selectedVenue) {
      setVenues((prev) => prev.map((v) => v.id === selectedVenue.id ? venueData as VenueItem : v))
    } else {
      setVenues((prev) => [...prev, { ...venueData, id: `v-${Date.now()}` } as VenueItem])
    }
    setVenueDialogOpen(false)
  }

  function deleteVenue(id: string) {
    if (!confirm(t('events.deleteConfirm'))) return
    setVenues((prev) => prev.filter((v) => v.id !== id))
  }

  function toggleEquip(eq: string) {
    setVenueEquip((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq])
  }

  // ============ RENDER HELPERS ============

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ))
  }

  function getRegListForEvent(eventId: string) {
    return registrations.filter((r) => r.eventId === eventId)
  }

  // ============ TAB: OVERVIEW ============

  function renderOverview() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard icon={Calendar} label={t('events.kpiUpcoming')} value={upcomingEvents.length} color="text-violet-500" />
          <KPICard icon={Users} label={t('events.kpiAttendees')} value={totalAttendees} color="text-emerald-500" />
          <KPICard icon={DollarSign} label={t('events.kpiRevenue')} value={formatRSD(totalRevenue)} color="text-amber-500" />
          <KPICard icon={TrendingUp} label={t('events.kpiAvgAttendance')} value={`${avgAttendance}%`} color="text-sky-500" />
          <KPICard icon={Calendar} label={t('events.kpiEventsMonth')} value={eventsThisMonth} color="text-teal-500" />
          <KPICard icon={Building2} label={t('events.kpiActiveVenues')} value={activeVenuesCount} color="text-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.monthlyEvents')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyEventsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.eventTypeDist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={eventTypePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {eventTypePieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.topEvents')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {topEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.venue}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{e.registered}/{e.capacity}</Badge>
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.revenueByMonth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => formatRSD(val)} />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============ TAB: EVENTS ============

  function renderEvents() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FilterBar search={eventSearch} onSearchChange={setEventSearch}>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('events.allTypes')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('events.allTypes')}</SelectItem>
                {EVENT_TYPES.map((tp) => (
                  <SelectItem key={tp} value={tp}>{t(TYPE_KEYS[tp])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('events.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('events.allStatuses')}</SelectItem>
                {EVENT_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>{t(STATUS_KEYS[st])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBar>
          <Button size="sm" className="ml-2" onClick={openCreateEvent}>
            <Plus className="h-4 w-4 mr-1" /> {t('events.newEvent')}
          </Button>
        </div>

        {filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('events.noEvents')}</p>
            <Button variant="outline" className="mt-3" onClick={openCreateEvent}>
              <Plus className="h-4 w-4 mr-1" /> {t('events.createFirst')}
            </Button>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('events.titleCol')}</TableHead>
                  <TableHead>{t('events.typeCol')}</TableHead>
                  <TableHead>{t('events.dateCol')}</TableHead>
                  <TableHead>{t('events.venueCol')}</TableHead>
                  <TableHead>{t('events.capacityCol')}</TableHead>
                  <TableHead>{t('events.registeredCol')}</TableHead>
                  <TableHead>{t('events.statusCol')}</TableHead>
                  <TableHead>{t('events.revenueCol')}</TableHead>
                  <TableHead className="text-right">{t('events.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell><StatusBadge statusKey={t(TYPE_KEYS[ev.type])} colorMap={TYPE_COLORS} /></TableCell>
                    <TableCell className="text-sm">{ev.startDate}</TableCell>
                    <TableCell className="text-sm">{ev.venue}</TableCell>
                    <TableCell className="text-sm">{ev.capacity}</TableCell>
                    <TableCell className="text-sm">{ev.registered}</TableCell>
                    <TableCell><StatusBadge statusKey={t(STATUS_KEYS[ev.status])} colorMap={STATUS_COLORS} /></TableCell>
                    <TableCell className="text-sm font-medium">{formatRSD(ev.registered * ev.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedEvent(ev); setEventDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditEvent(ev)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteEvent(ev.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Event Detail Dialog */}
        <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('events.eventDetails')}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge statusKey={t(TYPE_KEYS[selectedEvent.type])} colorMap={TYPE_COLORS} />
                  <StatusBadge statusKey={t(STATUS_KEYS[selectedEvent.status])} colorMap={STATUS_COLORS} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t('events.startDate')}:</span> {selectedEvent.startDate}</div>
                  <div><span className="text-muted-foreground">{t('events.endDate')}:</span> {selectedEvent.endDate}</div>
                  <div><span className="text-muted-foreground">{t('events.startTime')}:</span> {selectedEvent.startTime}</div>
                  <div><span className="text-muted-foreground">{t('events.endTime')}:</span> {selectedEvent.endTime}</div>
                  <div><span className="text-muted-foreground">{t('events.venueCol')}:</span> {selectedEvent.venue}</div>
                  <div><span className="text-muted-foreground">{t('events.organizer')}:</span> {selectedEvent.organizer}</div>
                  <div><span className="text-muted-foreground">{t('events.capacityCol')}:</span> {selectedEvent.registered}/{selectedEvent.capacity}</div>
                  <div><span className="text-muted-foreground">{t('events.revenueCol')}:</span> {formatRSD(selectedEvent.registered * selectedEvent.price)}</div>
                </div>
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                )}

                {/* Status workflow buttons */}
                {selectedEvent.status === 'draft' && (
                  <Button size="sm" onClick={() => { changeEventStatus(selectedEvent.id, 'published'); setSelectedEvent({ ...selectedEvent, status: 'published' }) }}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> {t('events.statusPublished')}
                  </Button>
                )}
                {selectedEvent.status === 'published' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { changeEventStatus(selectedEvent.id, 'completed'); setSelectedEvent({ ...selectedEvent, status: 'completed' }) }}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> {t('events.statusCompleted')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { changeEventStatus(selectedEvent.id, 'cancelled'); setSelectedEvent({ ...selectedEvent, status: 'cancelled' }) }}>
                      <XCircle className="h-4 w-4 mr-1" /> {t('events.statusCancelled')}
                    </Button>
                  </div>
                )}

                {/* Registration list */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">{t('events.registrationList')}</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getRegListForEvent(selectedEvent.id).map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{r.attendee}</span>
                          <Badge variant="outline" className={`text-[10px] ${REG_STATUS_COLORS[r.status]}`}>
                            {t(REG_STATUS_KEYS[r.status])}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.ticketType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Event Dialog */}
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? t('events.editEvent') : t('events.newEvent')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('events.eventTitle')}</Label>
                <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.eventType')}</Label>
                  <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((tp) => (
                        <SelectItem key={tp} value={tp}>{t(TYPE_KEYS[tp])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('events.venueCol')}</Label>
                  <Select value={eventForm.venue} onValueChange={(v) => setEventForm({ ...eventForm, venue: v })}>
                    <SelectTrigger><SelectValue placeholder={t('events.venueCol')} /></SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('events.eventDescription')}</Label>
                <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.startDate')}</Label>
                  <Input type="date" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('events.endDate')}</Label>
                  <Input type="date" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.startTime')}</Label>
                  <Input type="time" value={eventForm.startTime} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('events.endTime')}</Label>
                  <Input type="time" value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.capacity')}</Label>
                  <Input type="number" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('events.price')} (RSD)</Label>
                  <Input type="number" value={eventForm.price || ''} onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('events.organizer')}</Label>
                <Input value={eventForm.organizer} onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('events.notes')}</Label>
                <Textarea value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEventDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveEvent}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ============ TAB: REGISTRATIONS ============

  function renderRegistrations() {
    return (
      <div className="space-y-4">
        <FilterBar search={regSearch} onSearchChange={setRegSearch}>
          <Select value={regEventFilter} onValueChange={setRegEventFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('events.allEvents')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('events.allEvents')}</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regStatusFilter} onValueChange={setRegStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('events.allStatuses')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('events.allStatuses')}</SelectItem>
              {REG_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>{t(REG_STATUS_KEYS[st])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBar>

        {filteredRegistrations.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('events.noRegistrations')}</p>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('events.attendeeCol')}</TableHead>
                  <TableHead>{t('events.eventCol')}</TableHead>
                  <TableHead>{t('events.regDateCol')}</TableHead>
                  <TableHead>{t('events.statusCol')}</TableHead>
                  <TableHead>{t('events.ticketTypeCol')}</TableHead>
                  <TableHead>{t('events.paymentStatusCol')}</TableHead>
                  <TableHead>{t('events.emailConfirmation')}</TableHead>
                  <TableHead className="text-right">{t('events.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.attendee}</TableCell>
                    <TableCell className="text-sm">{r.eventTitle}</TableCell>
                    <TableCell className="text-sm">{r.date}</TableCell>
                    <TableCell><StatusBadge statusKey={t(REG_STATUS_KEYS[r.status])} colorMap={REG_STATUS_COLORS} /></TableCell>
                    <TableCell className="text-sm">{r.ticketType}</TableCell>
                    <TableCell><StatusBadge statusKey={t(PAYMENT_STATUS_KEYS[r.paymentStatus])} colorMap={PAYMENT_COLORS} /></TableCell>
                    <TableCell>
                      <Switch checked={r.emailSent} onCheckedChange={() => toggleEmail(r.id)} className="scale-75" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'registered' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => checkInRegistration(r.id)}>
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> {t('events.checkIn')}
                          </Button>
                        )}
                        {r.status !== 'cancelled' && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cancelRegistration(r.id)}>
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }

  // ============ TAB: VENUES ============

  function renderVenues() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('events.tabVenues')}</h3>
          <Button size="sm" onClick={openCreateVenue}>
            <Plus className="h-4 w-4 mr-1" /> {t('events.newVenue')}
          </Button>
        </div>

        {venues.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('events.noVenues')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((v) => (
              <Card key={v.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{v.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditVenue(v)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteVenue(v.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {v.address}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('events.venueCapacity')}:</span>
                    <span className="font-medium">{v.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('events.venueContact')}:</span>
                    <span className="font-medium text-xs">{v.contact}</span>
                  </div>
                  <div className="flex items-center gap-0.5">{renderStars(v.rating)}</div>
                  <div className="flex flex-wrap gap-1">
                    {v.equipment.map((eq) => (
                      <Badge key={eq} variant="outline" className="text-[10px]">{t(EQUIPMENT_KEYS[eq])}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Venue Dialog */}
        <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? t('events.editVenue') : t('events.newVenue')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('events.venueName')}</Label>
                <Input value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('events.venueAddress')}</Label>
                <Input value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.venueCapacity')}</Label>
                  <Input type="number" value={venueForm.capacity} onChange={(e) => setVenueForm({ ...venueForm, capacity: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('events.venueContact')}</Label>
                  <Input value={venueForm.contact} onChange={(e) => setVenueForm({ ...venueForm, contact: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('events.venueEquipment')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <label key={eq} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={venueEquip.includes(eq)}
                        onChange={() => toggleEquip(eq)}
                        className="rounded border-gray-300"
                      />
                      {t(EQUIPMENT_KEYS[eq])}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVenueDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveVenue}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ============ TAB: TICKETS ============

  function renderTickets() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('events.tabTickets')}</h3>
          <Button size="sm" onClick={() => setTicketDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('events.newTicket')}
          </Button>
        </div>

        {tickets.length === 0 ? (
          <Card className="p-8 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('events.noTickets')}</p>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('events.eventCol')}</TableHead>
                  <TableHead>{t('events.ticketName')}</TableHead>
                  <TableHead>{t('events.ticketTypeCol')}</TableHead>
                  <TableHead>{t('events.ticketPrice')}</TableHead>
                  <TableHead>{t('events.ticketAvailable')}</TableHead>
                  <TableHead>{t('events.ticketSold')}</TableHead>
                  <TableHead>{t('events.ticketRevenue')}</TableHead>
                  <TableHead>{t('events.barcode')}</TableHead>
                  <TableHead className="text-right">{t('events.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((tk) => (
                  <TableRow key={tk.id}>
                    <TableCell className="font-medium text-sm">{tk.eventTitle}</TableCell>
                    <TableCell className="text-sm">{tk.name || t(TIER_KEYS[tk.tier])}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{t(TIER_KEYS[tk.tier])}</Badge></TableCell>
                    <TableCell className="text-sm font-medium">{tk.price > 0 ? formatRSD(tk.price) : t('events.free')}</TableCell>
                    <TableCell className="text-sm">{tk.available}</TableCell>
                    <TableCell className="text-sm">{tk.sold}</TableCell>
                    <TableCell className="text-sm font-medium">{formatRSD(tk.sold * tk.price)}</TableCell>
                    <TableCell>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-1 w-16 h-8 flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Ticket className="h-3.5 w-3.5 mr-1" /> {t('events.sellTicket')}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Mail className="h-3.5 w-3.5 mr-1" /> {t('events.issueTicket')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Ticket Dialog placeholder */}
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('events.newTicket')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('events.ticketTypeCol')}</Label>
                <Select defaultValue="general">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>{t(TIER_KEYS[tier])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.ticketPrice')} (RSD)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>{t('events.ticketAvailable')}</Label>
                  <Input type="number" placeholder="50" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={() => setTicketDialogOpen(false)}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ============ TAB: ANALYTICS ============

  function renderAnalytics() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.attendanceTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendees" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Event Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.revenueByType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => formatRSD(val)} />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {revenueByTypeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.conversionFunnel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Venues */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.topVenues')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topVenues.map((v, i) => (
                <div key={v.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                    <span className="text-sm font-medium">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{v.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Attendees */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.monthlyAttendees')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyAttendeesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ticket Sales Pie */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('events.ticketSalesBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={ticketSalesPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {ticketSalesPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============ MAIN RENDER ============

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('events.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('events.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          setEvents(generateMockEvents())
          setRegistrations(generateMockRegistrations(events))
        }}>
          <RefreshCw className="h-4 w-4 mr-1" /> {t('common.refresh')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabOverview')}
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabEvents')}
          </TabsTrigger>
          <TabsTrigger value="registrations">
            <Users className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabRegistrations')}
          </TabsTrigger>
          <TabsTrigger value="venues">
            <Building2 className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabVenues')}
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <Ticket className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabTickets')}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline-block" />
            {t('events.tabAnalytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="events">{renderEvents()}</TabsContent>
        <TabsContent value="registrations">{renderRegistrations()}</TabsContent>
        <TabsContent value="venues">{renderVenues()}</TabsContent>
        <TabsContent value="tickets">{renderTickets()}</TabsContent>
        <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
      </Tabs>
    </div>
  )
}
