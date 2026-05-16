'use client'

import { useEffect, useState, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, FilePlus2, BoxIcon,
  UserPlus, Wallet, ShoppingCart, PackagePlus, Clock, FileText, Users,
  AlertCircle, CircleDot, Activity, Banknote, ArrowUpRight, FolderKanban,
  Heart, Receipt, BarChart3, Zap, RotateCcw, LayoutDashboard,
  Settings2, GripVertical, X, Save, Pencil,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import RGL, { WidthProvider } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import {
  formatRSD, formatRSDShort, formatDate, formatDateTime,
  getStatusLabel, getStatusColor, getMonthLabel, cn,
} from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { useAppStore, type ModuleType } from '@/lib/store'
import {
  KPICard, AlertCard, Sparkline, HealthScoreCard,
  GoalTrackerCard, ReceivablesCard,
} from './components'
import { PIE_COLORS, STATUS_COLORS, DEAL_STAGE_COLORS, CHART_COLORS } from './data'
import type { DashboardData, ActivityItem, LowStockProduct } from './types'

// ============ REACT GRID LAYOUT SETUP ============
const GridLayout = WidthProvider(RGL)

// ============ LAYOUT CONFIGURATION ============
const STORAGE_KEY = 'dashboard_grid_layout_v5'
const HIDDEN_WIDGETS_KEY = 'dashboard_hidden_widgets_v1'

// Each widget is independently draggable & resizable
// rowHeight=12, margin=[16,16] → item height = h*12 + (h-1)*16 = 28h - 16
const DEFAULT_LAYOUT: Layout[] = [
  // ── KPI row: 4 cards ──
  { i: 'kpi-revenue',    x: 0,  y: 0,  w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'kpi-expenses',   x: 3,  y: 0,  w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'kpi-profit',     x: 6,  y: 0,  w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'kpi-cash',       x: 9,  y: 0,  w: 3, h: 7, minW: 2, minH: 5 },

  // ── Alert row: 4 cards ──
  { i: 'alert-overdue',    x: 0,  y: 7,  w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'alert-lowstock',   x: 3,  y: 7,  w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'alert-unpaid',     x: 6,  y: 7,  w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'alert-partners',   x: 9,  y: 7,  w: 3, h: 5, minW: 2, minH: 4 },

  // ── Health / Goals / Receivables: 3 cards ──
  { i: 'health',       x: 0,  y: 12, w: 4, h: 10, minW: 3, minH: 7 },
  { i: 'goals',        x: 4,  y: 12, w: 4, h: 10, minW: 3, minH: 7 },
  { i: 'receivables',  x: 8,  y: 12, w: 4, h: 10, minW: 3, minH: 7 },

  // ── Metrics row: 4 mini cards ──
  { i: 'metric-partners',  x: 0,  y: 22, w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'metric-products',  x: 3,  y: 22, w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'metric-projects',  x: 6,  y: 22, w: 3, h: 5, minW: 2, minH: 4 },
  { i: 'metric-crm',       x: 9,  y: 22, w: 3, h: 5, minW: 2, minH: 4 },

  // ── Revenue chart: full width ──
  { i: 'revenue-chart', x: 0,  y: 27, w: 12, h: 16, minW: 6, minH: 10 },

  // ── 3 chart cards ──
  { i: 'chart-invoices',  x: 0,  y: 43, w: 4, h: 13, minW: 3, minH: 8 },
  { i: 'chart-crm',       x: 4,  y: 43, w: 4, h: 13, minW: 3, minH: 8 },
  { i: 'chart-expenses',  x: 8,  y: 43, w: 4, h: 13, minW: 3, minH: 8 },

  // ── Products + Cashflow ──
  { i: 'top-products',    x: 0,  y: 56, w: 6, h: 13, minW: 3, minH: 8 },
  { i: 'daily-cashflow',  x: 6,  y: 56, w: 6, h: 13, minW: 3, minH: 8 },

  // ── Invoices + Partners ──
  { i: 'recent-invoices', x: 0,  y: 69, w: 8, h: 13, minW: 4, minH: 8 },
  { i: 'top-partners',    x: 8,  y: 69, w: 4, h: 13, minW: 3, minH: 6 },

  // ── Low Stock / Tasks / Activity ──
  { i: 'low-stock', x: 0,  y: 82, w: 4, h: 15, minW: 3, minH: 8 },
  { i: 'tasks',     x: 4,  y: 82, w: 4, h: 15, minW: 3, minH: 8 },
  { i: 'activity',  x: 8,  y: 82, w: 4, h: 15, minW: 3, minH: 8 },
]

function loadLayout(): Layout[] {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return DEFAULT_LAYOUT
}

function saveLayout(layout: Layout[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch { /* ignore */ }
}

function isDefaultLayout(layout: Layout[]): boolean {
  return layout.length === DEFAULT_LAYOUT.length &&
    layout.every((item, i) =>
      item.i === DEFAULT_LAYOUT[i].i &&
      item.x === DEFAULT_LAYOUT[i].x &&
      item.y === DEFAULT_LAYOUT[i].y &&
      item.w === DEFAULT_LAYOUT[i].w &&
      item.h === DEFAULT_LAYOUT[i].h
    )
}

function loadHiddenWidgets(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(HIDDEN_WIDGETS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return []
}

function saveHiddenWidgets(widgets: string[]) {
  if (typeof window === 'undefined') return
  try {
    if (widgets.length === 0) {
      localStorage.removeItem(HIDDEN_WIDGETS_KEY)
    } else {
      localStorage.setItem(HIDDEN_WIDGETS_KEY, JSON.stringify(widgets))
    }
  } catch { /* ignore */ }
}

// ============ QUICK ACTIONS ============
const quickActions = [
  { labelKey: 'dashboard.newInvoice', icon: FilePlus2, module: 'fakture' as ModuleType },
  { labelKey: 'dashboard.newPartner', icon: UserPlus, module: 'partneri' as ModuleType },
  { labelKey: 'dashboard.cashEntry', icon: Wallet, module: 'finansije' as ModuleType },
  { labelKey: 'dashboard.newOrder', icon: ShoppingCart, module: 'nabavka' as ModuleType },
  { labelKey: 'dashboard.newProduct', icon: PackagePlus, module: 'magacin' as ModuleType },
]

// ============ WIDGET LABEL MAP ============
const WIDGET_LABELS: Record<string, string> = {
  'kpi-revenue': 'Prihodi',
  'kpi-expenses': 'Rashodi',
  'kpi-profit': 'Profit',
  'kpi-cash': 'Stanje',
  'alert-overdue': 'Prekoračene',
  'alert-lowstock': 'Niske zalihe',
  'alert-unpaid': 'Neplaćeno',
  'alert-partners': 'Novi partneri',
  'health': 'Zdravlje biznisa',
  'goals': 'Ciljevi meseca',
  'receivables': 'Naplate',
  'metric-partners': 'Partneri',
  'metric-products': 'Proizvodi',
  'metric-projects': 'Projekti',
  'metric-crm': 'CRM Pipeline',
  'revenue-chart': 'Prihodi vs rashodi',
  'chart-invoices': 'Status faktura',
  'chart-crm': 'CRM Pipeline graf',
  'chart-expenses': 'Rashodi po kategoriji',
  'top-products': 'Top proizvodi',
  'daily-cashflow': 'Dnevni tok novca',
  'recent-invoices': 'Poslednje fakture',
  'top-partners': 'Top partneri',
  'low-stock': 'Niske zalihe',
  'tasks': 'Zadaci',
  'activity': 'Aktivnosti',
}

// ============ MAIN COMPONENT ============
export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<Layout[]>(DEFAULT_LAYOUT)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editLayout, setEditLayout] = useState<Layout[]>([])
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([])
  const preEditLayoutRef = useRef<Layout[]>([])

  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const { setActiveModule } = useAppStore()

  // Load layout + hidden widgets from localStorage
  useEffect(() => {
    setLayout(loadLayout())
    setHiddenWidgets(loadHiddenWidgets())
  }, [])

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/products?lowStock=true').then(r => r.json()),
    ]).then(([dash, stock]) => {
      setData(dash)
      setLowStock(stock)
      setLoading(false)
    })
  }, [])

  // Translate content
  useEffect(() => {
    if (!data && lowStock.length === 0) return
    const texts: string[] = []
    if (data) {
      data.recentInvoices.forEach(inv => { if (inv.partner?.name) texts.push(inv.partner.name) })
      data.overdueInvoices.forEach(inv => { if (inv.partner?.name) texts.push(inv.partner.name) })
      data.todayDueInvoices.forEach(inv => { if (inv.partner?.name) texts.push(inv.partner.name) })
      data.recentPartners.forEach(p => { if (p.name) texts.push(p.name) })
      data.topPartners.forEach(p => { texts.push(p.partnerName) })
      data.topProducts.forEach(p => { if (p.name) texts.push(p.name) })
    }
    lowStock.forEach(p => { if (p.name) texts.push(p.name) })
    if (texts.length > 0) translateTexts(texts)
  }, [data, lowStock, translateTexts])

  // Sparklines
  const revenueSparkline = useMemo(() => data ? data.monthlyChart.map(m => m.revenue).slice(-6) : [], [data])
  const expenseSparkline = useMemo(() => data ? data.monthlyChart.map(m => m.expenses).slice(-6) : [], [data])
  const cashFlowSparkline = useMemo(() => data ? data.monthlyChart.map(m => m.revenue - m.expenses).slice(-6) : [], [data])

  // Activity feed
  const activityFeed = useMemo<ActivityItem[]>(() => {
    if (!data) return []
    const items: ActivityItem[] = []
    data.recentInvoices.forEach(inv => {
      items.push({ id: inv.id, type: 'invoice', title: tc(inv.partner?.name || '-'), subtitle: `${inv.number} · ${formatRSD(inv.totalAmount)}`, timestamp: new Date(inv.createdAt), amount: inv.totalAmount, icon: 'invoice' })
    })
    data.recentPartners.forEach(p => {
      items.push({ id: p.id, type: 'partner', title: tc(p.name), subtitle: `${getStatusLabel(p.type)}${p.city ? ` · ${p.city}` : ''}`, timestamp: new Date(p.createdAt), icon: 'partner' })
    })
    data.recentTransactions.forEach(tr => {
      items.push({ id: tr.id, type: 'transaction', title: tr.description, subtitle: `${getStatusLabel(tr.type)} · ${getStatusLabel(tr.category)}`, timestamp: new Date(tr.date), amount: tr.amount, icon: 'transaction' })
    })
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [data, tc])

  const groupedActivity = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)
    const groups: { label: string; items: ActivityItem[] }[] = [
      { label: t('dashboard.today'), items: [] },
      { label: t('dashboard.yesterday'), items: [] },
      { label: t('dashboard.earlier'), items: [] },
    ]
    activityFeed.forEach(a => {
      if (a.timestamp >= todayStart) groups[0].items.push(a)
      else if (a.timestamp >= yesterdayStart) groups[1].items.push(a)
      else groups[2].items.push(a)
    })
    return groups.filter(g => g.items.length > 0)
  }, [activityFeed, t])

  // Layout handlers
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout)
    saveLayout(newLayout)
  }, [])

  const handleResetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
    setHiddenWidgets([])
    saveLayout(DEFAULT_LAYOUT)
    saveHiddenWidgets([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Edit mode handlers
  const handleEnterEditMode = useCallback(() => {
    preEditLayoutRef.current = [...layout]
    setEditLayout(layout.filter(item => !hiddenWidgets.includes(item.i)))
    setIsEditMode(true)
  }, [layout, hiddenWidgets])

  const handleSaveEditMode = useCallback(() => {
    setLayout(editLayout)
    saveLayout(editLayout)
    setIsEditMode(false)
  }, [editLayout])

  const handleCancelEditMode = useCallback(() => {
    setLayout(preEditLayoutRef.current)
    setIsEditMode(false)
  }, [])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setHiddenWidgets(prev => {
      const next = [...prev, widgetId]
      saveHiddenWidgets(next)
      return next
    })
    setEditLayout(prev => prev.filter(item => item.i !== widgetId))
  }, [])

  const handleRestoreWidget = useCallback((widgetId: string) => {
    // Find the default layout entry for this widget
    const defaultEntry = DEFAULT_LAYOUT.find(item => item.i === widgetId)
    if (!defaultEntry) return

    setHiddenWidgets(prev => {
      const next = prev.filter(id => id !== widgetId)
      saveHiddenWidgets(next)
      return next
    })

    // Also update the main layout if not in edit mode
    if (!isEditMode) {
      setLayout(prev => [...prev, { ...defaultEntry }])
      saveLayout([...layout.filter(item => item.i !== widgetId), defaultEntry])
    }

    // Add back to edit layout with a position at the end
    setEditLayout(prev => [...prev, { ...defaultEntry }])
  }, [isEditMode, layout])

  // Compute visible layout (filter out hidden widgets in view mode)
  const visibleLayout = useMemo(() => {
    if (isEditMode) return editLayout
    return layout.filter(item => !hiddenWidgets.includes(item.i))
  }, [layout, hiddenWidgets, editLayout, isEditMode])

  if (loading || !data) return <DashboardSkeleton />

  const { kpis, recentInvoices, monthlyChart, expensesByCategory } = data
  const pieData = expensesByCategory.map(item => ({ name: getStatusLabel(item.category), value: item.amount }))
  const invoiceStatusData = data.invoicesByStatus.map(s => ({ name: getStatusLabel(s.status), value: s.total, count: s.count, fill: STATUS_COLORS[s.status] || '#6b7280' }))
  const dealStages = data.dealsByStage.filter(d => d.stage !== 'won' && d.stage !== 'lost').map(d => ({ name: getStatusLabel(d.stage), value: d.value, count: d.count, fill: DEAL_STAGE_COLORS[d.stage] || '#6b7280' }))
  const overdueAndDueToday = data.overdueCount + data.todayDueInvoices.length
  const todayStr = new Date().toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const isCustomLayout = !isDefaultLayout(layout) || hiddenWidgets.length > 0

  // ============ WIDGET RENDERER ============
  const renderWidget = (widgetId: string): ReactNode => {
    switch (widgetId) {
      // ── KPI cards ──
      case 'kpi-revenue':
        return <KPICard title={t('dashboard.totalRevenue')} value={formatRSD(kpis.totalRevenue)} change={kpis.revenueGrowth} icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} iconBg="bg-emerald-50" sparkline={revenueSparkline} />
      case 'kpi-expenses':
        return <KPICard title={t('dashboard.totalExpenses')} value={formatRSD(kpis.totalExpenses)} change={kpis.revenueGrowth !== 0 ? -kpis.revenueGrowth * 0.6 : null} icon={<TrendingDown className="h-4 w-4 text-red-500" />} iconBg="bg-red-50" sparkline={expenseSparkline} />
      case 'kpi-profit':
        return <KPICard title={t('dashboard.netProfit')} value={formatRSD(kpis.netProfit)} icon={<DollarSign className="h-4 w-4 text-emerald-600" />} iconBg="bg-emerald-50" />
      case 'kpi-cash':
        return <KPICard title={t('dashboard.cashBalance')} value={formatRSD(kpis.cashBalance)} change={kpis.invoiceCountGrowth} icon={<Banknote className="h-4 w-4 text-sky-600" />} iconBg="bg-sky-50" sparkline={cashFlowSparkline} />

      // ── Alert cards ──
      case 'alert-overdue':
        return <AlertCard label={t('dashboard.overdueCount')} value={data.overdueCount} color="red" icon={<AlertCircle className="h-4 w-4" />} />
      case 'alert-lowstock':
        return <AlertCard label={t('dashboard.lowStockCount')} value={kpis.lowStockProducts} color="amber" icon={<BoxIcon className="h-4 w-4" />} />
      case 'alert-unpaid':
        return <AlertCard label={t('dashboard.unpaidAmount')} value={formatRSDShort(kpis.unpaidInvoiceAmount)} color="orange" icon={<DollarSign className="h-4 w-4" />} />
      case 'alert-partners':
        return <AlertCard label={t('dashboard.newPartnersMonth')} value={data.newPartnersThisMonth} color="sky" icon={<Users className="h-4 w-4" />} />

      // ── Health / Goals / Receivables ──
      case 'health':
        return <HealthScoreCard score={data.businessHealthScore.score} profitMargin={data.businessHealthScore.profitMargin} stockHealth={data.businessHealthScore.stockHealth} collectionRate={data.businessHealthScore.collectionRate} unpaidRatio={data.businessHealthScore.unpaidRatio} />
      case 'goals':
        return <GoalTrackerCard goals={data.monthlyGoals} />
      case 'receivables':
        return <ReceivablesCard aging={data.receivablesAging} />

      // ── Metric mini cards ──
      case 'metric-partners':
        return <MiniMetricCard icon={<Users className="h-4 w-4 text-violet-600" />} iconBg="bg-violet-50" label={t('dashboard.totalPartners')} value={String(kpis.partnerCount)} />
      case 'metric-products':
        return <MiniMetricCard icon={<BoxIcon className="h-4 w-4 text-slate-600" />} iconBg="bg-slate-100" label={t('dashboard.totalProducts')} value={String(kpis.productCount)} />
      case 'metric-projects':
        return <MiniMetricCard icon={<FolderKanban className="h-4 w-4 text-emerald-600" />} iconBg="bg-emerald-50" label="Aktivni projekti" value={String(data.activeProjects.count)} />
      case 'metric-crm':
        return <MiniMetricCard icon={<Heart className="h-4 w-4 text-sky-600" />} iconBg="bg-sky-50" label="CRM Pipeline" value={formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))} />

      // ── Revenue chart ──
      case 'revenue-chart':
        return (
          <Card className="h-full overflow-hidden">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight truncate">{t('dashboard.revenueTrend')}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">Prihodi vs rashodi — poslednjih 12 meseci</p>
                </div>
              </div>
            </div>
            <CardContent className="px-5 pb-4">
              <div className="h-[calc(100%-50px)] min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChart}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={getMonthLabel} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatRSDShort} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(value: number, name: string) => [formatRSD(value), name === 'revenue' ? 'Prihod' : 'Rashod']} labelFormatter={getMonthLabel} />
                    <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v === 'revenue' ? 'Prihod' : 'Rashod'}</span>} />
                    <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} fill="url(#colorRev)" name="revenue" />
                    <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} strokeWidth={2} fill="url(#colorExp)" name="expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )

      // ── Chart: Invoice status pie ──
      case 'chart-invoices':
        return (
          <WidgetCard title="Status faktura" subtitle="Raspodela po statusu" icon={<FileText className="h-4 w-4 text-sky-500" />}>
            <div className="min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={invoiceStatusData} cx="50%" cy="45%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value">
                    {invoiceStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-1">
              {invoiceStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name} ({d.count})
                </div>
              ))}
            </div>
          </WidgetCard>
        )

      // ── Chart: CRM pipeline bar ──
      case 'chart-crm':
        return (
          <WidgetCard title="CRM Pipeline" subtitle={`Ukupno ${formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))}`} icon={<Heart className="h-4 w-4 text-rose-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('crm')}><ArrowUpRight className="h-3 w-3" /> CRM</Button>}>
            {dealStages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[140px]"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
            ) : (
              <div className="min-h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealStages} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" tickFormatter={formatRSDShort} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {dealStages.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </WidgetCard>
        )

      // ── Chart: Expenses pie ──
      case 'chart-expenses':
        return (
          <WidgetCard title={t('dashboard.expensesByCategory')} subtitle={t('dashboard.expenseDistribution')} icon={<TrendingDown className="h-4 w-4 text-rose-500" />}>
            <div className="min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </WidgetCard>
        )

      // ── Top products ──
      case 'top-products':
        return (
          <WidgetCard title="Top proizvodi" subtitle="Po iznosu fakturisanja" icon={<BarChart3 className="h-4 w-4 text-violet-500" />}>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-40px)]">
              {data.topProducts.length === 0 ? (
                <div className="flex items-center justify-center h-24"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
              ) : (
                data.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between gap-3 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground')}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tc(p.name)}</p>
                        <p className="text-xs text-muted-foreground">{p.quantity} kom</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-emerald-600 shrink-0">{formatRSDShort(p.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </WidgetCard>
        )

      // ── Daily cashflow ──
      case 'daily-cashflow':
        return (
          <WidgetCard title="Dnevni tok novca" subtitle="Ulazi vs izlazi — poslednjih 30 dana" icon={<Zap className="h-4 w-4 text-cyan-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('finance')}><ArrowUpRight className="h-3 w-3" /> Finansije</Button>}>
            <div className="min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v: string) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth() + 1}` }} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tickFormatter={formatRSDShort} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} formatter={(value: number, name: string) => [formatRSD(value), name === 'cashIn' ? 'Ulaz' : 'Izlaz']} labelFormatter={(v: string) => new Date(v).toLocaleDateString('sr-RS')} />
                  <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v === 'cashIn' ? 'Ulaz' : 'Izlaz'}</span>} />
                  <Bar dataKey="cashIn" fill="#059669" radius={[2, 2, 0, 0]} name="cashIn" />
                  <Bar dataKey="cashOut" fill="#dc2626" radius={[2, 2, 0, 0]} name="cashOut" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </WidgetCard>
        )

      // ── Recent invoices table ──
      case 'recent-invoices':
        return (
          <WidgetCard title={t('dashboard.recentInvoices')} subtitle={t('dashboard.recentInvoicesSubtitle')} icon={<FileText className="h-4 w-4 text-emerald-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('invoices')}><ArrowUpRight className="h-3 w-3" /> Fakture</Button>}>
            <div className="overflow-auto max-h-[calc(100%-40px)]">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {recentInvoices.slice(0, 6).map(inv => (
                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveModule('invoices')}>
                      <TableCell className="text-xs font-medium">{inv.number}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell max-w-[180px] truncate">{tc(inv.partner?.name || '-')}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell whitespace-nowrap">{formatDate(inv.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs px-2 py-0', getStatusColor(inv.status))}>{getStatusLabel(inv.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium tabular-nums whitespace-nowrap">{formatRSD(inv.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </WidgetCard>
        )

      // ── Top partners ──
      case 'top-partners':
        return (
          <WidgetCard title="Top Partneri" subtitle="Po iznosu fakturisanja" icon={<Users className="h-4 w-4 text-violet-500" />}>
            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100%-40px)]">
              {data.topPartners.length === 0 ? (
                <div className="flex items-center justify-center h-16"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
              ) : (
                data.topPartners.map((p, i) => (
                  <div key={p.partnerId} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tc(p.partnerName)}</p>
                        <p className="text-xs text-muted-foreground">{p.invoiceCount} faktura</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-emerald-600 shrink-0">{formatRSDShort(p.totalAmount)}</p>
                  </div>
                ))
              )}
            </div>
          </WidgetCard>
        )

      // ── Low stock ──
      case 'low-stock':
        return (
          <WidgetCard title={t('dashboard.lowStock')} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} action={lowStock.length > 0 && <Badge variant="destructive" className="text-xs">{lowStock.length}</Badge>}>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-40px)]">
              {lowStock.length === 0 ? (
                <div className="flex items-center justify-center h-16"><p className="text-sm text-muted-foreground">{t('dashboard.stockOk')}</p></div>
              ) : (
                lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{tc(p.name)}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-600 tabular-nums">{p.currentStock}</p>
                      <p className="text-xs text-muted-foreground">min: {p.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </WidgetCard>
        )

      // ── Tasks (overdue + due today) ──
      case 'tasks':
        return (
          <WidgetCard title={t('dashboard.todayTasks')} icon={<Clock className="h-4 w-4 text-amber-500" />} action={overdueAndDueToday > 0 && <Badge variant="destructive" className="text-xs">{overdueAndDueToday}</Badge>}>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100%-40px)]">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" /> {t('dashboard.overdueInvoices')} ({data.overdueCount})
                </p>
                {data.overdueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noOverdue')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.overdueInvoices.slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{inv.number}</p>
                          <p className="text-xs text-muted-foreground truncate">{tc(inv.partner?.name || '-')} · {formatDate(inv.dueDate)}</p>
                        </div>
                        <p className="text-sm font-bold text-red-600 tabular-nums shrink-0">{formatRSD(inv.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {t('dashboard.dueToday')} ({data.todayDueInvoices.length})
                </p>
                {data.todayDueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noTasks')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.todayDueInvoices.slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{inv.number}</p>
                          <p className="text-xs text-muted-foreground truncate">{tc(inv.partner?.name || '-')}</p>
                        </div>
                        <p className="text-sm font-bold text-amber-600 tabular-nums shrink-0">{formatRSD(inv.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {overdueAndDueToday > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between gap-3 px-1">
                    <p className="text-sm text-muted-foreground">{t('dashboard.unpaidTotal')}</p>
                    <p className="text-base font-bold text-red-600 tabular-nums shrink-0">
                      {formatRSD(data.overdueTotal + data.todayDueInvoices.reduce((s, i) => s + i.totalAmount, 0))}
                    </p>
                  </div>
                </>
              )}
            </div>
          </WidgetCard>
        )

      // ── Activity feed ──
      case 'activity':
        return (
          <WidgetCard title={t('dashboard.activityFeed')} icon={<Activity className="h-4 w-4 text-sky-500" />} action={<CircleDot className="h-4 w-4 text-muted-foreground" />}>
            <ScrollArea className="max-h-[calc(100%-40px)]">
              {groupedActivity.length === 0 ? (
                <div className="flex items-center justify-center"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
              ) : (
                <div className="space-y-4 pr-4">
                  {groupedActivity.map(group => (
                    <div key={group.label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                      <div className="space-y-2">
                        {group.items.slice(0, 4).map(a => (
                          <div key={a.id} className="flex items-start gap-3 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                            <div className={cn('rounded-lg p-1.5 mt-0.5 shrink-0', a.icon === 'invoice' ? 'bg-emerald-100' : a.icon === 'partner' ? 'bg-violet-100' : 'bg-amber-100')}>
                              {a.icon === 'invoice' ? <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                : a.icon === 'partner' ? <Users className="h-3.5 w-3.5 text-violet-600" />
                                : <Receipt className="h-3.5 w-3.5 text-amber-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{a.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {a.amount !== undefined && (
                                <p className={cn('text-sm font-medium tabular-nums', a.type === 'transaction' ? 'text-muted-foreground' : 'text-slate-700')}>{formatRSDShort(a.amount)}</p>
                              )}
                              <p className="text-xs text-muted-foreground">{formatDateTime(a.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </WidgetCard>
        )

      default:
        return null
    }
  }

  // Hidden widgets available to restore
  const availableWidgets = hiddenWidgets.filter(id => WIDGET_LABELS[id])

  return (
    <div className={cn('space-y-4', isEditMode && 'dashboard-edit-mode')}>
      {/* ============ EDIT MODE BAR ============ */}
      {isEditMode && (
        <div className="sticky top-0 z-50 -mx-4 px-4 -mt-4 sm:-mx-6 sm:px-6">
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 rounded-b-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 p-2">
                <Pencil className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Uredi raspored</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Povuci widgete za premeštanje, uglove za promenu veličine</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveEditMode}>
                <Save className="h-3.5 w-3.5" />
                Sačuvaj promene
              </Button>
              <Button size="sm" variant="ghost" className="h-9 gap-2 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={handleCancelEditMode}>
                Otkaži
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ VIEW MODE HEADER ============ */}
      {!isEditMode && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
                <p className="text-sm text-muted-foreground mt-0.5 capitalize">{todayStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Reset layout */}
              {isCustomLayout && (
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground" onClick={handleResetLayout} title="Resetuj raspored">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Resetuj</span>
                </Button>
              )}

              {/* Edit dashboard button */}
              <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-lg font-medium" onClick={handleEnterEditMode}>
                <Settings2 className="h-3.5 w-3.5" />
                Uredi dashboard
              </Button>

              {/* Quick actions */}
              <div className="hidden lg:flex items-center gap-1">
                {quickActions.slice(0, 2).map(action => (
                  <Button key={action.module} variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-lg font-medium" onClick={() => setActiveModule(action.module)}>
                    <action.icon className="h-3.5 w-3.5" />
                    {t(action.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="lg:hidden">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-1">
                {quickActions.map(action => (
                  <Button key={action.module} variant="outline" size="sm" className="flex-shrink-0 h-9 gap-1.5 text-xs rounded-lg" onClick={() => setActiveModule(action.module)}>
                    <action.icon className="h-3.5 w-3.5" />
                    {t(action.labelKey)}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* ============ WIDGET PALETTE (Edit Mode) ============ */}
      {isEditMode && availableWidgets.length > 0 && (
        <div className="bg-muted/40 border border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <PackagePlus className="h-3.5 w-3.5" />
            Dostupni widgeti — kliknite da dodate nazad
          </p>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {availableWidgets.map(widgetId => (
                <Button
                  key={widgetId}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 h-8 gap-1.5 text-xs rounded-md border-amber-200 dark:border-amber-800 bg-white dark:bg-card hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => handleRestoreWidget(widgetId)}
                >
                  <Zap className="h-3 w-3 text-amber-600" />
                  {WIDGET_LABELS[widgetId] || widgetId}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* ============ GRID LAYOUT ============ */}
      <GridLayout
        layout={isEditMode ? editLayout : visibleLayout}
        cols={12}
        rowHeight={12}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        onLayoutChange={isEditMode ? setEditLayout : handleLayoutChange}
        useCSSTransforms
        draggableHandle={isEditMode ? '.widget-drag-handle' : undefined}
        resizeHandles={['se']}
      >
        {(isEditMode ? editLayout : visibleLayout).map(item => (
          <div key={item.i} className="dashboard-grid-item rounded-xl transition-shadow relative">
            {/* Edit mode overlay controls */}
            {isEditMode && (
              <>
                {/* Drag handle — top-left */}
                <div className="widget-drag-handle absolute top-2 left-2 z-10 flex items-center justify-center w-7 h-7 rounded-md bg-white/90 dark:bg-card/90 border border-amber-200 dark:border-amber-800 shadow-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                  <GripVertical className="h-4 w-4" />
                </div>
                {/* Remove button — top-right */}
                <button
                  className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-md bg-white/90 dark:bg-card/90 border border-red-200 dark:border-red-800 shadow-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  onClick={() => handleRemoveWidget(item.i)}
                  title="Ukloni widget"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
            {/* Widget content — fills remaining height */}
            <div className="h-full">
              {renderWidget(item.i)}
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  )
}

// ============ WIDGET CARD ============
function WidgetCard({ title, subtitle, icon, action, children }: { title?: string; subtitle?: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-sm flex flex-col">
      {title && (
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight truncate">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <CardContent className="px-4 pb-3 min-w-0 flex-1 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  )
}

// ============ MINI METRIC CARD ============
function MiniMetricCard({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm h-full">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={cn('rounded-lg p-2 shrink-0', iconBg)}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-sm font-bold tabular-nums truncate leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ SKELETON ============
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="hidden sm:flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-xl" />
        ))}
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[80px] rounded-xl" />
        ))}
      </div>

      {/* Health/Goals/Receivables */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[70px] rounded-xl" />
        ))}
      </div>

      {/* Revenue chart */}
      <Skeleton className="h-[340px] rounded-xl" />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[260px] rounded-xl" />
        ))}
      </div>

      {/* Products + Cashflow */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[260px] rounded-xl" />
        ))}
      </div>

      {/* Invoices + Partners */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[260px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>

      {/* Low Stock / Tasks / Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
