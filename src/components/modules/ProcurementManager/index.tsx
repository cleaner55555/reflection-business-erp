'use client'

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
import { useProcurementManager } from './hooks'

export function MenadzerNabavke() {
  const {activeTab, approvalMetrics, c, d, deleteConfirmOpen, editingPR, filterDept, filterPRPriority, filterPRStatus, filterSuppCat, filterSuppStatus, filteredPRs, filteredSuppliers, handleDeletePR, handleSavePR, loadData, monthlySpending, openNewPR, prDetailOpen, prDialogOpen, prs, searchQuery, selectedPR, selectedSupplier, setActiveTab, setDeleteConfirmOpen, setFilterDept, setFilterPRPriority, setFilterPRStatus, setFilterSuppCat, setFilterSuppStatus, setPrDetailOpen, setPrDialogOpen, setSupplierDetailOpen, spendingByCategory, sub, supplierDetailOpen, suppliers} = useProcurementManager()
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
        <OverviewTab monthlySpending={monthlySpending} prs={prs} suppliers={suppliers} />

        {/* ===== ZAHTEVI ===== */}
        <RequisitionsTab d={d} filterDept={filterDept} filterPRPriority={filterPRPriority} filterPRStatus={filterPRStatus} filteredPRs={filteredPRs} searchQuery={searchQuery} setFilterDept={setFilterDept} setFilterPRPriority={setFilterPRPriority} setFilterPRStatus={setFilterPRStatus} />

        {/* ===== DOBAVLJAČI ===== */}
        <SuppliersTab c={c} filterSuppCat={filterSuppCat} filterSuppStatus={filterSuppStatus} filteredSuppliers={filteredSuppliers} searchQuery={searchQuery} setFilterSuppCat={setFilterSuppCat} setFilterSuppStatus={setFilterSuppStatus} />

        {/* ===== ANALITIKA ===== */}
        <AnalyticsTab approvalMetrics={approvalMetrics} monthlySpending={monthlySpending} spendingByCategory={spendingByCategory} suppliers={suppliers} />
      </Tabs>

      {/* PR Detail Dialog */}
              <SelectedPRprNumbersele prDetailOpen={prDetailOpen} selectedPR={selectedPR} setPrDetailOpen={setPrDetailOpen} />

      {/* Supplier Detail Dialog */}
              <SelectedSuppliername selectedSupplier={selectedSupplier} setSupplierDetailOpen={setSupplierDetailOpen} supplierDetailOpen={supplierDetailOpen} />

      {/* New/Edit PR Dialog */}
              <EditingPRIzmenizahtev d={d} editingPR={editingPR} handleSavePR={handleSavePR} prDialogOpen={prDialogOpen} setPrDialogOpen={setPrDialogOpen} suppliers={suppliers} />

      {/* Delete Confirm Dialog */}
              <Brisanjezahteva deleteConfirmOpen={deleteConfirmOpen} handleDeletePR={handleDeletePR} selectedPR={selectedPR} setDeleteConfirmOpen={setDeleteConfirmOpen} />
    </div>
  )
}
