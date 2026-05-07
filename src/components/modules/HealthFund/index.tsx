 
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
  Plus, Search, Eye, Trash2, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, BarChart3, CalendarDays, Users, TrendingUp,
  Heart, FileText, Download, DollarSign, ShieldCheck
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Contribution {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  baseAmount: number
  employerShare: number
  employeeShare: number
  totalAmount: number
  status: 'paid' | 'pending' | 'rejected'
  paymentDate: string | null
  dueDate: string
  createdAt: string
}

interface HealthClaim {
  id: string
  employeeId: string
  employeeName: string
  claimNumber: string
  status: 'submitted' | 'approved' | 'rejected' | 'paid'
  amount: number
  approvedAmount: number | null
  serviceType: string
  diagnosisCode: string
  diagnosisName: string
  providerName: string
  serviceDate: string
  submittedDate: string
  processedDate: string | null
  notes: string
}

interface FundStats {
  totalContributions: number
  monthlyTotal: number
  employerShare: number
  employeeShare: number
  pendingClaims: number
  totalClaims: number
  approvedClaims: number
  paidClaims: number
  rejectedClaims: number
  utilizationRate: number
  avgClaimAmount: number
  monthlyTrend: Array<{ month: string; contributions: number; claims: number }>
  topCategories: Array<{ category: string; count: number; amount: number }>
  yearlyTotals: Array<{ year: number; contributions: number; claims: number; balance: number }>
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: 'Plaćeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejected: { label: 'Odbijeno', color: 'bg-red-50 text-red-700 border-red-200' },
  submitted: { label: 'Podneto', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Odobreno', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
}

const SERVICE_TYPES = [
  'Opšta praksa', 'Specijalistički pregled', 'Laboratorija', 'Dijagnostika',
  'Hospitalizacija', 'Stomatologija', 'Fizikalna terapija', 'Apoteka',
  'Hirurgija', 'Mentalno zdravlje'
]

const formatCurrency = (val: number) =>
  `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

const formatShort = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M RSD`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K RSD`
  return `${val.toFixed(0)} RSD`
}

// ============ MOCK DATA ============

const mockContributions: Contribution[] = [
  { id: 'd-1', employeeId: 'e1', employeeName: 'Jelena Marković', month: 'januar', year: 2025, baseAmount: 120000, employerShare: 16200, employeeShare: 9240, totalAmount: 25440, status: 'paid', paymentDate: '2025-01-31', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-2', employeeId: 'e2', employeeName: 'Dragan Petrović', month: 'januar', year: 2025, baseAmount: 95000, employerShare: 12825, employeeShare: 7310, totalAmount: 20135, status: 'paid', paymentDate: '2025-01-30', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-3', employeeId: 'e3', employeeName: 'Ana Stanković', month: 'januar', year: 2025, baseAmount: 110000, employerShare: 14850, employeeShare: 8470, totalAmount: 23320, status: 'pending', paymentDate: null, dueDate: '2025-01-31', createdAt: '2025-01-08' },
  { id: 'd-4', employeeId: 'e4', employeeName: 'Milan Ilić', month: 'januar', year: 2025, baseAmount: 88000, employerShare: 11880, employeeShare: 6776, totalAmount: 18656, status: 'paid', paymentDate: '2025-01-29', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-5', employeeId: 'e5', employeeName: 'Sara Jovanović', month: 'januar', year: 2025, baseAmount: 75000, employerShare: 10125, employeeShare: 5775, totalAmount: 15900, status: 'rejected', paymentDate: null, dueDate: '2025-01-31', createdAt: '2025-01-10' },
  { id: 'd-6', employeeId: 'e6', employeeName: 'Nikola Đorđević', month: 'decembar', year: 2024, baseAmount: 105000, employerShare: 14175, employeeShare: 8085, totalAmount: 22260, status: 'paid', paymentDate: '2024-12-30', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-7', employeeId: 'e7', employeeName: 'Ivana Kovačević', month: 'decembar', year: 2024, baseAmount: 130000, employerShare: 17550, employeeShare: 10010, totalAmount: 27560, status: 'paid', paymentDate: '2024-12-31', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-8', employeeId: 'e8', employeeName: 'Marko Nikolić', month: 'decembar', year: 2024, baseAmount: 92000, employerShare: 12420, employeeShare: 7084, totalAmount: 19504, status: 'paid', paymentDate: '2024-12-28', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-9', employeeId: 'e1', employeeName: 'Jelena Marković', month: 'decembar', year: 2024, baseAmount: 120000, employerShare: 16200, employeeShare: 9240, totalAmount: 25440, status: 'paid', paymentDate: '2024-12-31', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-10', employeeId: 'e2', employeeName: 'Dragan Petrović', month: 'decembar', year: 2024, baseAmount: 95000, employerShare: 12825, employeeShare: 7310, totalAmount: 20135, status: 'paid', paymentDate: '2024-12-30', dueDate: '2024-12-31', createdAt: '2024-12-05' },
]

const mockClaims: HealthClaim[] = [
  { id: 'z-1', employeeId: 'e1', employeeName: 'Jelena Marković', claimNumber: 'FZ-2025-0001', status: 'paid', amount: 8500, approvedAmount: 8500, serviceType: 'Specijalistički pregled', diagnosisCode: 'J06.9', diagnosisName: 'Infekcija gornjih disajnih puteva', providerName: 'Dom zdravlja Stari Grad', serviceDate: '2025-01-10', submittedDate: '2025-01-12', processedDate: '2025-01-20', notes: 'Pregled kod otorinolaringologa' },
  { id: 'z-2', employeeId: 'e3', employeeName: 'Ana Stanković', claimNumber: 'FZ-2025-0002', status: 'approved', amount: 15200, approvedAmount: 12800, serviceType: 'Laboratorija', diagnosisCode: 'E11.9', diagnosisName: 'Dijabetes tip 2', providerName: 'Medicinski laboratorij Beograd', serviceDate: '2025-01-05', submittedDate: '2025-01-08', processedDate: '2025-01-18', notes: 'Kontrolni panel - HbA1c, lipidi' },
  { id: 'z-3', employeeId: 'e4', employeeName: 'Milan Ilić', claimNumber: 'FZ-2025-0003', status: 'submitted', amount: 22000, approvedAmount: null, serviceType: 'Dijagnostika', diagnosisCode: 'M54.5', diagnosisName: 'Lumbalni sindrom', providerName: 'Klinički centar Srbije', serviceDate: '2025-01-15', submittedDate: '2025-01-22', processedDate: null, notes: 'MRI lumbalnog dela kičme' },
  { id: 'z-4', employeeId: 'e5', employeeName: 'Sara Jovanović', claimNumber: 'FZ-2025-0004', status: 'rejected', amount: 6300, approvedAmount: 0, serviceType: 'Stomatologija', diagnosisCode: 'K04.7', diagnosisName: 'Apsces zuba', providerName: 'Stomatološka ordinacija DentalArt', serviceDate: '2025-01-08', submittedDate: '2025-01-10', processedDate: '2025-01-16', notes: 'Nije pokrivena usluga estetske stomatologije' },
  { id: 'z-5', employeeId: 'e6', employeeName: 'Nikola Đorđević', claimNumber: 'FZ-2024-0089', status: 'paid', amount: 45000, approvedAmount: 38500, serviceType: 'Hospitalizacija', diagnosisCode: 'I21.0', diagnosisName: 'Akutni infarkt miokarda', providerName: 'Klinika za kardiovaskularne bolesti', serviceDate: '2024-12-10', submittedDate: '2024-12-15', processedDate: '2024-12-28', notes: 'Hitna hospitalizacija 5 dana' },
  { id: 'z-6', employeeId: 'e7', employeeName: 'Ivana Kovačević', claimNumber: 'FZ-2025-0005', status: 'submitted', amount: 12000, approvedAmount: null, serviceType: 'Fizikalna terapija', diagnosisCode: 'M17.1', diagnosisName: 'Primarna gonartroza', providerName: 'Rehabilitacioni centar Vračar', serviceDate: '2025-01-18', submittedDate: '2025-01-25', processedDate: null, notes: 'Serija od 10 tretmana fizikalne terapije' },
  { id: 'z-7', employeeId: 'e8', employeeName: 'Marko Nikolić', claimNumber: 'FZ-2025-0006', status: 'approved', amount: 4800, approvedAmount: 4200, serviceType: 'Opšta praksa', diagnosisCode: 'J00', diagnosisName: 'Akutni faringitis', providerName: 'Dom zdravlja Novi Beograd', serviceDate: '2025-01-20', submittedDate: '2025-01-21', processedDate: '2025-01-23', notes: 'Lekarski pregled i recept' },
  { id: 'z-8', employeeId: 'e2', employeeName: 'Dragan Petrović', claimNumber: 'FZ-2024-0085', status: 'paid', amount: 18500, approvedAmount: 16200, serviceType: 'Apoteka', diagnosisCode: 'K29.5', diagnosisName: 'Hronični gastritis', providerName: 'Apoteka Jevremovac', serviceDate: '2024-12-05', submittedDate: '2024-12-08', processedDate: '2024-12-18', notes: 'Lekovi na recept - PPI i antacidi' },
]

const mockStats: FundStats = {
  totalContributions: 238760,
  monthlyTotal: 103451,
  employerShare: 79005,
  employeeShare: 44581,
  pendingClaims: 3,
  totalClaims: 8,
  approvedClaims: 4,
  paidClaims: 2,
  rejectedClaims: 1,
  utilizationRate: 62,
  avgClaimAmount: 16538,
  monthlyTrend: [
    { month: 'Avg', contributions: 95000, claims: 12000 },
    { month: 'Sep', contributions: 98000, claims: 8500 },
    { month: 'Okt', contributions: 102000, claims: 18000 },
    { month: 'Nov', contributions: 101000, claims: 15000 },
    { month: 'Dec', contributions: 135309, claims: 72300 },
    { month: 'Jan', contributions: 103451, claims: 43700 },
  ],
  topCategories: [
    { category: 'Hospitalizacija', count: 1, amount: 45000 },
    { category: 'Dijagnostika', count: 1, amount: 22000 },
    { category: 'Laboratorija', count: 1, amount: 15200 },
    { category: 'Specijalistički pregled', count: 1, amount: 8500 },
    { category: 'Fizikalna terapija', count: 1, amount: 12000 },
    { category: 'Apoteka', count: 1, amount: 18500 },
    { category: 'Stomatologija', count: 1, amount: 6300 },
  ],
  yearlyTotals: [
    { year: 2023, contributions: 820000, claims: 340000, balance: 480000 },
    { year: 2024, contributions: 1150000, claims: 520000, balance: 630000 },
    { year: 2025, contributions: 103451, claims: 43700, balance: 59751 },
  ],
}

// ============ COMPONENT ============

export function FondZdravlja() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<FundStats | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [claims, setClaims] = useState<HealthClaim[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [claimStatusFilter, setClaimStatusFilter] = useState('all')

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'contribution' | 'claim'>('contribution')
  const [selectedItem, setSelectedItem] = useState<Contribution | HealthClaim | null>(null)

  // Forms
  const emptyContribForm = {
    employeeName: '', baseAmount: '', month: 'januar', year: '2025',
    employerRate: '13.5', employeeRate: '7.7',
  }
  const emptyClaimForm = {
    employeeName: '', amount: '', serviceType: 'Opšta praksa',
    diagnosisCode: '', diagnosisName: '', providerName: '',
    serviceDate: '', notes: '',
  }
  const [contribForm, setContribForm] = useState(emptyContribForm)
  const [claimForm, setClaimForm] = useState(emptyClaimForm)

  // Load data
  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/health-fund?companyId=${activeCompanyId}`)
      if (res.ok) {
        const d = await res.json()
        setContributions(d.contributions?.length ? d.contributions : mockContributions)
        setClaims(d.claims?.length ? d.claims : mockClaims)
        setStats(d.stats || mockStats)
      } else {
        setContributions(mockContributions)
        setClaims(mockClaims)
        setStats(mockStats)
      }
    } catch {
      setContributions(mockContributions)
      setClaims(mockClaims)
      setStats(mockStats)
    }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // Create handlers
  const openCreate = (type: 'contribution' | 'claim') => {
    setCreateType(type)
    if (type === 'contribution') setContribForm(emptyContribForm)
    else setClaimForm(emptyClaimForm)
    setCreateOpen(true)
  }

  const handleCreateContribution = async () => {
    if (!contribForm.employeeName.trim() || !contribForm.baseAmount) return
    const base = parseFloat(contribForm.baseAmount) || 0
    const er = parseFloat(contribForm.employerRate) || 13.5
    const ee = parseFloat(contribForm.employeeRate) || 7.7
    const newContrib: Contribution = {
      id: `d-${Date.now()}`, employeeId: `e-${Date.now()}`,
      employeeName: contribForm.employeeName,
      month: contribForm.month, year: parseInt(contribForm.year) || 2025,
      baseAmount: base, employerShare: Math.round(base * er / 100),
      employeeShare: Math.round(base * ee / 100),
      totalAmount: Math.round(base * (er + ee) / 100),
      status: 'pending', paymentDate: null,
      dueDate: `2025-01-31`, createdAt: new Date().toISOString(),
    }
    setContributions(prev => [newContrib, ...prev])
    setCreateOpen(false)
    toast.success('Doprinos kreiran')
  }

  const handleCreateClaim = async () => {
    if (!claimForm.employeeName.trim() || !claimForm.amount || !claimForm.diagnosisCode.trim()) return
    const newClaim: HealthClaim = {
      id: `z-${Date.now()}`, employeeId: `e-${Date.now()}`,
      employeeName: claimForm.employeeName,
      claimNumber: `FZ-2025-${String(claims.length + 1).padStart(4, '0')}`,
      status: 'submitted', amount: parseFloat(claimForm.amount) || 0,
      approvedAmount: null, serviceType: claimForm.serviceType,
      diagnosisCode: claimForm.diagnosisCode,
      diagnosisName: claimForm.diagnosisName || 'Nepoznato',
      providerName: claimForm.providerName,
      serviceDate: claimForm.serviceDate || new Date().toISOString().split('T')[0],
      submittedDate: new Date().toISOString().split('T')[0],
      processedDate: null, notes: claimForm.notes,
    }
    setClaims(prev => [newClaim, ...prev])
    setCreateOpen(false)
    toast.success('Zahtev podnet')
  }

  // Filter helpers
  const filteredContributions = contributions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return c.employeeName.toLowerCase().includes(s) || c.month.toLowerCase().includes(s)
    }
    return true
  })

  const filteredClaims = claims.filter(cl => {
    if (claimStatusFilter !== 'all' && cl.status !== claimStatusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return cl.employeeName.toLowerCase().includes(s) || cl.claimNumber.toLowerCase().includes(s) || cl.diagnosisCode.toLowerCase().includes(s)
    }
    return true
  })

  // Summary helpers
  const contribSummary = {
    total: contributions.reduce((a, c) => a + c.totalAmount, 0),
    paid: contributions.filter(c => c.status === 'paid').reduce((a, c) => a + c.totalAmount, 0),
    pending: contributions.filter(c => c.status === 'pending').reduce((a, c) => a + c.totalAmount, 0),
    rejected: contributions.filter(c => c.status === 'rejected').reduce((a, c) => a + c.totalAmount, 0),
  }

  const claimSummary = {
    total: claims.reduce((a, c) => a + c.amount, 0),
    approved: claims.filter(c => c.status === 'approved' || c.status === 'paid').reduce((a, c) => a + (c.approvedAmount || 0), 0),
    pending: claims.filter(c => c.status === 'submitted').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fond Zdravlja</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje zdravstvenim osiguranjem, doprinosima i zahtevima
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => openCreate('contribution')}>
            <Plus className="h-4 w-4 mr-1" /> Novi doprinos
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="contributions">
            <DollarSign className="h-4 w-4 mr-1" /> Doprinosi
          </TabsTrigger>
          <TabsTrigger value="claims">
            <Heart className="h-4 w-4 mr-1" /> Zahtevi
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-1" /> Izveštaji
          </TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupni doprinosi</span>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatShort(stats.totalContributions)}</p>
                  <p className="text-[10px] text-muted-foreground">Godišnji total</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Mesečno</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatShort(stats.monthlyTotal)}</p>
                  <p className="text-[10px] text-muted-foreground">Trenutni mesec</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Poslodavac</span>
                    <ShieldCheck className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatShort(stats.employerShare)}</p>
                  <p className="text-[10px] text-muted-foreground">{((stats.employerShare / stats.monthlyTotal) * 100).toFixed(1)}% udeo</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Zaposleni</span>
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatShort(stats.employeeShare)}</p>
                  <p className="text-[10px] text-muted-foreground">{((stats.employeeShare / stats.monthlyTotal) * 100).toFixed(1)}% udeo</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.pendingClaims}</p>
                  <p className="text-[10px] text-muted-foreground">od {stats.totalClaims} zahteva</p>
                </Card>
              </div>

              {/* Trend + Top Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Trend doprinosa i zahteva</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.monthlyTrend.map(m => (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="text-xs w-10 font-medium">{m.month}</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-full h-2">
                              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(m.contributions / 140000) * 100}%` }} />
                            </div>
                            <span className="text-[9px] text-blue-600 w-14 text-right">{formatShort(m.contributions)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full h-2">
                              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(m.claims / 75000) * 100}%` }} />
                            </div>
                            <span className="text-[9px] text-emerald-600 w-14 text-right">{formatShort(m.claims)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-4 pt-2 border-t">
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-[10px] text-muted-foreground">Doprinosi</span></div>
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-muted-foreground">Zahtevi</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Top kategorije usluga</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.topCategories.sort((a, b) => b.amount - a.amount).map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs truncate">{cat.category}</span>
                            <span className="text-xs font-medium">{formatCurrency(cat.amount)}</span>
                          </div>
                          <Progress value={(cat.amount / 45000) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Claims Alert */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Aktivni zahtevi na čekanju
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {claims.filter(c => c.status === 'submitted' || c.status === 'approved').slice(0, 5).map(cl => {
                      const sc = STATUS_CONFIG[cl.status]
                      return (
                        <div key={cl.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedItem(cl); setDetailOpen(true) }}>
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{cl.employeeName}</span>
                              <Badge variant="outline" className={`text-[9px] ${sc.color}`}>{sc.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{cl.diagnosisName} · {cl.providerName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold">{formatCurrency(cl.amount)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(cl.serviceDate)}</p>
                          </div>
                        </div>
                      )
                    })}
                    {claims.filter(c => c.status === 'submitted' || c.status === 'approved').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nema aktivnih zahteva na čekanju</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== DOPRINOSI ===== */}
        <TabsContent value="contributions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži doprinose..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="paid">Plaćeno</SelectItem>
                <SelectItem value="pending">Na čekanju</SelectItem>
                <SelectItem value="rejected">Odbijeno</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => openCreate('contribution')}>
              <Plus className="h-4 w-4 mr-1" /> Novi doprinos
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border">
              <p className="text-[10px] text-muted-foreground">Ukupno</p>
              <p className="text-sm font-bold">{formatCurrency(contribSummary.total)}</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-[10px] text-emerald-600">Plaćeno</p>
              <p className="text-sm font-bold text-emerald-700">{formatCurrency(contribSummary.paid)}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
              <p className="text-[10px] text-amber-600">Na čekanju</p>
              <p className="text-sm font-bold text-amber-700">{formatCurrency(contribSummary.pending)}</p>
            </div>
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10">
              <p className="text-[10px] text-red-600">Odbijeno</p>
              <p className="text-sm font-bold text-red-700">{formatCurrency(contribSummary.rejected)}</p>
            </div>
          </div>

          {/* Contributions Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-3 text-xs font-medium">Zaposleni</th>
                    <th className="text-left p-3 text-xs font-medium">Mesec</th>
                    <th className="text-right p-3 text-xs font-medium">Osnovica</th>
                    <th className="text-right p-3 text-xs font-medium">Poslodavac</th>
                    <th className="text-right p-3 text-xs font-medium">Zaposleni</th>
                    <th className="text-right p-3 text-xs font-medium">Ukupno</th>
                    <th className="text-center p-3 text-xs font-medium">Status</th>
                    <th className="text-center p-3 text-xs font-medium">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContributions.map(c => {
                    const sc = STATUS_CONFIG[c.status]
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedItem(c); setDetailOpen(true) }}>
                        <td className="p-3 font-medium">{c.employeeName}</td>
                        <td className="p-3 text-muted-foreground">{c.month} {c.year}.</td>
                        <td className="p-3 text-right">{formatCurrency(c.baseAmount)}</td>
                        <td className="p-3 text-right text-blue-600">{formatCurrency(c.employerShare)}</td>
                        <td className="p-3 text-right text-orange-600">{formatCurrency(c.employeeShare)}</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(c.totalAmount)}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={`text-[9px] ${sc.color}`}>{sc.label}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedItem(c); setDetailOpen(true) }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ===== ZAHTEVI ===== */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={claimStatusFilter} onValueChange={setClaimStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="submitted">Podneto</SelectItem>
                <SelectItem value="approved">Odobreno</SelectItem>
                <SelectItem value="paid">Plaćeno</SelectItem>
                <SelectItem value="rejected">Odbijeno</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => openCreate('claim')}>
              <Plus className="h-4 w-4 mr-1" /> Novi zahtev
            </Button>
          </div>

          {/* Claims Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border">
              <p className="text-[10px] text-muted-foreground">Ukupno zahteva</p>
              <p className="text-sm font-bold">{claims.length}</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-[10px] text-emerald-600">Odobreno/Plaćeno</p>
              <p className="text-sm font-bold text-emerald-700">{formatCurrency(claimSummary.approved)}</p>
            </div>
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
              <p className="text-[10px] text-blue-600">Na čekanju</p>
              <p className="text-sm font-bold text-blue-700">{claimSummary.pending} zahteva</p>
            </div>
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10">
              <p className="text-[10px] text-red-600">Odbijeno</p>
              <p className="text-sm font-bold text-red-700">{claimSummary.rejected} zahteva</p>
            </div>
          </div>

          {/* Claims Cards */}
          <div className="space-y-3">
            {filteredClaims.map(cl => {
              const sc = STATUS_CONFIG[cl.status]
              return (
                <Card key={cl.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedItem(cl); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{cl.claimNumber}</span>
                          <Badge variant="outline" className={`text-[9px] ${sc.color}`}>{sc.label}</Badge>
                          <Badge variant="outline" className="text-[9px]">{cl.serviceType}</Badge>
                        </div>
                        <h3 className="text-sm font-medium">{cl.employeeName}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span><FileText className="h-3 w-3 inline mr-1" />{cl.diagnosisCode} - {cl.diagnosisName}</span>
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />{formatDate(cl.serviceDate)}</span>
                          <span>{cl.providerName}</span>
                        </div>
                        {cl.notes && (
                          <p className="text-[11px] text-muted-foreground mt-1 truncate">{cl.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{formatCurrency(cl.amount)}</p>
                        {cl.approvedAmount !== null && (
                          <p className="text-[10px] text-emerald-600">Odobreno: {formatCurrency(cl.approvedAmount)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== IZVEŠTAJI ===== */}
        <TabsContent value="reports" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground"> prosečan zahtev</span>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.avgClaimAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.totalClaims} ukupnih zahteva</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Stopa iskorišćenja</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.utilizationRate}%</p>
                  <Progress value={stats.utilizationRate} className="h-2 mt-2" />
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odobreni zahtevi</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.approvedClaims + stats.paidClaims}</p>
                  <p className="text-[10px] text-muted-foreground">od {stats.totalClaims} podnetih</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odbijeni zahtevi</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.rejectedClaims}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.totalClaims > 0 ? ((stats.rejectedClaims / stats.totalClaims) * 100).toFixed(1) : 0}% stopa odbijanja</p>
                </Card>
              </div>

              {/* Yearly Totals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Godišnji pregled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-3 text-xs font-medium">Godina</th>
                          <th className="text-right p-3 text-xs font-medium">Doprinosi</th>
                          <th className="text-right p-3 text-xs font-medium">Zahtevi</th>
                          <th className="text-right p-3 text-xs font-medium">Saldo</th>
                          <th className="text-right p-3 text-xs font-medium">Iskorišćenost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.yearlyTotals.map(yt => {
                          const util = yt.contributions > 0 ? Math.round((yt.claims / yt.contributions) * 100) : 0
                          return (
                            <tr key={yt.year} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{yt.year}</td>
                              <td className="p-3 text-right text-blue-600">{formatCurrency(yt.contributions)}</td>
                              <td className="p-3 text-right text-emerald-600">{formatCurrency(yt.claims)}</td>
                              <td className="p-3 text-right font-bold">{formatCurrency(yt.balance)}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress value={util} className="h-2 w-16" />
                                  <span className="text-xs">{util}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Utilization + Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Stopa iskorišćenja po kategoriji</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.topCategories.map(cat => {
                      const util = stats.monthlyTotal > 0 ? Math.min(100, Math.round((cat.amount / stats.monthlyTotal) * 100)) : 0
                      return (
                        <div key={cat.category} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs truncate">{cat.category}</span>
                              <span className="text-xs text-muted-foreground">{formatCurrency(cat.amount)}</span>
                            </div>
                            <Progress value={util} className="h-2" />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Status zahteva</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Podneto', count: claims.filter(c => c.status === 'submitted').length, color: 'bg-blue-500' },
                      { label: 'Odobreno', count: claims.filter(c => c.status === 'approved').length, color: 'bg-cyan-500' },
                      { label: 'Plaćeno', count: claims.filter(c => c.status === 'paid').length, color: 'bg-emerald-500' },
                      { label: 'Odbijeno', count: claims.filter(c => c.status === 'rejected').length, color: 'bg-red-500' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${s.color}`} />
                        <span className="text-xs w-20">{s.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className={`h-3 rounded-full ${s.color}`} style={{ width: `${stats.totalClaims > 0 ? (s.count / stats.totalClaims) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-right">{s.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Export */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Preuzimanje izveštaja</p>
                      <p className="text-xs text-muted-foreground">Generišite i preuzmite izveštaj o fondu zdravlja</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.info('Izveštaj se generiše...')}>
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Excel se generiše...')}>
                        <Download className="h-4 w-4 mr-1" /> Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem && 'employeeName' in selectedItem && 'claimNumber' in selectedItem
                ? `Zahtev ${selectedItem.claimNumber}`
                : selectedItem && 'employeeName' in selectedItem
                  ? `Doprinos - ${selectedItem.employeeName}`
                  : 'Detalji'}
            </DialogTitle>
            <DialogDescription>Pregled detalja izabranog zapisa</DialogDescription>
          </DialogHeader>
          {selectedItem && 'claimNumber' in selectedItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Zaposleni</p><p className="text-sm font-medium">{selectedItem.employeeName}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Status</p><Badge variant="outline" className={`text-[9px] ${STATUS_CONFIG[selectedItem.status]?.color}`}>{STATUS_CONFIG[selectedItem.status]?.label}</Badge></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Iznos</p><p className="text-sm font-bold">{formatCurrency(selectedItem.amount)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Odobreno</p><p className="text-sm font-medium">{selectedItem.approvedAmount !== null ? formatCurrency(selectedItem.approvedAmount) : 'N/A'}</p></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tip usluge:</span><span>{selectedItem.serviceType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dijagnoza:</span><span>{selectedItem.diagnosisCode} - {selectedItem.diagnosisName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pružalac:</span><span>{selectedItem.providerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Datum usluge:</span><span>{formatDate(selectedItem.serviceDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Datum podnošenja:</span><span>{formatDate(selectedItem.submittedDate)}</span></div>
                {selectedItem.processedDate && <div className="flex justify-between"><span className="text-muted-foreground">Datum obrade:</span><span>{formatDate(selectedItem.processedDate)}</span></div>}
                {selectedItem.notes && <div className="pt-2 border-t"><span className="text-muted-foreground text-xs">Napomena:</span><p className="text-sm mt-1">{selectedItem.notes}</p></div>}
              </div>
            </div>
          )}
          {selectedItem && !('claimNumber' in selectedItem) && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Zaposleni</p><p className="text-sm font-medium">{selectedItem.employeeName}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Status</p><Badge variant="outline" className={`text-[9px] ${STATUS_CONFIG[selectedItem.status]?.color}`}>{STATUS_CONFIG[selectedItem.status]?.label}</Badge></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Osnovica</p><p className="text-sm font-bold">{formatCurrency(selectedItem.baseAmount)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Ukupno</p><p className="text-sm font-bold">{formatCurrency(selectedItem.totalAmount)}</p></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Mesec:</span><span>{selectedItem.month} {selectedItem.year}.</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Udeo poslodavca:</span><span className="text-blue-600">{formatCurrency(selectedItem.employerShare)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Udeo zaposlenog:</span><span className="text-orange-600">{formatCurrency(selectedItem.employeeShare)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rok plaćanja:</span><span>{formatDate(selectedItem.dueDate)}</span></div>
                {selectedItem.paymentDate && <div className="flex justify-between"><span className="text-muted-foreground">Datum plaćanja:</span><span className="text-emerald-600">{formatDate(selectedItem.paymentDate)}</span></div>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createType === 'contribution' ? 'Novi doprinos' : 'Novi zdravstveni zahtev'}
            </DialogTitle>
            <DialogDescription>
              {createType === 'contribution'
                ? 'Unesite podatke o zdravstvenom doprinosu za zaposlenog'
                : 'Podnesite novi zahtev za refundaciju zdravstvenih troškova'}
            </DialogDescription>
          </DialogHeader>

          {createType === 'contribution' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zaposleni</Label>
                <Input placeholder="Ime zaposlenog" value={contribForm.employeeName} onChange={e => setContribForm(p => ({ ...p, employeeName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Osnovica (RSD)</Label>
                  <Input type="number" placeholder="0.00" value={contribForm.baseAmount} onChange={e => setContribForm(p => ({ ...p, baseAmount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Mesec</Label>
                  <Select value={contribForm.month} onValueChange={v => setContribForm(p => ({ ...p, month: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'].map(m => (
                        <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Stopa poslodavca (%)</Label>
                  <Input type="number" step="0.1" value={contribForm.employerRate} onChange={e => setContribForm(p => ({ ...p, employerRate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Stopa zaposlenog (%)</Label>
                  <Input type="number" step="0.1" value={contribForm.employeeRate} onChange={e => setContribForm(p => ({ ...p, employeeRate: e.target.value }))} />
                </div>
              </div>
              {contribForm.baseAmount && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <div className="flex justify-between"><span>Udeo poslodavca:</span><span className="font-medium">{formatCurrency(parseFloat(contribForm.baseAmount) * (parseFloat(contribForm.employerRate) || 0) / 100)}</span></div>
                  <div className="flex justify-between"><span>Udeo zaposlenog:</span><span className="font-medium">{formatCurrency(parseFloat(contribForm.baseAmount) * (parseFloat(contribForm.employeeRate) || 0) / 100)}</span></div>
                  <div className="flex justify-between border-t pt-1 mt-1"><span className="font-medium">Ukupno:</span><span className="font-bold">{formatCurrency(parseFloat(contribForm.baseAmount) * ((parseFloat(contribForm.employerRate) || 0) + (parseFloat(contribForm.employeeRate) || 0)) / 100)}</span></div>
                </div>
              )}
            </div>
          )}

          {createType === 'claim' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zaposleni</Label>
                <Input placeholder="Ime zaposlenog" value={claimForm.employeeName} onChange={e => setClaimForm(p => ({ ...p, employeeName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Iznos (RSD)</Label>
                  <Input type="number" placeholder="0.00" value={claimForm.amount} onChange={e => setClaimForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Tip usluge</Label>
                  <Select value={claimForm.serviceType} onValueChange={v => setClaimForm(p => ({ ...p, serviceType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Šifra dijagnoze (MKB-10)</Label>
                  <Input placeholder="npr. J06.9" value={claimForm.diagnosisCode} onChange={e => setClaimForm(p => ({ ...p, diagnosisCode: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Naziv dijagnoze</Label>
                  <Input placeholder="Naziv bolesti" value={claimForm.diagnosisName} onChange={e => setClaimForm(p => ({ ...p, diagnosisName: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Pružalac usluge</Label>
                  <Input placeholder="Naziv ustanove/ordinacije" value={claimForm.providerName} onChange={e => setClaimForm(p => ({ ...p, providerName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Datum usluge</Label>
                  <Input type="date" value={claimForm.serviceDate} onChange={e => setClaimForm(p => ({ ...p, serviceDate: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Napomena</Label>
                <Textarea placeholder="Dodatne informacije..." value={claimForm.notes} onChange={e => setClaimForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
            <Button onClick={createType === 'contribution' ? handleCreateContribution : handleCreateClaim}>
              {createType === 'contribution' ? 'Kreiraj doprinos' : 'Podnesi zahtev'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
