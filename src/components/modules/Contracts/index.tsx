'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  FileSignature, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, AlertCircle,
  CalendarDays, TrendingUp, XCircle, FileText, Download,
  Upload, Shield, Briefcase, UserCheck, ArrowRight,
  Timer, Building2, DollarSign, FolderOpen, Copy, History,
  ArrowLeft
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Contract {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position: string
  type: string
  status: string
  startDate: string
  endDate?: string
  probationEndDate?: string
  salaryGross: number
  salaryNet: number
  currency: string
  workHours: number
  workLocation: string
  contractNumber: string
  notes?: string
  documents: ContractDocument[]
  createdAt: string
  updatedAt: string
}

interface ContractDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
}

interface ContractType {
  id: string
  name: string
  description: string
  defaultDuration: string
  color: string
  contractCount: number
}

interface ContractRenewal {
  id: string
  contractId: string
  employeeName: string
  oldEndDate: string
  newStartDate: string
  newEndDate: string
  status: string
  requestedDate: string
  notes: string
}

interface ContractDashboard {
  activeContracts: number
  expiringSoon: number
  expiredContracts: number
  terminatedContracts: number
  totalEmployees: number
  avgSalary: number
  totalPayroll: number
  byType: Array<{ type: string; count: number; color: string }>
  expiringList: Contract[]
  recentContracts: Contract[]
  renewalsDue: number
}

