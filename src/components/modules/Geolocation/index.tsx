 
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import {
  MapPin, Plus, Search, Eye, Trash2, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, BarChart3, CalendarDays, Users, Filter, Globe,
  Battery, BatteryWarning, BatteryFull, Navigation, Shield, Bell,
  TrendingUp, Map, Crosshair, Circle, Hexagon, Target
} from 'lucide-react'

// ============ TYPES ============

interface TrackedEmployee {
  id: string
  name: string
  department: string
  position: string
  phone: string
  isTracked: boolean
  lastLatitude: number | null
  lastLongitude: number | null
  lastLocationName: string | null
  lastLocationAt: string | null
  batteryLevel: number
  speed: number | null
  isOnline: boolean
  distanceToday: number
  notes: string | null
  createdAt: string
}

interface Geofence {
  id: string
  name: string
  type: 'circle' | 'polygon'
  latitude: number
  longitude: number
  radius: number | null
  color: string
  status: 'active' | 'inactive'
  assignedEmployees: string[]
  notifyEnter: boolean
  notifyExit: boolean
  scheduleStart: string | null
  scheduleEnd: string | null
  notes: string | null
  createdAt: string
}

interface LocationEvent {
  id: string
  employeeId: string
  employeeName: string
  eventType: 'check_in' | 'check_out' | 'geofence_enter' | 'geofence_exit' | 'idle' | 'speeding' | 'offline'
  latitude: number
  longitude: number
  locationName: string | null
  address: string | null
  timestamp: string
  batteryLevel: number
  speed: number | null
  notes: string | null
}

interface LocationAlert {
  id: string
  employeeId: string
  employeeName: string
  type: 'geofence_exit' | 'geofence_enter' | 'speeding' | 'idle' | 'low_battery' | 'offline'
  severity: 'info' | 'warning' | 'critical'
  message: string
  acknowledged: boolean
  createdAt: string
}

// ============ MOCK DATA ============

const MOCK_EMPLOYEES: TrackedEmployee[] = [
  { id: 'e1', name: 'Marko Petrović', department: 'Dostava', position: 'Vozač dostave', phone: '+381631234567', isTracked: true, lastLatitude: 44.8176, lastLongitude: 20.4633, lastLocationName: 'Terazije, Beograd', lastLocationAt: new Date(Date.now() - 300000).toISOString(), batteryLevel: 82, speed: 35, isOnline: true, distanceToday: 47.2, notes: null, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'e2', name: 'Ana Jovanović', department: 'Prodaja', position: 'Terenski predstavnik', phone: '+381642345678', isTracked: true, lastLatitude: 44.7866, lastLongitude: 20.4489, lastLocationName: 'Novi Beograd', lastLocationAt: new Date(Date.now() - 600000).toISOString(), batteryLevel: 65, speed: 0, isOnline: true, distanceToday: 23.8, notes: null, createdAt: '2024-02-01T10:00:00Z' },
  { id: 'e3', name: 'Nikola Stanković', department: 'Servis', position: 'Tehničar', phone: '+381653456789', isTracked: true, lastLatitude: 44.8023, lastLongitude: 20.4655, lastLocationName: 'Dorćol, Beograd', lastLocationAt: new Date(Date.now() - 120000).toISOString(), batteryLevel: 91, speed: 42, isOnline: true, distanceToday: 68.5, notes: null, createdAt: '2024-03-10T10:00:00Z' },
  { id: 'e4', name: 'Jelena Milić', department: 'Logistika', position: 'Koordinator logistike', phone: '+381664567890', isTracked: true, lastLatitude: 44.8100, lastLongitude: 20.4700, lastLocationName: 'Vračar, Beograd', lastLocationAt: new Date(Date.now() - 900000).toISOString(), batteryLevel: 28, speed: 0, isOnline: true, distanceToday: 12.3, notes: 'Baterija niska - potrebno punjenje', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'e5', name: 'Stefan Nikolić', department: 'Instalacije', position: 'Električar', phone: '+381615678901', isTracked: false, lastLatitude: null, lastLongitude: null, lastLocationName: null, lastLocationAt: null, batteryLevel: 0, speed: null, isOnline: false, distanceToday: 0, notes: 'Praćenje deaktivirano po zahtevu', createdAt: '2024-04-05T10:00:00Z' },
  { id: 'e6', name: 'Ivana Đorđević', department: 'Dostava', position: 'Vozač dostave', phone: '+381626789012', isTracked: true, lastLatitude: 44.7900, lastLongitude: 20.4400, lastLocationName: 'Zemun, Beograd', lastLocationAt: new Date(Date.now() - 480000).toISOString(), batteryLevel: 54, speed: 28, isOnline: true, distanceToday: 55.1, notes: null, createdAt: '2024-02-15T10:00:00Z' },
  { id: 'e7', name: 'Dragan Simić', department: 'Servis', position: 'Serviser', phone: '+381637890123', isTracked: true, lastLatitude: 44.8250, lastLongitude: 20.4800, lastLocationName: 'Palilula, Beograd', lastLocationAt: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 15, speed: null, isOnline: false, distanceToday: 31.4, notes: 'Offline od 2 sata', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'e8', name: 'Maja Popović', department: 'Prodaja', position: 'Komercijalista', phone: '+381648901234', isTracked: true, lastLatitude: 44.8150, lastLongitude: 20.4550, lastLocationName: 'Centar, Beograd', lastLocationAt: new Date(Date.now() - 180000).toISOString(), batteryLevel: 73, speed: 15, isOnline: true, distanceToday: 19.7, notes: null, createdAt: '2024-05-01T10:00:00Z' },
]

