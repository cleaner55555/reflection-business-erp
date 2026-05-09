 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Users, UserCheck, UserPlus, LogIn, LogOut, Clock, Search, Plus,
  Eye, Trash2, BarChart3, Phone, Mail, Building2, QrCode,
  BadgeCheck, CalendarDays, TrendingUp, Hourglass, ArrowRight,
  RefreshCw, ClipboardCheck, FileText, Printer
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

type VisitorStatus = 'expected' | 'checked_in' | 'checked_out' | 'cancelled'

interface Visitor {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  purpose: string
  department?: string
  hostName?: string
  hostId?: string
  status: VisitorStatus
  badgeNumber?: string
  expectedAt?: string
  checkedInAt?: string
  checkedOutAt?: string
  notes?: string
  isPreRegistered: boolean
  visitCount: number
  totalDuration?: number
  idDocument?: string
  vehiclePlate?: string
}

interface VisitorKPI {
  todayTotal: number
  checkedIn: number
  expected: number
  avgDuration: number
  weekTotal: number
  monthTotal: number
}

// ============ STATUS CONFIG ============

const statusConfig: Record<VisitorStatus, { label: string; color: string; icon: React.ElementType }> = {
  expected: { label: 'Očekivan', color: 'bg-amber-100 text-amber-700', icon: Clock },
  checked_in: { label: 'Prijavljen', color: 'bg-green-100 text-green-700', icon: LogIn },
  checked_out: { label: 'Odjavljen', color: 'bg-blue-100 text-blue-700', icon: LogOut },
  cancelled: { label: 'Otkazan', color: 'bg-red-100 text-red-700', icon: Trash2 },
}

const purposeLabels: Record<string, string> = {
  sastanak: 'Sastanak',
  intervju: 'Intervju',
  isporuka: 'Isporuka',
  servis: 'Servis',
  konsultacija: 'Konsultacija',
  poseta: 'Poseta',
  prezentacija: 'Prezentacija',
  kontrola: 'Kontrola kvaliteta',
  ostalo: 'Ostalo',
}

const departmentLabels: Record<string, string> = {
  management: 'Rukovodstvo',
  it: 'IT sektor',
  prodaja: 'Prodaja',
  marketing: 'Marketing',
  finansije: 'Finansije',
  hr: 'Ljudski resursi',
  proizvodnja: 'Proizvodnja',
  magacin: 'Magacin',
  podrška: 'Podrška',
}

// ============ MOCK DATA ============