// ─── Config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3.5 w-3.5" /> },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pre_expiring: { label: 'Pred-istekao', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  expired: { label: 'Istekao', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  terminated: { label: 'Raskinut', color: 'bg-gray-200 text-gray-600', icon: <XCircle className="h-3.5 w-3.5" /> },
  renewed: { label: 'Obnovljen', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-3.5 w-3.5" /> },
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  indefinite: { label: 'Neodređeno vreme', color: 'bg-green-50 text-green-700', icon: '📋' },
  definite: { label: 'Određeno vreme', color: 'bg-blue-50 text-blue-700', icon: '📅' },
  internship: { label: 'Stručna praksa', color: 'bg-purple-50 text-purple-700', icon: '🎓' },
  part_time: { label: 'Part-time', color: 'bg-orange-50 text-orange-700', icon: '⏱️' },
  consulting: { label: 'Konsalting', color: 'bg-cyan-50 text-cyan-700', icon: '💼' },
  temporary: { label: 'Privremen', color: 'bg-gray-50 text-gray-700', icon: '🔄' },
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

const contractTypes: ContractType[] = [
  { id: 'indefinite', name: 'Neodređeno vreme', description: 'Ugovor na neodređeno vreme - standardni zaposlen', defaultDuration: 'Bez rokova', color: '#22c55e', contractCount: 18 },
  { id: 'definite', name: 'Određeno vreme', description: 'Ugovor na određeno vreme sa datumom isteka', defaultDuration: '6-12 meseci', color: '#3b82f6', contractCount: 8 },
  { id: 'internship', name: 'Stručna praksa', description: 'Ugovor o stručnoj praksi za studente', defaultDuration: '3-6 meseci', color: '#a855f7', contractCount: 4 },
  { id: 'part_time', name: 'Part-time', description: 'Ugovor sa nepunim radnim vremenom', defaultDuration: 'Prema dogovoru', color: '#f97316', contractCount: 3 },
  { id: 'consulting', name: 'Konsalting', description: 'Ugovor o konsaltingu', defaultDuration: 'Po projektu', color: '#06b6d4', contractCount: 2 },
  { id: 'temporary', name: 'Privremeni', description: 'Privremeni ugovor za zamenu ili sezonski rad', defaultDuration: '1-3 meseca', color: '#6b7280', contractCount: 2 },
]

const mockContracts: Contract[] = [
  {
    id: 'ct-1', employeeId: 'emp-1', employeeName: 'Marko Petrović', department: 'Razvoj', position: 'Senior Developer',
    type: 'indefinite', status: 'active', startDate: '2022-03-01',
    salaryGross: 250000, salaryNet: 175000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2022-001', probationEndDate: '2022-06-01',
    documents: [
      { id: 'doc-1', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2022-03-01', uploadedBy: 'HR' },
      { id: 'doc-2', name: 'Aneks - povećanje plata.pdf', type: 'pdf', size: '0.8 MB', uploadedAt: '2023-07-01', uploadedBy: 'HR' },
    ],
    createdAt: '2022-03-01', updatedAt: '2025-01-10',
  },
  {
    id: 'ct-2', employeeId: 'emp-2', employeeName: 'Ana Nikolić', department: 'Razvoj', position: 'Team Lead',
    type: 'indefinite', status: 'active', startDate: '2021-06-15',
    salaryGross: 320000, salaryNet: 220000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2021-005',
    documents: [{ id: 'doc-3', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.1 MB', uploadedAt: '2021-06-15', uploadedBy: 'HR' }],
    createdAt: '2021-06-15', updatedAt: '2025-01-08',
  },
  {
    id: 'ct-3', employeeId: 'emp-3', employeeName: 'Jelena Stanković', department: 'Razvoj', position: 'Engineering Manager',
    type: 'indefinite', status: 'active', startDate: '2020-01-10',
    salaryGross: 380000, salaryNet: 258000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2020-003',
    documents: [{ id: 'doc-4', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.3 MB', uploadedAt: '2020-01-10', uploadedBy: 'HR' }],
    createdAt: '2020-01-10', updatedAt: '2024-12-20',
  },
  {
    id: 'ct-4', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', department: 'Dizajn', position: 'UI/UX Designer',
    type: 'definite', status: 'pre_expiring', startDate: '2024-03-01', endDate: '2025-02-28',
    salaryGross: 180000, salaryNet: 128000, currency: 'RSD', workHours: 40, workLocation: 'Novi Sad',
    contractNumber: 'UG-2024-012', probationEndDate: '2024-05-01',
    notes: 'Ugovor ističe krajem februara. Potrebna obnova.',
    documents: [{ id: 'doc-5', name: 'Ugovor o radu na određeno vreme.pdf', type: 'pdf', size: '1.9 MB', uploadedAt: '2024-03-01', uploadedBy: 'HR' }],
    createdAt: '2024-03-01', updatedAt: '2025-01-15',
  },
  {
    id: 'ct-5', employeeId: 'emp-7', employeeName: 'Milena Radovanović', department: 'Marketing', position: 'Marketing praktičar',
    type: 'internship', status: 'active', startDate: '2025-01-06', endDate: '2025-06-06',
    salaryGross: 45000, salaryNet: 38000, currency: 'RSD', workHours: 20, workLocation: 'Beograd',
    contractNumber: 'UG-2025-001', probationEndDate: '2025-02-06',
    documents: [{ id: 'doc-6', name: 'Ugovor o stručnoj praksi.pdf', type: 'pdf', size: '1.5 MB', uploadedAt: '2025-01-06', uploadedBy: 'HR' }],
    createdAt: '2025-01-06', updatedAt: '2025-01-06',
  },
  {
    id: 'ct-6', employeeId: 'emp-8', employeeName: 'Lazar Matić', department: 'Razvoj', position: 'Junior Developer',
    type: 'definite', status: 'expired', startDate: '2024-01-15', endDate: '2024-12-31',
    salaryGross: 120000, salaryNet: 88000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2024-002',
    notes: 'Ugovor istekao. Kandidat nije produžen.',
    documents: [{ id: 'doc-7', name: 'Ugovor o radu na određeno vreme.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '2024-01-15', uploadedBy: 'HR' }],
    createdAt: '2024-01-15', updatedAt: '2024-12-31',
  },
  {
    id: 'ct-7', employeeId: 'emp-9', employeeName: 'Sanja Vuković', department: 'Admin', position: 'Administrativni radnik',
    type: 'part_time', status: 'active', startDate: '2023-09-01',
    salaryGross: 65000, salaryNet: 48000, currency: 'RSD', workHours: 20, workLocation: 'Beograd',
    contractNumber: 'UG-2023-018',
    documents: [{ id: 'doc-8', name: 'Ugovor o radu - part time.pdf', type: 'pdf', size: '1.6 MB', uploadedAt: '2023-09-01', uploadedBy: 'HR' }],
    createdAt: '2023-09-01', updatedAt: '2025-01-05',
  },
  {
    id: 'ct-8', employeeId: 'emp-10', employeeName: 'Dragan Stojanović', department: 'Finansije', position: 'Konsultant',
    type: 'consulting', status: 'active', startDate: '2024-06-01', endDate: '2025-05-31',
    salaryGross: 200000, salaryNet: 140000, currency: 'RSD', workHours: 30, workLocation: 'Remote',
    contractNumber: 'UG-2024-025',
    notes: 'Konsalting za finansijske procese.',
    documents: [{ id: 'doc-9', name: 'Ugovor o konsaltingu.pdf', type: 'pdf', size: '2.0 MB', uploadedAt: '2024-06-01', uploadedBy: 'HR' }],
    createdAt: '2024-06-01', updatedAt: '2025-01-12',
  },
]

const mockRenewals: ContractRenewal[] = [
  { id: 'rn-1', contractId: 'ct-4', employeeName: 'Ivan Đorđević', oldEndDate: '2025-02-28', newStartDate: '2025-03-01', newEndDate: '2026-02-28', status: 'pending', requestedDate: '2025-01-15', notes: 'Preporučena obnova na neodređeno vreme' },
  { id: 'rn-2', contractId: 'ct-8', employeeName: 'Dragan Stojanović', oldEndDate: '2025-05-31', newStartDate: '2025-06-01', newEndDate: '2026-05-31', status: 'approved', requestedDate: '2025-01-10', notes: 'Obnovljen na još godinu dana' },
]

const mockDashboard: ContractDashboard = {
  activeContracts: 28,
  expiringSoon: 3,
  expiredContracts: 5,
  terminatedContracts: 2,
  totalEmployees: 35,
  avgSalary: 185000,
  totalPayroll: 6475000,
  byType: [
    { type: 'indefinite', count: 18, color: '#22c55e' },
    { type: 'definite', count: 8, color: '#3b82f6' },
    { type: 'internship', count: 4, color: '#a855f7' },
    { type: 'part_time', count: 3, color: '#f97316' },
    { type: 'consulting', count: 2, color: '#06b6d4' },
  ],
  expiringList: mockContracts.filter((c) => c.status === 'pre_expiring'),
  recentContracts: mockContracts.slice(0, 4),
  renewalsDue: 2,
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Contracts() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [renewals, setRenewals] = useState<ContractRenewal[]>([])
  const [dashboard, setDashboard] = useState<ContractDashboard | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Contract | null>(null)

  // Forms
  const emptyForm = {
    employeeName: '', department: '', position: '', type: 'indefinite', status: 'active',
    startDate: '', endDate: '', probationEndDate: '', salaryGross: '', salaryNet: '',
    workHours: 40, workLocation: '', contractNumber: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const emptyRenewalForm = {
    contractId: '', employeeName: '', newStartDate: '', newEndDate: '', notes: '',
  }
  const [renewalForm, setRenewalForm] = useState(emptyRenewalForm)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadContracts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contracts?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setContracts(data.items?.length ? data.items : mockContracts)
      } else {
        setContracts(mockContracts)
      }
    } catch {
      setContracts(mockContracts)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadRenewals = useCallback(async () => {
    try {
      setRenewals(mockRenewals)
    } catch {
      setRenewals(mockRenewals)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/contracts/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        setDashboard(mockDashboard)
      }
    } catch {
      setDashboard(mockDashboard)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadContracts()
    loadRenewals()
    loadDashboard()
  }, [activeCompanyId, loadContracts, loadRenewals, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredContracts = contracts.filter((c) => {
    if (search) {
      const s = search.toLowerCase()
      if (!c.employeeName.toLowerCase().includes(s) && !c.position.toLowerCase().includes(s) && !c.department.toLowerCase().includes(s) && !c.contractNumber.toLowerCase().includes(s)) return false
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    return true
  })

  const daysUntilExpiry = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!activeCompanyId || !form.employeeName.trim()) return
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          salaryGross: parseFloat(form.salaryGross) || 0,
          salaryNet: parseFloat(form.salaryNet) || 0,
          documents: [],
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm(emptyForm)
        loadContracts()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ugovor?')) return
    try {
      const res = await fetch(`/api/contracts?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadContracts(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleRenewalCreate = async () => {
    if (!renewalForm.contractId) return
    const newRenewal: ContractRenewal = {
      id: `rn-${Date.now()}`,
      contractId: renewalForm.contractId,
      employeeName: renewalForm.employeeName,
      oldEndDate: contracts.find((c) => c.id === renewalForm.contractId)?.endDate || '',
      newStartDate: renewalForm.newStartDate,
      newEndDate: renewalForm.newEndDate,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0],
      notes: renewalForm.notes,
    }
    setRenewals([newRenewal, ...renewals])
    setRenewalDialogOpen(false)
    setRenewalForm(emptyRenewalForm)
  }

  const openRenewal = (contract: Contract) => {
    setRenewalForm({
      contractId: contract.id,
      employeeName: contract.employeeName,
      newStartDate: contract.endDate || '',
      newEndDate: '',
      notes: '',
    })
    setRenewalDialogOpen(true)
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ugovori</h1>
          <p className="text-sm text-muted-foreground">Upravljanje radnim ugovorima, obnavljanjima i dokumentima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadContracts(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi ugovor
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="contracts"><FileSignature className="h-4 w-4 mr-1" /> Ugovori</TabsTrigger>
          <TabsTrigger value="renewals"><RefreshCw className="h-4 w-4 mr-1" /> Obnavljanja</TabsTrigger>
          <TabsTrigger value="documents"><FolderOpen className="h-4 w-4 mr-1" /> Dokumenta</TabsTrigger>
          <TabsTrigger value="types"><Briefcase className="h-4 w-4 mr-1" /> Tipovi</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivnih ugovora</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.activeContracts}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Uskoro ističe</span>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.expiringSoon}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dashboard.renewalsDue} obnavljanja na čekanju</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Istekli</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.expiredContracts}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosečna plata</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(dashboard.avgSalary)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ukupno: {formatCurrency(dashboard.totalPayroll)}</p>
                </Card>
              </div>

              {/* Payroll Summary */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu ugovora</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.byType.map((bt) => {
                    const tCfg = typeConfig[bt.type]
                    const maxCount = Math.max(...dashboard.byType.map((b) => b.count))
                    return (
                      <div key={bt.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{tCfg?.icon}</span>
                          <span className="text-sm">{tCfg?.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${(bt.count / maxCount) * 100}%`, backgroundColor: bt.color }} />
                          </div>
                          <span className="text-sm font-medium w-6 text-right">{bt.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Expiring Alerts */}
              {dashboard.expiringList.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-amber-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Upozorenja: Ugovori koji uskoro ističu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.expiringList.map((c) => {
                      const days = c.endDate ? daysUntilExpiry(c.endDate) : 0
                      return (
                        <div key={c.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{c.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{c.position} · {c.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-amber-700">Ističe za {days} dana</p>
                            <p className="text-xs text-muted-foreground">{c.endDate ? new Date(c.endDate).toLocaleDateString('sr-RS') : '-'}</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openRenewal(c)}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Obnovi
                          </Button>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Recent Contracts */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni ugovori</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboard.recentContracts.map((c) => {
                      const sCfg = statusConfig[c.status]
                      const tCfg = typeConfig[c.type]
                      return (
                        <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span>{tCfg?.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{c.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{c.position} · {c.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${sCfg?.color}`}>{sCfg?.label}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(c.startDate).toLocaleDateString('sr-RS')}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Ugovori Tab ─────────────────────────────────────────────── */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži ugovore..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                {Object.entries(typeConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredContracts.length === 0 ? (
            <Card className="p-8 text-center">
              <FileSignature className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema ugovora</p>
              <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Kreiraj ugovor
              </Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-3">Zaposleni</th>
                      <th className="p-3 hidden md:table-cell">Pozicija</th>
                      <th className="p-3 hidden md:table-cell">Tip</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 hidden lg:table-cell">Bruto plata</th>
                      <th className="p-3 hidden lg:table-cell">Period</th>
                      <th className="p-3">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((c) => {
                      const sCfg = statusConfig[c.status]
                      const tCfg = typeConfig[c.type]
                      return (
                        <tr key={c.id} className="border-t hover:bg-muted/30">
                          <td className="p-3">
                            <p className="font-medium">{c.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{c.contractNumber}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <p className="text-sm">{c.position}</p>
                            <p className="text-xs text-muted-foreground">{c.department}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <Badge variant="outline" className={`text-xs ${tCfg?.color}`}>{tCfg?.icon} {tCfg?.label}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-xs ${sCfg?.color}`}>{sCfg?.label}</Badge>
                          </td>
                          <td className="p-3 text-sm hidden lg:table-cell">{formatCurrency(c.salaryGross)}</td>
                          <td className="p-3 text-xs hidden lg:table-cell">
                            {new Date(c.startDate).toLocaleDateString('sr-RS')}
                            {c.endDate && <span className="text-muted-foreground"> → {new Date(c.endDate).toLocaleDateString('sr-RS')}</span>}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(c); setDetailOpen(true); }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {(c.status === 'pre_expiring' || c.status === 'expired') && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => openRenewal(c)}>
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
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

        {/* ─── Obnavljanja Tab ─────────────────────────────────────────── */}
        <TabsContent value="renewals" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Zahtevi za obnavljanje ugovora</p>
            <Button size="sm" onClick={() => { setRenewalForm(emptyRenewalForm); setRenewalDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo obnavljanje
            </Button>
          </div>

          {renewals.length === 0 ? (
            <Card className="p-8 text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema zahteva za obnavljanje</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {renewals.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium">{r.employeeName}</h3>
                          <Badge variant={r.status === 'pending' ? 'outline' : 'default'} className={`text-xs ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {r.status === 'pending' ? 'Na čekanju' : 'Odobreno'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.oldEndDate).toLocaleDateString('sr-RS')} → {new Date(r.newStartDate).toLocaleDateString('sr-RS')} do {new Date(r.newEndDate).toLocaleDateString('sr-RS')}
                        </p>
                        {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">{r.requestedDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Expiring Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Timeline isteka ugovora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts
                  .filter((c) => c.endDate && new Date(c.endDate) > new Date())
                  .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
                  .slice(0, 6)
                  .map((c) => {
                    const days = c.endDate ? daysUntilExpiry(c.endDate) : 0
                    const progress = Math.max(0, Math.min(100, 100 - (days / 365) * 100))
                    return (
                      <div key={c.id} className="flex items-center gap-4">
                        <div className="w-28 text-right">
                          <p className="text-xs font-medium">{c.employeeName.split(' ')[0]}</p>
                          <p className="text-xs text-muted-foreground">{days} dana</p>
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-full h-3 relative">
                            <div className={`h-3 rounded-full transition-all ${days <= 30 ? 'bg-red-400' : days <= 90 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <div className="w-24">
                          <p className="text-xs">{new Date(c.endDate!).toLocaleDateString('sr-RS')}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Dokumenta Tab ──────────────────────────────────────────── */}
        <TabsContent value="documents" className="space-y-4">
          <p className="text-sm text-muted-foreground">Svi dokumenti vezani za ugovore</p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Dokument</th>
                  <th className="p-3">Zaposleni</th>
                  <th className="p-3 hidden md:table-cell">Tip</th>
                  <th className="p-3 hidden md:table-cell">Veličina</th>
                  <th className="p-3 hidden lg:table-cell">Datum</th>
                  <th className="p-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {contracts.flatMap((c) => c.documents.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-400" />
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{c.employeeName}</td>
                    <td className="p-3 text-sm hidden md:table-cell">
                      <Badge variant="outline" className="text-xs uppercase">{d.type}</Badge>
                    </td>
                    <td className="p-3 text-xs hidden md:table-cell">{d.size}</td>
                    <td className="p-3 text-xs hidden lg:table-cell">{new Date(d.uploadedAt).toLocaleDateString('sr-RS')}</td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Download className="h-3 w-3 mr-1" /> Preuzmi
                      </Button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ─── Tipovi Tab ─────────────────────────────────────────────── */}
        <TabsContent value="types" className="space-y-4">
          <p className="text-sm text-muted-foreground">Vrste ugovora i njihova konfiguracija</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractTypes.map((ct) => {
              const tCfg = typeConfig[ct.id]
              return (
                <Card key={ct.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: ct.color + '20' }}>
                        {tCfg?.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{ct.name}</h3>
                        <p className="text-xs text-muted-foreground">{ct.contractCount} ugovora</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{ct.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Trajanje: {ct.defaultDuration}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${(ct.contractCount / 20) * 100}%`, backgroundColor: ct.color }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Create Contract Card ────────────────────────────────────────── */}
      {dialogOpen && (<Card className="max-w-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <CardTitle>Novi ugovor</CardTitle>
              <p className="text-xs text-muted-foreground">Kreirajte novi radni ugovor za zaposlenog</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Zaposleni</Label><Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Ime i prezime" /></div>
              <div className="space-y-2"><Label>Odeljenje</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Odeljenje" /></div>
              <div className="space-y-2"><Label>Pozicija</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Pozicija" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tip ugovora</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nacrt</SelectItem>
                    <SelectItem value="active">Aktivan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Broj ugovora</Label><Input value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} placeholder="UG-2025-XXX" /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Datum početka</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Datum završetka</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kraj probnog roka</Label><Input type="date" value={form.probationEndDate} onChange={(e) => setForm({ ...form, probationEndDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Radnih sati</Label><Input type="number" value={form.workHours} onChange={(e) => setForm({ ...form, workHours: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Bruto plata (RSD)</Label><Input type="number" value={form.salaryGross} onChange={(e) => setForm({ ...form, salaryGross: e.target.value })} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Neto plata (RSD)</Label><Input type="number" value={form.salaryNet} onChange={(e) => setForm({ ...form, salaryNet: e.target.value })} placeholder="0.00" /></div>
              <div className="space-y-2 col-span-2"><Label>Lokacija rada</Label><Input value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} placeholder="Grad" /></div>
            </div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Dodatne napomene..." /></div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj ugovor</Button>
          </div>
        </CardContent>
      </Card>)}

      {/* ─── Detail Card ────────────────────────────────────────────────── */}
      {!!selected && detailOpen && (<Card className="max-w-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle>Detalji ugovora</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selected.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">{selected.position} · {selected.department}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${statusConfig[selected.status]?.color}`}>
                  {statusConfig[selected.status]?.icon} {statusConfig[selected.status]?.label}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Broj ugovora:</span><p className="font-medium">{selected.contractNumber}</p></div>
                <div><span className="text-muted-foreground">Tip:</span><p className="font-medium">{typeConfig[selected.type]?.label}</p></div>
                <div><span className="text-muted-foreground">Lokacija:</span><p className="font-medium">{selected.workLocation}</p></div>
                <div><span className="text-muted-foreground">Početak:</span><p className="font-medium">{new Date(selected.startDate).toLocaleDateString('sr-RS')}</p></div>
                <div><span className="text-muted-foreground">Kraj:</span><p className="font-medium">{selected.endDate ? new Date(selected.endDate).toLocaleDateString('sr-RS') : 'Neodređeno'}</p></div>
                <div><span className="text-muted-foreground">Probni rok:</span><p className="font-medium">{selected.probationEndDate ? new Date(selected.probationEndDate).toLocaleDateString('sr-RS') : '-'}</p></div>
                <div><span className="text-muted-foreground">Bruto plata:</span><p className="font-bold text-lg">{formatCurrency(selected.salaryGross)}</p></div>
                <div><span className="text-muted-foreground">Neto plata:</span><p className="font-bold text-lg text-green-600">{formatCurrency(selected.salaryNet)}</p></div>
                <div><span className="text-muted-foreground">Radnih sati:</span><p className="font-medium">{selected.workHours}h/ned</p></div>
              </div>

              {selected.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Napomene:</span>
                  <p className="text-sm mt-1">{selected.notes}</p>
                </div>
              )}

              {selected.endDate && selected.status !== 'expired' && selected.status !== 'terminated' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ugovor ističe za {daysUntilExpiry(selected.endDate)} dana ({new Date(selected.endDate).toLocaleDateString('sr-RS')}).
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" /> Dokumenta ({selected.documents.length})
                </h4>
                {selected.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nema priloženih dokumenata</p>
                ) : (
                  <div className="space-y-2">
                    {selected.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size} · {doc.uploadedBy} · {new Date(doc.uploadedAt).toLocaleDateString('sr-RS')}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="h-3 w-3 mr-1" /> Preuzmi
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(selected.status === 'pre_expiring' || selected.status === 'expired') && (
                <Button className="w-full" onClick={() => { setDetailOpen(false); openRenewal(selected); }}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Započni obnavljanje
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>)}

      {/* ─── Renewal Card ────────────────────────────────────────────────── */}
      {renewalDialogOpen && (<Card className="max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRenewalDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <CardTitle>Obnavljanje ugovora</CardTitle>
              <p className="text-xs text-muted-foreground">Kreirajte zahtev za obnavljanje ugovora</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zaposleni</Label>
              <Select value={renewalForm.contractId} onValueChange={(v) => {
                const contract = contracts.find((c) => c.id === v)
                setRenewalForm({
                  ...renewalForm,
                  contractId: v,
                  employeeName: contract?.employeeName || '',
                  newStartDate: contract?.endDate || '',
                })
              }}>
                <SelectTrigger><SelectValue placeholder="Izaberite ugovor" /></SelectTrigger>
                <SelectContent>
                  {contracts.filter((c) => c.endDate).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.employeeName} (do {new Date(c.endDate!).toLocaleDateString('sr-RS')})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Novi početak</Label><Input type="date" value={renewalForm.newStartDate} onChange={(e) => setRenewalForm({ ...renewalForm, newStartDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Novi kraj</Label><Input type="date" value={renewalForm.newEndDate} onChange={(e) => setRenewalForm({ ...renewalForm, newEndDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea value={renewalForm.notes} onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })} rows={3} placeholder="Razlog obnavljanja..." /></div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setRenewalDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleRenewalCreate}><Plus className="h-4 w-4 mr-1" /> Podnesi zahtev</Button>
          </div>
        </CardContent>
      </Card>)}

      {/* ─── Contract Statistics Panel ────────────────────────────────────── */}
      {activeTab === 'contracts' && filteredContracts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Statistika filtera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{filteredContracts.length}</p>
                <p className="text-xs text-muted-foreground">Prikazano</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{filteredContracts.filter((c) => c.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Aktivnih</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{formatCurrency(filteredContracts.reduce((sum, c) => sum + c.salaryGross, 0) / filteredContracts.length)}</p>
                <p className="text-xs text-muted-foreground">Prosečna bruto</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{formatCurrency(filteredContracts.reduce((sum, c) => sum + c.salaryGross, 0))}</p>
                <p className="text-xs text-muted-foreground">Ukupno bruto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