const MOCK_GEOFENCES: Geofence[] = [
  { id: 'gf1', name: 'Sedište firme', type: 'circle', latitude: 44.8176, longitude: 20.4633, radius: 200, color: '#3b82f6', status: 'active', assignedEmployees: ['e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8'], notifyEnter: false, notifyExit: true, scheduleStart: '08:00', scheduleEnd: '17:00', notes: 'Glavna zgrada', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'gf2', name: 'Magacin Zemun', type: 'circle', latitude: 44.8440, longitude: 20.4010, radius: 300, color: '#10b981', status: 'active', assignedEmployees: ['e1', 'e6'], notifyEnter: true, notifyExit: false, scheduleStart: null, scheduleEnd: null, notes: 'Skladište robe', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'gf3', name: 'Zona A dostava', type: 'polygon', latitude: 44.7900, longitude: 20.4500, radius: null, color: '#f59e0b', status: 'active', assignedEmployees: ['e1', 'e6'], notifyEnter: false, notifyExit: true, scheduleStart: '07:00', scheduleEnd: '20:00', notes: 'Zone centralnog Beograda za dostavu', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'gf4', name: 'Klijent Delta', type: 'circle', latitude: 44.8121, longitude: 20.4700, radius: 100, color: '#8b5cf6', status: 'active', assignedEmployees: ['e3', 'e7'], notifyEnter: true, notifyExit: true, scheduleStart: '09:00', scheduleEnd: '16:00', notes: 'Lokacija klijenta za servis', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'gf5', name: 'Zona B dostava', type: 'polygon', latitude: 44.8300, longitude: 20.4900, radius: null, color: '#ef4444', status: 'inactive', assignedEmployees: ['e1'], notifyEnter: false, notifyExit: true, scheduleStart: null, scheduleEnd: null, notes: 'Privremeno neaktivna zona', createdAt: '2024-05-01T10:00:00Z' },
  { id: 'gf6', name: 'Parking firme', type: 'circle', latitude: 44.8180, longitude: 20.4640, radius: 80, color: '#06b6d4', status: 'active', assignedEmployees: ['e1', 'e2', 'e3', 'e6', 'e8'], notifyEnter: true, notifyExit: true, scheduleStart: '06:00', scheduleEnd: '22:00', notes: 'Firmeni parking', createdAt: '2024-01-15T10:00:00Z' },
]

