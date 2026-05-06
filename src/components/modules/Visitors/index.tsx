 
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



// ============ COMPONENT ============

import { formatDuration, getNextBadgeNumber } from './components'

import { handleCreateVisitor, handleQuickCheckin, handleCheckIn, handleCheckOut, handleDelete } from './components'
import { PosetiociContent } from './components'

export function Posetioci() {
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

  return (
    <PosetiociContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      visitors={visitors}
      setVisitors={setVisitors}
      loading={loading}
      setLoading={setLoading}
      kpis={kpis}
      setKpis={setKpis}
      visitorsSearch={visitorsSearch}
      setVisitorsSearch={setVisitorsSearch}
      visitorsFilterStatus={visitorsFilterStatus}
      setVisitorsFilterStatus={setVisitorsFilterStatus}
      visitorsFilterPurpose={visitorsFilterPurpose}
      setVisitorsFilterPurpose={setVisitorsFilterPurpose}
      visitorsFilterDept={visitorsFilterDept}
      setVisitorsFilterDept={setVisitorsFilterDept}
      createDialogOpen={createDialogOpen}
      setCreateDialogOpen={setCreateDialogOpen}
      checkinDialogOpen={checkinDialogOpen}
      setCheckinDialogOpen={setCheckinDialogOpen}
      detailDialogOpen={detailDialogOpen}
      setDetailDialogOpen={setDetailDialogOpen}
      selectedVisitor={selectedVisitor}
      setSelectedVisitor={setSelectedVisitor}
      preRegDialogOpen={preRegDialogOpen}
      setPreRegDialogOpen={setPreRegDialogOpen}
      visitorForm={visitorForm}
      setVisitorForm={setVisitorForm}
      quickCheckinForm={quickCheckinForm}
      setQuickCheckinForm={setQuickCheckinForm}
      emptyVisitorForm={emptyVisitorForm}
    />
  )
}