const mockVisitors: Visitor[] = [
  {
    id: 'v-001', firstName: 'Marko', lastName: 'Nikolić', email: 'marko.nikolic@techcorp.rs',
    phone: '+381 63 123 4567', company: 'TechCorp d.o.o.', purpose: 'sastanak',
    department: 'it', hostName: 'Jovan Petrović', hostId: 'emp-01',
    status: 'checked_in', badgeNumber: 'POS-2025-042', expectedAt: '2025-07-15T09:00:00',
    checkedInAt: '2025-07-15T08:55:00', notes: 'Sastanak o saradnji na novom projektu',
    isPreRegistered: true, visitCount: 5, totalDuration: 720, idDocument: 'Lična karta',
  },
  {
    id: 'v-002', firstName: 'Ana', lastName: 'Jovanović', email: 'ana.j@designstudio.rs',
    phone: '+381 64 234 5678', company: 'DesignStudio', purpose: 'prezentacija',
    department: 'marketing', hostName: 'Milica Stanković', hostId: 'emp-02',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T11:00:00',
    notes: 'Prezentacija novog brenda', isPreRegistered: true, visitCount: 3, totalDuration: 360,
  },
  {
    id: 'v-003', firstName: 'Nenad', lastName: 'Popović', email: 'nenad.p@logistik.co.rs',
    phone: '+381 65 345 6789', company: 'Logistik Co.', purpose: 'isporuka',
    department: 'magacin', hostName: 'Dragan Milić', hostId: 'emp-03',
    status: 'checked_out', badgeNumber: 'POS-2025-041', expectedAt: '2025-07-15T07:00:00',
    checkedInAt: '2025-07-15T07:10:00', checkedOutAt: '2025-07-15T08:30:00',
    notes: 'Isporuka robe za magacin', isPreRegistered: false, visitCount: 12, totalDuration: 1440,
    vehiclePlate: 'BG-123-AB',
  },
  {
    id: 'v-004', firstName: 'Jelena', lastName: 'Stanković', email: 'jelena.s@hr-consulting.rs',
    phone: '+381 62 456 7890', company: 'HR Consulting', purpose: 'intervju',
    department: 'hr', hostName: 'Snežana Radić', hostId: 'emp-04',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T14:00:00',
    notes: 'Intervju za poziciju Senior HR Manager', isPreRegistered: true, visitCount: 1, totalDuration: 0,
  },
  {
    id: 'v-005', firstName: 'Stefan', lastName: 'Đorđević', email: 'stefan.d@supplychain.rs',
    phone: '+381 66 567 8901', company: 'SupplyChain d.o.o.', purpose: 'konsultacija',
    department: 'prodaja', hostName: 'Aleksandar Kovačević', hostId: 'emp-05',
    status: 'checked_in', badgeNumber: 'POS-2025-043', expectedAt: '2025-07-15T10:00:00',
    checkedInAt: '2025-07-15T09:50:00', notes: 'Konsultacija o novim ugovorima za narednu godinu',
    isPreRegistered: true, visitCount: 8, totalDuration: 960, idDocument: ' Pasoš',
  },
  {
    id: 'v-006', firstName: 'Ivana', lastName: 'Matijević', email: 'ivana.m@qualitylab.rs',
    phone: '+381 61 678 9012', company: 'QualityLab', purpose: 'kontrola',
    department: 'proizvodnja', hostName: 'Goran Savić', hostId: 'emp-06',
    status: 'checked_out', badgeNumber: 'POS-2025-040', expectedAt: '2025-07-14T08:00:00',
    checkedInAt: '2025-07-14T08:05:00', checkedOutAt: '2025-07-14T16:00:00',
    notes: 'Redovna inspekcija proizvodnog procesa', isPreRegistered: true, visitCount: 6, totalDuration: 2880,
  },
  {
    id: 'v-007', firstName: 'Petar', lastName: 'Lazić', email: 'petar.l@startup.rs',
    phone: '+381 60 789 0123', company: 'StartupHub', purpose: 'poseta',
    department: 'management', hostName: 'Nenad Đorđević', hostId: 'emp-07',
    status: 'cancelled', badgeNumber: undefined, expectedAt: '2025-07-15T13:00:00',
    notes: 'Poseta otkazana - premestiti za sledeći tjedan', isPreRegistered: true, visitCount: 2, totalDuration: 120,
  },
  {
    id: 'v-008', firstName: 'Maja', lastName: 'Todorović', email: 'maja.t@it-security.rs',
    phone: '+381 63 890 1234', company: 'IT Security Solutions', purpose: 'servis',
    department: 'it', hostName: 'Jovan Petrović', hostId: 'emp-01',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T15:00:00',
    notes: 'Servis i zamena mrežne opreme', isPreRegistered: true, visitCount: 4, totalDuration: 480,
  },
  {
    id: 'v-009', firstName: 'Đorđe', lastName: 'Vukčević', email: 'djordje.v@audit.rs',
    phone: '+381 64 901 2345', company: 'Audit Partner', purpose: 'kontrola',
    department: 'finansije', hostName: 'Zorana Marković', hostId: 'emp-08',
    status: 'checked_in', badgeNumber: 'POS-2025-044', expectedAt: '2025-07-15T08:00:00',
    checkedInAt: '2025-07-15T08:00:00', notes: 'Godišnja finansijska revizija',
    isPreRegistered: true, visitCount: 2, totalDuration: 960, idDocument: 'Lična karta',
  },
  {
    id: 'v-010', firstName: 'Milica', lastName: 'Radosavljević', email: 'milica.r@courier.rs',
    phone: '+381 65 012 3456', company: 'Express Courier', purpose: 'isporuka',
    department: 'podrška', hostName: 'Tamara Nikolić', hostId: 'emp-09',
    status: 'checked_out', badgeNumber: 'POS-2025-039', expectedAt: '2025-07-15T09:30:00',
    checkedInAt: '2025-07-15T09:25:00', checkedOutAt: '2025-07-15T09:40:00',
    notes: 'Preuzimanje pošiljke', isPreRegistered: false, visitCount: 15, totalDuration: 300,
    vehiclePlate: 'NS-456-CD',
  },
]

const mockHosts = [
  { id: 'emp-01', name: 'Jovan Petrović', department: 'IT sektor' },
  { id: 'emp-02', name: 'Milica Stanković', department: 'Marketing' },
  { id: 'emp-03', name: 'Dragan Milić', department: 'Magacin' },
  { id: 'emp-04', name: 'Snežana Radić', department: 'Ljudski resursi' },
  { id: 'emp-05', name: 'Aleksandar Kovačević', department: 'Prodaja' },
  { id: 'emp-06', name: 'Goran Savić', department: 'Proizvodnja' },
  { id: 'emp-07', name: 'Nenad Đorđević', department: 'Rukovodstvo' },
  { id: 'emp-08', name: 'Zorana Marković', department: 'Finansije' },
  { id: 'emp-09', name: 'Tamara Nikolić', department: 'Podrška' },
]

