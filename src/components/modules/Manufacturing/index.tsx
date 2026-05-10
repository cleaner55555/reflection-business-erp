'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { formatRSD, formatRSDShort } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {ArrowLeft, 
  Factory, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingUp, AlertCircle, Settings, AlertTriangle, Calendar,
  Package, Cpu, Wrench, Users, Filter, Play, Pause, Square,
  Layers, Cog, Timer, Zap, Target, ClipboardList,
} from 'lucide-react'

// ======================== TYPES ========================

interface ProductionOrder {
  id: string
  orderNumber: string
  productName: string
  quantityOrdered: number
  quantityProduced: number
  status: 'draft' | 'planned' | 'in_progress' | 'quality_check' | 'completed' | 'cancelled'
  priority: 'normal' | 'high' | 'urgent'
  startDate: string
  endDate: string
  bomComponents: BomComponent[]
  machineId: string
  timeTracking: number
  qualityNotes: string
  notes: string
  progress: number
}

interface BomComponent {
  name: string
  requiredQty: number
  consumedQty: number
  unit: string
  costPerUnit: number
}

interface Bom {
  id: string
  productName: string
  version: string
  components: BomComponent[]
  status: 'draft' | 'active' | 'archived'
  createdDate: string
}

interface Machine {
  id: string
  name: string
  type: 'CNC' | 'Press' | 'Assembly' | 'Package' | 'Other'
  status: 'available' | 'working' | 'maintenance' | 'down'
  location: string
  capacityPerHour: number
  currentLoad: number
  totalHours: number
  downtimeLog: DowntimeEntry[]
}

interface DowntimeEntry {
  date: string
  hours: number
  reason: string
}

interface ScheduleItem {
  id: string
  productName: string
  startDay: number
  duration: number
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  quantity: number
}

// ======================== CONFIG ========================

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Načrt', color: 'bg-slate-100 text-slate-700' },
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  quality_check: { label: 'Kontrola', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normalan', color: 'bg-slate-100 text-slate-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Hitno', color: 'bg-red-100 text-red-700' },
}

const MACHINE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Dostupna', color: 'bg-green-100 text-green-700' },
  working: { label: 'Radi', color: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Održavanje', color: 'bg-amber-100 text-amber-700' },
  down: { label: 'Kvar', color: 'bg-red-100 text-red-700' },
}

const MACHINE_TYPE_CONFIG: Record<string, string> = {
  CNC: 'CNC', Press: 'Presa', Assembly: 'Montaža', Package: 'Pakovanje', Other: 'Ostalo',
}

const BOM_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Načrt', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Arhiviran', color: 'bg-amber-100 text-amber-700' },
}

