/* eslint-disable react-hooks/set-state-in-effect */
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
  TrendingUp, Plus, Search, Eye, Trash2, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, BarChart3, CalendarDays, Users, Star, FileText,
  Download, Filter, Truck, TrendingDown, Globe, PackageSearch,
  ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Building2,
  Phone, Mail, MapPin, ChevronRight, Timer, BarChart
} from 'lucide-react'

// ============ TYPES ============

interface PurchaseRequisition {
  id: string
  prNumber: string
  title: string
  description: string | null
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'received' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestedBy: string
  department: string
  supplierId: string | null
  supplierName: string | null
  items: { name: string; quantity: number; unitPrice: number; unit: string }[]
  totalAmount: number
  currency: string
  requestedDate: string
  requiredByDate: string | null
  approvedBy: string | null
  approvedAt: string | null
  orderedAt: string | null
  receivedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface Supplier {
  id: string
  name: string
  code: string
  category: string
  contactPerson: string
  email: string
  phone: string
  address: string | null
  city: string | null
  country: string | null
  website: string | null
  rating: number
  leadTime: number
  onTimeRate: number
  totalOrders: number
  totalValue: number
  status: 'active' | 'inactive' | 'blocked'
  paymentTerms: string
  bankAccount: string | null
  notes: string | null
  performanceScore: number
  createdAt: string
}

interface SpendingRecord {
  month: string
  category: string
  amount: number
  count: number
}

interface ApprovalMetric {
  id: string
  step: string
  approver: string
  avgTime: number
  pending: number
  approved: number
  rejected: number
}

// ============ MOCK DATA ============

const MOCK_PRS: PurchaseRequisition[] = [
  { id: 'pr1', prNumber: 'PR-2025-001', title: 'Kancelarijski materijal - Q1', description: 'Nabavka papira, tonera i potrošnog materijala za kancelariju', status: 'approved', priority: 'medium', requestedBy: 'Jelena Milić', department: 'Administracija', supplierId: 'sup1', supplierName: 'PaperMax d.o.o.', items: [{ name: 'A4 papir (500 listova)', quantity: 50, unitPrice: 450, unit: 'pak' }, { name: 'Toner HP 26A', quantity: 5, unitPrice: 5500, unit: 'kom' }], totalAmount: 50000, currency: 'RSD', requestedDate: '2025-01-15', requiredByDate: '2025-01-25', approvedBy: 'Marko Petrović', approvedAt: '2025-01-16T10:00:00Z', orderedAt: null, receivedAt: null, notes: 'Hitno za početak godine', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-01-16T10:00:00Z' },
  { id: 'pr2', prNumber: 'PR-2025-002', title: 'IT oprema - računari', description: 'Nabavka 10 laptopova za nove zaposlene', status: 'submitted', priority: 'high', requestedBy: 'Nikola Stanković', department: 'IT', supplierId: 'sup2', supplierName: 'TechPro Srbija', items: [{ name: 'Lenovo ThinkPad E14', quantity: 10, unitPrice: 95000, unit: 'kom' }], totalAmount: 950000, currency: 'RSD', requestedDate: '2025-01-18', requiredByDate: '2025-02-01', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Potrebno za nove radne pozicije', createdAt: '2025-01-18T09:00:00Z', updatedAt: '2025-01-18T09:00:00Z' },
  { id: 'pr3', prNumber: 'PR-2025-003', title: 'Sirovine za proizvodnju', description: 'Nabavka sirovina za proizvodni program u februaru', status: 'ordered', priority: 'urgent', requestedBy: 'Ana Jovanović', department: 'Proizvodnja', supplierId: 'sup3', supplierName: 'MetalIndustrija a.d.', items: [{ name: 'Čelične ploče 2mm', quantity: 200, unitPrice: 3500, unit: 'm²' }, { name: 'Aluminijumske profile', quantity: 500, unitPrice: 1200, unit: 'm' }], totalAmount: 1300000, currency: 'RSD', requestedDate: '2025-01-10', requiredByDate: '2025-01-28', approvedBy: 'Dragan Simić', approvedAt: '2025-01-11T14:00:00Z', orderedAt: '2025-01-12T09:00:00Z', receivedAt: null, notes: null, createdAt: '2025-01-10T07:00:00Z', updatedAt: '2025-01-12T09:00:00Z' },
  { id: 'pr4', prNumber: 'PR-2025-004', title: 'Čišćenje objekta', description: 'Mesečna usluga čišćenja za Februar', status: 'received', priority: 'low', requestedBy: 'Ivana Đorđević', department: 'Administracija', supplierId: 'sup4', supplierName: 'CleanServ d.o.o.', items: [{ name: 'Kompletno čišćenje objekta', quantity: 1, unitPrice: 85000, unit: 'mes' }], totalAmount: 85000, currency: 'RSD', requestedDate: '2025-01-05', requiredByDate: '2025-02-01', approvedBy: 'Marko Petrović', approvedAt: '2025-01-06T11:00:00Z', orderedAt: '2025-01-07T08:00:00Z', receivedAt: '2025-01-20T10:00:00Z', notes: 'Ugovor na godinu dana', createdAt: '2025-01-05T08:00:00Z', updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'pr5', prNumber: 'PR-2025-005', title: 'Gorivo za vozila', description: 'Mesečna potrošnja goriva za vozni park', status: 'draft', priority: 'medium', requestedBy: 'Stefan Nikolić', department: 'Logistika', supplierId: null, supplierName: null, items: [{ name: 'Dizel gorivo', quantity: 2000, unitPrice: 185, unit: 'l' }, { name: 'Benzin 95', quantity: 500, unitPrice: 210, unit: 'l' }], totalAmount: 475000, currency: 'RSD', requestedDate: new Date().toISOString().split('T')[0], requiredByDate: null, approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Standardna mesečna nabavka', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'pr6', prNumber: 'PR-2025-006', title: 'Sigurnosna oprema', description: 'Kupovina radnih odeća i zaštitne opreme', status: 'rejected', priority: 'high', requestedBy: 'Dragan Simić', department: 'Proizvodnja', supplierId: 'sup5', supplierName: 'SafetyGear d.o.o.', items: [{ name: 'Zaštitna kaciga', quantity: 20, unitPrice: 3500, unit: 'kom' }, { name: 'Radne rukavice (10 kom)', quantity: 50, unitPrice: 1200, unit: 'set' }, { name: 'Zaštitna odeća', quantity: 15, unitPrice: 8000, unit: 'kom' }], totalAmount: 245000, currency: 'RSD', requestedDate: '2025-01-12', requiredByDate: '2025-01-20', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Odbijeno - ponovo podneti sa ispravljenim količinama', createdAt: '2025-01-12T10:00:00Z', updatedAt: '2025-01-14T15:00:00Z' },
  { id: 'pr7', prNumber: 'PR-2025-007', title: 'Servis klima uređaja', description: 'Godišnji servis i čišćenje klima uređaja', status: 'submitted', priority: 'low', requestedBy: 'Maja Popović', department: 'Administracija', supplierId: 'sup6', supplierName: 'KlimaServis Beograd', items: [{ name: 'Servis klima uređaja (12 kom)', quantity: 12, unitPrice: 5000, unit: 'kom' }], totalAmount: 60000, currency: 'RSD', requestedDate: '2025-01-20', requiredByDate: '2025-03-01', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: null, createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-01-20T08:00:00Z' },
  { id: 'pr8', prNumber: 'PR-2025-008', title: 'Pakovanje i etikete', description: 'Nabavka kartonskih kutija i etiketa za proizvode', status: 'approved', priority: 'medium', requestedBy: 'Ana Jovanović', department: 'Proizvodnja', supplierId: 'sup7', supplierName: 'PackPro d.o.o.', items: [{ name: 'Kartonska kutija M', quantity: 5000, unitPrice: 85, unit: 'kom' }, { name: 'Lepak za etikete', quantity: 100, unitPrice: 450, unit: 'rol' }], totalAmount: 467500, currency: 'RSD', requestedDate: '2025-01-19', requiredByDate: '2025-02-05', approvedBy: 'Dragan Simić', approvedAt: '2025-01-20T11:00:00Z', orderedAt: null, receivedAt: null, notes: null, createdAt: '2025-01-19T09:00:00Z', updatedAt: '2025-01-20T11:00:00Z' },
]

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'PaperMax d.o.o.', code: 'SUP-001', category: 'Kancelarijski materijal', contactPerson: 'Milan Rakić', email: 'info@papermax.rs', phone: '+381113456789', address: 'Industrijska zona 12', city: 'Novi Sad', country: 'Srbija', website: 'www.papermax.rs', rating: 4.5, leadTime: 3, onTimeRate: 95, totalOrders: 48, totalValue: 2350000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-1234567890123-78', notes: 'Pouzdan dobavljač, sporazumno produženje roka', performanceScore: 92, createdAt: '2023-01-10T10:00:00Z' },
  { id: 'sup2', name: 'TechPro Srbija', code: 'SUP-002', category: 'IT oprema', contactPerson: 'Nebojša Perić', email: 'sales@techpro.rs', phone: '+381112345678', address: 'Bulevar Mihajla Pupina 10a', city: 'Beograd', country: 'Srbija', website: 'www.techpro.rs', rating: 4.2, leadTime: 7, onTimeRate: 88, totalOrders: 22, totalValue: 5800000, status: 'active', paymentTerms: '15 dana neto', bankAccount: '265-9876543210987-65', notes: 'Autorizovani Lenovo partner', performanceScore: 85, createdAt: '2023-03-15T10:00:00Z' },
  { id: 'sup3', name: 'MetalIndustrija a.d.', code: 'SUP-003', category: 'Sirovine', contactPerson: 'Slobodan Jović', email: 'komercijala@metalind.rs', phone: '+381114567890', address: 'Industrijska 45', city: 'Smederevo', country: 'Srbija', website: 'www.metalind.rs', rating: 4.8, leadTime: 10, onTimeRate: 97, totalOrders: 36, totalValue: 15200000, status: 'active', paymentTerms: '45 dana neto', bankAccount: '265-5556667778889-12', notes: 'Strategijski partner za sirovine', performanceScore: 96, createdAt: '2022-06-01T10:00:00Z' },
  { id: 'sup4', name: 'CleanServ d.o.o.', code: 'SUP-004', category: 'Usluge', contactPerson: 'Tamara Gligorijević', email: 'office@cleanserv.rs', phone: '+381115678901', address: 'Vojvode Mišića 22', city: 'Beograd', country: 'Srbija', website: null, rating: 4.0, leadTime: 1, onTimeRate: 100, totalOrders: 12, totalValue: 1020000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-1112223334445-56', notes: 'Ugovor na godinu dana - autoreno', performanceScore: 98, createdAt: '2024-01-05T10:00:00Z' },
  { id: 'sup5', name: 'SafetyGear d.o.o.', code: 'SUP-005', category: 'Radna zaštita', contactPerson: 'Zoran Marković', email: 'prodaja@safetygear.rs', phone: '+381116789012', address: 'Zrenjaninski put 88', city: 'Beograd', country: 'Srbija', website: 'www.safetygear.rs', rating: 3.5, leadTime: 5, onTimeRate: 78, totalOrders: 18, totalValue: 890000, status: 'active', paymentTerms: '30 dana neto', bankAccount: null, notes: 'Povremeno kašnjenje sa isporukama', performanceScore: 72, createdAt: '2023-07-20T10:00:00Z' },
  { id: 'sup6', name: 'KlimaServis Beograd', code: 'SUP-006', category: 'Usluge', contactPerson: 'Dejan Antić', email: 'dejan@klimaservis.rs', phone: '+381637890123', address: null, city: 'Beograd', country: 'Srbija', website: null, rating: 4.3, leadTime: 2, onTimeRate: 92, totalOrders: 8, totalValue: 480000, status: 'active', paymentTerms: '15 dana neto', bankAccount: null, notes: 'Brz servis, povoljne cene', performanceScore: 88, createdAt: '2024-06-01T10:00:00Z' },
  { id: 'sup7', name: 'PackPro d.o.o.', code: 'SUP-007', category: 'Pakovanje', contactPerson: 'Goran Stanković', email: 'info@packpro.rs', phone: '+381118901234', address: 'Pionirska 15', city: 'Niš', country: 'Srbija', website: 'www.packpro.rs', rating: 4.6, leadTime: 5, onTimeRate: 94, totalOrders: 30, totalValue: 3200000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-9998887776665-43', notes: 'Širok asortiman pakovanja', performanceScore: 91, createdAt: '2023-04-10T10:00:00Z' },
  { id: 'sup8', name: 'EuroParts GmbH', code: 'SUP-008', category: 'Rezervni delovi', contactPerson: 'Hans Mueller', email: 'order@europarts.de', phone: '+49211123456', address: 'Essener Str. 45', city: 'Düsseldorf', country: 'Nemačka', website: 'www.europarts.de', rating: 3.8, leadTime: 21, onTimeRate: 82, totalOrders: 5, totalValue: 450000, status: 'inactive', paymentTerms: 'Predračun', bankAccount: null, notes: 'Uvoz rezervnih delova - retke narudžbine', performanceScore: 68, createdAt: '2023-09-01T10:00:00Z' },
]

const MOCK_SPENDING: SpendingRecord[] = [
  { month: '2025-01', category: 'Sirovine', amount: 1300000, count: 3 },
  { month: '2025-01', category: 'IT oprema', amount: 950000, count: 1 },
  { month: '2025-01', category: 'Kancelarijski materijal', amount: 50000, count: 1 },
  { month: '2025-01', category: 'Usluge', amount: 145000, count: 2 },
  { month: '2025-01', category: 'Radna zaštita', amount: 0, count: 0 },
  { month: '2025-01', category: 'Pakovanje', amount: 467500, count: 1 },
  { month: '2024-12', category: 'Sirovine', amount: 1100000, count: 2 },
  { month: '2024-12', category: 'Kancelarijski materijal', amount: 38000, count: 1 },
  { month: '2024-12', category: 'Usluge', amount: 130000, count: 2 },
  { month: '2024-12', category: 'Gorivo', amount: 420000, count: 1 },
  { month: '2024-11', category: 'Sirovine', amount: 980000, count: 3 },
  { month: '2024-11', category: 'IT oprema', amount: 350000, count: 1 },
  { month: '2024-11', category: 'Pakovanje', amount: 320000, count: 2 },
]

const MOCK_APPROVAL_METRICS: ApprovalMetric[] = [
  { id: 'am1', step: 'Prijem zahteva', approver: 'Sistem', avgTime: 0, pending: 0, approved: 8, rejected: 0 },
  { id: 'am2', step: 'Odobrenje rukovodioca', approver: 'Marko Petrović', avgTime: 4.2, pending: 2, approved: 5, rejected: 1 },
  { id: 'am3', step: 'Finansijska provera', approver: 'Jelena Milić', avgTime: 6.8, pending: 1, approved: 4, rejected: 0 },
  { id: 'am4', step: 'Narudžbenica', approver: 'Nikola Stanković', avgTime: 2.1, pending: 0, approved: 3, rejected: 0 },
]

// ============ HELPERS ============

const PR_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  submitted: { label: 'Podnet', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  ordered: { label: 'Naručeno', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  received: { label: 'Primljeno', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

const PR_PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  urgent: { label: 'Hitan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const SUPPLIER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Neaktivan', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  blocked: { label: 'Blokiran', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M RSD`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K RSD`
  return `${amount} RSD`
}

const getStarDisplay = (rating: number) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
      {half > 0 && <Star key="h" className="h-3 w-3 text-amber-400 fill-amber-400/50" />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="h-3 w-3 text-gray-300 dark:text-gray-600" />)}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

const getPerformanceColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-amber-600'
  return 'text-red-600'
}

const getPerformanceBg = (score: number) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 75) return 'bg-amber-500'
  return 'bg-red-500'
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

// ============ MAIN COMPONENT ============

export function MenadzerNabavke() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [prs, setPrs] = useState<PurchaseRequisition[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [spending, setSpending] = useState<SpendingRecord[]>([])
  const [approvalMetrics, setApprovalMetrics] = useState<ApprovalMetric[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPRStatus, setFilterPRStatus] = useState('all')
  const [filterPRPriority, setFilterPRPriority] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [filterSuppCat, setFilterSuppCat] = useState('all')
  const [filterSuppStatus, setFilterSuppStatus] = useState('all')

  const [prDialogOpen, setPrDialogOpen] = useState(false)
  const [prDetailOpen, setPrDetailOpen] = useState(false)
  const [supplierDetailOpen, setSupplierDetailOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [editingPR, setEditingPR] = useState<PurchaseRequisition | null>(null)

  const [prForm, setPrForm] = useState({
    title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    department: '', supplierId: '', requiredByDate: '', notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/nabavka/requisitions')
      if (res.ok) { setPrs(await res.json()) } else { setPrs(MOCK_PRS) }
    } catch { setPrs(MOCK_PRS) }
    try {
      const res = await fetch('/api/nabavka/suppliers')
      if (res.ok) { setSuppliers(await res.json()) } else { setSuppliers(MOCK_SUPPLIERS) }
    } catch { setSuppliers(MOCK_SUPPLIERS) }
    setSpending(MOCK_SPENDING)
    setApprovalMetrics(MOCK_APPROVAL_METRICS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const stats = (() => {
    const active = prs.filter(p => ['submitted', 'approved', 'ordered'].includes(p.status)).length
    const pending = prs.filter(p => p.status === 'submitted').length
    const totalValue = prs.filter(p => !['draft', 'rejected', 'cancelled'].includes(p.status)).reduce((s, p) => s + p.totalAmount, 0)
    const onTimeRate = suppliers.length > 0 ? Math.round(suppliers.reduce((s, sup) => s + sup.onTimeRate, 0) / suppliers.length) : 0
    const avgLeadTime = suppliers.filter(s => s.status === 'active').length > 0
      ? Math.round(suppliers.filter(s => s.status === 'active').reduce((s, sup) => s + sup.leadTime, 0) / suppliers.filter(s => s.status === 'active').length)
      : 0
    const totalSpending = spending.reduce((s, sp) => s + sp.amount, 0)
    const departments = [...new Set(prs.map(p => p.department))]
    const supplierCategories = [...new Set(suppliers.map(s => s.category))]
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length
    return { active, pending, totalValue, onTimeRate, avgLeadTime, totalSpending, departments, supplierCategories, activeSuppliers }
  })()

  const filteredPRs = (() => {
    let result = [...prs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.prNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) ||
        p.requestedBy.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) ||
        (p.supplierName || '').toLowerCase().includes(q)
      )
    }
    if (filterPRStatus !== 'all') result = result.filter(p => p.status === filterPRStatus)
    if (filterPRPriority !== 'all') result = result.filter(p => p.priority === filterPRPriority)
    if (filterDept !== 'all') result = result.filter(p => p.department === filterDept)
    return result
  })()

  const filteredSuppliers = (() => {
    let result = [...suppliers]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q)
      )
    }
    if (filterSuppCat !== 'all') result = result.filter(s => s.category === filterSuppCat)
    if (filterSuppStatus !== 'all') result = result.filter(s => s.status === filterSuppStatus)
    return result
  })()

  const spendingByCategory = (() => {
    const map: Record<string, number> = {}
    spending.forEach(s => { map[s.category] = (map[s.category] || 0) + s.amount })
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  })()

  const monthlySpending = (() => {
    const map: Record<string, number> = {}
    spending.forEach(s => { map[s.month] = (map[s.month] || 0) + s.amount })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  })()

  const openNewPR = () => {
    setEditingPR(null)
    setPrForm({ title: '', description: '', priority: 'medium', department: '', supplierId: '', requiredByDate: '', notes: '' })
    setPrDialogOpen(true)
  }

  const openEditPR = (pr: PurchaseRequisition) => {
    setEditingPR(pr)
    setPrForm({
      title: pr.title, description: pr.description || '', priority: pr.priority,
      department: pr.department, supplierId: pr.supplierId || '', requiredByDate: pr.requiredByDate || '',
      notes: pr.notes || '',
    })
    setPrDialogOpen(true)
  }

  const handleSavePR = () => {
    if (!prForm.title.trim()) { toast.error('Naziv je obavezan'); return }
    const newPR: PurchaseRequisition = {
      id: editingPR?.id || `pr-${Date.now()}`,
      prNumber: editingPR?.prNumber || `PR-${new Date().getFullYear()}-${String(prs.length + 1).padStart(3, '0')}`,
      title: prForm.title, description: prForm.description || null,
      status: editingPR?.status || 'draft',
      priority: prForm.priority,
      requestedBy: editingPR?.requestedBy || 'Trenutni korisnik',
      department: prForm.department,
      supplierId: prForm.supplierId || null,
      supplierName: prForm.supplierId ? suppliers.find(s => s.id === prForm.supplierId)?.name || null : null,
      items: editingPR?.items || [],
      totalAmount: editingPR?.totalAmount || 0,
      currency: 'RSD',
      requestedDate: editingPR?.requestedDate || new Date().toISOString().split('T')[0],
      requiredByDate: prForm.requiredByDate || null,
      approvedBy: editingPR?.approvedBy ?? null, approvedAt: editingPR?.approvedAt ?? null,
      orderedAt: editingPR?.orderedAt ?? null, receivedAt: editingPR?.receivedAt ?? null,
      notes: prForm.notes || null,
      createdAt: editingPR?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPrs(prev => editingPR ? prev.map(p => p.id === editingPR.id ? newPR : p) : [...prev, newPR])
    setPrDialogOpen(false)
    toast.success(editingPR ? 'Zahtev ažuriran' : 'Zahtev kreiran')
  }

  const handleDeletePR = () => {
    if (!selectedPR) return
    setPrs(prev => prev.filter(p => p.id !== selectedPR.id))
    setDeleteConfirmOpen(false)
    setSelectedPR(null)
    toast.success('Zahtev obrisan')
  }

  const handleAdvanceStatus = (pr: PurchaseRequisition) => {
    const statusFlow: Record<string, string> = {
      draft: 'submitted', submitted: 'approved', approved: 'ordered', ordered: 'received',
    }
    const nextStatus = statusFlow[pr.status]
    if (!nextStatus) return
    setPrs(prev => prev.map(p => p.id === pr.id ? { ...p, status: nextStatus as PurchaseRequisition['status'], updatedAt: new Date().toISOString() } : p))
    toast.success(`Status promenjen: ${PR_STATUS_CONFIG[pr.status].label} → ${PR_STATUS_CONFIG[nextStatus].label}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-primary" /> Menadžer nabavke
          </h1>
          <p className="text-sm text-muted-foreground">Zahtevi, dobavljači, analitika i odobrenja</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={openNewPR}><Plus className="h-4 w-4 mr-1" /> Novi zahtev</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="requisitions"><FileText className="h-3.5 w-3.5 mr-1" /> Zahtevi <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0">{stats.pending}</Badge></TabsTrigger>
          <TabsTrigger value="suppliers"><Building2 className="h-3.5 w-3.5 mr-1" /> Dobavljači</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="h-3.5 w-3.5 mr-1" /> Analitika</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard label="Aktivni zahtevi" value={stats.active} icon={FileText} sub={`${stats.pending} čeka odobrenje`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Na čekanju" value={stats.pending} icon={Clock} sub="Za odobrenje" color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Ukupna vrednost" value={formatCurrency(stats.totalValue)} icon={DollarSign} sub="Aktivni zahtevi" color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Dostava na vreme" value={`${stats.onTimeRate}%`} icon={CheckCircle2} sub="Prosek dobavljača" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
            <KpiCard label="Prosečno vreme" value={`${stats.avgLeadTime} d`} icon={Timer} sub="Rok isporuke" color="text-cyan-500" bg="bg-cyan-50 dark:bg-cyan-900/20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pending Approvals */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Na čekanju odobrenja</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prs.filter(p => p.status === 'submitted').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(pr => (
                    <div key={pr.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={`text-[10px] px-1.5 py-0 ${PR_PRIORITY_CONFIG[pr.priority].color}`}>{PR_PRIORITY_CONFIG[pr.priority].label}</Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{pr.prNumber} - {pr.title}</p>
                          <p className="text-xs text-muted-foreground">{pr.requestedBy} · {pr.department} · {formatCurrency(pr.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdvanceStatus(pr)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Odobri
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedPR(pr); setPrDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {prs.filter(p => p.status === 'submitted').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nema zahteva na čekanju</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Suppliers */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Top dobavljači</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {suppliers.filter(s => s.status === 'active').sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map(sup => (
                  <div key={sup.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sup.name}</p>
                      <p className="text-xs text-muted-foreground">{sup.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold ${getPerformanceColor(sup.performanceScore)}`}>{sup.performanceScore}</span>
                      <p className="text-[10px] text-muted-foreground">{sup.onTimeRate}% na vreme</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Spending Trend */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečna potrošnja</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlySpending.map(([month, amount]) => {
                  const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1)
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-xs w-16 text-muted-foreground">{month}</span>
                      <div className="flex-1 bg-muted rounded-full h-4">
                        <div className="bg-primary h-4 rounded-full transition-all flex items-center" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: '40px' }}>
                          <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ZAHTEVI ===== */}
        <TabsContent value="requisitions" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži zahteve..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterPRStatus} onValueChange={setFilterPRStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="draft">Nacrt</SelectItem>
                <SelectItem value="submitted">Podnet</SelectItem>
                <SelectItem value="approved">Odobren</SelectItem>
                <SelectItem value="ordered">Naručeno</SelectItem>
                <SelectItem value="received">Primljeno</SelectItem>
                <SelectItem value="rejected">Odbijeno</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPRPriority} onValueChange={setFilterPRPriority}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Prioritet" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi</SelectItem>
                <SelectItem value="low">Nizak</SelectItem>
                <SelectItem value="medium">Srednji</SelectItem>
                <SelectItem value="high">Visok</SelectItem>
                <SelectItem value="urgent">Hitan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Departman" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi departmani</SelectItem>
                {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredPRs.map(pr => (
                  <div key={pr.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col gap-1">
                        <Badge className={`text-[10px] px-1.5 py-0 w-fit ${PR_STATUS_CONFIG[pr.status].color}`}>{PR_STATUS_CONFIG[pr.status].label}</Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 w-fit ${PR_PRIORITY_CONFIG[pr.priority].color}`}>{PR_PRIORITY_CONFIG[pr.priority].label}</Badge>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{pr.prNumber} - {pr.title}</p>
                        <p className="text-xs text-muted-foreground">{pr.requestedBy} · {pr.department}</p>
                        {pr.supplierName && <p className="text-xs text-muted-foreground">Dobavljač: {pr.supplierName}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold">{formatCurrency(pr.totalAmount)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(pr.requestedDate)}{pr.requiredByDate ? ` → ${formatDate(pr.requiredByDate)}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {['draft', 'submitted', 'approved', 'ordered'].includes(pr.status) && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdvanceStatus(pr)} title="Napredni status">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedPR(pr); setPrDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditPR(pr)}>
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        {pr.status === 'draft' && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { setSelectedPR(pr); setDeleteConfirmOpen(true) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== DOBAVLJAČI ===== */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži dobavljače..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterSuppCat} onValueChange={setFilterSuppCat}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {stats.supplierCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSuppStatus} onValueChange={setFilterSuppStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi</SelectItem>
                <SelectItem value="active">Aktivni</SelectItem>
                <SelectItem value="inactive">Neaktivni</SelectItem>
                <SelectItem value="blocked">Blokirani</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(sup => (
              <Card key={sup.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{sup.name}</CardTitle>
                    <Badge className={`text-[10px] px-1.5 py-0 ${SUPPLIER_STATUS_CONFIG[sup.status].color}`}>{SUPPLIER_STATUS_CONFIG[sup.status].label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sup.code} · {sup.category}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>{getStarDisplay(sup.rating)}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rok isporuke</span>
                      <span>{sup.leadTime} dana</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Na vreme</span>
                      <span className={sup.onTimeRate >= 90 ? 'text-green-600' : sup.onTimeRate >= 75 ? 'text-amber-600' : 'text-red-600'}>{sup.onTimeRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ukupno naruđ.</span>
                      <span>{sup.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ukupno vrednost</span>
                      <span>{formatCurrency(sup.totalValue)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Performanse</span>
                      <span className={`font-bold ${getPerformanceColor(sup.performanceScore)}`}>{sup.performanceScore}/100</span>
                    </div>
                    <Progress value={sup.performanceScore} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{sup.contactPerson}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== ANALITIKA ===== */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Spending by Category */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart className="h-4 w-4" /> Potrošnja po kategorijama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spendingByCategory.map(([category, amount]) => {
                    const maxAmount = Math.max(...spendingByCategory.map(([, a]) => a), 1)
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-xs w-32 truncate">{category}</span>
                        <div className="flex-1 bg-muted rounded-full h-4">
                          <div className="bg-primary h-4 rounded-full transition-all flex items-center" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: amount > 0 ? '50px' : '0' }}>
                            <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečni trend</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlySpending.map(([month, amount]) => {
                    const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1)
                    const prevMonth = monthlySpending[monthlySpending.findIndex(([m]) => m === month) - 1]
                    const prevAmount = prevMonth ? prevMonth[1] : amount
                    const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0
                    return (
                      <div key={month} className="flex items-center gap-3">
                        <span className="text-xs w-16 text-muted-foreground">{month}</span>
                        <div className="flex-1 bg-muted rounded-full h-5">
                          <div className="bg-primary h-5 rounded-full transition-all flex items-center justify-end" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: '40px' }}>
                            <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                          </div>
                        </div>
                        {change !== 0 && (
                          <div className={`flex items-center gap-0.5 text-xs w-16 ${change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(change).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Comparison */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Poređenje dobavljača</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-2 font-medium text-muted-foreground">Dobavljač</th>
                        <th className="text-center py-2 px-1 font-medium text-muted-foreground">Ocena</th>
                        <th className="text-center py-2 px-1 font-medium text-muted-foreground">Na vreme</th>
                        <th className="text-center py-2 px-1 font-medium text-muted-foreground">Rok</th>
                        <th className="text-center py-2 px-1 font-medium text-muted-foreground">Narudžbine</th>
                        <th className="text-right py-2 pl-1 font-medium text-muted-foreground">Vrednost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.filter(s => s.status === 'active').sort((a, b) => b.performanceScore - a.performanceScore).map(sup => (
                        <tr key={sup.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
                          <td className="py-2 pr-2 font-medium truncate max-w-[120px]">{sup.name}</td>
                          <td className="py-2 px-1 text-center">{getStarDisplay(sup.rating)}</td>
                          <td className="py-2 px-1 text-center"><span className={sup.onTimeRate >= 90 ? 'text-green-600' : sup.onTimeRate >= 75 ? 'text-amber-600' : 'text-red-600'}>{sup.onTimeRate}%</span></td>
                          <td className="py-2 px-1 text-center">{sup.leadTime}d</td>
                          <td className="py-2 px-1 text-center">{sup.totalOrders}</td>
                          <td className="py-2 pl-1 text-right font-mono">{formatCurrency(sup.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Approval Workflow Metrics */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Metrike odobrenja</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {approvalMetrics.map(metric => (
                  <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{metric.step}</p>
                      <p className="text-xs text-muted-foreground">{metric.approver}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {metric.avgTime > 0 && (
                        <div className="text-center">
                          <p className="font-semibold">{metric.avgTime}h</p>
                          <p className="text-muted-foreground">Prosek</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-semibold text-amber-600">{metric.pending}</p>
                        <p className="text-muted-foreground">Čeka</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{metric.approved}</p>
                        <p className="text-muted-foreground">Odobreno</p>
                      </div>
                      {metric.rejected > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-red-600">{metric.rejected}</p>
                          <p className="text-muted-foreground">Odbijeno</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PR Detail Dialog */}
      <Dialog open={prDetailOpen} onOpenChange={setPrDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPR?.prNumber} - {selectedPR?.title}</DialogTitle>
            <DialogDescription>Detalji zahteva za nabavku</DialogDescription>
          </DialogHeader>
          {selectedPR && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={PR_STATUS_CONFIG[selectedPR.status].color}>{PR_STATUS_CONFIG[selectedPR.status].label}</Badge>
                <Badge className={PR_PRIORITY_CONFIG[selectedPR.priority].color}>{PR_PRIORITY_CONFIG[selectedPR.priority].label}</Badge>
              </div>
              {selectedPR.description && <p className="text-sm text-muted-foreground">{selectedPR.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground">Podneo</span><p className="font-medium">{selectedPR.requestedBy}</p></div>
                <div><span className="text-xs text-muted-foreground">Departman</span><p className="font-medium">{selectedPR.department}</p></div>
                <div><span className="text-xs text-muted-foreground">Datum zahteva</span><p className="font-medium">{formatDate(selectedPR.requestedDate)}</p></div>
                <div><span className="text-xs text-muted-foreground">Rok</span><p className="font-medium">{selectedPR.requiredByDate ? formatDate(selectedPR.requiredByDate) : 'Nije definisan'}</p></div>
                {selectedPR.supplierName && <div><span className="text-xs text-muted-foreground">Dobavljač</span><p className="font-medium">{selectedPR.supplierName}</p></div>}
                {selectedPR.approvedBy && <div><span className="text-xs text-muted-foreground">Odobrio</span><p className="font-medium">{selectedPR.approvedBy}</p></div>}
              </div>
              {selectedPR.items.length > 0 && (
                <div className="border-t pt-3">
                  <span className="text-xs text-muted-foreground font-medium">Stavke</span>
                  <div className="mt-2 space-y-1">
                    {selectedPR.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                        <span>{item.name} × {item.quantity} {item.unit}</span>
                        <span className="font-mono">{(item.quantity * item.unitPrice).toLocaleString('sr-RS')} RSD</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t font-semibold">
                    <span>Ukupno</span>
                    <span>{selectedPR.totalAmount.toLocaleString('sr-RS')} {selectedPR.currency}</span>
                  </div>
                </div>
              )}
              {selectedPR.notes && (
                <div className="border-t pt-3">
                  <span className="text-xs text-muted-foreground">Napomene</span>
                  <p className="text-sm mt-1">{selectedPR.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPrDetailOpen(false)}>Zatvori</Button>
            {selectedPR && ['draft', 'submitted', 'approved', 'ordered'].includes(selectedPR.status) && (
              <Button onClick={() => { handleAdvanceStatus(selectedPR); setPrDetailOpen(false) }}>
                <ChevronRight className="h-4 w-4 mr-1" /> {PR_STATUS_CONFIG[selectedPR.status].label} → {PR_STATUS_CONFIG[{ draft: 'submitted', submitted: 'approved', approved: 'ordered', ordered: 'received' }[selectedPR.status] as string]?.label}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Detail Dialog */}
      <Dialog open={supplierDetailOpen} onOpenChange={setSupplierDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
            <DialogDescription>Profil dobavljača - {selectedSupplier?.code}</DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={SUPPLIER_STATUS_CONFIG[selectedSupplier.status].color}>{SUPPLIER_STATUS_CONFIG[selectedSupplier.status].label}</Badge>
                <Badge variant="outline">{selectedSupplier.category}</Badge>
              </div>
              <div>{getStarDisplay(selectedSupplier.rating)}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground">Kontakt osoba</span><p className="font-medium">{selectedSupplier.contactPerson}</p></div>
                <div><span className="text-xs text-muted-foreground">Telefon</span><p className="font-medium">{selectedSupplier.phone}</p></div>
                <div><span className="text-xs text-muted-foreground">Email</span><p className="font-medium text-xs">{selectedSupplier.email}</p></div>
                <div><span className="text-xs text-muted-foreground">Adresa</span><p className="font-medium text-xs">{selectedSupplier.city}{selectedSupplier.country ? `, ${selectedSupplier.country}` : ''}</p></div>
                {selectedSupplier.website && <div className="col-span-2"><span className="text-xs text-muted-foreground">Web</span><p className="font-medium text-xs text-blue-600">{selectedSupplier.website}</p></div>}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ukupno narudžbina</span><span className="font-semibold">{selectedSupplier.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ukupna vrednost</span><span className="font-semibold">{formatCurrency(selectedSupplier.totalValue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rok isporuke</span><span>{selectedSupplier.leadTime} dana</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Isporuka na vreme</span>
                  <span className={selectedSupplier.onTimeRate >= 90 ? 'text-green-600 font-semibold' : selectedSupplier.onTimeRate >= 75 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>{selectedSupplier.onTimeRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uslovi plaćanja</span><span>{selectedSupplier.paymentTerms}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Skor performansi</span>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedSupplier.performanceScore} className="w-16 h-2" />
                    <span className={`font-bold ${getPerformanceColor(selectedSupplier.performanceScore)}`}>{selectedSupplier.performanceScore}</span>
                  </div>
                </div>
              </div>
              {selectedSupplier.notes && (
                <div className="border-t pt-3"><span className="text-xs text-muted-foreground">Napomene</span><p className="text-sm mt-1">{selectedSupplier.notes}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDetailOpen(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New/Edit PR Dialog */}
      <Dialog open={prDialogOpen} onOpenChange={setPrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPR ? 'Izmeni zahtev' : 'Novi zahtev za nabavku'}</DialogTitle>
            <DialogDescription>{editingPR ? 'Ažurirajte podatke zahteva' : 'Kreirajte novi zahtev za nabavku robe ili usluga'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Naziv zahteva *</Label>
              <Input value={prForm.title} onChange={(e) => setPrForm({ ...prForm, title: e.target.value })} placeholder="npr. Kancelarijski materijal" />
            </div>
            <div>
              <Label className="text-xs">Opis</Label>
              <Textarea value={prForm.description} onChange={(e) => setPrForm({ ...prForm, description: e.target.value })} placeholder="Detaljan opis potrebe..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Prioritet</Label>
                <Select value={prForm.priority} onValueChange={(v) => setPrForm({ ...prForm, priority: v as 'low' | 'medium' | 'high' | 'urgent' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nizak</SelectItem>
                    <SelectItem value="medium">Srednji</SelectItem>
                    <SelectItem value="high">Visok</SelectItem>
                    <SelectItem value="urgent">Hitan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Departman</Label>
                <Select value={prForm.department} onValueChange={(v) => setPrForm({ ...prForm, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Izaberite...</SelectItem>
                    {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dobavljač</Label>
                <Select value={prForm.supplierId} onValueChange={(v) => setPrForm({ ...prForm, supplierId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Izaberite...</SelectItem>
                    {suppliers.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Potreban do</Label>
                <Input type="date" value={prForm.requiredByDate} onChange={(e) => setPrForm({ ...prForm, requiredByDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Napomene</Label>
              <Textarea value={prForm.notes} onChange={(e) => setPrForm({ ...prForm, notes: e.target.value })} placeholder="Opcionalne napomene..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSavePR}>{editingPR ? 'Sačuvaj izmene' : 'Kreiraj zahtev'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Brisanje zahteva</DialogTitle>
            <DialogDescription>Da li ste sigurni da želite da obrišete &quot;{selectedPR?.prNumber} - {selectedPR?.title}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleDeletePR}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