const hourlyFlow = [
  { hour: '07:00', count: 3 }, { hour: '08:00', count: 8 }, { hour: '09:00', count: 12 },
  { hour: '10:00', count: 10 }, { hour: '11:00', count: 7 }, { hour: '12:00', count: 4 },
  { hour: '13:00', count: 5 }, { hour: '14:00', count: 6 }, { hour: '15:00', count: 4 },
  { hour: '16:00', count: 2 },
]

const monthlyTrend = [
  { month: '2025-01', visitors: 87 }, { month: '2025-02', visitors: 92 },
  { month: '2025-03', visitors: 105 }, { month: '2025-04', visitors: 98 },
  { month: '2025-05', visitors: 115 }, { month: '2025-06', visitors: 128 },
  { month: '2025-07', visitors: 76 },
]

// ============ HELPERS ============

function formatDuration(minutes: number): string {
  if (!minutes) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

function getNextBadgeNumber(): string {
  const num = Math.floor(Math.random() * 50) + 50
  return `POS-2025-${String(num).padStart(3, '0')}`
}

// ============ COMPONENT ============

export function Visitors() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // Data state
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(false)

  // Dashboard state
  const [kpis, setKpis] = useState<VisitorKPI | null>(null)

  // Visitors tab
  const [visitorsSearch, setVisitorsSearch] = useState('')
  const [visitorsFilterStatus, setVisitorsFilterStatus] = useState('all')
  const [visitorsFilterPurpose, setVisitorsFilterPurpose] = useState('all')
  const [visitorsFilterDept, setVisitorsFilterDept] = useState('all')

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)

  // Pre-registration tab
  const [preRegDialogOpen, setPreRegDialogOpen] = useState(false)

  // Form defaults
  const emptyVisitorForm = {
    firstName: '', lastName: '', email: '', phone: '', company: '',
    purpose: 'poseta', department: '', hostId: '', expectedAt: '',
    notes: '', isPreRegistered: false, idDocument: '', vehiclePlate: '',
  }

  const [visitorForm, setVisitorForm] = useState(emptyVisitorForm)
  const [quickCheckinForm, setQuickCheckinForm] = useState({
    firstName: '', lastName: '', company: '', purpose: 'poseta',
    department: '', hostId: '', phone: '', notes: '', idDocument: '',
  })

  // ============ DATA LOADING ============

  const loadVisitors = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/visitors?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setVisitors(data)
        return
      }
    } catch { /* silent */ }
    // Fallback to mock data
    setVisitors(mockVisitors)
    setLoading(false)
  }, [activeCompanyId])

  const loadKPIs = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/visitors/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setKpis(data)
        return
      }
    } catch { /* silent */ }
    // Fallback mock KPIs
    setKpis({
      todayTotal: 10,
      checkedIn: 4,
      expected: 3,
      avgDuration: 95,
      weekTotal: 47,
      monthTotal: 203,
    })
  }, [activeCompanyId])

  useEffect(() => {
    if (!activeCompanyId) return
    const load = async () => {
      await Promise.all([loadVisitors(), loadKPIs()])
      setLoading(false)
    }
    load()
  }, [activeCompanyId, loadVisitors, loadKPIs])

  // ============ COMPUTED ============

  const filteredVisitors = visitors.filter((v) => {
    if (visitorsSearch) {
      const q = visitorsSearch.toLowerCase()
      const matches = `${v.firstName} ${v.lastName} ${v.company} ${v.email} ${v.hostName} ${v.badgeNumber}`
        .toLowerCase()
      if (!matches.includes(q)) return false
    }
    if (visitorsFilterStatus !== 'all' && v.status !== visitorsFilterStatus) return false
    if (visitorsFilterPurpose !== 'all' && v.purpose !== visitorsFilterPurpose) return false
    if (visitorsFilterDept !== 'all' && v.department !== visitorsFilterDept) return false
    return true
  })

  const purposeBreakdown = visitors.reduce((acc, v) => {
    const key = v.purpose
    if (!acc[key]) acc[key] = { count: 0, checkedIn: 0 }
    acc[key].count++
    if (v.status === 'checked_in') acc[key].checkedIn++
    return acc
  }, {} as Record<string, { count: number; checkedIn: number }>)

  const deptBreakdown = visitors.reduce((acc, v) => {
    const key = v.department || 'nema'
    if (!acc[key]) acc[key] = 0
    acc[key]++
    return acc
  }, {} as Record<string, number>)

  const maxHourlyCount = Math.max(...hourlyFlow.map((h) => h.count), 1)

  // ============ ACTIONS ============

  const handleCreateVisitor = () => {
    if (!visitorForm.firstName || !visitorForm.lastName) {
      toast.error('Ime i prezime su obavezni')
      return
    }
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      firstName: visitorForm.firstName,
      lastName: visitorForm.lastName,
      email: visitorForm.email || undefined,
      phone: visitorForm.phone || undefined,
      company: visitorForm.company || undefined,
      purpose: visitorForm.purpose,
      department: visitorForm.department || undefined,
      hostId: visitorForm.hostId || undefined,
      hostName: mockHosts.find((h) => h.id === visitorForm.hostId)?.name,
      status: 'expected',
      expectedAt: visitorForm.expectedAt ? new Date(visitorForm.expectedAt).toISOString() : undefined,
      notes: visitorForm.notes || undefined,
      isPreRegistered: visitorForm.isPreRegistered,
      visitCount: 1,
      totalDuration: 0,
      idDocument: visitorForm.idDocument || undefined,
      vehiclePlate: visitorForm.vehiclePlate || undefined,
    }
    setVisitors((prev) => [newVisitor, ...prev])
    setCreateDialogOpen(false)
    setVisitorForm(emptyVisitorForm)
    toast.success(`Posetilac ${newVisitor.firstName} ${newVisitor.lastName} je uspešno kreiran`)
  }

  const handleQuickCheckin = () => {
    if (!quickCheckinForm.firstName || !quickCheckinForm.lastName) {
      toast.error('Ime i prezime su obavezni')
      return
    }
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      firstName: quickCheckinForm.firstName,
      lastName: quickCheckinForm.lastName,
      company: quickCheckinForm.company || undefined,
      purpose: quickCheckinForm.purpose,
      department: quickCheckinForm.department || undefined,
      hostId: quickCheckinForm.hostId || undefined,
      hostName: mockHosts.find((h) => h.id === quickCheckinForm.hostId)?.name,
      phone: quickCheckinForm.phone || undefined,
      status: 'checked_in',
      badgeNumber: getNextBadgeNumber(),
      checkedInAt: new Date().toISOString(),
      notes: quickCheckinForm.notes || undefined,
      isPreRegistered: false,
      visitCount: 1,
      totalDuration: 0,
      idDocument: quickCheckinForm.idDocument || undefined,
    }
    setVisitors((prev) => [newVisitor, ...prev])
    setCheckinDialogOpen(false)
    setQuickCheckinForm({
      firstName: '', lastName: '', company: '', purpose: 'poseta',
      department: '', hostId: '', phone: '', notes: '', idDocument: '',
    })
    toast.success(`${newVisitor.firstName} ${newVisitor.lastName} je uspešno prijavljen. Badge: ${newVisitor.badgeNumber}`)
  }

  const handleCheckIn = (visitor: Visitor) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id
          ? { ...v, status: 'checked_in' as VisitorStatus, checkedInAt: new Date().toISOString(), badgeNumber: visitor.badgeNumber || getNextBadgeNumber() }
          : v
      )
    )
    toast.success(`${visitor.firstName} ${visitor.lastName} je prijavljen`)
  }

  const handleCheckOut = (visitor: Visitor) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id
          ? { ...v, status: 'checked_out' as VisitorStatus, checkedOutAt: new Date().toISOString() }
          : v
      )
    )
    toast.success(`${visitor.firstName} ${visitor.lastName} je odjavljen`)
  }

  const handleDelete = (visitor: Visitor) => {
    if (!confirm(`Obrisati posetioca ${visitor.firstName} ${visitor.lastName}?`)) return
    setVisitors((prev) => prev.filter((v) => v.id !== visitor.id))
    toast.success('Posetilac je obrisan')
  }

  const handlePrintBadge = (visitor: Visitor) => {
    toast.success(`Badge ${visitor.badgeNumber || 'N/A'} poslat na štampaču`)
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posetioci</h1>
          <p className="text-sm text-muted-foreground">Upravljanje posetiocima, prijava, odjava i praćenje</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadVisitors(); loadKPIs(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novi posetilac
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="visitors"><Users className="h-4 w-4 mr-1" /> Posetioci</TabsTrigger>
          <TabsTrigger value="checkin"><UserCheck className="h-4 w-4 mr-1" /> Registrovanje</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="h-4 w-4 mr-1" /> Izveštaji</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!kpis ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Danas ukupno</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{kpis.todayTotal}</p>
                  <p className="text-xs text-muted-foreground">{kpis.weekTotal} ove sedmice</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Trenutno u objektu</span>
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{kpis.checkedIn}</p>
                  <p className="text-xs text-muted-foreground">{kpis.expected} očekivano</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosečna poseta</span>
                    <Hourglass className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(kpis.avgDuration)}</p>
                  <p className="text-xs text-muted-foreground"> prosečno trajanje</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ovog meseca</span>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{kpis.monthTotal}</p>
                  <p className="text-xs text-muted-foreground">ukupnih poseta</p>
                </Card>
              </div>

              {/* Purpose & Hourly */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po svrsi posete</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(purposeBreakdown)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([key, data]) => {
                        const maxCount = Math.max(...Object.values(purposeBreakdown).map((d) => d.count), 1)
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{purposeLabels[key] || key}</span>
                              <span className="text-muted-foreground">{data.count}</span>
                            </div>
                            <Progress value={(data.count / maxCount) * 100} className="h-2" />
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Časovni protok posetilaca</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-40">
                      {hourlyFlow.map((h) => (
                        <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">{h.count}</span>
                          <div
                            className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all"
                            style={{ height: `${(h.count / maxHourlyCount) * 120}px` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{h.hour}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Currently checked-in visitors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    Trenutno u objektu ({visitors.filter((v) => v.status === 'checked_in').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visitors.filter((v) => v.status === 'checked_in').length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Nema prijavljenih posetioca</p>
                  ) : (
                    <div className="space-y-3">
                      {visitors
                        .filter((v) => v.status === 'checked_in')
                        .map((v) => (
                          <div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{v.firstName} {v.lastName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {v.company && <span>{v.company} · </span>}
                                  {v.hostName && <span>Domaćin: {v.hostName}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {v.badgeNumber && (
                                <Badge variant="outline" className="text-[10px]">
                                  <BadgeCheck className="h-3 w-3 mr-1" /> {v.badgeNumber}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700">
                                {purposeLabels[v.purpose] || v.purpose}
                              </Badge>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleCheckOut(v)}>
                                <LogOut className="h-3 w-3 mr-1" /> Odjavi
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== POSETIOCI TAB ===== */}
        <TabsContent value="visitors" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu, kompaniji, domaćinu, badge..."
                className="pl-9"
                value={visitorsSearch}
                onChange={(e) => setVisitorsSearch(e.target.value)}
              />
            </div>
            <Select value={visitorsFilterStatus} onValueChange={setVisitorsFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visitorsFilterPurpose} onValueChange={setVisitorsFilterPurpose}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve svrhe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve svrhe</SelectItem>
                {Object.entries(purposeLabels).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visitorsFilterDept} onValueChange={setVisitorsFilterDept}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi sektori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi sektori</SelectItem>
                {Object.entries(departmentLabels).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visitor list */}
          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredVisitors.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema posetioca</p>
              <Button variant="outline" className="mt-3" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Kreiraj prvog posetioca
              </Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-3">Posetilac</th>
                      <th className="p-3">Kompanija</th>
                      <th className="p-3">Svrha</th>
                      <th className="p-3">Sektor</th>
                      <th className="p-3">Domaćin</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Posete</th>
                      <th className="p-3">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisitors.map((v) => {
                      const cfg = statusConfig[v.status]
                      return (
                        <tr key={v.id} className="border-t hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {v.firstName[0]}{v.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium">{v.firstName} {v.lastName}</div>
                                <div className="text-xs text-muted-foreground">{v.email || v.phone || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-xs">{v.company || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">
                              {purposeLabels[v.purpose] || v.purpose}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs">{departmentLabels[v.department || ''] || v.department || '-'}</td>
                          <td className="p-3 text-xs">{v.hostName || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                              <cfg.icon className="h-3 w-3 mr-1" /> {cfg.label}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs font-medium">{v.visitCount}x</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedVisitor(v); setDetailDialogOpen(true) }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {v.status === 'expected' && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleCheckIn(v)} title="Prijava">
                                  <LogIn className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {v.status === 'checked_in' && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" onClick={() => handleCheckOut(v)} title="Odjava">
                                  <LogOut className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(v)} title="Obriši">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== REGISTROVANJE TAB ===== */}
        <TabsContent value="checkin" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Check-in */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-green-500" />
                  Brza prijava posetioca
                </CardTitle>
                <p className="text-xs text-muted-foreground">Upišite podatke posetioca za trenutnu prijavu</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Ime *</Label>
                    <Input placeholder="Ime" value={quickCheckinForm.firstName}
                      onChange={(e) => setQuickCheckinForm({ ...quickCheckinForm, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Prezime *</Label>
                    <Input placeholder="Prezime" value={quickCheckinForm.lastName}
                      onChange={(e) => setQuickCheckinForm({ ...quickCheckinForm, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Kompanija</Label>
                    <Input placeholder="Kompanija" value={quickCheckinForm.company}
                      onChange={(e) => setQuickCheckinForm({ ...quickCheckinForm, company: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefon</Label>
                    <Input placeholder="+381 6x xxx xxxx" value={quickCheckinForm.phone}
                      onChange={(e) => setQuickCheckinForm({ ...quickCheckinForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Svrha posete</Label>
                    <Select value={quickCheckinForm.purpose} onValueChange={(v) => setQuickCheckinForm({ ...quickCheckinForm, purpose: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(purposeLabels).map(([k, val]) => (
                          <SelectItem key={k} value={k}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sektor</Label>
                    <Select value={quickCheckinForm.department} onValueChange={(v) => setQuickCheckinForm({ ...quickCheckinForm, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Izaberi" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(departmentLabels).map(([k, val]) => (
                          <SelectItem key={k} value={k}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Domaćin (zaposleni)</Label>
                  <Select value={quickCheckinForm.hostId} onValueChange={(v) => setQuickCheckinForm({ ...quickCheckinForm, hostId: v })}>
                    <SelectTrigger><SelectValue placeholder="Izaberi domaćina" /></SelectTrigger>
                    <SelectContent>
                      {mockHosts.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name} ({h.department})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Lična dokumenta</Label>
                    <Select value={quickCheckinForm.idDocument} onValueChange={(v) => setQuickCheckinForm({ ...quickCheckinForm, idDocument: v })}>
                      <SelectTrigger><SelectValue placeholder="Tip" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lična karta">Lična karta</SelectItem>
                        <SelectItem value="Pasoš">Pasoš</SelectItem>
                        <SelectItem value="Vozačka dozvola">Vozačka dozvola</SelectItem>
                        <SelectItem value="nema">Nema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Napomene</Label>
                    <Input placeholder="Napomene" value={quickCheckinForm.notes}
                      onChange={(e) => setQuickCheckinForm({ ...quickCheckinForm, notes: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleQuickCheckin}>
                  <LogIn className="h-4 w-4 mr-2" /> Prijava posetioca
                </Button>
              </CardContent>
            </Card>

            {/* Expected today / Pre-registration */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Očekivani posetioci ({visitors.filter((v) => v.status === 'expected').length})
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setPreRegDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Pre-registracija
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {visitors.filter((v) => v.status === 'expected').length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Nema očekivanih posetioca</p>
                  ) : (
                    <div className="space-y-3">
                      {visitors
                        .filter((v) => v.status === 'expected')
                        .map((v) => (
                          <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{v.firstName} {v.lastName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {v.company && <span>{v.company} · </span>}
                                  {v.expectedAt && <span>{new Date(v.expectedAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {v.isPreRegistered && (
                                <Badge variant="secondary" className="text-[10px]">Pre-reg.</Badge>
                              )}
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleCheckIn(v)}>
                                <LogIn className="h-3 w-3 mr-1" /> Prijava
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info card */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <QrCode className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Badge & QR kod</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nakon prijave, svakom posetiocu se automatski dodeljuje badge sa jedinstvenim brojem.
                        Badge se može odštampati sa QR kodom za identifikaciju.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recently checked out */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-blue-500" />
                    Skoro odjavljeni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visitors.filter((v) => v.status === 'checked_out').length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nema odjavljenih posetioca danas</p>
                  ) : (
                    <div className="space-y-2">
                      {visitors
                        .filter((v) => v.status === 'checked_out')
                        .slice(0, 5)
                        .map((v) => (
                          <div key={v.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                                <LogOut className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm">{v.firstName} {v.lastName}</div>
                                <div className="text-[10px] text-muted-foreground">{v.company}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {v.checkedOutAt && new Date(v.checkedOutAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== IZVEŠTAJI TAB ===== */}
        <TabsContent value="reports" className="space-y-6">
          {/* Visit frequency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Ukupno poseta</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{visitors.length}</p>
              <p className="text-xs text-muted-foreground">posetioca u bazi</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Prosečno po posetiocu</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {visitors.length > 0
                  ? (visitors.reduce((s, v) => s + v.visitCount, 0) / visitors.length).toFixed(1)
                  : 0}x
              </p>
              <p className="text-xs text-muted-foreground"> prosečan broj poseta</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Pre-registrovani</span>
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{visitors.filter((v) => v.isPreRegistered).length}</p>
              <p className="text-xs text-muted-foreground">
                od {visitors.length} posetioca ({visitors.length > 0 ? Math.round((visitors.filter((v) => v.isPreRegistered).length / visitors.length) * 100) : 0}%)
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By department */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Posete po sektorima</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(deptBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, count]) => {
                    const maxDept = Math.max(...Object.values(deptBreakdown), 1)
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{departmentLabels[key] || key}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={(count / maxDept) * 100} className="h-2" />
                      </div>
                    )
                  })}
              </CardContent>
            </Card>

            {/* Purpose breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Po svrsi posete</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(purposeBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{purposeLabels[key] || key}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{data.checkedIn} aktivno</span>
                        <span className="text-sm font-medium w-8 text-right">{data.count}</span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Peak hours */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečni trend poseta</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {monthlyTrend.map((m) => {
                  const maxMonth = Math.max(...monthlyTrend.map((x) => x.visitors), 1)
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-medium">{m.visitors}</span>
                      <div
                        className="w-full bg-primary/80 rounded-t-sm min-h-[4px] transition-all"
                        style={{ height: `${(m.visitors / maxMonth) * 150}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top visitors */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Česti posetioci</CardTitle></CardHeader>
            <CardContent>
              {visitors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Nema podataka</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">Posetilac</th>
                        <th className="pb-2 pr-4">Kompanija</th>
                        <th className="pb-2 pr-4">Svrha</th>
                        <th className="pb-2 pr-4">Broj poseta</th>
                        <th className="pb-2 pr-4">Ukupno vreme</th>
                        <th className="pb-2">Sektor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors
                        .sort((a, b) => b.visitCount - a.visitCount)
                        .slice(0, 8)
                        .map((v) => (
                          <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                                  {v.firstName[0]}{v.lastName[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-xs">{v.firstName} {v.lastName}</div>
                                  {v.email && <div className="text-[10px] text-muted-foreground">{v.email}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 pr-4 text-xs">{v.company || '-'}</td>
                            <td className="py-2 pr-4">
                              <Badge variant="outline" className="text-[10px]">
                                {purposeLabels[v.purpose] || v.purpose}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4 font-medium">{v.visitCount}x</td>
                            <td className="py-2 pr-4 text-xs">{formatDuration(v.totalDuration || 0)}</td>
                            <td className="py-2 text-xs">{departmentLabels[v.department || ''] || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== CREATE VISITOR DIALOG ===== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novi posetilac</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ime *</Label>
                <Input placeholder="Ime" value={visitorForm.firstName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Prezime *</Label>
                <Input placeholder="Prezime" value={visitorForm.lastName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@primer.rs" value={visitorForm.email}
                  onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input placeholder="+381 6x xxx xxxx" value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kompanija</Label>
                <Input placeholder="Naziv kompanije" value={visitorForm.company}
                  onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Registratske tablice</Label>
                <Input placeholder="BG-123-AB" value={visitorForm.vehiclePlate}
                  onChange={(e) => setVisitorForm({ ...visitorForm, vehiclePlate: e.target.value })} />
              </div>
            </div>

            <Separator />

            {/* Visit details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Svrha posete</Label>
                <Select value={visitorForm.purpose} onValueChange={(v) => setVisitorForm({ ...visitorForm, purpose: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(purposeLabels).map(([k, val]) => (
                      <SelectItem key={k} value={k}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sektor</Label>
                <Select value={visitorForm.department} onValueChange={(v) => setVisitorForm({ ...visitorForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberi" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentLabels).map(([k, val]) => (
                      <SelectItem key={k} value={k}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Domaćin</Label>
                <Select value={visitorForm.hostId} onValueChange={(v) => setVisitorForm({ ...visitorForm, hostId: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberi" /></SelectTrigger>
                  <SelectContent>
                    {mockHosts.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Očekivano vreme</Label>
                <Input type="datetime-local" value={visitorForm.expectedAt}
                  onChange={(e) => setVisitorForm({ ...visitorForm, expectedAt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lična dokumenta</Label>
                <Select value={visitorForm.idDocument} onValueChange={(v) => setVisitorForm({ ...visitorForm, idDocument: v })}>
                  <SelectTrigger><SelectValue placeholder="Tip dokumenta" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lična karta">Lična karta</SelectItem>
                    <SelectItem value="Pasoš">Pasoš</SelectItem>
                    <SelectItem value="Vozačka dozvola">Vozačka dozvola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea placeholder="Dodatne napomene..." value={visitorForm.notes}
                onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateVisitor}>Kreiraj posetioca</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PRE-REGISTRATION DIALOG ===== */}
      <Dialog open={preRegDialogOpen} onOpenChange={setPreRegDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pre-registracija posetioca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ime *</Label>
                <Input placeholder="Ime" value={visitorForm.firstName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Prezime *</Label>
                <Input placeholder="Prezime" value={visitorForm.lastName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@primer.rs" value={visitorForm.email}
                  onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input placeholder="+381 6x xxx xxxx" value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kompanija</Label>
              <Input placeholder="Naziv kompanije" value={visitorForm.company}
                onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Svrha posete</Label>
                <Select value={visitorForm.purpose} onValueChange={(v) => setVisitorForm({ ...visitorForm, purpose: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(purposeLabels).map(([k, val]) => (
                      <SelectItem key={k} value={k}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sektor</Label>
                <Select value={visitorForm.department} onValueChange={(v) => setVisitorForm({ ...visitorForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberi" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentLabels).map(([k, val]) => (
                      <SelectItem key={k} value={k}>{val}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Domaćin</Label>
                <Select value={visitorForm.hostId} onValueChange={(v) => setVisitorForm({ ...visitorForm, hostId: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberi" /></SelectTrigger>
                  <SelectContent>
                    {mockHosts.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Očekivano vreme</Label>
                <Input type="datetime-local" value={visitorForm.expectedAt}
                  onChange={(e) => setVisitorForm({ ...visitorForm, expectedAt: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea placeholder="Dodatne napomene..." value={visitorForm.notes}
                onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreRegDialogOpen(false)}>Otkaži</Button>
            <Button onClick={() => {
              setVisitorForm({ ...visitorForm, isPreRegistered: true })
              handleCreateVisitor()
              setPreRegDialogOpen(false)
            }}>Pre-registruj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalji posetioca</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (() => {
            const StatusIcon = statusConfig[selectedVisitor.status].icon
            return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                  {selectedVisitor.firstName[0]}{selectedVisitor.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedVisitor.firstName} {selectedVisitor.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedVisitor.company || 'Nema kompanije'}</p>
                </div>
                <Badge variant="outline" className={`ml-auto text-xs ${statusConfig[selectedVisitor.status].color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[selectedVisitor.status].label}
                </Badge>
              </div>

              <Separator />

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedVisitor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVisitor.email}</span>
                  </div>
                )}
                {selectedVisitor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVisitor.phone}</span>
                  </div>
                )}
                {selectedVisitor.hostName && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Domaćin: {selectedVisitor.hostName}</span>
                  </div>
                )}
                {selectedVisitor.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{departmentLabels[selectedVisitor.department] || selectedVisitor.department}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Visit info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Svrha posete</span>
                  <Badge variant="outline">{purposeLabels[selectedVisitor.purpose] || selectedVisitor.purpose}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Badge</span>
                  <span className="font-mono">{selectedVisitor.badgeNumber || 'Nije dodeljen'}</span>
                </div>
                {selectedVisitor.expectedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Očekivano</span>
                    <span>{formatDate(selectedVisitor.expectedAt)} {new Date(selectedVisitor.expectedAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {selectedVisitor.checkedInAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prijava</span>
                    <span>{formatDate(selectedVisitor.checkedInAt)} {new Date(selectedVisitor.checkedInAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {selectedVisitor.checkedOutAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odjava</span>
                    <span>{formatDate(selectedVisitor.checkedOutAt)} {new Date(selectedVisitor.checkedOutAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno poseta</span>
                  <span className="font-medium">{selectedVisitor.visitCount}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno vreme</span>
                  <span className="font-medium">{formatDuration(selectedVisitor.totalDuration || 0)}</span>
                </div>
                {selectedVisitor.vehiclePlate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registracija</span>
                    <span className="font-mono">{selectedVisitor.vehiclePlate}</span>
                  </div>
                )}
                {selectedVisitor.isPreRegistered && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-registracija</span>
                    <Badge variant="secondary" className="text-[10px]">Da</Badge>
                  </div>
                )}
              </div>

              {selectedVisitor.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Napomene</span>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded">{selectedVisitor.notes}</p>
                  </div>
                </>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex gap-2">
                {selectedVisitor.status === 'expected' && (
                  <Button className="flex-1" onClick={() => { handleCheckIn(selectedVisitor); setDetailDialogOpen(false) }}>
                    <LogIn className="h-4 w-4 mr-1" /> Prijava
                  </Button>
                )}
                {selectedVisitor.status === 'checked_in' && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => handlePrintBadge(selectedVisitor)}>
                      <Printer className="h-4 w-4 mr-1" /> Štampaj badge
                    </Button>
                    <Button className="flex-1" onClick={() => { handleCheckOut(selectedVisitor); setDetailDialogOpen(false) }}>
                      <LogOut className="h-4 w-4 mr-1" /> Odjavi
                    </Button>
                  </>
                )}
                {selectedVisitor.status === 'checked_out' && selectedVisitor.badgeNumber && (
                  <Button variant="outline" className="flex-1" onClick={() => handlePrintBadge(selectedVisitor)}>
                    <Printer className="h-4 w-4 mr-1" /> Štampaj badge
                  </Button>
                )}
              </div>
            </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
