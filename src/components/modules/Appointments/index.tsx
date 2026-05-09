'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  CalendarCheck, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, TrendingUp, AlertCircle,
  CalendarDays, XCircle, ChevronLeft, ChevronRight, Settings,
  Phone, Mail, Star, Timer, Bell, UserPlus, Layers,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  title: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  date: string
  time: string
  duration: number
  type: string
  status: string
  assignedTo?: string
  notes?: string
  price?: number
  reminderStatus?: 'sent' | 'pending' | 'not_sent'
  createdAt: string
}

interface DashboardData {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowRate: number
  avgDuration: number
  totalRevenue: number
  weeklyTrend: Array<{ day: string; count: number }>
  typeBreakdown: Array<{ type: string; count: number }>
  recentAppointments: Appointment[]
}

interface Client {
  id: string
  name: string
  phone: string
  email: string
  appointmentCount: number
  totalSpent: number
  lastVisit: string
  isVip: boolean
  notes: string
  preferences: string
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  bookingCount: number
}

interface StaffMember {
  id: string
  name: string
  specialties: string
  workingDays: string[]
  maxPerDay: number
  isActive: boolean
}

interface AppSettings {
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
  slotDuration: number
  bufferTime: number
  reminder24h: boolean
  reminder1h: boolean
  cancelMaxHours: number
  cancelPenalty: number
  bookingUrl: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; nextStatus?: string }> = {
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700', nextStatus: 'confirmed' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-100 text-green-700', nextStatus: 'in_progress' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700', nextStatus: 'completed' },
  completed: { label: 'Završeno', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Nije se pojavio', color: 'bg-gray-100 text-gray-700' },
}

const TYPE_LABELS: Record<string, string> = {
  consultation: 'Konsultacija',
  followup: 'Kontrola',
  initial: 'Prvi pregled',
  emergency: 'Hitno',
  online: 'Online',
}

const TYPE_COLORS: Record<string, string> = {
  consultation: '#3b82f6',
  followup: '#10b981',
  initial: '#f59e0b',
  emergency: '#ef4444',
  online: '#8b5cf6',
}

const CATEGORY_LABELS: Record<string, string> = {
  konsultacija: 'Konsultacija',
  tretman: 'Tretman',
  analiza: 'Analiza',
  procedure: 'Procedure',
  drustveno: 'Društveno',
}

const CATEGORY_COLORS: Record<string, string> = {
  konsultacija: '#3b82f6',
  tretman: '#10b981',
  analiza: '#f59e0b',
  procedure: '#ef4444',
  drustveno: '#8b5cf6',
}

const REMINDER_LABELS: Record<string, string> = {
  sent: 'Poslata',
  pending: 'Na čekanju',
  not_sent: 'Nije poslata',
}

const DAYS_SR: Record<string, string> = {
  mon: 'Pon', tue: 'Uto', wed: 'Sre', thu: 'Čet', fri: 'Pet', sat: 'Sub', sun: 'Ned',
}

const DAYS_FULL: Record<string, string> = {
  mon: 'Ponedeljak', tue: 'Utorak', wed: 'Sreda', thu: 'Četvrtak', fri: 'Petak', sat: 'Subota', sun: 'Nedelja',
}

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Jovan Petrović', phone: '+38163111222', email: 'jovan@email.com', appointmentCount: 12, totalSpent: 45000, lastVisit: '2025-01-10', isVip: true, notes: 'Redovan klijent', preferences: 'Preferira jutarnje termine' },
  { id: 'c2', name: 'Ana Marković', phone: '+38164222333', email: 'ana@email.com', appointmentCount: 5, totalSpent: 18000, lastVisit: '2025-01-08', isVip: false, notes: '', preferences: '' },
  { id: 'c3', name: 'Milan Stanković', phone: '+38165333444', email: 'milan@email.com', appointmentCount: 20, totalSpent: 89000, lastVisit: '2025-01-12', isVip: true, notes: 'VIP klijent od 2023', preferences: 'Samo četvrtkom' },
  { id: 'c4', name: 'Jelena Nikolić', phone: '+38166444555', email: 'jelena@email.com', appointmentCount: 3, totalSpent: 12000, lastVisit: '2025-01-05', isVip: false, notes: '', preferences: '' },
  { id: 'c5', name: 'Nenad Jovanović', phone: '+38167555666', email: 'nenad@email.com', appointmentCount: 8, totalSpent: 32000, lastVisit: '2025-01-11', isVip: false, notes: 'Alergija na neke supstance', preferences: 'Popodnevni termini' },
]

