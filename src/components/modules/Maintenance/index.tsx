'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { formatRSD, formatRSDShort } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Wrench, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingUp, AlertCircle, Settings, AlertTriangle, Calendar,
  Cpu, Package, Users, Filter, Copy, Hammer, Gauge, Timer,
  ShieldCheck, Archive,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

// ==================== TYPES ====================

interface MaintenanceOrder {
  id: string
  orderNumber: string
  equipmentName: string
  type: string
  description: string
  priority: string
  status: string
  assignedTo?: string
  scheduledDate?: string
  completedDate?: string
  cost?: number
  notes?: string
  createdAt: string
  category?: string
  partsNeeded?: string[]
  safetyNotes?: string
  workLog?: Array<{ date: string; note: string }>
  partsUsed?: Array<{ name: string; qty: number }>
}

interface DashboardData {
  totalOrders: number
  openOrders: number
  inProgressOrders: number
  completedOrders: number
  overdueOrders: number
  totalCost: number
  mtbf: number
  recentOrders: MaintenanceOrder[]
  typeBreakdown: Array<{ type: string; count: number }>
}

interface EquipmentItem {
  id: string
  name: string
  serialNumber: string
  category: string
  location: string
  status: string
  lastMaintenance: string
  nextMaintenance: string
  healthScore: number
  breakdowns90d: number
}

interface MaintenancePlan {
  id: string
  equipmentId: string
  equipmentName: string
  planName: string
  frequency: string
  nextDue: string
  autoCreate: boolean
  completedDates: string[]
}

interface SparePart {
  id: string
  name: string
  partNumber: string
  category: string
  qtyInStock: number
  minStock: number
  location: string
  unitCost: number
  usageLog: Array<{ date: string; orderNumber: string; qty: number }>
}

// ==================== CONFIG ====================

const statusConfig: Record<string, { labelKey: string; color: string }> = {
  open: { labelKey: 'statusOpen', color: 'bg-red-100 text-red-700' },
  scheduled: { labelKey: 'statusScheduled', color: 'bg-sky-100 text-sky-700' },
  in_progress: { labelKey: 'statusInProgress', color: 'bg-amber-100 text-amber-700' },
  completed: { labelKey: 'statusCompleted', color: 'bg-green-100 text-green-700' },
  cancelled: { labelKey: 'statusCancelled', color: 'bg-gray-100 text-gray-700' },
}