const MOCK_EVENTS: LocationEvent[] = [
  { id: 'ev1', employeeId: 'e1', employeeName: 'Marko Petrović', eventType: 'check_in', latitude: 44.8176, longitude: 20.4633, locationName: 'Sedište firme', address: 'Terazije 1, Beograd', timestamp: new Date(Date.now() - 28800000).toISOString(), batteryLevel: 95, speed: 0, notes: null },
  { id: 'ev2', employeeId: 'e1', employeeName: 'Marko Petrović', eventType: 'geofence_exit', latitude: 44.8178, longitude: 20.4635, locationName: 'Sedište firme', address: 'Terazije, Beograd', timestamp: new Date(Date.now() - 25200000).toISOString(), batteryLevel: 93, speed: 15, notes: 'Izlazak na dostavu' },
  { id: 'ev3', employeeId: 'e3', employeeName: 'Nikola Stanković', eventType: 'geofence_enter', latitude: 44.8121, longitude: 20.4700, locationName: 'Klijent Delta', address: 'Delta City, Beograd', timestamp: new Date(Date.now() - 18000000).toISOString(), batteryLevel: 88, speed: 5, notes: null },
  { id: 'ev4', employeeId: 'e6', employeeName: 'Ivana Đorđević', eventType: 'check_out', latitude: 44.8440, longitude: 20.4010, locationName: 'Magacin Zemun', address: 'Zemun, Beograd', timestamp: new Date(Date.now() - 14400000).toISOString(), batteryLevel: 60, speed: 0, notes: 'Završena preuzimanja' },
  { id: 'ev5', employeeId: 'e7', employeeName: 'Dragan Simić', eventType: 'offline', latitude: 44.8250, longitude: 20.4800, locationName: 'Palilula, Beograd', address: 'Palilula, Beograd', timestamp: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 15, speed: null, notes: 'Gubitak signala' },
  { id: 'ev6', employeeId: 'e2', employeeName: 'Ana Jovanović', eventType: 'check_in', latitude: 44.7866, longitude: 20.4489, locationName: 'Novi Beograd', address: 'Bulevar Mihajla Pupina, Beograd', timestamp: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 70, speed: 0, notes: 'Početak posete klijentu' },
  { id: 'ev7', employeeId: 'e4', employeeName: 'Jelena Milić', eventType: 'idle', latitude: 44.8100, longitude: 20.4700, locationName: 'Vračar, Beograd', address: 'Vračar, Beograd', timestamp: new Date(Date.now() - 3600000).toISOString(), batteryLevel: 28, speed: 0, notes: 'Neaktivnost >30 min' },
  { id: 'ev8', employeeId: 'e8', employeeName: 'Maja Popović', eventType: 'speeding', latitude: 44.8150, longitude: 20.4550, locationName: 'Centar, Beograd', address: 'Knez Mihailova, Beograd', timestamp: new Date(Date.now() - 5400000).toISOString(), batteryLevel: 76, speed: 72, notes: 'Prekoračenje brzine' },
]