const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Opšta konsultacija', description: 'Inicijalni pregled i procena', duration: 30, price: 3000, category: 'konsultacija', bookingCount: 45 },
  { id: 's2', name: 'Kontrolni pregled', description: 'Kontrola nakon tretmana', duration: 15, price: 1500, category: 'konsultacija', bookingCount: 32 },
  { id: 's3', name: 'Dubinski tretman', description: 'Intenzivan tretman lica', duration: 60, price: 5000, category: 'tretman', bookingCount: 28 },
  { id: 's4', name: 'Hidratacija', description: 'Tretman hidratacije kože', duration: 45, price: 4000, category: 'tretman', bookingCount: 38 },
  { id: 's5', name: 'Analiza kože', description: 'Detaljna analiza tipa kože', duration: 30, price: 2500, category: 'analiza', bookingCount: 22 },
  { id: 's6', name: 'Piling', description: 'Hemijski piling lica', duration: 45, price: 3500, category: 'procedure', bookingCount: 19 },
  { id: 's7', name: 'Individualna edukacija', description: 'Jedan na jedan sesija', duration: 60, price: 6000, category: 'drustveno', bookingCount: 8 },
]

const MOCK_STAFF: StaffMember[] = [
  { id: 'st1', name: 'Dr. Marina Kovačević', specialties: 'Konsultacije, Tretmani', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'], maxPerDay: 8, isActive: true },
  { id: 'st2', name: 'Nevena Popović', specialties: 'Analize, Procedure', workingDays: ['mon', 'wed', 'fri'], maxPerDay: 6, isActive: true },
  { id: 'st3', name: 'Aleksandar Đorđević', specialties: 'Online konsultacije', workingDays: ['tue', 'thu', 'sat'], maxPerDay: 5, isActive: true },
]

const DEFAULT_SETTINGS: AppSettings = {
  workStart: '08:00', workEnd: '20:00', lunchStart: '12:00', lunchEnd: '13:00',
  slotDuration: 30, bufferTime: 15, reminder24h: true, reminder1h: true,
  cancelMaxHours: 24, cancelPenalty: 1000, bookingUrl: '',
}

const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor((8 * 60 + i * 30) / 60)
  const m = (8 * 60 + i * 30) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// ─── Sub-components (defined outside render) ──────────────────────────────────

function KpiCard({ label, value, icon, colorClass }: {
  label: string; value: string | number; icon: React.ReactNode; colorClass?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${colorClass || ''}`}>{value}</p>
    </Card>
  )
}

function EmptyState({ icon, message, actionLabel, onAction }: {
  icon: React.ReactNode; message: string; actionLabel?: string; onAction?: () => void
}) {
  return (
    <Card className="p-8 text-center">
      {icon}
      <p className="text-muted-foreground mt-3">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" className="mt-3" onClick={onAction}>
          <Plus className="h-4 w-4 mr-1" /> {actionLabel}
        </Button>
      )}
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>
      {cfg?.label || status}
    </Badge>
  )
}

function ReminderBadge({ status }: { status?: string }) {
  if (!status) return null
  const labels: Record<string, { text: string; color: string }> = {
    sent: { text: 'Poslata', color: 'bg-green-100 text-green-700' },
    pending: { text: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
    not_sent: { text: 'Nije poslata', color: 'bg-gray-100 text-gray-600' },
  }
  const cfg = labels[status]
  if (!cfg) return null
  return <Badge variant="outline" className={`text-xs ml-1 ${cfg.color}`}><Bell className="h-2.5 w-2.5 mr-0.5" />{cfg.text}</Badge>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Appointments() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Appointment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [calendarWeek, setCalendarWeek] = useState(0)
  const [calendarStaffFilter, setCalendarStaffFilter] = useState('all')

  // Clients, services, staff, settings (local state)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [clientSearch, setClientSearch] = useState('')
  const [clientDetailOpen, setClientDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [staffDialogOpen, setStaffDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false)

  const emptyForm = {
    title: '', clientName: '', clientPhone: '', clientEmail: '',
    date: new Date().toISOString().split('T')[0], time: '09:00',
    duration: 30, type: 'consultation', assignedTo: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const emptyServiceForm = {
    name: '', description: '', duration: 30, price: 0, category: 'konsultacija',
  }
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)

  const emptyStaffForm = {
    name: '', specialties: '', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'] as string[],
    maxPerDay: 8, isActive: true,
  }
  const [staffForm, setStaffForm] = useState(emptyStaffForm)

  const emptyClientForm = { name: '', phone: '', email: '', notes: '', preferences: '' }
  const [clientForm, setClientForm] = useState(emptyClientForm)

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/appointments/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (search) params.set('search', search)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, statusFilter, typeFilter, search, dateFrom, dateTo])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'appointments') loadItems() }, [activeTab, loadItems])

  // ─── CRUD Handlers ────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('appointments.confirmDelete') || 'Obrisati zakazivanje?')) return
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      if (res.ok) { setSelectedIds(new Set()); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleReschedule = async () => {
    if (!selected || !rescheduleDate || !rescheduleTime) return
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, date: rescheduleDate, time: rescheduleTime }),
      })
      if (res.ok) { setRescheduleOpen(false); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleCreateAppointmentFromSlot = (date: string, time: string) => {
    setForm({ ...emptyForm, date, time })
    setDialogOpen(true)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map(i => i.id)))
  }

  // ─── Service Handlers ─────────────────────────────────────────────────────

  const handleSaveService = () => {
    if (!serviceForm.name) return
    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...serviceForm } : s))
    } else {
      setServices(prev => [...prev, { ...serviceForm, id: `s${Date.now()}`, bookingCount: 0 }])
    }
    setServiceDialogOpen(false)
    setEditingService(null)
    setServiceForm(emptyServiceForm)
  }

  const handleDeleteService = (id: string) => {
    if (!confirm(t('appointments.confirmDeleteService') || 'Obrisati uslugu?')) return
    setServices(prev => prev.filter(s => s.id !== id))
  }

  // ─── Staff Handlers ───────────────────────────────────────────────────────

  const handleSaveStaff = () => {
    if (!staffForm.name) return
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...staffForm } : s))
    } else {
      setStaff(prev => [...prev, { ...staffForm, id: `st${Date.now()}` }])
    }
    setStaffDialogOpen(false)
    setEditingStaff(null)
    setStaffForm(emptyStaffForm)
  }

  // ─── Client Handlers ──────────────────────────────────────────────────────

  const handleSaveNewClient = () => {
    if (!clientForm.name) return
    setClients(prev => [...prev, {
      ...clientForm, id: `c${Date.now()}`, appointmentCount: 0,
      totalSpent: 0, lastVisit: '', isVip: false,
    }])
    setNewClientDialogOpen(false)
    setClientForm(emptyClientForm)
  }

  // ─── Calendar Helpers ─────────────────────────────────────────────────────

  const calendarDates = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset + calendarWeek * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }, [calendarWeek])

  const getAppointmentsForDate = useCallback((date: string, staffId?: string) => {
    let filtered = items.filter(a => a.date === date)
    if (staffId && staffId !== 'all') {
      filtered = filtered.filter(a => a.assignedTo === staffId)
    }
    return filtered
  }, [items])

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  // ─── Filtered clients ─────────────────────────────────────────────────────

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
    )
  }, [clients, clientSearch])

  // ─── Today's timeline appointments ────────────────────────────────────────

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppointments = useMemo(() => {
    return items.filter(a => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time))
  }, [items, todayStr])

  const upcoming24h = useMemo(() => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return items.filter(a => {
      const aDate = new Date(`${a.date}T${a.time}`)
      return aDate >= now && aDate <= tomorrow && a.status !== 'completed' && a.status !== 'cancelled'
    }).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  }, [items])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('appointments.title') || 'Zakazivanja'}</h1>
          <p className="text-sm text-muted-foreground">{t('appointments.subtitle') || 'Upravljanje zakazivanjima i terminima'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('appointments.refresh') || 'Osveži'}
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('appointments.newAppointment') || 'Novi termin'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" />{t('appointments.overview') || 'Pregled'}</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-1" />{t('appointments.calendar') || 'Kalendar'}</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarCheck className="h-4 w-4 mr-1" />{t('appointments.appointments') || 'Termini'}</TabsTrigger>
          <TabsTrigger value="clients"><Users className="h-4 w-4 mr-1" />{t('appointments.clients') || 'Klijenti'}</TabsTrigger>
          <TabsTrigger value="services"><Layers className="h-4 w-4 mr-1" />{t('appointments.services') || 'Usluge'}</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" />{t('appointments.settings') || 'Podešavanja'}</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Overview ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard label={t('appointments.kpiToday') || 'Danas'} value={dashboard.todayAppointments} icon={<CalendarDays className="h-4 w-4 text-primary" />} />
                <KpiCard label={t('appointments.kpiUpcoming') || 'Nadolazeći (7 dana)'} value={dashboard.upcomingAppointments} icon={<Clock className="h-4 w-4 text-blue-500" />} colorClass="text-blue-600" />
                <KpiCard label={t('appointments.kpiCompletedWeek') || 'Završeni ove sedmice'} value={dashboard.completedAppointments} icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} colorClass="text-green-600" />
                <KpiCard label={t('appointments.kpiNoShow') || 'Nejavljivanje'} value={`${dashboard.noShowRate}%`} icon={<AlertCircle className="h-4 w-4 text-amber-500" />} colorClass="text-amber-600" />
                <KpiCard label={t('appointments.kpiAvgDuration') || 'Prosečno trajanje'} value={`${dashboard.avgDuration} min`} icon={<Timer className="h-4 w-4 text-purple-500" />} colorClass="text-purple-600" />
                <KpiCard label={t('appointments.kpiRevenue') || 'Ukupni prihod'} value={formatRSD(dashboard.totalRevenue)} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} colorClass="text-emerald-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">{t('appointments.weeklyTrend') || 'Sedmični trend'}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dashboard.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Type Distribution */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">{t('appointments.typeDistribution') || 'Distribucija po tipu'}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dashboard.typeBreakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${TYPE_LABELS[name] || name} ${(percent * 100).toFixed(0)}%`}>
                          {dashboard.typeBreakdown.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number, name: string) => [val, TYPE_LABELS[name] || name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Timeline */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{t('appointments.todayTimeline') || 'Današnji raspored'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {todayAppointments.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">{t('appointments.noToday') || 'Nema zakazanih termina za danas'}</p>
                    ) : (
                      todayAppointments.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => { setSelected(a); setDetailOpen(true) }}>
                          <div className="text-sm font-mono font-medium w-16 text-center bg-muted rounded px-2 py-1">{a.time}</div>
                          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: TYPE_COLORS[a.type] || '#6b7280' }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{a.title}</div>
                            <div className="text-xs text-muted-foreground">{a.clientName} · {a.duration} min</div>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming 24h */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{t('appointments.upcoming24h') || 'Nadolazeći (24h)'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {upcoming24h.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">{t('appointments.noUpcoming') || 'Nema nadolazećih termina'}</p>
                    ) : (
                      upcoming24h.map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="text-sm font-medium">{a.title}</div>
                            <div className="text-xs text-muted-foreground">{a.clientName} · {a.date} {a.time} · {a.duration} min</div>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Tab 2: Calendar ─────────────────────────────────────────────── */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarWeek(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-medium min-w-[180px] text-center">
                {calendarDates[0]} — {calendarDates[6]}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarWeek(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCalendarWeek(0)}>{t('appointments.thisWeek') || 'Ova sedmica'}</Button>
            </div>
            <Select value={calendarStaffFilter} onValueChange={setCalendarStaffFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('appointments.allStaff') || 'Svi zaposleni'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('appointments.allStaff') || 'Svi zaposleni'}</SelectItem>
                {staff.filter(s => s.isActive).map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TYPE_COLORS[key] }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="rounded-lg border overflow-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-2 text-xs font-medium text-muted-foreground border-r text-center">{t('appointments.time') || 'Vreme'}</div>
                {calendarDates.map((date, idx) => {
                  const dayKey = WEEK_DAYS[idx]
                  const isToday = date === todayStr
                  return (
                    <div key={date} className={`p-2 text-center border-r last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className="text-xs font-medium">{DAYS_SR[dayKey]}</div>
                      <div className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>{date.split('-')[2]}</div>
                    </div>
                  )
                })}
              </div>

              {/* Time Rows */}
              {TIME_SLOTS.map((slot) => (
                <div key={slot} className="grid grid-cols-8 border-b last:border-b-0 min-h-[48px]">
                  <div className="p-1 text-xs text-muted-foreground text-center border-r flex items-center justify-center font-mono">{slot}</div>
                  {calendarDates.map((date) => {
                    const slotAppts = getAppointmentsForDate(date, calendarStaffFilter).filter(a => {
                      const start = timeToMinutes(a.time)
                      const end = start + a.duration
                      const slotMin = timeToMinutes(slot)
                      return slotMin >= start && slotMin < end
                    })
                    const isToday = date === todayStr
                    const isNow = isToday && slot === `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
                    return (
                      <div
                        key={`${date}-${slot}`}
                        className={`border-r last:border-r-0 p-0.5 cursor-pointer hover:bg-muted/20 transition-colors ${isToday ? 'bg-primary/[0.02]' : ''} ${isNow ? 'bg-primary/5' : ''}`}
                        onClick={() => {
                          if (slotAppts.length === 0) handleCreateAppointmentFromSlot(date, slot)
                        }}
                      >
                        {slotAppts.map(a => (
                          <div
                            key={a.id}
                            className="text-xs leading-tight rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer text-white"
                            style={{ backgroundColor: TYPE_COLORS[a.type] || '#6b7280', height: `${Math.max((a.duration / 30) * 24, 24)}px` }}
                            onClick={(e) => { e.stopPropagation(); setSelected(a); setDetailOpen(true) }}
                          >
                            <div className="font-medium truncate">{a.time} {a.clientName}</div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Appointments List ────────────────────────────────────── */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('appointments.searchPlaceholder') || 'Pretraži zakazivanja...'} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('appointments.allStatuses') || 'Svi statusi'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('appointments.allStatuses') || 'Svi statusi'}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('appointments.allTypes') || 'Svi tipovi'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('appointments.allTypes') || 'Svi tipovi'}</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-[140px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" className="w-[140px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} {t('appointments.selected') || 'odabrano'}</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('confirmed')}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />{t('appointments.confirmSelected') || 'Potvrdi'}</Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('cancelled')}><XCircle className="h-3.5 w-3.5 mr-1" />{t('appointments.cancelSelected') || 'Otkaži'}</Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="h-3.5 w-3.5 mr-1" />{t('appointments.deleteSelected') || 'Obriši'}</Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground" />}
              message={t('appointments.noAppointments') || 'Nema zakazivanja'}
              actionLabel={t('appointments.createFirst') || 'Kreiraj termin'}
              onAction={() => setDialogOpen(true)}
            />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3 w-8"><Checkbox checked={selectedIds.size === items.length && items.length > 0} onCheckedChange={toggleSelectAll} /></th>
                    <th className="p-3">{t('appointments.titleCol') || 'Naslov'}</th>
                    <th className="p-3">{t('appointments.clientCol') || 'Klijent'}</th>
                    <th className="p-3 hidden lg:table-cell">{t('appointments.phoneCol') || 'Telefon'}</th>
                    <th className="p-3">{t('appointments.dateCol') || 'Datum'}</th>
                    <th className="p-3">{t('appointments.timeCol') || 'Vreme'}</th>
                    <th className="p-3 hidden md:table-cell">{t('appointments.durationCol') || 'Trajanje'}</th>
                    <th className="p-3 hidden md:table-cell">{t('appointments.typeCol') || 'Tip'}</th>
                    <th className="p-3 hidden xl:table-cell">{t('appointments.staffCol') || 'Zaposleni'}</th>
                    <th className="p-3">{t('appointments.statusCol') || 'Status'}</th>
                    <th className="p-3">{t('appointments.actionsCol') || 'Akcije'}</th>
                  </tr></thead>
                  <tbody>{items.map((a) => (
                    <tr key={a.id} className="border-t hover:bg-muted/30">
                      <td className="p-3"><Checkbox checked={selectedIds.has(a.id)} onCheckedChange={() => toggleSelect(a.id)} /></td>
                      <td className="p-3 font-medium">{a.title}</td>
                      <td className="p-3">{a.clientName}</td>
                      <td className="p-3 text-xs hidden lg:table-cell">{a.clientPhone || '—'}</td>
                      <td className="p-3 text-xs">{new Date(a.date).toLocaleDateString('sr-RS')}</td>
                      <td className="p-3 text-xs">{a.time}</td>
                      <td className="p-3 text-xs hidden md:table-cell">{a.duration} min</td>
                      <td className="p-3 hidden md:table-cell"><Badge variant="outline" className="text-xs" style={{ borderColor: TYPE_COLORS[a.type], color: TYPE_COLORS[a.type] }}>{TYPE_LABELS[a.type] || a.type}</Badge></td>
                      <td className="p-3 text-xs hidden xl:table-cell">{a.assignedTo || '—'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-0.5">
                          <StatusBadge status={a.status} />
                          <ReminderBadge status={a.reminderStatus} />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-0.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(a); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          {STATUS_CONFIG[a.status]?.nextStatus && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(a.id, STATUS_CONFIG[a.status].nextStatus!)}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(a); setRescheduleOpen(true); setRescheduleDate(a.date); setRescheduleTime(a.time) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Tab 4: Clients ──────────────────────────────────────────────── */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('appointments.searchClients') || 'Pretraži klijente...'} className="pl-9" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setNewClientDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1" /> {t('appointments.addClient') || 'Dodaj klijenta'}
            </Button>
          </div>

          {filteredClients.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('appointments.noClients') || 'Nema klijenata'}</p>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">{t('appointments.clientName') || 'Ime'}</th>
                    <th className="p-3 hidden md:table-cell">{t('appointments.clientPhone') || 'Telefon'}</th>
                    <th className="p-3 hidden lg:table-cell">{t('appointments.clientEmail') || 'Email'}</th>
                    <th className="p-3">{t('appointments.clientAppointments') || 'Termini'}</th>
                    <th className="p-3 hidden md:table-cell">{t('appointments.clientSpent') || 'Potrošeno'}</th>
                    <th className="p-3 hidden lg:table-cell">{t('appointments.clientLastVisit') || 'Poslednja poseta'}</th>
                    <th className="p-3">{t('appointments.clientType') || 'Tip'}</th>
                    <th className="p-3">{t('appointments.actionsCol') || 'Akcije'}</th>
                  </tr></thead>
                  <tbody>{filteredClients.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-xs hidden md:table-cell">{c.phone}</td>
                      <td className="p-3 text-xs hidden lg:table-cell">{c.email}</td>
                      <td className="p-3">{c.appointmentCount}</td>
                      <td className="p-3 hidden md:table-cell">{formatRSD(c.totalSpent)}</td>
                      <td className="p-3 text-xs hidden lg:table-cell">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('sr-RS') : '—'}</td>
                      <td className="p-3">
                        {c.isVip ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs"><Star className="h-2.5 w-2.5 mr-0.5" />VIP</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">{t('appointments.regular') || 'Redovan'}</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedClient(c); setClientDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Tab 5: Services ─────────────────────────────────────────────── */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('appointments.servicesCount') || `Ukupno usluga: ${services.length}`}</p>
            <Button size="sm" onClick={() => { setEditingService(null); setServiceForm(emptyServiceForm); setServiceDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" /> {t('appointments.addService') || 'Dodaj uslugu'}
            </Button>
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[key] }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {services.length === 0 ? (
            <Card className="p-8 text-center">
              <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('appointments.noServices') || 'Nema usluga'}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <Card key={s.id} className="overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: CATEGORY_COLORS[s.category] || '#6b7280' }} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{s.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingService(s); setServiceForm({ name: s.name, description: s.description, duration: s.duration, price: s.price, category: s.category }); setServiceDialogOpen(true) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">{t('appointments.duration') || 'Trajanje'}</div>
                        <div className="text-sm font-medium">{s.duration} min</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t('appointments.price') || 'Cena'}</div>
                        <div className="text-sm font-medium">{formatRSD(s.price)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t('appointments.bookings') || 'Rezervacije'}</div>
                        <div className="text-sm font-medium">{s.bookingCount}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs" style={{ borderColor: CATEGORY_COLORS[s.category], color: CATEGORY_COLORS[s.category] }}>
                      {CATEGORY_LABELS[s.category] || s.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Tab 6: Settings ─────────────────────────────────────────────── */}
        <TabsContent value="settings" className="space-y-6">
          {/* Working Hours */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('appointments.workingHours') || 'Radno vreme'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('appointments.workStart') || 'Početak'}</Label>
                  <Input type="time" value={settings.workStart} onChange={(e) => setSettings(s => ({ ...s, workStart: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('appointments.workEnd') || 'Kraj'}</Label>
                  <Input type="time" value={settings.workEnd} onChange={(e) => setSettings(s => ({ ...s, workEnd: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('appointments.lunchStart') || 'Početak pauze'}</Label>
                  <Input type="time" value={settings.lunchStart} onChange={(e) => setSettings(s => ({ ...s, lunchStart: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('appointments.lunchEnd') || 'Kraj pauze'}</Label>
                  <Input type="time" value={settings.lunchEnd} onChange={(e) => setSettings(s => ({ ...s, lunchEnd: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot & Buffer */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('appointments.slotConfig') || 'Konfiguracija termina'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('appointments.slotDuration') || 'Trajanje slota'}</Label>
                  <Select value={String(settings.slotDuration)} onValueChange={(v) => setSettings(s => ({ ...s, slotDuration: parseInt(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('appointments.bufferTime') || 'Vreme između termina (min)'}</Label>
                  <Select value={String(settings.bufferTime)} onValueChange={(v) => setSettings(s => ({ ...s, bufferTime: parseInt(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 min</SelectItem>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Reminder */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('appointments.autoReminder') || 'Automatski podsetnici'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('appointments.reminder24h') || 'Podsetnik 24h pre'}</span>
                </div>
                <Switch checked={settings.reminder24h} onCheckedChange={(v) => setSettings(s => ({ ...s, reminder24h: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('appointments.reminder1h') || 'Podsetnik 1h pre'}</span>
                </div>
                <Switch checked={settings.reminder1h} onCheckedChange={(v) => setSettings(s => ({ ...s, reminder1h: v }))} />
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('appointments.cancelPolicy') || 'Politika otkazivanja'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('appointments.cancelMaxHours') || 'Maks. sati pre otkazivanja'}</Label>
                  <Input type="number" value={settings.cancelMaxHours} onChange={(e) => setSettings(s => ({ ...s, cancelMaxHours: parseInt(e.target.value) || 24 }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('appointments.cancelPenalty') || 'Kazna za kasno otkazivanje (RSD)'}</Label>
                  <Input type="number" value={settings.cancelPenalty} onChange={(e) => setSettings(s => ({ ...s, cancelPenalty: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking URL */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{t('appointments.bookingUrl') || 'URL za rezervacije'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input value={settings.bookingUrl} onChange={(e) => setSettings(s => ({ ...s, bookingUrl: e.target.value }))} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">{t('appointments.bookingUrlHint') || 'Delite ovaj URL sa klijentima za online rezervacije'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Staff Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">{t('appointments.staffManagement') || 'Upravljanje zaposlenima'}</CardTitle>
              <Button size="sm" onClick={() => { setEditingStaff(null); setStaffForm(emptyStaffForm); setStaffDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" /> {t('appointments.addStaff') || 'Dodaj'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        <Badge variant="outline" className={`text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {s.isActive ? (t('appointments.active') || 'Aktivan') : (t('appointments.inactive') || 'Neaktivan')}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t('appointments.specialties') || 'Specijalizacije'}: {s.specialties}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.workingDays.map(d => DAYS_SR[d]).join(', ')} · {t('appointments.maxPerDay') || 'Max/dan'}: {s.maxPerDay}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingStaff(s); setStaffForm({ name: s.name, specialties: s.specialties, workingDays: [...s.workingDays], maxPerDay: s.maxPerDay, isActive: s.isActive }); setStaffDialogOpen(true) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create/Edit Appointment Dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('appointments.newAppointment') || 'Novi termin'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appointments.titleCol') || 'Naslov'}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('appointments.titlePlaceholder') || 'Naslov termina'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.clientCol') || 'Klijent'}</Label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder={t('appointments.clientPlaceholder') || 'Ime klijenta'} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.phoneCol') || 'Telefon'}</Label>
                <Input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder={t('appointments.phonePlaceholder') || 'Broj telefona'} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.dateCol') || 'Datum'}</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.timeCol') || 'Vreme'}</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.durationCol') || 'Trajanje (min)'}</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.typeCol') || 'Tip'}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.staffCol') || 'Zaduzeni'}</Label>
                <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                  <SelectTrigger><SelectValue placeholder={t('appointments.selectStaff') || 'Izaberite'} /></SelectTrigger>
                  <SelectContent>
                    {staff.filter(s => s.isActive).map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.notes') || 'Napomene'}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('appointments.cancel') || 'Otkaži'}</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('appointments.create') || 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('appointments.appointmentDetails') || 'Detalji termina'}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('appointments.titleCol') || 'Naslov'}:</span> <span className="font-medium">{selected.title}</span></div>
                <div><span className="text-muted-foreground">{t('appointments.statusCol') || 'Status'}:</span> <StatusBadge status={selected.status} /></div>
                <div><span className="text-muted-foreground">{t('appointments.clientCol') || 'Klijent'}:</span> {selected.clientName}</div>
                <div><span className="text-muted-foreground">{t('appointments.typeCol') || 'Tip'}:</span> {TYPE_LABELS[selected.type] || selected.type}</div>
                <div><span className="text-muted-foreground">{t('appointments.dateCol') || 'Datum'}:</span> {new Date(selected.date).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">{t('appointments.timeCol') || 'Vreme'}:</span> {selected.time} ({selected.duration} min)</div>
                {selected.assignedTo && (
                  <div><span className="text-muted-foreground">{t('appointments.staffCol') || 'Zaduzeni'}:</span> {selected.assignedTo}</div>
                )}
                {selected.clientPhone && (
                  <div className="flex items-center gap-1"><span className="text-muted-foreground">{t('appointments.phoneCol') || 'Telefon'}:</span><Phone className="h-3 w-3" /> {selected.clientPhone}</div>
                )}
                {selected.clientEmail && (
                  <div className="flex items-center gap-1"><span className="text-muted-foreground">{t('appointments.clientEmail') || 'Email'}:</span><Mail className="h-3 w-3" /> {selected.clientEmail}</div>
                )}
              </div>
              <Separator />
              {selected.notes && (
                <div className="text-sm"><span className="text-muted-foreground">{t('appointments.notes') || 'Napomene'}:</span> {selected.notes}</div>
              )}
              <div className="flex gap-2">
                {STATUS_CONFIG[selected.status]?.nextStatus && (
                  <Button size="sm" className="flex-1" onClick={() => { handleUpdateStatus(selected.id, STATUS_CONFIG[selected.status].nextStatus!); setDetailOpen(false) }}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> {STATUS_CONFIG[STATUS_CONFIG[selected.status].nextStatus!]?.label || 'Napred'}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setDetailOpen(false); setRescheduleOpen(true); setRescheduleDate(selected.date); setRescheduleTime(selected.time) }}>
                  <Edit3 className="h-4 w-4 mr-1" /> {t('appointments.reschedule') || 'Prebaci'}
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { handleDelete(selected.id); setDetailOpen(false) }}>
                  <Trash2 className="h-4 w-4 mr-1" /> {t('appointments.delete') || 'Obriši'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Reschedule Dialog ─────────────────────────────────────────────── */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('appointments.reschedule') || 'Premesti termin'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appointments.dateCol') || 'Datum'}</Label>
              <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.timeCol') || 'Vreme'}</Label>
              <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>{t('appointments.cancel') || 'Otkaži'}</Button>
            <Button onClick={handleReschedule}>{t('appointments.save') || 'Sačuvaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Client Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={clientDetailOpen} onOpenChange={setClientDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('appointments.clientDetails') || 'Detalji klijenta'}</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                  {selectedClient.isVip && <Badge className="bg-amber-100 text-amber-700 text-xs mt-1"><Star className="h-3 w-3 mr-0.5" />VIP</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedClient.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedClient.email}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-xs text-muted-foreground">{t('appointments.clientAppointments') || 'Termini'}</div><div className="text-lg font-bold">{selectedClient.appointmentCount}</div></div>
                <div><div className="text-xs text-muted-foreground">{t('appointments.clientSpent') || 'Potrošeno'}</div><div className="text-lg font-bold">{formatRSD(selectedClient.totalSpent)}</div></div>
                <div><div className="text-xs text-muted-foreground">{t('appointments.clientLastVisit') || 'Poslednja poseta'}</div><div className="text-sm font-bold">{selectedClient.lastVisit ? new Date(selectedClient.lastVisit).toLocaleDateString('sr-RS') : '—'}</div></div>
              </div>
              <Separator />
              {selectedClient.notes && (
                <div className="text-sm"><span className="text-muted-foreground">{t('appointments.notes') || 'Napomene'}:</span> {selectedClient.notes}</div>
              )}
              {selectedClient.preferences && (
                <div className="text-sm"><span className="text-muted-foreground">{t('appointments.preferences') || 'Preferencije'}:</span> {selectedClient.preferences}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── New Client Dialog ─────────────────────────────────────────────── */}
      <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('appointments.addClient') || 'Dodaj klijenta'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appointments.clientName') || 'Ime'}</Label>
              <Input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.clientPhone') || 'Telefon'}</Label>
                <Input value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.clientEmail') || 'Email'}</Label>
                <Input value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.notes') || 'Napomene'}</Label>
              <Textarea value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.preferences') || 'Preferencije'}</Label>
              <Textarea value={clientForm.preferences} onChange={(e) => setClientForm({ ...clientForm, preferences: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClientDialogOpen(false)}>{t('appointments.cancel') || 'Otkaži'}</Button>
            <Button onClick={handleSaveNewClient}>{t('appointments.save') || 'Sačuvaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Service Dialog ────────────────────────────────────────────────── */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingService ? (t('appointments.editService') || 'Izmeni uslugu') : (t('appointments.addService') || 'Dodaj uslugu')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appointments.serviceName') || 'Naziv'}</Label>
              <Input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.serviceDesc') || 'Opis'}</Label>
              <Textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.durationCol') || 'Trajanje (min)'}</Label>
                <Input type="number" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 30 })} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.price') || 'Cena (RSD)'}</Label>
                <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>{t('appointments.category') || 'Kategorija'}</Label>
                <Select value={serviceForm.category} onValueChange={(v) => setServiceForm({ ...serviceForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>{t('appointments.cancel') || 'Otkaži'}</Button>
            <Button onClick={handleSaveService}>{t('appointments.save') || 'Sačuvaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Staff Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingStaff ? (t('appointments.editStaff') || 'Izmeni zaposlenog') : (t('appointments.addStaff') || 'Dodaj zaposlenog')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('appointments.staffName') || 'Ime'}</Label>
              <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.specialties') || 'Specijalizacije'}</Label>
              <Input value={staffForm.specialties} onChange={(e) => setStaffForm({ ...staffForm, specialties: e.target.value })} placeholder="Konsultacije, Tretmani..." />
            </div>
            <div className="space-y-2">
              <Label>{t('appointments.workingDays') || 'Radni dani'}</Label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map(day => (
                  <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={staffForm.workingDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStaffForm(prev => ({ ...prev, workingDays: [...prev.workingDays, day] }))
                        } else {
                          setStaffForm(prev => ({ ...prev, workingDays: prev.workingDays.filter(d => d !== day) }))
                        }
                      }}
                    />
                    <span className="text-sm">{DAYS_FULL[day]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('appointments.maxPerDay') || 'Max termina/dan'}</Label>
                <Input type="number" value={staffForm.maxPerDay} onChange={(e) => setStaffForm({ ...staffForm, maxPerDay: parseInt(e.target.value) || 8 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={staffForm.isActive} onCheckedChange={(v) => setStaffForm({ ...staffForm, isActive: v })} />
                <Label>{t('appointments.active') || 'Aktivan'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>{t('appointments.cancel') || 'Otkaži'}</Button>
            <Button onClick={handleSaveStaff}>{t('appointments.save') || 'Sačuvaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