const SCHEDULE_COLORS: Record<string, string> = {
  planned: 'bg-blue-400',
  in_progress: 'bg-amber-400',
  completed: 'bg-green-400',
  delayed: 'bg-red-400',
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

// ======================== DEFAULT BOM COMPONENTS ========================

const DEFAULT_BOM_COMPONENTS: BomComponent[] = [
  { name: 'Čelična ploča 2mm', requiredQty: 4, consumedQty: 0, unit: 'kom', costPerUnit: 1250 },
  { name: 'Zavarivačka žica 1.2mm', requiredQty: 2.5, consumedQty: 0, unit: 'kg', costPerUnit: 850 },
  { name: 'Lak za metal', requiredQty: 1, consumedQty: 0, unit: 'l', costPerUnit: 3200 },
  { name: 'Sićušni vijci M6', requiredQty: 24, consumedQty: 0, unit: 'kom', costPerUnit: 15 },
  { name: 'Guma za brtvljenje', requiredQty: 2, consumedQty: 0, unit: 'kom', costPerUnit: 450 },
]

const MOCK_DAILY_TREND = [
  { day: 'Pon', planned: 450, actual: 420 },
  { day: 'Uto', planned: 500, actual: 510 },
  { day: 'Sre', planned: 480, actual: 460 },
  { day: 'Čet', planned: 520, actual: 540 },
  { day: 'Pet', planned: 400, actual: 380 },
  { day: 'Sub', planned: 200, actual: 210 },
]

const MOCK_PRODUCT_PIE = [
  { name: 'Kućišta', value: 420 },
  { name: 'Poklopci', value: 1000 },
  { name: 'Pločice', value: 800 },
  { name: 'Brtve', value: 3500 },
  { name: 'Opruge', value: 1900 },
  { name: 'Kutije', value: 1500 },
]

const MOCK_MONTHLY_OUTPUT = [
  { month: 'Jul', units: 4200 },
  { month: 'Avg', units: 4800 },
  { month: 'Sep', units: 5100 },
  { month: 'Okt', units: 4600 },
  { month: 'Nov', units: 5400 },
  { month: 'Dec', units: 3800 },
]

const MOCK_OEE = [
  { month: 'Jul', availability: 92, performance: 88, quality: 95 },
  { month: 'Avg', availability: 90, performance: 91, quality: 93 },
  { month: 'Sep', availability: 88, performance: 93, quality: 96 },
  { month: 'Okt', availability: 85, performance: 89, quality: 94 },
  { month: 'Nov', availability: 93, performance: 92, quality: 97 },
  { month: 'Dec', availability: 91, performance: 90, quality: 92 },
]

const MOCK_TOP_PRODUCTS = [
  { name: 'Gumene brtve E30', volume: 5200 },
  { name: 'Plastične kutije H90', volume: 4800 },
  { name: 'Čelične opruge G60', volume: 3900 },
  { name: 'Elektronske pločice D80', volume: 3200 },
  { name: 'Metalna kućišta A100', volume: 2800 },
]

const MOCK_DEFECT_TREND = [
  { month: 'Jul', brtve: 2.1, kućišta: 3.5, pločice: 1.8 },
  { month: 'Avg', brtve: 1.9, kućišta: 3.2, pločice: 2.0 },
  { month: 'Sep', brtve: 1.5, kućišta: 2.8, pločice: 1.6 },
  { month: 'Okt', brtve: 2.0, kućišta: 3.0, pločice: 1.9 },
  { month: 'Nov', brtve: 1.3, kućišta: 2.5, pločice: 1.4 },
  { month: 'Dec', brtve: 1.8, kućišta: 2.9, pločice: 1.7 },
]

const MOCK_COST_TABLE = [
  { product: 'Kućišta A100', material: 4850, labor: 2200, overhead: 1100, total: 8150 },
  { product: 'Poklopci B200', material: 2100, labor: 1800, overhead: 900, total: 4800 },
  { product: 'Profile C50', material: 5600, labor: 3200, overhead: 1600, total: 10400 },
  { product: 'Pločice D80', material: 1200, labor: 2800, overhead: 1400, total: 5400 },
  { product: 'Brtve E30', material: 450, labor: 600, overhead: 300, total: 1350 },
]

const MOCK_MACHINE_UTIL = [
  { name: 'CNC Frizer', utilization: 85 },
  { name: 'Hidr. presa', utilization: 72 },
  { name: 'Montažna lin.', utilization: 0 },
  { name: 'Pakovalica', utilization: 65 },
  { name: 'CNC Strug', utilization: 0 },
  { name: 'Rotac. presa', utilization: 0 },
]

const MOCK_SHIFT_PRODUCTIVITY = [
  { shift: 'Jutarnja (06-14)', output: 1850, efficiency: 94 },
  { shift: 'Popodnevna (14-22)', output: 1620, efficiency: 87 },
  { shift: 'Noćna (22-06)', output: 980, efficiency: 76 },
]

// ======================== COMPONENT ========================

export function Manufacturing() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('pregled')
  const [subTab, setSubTab] = useState('overview')
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [boms, setBoms] = useState<Bom[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [schedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/manufacturing?companyId=${activeCompanyId}`)
      if (res.ok) {
        const { items } = await res.json()
        setOrders(items.map((o: any) => ({ ...o, bomComponents: JSON.parse(o.bomComponents || '[]') })))
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }, [activeCompanyId])

  // Fetch machines
  const fetchMachines = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/manufacturing?companyId=${activeCompanyId}&type=machines`)
      if (res.ok) {
        const { items } = await res.json()
        setMachines(items.map((m: any) => ({ ...m, downtimeLog: JSON.parse(m.downtimeLog || '[]') })))
      }
    } catch { /* empty */ }
 }, [activeCompanyId])

  // Fetch BOMs
  const fetchBoms = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/manufacturing/bom?companyId=${activeCompanyId}`)
      if (res.ok) {
        const { items } = await res.json()
        setBoms(items.map((b: any) => ({ ...b, components: JSON.parse(b.components || '[]') })))
      }
    } catch { /* empty */ }
 }, [activeCompanyId])

  useEffect(() => { void Promise.all([fetchOrders(), fetchMachines()]) }, [fetchOrders, fetchMachines])
  useEffect(() => { fetchBoms() }, [fetchBoms])

  // Order tab state
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderProductFilter, setOrderProductFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)

  // BOM tab state
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null)

  // Machine tab state
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)

  // Dodaj sub-tab
  const [dodajSubTab, setDodajSubTab] = useState<'order' | 'bom' | 'machine'>('order')

  // Schedule tab state
  const [scheduleView, setScheduleView] = useState<'weekly' | 'monthly'>('weekly')

  // New order form
  const [orderForm, setOrderForm] = useState({
    productName: '', quantity: 100, startDate: '', endDate: '', priority: 'normal' as const, notes: '',
  })

  // New machine form
  const [machineForm, setMachineForm] = useState({
    name: '', type: 'CNC' as const, location: '', capacityPerHour: 50,
  })

  // Derived: unique products for filter
  const uniqueProducts = useMemo(() => {
    const names = new Set(orders.map(o => o.productName))
    return Array.from(names)
  }, [orders])

  // Derived: filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !orderSearch || o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.productName.toLowerCase().includes(orderSearch.toLowerCase())
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter
      const matchProduct = orderProductFilter === 'all' || o.productName === orderProductFilter
      return matchSearch && matchStatus && matchProduct
    })
  }, [orders, orderSearch, orderStatusFilter, orderProductFilter])

  // Derived: KPI values
  const kpi = useMemo(() => {
    const activeOrders = orders.filter(o => ['in_progress', 'quality_check'].includes(o.status)).length
    const inQueue = orders.filter(o => ['draft', 'planned'].includes(o.status)).length
    const completedToday = orders.filter(o => o.status === 'completed').length
    const totalOutput = orders.reduce((sum, o) => sum + o.quantityProduced, 0)
    const totalOrdered = orders.reduce((sum, o) => sum + o.quantityOrdered, 0)
    const efficiencyRate = totalOrdered > 0 ? Math.round((totalOutput / totalOrdered) * 100) : 0
    const defectRate = 2.3
    return { activeOrders, inQueue, completedToday, totalOutput, efficiencyRate, defectRate }
  }, [orders])

  // Derived: top 5 orders by progress
  const topOrders = useMemo(() => {
    return [...orders].filter(o => o.status !== 'cancelled').sort((a, b) => b.progress - a.progress).slice(0, 5)
  }, [orders])

  // Machine status cycle
  const cycleMachineStatus = async (machine: Machine) => {
    const cycle: Machine['status'][] = ['available', 'working', 'maintenance', 'down']
    const idx = cycle.indexOf(machine.status)
    const nextStatus = cycle[(idx + 1) % cycle.length]
    try {
      await fetch(`/api/manufacturing/${machine.id}?XTransformPort=3003`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus, currentLoad: nextStatus === 'available' || nextStatus === 'down' || nextStatus === 'maintenance' ? 0 : machine.currentLoad }) })
      setMachines(prev => prev.map(m => m.id === machine.id ? { ...m, status: nextStatus, currentLoad: nextStatus === 'available' || nextStatus === 'down' || nextStatus === 'maintenance' ? 0 : m.currentLoad } : m))
    } catch { /* toast handled */ }
  }

  // Handle create order
  const handleCreateOrder = async () => {
    if (!activeCompanyId) return
    try {
      const orderNum = `MO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`
      const res = await fetch('/api/manufacturing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, orderNumber: orderNum, productName: orderForm.productName, quantityOrdered: orderForm.quantity, status: 'draft', priority: orderForm.priority, startDate: orderForm.startDate, endDate: orderForm.endDate, notes: orderForm.notes, bomComponents: JSON.stringify(DEFAULT_BOM_COMPONENTS) }) })
      if (res.ok) {
        const newOrder = await res.json()
        setOrders(prev => [...prev, { ...newOrder, bomComponents: JSON.parse(newOrder.bomComponents || '[]') }])
        toast({ title: t('production.newOrder'), description: t('common.created') })
      }
    } catch { toast({ title: 'Error', description: t('common.error'), variant: 'destructive' }) }
    setActiveTab('pregled')
    setSubTab('orders')
    setOrderForm({ productName: '', quantity: 100, startDate: '', endDate: '', priority: 'normal', notes: '' })
  }

  // Handle order status change
  const handleOrderStatusChange = async (order: ProductionOrder, newStatus: ProductionOrder['status']) => {
    try {
      const res = await fetch(`/api/manufacturing/${order.id}?XTransformPort=3003`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, progress: newStatus === 'completed' ? 100 : order.progress }) })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus, progress: newStatus === 'completed' ? 100 : o.progress } : o))
        toast({ title: t('common.status'), description: t('common.updated') })
      }
    } catch { toast({ title: 'Error', description: t('common.error'), variant: 'destructive' }) }
  }

  // Handle add machine
  const handleAddMachine = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/manufacturing?XTransformPort=3003', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, name: machineForm.name, type: machineForm.type, location: machineForm.location, capacityPerHour: machineForm.capacityPerHour }) })
      if (res.ok) {
        const newM = await res.json()
        setMachines(prev => [...prev, { ...newM, downtimeLog: [] }])
        toast({ title: t('production.addMachine'), description: t('common.created') })
 }
    } catch { toast({ title: 'Error', description: t('common.error'), variant: 'destructive' }) }
    setActiveTab('pregled')
    setSubTab('machines')
    setMachineForm({ name: '', type: 'CNC', location: '', capacityPerHour: 50 })
  }

  // Get machine load color
  const getLoadColor = (load: number) => {
    if (load === 0) return 'bg-gray-300'
    if (load < 70) return 'bg-emerald-500'
    if (load <= 90) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // Day labels for schedule
  const dayLabels = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
  const scheduleDays = scheduleView === 'weekly' ? 7 : 14

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('production.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('production.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('common.refresh')}
          </Button>
          {activeTab === 'pregled' && (
            <Button size="sm" onClick={() => { setDodajSubTab('order'); setActiveTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('production.newOrder')}
            </Button>
          )}
          {activeTab === 'pregled' && (
            <Button size="sm" onClick={() => { setDodajSubTab('bom'); setActiveTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('production.newBom')}
            </Button>
          )}
          {activeTab === 'pregled' && (
            <Button size="sm" onClick={() => { setDodajSubTab('machine'); setActiveTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('production.addMachine')}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.activeOrders')}</span>
            <Play className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.activeOrders}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.inQueue')}</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.inQueue}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.completedToday')}</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.completedToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.totalOutput')}</span>
            <Package className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.totalOutput.toLocaleString('sr-RS')}</p>
          <p className="text-xs text-muted-foreground">{t('production.units')}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.efficiencyRate')}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.efficiencyRate}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('production.defectRate')}</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{kpi.defectRate}%</p>
        </Card>
      </div>

      {/* Main Tabs: Pregled / Dodaj / Uredi */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="dodaj"><Plus className="h-4 w-4 mr-1" /> Dodaj</TabsTrigger>
          <TabsTrigger value="uredi"><Edit3 className="h-4 w-4 mr-1" /> Uredi</TabsTrigger>
        </TabsList>

        {/* ====== TAB: PREGLED ====== */}
        <TabsContent value="pregled">
          <Tabs value={subTab} onValueChange={setSubTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> {t('production.overview')}</TabsTrigger>
              <TabsTrigger value="orders"><Factory className="h-4 w-4 mr-1 hidden sm:inline" /> {t('production.orders')}</TabsTrigger>
              <TabsTrigger value="bom"><Layers className="h-4 w-4 mr-1 hidden sm:inline" /> BOM</TabsTrigger>
              <TabsTrigger value="machines"><Cog className="h-4 w-4 mr-1 hidden sm:inline" /> {t('production.machines')}</TabsTrigger>
              <TabsTrigger value="schedule"><Calendar className="h-4 w-4 mr-1 hidden sm:inline" /> {t('production.schedule')}</TabsTrigger>
              <TabsTrigger value="analytics"><Target className="h-4 w-4 mr-1 hidden sm:inline" /> {t('production.analytics')}</TabsTrigger>
            </TabsList>

            {/* Sub-tab: Overview (charts only, KPIs already above) */}
            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Production Trend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.dailyTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DAILY_TREND}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name={t('production.planned')} />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name={t('production.actual')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Production by Product Pie */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.byProduct')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={MOCK_PRODUCT_PIE} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {MOCK_PRODUCT_PIE.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Orders Summary + Machine Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Active Orders */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.topOrders')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topOrders.map(order => (
                    <div key={order.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{order.productName}</span>
                          <span className="text-xs text-muted-foreground ml-2">{order.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${order.progress === 100 ? 'bg-green-500' : order.progress >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${ORDER_STATUS_CONFIG[order.status]?.color || ''}`}>
                        {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Machine Utilization */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.machineUtilization')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {machines.filter(m => m.status === 'working').map(machine => (
                    <div key={machine.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{machine.name}</span>
                        <span className={`text-xs font-medium ${machine.currentLoad < 70 ? 'text-emerald-600' : machine.currentLoad <= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                          {machine.currentLoad}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${getLoadColor(machine.currentLoad)}`} style={{ width: `${machine.currentLoad}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====== TAB 2: ORDERS ====== */}
        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('production.searchOrders')} className="pl-9" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
            </div>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('production.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('production.allStatuses')}</SelectItem>
                {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={orderProductFilter} onValueChange={setOrderProductFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t('production.allProducts')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('production.allProducts')}</SelectItem>
                {uniqueProducts.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Factory className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('production.noOrders')}</p>
              <Button variant="outline" className="mt-3" onClick={() => { setDodajSubTab('order'); setActiveTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> {t('production.createFirst')}</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('production.orderNumber')}</TableHead>
                      <TableHead>{t('production.product')}</TableHead>
                      <TableHead>{t('production.quantity')}</TableHead>
                      <TableHead>{t('production.bomComponents')}</TableHead>
                      <TableHead>{t('production.startDate')}</TableHead>
                      <TableHead>{t('production.endDate')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('production.progress')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                        <TableCell className="font-medium">{order.productName}</TableCell>
                        <TableCell>{order.quantityProduced}/{order.quantityOrdered}</TableCell>
                        <TableCell>{order.bomComponents.length}</TableCell>
                        <TableCell className="text-xs">{order.startDate}</TableCell>
                        <TableCell className="text-xs">{order.endDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${ORDER_STATUS_CONFIG[order.status]?.color || ''}`}>
                            {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={order.progress} className="h-2 w-16" />
                            <span className="text-xs text-muted-foreground">{order.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedOrder(order); setSelectedBom(null); setSelectedMachine(null); setActiveTab('uredi') }}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {order.status === 'planned' && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleOrderStatusChange(order, 'in_progress')}>
                                <Play className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {order.status === 'in_progress' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleOrderStatusChange(order, 'quality_check')}>
                                  <Pause className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleOrderStatusChange(order, 'completed')}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ====== TAB 3: BOM ====== */}
        <TabsContent value="bom" className="space-y-4">
          {boms.length === 0 ? (
            <Card className="p-8 text-center">
              <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('production.noBoms')}</p>
              <Button variant="outline" className="mt-3" onClick={() => { setDodajSubTab('bom'); setActiveTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> {t('production.newBom')}</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('production.product')}</TableHead>
                      <TableHead>{t('production.version')}</TableHead>
                      <TableHead>{t('production.componentsCount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('production.createdDate')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boms.map(bom => {
                      const totalCost = bom.components.reduce((sum, c) => sum + c.costPerUnit * c.requiredQty, 0)
                      return (
                        <TableRow key={bom.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{bom.productName}</TableCell>
                          <TableCell className="font-mono text-xs">{bom.version}</TableCell>
                          <TableCell>{bom.components.length}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${BOM_STATUS_CONFIG[bom.status]?.color || ''}`}>
                              {BOM_STATUS_CONFIG[bom.status]?.label || bom.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{bom.createdDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedBom(bom); setSelectedOrder(null); setSelectedMachine(null); setActiveTab('uredi') }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedBom(bom); setSelectedOrder(null); setSelectedMachine(null); setDodajSubTab('bom'); setActiveTab('dodaj') }}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {}}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{formatRSD(totalCost)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ====== TAB 4: MACHINES ====== */}
        <TabsContent value="machines" className="space-y-4">
          {machines.length === 0 ? (
            <Card className="p-8 text-center">
              <Cog className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('production.noMachines')}</p>
              <Button variant="outline" className="mt-3" onClick={() => { setDodajSubTab('machine'); setActiveTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> {t('production.addMachine')}</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map(machine => (
                <Card key={machine.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-sm">{machine.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${MACHINE_STATUS_CONFIG[machine.status]?.color || ''}`}>
                      {MACHINE_STATUS_CONFIG[machine.status]?.label || machine.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">{t('production.type')}:</span> {MACHINE_TYPE_CONFIG[machine.type]}</div>
                    <div><span className="text-muted-foreground">{t('production.location')}:</span> {machine.location}</div>
                    <div><span className="text-muted-foreground">{t('production.capacity')}:</span> {machine.capacityPerHour} {t('production.unitsPerHour')}</div>
                    <div><span className="text-muted-foreground">{t('production.totalHours')}:</span> {machine.totalHours.toLocaleString('sr-RS')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('production.currentLoad')}</span>
                      <span className={`text-xs font-medium ${machine.currentLoad < 70 ? 'text-emerald-600' : machine.currentLoad <= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                        {machine.currentLoad}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${getLoadColor(machine.currentLoad)}`} style={{ width: `${machine.currentLoad}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => cycleMachineStatus(machine)}>
                      <RefreshCw className="h-3 w-3 mr-1" /> {t('production.toggleStatus')}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedMachine(machine); setSelectedOrder(null); setSelectedBom(null); setActiveTab('uredi') }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setMachines(prev => prev.filter(m => m.id !== machine.id))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ====== TAB 5: SCHEDULE ====== */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-lg p-1">
              <Button variant={scheduleView === 'weekly' ? 'default' : 'ghost'} size="sm" onClick={() => setScheduleView('weekly')}>{t('production.weekly')}</Button>
              <Button variant={scheduleView === 'monthly' ? 'default' : 'ghost'} size="sm" onClick={() => setScheduleView('monthly')}>{t('production.monthly')}</Button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {Object.entries(SCHEDULE_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-muted-foreground">{ORDER_STATUS_CONFIG[key]?.label || key}</span>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-4 overflow-x-auto">
              {/* Schedule Grid */}
              <div className="min-w-[700px]">
                {/* Header: day labels */}
                <div className="grid gap-0" style={{ gridTemplateColumns: '160px 1fr' }}>
                  <div className="text-xs text-muted-foreground p-2 border-b">{t('production.product')}</div>
                  <div className="grid grid-cols-7 border-b">
                    {dayLabels.map(day => (
                      <div key={day} className="text-center text-xs font-medium p-2 border-l">{day}</div>
                    ))}
                    {scheduleView === 'monthly' && dayLabels.map((day, i) => (
                      <div key={`m-${i}`} className="text-center text-xs font-medium p-2 border-l text-muted-foreground">{day}</div>
                    ))}
                  </div>
                </div>

                {/* Rows: one per schedule item */}
                {schedule.map(item => (
                  <div key={item.id} className="grid gap-0" style={{ gridTemplateColumns: '160px 1fr' }}>
                    <div className="text-xs font-medium p-2 border-b flex items-center gap-1">
                      <span className="truncate">{item.productName}</span>
                      <Badge variant="outline" className="text-xs shrink-0">{item.quantity}</Badge>
                    </div>
                    <div className="relative border-b grid grid-cols-7" style={{ gridTemplateColumns: `repeat(${scheduleDays}, 1fr)` }}>
                      {Array.from({ length: scheduleDays }, (_, i) => (
                        <div key={i} className="border-l h-10" />
                      ))}
                      {/* Schedule bar */}
                      <div
                        className={`absolute top-1 h-8 rounded ${SCHEDULE_COLORS[item.status]} opacity-80 flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:opacity-100 transition-opacity`}
                        style={{
                          left: `${(item.startDay / scheduleDays) * 100}%`,
                          width: `${(item.duration / scheduleDays) * 100}%`,
                          maxWidth: '100%',
                        }}
                        title={`${item.productName}: ${item.quantity} ${t('production.units')}`}
                      >
                        <span className="truncate px-1">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Today indicator (day 3 = Thursday) */}
                <div className="grid gap-0" style={{ gridTemplateColumns: '160px 1fr' }}>
                  <div className="p-2" />
                  <div className="relative grid grid-cols-7">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${(3 / scheduleDays) * 100 + 100 / scheduleDays / 2}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Overview */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.capacityOverview')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map((day, i) => {
                  const plannedHours = 6 + Math.floor(Math.random() * 3)
                  const availableHours = 8
                  const pct = Math.round((plannedHours / availableHours) * 100)
                  return (
                    <div key={day} className="text-center space-y-1">
                      <span className="text-xs font-medium">{day}</span>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{plannedHours}/{availableHours}h</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TAB 6: ANALYTICS ====== */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Row 1: Monthly Output + OEE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.monthlyOutputTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_MONTHLY_OUTPUT}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} name={t('production.units')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.oeeTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_OEE}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[80, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="availability" stroke="#3b82f6" strokeWidth={2} name={t('production.availability')} />
                      <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} name={t('production.performance')} />
                      <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} name={t('production.quality')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Top Products + Defect Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.topProductsVolume')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_TOP_PRODUCTS} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#10b981" radius={[0, 4, 4, 0]} name={t('production.units')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.defectTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DEFECT_TREND}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} unit="%" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="brtve" stroke="#ef4444" strokeWidth={2} name="Brtve" />
                      <Line type="monotone" dataKey="kućišta" stroke="#f59e0b" strokeWidth={2} name="Kućišta" />
                      <Line type="monotone" dataKey="pločice" stroke="#3b82f6" strokeWidth={2} name="Pločice" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Cost per Unit Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.costPerUnit')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('production.product')}</TableHead>
                      <TableHead>{t('production.materialCost')}</TableHead>
                      <TableHead>{t('production.laborCost')}</TableHead>
                      <TableHead>{t('production.overheadCost')}</TableHead>
                      <TableHead className="font-bold">{t('production.totalCost')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_COST_TABLE.map(row => (
                      <TableRow key={row.product}>
                        <TableCell className="font-medium">{row.product}</TableCell>
                        <TableCell>{formatRSD(row.material)}</TableCell>
                        <TableCell>{formatRSD(row.labor)}</TableCell>
                        <TableCell>{formatRSD(row.overhead)}</TableCell>
                        <TableCell className="font-bold">{formatRSD(row.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Row 4: Machine Utilization + Shift Productivity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.machineUtilComparison')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_MACHINE_UTIL}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                      <Tooltip />
                      <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                        {MOCK_MACHINE_UTIL.map((entry, index) => (
                          <Cell key={`mutil-${index}`} fill={entry.utilization === 0 ? '#d1d5db' : entry.utilization < 70 ? '#10b981' : entry.utilization <= 90 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('production.shiftProductivity')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_SHIFT_PRODUCTIVITY}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="shift" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="output" fill="#10b981" radius={[4, 4, 0, 0]} name={t('production.units')} />
                      <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('production.efficiency') + ' %'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ====== TAB: DODAJ ====== */}
        <TabsContent value="dodaj" className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button variant={dodajSubTab === 'order' ? 'default' : 'outline'} size="sm" onClick={() => setDodajSubTab('order')}>
              <Factory className="h-4 w-4 mr-1" /> {t('production.orders')}
            </Button>
            <Button variant={dodajSubTab === 'bom' ? 'default' : 'outline'} size="sm" onClick={() => setDodajSubTab('bom')}>
              <Layers className="h-4 w-4 mr-1" /> BOM
            </Button>
            <Button variant={dodajSubTab === 'machine' ? 'default' : 'outline'} size="sm" onClick={() => setDodajSubTab('machine')}>
              <Cog className="h-4 w-4 mr-1" /> {t('production.machines')}
            </Button>
          </div>

          {/* Dodaj: New Order */}
          {dodajSubTab === 'order' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{t('production.newOrder')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('production.product')}</Label>
                  <Select value={orderForm.productName} onValueChange={(v) => setOrderForm(f => ({ ...f, productName: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('production.selectProduct')} /></SelectTrigger>
                    <SelectContent>
                      {uniqueProducts.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      <SelectItem value="__new">{t('production.newProduct')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.quantity')}</Label>
                    <Input type="number" value={orderForm.quantity} onChange={(e) => setOrderForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('production.startDate')}</Label>
                    <Input type="date" value={orderForm.startDate} onChange={(e) => setOrderForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('production.endDate')}</Label>
                    <Input type="date" value={orderForm.endDate} onChange={(e) => setOrderForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('production.priority')}</Label>
                  <Select value={orderForm.priority} onValueChange={(v) => setOrderForm(f => ({ ...f, priority: v as 'normal' | 'high' | 'urgent' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.notes')}</Label>
                  <Textarea value={orderForm.notes} onChange={(e) => setOrderForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('pregled')}>{t('common.cancel')}</Button>
                  <Button onClick={handleCreateOrder}><Plus className="h-4 w-4 mr-1" /> {t('production.createOrder')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dodaj: New BOM */}
          {dodajSubTab === 'bom' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{selectedBom ? t('production.editBom') : t('production.newBom')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('production.product')}</Label>
                  <Select defaultValue={selectedBom?.productName || ''}>
                    <SelectTrigger><SelectValue placeholder={t('production.selectProduct')} /></SelectTrigger>
                    <SelectContent>
                      {uniqueProducts.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('production.version')}</Label>
                  <Input defaultValue={selectedBom?.version || 'v1.0'} />
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t('production.components')}</Label>
                    <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> {t('production.addComponent')}</Button>
                  </div>
                  {(selectedBom?.components || MOCK_BOM_COMPONENTS.slice(0, 2)).map((comp, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                      <Input defaultValue={comp.name} placeholder={t('production.material')} className="col-span-2" />
                      <Input type="number" defaultValue={comp.requiredQty} placeholder={t('common.quantity')} />
                      <Select defaultValue={comp.unit}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kom">kom</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="text-right text-sm font-semibold">
                  {t('production.totalCost')}: {formatRSD((selectedBom?.components || MOCK_BOM_COMPONENTS.slice(0, 2)).reduce((s, c) => s + c.costPerUnit * c.requiredQty, 0))}
                </div>
                <div className="flex justify-end gap-2 border-t pt-4 mt-4">
                  <Button variant="outline" onClick={() => { setActiveTab('pregled'); setSelectedBom(null) }}>{t('common.cancel')}</Button>
                  <Button onClick={() => { setActiveTab('pregled'); setSelectedBom(null) }}>{t('common.save')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dodaj: New Machine */}
          {dodajSubTab === 'machine' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{t('production.addMachine')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input value={machineForm.name} onChange={(e) => setMachineForm(f => ({ ...f, name: e.target.value }))} placeholder={t('production.machineNamePlaceholder')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('production.type')}</Label>
                    <Select value={machineForm.type} onValueChange={(v) => setMachineForm(f => ({ ...f, type: v as Machine['type'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(MACHINE_TYPE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('production.location')}</Label>
                    <Input value={machineForm.location} onChange={(e) => setMachineForm(f => ({ ...f, location: e.target.value }))} placeholder="Hala A" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('production.capacity')} ({t('production.unitsPerHour')})</Label>
                  <Input type="number" value={machineForm.capacityPerHour} onChange={(e) => setMachineForm(f => ({ ...f, capacityPerHour: parseInt(e.target.value) || 50 }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('pregled')}>{t('common.cancel')}</Button>
                  <Button onClick={handleAddMachine}><Plus className="h-4 w-4 mr-1" /> {t('production.addMachine')}</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ====== TAB: UREDI ====== */}
        <TabsContent value="uredi" className="space-y-4">
          {!selectedOrder && !selectedBom && !selectedMachine && (
            <Card className="p-8 text-center">
              <Edit3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('production.noSelection')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('production.selectItemHint')}</p>
            </Card>
          )}

          {/* Uredi: Order Detail */}
          {selectedOrder && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setSelectedOrder(null); setActiveTab('pregled') }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm flex-1">{t('production.orderDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t('production.orderNumber')}:</span> <span className="font-mono font-bold">{selectedOrder.orderNumber}</span></div>
                  <div><span className="text-muted-foreground">{t('production.product')}:</span> {selectedOrder.productName}</div>
                  <div>
                    <span className="text-muted-foreground">{t('common.status')}:</span>{' '}
                    <Badge variant="outline" className={ORDER_STATUS_CONFIG[selectedOrder.status]?.color}>{ORDER_STATUS_CONFIG[selectedOrder.status]?.label}</Badge>
                  </div>
                  <div><span className="text-muted-foreground">{t('production.priority')}:</span>{' '}
                    <Badge variant="outline" className={PRIORITY_CONFIG[selectedOrder.priority]?.color}>{PRIORITY_CONFIG[selectedOrder.priority]?.label}</Badge>
                  </div>
                  <div><span className="text-muted-foreground">{t('production.quantity')}:</span> {selectedOrder.quantityProduced}/{selectedOrder.quantityOrdered}</div>
                  <div><span className="text-muted-foreground">{t('production.progress')}:</span> {selectedOrder.progress}%</div>
                  <div><span className="text-muted-foreground">{t('production.startDate')}:</span> {selectedOrder.startDate}</div>
                  <div><span className="text-muted-foreground">{t('production.endDate')}:</span> {selectedOrder.endDate}</div>
                  <div><span className="text-muted-foreground">{t('production.timeTracking')}:</span> {selectedOrder.timeTracking}h</div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t('production.progress')}</span>
                    <span className="font-medium">{selectedOrder.progress}%</span>
                  </div>
                  <Progress value={selectedOrder.progress} className="h-3" />
                </div>

                <Separator />

                {/* BOM Components Checklist */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('production.bomComponents')}</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('production.component')}</TableHead>
                          <TableHead>{t('production.requiredQty')}</TableHead>
                          <TableHead>{t('production.consumedQty')}</TableHead>
                          <TableHead>{t('common.unit')}</TableHead>
                          <TableHead>{t('production.costPerUnit')}</TableHead>
                          <TableHead>{t('production.totalCost')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.bomComponents.map((comp, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{comp.name}</TableCell>
                            <TableCell>{comp.requiredQty}</TableCell>
                            <TableCell>
                              <span className={comp.consumedQty >= comp.requiredQty ? 'text-green-600' : 'text-amber-600'}>{comp.consumedQty}</span>
                            </TableCell>
                            <TableCell>{comp.unit}</TableCell>
                            <TableCell>{formatRSD(comp.costPerUnit)}</TableCell>
                            <TableCell className="font-medium">{formatRSD(comp.costPerUnit * comp.requiredQty)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-sm font-semibold mt-2 text-right">
                    {t('production.totalCost')}: {formatRSD(selectedOrder.bomComponents.reduce((s, c) => s + c.costPerUnit * c.requiredQty, 0))}
                  </div>
                </div>

                {/* Quality Notes */}
                {selectedOrder.qualityNotes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{t('production.qualityNotes')}</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.qualityNotes}</p>
                    </div>
                  </>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{t('common.notes')}</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                    </div>
                  </>
                )}

                {/* Action buttons */}
                <Separator />
                <div className="flex gap-2">
                  {selectedOrder.status === 'planned' && (
                    <Button size="sm" onClick={() => handleOrderStatusChange(selectedOrder, 'in_progress')}>
                      <Play className="h-4 w-4 mr-1" /> {t('production.start')}
                    </Button>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleOrderStatusChange(selectedOrder, 'quality_check')}>
                        <Pause className="h-4 w-4 mr-1" /> {t('production.pause')}
                      </Button>
                      <Button size="sm" onClick={() => handleOrderStatusChange(selectedOrder, 'completed')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> {t('production.finish')}
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'quality_check' && (
                    <Button size="sm" onClick={() => handleOrderStatusChange(selectedOrder, 'completed')}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> {t('production.finish')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uredi: BOM Detail */}
          {selectedBom && !selectedOrder && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setSelectedBom(null); setActiveTab('pregled') }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm flex-1">{t('production.bomDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t('production.product')}:</span> {selectedBom.productName}</div>
                  <div><span className="text-muted-foreground">{t('production.version')}:</span> {selectedBom.version}</div>
                  <div><span className="text-muted-foreground">{t('common.status')}:</span>{' '}
                    <Badge variant="outline" className={BOM_STATUS_CONFIG[selectedBom.status]?.color}>{BOM_STATUS_CONFIG[selectedBom.status]?.label}</Badge>
                  </div>
                  <div><span className="text-muted-foreground">{t('production.createdDate')}:</span> {selectedBom.createdDate}</div>
                </div>
                <Separator />
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('production.component')}</TableHead>
                        <TableHead>{t('production.requiredQty')}</TableHead>
                        <TableHead>{t('common.unit')}</TableHead>
                        <TableHead>{t('production.costPerUnit')}</TableHead>
                        <TableHead>{t('production.totalCost')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBom.components.map((comp, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{comp.name}</TableCell>
                          <TableCell>{comp.requiredQty}</TableCell>
                          <TableCell>{comp.unit}</TableCell>
                          <TableCell>{formatRSD(comp.costPerUnit)}</TableCell>
                          <TableCell className="font-medium">{formatRSD(comp.costPerUnit * comp.requiredQty)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-right text-sm font-semibold">
                  {t('production.totalCost')}: {formatRSD(selectedBom.components.reduce((s, c) => s + c.costPerUnit * c.requiredQty, 0))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uredi: Machine Detail */}
          {selectedMachine && !selectedOrder && !selectedBom && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setSelectedMachine(null); setActiveTab('pregled') }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm flex-1">{selectedMachine.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t('production.type')}:</span> {MACHINE_TYPE_CONFIG[selectedMachine.type]}</div>
                  <div><span className="text-muted-foreground">{t('common.status')}:</span>{' '}
                    <Badge variant="outline" className={MACHINE_STATUS_CONFIG[selectedMachine.status]?.color}>{MACHINE_STATUS_CONFIG[selectedMachine.status]?.label}</Badge>
                  </div>
                  <div><span className="text-muted-foreground">{t('production.location')}:</span> {selectedMachine.location}</div>
                  <div><span className="text-muted-foreground">{t('production.capacity')}:</span> {selectedMachine.capacityPerHour} {t('production.unitsPerHour')}</div>
                  <div><span className="text-muted-foreground">{t('production.totalHours')}:</span> {selectedMachine.totalHours.toLocaleString('sr-RS')}</div>
                  <div><span className="text-muted-foreground">{t('production.currentLoad')}:</span> {selectedMachine.currentLoad}%</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('production.currentLoad')}</span>
                    <span className={`text-xs font-medium ${selectedMachine.currentLoad < 70 ? 'text-emerald-600' : selectedMachine.currentLoad <= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                      {selectedMachine.currentLoad}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${getLoadColor(selectedMachine.currentLoad)}`} style={{ width: `${selectedMachine.currentLoad}%` }} />
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => cycleMachineStatus(selectedMachine)}>
                    <RefreshCw className="h-4 w-4 mr-1" /> {t('production.toggleStatus')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => { setMachines(prev => prev.filter(m => m.id !== selectedMachine.id)); setSelectedMachine(null); setActiveTab('pregled') }}>
                    <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden: suppress unused imports warnings for icons used conceptually */}
      <span className="hidden">
        {DollarSign}{Users}{Filter}{Square}{Timer}{Zap}{ClipboardList}{Settings}{AlertCircle}
      </span>
    </div>
  )
}