const priorityConfig: Record<string, { labelKey: string; color: string }> = {
  low: { labelKey: 'priorityLow', color: 'bg-gray-100 text-gray-700' },
  medium: { labelKey: 'priorityMedium', color: 'bg-amber-100 text-amber-700' },
  high: { labelKey: 'priorityHigh', color: 'bg-orange-100 text-orange-700' },
  critical: { labelKey: 'priorityCritical', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  preventive: 'maintenance.preventive',
  corrective: 'maintenance.corrective',
  emergency: 'maintenance.emergency',
  predictive: 'maintenance.predictive',
}

const categoryLabels: Record<string, string> = {
  production: 'maintenance.categoryProduction',
  office: 'maintenance.categoryOffice',
  vehicles: 'maintenance.categoryVehicles',
  hvac: 'maintenance.categoryHVAC',
  electrical: 'maintenance.categoryElectrical',
  it: 'maintenance.categoryIT',
}

const frequencyLabels: Record<string, string> = {
  daily: 'maintenance.frequencyDaily',
  weekly: 'maintenance.frequencyWeekly',
  monthly: 'maintenance.frequencyMonthly',
  quarterly: 'maintenance.frequencyQuarterly',
  annually: 'maintenance.frequencyAnnually',
}

const equipmentStatusConfig: Record<string, { labelKey: string; color: string }> = {
  active: { labelKey: 'statusActive', color: 'bg-green-100 text-green-700' },
  maintenance: { labelKey: 'statusMaintenance', color: 'bg-amber-100 text-amber-700' },
  down: { labelKey: 'statusDown', color: 'bg-red-100 text-red-700' },
  decommissioned: { labelKey: 'statusDecommissioned', color: 'bg-gray-100 text-gray-700' },
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6b7280']
const COST_COLORS = ['#6366f1', '#22c55e', '#f59e0b']

// ==================== MOCK DATA ====================

const mockEquipment: EquipmentItem[] = [
  { id: 'e1', name: 'CNC mašina Tesla 500', serialNumber: 'CNC-2021-001', category: 'production', location: 'Hala A', status: 'active', lastMaintenance: '2025-05-15', nextMaintenance: '2025-08-15', healthScore: 92, breakdowns90d: 0 },
  { id: 'e2', name: 'Kompresor Atlas Copco GA30', serialNumber: 'CMP-2019-012', category: 'production', location: 'Hala B', status: 'active', lastMaintenance: '2025-06-01', nextMaintenance: '2025-07-01', healthScore: 78, breakdowns90d: 2 },
  { id: 'e3', name: 'Dizel generator FG Wilson', serialNumber: 'GEN-2020-005', category: 'electrical', location: 'Podrum P1', status: 'maintenance', lastMaintenance: '2025-06-10', nextMaintenance: '2025-06-25', healthScore: 55, breakdowns90d: 3 },
  { id: 'e4', name: 'Klima sistem VRV Daikin', serialNumber: 'HVAC-2022-001', category: 'hvac', location: 'Sprat 1', status: 'active', lastMaintenance: '2025-04-20', nextMaintenance: '2025-07-20', healthScore: 88, breakdowns90d: 1 },
  { id: 'e5', name: 'Volkswagen Transporter', serialNumber: 'Veh-2018-007', category: 'vehicles', location: 'Garaža', status: 'active', lastMaintenance: '2025-05-01', nextMaintenance: '2025-08-01', healthScore: 71, breakdowns90d: 1 },
  { id: 'e6', name: 'Server Dell PowerEdge R740', serialNumber: 'IT-2023-003', category: 'it', location: 'Server soba', status: 'active', lastMaintenance: '2025-06-05', nextMaintenance: '2025-09-05', healthScore: 96, breakdowns90d: 0 },
  { id: 'e7', name: 'PVC ekstruder KraussMaffei', serialNumber: 'CNC-2017-020', category: 'production', location: 'Hala A', status: 'down', lastMaintenance: '2025-03-10', nextMaintenance: '2025-06-28', healthScore: 22, breakdowns90d: 5 },
  { id: 'e8', name: 'Canon iR-ADV C5560', serialNumber: 'OF-2021-010', category: 'office', location: 'Sprat 2', status: 'active', lastMaintenance: '2025-05-20', nextMaintenance: '2025-08-20', healthScore: 84, breakdowns90d: 1 },
]

const mockPlans: MaintenancePlan[] = [
  { id: 'p1', equipmentId: 'e1', equipmentName: 'CNC mašina Tesla 500', planName: 'Mesečno podmazivanje', frequency: 'monthly', nextDue: '2025-07-15', autoCreate: true, completedDates: ['2025-05-15', '2025-06-15'] },
  { id: 'p2', equipmentId: 'e2', equipmentName: 'Kompresor Atlas Copco', planName: 'Kvartalni servis', frequency: 'quarterly', nextDue: '2025-06-01', autoCreate: true, completedDates: ['2025-03-01'] },
  { id: 'p3', equipmentId: 'e4', equipmentName: 'Klima sistem VRV Daikin', planName: 'Godišnji servis', frequency: 'annually', nextDue: '2025-07-20', autoCreate: false, completedDates: ['2024-07-20'] },
  { id: 'p4', equipmentId: 'e6', equipmentName: 'Server Dell PowerEdge', planName: 'Nedeljna provera', frequency: 'weekly', nextDue: '2025-06-20', autoCreate: true, completedDates: ['2025-06-13', '2025-06-06'] },
]

const mockSpareParts: SparePart[] = [
  { id: 's1', name: 'Filter ulja CNC', partNumber: 'FO-CNC-100', category: 'production', qtyInStock: 12, minStock: 5, location: 'Magacin A-1', unitCost: 3500, usageLog: [{ date: '2025-06-10', orderNumber: 'MO-2025-0042', qty: 2 }] },
  { id: 's2', name: 'Kalem za kompresor', partNumber: 'KC-ACP-200', category: 'production', qtyInStock: 3, minStock: 2, location: 'Magacin A-2', unitCost: 18500, usageLog: [{ date: '2025-05-28', orderNumber: 'MO-2025-0038', qty: 1 }] },
  { id: 's3', name: 'Remenja set generatora', partNumber: 'RS-FGW-050', category: 'electrical', qtyInStock: 1, minStock: 2, location: 'Magacin B-1', unitCost: 42000, usageLog: [] },
  { id: 's4', name: 'Filter za klimu', partNumber: 'FK-DKN-300', category: 'hvac', qtyInStock: 8, minStock: 4, location: 'Magacin C-1', unitCost: 2800, usageLog: [{ date: '2025-04-20', orderNumber: 'MO-2025-0029', qty: 4 }] },
  { id: 's5', name: 'Guma 235/65 R16', partNumber: 'GR-VW-235', category: 'vehicles', qtyInStock: 4, minStock: 4, location: 'Garaža', unitCost: 15200, usageLog: [{ date: '2025-05-01', orderNumber: 'MO-2025-0035', qty: 2 }] },
  { id: 's6', name: 'HDD 2TB Enterprise', partNumber: 'HD-DELL-2T', category: 'it', qtyInStock: 2, minStock: 1, location: 'Server soba', unitCost: 28000, usageLog: [] },
  { id: 's7', name: 'Ležaj SKF 6205', partNumber: 'LZ-SKF-6205', category: 'production', qtyInStock: 15, minStock: 10, location: 'Magacin A-3', unitCost: 1200, usageLog: [{ date: '2025-06-15', orderNumber: 'MO-2025-0045', qty: 3 }, { date: '2025-03-10', orderNumber: 'MO-2025-0018', qty: 2 }] },
  { id: 's8', name: 'Tonik za štampač', partNumber: 'TN-CAN-055', category: 'office', qtyInStock: 6, minStock: 3, location: 'Magacin D-1', unitCost: 8500, usageLog: [{ date: '2025-05-20', orderNumber: 'MO-2025-0036', qty: 1 }] },
  { id: 's9', name: 'Pasta za obradu metala', partNumber: 'PM-CNC-500', category: 'production', qtyInStock: 0, minStock: 3, location: 'Magacin A-1', unitCost: 4200, usageLog: [{ date: '2025-06-18', orderNumber: 'MO-2025-0047', qty: 5 }] },
  { id: 's10', name: 'LED panel 60x60', partNumber: 'LP-EL-6060', category: 'electrical', qtyInStock: 5, minStock: 2, location: 'Magacin B-2', unitCost: 3500, usageLog: [] },
]

const monthlyTrendData = [
  { month: 'Jan', preventive: 8, corrective: 3, emergency: 1 },
  { month: 'Feb', preventive: 10, corrective: 2, emergency: 0 },
  { month: 'Mar', preventive: 9, corrective: 5, emergency: 2 },
  { month: 'Apr', preventive: 11, corrective: 3, emergency: 1 },
  { month: 'May', preventive: 12, corrective: 4, emergency: 1 },
  { month: 'Jun', preventive: 14, corrective: 3, emergency: 0 },
]

const costTrendData = [
  { month: 'Jan', labor: 45000, parts: 32000, external: 15000 },
  { month: 'Feb', labor: 38000, parts: 28000, external: 12000 },
  { month: 'Mar', labor: 62000, parts: 55000, external: 25000 },
  { month: 'Apr', labor: 48000, parts: 35000, external: 18000 },
  { month: 'May', labor: 52000, parts: 41000, external: 20000 },
  { month: 'Jun', labor: 44000, parts: 30000, external: 14000 },
]

const mtbfMttrData = [
  { month: 'Jan', mtbf: 320, mttr: 4.2 },
  { month: 'Feb', mtbf: 345, mttr: 3.8 },
  { month: 'Mar', mtbf: 280, mttr: 5.5 },
  { month: 'Apr', mtbf: 360, mttr: 3.5 },
  { month: 'May', mtbf: 340, mttr: 4.0 },
  { month: 'Jun', mtbf: 375, mttr: 3.2 },
]

const downtimeData = [
  { name: 'maintenance.categoryProduction', value: 45 },
  { name: 'maintenance.categoryElectrical', value: 20 },
  { name: 'maintenance.categoryHVAC', value: 15 },
  { name: 'maintenance.categoryVehicles', value: 12 },
  { name: 'maintenance.categoryIT', value: 8 },
]

const technicianData = [
  { name: 'Marko Petrović', completed: 18, inProgress: 2 },
  { name: 'Jovan Nikolić', completed: 14, inProgress: 3 },
  { name: 'Stefan Jovanović', completed: 11, inProgress: 1 },
  { name: 'Aleksandar Stanković', completed: 9, inProgress: 2 },
]

const topRepairs = [
  { equipment: 'PVC ekstruder KraussMaffei', cost: 185000, type: 'maintenance.corrective' },
  { equipment: 'Dizel generator FG Wilson', cost: 92000, type: 'maintenance.emergency' },
  { equipment: 'CNC mašina Tesla 500', cost: 67000, type: 'maintenance.preventive' },
  { equipment: 'Kompresor Atlas Copco GA30', cost: 54000, type: 'maintenance.corrective' },
  { equipment: 'Volkswagen Transporter', cost: 43000, type: 'maintenance.preventive' },
]

// ==================== COMPONENT ====================

export function Maintenance() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // --- Common State ---
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<MaintenanceOrder[]>([])
  const [loading, setLoading] = useState(false)

  // --- Orders Tab State ---
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // --- Dialog State ---
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<MaintenanceOrder | null>(null)

  // --- Equipment Tab State ---
  const [equipment] = useState<EquipmentItem[]>(mockEquipment)
  const [equipFilterCat, setEquipFilterCat] = useState('all')
  const [equipFilterStatus, setEquipFilterStatus] = useState('all')
  const [equipDialogOpen, setEquipDialogOpen] = useState(false)
  const [equipDetailOpen, setEquipDetailOpen] = useState(false)
  const [selectedEquip, setSelectedEquip] = useState<EquipmentItem | null>(null)
  const [equipForm, setEquipForm] = useState({
    name: '', serialNumber: '', category: 'production', location: '', status: 'active',
    lastMaintenance: '', nextMaintenance: '', healthScore: 100,
  })

  // --- Plans Tab State ---
  const [plans, setPlans] = useState<MaintenancePlan[]>(mockPlans)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planForm, setPlanForm] = useState({
    equipmentName: '', planName: '', frequency: 'monthly', nextDue: '', autoCreate: true,
  })

  // --- Parts Tab State ---
  const [parts] = useState<SparePart[]>(mockSpareParts)
  const [partDialogOpen, setPartDialogOpen] = useState(false)
  const [partForm, setPartForm] = useState({
    name: '', partNumber: '', category: 'production', qtyInStock: 0, minStock: 1, location: '', unitCost: 0,
  })

  // --- Order Form ---
  const emptyOrderForm = {
    equipmentName: '', category: 'production', type: 'preventive', priority: 'medium',
    description: '', assignedTo: '', scheduledDate: '', estimatedCost: 0,
    partsNeeded: '', safetyNotes: '',
  }
  const [orderForm, setOrderForm] = useState(emptyOrderForm)

  // ==================== DATA LOADING ====================

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/maintenance/orders/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) setDashboard(await res.json())
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (search) params.set('search', search)
      const res = await fetch(`/api/maintenance/orders?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filterStatus, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { loadItems() }, [activeTab, loadItems])

  // ==================== API HANDLERS ====================

  const handleCreateOrder = async () => {
    if (!activeCompanyId) return
    try {
      const partsArr = orderForm.partsNeeded
        ? orderForm.partsNeeded.split('\n').map((s) => s.trim()).filter(Boolean)
        : []
      const res = await fetch('/api/maintenance/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...orderForm,
          cost: orderForm.estimatedCost,
          notes: orderForm.safetyNotes,
          partsNeeded: partsArr,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setOrderForm(emptyOrderForm)
        loadItems()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/maintenance/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('maintenance.confirmDelete'))) return
    try {
      const res = await fetch(`/api/maintenance/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleDuplicateOrder = async () => {
    if (!selected || !activeCompanyId) return
    try {
      const res = await fetch('/api/maintenance/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          equipmentName: selected.equipmentName,
          type: selected.type,
          priority: selected.priority,
          description: selected.description,
          assignedTo: selected.assignedTo,
          cost: selected.cost,
        }),
      })
      if (res.ok) {
        setDetailOpen(false)
        loadItems()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  // ==================== FILTERED DATA ====================

  const filteredOrders = useMemo(() => {
    return items.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false
      if (filterPriority !== 'all' && o.priority !== filterPriority) return false
      if (filterType !== 'all' && o.type !== filterType) return false
      if (filterDateFrom && o.scheduledDate && o.scheduledDate < filterDateFrom) return false
      if (filterDateTo && o.scheduledDate && o.scheduledDate > filterDateTo) return false
      if (search) {
        const s = search.toLowerCase()
        return o.equipmentName.toLowerCase().includes(s) ||
          o.orderNumber.toLowerCase().includes(s) ||
          (o.assignedTo ?? '').toLowerCase().includes(s)
      }
      return true
    })
  }, [items, filterStatus, filterPriority, filterType, filterDateFrom, filterDateTo, search])

  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      if (equipFilterCat !== 'all' && e.category !== equipFilterCat) return false
      if (equipFilterStatus !== 'all' && e.status !== equipFilterStatus) return false
      return true
    })
  }, [equipment, equipFilterCat, equipFilterStatus])

  const equipmentHealthData = useMemo(() => {
    const good = equipment.filter((e) => e.healthScore >= 75).length
    const warning = equipment.filter((e) => e.healthScore >= 50 && e.healthScore < 75).length
    const critical = equipment.filter((e) => e.healthScore >= 25 && e.healthScore < 50).length
    const down = equipment.filter((e) => e.healthScore < 25).length
    return [
      { name: t('maintenance.healthGood'), value: good },
      { name: t('maintenance.healthWarning'), value: warning },
      { name: t('maintenance.healthCritical'), value: critical },
      { name: t('maintenance.healthDown'), value: down },
    ]
  }, [equipment, t])

  const topProblematic = useMemo(() => {
    return [...equipment].sort((a, b) => b.breakdowns90d - a.breakdowns90d).slice(0, 5)
  }, [equipment])

  const upcomingMaintenance = useMemo(() => {
    const now = new Date()
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return equipment
      .filter((e) => e.nextMaintenance && e.nextMaintenance >= now.toISOString().slice(0, 10) && e.nextMaintenance <= week.toISOString().slice(0, 10))
      .sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance))
  }, [equipment])

  const overduePlans = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return plans.filter((p) => p.nextDue < today)
  }, [plans])

  const preventiveRatio = useMemo(() => {
    const total = monthlyTrendData.reduce((s, m) => s + m.preventive + m.corrective + m.emergency, 0)
    const prev = monthlyTrendData.reduce((s, m) => s + m.preventive, 0)
    return total > 0 ? Math.round((prev / total) * 100) : 0
  }, [])

  // ==================== RENDER ====================

  const getStatusBadge = (status: string) => {
    const cfg = statusConfig[status]
    if (!cfg) return null
    return <Badge variant="outline" className={`text-xs ${cfg.color}`}>{t(`maintenance.${cfg.labelKey}`)}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const cfg = priorityConfig[priority]
    if (!cfg) return null
    return <Badge variant="outline" className={`text-xs ${cfg.color}`}>{t(`maintenance.${cfg.labelKey}`)}</Badge>
  }

  const getEquipStatusBadge = (status: string) => {
    const cfg = equipmentStatusConfig[status]
    if (!cfg) return null
    return <Badge variant="outline" className={`text-xs ${cfg.color}`}>{t(`maintenance.${cfg.labelKey}`)}</Badge>
  }

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    if (score >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthBg = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    if (score >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getNextStatusLabel = (current: string) => {
    switch (current) {
      case 'open': return 'statusScheduled'
      case 'scheduled': return 'statusInProgress'
      case 'in_progress': return 'statusCompleted'
      default: return null
    }
  }

  const getNextStatusValue = (current: string) => {
    switch (current) {
      case 'open': return 'scheduled'
      case 'scheduled': return 'in_progress'
      case 'in_progress': return 'completed'
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('maintenance.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('maintenance.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('maintenance.refresh')}
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('maintenance.newOrder')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="h-3.5 w-3.5 mr-1" />{t('maintenance.overview')}</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs"><Wrench className="h-3.5 w-3.5 mr-1" />{t('maintenance.orders')}</TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs"><Cpu className="h-3.5 w-3.5 mr-1" />{t('maintenance.equipment')}</TabsTrigger>
          <TabsTrigger value="plans" className="text-xs"><Calendar className="h-3.5 w-3.5 mr-1" />{t('maintenance.plans')}</TabsTrigger>
          <TabsTrigger value="parts" className="text-xs"><Package className="h-3.5 w-3.5 mr-1" />{t('maintenance.spareParts')}</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1" />{t('maintenance.analytics')}</TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.openOrders')}</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.openOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.inProgress')}</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.inProgressOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.completedThisMonth')}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.completedOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.overdue')}</span>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{dashboard.overdueOrders}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.totalCost')}</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-lg font-bold">{formatRSDShort(dashboard.totalCost)}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('maintenance.mtbf')}</span>
                    <Gauge className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{dashboard.mtbf || 320}h</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.monthlyTrend')}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="preventive" name={t('maintenance.preventive')} stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="corrective" name={t('maintenance.corrective')} stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="emergency" name={t('maintenance.emergency')} stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.equipmentHealth')}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={equipmentHealthData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label>
                          {equipmentHealthData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.topProblematic')}</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('maintenance.equipmentName')}</TableHead>
                          <TableHead className="text-xs text-right">{t('maintenance.breakdowns90d')}</TableHead>
                          <TableHead className="text-xs text-right">{t('maintenance.healthScore')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProblematic.map((eq) => (
                          <TableRow key={eq.id}>
                            <TableCell className="text-sm">{eq.name}</TableCell>
                            <TableCell className="text-sm text-right font-medium text-red-600">{eq.breakdowns90d}</TableCell>
                            <TableCell className="text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={eq.healthScore} className={`h-2 w-16 ${getHealthBg(eq.healthScore)}`} />
                                <span className={`font-medium ${getHealthColor(eq.healthScore)}`}>{eq.healthScore}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('maintenance.upcomingMaintenance')}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('maintenance.next7Days')}</p>
                  </CardHeader>
                  <CardContent>
                    {upcomingMaintenance.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">{t('maintenance.noData')}</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {upcomingMaintenance.map((eq) => (
                          <div key={eq.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{eq.name}</div>
                              <div className="text-xs text-muted-foreground">{eq.location}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700">{eq.nextMaintenance}</Badge>
                              <div className={`text-xs mt-1 font-medium ${getHealthColor(eq.healthScore)}`}>{eq.healthScore}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ==================== TAB 2: WORK ORDERS ==================== */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('maintenance.searchOrders')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('maintenance.allStatuses')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('maintenance.allStatuses')}</SelectItem>
                  {Object.entries(statusConfig).map(([k]) => (
                    <SelectItem key={k} value={k}>{t(`maintenance.${statusConfig[k].labelKey}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.entries(priorityConfig).map(([k]) => (
                    <SelectItem key={k} value={k}>{t(`maintenance.${priorityConfig[k].labelKey}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" className="w-[140px]" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
              <Input type="date" className="w-[140px]" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('maintenance.noOrders')}</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> {t('maintenance.createFirst')}</Button>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs text-muted-foreground">
                    <TableHead>{t('maintenance.orderNumber')}</TableHead>
                    <TableHead>{t('maintenance.equipmentName')}</TableHead>
                    <TableHead>{t('maintenance.type')}</TableHead>
                    <TableHead>{t('maintenance.priority')}</TableHead>
                    <TableHead>{t('maintenance.assignedTo')}</TableHead>
                    <TableHead>{t('maintenance.scheduledDate')}</TableHead>
                    <TableHead>{t('maintenance.cost')}</TableHead>
                    <TableHead>{t('maintenance.status')}</TableHead>
                    <TableHead>{t('maintenance.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                      <TableCell className="text-sm">{o.equipmentName}</TableCell>
                      <TableCell className="text-sm">{t(typeLabels[o.type] || o.type)}</TableCell>
                      <TableCell>{getPriorityBadge(o.priority)}</TableCell>
                      <TableCell className="text-sm">{o.assignedTo || '-'}</TableCell>
                      <TableCell className="text-xs">{o.scheduledDate || '-'}</TableCell>
                      <TableCell className="text-sm">{o.cost ? formatRSDShort(o.cost) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(o.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(o); setDetailOpen(true) }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {getNextStatusValue(o.status) && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title={t(`maintenance.${getNextStatusLabel(o.status)}`)}
                              onClick={() => handleUpdateStatus(o.id, getNextStatusValue(o.status)!)}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(o.id)}>
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
        </TabsContent>

        {/* ==================== TAB 3: EQUIPMENT ==================== */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={equipFilterCat} onValueChange={setEquipFilterCat}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={equipFilterStatus} onValueChange={setEquipFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(equipmentStatusConfig).map(([k]) => (
                  <SelectItem key={k} value={k}>{t(`maintenance.${equipmentStatusConfig[k].labelKey}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button size="sm" onClick={() => setEquipDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> {t('maintenance.addEquipment')}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead>{t('maintenance.equipmentName')}</TableHead>
                  <TableHead>{t('maintenance.serialNumber')}</TableHead>
                  <TableHead>{t('maintenance.category')}</TableHead>
                  <TableHead>{t('maintenance.location')}</TableHead>
                  <TableHead>{t('maintenance.status')}</TableHead>
                  <TableHead>{t('maintenance.lastMaintenance')}</TableHead>
                  <TableHead>{t('maintenance.nextMaintenance')}</TableHead>
                  <TableHead>{t('maintenance.healthScore')}</TableHead>
                  <TableHead>{t('maintenance.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="text-sm font-medium">{eq.name}</TableCell>
                    <TableCell className="text-xs font-mono">{eq.serialNumber}</TableCell>
                    <TableCell className="text-sm">{t(categoryLabels[eq.category] || eq.category)}</TableCell>
                    <TableCell className="text-sm">{eq.location}</TableCell>
                    <TableCell>{getEquipStatusBadge(eq.status)}</TableCell>
                    <TableCell className="text-xs">{eq.lastMaintenance}</TableCell>
                    <TableCell className="text-xs">{eq.nextMaintenance}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={eq.healthScore} className={`h-2 w-14 ${getHealthBg(eq.healthScore)}`} />
                        <span className={`text-xs font-medium ${getHealthColor(eq.healthScore)}`}>{eq.healthScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedEquip(eq); setEquipDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEquipForm({ name: eq.name, serialNumber: eq.serialNumber, category: eq.category, location: eq.location, status: eq.status, lastMaintenance: eq.lastMaintenance, nextMaintenance: eq.nextMaintenance, healthScore: eq.healthScore }); setEquipDialogOpen(true) }}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== TAB 4: MAINTENANCE PLANS ==================== */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {overduePlans.length > 0 && (
                <Badge variant="destructive" className="text-xs mb-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('maintenance.overduePlans')}: {overduePlans.length}
                </Badge>
              )}
            </div>
            <Button size="sm" onClick={() => setPlanDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('maintenance.addPlan')}
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead>{t('maintenance.equipmentName')}</TableHead>
                  <TableHead>{t('maintenance.planName')}</TableHead>
                  <TableHead>{t('maintenance.frequency')}</TableHead>
                  <TableHead>{t('maintenance.nextDue')}</TableHead>
                  <TableHead>{t('maintenance.autoCreate')}</TableHead>
                  <TableHead>{t('maintenance.planHistory')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const isOverdue = plan.nextDue < new Date().toISOString().slice(0, 10)
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="text-sm font-medium">{plan.equipmentName}</TableCell>
                      <TableCell className="text-sm">{plan.planName}</TableCell>
                      <TableCell className="text-sm">{t(frequencyLabels[plan.frequency] || plan.frequency)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${isOverdue ? 'bg-red-50 text-red-700' : ''}`}>
                          {plan.nextDue} {isOverdue && <AlertTriangle className="h-3 w-3 ml-1 inline" />}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={plan.autoCreate} disabled />
                      </TableCell>
                      <TableCell className="text-xs">{plan.completedDates.length}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== TAB 5: SPARE PARTS ==================== */}
        <TabsContent value="parts" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setPartDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('maintenance.addPart')}
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead>{t('maintenance.partName')}</TableHead>
                  <TableHead>{t('maintenance.partNumber')}</TableHead>
                  <TableHead>{t('maintenance.category')}</TableHead>
                  <TableHead>{t('maintenance.qtyInStock')}</TableHead>
                  <TableHead>{t('maintenance.minStock')}</TableHead>
                  <TableHead>{t('maintenance.location')}</TableHead>
                  <TableHead>{t('maintenance.unitCost')}</TableHead>
                  <TableHead>{t('maintenance.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => {
                  const isLow = part.qtyInStock <= part.minStock
                  return (
                    <TableRow key={part.id}>
                      <TableCell className="text-sm font-medium">
                        {part.name}
                        {isLow && (
                          <Badge variant="destructive" className="ml-2 text-xs px-1 py-0">
                            <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                            {t('maintenance.lowStock')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{part.partNumber}</TableCell>
                      <TableCell className="text-sm">{t(categoryLabels[part.category] || part.category)}</TableCell>
                      <TableCell className={`text-sm font-medium ${isLow ? 'text-red-600' : ''}`}>{part.qtyInStock}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{part.minStock}</TableCell>
                      <TableCell className="text-sm">{part.location}</TableCell>
                      <TableCell className="text-sm">{formatRSDShort(part.unitCost)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== TAB 6: ANALYTICS ==================== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.monthlyCosts')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => formatRSD(value)} />
                    <Legend />
                    <Bar dataKey="labor" name={t('maintenance.laborCosts')} stackId="a" fill="#6366f1" />
                    <Bar dataKey="parts" name={t('maintenance.partsCosts')} stackId="a" fill="#22c55e" />
                    <Bar dataKey="external" name={t('maintenance.externalCosts')} stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.mtbfTrend')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={mtbfMttrData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="mtbf" name={t('maintenance.mtbf')} stroke="#6366f1" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="mttr" name={t('maintenance.mttr')} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.downtimeByCategory')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={downtimeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${t(name)} (${value}h)`}>
                      {downtimeData.map((_entry, index) => (
                        <Cell key={`downtime-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.technicianWorkload')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={technicianData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name={t('maintenance.statusCompleted')} fill="#22c55e" />
                    <Bar dataKey="inProgress" name={t('maintenance.statusInProgress')} fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.topExpensive')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('maintenance.equipmentName')}</TableHead>
                      <TableHead className="text-xs">{t('maintenance.type')}</TableHead>
                      <TableHead className="text-xs text-right">{t('maintenance.cost')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRepairs.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{r.equipment}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">{t(r.type)}</Badge></TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatRSD(r.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('maintenance.preventiveRatio')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{t('maintenance.preventive')}</span>
                  <span className="font-bold text-green-600">{preventiveRatio}%</span>
                </div>
                <Progress value={preventiveRatio} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span>{t('maintenance.corrective')} + {t('maintenance.emergency')}</span>
                  <span className="font-bold text-red-600">{100 - preventiveRatio}%</span>
                </div>
                <Progress value={100 - preventiveRatio} className="h-3 bg-red-100" />
                <Separator />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t('maintenance.totalOrdersLabel')}</span>
                  <span className="font-medium">{monthlyTrendData.reduce((s, m) => s + m.preventive + m.corrective + m.emergency, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ==================== CREATE ORDER DIALOG ==================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('maintenance.newOrder')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('maintenance.equipmentName')}</Label>
              <Input value={orderForm.equipmentName} onChange={(e) => setOrderForm({ ...orderForm, equipmentName: e.target.value })} placeholder="Naziv opreme" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.category')}</Label>
                <Select value={orderForm.category} onValueChange={(v) => setOrderForm({ ...orderForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.type')}</Label>
                <Select value={orderForm.type} onValueChange={(v) => setOrderForm({ ...orderForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.priority')}</Label>
              <Select value={orderForm.priority} onValueChange={(v) => setOrderForm({ ...orderForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([k]) => (
                    <SelectItem key={k} value={k}>{t(`maintenance.${priorityConfig[k].labelKey}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.description')}</Label>
              <Textarea value={orderForm.description} onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })} placeholder="Opišite problem ili rad" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.assignedTo')}</Label>
                <Input value={orderForm.assignedTo} onChange={(e) => setOrderForm({ ...orderForm, assignedTo: e.target.value })} placeholder="Ime tehničara" />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.scheduledDate')}</Label>
                <Input type="date" value={orderForm.scheduledDate} onChange={(e) => setOrderForm({ ...orderForm, scheduledDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.estimatedCost')} (RSD)</Label>
              <Input type="number" value={orderForm.estimatedCost || ''} onChange={(e) => setOrderForm({ ...orderForm, estimatedCost: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.partsNeeded')}</Label>
              <Textarea value={orderForm.partsNeeded} onChange={(e) => setOrderForm({ ...orderForm, partsNeeded: e.target.value })} placeholder="Jedan deo po liniji" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.safetyNotes')}</Label>
              <Textarea value={orderForm.safetyNotes} onChange={(e) => setOrderForm({ ...orderForm, safetyNotes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setOrderForm(emptyOrderForm) }}>{t('maintenance.cancel')}</Button>
            <Button onClick={handleCreateOrder}><Plus className="h-4 w-4 mr-1" /> {t('maintenance.createOrder')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== ORDER DETAIL DIALOG ==================== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t('maintenance.orderDetails')}</DialogTitle>
              {selected && getNextStatusValue(selected.status) && (
                <Button size="sm" variant="outline" className="text-amber-600"
                  onClick={() => { handleUpdateStatus(selected.id, getNextStatusValue(selected.status)!)
                    setDetailOpen(false) }}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {t(`maintenance.${getNextStatusLabel(selected.status)}`)}
                </Button>
              )}
            </div>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('maintenance.orderNumber')}:</span> <span className="font-mono">{selected.orderNumber}</span></div>
                <div><span className="text-muted-foreground">{t('maintenance.status')}:</span> {getStatusBadge(selected.status)}</div>
                <div><span className="text-muted-foreground">{t('maintenance.equipmentName')}:</span> {selected.equipmentName}</div>
                <div><span className="text-muted-foreground">{t('maintenance.type')}:</span> {t(typeLabels[selected.type] || selected.type)}</div>
                <div><span className="text-muted-foreground">{t('maintenance.priority')}:</span> {getPriorityBadge(selected.priority)}</div>
                {selected.assignedTo && <div><span className="text-muted-foreground">{t('maintenance.assignedTo')}:</span> {selected.assignedTo}</div>}
                {selected.scheduledDate && <div><span className="text-muted-foreground">{t('maintenance.scheduledDate')}:</span> {selected.scheduledDate}</div>}
                {selected.completedDate && <div><span className="text-muted-foreground">{t('maintenance.completedDate')}:</span> {selected.completedDate}</div>}
                {selected.cost != null && selected.cost > 0 && (
                  <div><span className="text-muted-foreground">{t('maintenance.cost')}:</span> <span className="font-bold">{formatRSD(selected.cost)}</span></div>
                )}
              </div>
              <Separator />
              {selected.description && (
                <div className="text-sm"><span className="text-muted-foreground">{t('maintenance.description')}:</span><br />{selected.description}</div>
              )}
              {selected.notes && (
                <div className="text-sm"><span className="text-muted-foreground">{t('maintenance.safetyNotes')}:</span><br />{selected.notes}</div>
              )}
              {selected.partsNeeded && selected.partsNeeded.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground font-medium">{t('maintenance.partsNeeded')}:</span>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {selected.partsNeeded.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </>
              )}
              {selected.workLog && selected.workLog.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground font-medium">{t('maintenance.workLog')}:</span>
                    <div className="mt-2 space-y-2">
                      {selected.workLog.map((w, i) => (
                        <div key={i} className="border-l-2 border-primary pl-3">
                          <div className="text-xs text-muted-foreground">{w.date}</div>
                          <div>{w.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {selected.partsUsed && selected.partsUsed.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground font-medium">{t('maintenance.partsUsed')}:</span>
                    <div className="mt-2 space-y-1">
                      {selected.partsUsed.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{p.name}</span>
                          <span className="text-muted-foreground">x{p.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDuplicateOrder}>
                  <Copy className="h-4 w-4 mr-1" /> {t('maintenance.duplicateOrder')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== EQUIPMENT ADD/EDIT DIALOG ==================== */}
      <Dialog open={equipDialogOpen} onOpenChange={setEquipDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('maintenance.addEquipment')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('maintenance.equipmentName')}</Label>
              <Input value={equipForm.name} onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.serialNumber')}</Label>
                <Input value={equipForm.serialNumber} onChange={(e) => setEquipForm({ ...equipForm, serialNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.category')}</Label>
                <Select value={equipForm.category} onValueChange={(v) => setEquipForm({ ...equipForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.location')}</Label>
                <Input value={equipForm.location} onChange={(e) => setEquipForm({ ...equipForm, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.status')}</Label>
                <Select value={equipForm.status} onValueChange={(v) => setEquipForm({ ...equipForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(equipmentStatusConfig).map(([k]) => (
                      <SelectItem key={k} value={k}>{t(`maintenance.${equipmentStatusConfig[k].labelKey}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.lastMaintenance')}</Label>
                <Input type="date" value={equipForm.lastMaintenance} onChange={(e) => setEquipForm({ ...equipForm, lastMaintenance: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.nextMaintenance')}</Label>
                <Input type="date" value={equipForm.nextMaintenance} onChange={(e) => setEquipForm({ ...equipForm, nextMaintenance: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEquipDialogOpen(false)}>{t('maintenance.cancel')}</Button>
            <Button onClick={() => setEquipDialogOpen(false)}>{t('maintenance.createOrder')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== EQUIPMENT DETAIL DIALOG ==================== */}
      <Dialog open={equipDetailOpen} onOpenChange={setEquipDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('maintenance.equipmentDetails')}</DialogTitle></DialogHeader>
          {selectedEquip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('maintenance.equipmentName')}:</span> <span className="font-medium">{selectedEquip.name}</span></div>
                <div><span className="text-muted-foreground">{t('maintenance.serialNumber')}:</span> <span className="font-mono">{selectedEquip.serialNumber}</span></div>
                <div><span className="text-muted-foreground">{t('maintenance.category')}:</span> {t(categoryLabels[selectedEquip.category] || selectedEquip.category)}</div>
                <div><span className="text-muted-foreground">{t('maintenance.location')}:</span> {selectedEquip.location}</div>
                <div><span className="text-muted-foreground">{t('maintenance.status')}:</span> {getEquipStatusBadge(selectedEquip.status)}</div>
                <div><span className="text-muted-foreground">{t('maintenance.healthScore')}:</span>
                  <div className={`inline-flex items-center gap-2 ml-1`}>
                    <Progress value={selectedEquip.healthScore} className={`h-2 w-14 ${getHealthBg(selectedEquip.healthScore)}`} />
                    <span className={`font-medium ${getHealthColor(selectedEquip.healthScore)}`}>{selectedEquip.healthScore}%</span>
                  </div>
                </div>
                <div><span className="text-muted-foreground">{t('maintenance.lastMaintenance')}:</span> {selectedEquip.lastMaintenance}</div>
                <div><span className="text-muted-foreground">{t('maintenance.nextMaintenance')}:</span> {selectedEquip.nextMaintenance}</div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">{t('maintenance.maintenanceHistory')}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.filter((o) => o.equipmentName === selectedEquip.name).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('maintenance.noData')}</p>
                  ) : (
                    items.filter((o) => o.equipmentName === selectedEquip.name).map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                        <div>
                          <span className="font-mono text-xs">{o.orderNumber}</span>
                          <span className="text-muted-foreground ml-2">{t(typeLabels[o.type] || o.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(o.status)}
                          <span className="text-xs text-muted-foreground">{o.completedDate || o.scheduledDate || ''}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== ADD PLAN DIALOG ==================== */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('maintenance.addPlan')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('maintenance.equipmentName')}</Label>
              <Input value={planForm.equipmentName} onChange={(e) => setPlanForm({ ...planForm, equipmentName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.planName')}</Label>
              <Input value={planForm.planName} onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.frequency')}</Label>
                <Select value={planForm.frequency} onValueChange={(v) => setPlanForm({ ...planForm, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.nextDue')}</Label>
                <Input type="date" value={planForm.nextDue} onChange={(e) => setPlanForm({ ...planForm, nextDue: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={planForm.autoCreate} onCheckedChange={(checked) => setPlanForm({ ...planForm, autoCreate: checked === true })} />
              <Label>{t('maintenance.autoCreate')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>{t('maintenance.cancel')}</Button>
            <Button onClick={() => {
              setPlans([...plans, { id: `p${plans.length + 1}`, equipmentId: '', equipmentName: planForm.equipmentName, planName: planForm.planName, frequency: planForm.frequency, nextDue: planForm.nextDue, autoCreate: planForm.autoCreate, completedDates: [] }])
              setPlanDialogOpen(false)
            }}>{t('maintenance.createOrder')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== ADD PART DIALOG ==================== */}
      <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('maintenance.addPart')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('maintenance.partName')}</Label>
              <Input value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.partNumber')}</Label>
                <Input value={partForm.partNumber} onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.category')}</Label>
                <Select value={partForm.category} onValueChange={(v) => setPartForm({ ...partForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('maintenance.qtyInStock')}</Label>
                <Input type="number" value={partForm.qtyInStock || ''} onChange={(e) => setPartForm({ ...partForm, qtyInStock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.minStock')}</Label>
                <Input type="number" value={partForm.minStock || ''} onChange={(e) => setPartForm({ ...partForm, minStock: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>{t('maintenance.unitCost')} (RSD)</Label>
                <Input type="number" value={partForm.unitCost || ''} onChange={(e) => setPartForm({ ...partForm, unitCost: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('maintenance.location')}</Label>
              <Input value={partForm.location} onChange={(e) => setPartForm({ ...partForm, location: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartDialogOpen(false)}>{t('maintenance.cancel')}</Button>
            <Button onClick={() => setPartDialogOpen(false)}>{t('maintenance.createOrder')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
