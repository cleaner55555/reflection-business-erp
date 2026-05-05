 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Eye, Trash2, Edit3, RefreshCw, Filter,
  CheckCircle2, Clock, XCircle, AlertTriangle, FileText,
  TrendingUp, ArrowRight, CalendarDays, Shield, ShieldCheck,
  BarChart3, Printer, Download, Package, Wrench, ChevronRight
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Warranty {
  id: string
  number: string
  productName: string
  productCode: string
  serialNumber: string
  batchNumber: string
  partnerName: string
  partnerEmail: string
  partnerPhone: string
  category: string
  warrantyType: string
  durationMonths: number
  startDate: string
  endDate: string
  extendedEndDate: string | null
  status: string
  coverageDescription: string
  exclusions: string[]
  provider: string
  providerPhone: string
  providerEmail: string
  purchaseDate: string
  purchasePrice: number
  currency: string
  invoiceNumber: string
  terms: string
  notes: string
  claims: WarrantyClaim[]
  createdAt: string
  updatedAt: string
}

interface WarrantyClaim {
  id: string
  date: string
  description: string
  status: string
  cost: number
  resolvedDate: string | null
}

interface WarrantyStats {
  total: number
  active: number
  expiringSoon: number
  expired: number
  totalValue: number
  avgDuration: number
  byCategory: Array<{ category: string; count: number; label: string }>
  byProvider: Array<{ provider: string; count: number }>
  monthlyExpiry: Array<{ month: string; count: number }>
  claimStats: { total: number; resolved: number; pending: number; totalCost: number }
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  expiring_soon: { label: 'Uskoro istice', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  expired: { label: 'Istekla', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  voided: { label: 'Poništena', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  claimed: { label: 'Reklamacija', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  electronics: { label: 'Elektronika', icon: '💻' },
  appliances: { label: 'Bela tehnika', icon: '🔌' },
  vehicles: { label: 'Vozila', icon: '🚗' },
  machinery: { label: 'Mašine', icon: '⚙️' },
  tools: { label: 'Alati', icon: '🔧' },
  furniture: { label: 'Nameštaj', icon: '🪑' },
  it_equipment: { label: 'IT oprema', icon: '🖥️' },
  other: { label: 'Ostalo', icon: '📋' },
}

const TYPE_CONFIG: Record<string, string> = {
  manufacturer: 'Proizvođač',
  seller: 'Prodavac',
  extended: 'Proširena',
  insurance: 'Osiguranje',
}

const CLAIM_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'U procesu', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  resolved: { label: 'Rešeno', color: 'bg-emerald-100 text-emerald-700' },
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

const getDaysLeft = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getStatus = (endDate: string, claims: WarrantyClaim[]): string => {
  if (claims.some((c) => c.status === 'pending' || c.status === 'in_progress')) return 'claimed'
  const days = getDaysLeft(endDate)
  if (days < 0) return 'expired'
  if (days <= 90) return 'expiring_soon'
  return 'active'
}

// ============ MOCK DATA ============

const mockWarranties: Warranty[] = [
  {
    id: 'wr-1', number: 'GAR-2025-001', productName: 'Dell PowerEdge R750xs', productCode: 'SRV-750', serialNumber: 'SN-DEL-2024-00123', batchNumber: 'BT-2024-015',
    partnerName: 'Nikola Petrović', partnerEmail: 'nikola@email.com', partnerPhone: '+381631234567',
    category: 'it_equipment', warrantyType: 'manufacturer', durationMonths: 36,
    startDate: '2024-03-15', endDate: '2027-03-15', extendedEndDate: null, status: 'active',
    coverageDescription: 'Kompletna hardverska garancija uključujući diskove, memoriju, procesor i mrežne kartice.',
    exclusions: ['Softverski problemi', 'Fizičko oštećenje', 'Prekomerno zagrevanje usled loše ventilacije'],
    provider: 'Dell Technologies Srbija', providerPhone: '+381113456789', providerEmail: 'support@dell.rs',
    purchaseDate: '2024-03-10', purchasePrice: 350000, currency: 'RSD', invoiceNumber: 'INV-2024-0456',
    terms: 'On-site repair sa sledećeg radnog dana. Rezervni delovi uključeni.', notes: '',
    claims: [], createdAt: '2024-03-15T10:00:00', updatedAt: '2024-03-15T10:00:00',
  },
  {
    id: 'wr-2', number: 'GAR-2024-012', productName: 'Bosch Dishwasher SMS6ECI01E', productCode: 'BT-SMS6', serialNumber: 'SN-BOS-2023-45678', batchNumber: 'BT-2023-178',
    partnerName: 'Jelena Marković', partnerEmail: 'jelena.m@gmail.com', partnerPhone: '+381647890123',
    category: 'appliances', warrantyType: 'manufacturer', durationMonths: 24,
    startDate: '2023-06-20', endDate: '2025-06-20', extendedEndDate: null, status: 'expiring_soon',
    coverageDescription: 'Garancija pokriva sve proizvodne greške mašine za sudove.',
    exclusions: ['Mehaničko oštećenje', 'Nepravilno postavljanje', 'Korišćenje pogrešnih deterdženata'],
    provider: 'Bosch Srbija', providerPhone: '+381118765432', providerEmail: 'garancija@bosch.rs',
    purchaseDate: '2023-06-18', purchasePrice: 85000, currency: 'RSD', invoiceNumber: 'INV-2023-1234',
    terms: 'Besplatan servis i rezervni delovi.', notes: 'Kupac je zainteresovan za produženje garancije.',
    claims: [
      { id: 'cl-1', date: '2024-01-10', description: 'Ne greje vodu dovoljno', status: 'resolved', cost: 0, resolvedDate: '2024-01-15' },
    ],
    createdAt: '2023-06-20T10:00:00', updatedAt: '2024-01-15T16:00:00',
  },
  {
    id: 'wr-3', number: 'GAR-2023-008', productName: 'VW Golf 8 1.5 TSI', productCode: 'VW-G8-15', serialNumber: 'WVWZZZAUZPW123456', batchNumber: '',
    partnerName: 'Dragan Stanković', partnerEmail: 'dragan.s@email.com', partnerPhone: '+381635556677',
    category: 'vehicles', warrantyType: 'manufacturer', durationMonths: 24,
    startDate: '2022-09-01', endDate: '2024-09-01', extendedEndDate: '2025-09-01', status: 'active',
    coverageDescription: 'Fabrička garancija + 12 meseci produžene garancije.',
    exclusions: ['Gume i kočioni diskovi', 'Ulje i filteri', 'Osvetljenje'],
    provider: 'Volkswagen Srbija', providerPhone: '+381112345678', providerEmail: 'garancija@vw.rs',
    purchaseDate: '2022-08-28', purchasePrice: 2800000, currency: 'RSD', invoiceNumber: 'INV-2022-4567',
    terms: 'Servis samo u autorizovanim servisima VW.', notes: 'Produžena garancija aktivirana septembra 2024.',
    claims: [
      { id: 'cl-2', date: '2023-12-05', description: 'Problemi sa DSG menjačem', status: 'resolved', cost: 0, resolvedDate: '2023-12-20' },
      { id: 'cl-3', date: '2024-03-10', description: 'Zvučnik na vratima vozača pravi šum', status: 'pending', cost: 0, resolvedDate: null },
    ],
    createdAt: '2022-09-01T10:00:00', updatedAt: '2024-03-10T11:00:00',
  },
  {
    id: 'wr-4', number: 'GAR-2022-025', productName: 'Makita HR2470 Rotary Hammer', productCode: 'MK-HR247', serialNumber: 'SN-MKT-2022-11111', batchNumber: 'BT-2022-045',
    partnerName: 'Milan Jovanović', partnerEmail: 'milan.j@yahoo.com', partnerPhone: '+381601112233',
    category: 'tools', warrantyType: 'manufacturer', durationMonths: 12,
    startDate: '2022-05-10', endDate: '2023-05-10', extendedEndDate: null, status: 'expired',
    coverageDescription: 'Standardna garancija za električne alate Makita.',
    exclusions: ['Normalno habanje', 'Oštećenje usled pada', 'Nepravilna upotreba'],
    provider: 'Makita Srbija', providerPhone: '+381119876543', providerEmail: 'info@makita.rs',
    purchaseDate: '2022-05-08', purchasePrice: 45000, currency: 'RSD', invoiceNumber: 'INV-2022-0890',
    terms: 'Zamena defektnih delova.', notes: '',
    claims: [
      { id: 'cl-4', date: '2022-11-15', description: 'Kucanje se zaječi nakon 30 min rada', status: 'resolved', cost: 0, resolvedDate: '2022-11-25' },
    ],
    createdAt: '2022-05-10T10:00:00', updatedAt: '2022-11-25T14:00:00',
  },
  {
    id: 'wr-5', number: 'GAR-2024-003', productName: 'Samsung 65" QLED TV QE65Q80C', productCode: 'SAM-Q80-65', serialNumber: 'SN-SAM-2024-22222', batchNumber: 'BT-2024-089',
    partnerName: 'Ana Đorđević', partnerEmail: 'ana.d@email.com', partnerPhone: '+381644445555',
    category: 'electronics', warrantyType: 'extended', durationMonths: 36,
    startDate: '2024-01-20', endDate: '2027-01-20', extendedEndDate: null, status: 'active',
    coverageDescription: 'Proizvođačka garancija 24 meseca + 12 meseci produžene.',
    exclusions: ['Oštećenje ekrana (fizičko)', 'Problem sa mrežom/strujom', 'Neovlašćeni servis'],
    provider: 'Samsung Srbija', providerPhone: '+381111122233', providerEmail: 'support@samsung.rs',
    purchaseDate: '2024-01-18', purchasePrice: 180000, currency: 'RSD', invoiceNumber: 'INV-2024-0234',
    terms: 'On-site servis za TV veće od 55".', notes: 'Produžena garancija kupljena u momentu kupovine.',
    claims: [], createdAt: '2024-01-20T10:00:00', updatedAt: '2024-01-20T10:00:00',
  },
  {
    id: 'wr-6', number: 'GAR-2023-015', productName: 'IKEA KALLAX Shelving Unit', productCode: 'IKE-KAL-4', serialNumber: '', batchNumber: 'BT-2023-234',
    partnerName: 'Sara Ilić', partnerEmail: 'sara.ilic@email.com', partnerPhone: '+381655556666',
    category: 'furniture', warrantyType: 'seller', durationMonths: 10,
    startDate: '2023-04-01', endDate: '2024-04-01', extendedEndDate: null, status: 'expired',
    coverageDescription: 'Garancija na strukturalne defekte nameštaja.',
    exclusions: ['Normalno habanje', 'Vlažnost i sunce', 'Nepravilno sastavljanje'],
    provider: 'IKEA Srbija', providerPhone: '+381113333444', providerEmail: 'servis@ikea.rs',
    purchaseDate: '2023-03-28', purchasePrice: 15000, currency: 'RSD', invoiceNumber: 'INV-2023-0567',
    terms: 'Zamena defektnih delova ili kompletnog proizvoda.', notes: '',
    claims: [], createdAt: '2023-04-01T10:00:00', updatedAt: '2023-04-01T10:00:00',
  },
]

const mockStats: WarrantyStats = {
  total: 234, active: 145, expiringSoon: 28, expired: 51, totalValue: 12500000, avgDuration: 24,
  byCategory: [
    { category: 'electronics', count: 65, label: 'Elektronika' },
    { category: 'appliances', count: 48, label: 'Bela tehnika' },
    { category: 'it_equipment', count: 38, label: 'IT oprema' },
    { category: 'vehicles', count: 28, label: 'Vozila' },
    { category: 'tools', count: 22, label: 'Alati' },
    { category: 'machinery', count: 15, label: 'Mašine' },
    { category: 'furniture', count: 12, label: 'Nameštaj' },
    { category: 'other', count: 6, label: 'Ostalo' },
  ],
  byProvider: [
    { provider: 'Samsung Srbija', count: 42 },
    { provider: 'Bosch Srbija', count: 35 },
    { provider: 'Dell Technologies', count: 28 },
    { provider: 'Volkswagen Srbija', count: 18 },
    { provider: 'Makita Srbija', count: 15 },
  ],
  monthlyExpiry: [
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 12 },
    { month: 'Maj', count: 6 },
    { month: 'Jun', count: 9 },
    { month: 'Jul', count: 4 },
  ],
  claimStats: { total: 87, resolved: 72, pending: 15, totalCost: 450000 },
}

// ============ COMPONENT ============

export function Garancije() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [stats, setStats] = useState<WarrantyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Warranty | null>(null)

  const emptyForm = {
    productName: '', productCode: '', serialNumber: '', batchNumber: '',
    partnerName: '', partnerEmail: '', partnerPhone: '',
    category: 'electronics', warrantyType: 'manufacturer', durationMonths: '24',
    startDate: '', provider: '', providerPhone: '', providerEmail: '',
    purchaseDate: '', purchasePrice: '', invoiceNumber: '', coverageDescription: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const loadWarranties = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/warranties?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) { const d = await res.json(); setWarranties(d.items?.length ? d.items : mockWarranties) }
      else { setWarranties(mockWarranties) }
    } catch { setWarranties(mockWarranties) }
    setLoading(false)
  }, [activeCompanyId])

  const loadStats = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/warranties/stats?companyId=${activeCompanyId}`)
      if (res.ok) setStats(await res.json())
      else setStats(mockStats)
    } catch { setStats(mockStats) }
  }, [activeCompanyId])

  useEffect(() => { loadWarranties(); loadStats() }, [activeCompanyId, loadWarranties, loadStats])

  // Compute status dynamically
  const enrichedWarranties = warranties.map((w) => ({ ...w, status: getStatus(w.endDate, w.claims) }))

  const filtered = enrichedWarranties.filter((w) => {
    if (activeTab === 'active' && w.status !== 'active' && w.status !== 'expiring_soon') return false
    if (activeTab === 'expired' && w.status !== 'expired' && w.status !== 'voided') return false
    if (activeTab === 'claimed' && w.status !== 'claimed') return false
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false
    if (typeFilter !== 'all' && w.warrantyType !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return w.number.toLowerCase().includes(s) || w.productName.toLowerCase().includes(s) || w.partnerName.toLowerCase().includes(s) || w.serialNumber.toLowerCase().includes(s)
    }
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId || !form.productName.trim()) return
    try {
      const res = await fetch('/api/warranties', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, purchasePrice: parseFloat(form.purchasePrice) || 0 }),
      })
      if (res.ok) { setCreateOpen(false); setForm(emptyForm); loadWarranties(); loadStats(); toast.success('Garancija kreirana') }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati garanciju?')) return
    await fetch(`/api/warranties?id=${id}`, { method: 'DELETE' })
    loadWarranties(); loadStats()
  }

  const getWarrantyProgress = (w: Warranty) => {
    const totalDays = new Date(w.endDate).getTime() - new Date(w.startDate).getTime()
    const elapsed = Date.now() - new Date(w.startDate).getTime()
    return totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 100
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garancije</h1>
          <p className="text-sm text-muted-foreground">Praćenje garancija proizvoda i usluga</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadWarranties(); loadStats(); }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Nova garancija</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="active"><ShieldCheck className="h-4 w-4 mr-1" /> Aktivne</TabsTrigger>
          <TabsTrigger value="expired"><XCircle className="h-4 w-4 mr-1" /> Istekle</TabsTrigger>
          <TabsTrigger value="claimed"><AlertTriangle className="h-4 w-4 mr-1" /> Reklamacije</TabsTrigger>
        </TabsList>

        {/* PREGLED */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivne</span><ShieldCheck className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{stats.active}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Uskoro ističu</span><AlertTriangle className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p><p className="text-[10px] text-muted-foreground">u narednih 90 dana</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Istekle</span><XCircle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{stats.expired}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupna vrednost</span><Shield className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p></Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategoriji</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byCategory.map((c) => { const cfg = CATEGORY_CONFIG[c.category]; const max = Math.max(...stats.byCategory.map((x) => x.count)); return (
                      <div key={c.category} className="flex items-center gap-3"><span className="text-sm w-6">{cfg?.icon}</span><span className="text-xs w-24">{c.label}</span><div className="flex-1 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${(c.count / max) * 100}%` }} /></div><span className="text-xs font-medium w-6 text-right">{c.count}</span></div>
                    ) })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Garancijski zahtevi</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Ukupno</p><p className="text-lg font-bold">{stats.claimStats.total}</p></div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20"><p className="text-xs text-muted-foreground">Rešeno</p><p className="text-lg font-bold text-green-600">{stats.claimStats.resolved}</p></div>
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">Na čekanju</p><p className="text-lg font-bold text-amber-600">{stats.claimStats.pending}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Troškovi</p><p className="text-lg font-bold">{formatCurrency(stats.claimStats.totalCost)}</p></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Isticanje garancija po mesecima</p>
                      <div className="flex items-end gap-2 h-24">
                        {stats.monthlyExpiry.map((m) => { const max = Math.max(...stats.monthlyExpiry.map((x) => x.count)); return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-amber-400 rounded-t" style={{ height: `${max > 0 ? (m.count / max) * 80 : 0}px` }} /><span className="text-[10px] text-muted-foreground">{m.month}</span></div>
                        ) })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* LIST TABS */}
        {['active', 'expired', 'claimed'].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži garancije..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{Object.entries(CATEGORY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent></Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Tip" /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TYPE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent></Select>
            </div>
            {loading ? (
              <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center"><Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema garancija</p></Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((w) => {
                  const sCfg = STATUS_CONFIG[w.status]
                  const cCfg = CATEGORY_CONFIG[w.category]
                  const daysLeft = getDaysLeft(w.endDate)
                  const progress = getWarrantyProgress(w)
                  return (
                    <Card key={w.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(w); setDetailOpen(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">{w.number}</span>
                              <Badge variant="outline" className={`text-[10px] ${sCfg?.color}`}>{sCfg?.label}</Badge>
                              <span className="text-[10px]">{cCfg?.icon} {TYPE_CONFIG[w.warrantyType]}</span>
                              {w.claims.length > 0 && <Badge variant="secondary" className="text-[10px]">{w.claims.length} rekl.</Badge>}
                            </div>
                            <h3 className="text-sm font-medium">{w.productName}</h3>
                            <p className="text-xs text-muted-foreground">{w.serialNumber && `S/N: ${w.serialNumber}`}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{w.partnerName}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(w.endDate)}</span>
                              <span className={daysLeft > 0 ? (daysLeft <= 90 ? 'text-amber-500 font-medium' : 'text-green-600') : 'text-red-500 font-medium'}>
                                {daysLeft > 0 ? `${daysLeft} dana` : 'Istekla'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={progress} className={`h-1.5 flex-1 ${daysLeft > 0 && daysLeft <= 90 ? '[&>div]:bg-amber-400' : daysLeft <= 0 ? '[&>div]:bg-red-400' : ''}`} />
                              <span className="text-[10px] text-muted-foreground">{w.durationMonths} mes.</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <ScrollArea className="max-h-[75vh] pr-4">
            {selected && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-lg">{selected.number} — {selected.productName}</DialogTitle>
                  <DialogDescription>{selected.productCode} · S/N: {selected.serialNumber || 'N/A'}</DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                  <Badge variant="outline" className={STATUS_CONFIG[selected.status]?.color}>{STATUS_CONFIG[selected.status]?.label}</Badge>
                  <Badge variant="secondary">{CATEGORY_CONFIG[selected.category]?.icon} {CATEGORY_CONFIG[selected.category]?.label}</Badge>
                  <Badge variant="outline">{TYPE_CONFIG[selected.warrantyType]}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Kupac</p><p className="text-sm font-medium">{selected.partnerName}</p><p className="text-xs text-muted-foreground">{selected.partnerEmail} · {selected.partnerPhone}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Davalac garancije</p><p className="text-sm font-medium">{selected.provider}</p><p className="text-xs text-muted-foreground">{selected.providerPhone}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Period garancije</p><p className="text-sm font-medium">{formatDate(selected.startDate)} — {formatDate(selected.endDate)}</p><p className="text-xs text-muted-foreground">{selected.durationMonths} meseci{selected.extendedEndDate ? ` (+ produženo do ${formatDate(selected.extendedEndDate)})` : ''}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Kupovina</p><p className="text-sm font-medium">{formatDate(selected.purchaseDate)} · {selected.invoiceNumber}</p><p className="text-xs text-muted-foreground">{formatCurrency(selected.purchasePrice)}</p></div>
                </div>

                <div><h4 className="text-sm font-medium mb-2">Pokriće garancije</h4><p className="text-sm bg-muted/50 p-3 rounded-lg">{selected.coverageDescription}</p></div>

                {selected.exclusions.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2">Izuzeci</h4><div className="space-y-1">{selected.exclusions.map((e, i) => <div key={i} className="flex items-center gap-2 text-xs"><XCircle className="h-3 w-3 text-red-400 shrink-0" /><span>{e}</span></div>)}</div></div>
                )}

                <div><h4 className="text-sm font-medium mb-2">Uslovi</h4><p className="text-sm bg-muted/50 p-3 rounded-lg">{selected.terms}</p></div>

                {/* Claims */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Reklamacije ({selected.claims.length})</h4>
                  {selected.claims.length === 0 ? <p className="text-xs text-muted-foreground">Nema reklamacija</p> : (
                    <div className="space-y-2">
                      {selected.claims.map((cl) => (
                        <div key={cl.id} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium">{cl.description}</p><p className="text-[10px] text-muted-foreground">{formatDate(cl.date)}</p></div>
                            <Badge variant="outline" className={`text-[10px] ${CLAIM_STATUS[cl.status]?.color}`}>{CLAIM_STATUS[cl.status]?.label}</Badge>
                          </div>
                          {cl.cost > 0 && <p className="text-xs text-muted-foreground mt-1">Trošak: {formatCurrency(cl.cost)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova garancija</DialogTitle><DialogDescription>Registrujte novu garanciju</DialogDescription></DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Proizvod *</Label><Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Šifra proizvoda</Label><Input value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Serijski broj</Label><Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Batch</Label><Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Kupac *</Label><Input value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.partnerEmail} onChange={(e) => setForm({ ...form, partnerEmail: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.partnerPhone} onChange={(e) => setForm({ ...form, partnerPhone: e.target.value })} /></div>
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Kategorija</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Tip garancije</Label><Select value={form.warrantyType} onValueChange={(v) => setForm({ ...form, warrantyType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Trajanje (mes.)</Label><Input type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Datum početka</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Datum kupovine</Label><Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Cena kupovine (RSD)</Label><Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} /></div>
              <div className="space-y-2"><Label>Broj računa</Label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
            </div>
            <Separator />
            <div className="space-y-2"><Label>Davalac garancije</Label><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Telefon</Label><Input value={form.providerPhone} onChange={(e) => setForm({ ...form, providerPhone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.providerEmail} onChange={(e) => setForm({ ...form, providerEmail: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Pokriće</Label><Textarea rows={2} value={form.coverageDescription} onChange={(e) => setForm({ ...form, coverageDescription: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button><Button onClick={handleCreate} disabled={!form.productName.trim()}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