const MOCK_ALERTS: LocationAlert[] = [
  { id: 'la1', employeeId: 'e7', employeeName: 'Dragan Simić', type: 'offline', severity: 'critical', message: 'Dragan Simić je offline već 2 sata', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'la2', employeeId: 'e4', employeeName: 'Jelena Milić', type: 'low_battery', severity: 'warning', message: 'Jelena Milić - baterija na 28%', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'la3', employeeId: 'e8', employeeName: 'Maja Popović', type: 'speeding', severity: 'warning', message: 'Maja Popović - brzina 72 km/h u zoni 50 km/h', acknowledged: true, createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: 'la4', employeeId: 'e1', employeeName: 'Marko Petrović', type: 'geofence_exit', severity: 'info', message: 'Marko Petrović je napustio geo-ograničenje Sedište firme', acknowledged: true, createdAt: new Date(Date.now() - 25200000).toISOString() },
  { id: 'la5', employeeId: 'e4', employeeName: 'Jelena Milić', type: 'idle', severity: 'info', message: 'Jelena Milić je neaktivna više od 30 minuta', acknowledged: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'la6', employeeId: 'e7', employeeName: 'Dragan Simić', type: 'low_battery', severity: 'critical', message: 'Dragan Simić - baterija na 15%, kritično niska', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
]

// ============ HELPERS ============

const getBatteryIcon = (level: number) => {
  if (level > 80) return <BatteryFull className="h-4 w-4 text-green-500" />
  if (level > 30) return <Battery className="h-4 w-4 text-green-500" />
  if (level > 15) return <BatteryWarning className="h-4 w-4 text-amber-500" />
  return <BatteryWarning className="h-4 w-4 text-red-500" />
}

const getBatteryColor = (level: number) => {
  if (level > 80) return 'bg-green-500'
  if (level > 30) return 'bg-yellow-500'
  if (level > 15) return 'bg-amber-500'
  return 'bg-red-500'
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  check_in: { label: 'Dolazak', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  check_out: { label: 'Odlazak', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  geofence_enter: { label: 'Ulazak u zonu', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: MapPin },
  geofence_exit: { label: 'Izlazak iz zone', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: MapPin },
  idle: { label: 'Neaktivnost', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: Clock },
  speeding: { label: 'Prekoračenje brzine', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Bell },
}

const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  geofence_exit: { label: 'Izlazak iz zone', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  geofence_enter: { label: 'Ulazak u zonu', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  speeding: { label: 'Prebrza vožnja', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  idle: { label: 'Neaktivnost', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  low_battery: { label: 'Niska baterija', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  offline: { label: 'Offline', color: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
)

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Upravo sada'
  if (mins < 60) return `Pre ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Pre ${hours} h`
  return `Pre ${Math.floor(hours / 24)} d`
}

// ============ MAIN COMPONENT ============

export function Geolocation() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [employees, setEmployees] = useState<TrackedEmployee[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [events, setEvents] = useState<LocationEvent[]>([])
  const [alerts, setAlerts] = useState<LocationAlert[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEventType, setFilterEventType] = useState('all')

  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false)
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<TrackedEmployee | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null)

  const [geofenceForm, setGeofenceForm] = useState({
    name: '', type: 'circle' as 'circle' | 'polygon', latitude: '', longitude: '',
    radius: '', color: '#3b82f6', status: 'active' as 'active' | 'inactive',
    notifyEnter: true, notifyExit: true, scheduleStart: '', scheduleEnd: '', notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/geolokacija/employees')
      if (res.ok) {
        setEmployees(await res.json())
      } else {
        setEmployees(MOCK_EMPLOYEES)
      }
    } catch {
      setEmployees(MOCK_EMPLOYEES)
    }
    try {
      const res = await fetch('/api/geolokacija/geofences')
      if (res.ok) {
        setGeofences(await res.json())
      } else {
        setGeofences(MOCK_GEOFENCES)
      }
    } catch {
      setGeofences(MOCK_GEOFENCES)
    }
    try {
      const res = await fetch('/api/geolokacija/events')
      if (res.ok) {
        setEvents(await res.json())
      } else {
        setEvents(MOCK_EVENTS)
      }
    } catch {
      setEvents(MOCK_EVENTS)
    }
    setAlerts(MOCK_ALERTS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const stats = (() => {
    const tracked = employees.filter(e => e.isTracked).length
    const online = employees.filter(e => e.isOnline && e.isTracked).length
    const activeGeofences = geofences.filter(g => g.status === 'active').length
    const alertsToday = alerts.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length
    const unackAlerts = alerts.filter(a => !a.acknowledged).length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
    const totalDistance = employees.reduce((sum, e) => sum + e.distanceToday, 0)
    const lowBattery = employees.filter(e => e.isTracked && e.batteryLevel > 0 && e.batteryLevel <= 20).length
    const departments = [...new Set(employees.map(e => e.department))]
    return { tracked, online, activeGeofences, alertsToday, unackAlerts, criticalAlerts, totalDistance, lowBattery, departments }
  })()

  const filteredEmployees = (() => {
    let result = [...employees]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        (e.lastLocationName || '').toLowerCase().includes(q)
      )
    }
    if (filterDept !== 'all') result = result.filter(e => e.department === filterDept)
    if (filterStatus === 'tracked') result = result.filter(e => e.isTracked)
    if (filterStatus === 'untracked') result = result.filter(e => !e.isTracked)
    if (filterStatus === 'online') result = result.filter(e => e.isOnline && e.isTracked)
    if (filterStatus === 'offline') result = result.filter(e => !e.isOnline || !e.isTracked)
    return result
  })()

  const filteredEvents = (() => {
    let result = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    if (filterEventType !== 'all') result = result.filter(e => e.eventType === filterEventType)
    return result
  })()

  const openGeofenceDialog = (geofence?: Geofence) => {
    if (geofence) {
      setSelectedGeofence(geofence)
      setGeofenceForm({
        name: geofence.name, type: geofence.type, latitude: geofence.latitude.toString(),
        longitude: geofence.longitude.toString(), radius: geofence.radius?.toString() || '',
        color: geofence.color, status: geofence.status, notifyEnter: geofence.notifyEnter,
        notifyExit: geofence.notifyExit, scheduleStart: geofence.scheduleStart || '',
        scheduleEnd: geofence.scheduleEnd || '', notes: geofence.notes || '',
      })
    } else {
      setSelectedGeofence(null)
      setGeofenceForm({ name: '', type: 'circle', latitude: '', longitude: '', radius: '', color: '#3b82f6', status: 'active', notifyEnter: true, notifyExit: true, scheduleStart: '', scheduleEnd: '', notes: '' })
    }
    setGeofenceDialogOpen(true)
  }

  const handleSaveGeofence = () => {
    if (!geofenceForm.name.trim()) { toast.error('Naziv je obavezan'); return }
    if (!geofenceForm.latitude.trim()) { toast.error('Koordinate su obavezne'); return }
    const newGeofence: Geofence = {
      id: selectedGeofence?.id || `gf-${Date.now()}`,
      name: geofenceForm.name, type: geofenceForm.type,
      latitude: Number(geofenceForm.latitude), longitude: Number(geofenceForm.longitude),
      radius: geofenceForm.radius ? Number(geofenceForm.radius) : null,
      color: geofenceForm.color, status: geofenceForm.status,
      assignedEmployees: selectedGeofence?.assignedEmployees || [],
      notifyEnter: geofenceForm.notifyEnter, notifyExit: geofenceForm.notifyExit,
      scheduleStart: geofenceForm.scheduleStart || null, scheduleEnd: geofenceForm.scheduleEnd || null,
      notes: geofenceForm.notes || null, createdAt: selectedGeofence?.createdAt || new Date().toISOString(),
    }
    setGeofences(prev => selectedGeofence ? prev.map(g => g.id === selectedGeofence.id ? newGeofence : g) : [...prev, newGeofence])
    setGeofenceDialogOpen(false)
    toast.success(selectedGeofence ? 'Geo-ograničenje ažurirano' : 'Geo-ograničenje kreirano')
  }

  const handleDeleteGeofence = () => {
    if (!selectedGeofence) return
    setGeofences(prev => prev.filter(g => g.id !== selectedGeofence.id))
    setDeleteConfirmOpen(false)
    setSelectedGeofence(null)
    toast.success('Geo-ograničenje obrisano')
  }

  const handleToggleTracking = (employeeId: string) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, isTracked: !e.isTracked } : e))
    toast.success('Status praćenja ažuriran')
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    toast.success('Alert potvrđen')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Geolokacija
          </h1>
          <p className="text-sm text-muted-foreground">Praćenje lokacija zaposlenih, geo-ograničenja i aktivnosti</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => openGeofenceDialog()}><Plus className="h-4 w-4 mr-1" /> Novo ograničenje</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="employees"><Users className="h-3.5 w-3.5 mr-1" /> Zaposleni</TabsTrigger>
          <TabsTrigger value="geofences"><Target className="h-3.5 w-3.5 mr-1" /> Geo ograničenja</TabsTrigger>
          <TabsTrigger value="activities"><CalendarDays className="h-3.5 w-3.5 mr-1" /> Aktivnosti</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Praćeni zaposleni" value={stats.tracked} icon={Users} sub={`${stats.online} trenutno aktivnih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Aktivni sada" value={stats.online} icon={Navigation} sub={`od ${stats.tracked} praćenih`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Aktivna ograničenja" value={stats.activeGeofences} icon={Shield} sub={`od ${geofences.length} ukupno`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
            <KpiCard label="Alerti danas" value={stats.alertsToday} icon={AlertTriangle} sub={`${stats.unackAlerts} nepotvrđenih`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
          </div>

          {/* Critical Alerts Banner */}
          {stats.criticalAlerts > 0 && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-400">{stats.criticalAlerts} kritičnih upozorenja</span>
              </div>
              <div className="space-y-1">
                {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between text-sm text-red-700 dark:text-red-300">
                    <span>{alert.message}</span>
                    <Button size="sm" variant="outline" className="h-6 text-xs ml-2" onClick={() => handleAcknowledgeAlert(alert.id)}>Potvrdi</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Placeholder & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Map className="h-4 w-4" /> Mapa lokacija
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 h-64 flex flex-col items-center justify-center gap-3">
                  <MapPin className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Integracija sa mapom (Google Maps / OpenStreetMap)</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Circle className="h-2 w-2 text-green-500" /> {stats.online} aktivnih</span>
                    <span className="flex items-center gap-1"><Circle className="h-2 w-2 text-red-500" /> {stats.tracked - stats.online} offline</span>
                    <span className="flex items-center gap-1"><Hexagon className="h-3 w-3 text-purple-500" /> {stats.activeGeofences} zona</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Ukupna distanca danas</span>
                    <span className="font-semibold">{stats.totalDistance.toFixed(1)} km</span>
                  </div>
                  <Progress value={Math.min((stats.totalDistance / 300) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Niska baterija</span>
                    <span className="font-semibold text-amber-600">{stats.lowBattery} uređaja</span>
                  </div>
                  <Progress value={stats.lowBattery > 0 ? Math.min((stats.lowBattery / employees.length) * 100 * 5, 100) : 0} className="h-2" />
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground font-medium">Po departmanima</span>
                  {stats.departments.map(dept => {
                    const count = employees.filter(e => e.department === dept && e.isTracked).length
                    const online = employees.filter(e => e.department === dept && e.isOnline && e.isTracked).length
                    return (
                      <div key={dept} className="flex items-center justify-between text-xs">
                        <span>{dept}</span>
                        <span className="text-muted-foreground">{online}/{count} aktivnih</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Locations */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Poslednje lokacije</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employees.filter(e => e.isTracked && e.lastLocationName).sort((a, b) => {
                  const ta = a.lastLocationAt ? new Date(a.lastLocationAt).getTime() : 0
                  const tb = b.lastLocationAt ? new Date(b.lastLocationAt).getTime() : 0
                  return tb - ta
                }).slice(0, 5).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${emp.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.lastLocationName} · {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {emp.speed !== null && emp.speed > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{emp.speed} km/h</Badge>
                      )}
                      {getBatteryIcon(emp.batteryLevel)}
                      <span className="text-xs text-muted-foreground">{emp.lastLocationAt ? formatRelativeTime(emp.lastLocationAt) : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ZAPOSLENI ===== */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži zaposlene..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Departman" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi departmani</SelectItem>
                {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="tracked">Praćeni</SelectItem>
                <SelectItem value="untracked">Nepraćeni</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${emp.isOnline && emp.isTracked ? 'bg-green-500' : emp.isTracked ? 'bg-gray-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.position} · {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {emp.isTracked && emp.lastLocationName && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">Lokacija</p>
                          <p className="text-xs">{emp.lastLocationName}</p>
                        </div>
                      )}
                      {emp.isTracked && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Distanca</p>
                          <p className="text-xs">{emp.distanceToday} km</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {emp.isTracked && getBatteryIcon(emp.batteryLevel)}
                        {emp.isTracked && <span className="text-[10px] text-muted-foreground">{emp.batteryLevel}%</span>}
                      </div>
                      <Badge className={emp.isTracked ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>
                        {emp.isTracked ? 'Praćen' : 'Nepraćen'}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleToggleTracking(emp.id)}>
                        {emp.isTracked ? 'Pauziraj' : 'Pokreni'}
                      </Button>
                      {emp.isTracked && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedEmployee(emp); setEmployeeDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== GEO OGRANIČENJA ===== */}
        <TabsContent value="geofences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geofences.map(gf => (
              <Card key={gf.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gf.color }} />
                      <CardTitle className="text-sm">{gf.name}</CardTitle>
                    </div>
                    <Badge className={gf.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>
                      {gf.status === 'active' ? 'Aktivno' : 'Neaktivno'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tip</span>
                    <span className="flex items-center gap-1">
                      {gf.type === 'circle' ? <Circle className="h-3 w-3" /> : <Hexagon className="h-3 w-3" />}
                      {gf.type === 'circle' ? 'Krug' : 'Poligon'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Koordinate</span>
                    <span className="font-mono">{gf.latitude.toFixed(4)}, {gf.longitude.toFixed(4)}</span>
                  </div>
                  {gf.radius && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Radius</span>
                      <span>{gf.radius}m</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dodeljeno</span>
                    <span>{gf.assignedEmployees.length} zaposlenih</span>
                  </div>
                  {gf.scheduleStart && gf.scheduleEnd && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Raspored</span>
                      <span>{gf.scheduleStart} - {gf.scheduleEnd}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => openGeofenceDialog(gf)}>
                      Izmeni
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { setSelectedGeofence(gf); setDeleteConfirmOpen(true) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== AKTIVNOSTI ===== */}
        <TabsContent value="activities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Events Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Evidencija aktivnosti</span>
                <div className="flex items-center gap-1 ml-auto">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={filterEventType} onValueChange={setFilterEventType}>
                    <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi tipovi</SelectItem>
                      <SelectItem value="check_in">Dolazak</SelectItem>
                      <SelectItem value="check_out">Odlazak</SelectItem>
                      <SelectItem value="geofence_enter">Ulazak u zonu</SelectItem>
                      <SelectItem value="geofence_exit">Izlazak iz zone</SelectItem>
                      <SelectItem value="speeding">Prebrza vožnja</SelectItem>
                      <SelectItem value="idle">Neaktivnost</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredEvents.map(ev => {
                      const cfg = EVENT_TYPE_CONFIG[ev.eventType] || EVENT_TYPE_CONFIG.idle
                      const EventIcon = cfg.icon
                      return (
                        <div key={ev.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.color}`}>
                            <EventIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{ev.employeeName}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>{cfg.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ev.locationName || ev.address || `${ev.latitude.toFixed(4)}, ${ev.longitude.toFixed(4)}`}
                            </p>
                            {ev.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{ev.notes}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-medium">{formatTime(ev.timestamp)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatRelativeTime(ev.timestamp)}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              {getBatteryIcon(ev.batteryLevel)}
                              <span className="text-[10px] text-muted-foreground">{ev.batteryLevel}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Panel */}
            <div className="space-y-4">
              <span className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Alerti ({alerts.filter(a => !a.acknowledged).length})
              </span>
              <div className="space-y-2">
                {alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => {
                  const sevCfg = SEVERITY_CONFIG[alert.severity]
                  return (
                    <Card key={alert.id} className={`p-3 ${!alert.acknowledged ? 'border-l-4' : 'opacity-60'}`} style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{alert.employeeName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(alert.createdAt)}</p>
                        </div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] flex-shrink-0" onClick={() => handleAcknowledgeAlert(alert.id)}>
                            OK
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Geofence Dialog */}
      <Dialog open={geofenceDialogOpen} onOpenChange={setGeofenceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedGeofence ? 'Izmeni geo-ograničenje' : 'Novo geo-ograničenje'}</DialogTitle>
            <DialogDescription>{selectedGeofence ? 'Ažurirajte podatke o geo-ograničenju' : 'Definišite novo geo-ograničenje za praćenje'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Naziv</Label>
              <Input value={geofenceForm.name} onChange={(e) => setGeofenceForm({ ...geofenceForm, name: e.target.value })} placeholder="npr. Sedište firme" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tip</Label>
                <Select value={geofenceForm.type} onValueChange={(v) => setGeofenceForm({ ...geofenceForm, type: v as 'circle' | 'polygon' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Krug</SelectItem>
                    <SelectItem value="polygon">Poligon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={geofenceForm.status} onValueChange={(v) => setGeofenceForm({ ...geofenceForm, status: v as 'active' | 'inactive' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktivno</SelectItem>
                    <SelectItem value="inactive">Neaktivno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Latituda</Label>
                <Input type="number" step="0.0001" value={geofenceForm.latitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, latitude: e.target.value })} placeholder="44.8176" />
              </div>
              <div>
                <Label className="text-xs">Longituda</Label>
                <Input type="number" step="0.0001" value={geofenceForm.longitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, longitude: e.target.value })} placeholder="20.4633" />
              </div>
            </div>
            {geofenceForm.type === 'circle' && (
              <div>
                <Label className="text-xs">Radius (metri)</Label>
                <Input type="number" value={geofenceForm.radius} onChange={(e) => setGeofenceForm({ ...geofenceForm, radius: e.target.value })} placeholder="200" />
              </div>
            )}
            <div>
              <Label className="text-xs">Boja</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={geofenceForm.color} onChange={(e) => setGeofenceForm({ ...geofenceForm, color: e.target.value })} className="w-10 h-8 p-0.5 cursor-pointer" />
                <Input value={geofenceForm.color} onChange={(e) => setGeofenceForm({ ...geofenceForm, color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Vreme od</Label>
                <Input type="time" value={geofenceForm.scheduleStart} onChange={(e) => setGeofenceForm({ ...geofenceForm, scheduleStart: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Vreme do</Label>
                <Input type="time" value={geofenceForm.scheduleEnd} onChange={(e) => setGeofenceForm({ ...geofenceForm, scheduleEnd: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={geofenceForm.notifyEnter} onChange={(e) => setGeofenceForm({ ...geofenceForm, notifyEnter: e.target.checked })} className="rounded" />
                Notifikacija ulazak
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={geofenceForm.notifyExit} onChange={(e) => setGeofenceForm({ ...geofenceForm, notifyExit: e.target.checked })} className="rounded" />
                Notifikacija izlazak
              </label>
            </div>
            <div>
              <Label className="text-xs">Napomene</Label>
              <Textarea value={geofenceForm.notes} onChange={(e) => setGeofenceForm({ ...geofenceForm, notes: e.target.value })} placeholder="Opcionalne napomene..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeofenceDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSaveGeofence}>{selectedGeofence ? 'Sačuvaj izmene' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Dialog */}
      <Dialog open={employeeDetailOpen} onOpenChange={setEmployeeDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name}</DialogTitle>
            <DialogDescription>Detalji praćenja zaposlenog</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Pozicija</span>
                  <p className="font-medium">{selectedEmployee.position}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Departman</span>
                  <p className="font-medium">{selectedEmployee.department}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Telefon</span>
                  <p className="font-medium">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${selectedEmployee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium">{selectedEmployee.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Poslednja lokacija</span>
                  <span className="font-medium">{selectedEmployee.lastLocationName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Koordinate</span>
                  {selectedEmployee.lastLatitude ? (
                    <span className="font-mono text-xs">{selectedEmployee.lastLatitude.toFixed(4)}, {selectedEmployee.lastLongitude?.toFixed(4)}</span>
                  ) : <span>N/A</span>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vreme ažuriranja</span>
                  <span>{selectedEmployee.lastLocationAt ? formatTime(selectedEmployee.lastLocationAt) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Brzina</span>
                  <span>{selectedEmployee.speed !== null ? `${selectedEmployee.speed} km/h` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distanca danas</span>
                  <span>{selectedEmployee.distanceToday} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Baterija</span>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedEmployee.batteryLevel} className={`w-20 h-2 ${getBatteryColor(selectedEmployee.batteryLevel)}`} />
                    <span>{selectedEmployee.batteryLevel}%</span>
                  </div>
                </div>
              </div>
              {selectedEmployee.notes && (
                <div className="border-t pt-3">
                  <span className="text-xs text-muted-foreground">Napomene</span>
                  <p className="text-sm mt-1">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeDetailOpen(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Brisanje geo-ograničenja</DialogTitle>
            <DialogDescription>Da li ste sigurni da želite da obrišete &quot;{selectedGeofence?.name}&quot;? Ova radnja je nepovratna.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleDeleteGeofence}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
