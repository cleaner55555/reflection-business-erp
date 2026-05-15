'use client'

import { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react'
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
  Maximize2, Lock, Unlock,
} from 'lucide-react'
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  formatRSD, formatRSDShort, formatDate, formatDateTime,
  getStatusLabel, getStatusColor, getMonthLabel,
} from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { useAppStore, type ModuleType } from '@/lib/store'
import {
  KPICard, AlertCard, SectionCard, Sparkline, HealthScoreCard,
  GoalTrackerCard, ReceivablesCard,
} from './components'
import { PIE_COLORS, STATUS_COLORS, DEAL_STAGE_COLORS, CHART_COLORS } from './data'
import type { DashboardData, ActivityItem, LowStockProduct } from './types'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// ============ LAYOUT STORAGE ============
const LAYOUT_KEY = 'dashboardGridLayout'

export interface WidgetLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

type Layouts = { [breakpoint: string]: WidgetLayout[] }

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    // Row 1: 4 KPI cards
    { i: 'kpi-revenue', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-expenses', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-profit', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-cash', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    // Row 2: 4 alerts
    { i: 'alert-overdue', x: 0, y: 2, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-lowstock', x: 3, y: 2, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-unpaid', x: 6, y: 2, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-partners', x: 9, y: 2, w: 3, h: 1.5, minW: 2, minH: 1 },
    // Row 3: Health + Goals + Receivables + Secondary
    { i: 'health-score', x: 0, y: 4, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'goals', x: 4, y: 4, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'receivables', x: 8, y: 4, w: 4, h: 3.5, minW: 3, minH: 3 },
    // Row 4: Secondary metrics
    { i: 'metrics-partners', x: 0, y: 8, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-products', x: 3, y: 8, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-projects', x: 6, y: 8, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-crm', x: 9, y: 8, w: 3, h: 1.5, minW: 2, minH: 1 },
    // Row 5: Revenue chart full width
    { i: 'revenue-chart', x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 4 },
    // Row 6: 3 charts
    { i: 'chart-invoices', x: 0, y: 15, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'chart-crm', x: 4, y: 15, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'chart-expenses', x: 8, y: 15, w: 4, h: 5, minW: 3, minH: 4 },
    // Row 7: Top products + Cash flow
    { i: 'top-products', x: 0, y: 20, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'cash-flow', x: 6, y: 20, w: 6, h: 5, minW: 4, minH: 4 },
    // Row 8: Invoices + Partners + Low Stock
    { i: 'recent-invoices', x: 0, y: 25, w: 7, h: 5, minW: 5, minH: 4 },
    { i: 'top-partners', x: 7, y: 25, w: 5, h: 5, minW: 3, minH: 4 },
    { i: 'low-stock', x: 7, y: 30, w: 5, h: 4, minW: 3, minH: 3 },
    // Row 9: Tasks + Activity
    { i: 'tasks', x: 0, y: 30, w: 7, h: 5, minW: 5, minH: 4 },
    { i: 'activity', x: 0, y: 35, w: 6, h: 5, minW: 4, minH: 4 },
  ],
  md: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-expenses', x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-profit', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-cash', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'alert-overdue', x: 4, y: 2, w: 4, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-lowstock', x: 8, y: 2, w: 4, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-unpaid', x: 4, y: 4, w: 4, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-partners', x: 8, y: 4, w: 4, h: 1.5, minW: 2, minH: 1 },
    { i: 'health-score', x: 0, y: 5, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'goals', x: 4, y: 5, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'receivables', x: 8, y: 5, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'metrics-partners', x: 0, y: 9, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-products', x: 3, y: 9, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-projects', x: 6, y: 9, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-crm', x: 9, y: 9, w: 3, h: 1.5, minW: 2, minH: 1 },
    { i: 'revenue-chart', x: 0, y: 11, w: 12, h: 5, minW: 6, minH: 4 },
    { i: 'chart-invoices', x: 0, y: 16, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'chart-crm', x: 6, y: 16, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'chart-expenses', x: 0, y: 21, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'top-products', x: 6, y: 21, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'cash-flow', x: 0, y: 26, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'recent-invoices', x: 6, y: 26, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'top-partners', x: 0, y: 31, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'low-stock', x: 6, y: 31, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'tasks', x: 0, y: 35, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'activity', x: 6, y: 35, w: 6, h: 5, minW: 4, minH: 4 },
  ],
  sm: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-expenses', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-profit', x: 0, y: 4, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'kpi-cash', x: 0, y: 6, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'alert-overdue', x: 0, y: 8, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-lowstock', x: 2, y: 8, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-unpaid', x: 0, y: 10, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'alert-partners', x: 2, y: 10, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'health-score', x: 0, y: 12, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'goals', x: 0, y: 16, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'receivables', x: 0, y: 20, w: 4, h: 3.5, minW: 3, minH: 3 },
    { i: 'metrics-partners', x: 0, y: 24, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-products', x: 2, y: 24, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-projects', x: 0, y: 26, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-crm', x: 2, y: 26, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'revenue-chart', x: 0, y: 28, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-invoices', x: 0, y: 33, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-crm', x: 0, y: 38, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-expenses', x: 0, y: 43, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'top-products', x: 0, y: 48, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'cash-flow', x: 0, y: 53, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'recent-invoices', x: 0, y: 58, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'top-partners', x: 0, y: 63, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'low-stock', x: 0, y: 68, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'tasks', x: 0, y: 72, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'activity', x: 0, y: 77, w: 4, h: 5, minW: 4, minH: 4 },
  ],
  xs: [
    { i: 'kpi-revenue', x: 0, y: 0, w: 4, h: 2, minW: 4, minH: 2 },
    { i: 'kpi-expenses', x: 0, y: 2, w: 4, h: 2, minW: 4, minH: 2 },
    { i: 'kpi-profit', x: 0, y: 4, w: 4, h: 2, minW: 4, minH: 2 },
    { i: 'kpi-cash', x: 0, y: 6, w: 4, h: 2, minW: 4, minH: 2 },
    { i: 'alert-overdue', x: 0, y: 8, w: 4, h: 1.5, minW: 4, minH: 1 },
    { i: 'alert-lowstock', x: 0, y: 10, w: 4, h: 1.5, minW: 4, minH: 1 },
    { i: 'alert-unpaid', x: 0, y: 12, w: 4, h: 1.5, minW: 4, minH: 1 },
    { i: 'alert-partners', x: 0, y: 14, w: 4, h: 1.5, minW: 4, minH: 1 },
    { i: 'health-score', x: 0, y: 16, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'goals', x: 0, y: 20, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'receivables', x: 0, y: 24, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'metrics-partners', x: 0, y: 28, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-products', x: 2, y: 28, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-projects', x: 0, y: 30, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'metrics-crm', x: 2, y: 30, w: 2, h: 1.5, minW: 2, minH: 1 },
    { i: 'revenue-chart', x: 0, y: 32, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-invoices', x: 0, y: 37, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-crm', x: 0, y: 42, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'chart-expenses', x: 0, y: 47, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'top-products', x: 0, y: 52, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'cash-flow', x: 0, y: 57, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'recent-invoices', x: 0, y: 62, w: 4, h: 6, minW: 4, minH: 4 },
    { i: 'top-partners', x: 0, y: 68, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'low-stock', x: 0, y: 73, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'tasks', x: 0, y: 77, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'activity', x: 0, y: 82, w: 4, h: 5, minW: 4, minH: 4 },
  ],
}

function getStoredLayouts(): Layouts | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LAYOUT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function isDefaultLayout(layouts: Layouts): boolean {
  for (const bp of Object.keys(DEFAULT_LAYOUTS)) {
    const stored = layouts[bp]
    const def = DEFAULT_LAYOUTS[bp]
    if (!stored || !def) return false
    for (let i = 0; i < def.length; i++) {
      const s = stored.find((l: WidgetLayout) => l.i === def[i].i)
      if (!s || s.x !== def[i].x || s.y !== def[i].y || s.w !== def[i].w || s.h !== def[i].h) return false
    }
  }
  return true
}

// ============ QUICK ACTIONS ============
const quickActions = [
  { labelKey: 'dashboard.newInvoice', icon: FilePlus2, module: 'fakture' as ModuleType },
  { labelKey: 'dashboard.newPartner', icon: UserPlus, module: 'partneri' as ModuleType },
  { labelKey: 'dashboard.cashEntry', icon: Wallet, module: 'finansije' as ModuleType },
  { labelKey: 'dashboard.newOrder', icon: ShoppingCart, module: 'nabavka' as ModuleType },
  { labelKey: 'dashboard.newProduct', icon: PackagePlus, module: 'magacin' as ModuleType },
]

// ============ WIDGET WRAPPER ============
function WidgetWrapper({ children, widgetId }: { children: ReactNode; widgetId: string }) {
  return (
    <div className="dashboard-widget h-full" data-widget={widgetId}>
      {children}
    </div>
  )
}

// ============ MAIN COMPONENT ============
export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [layouts, setLayouts] = useState<Layouts>(() => getStoredLayouts() || DEFAULT_LAYOUTS)
  const [isLocked, setIsLocked] = useState(false)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const { setActiveModule } = useAppStore()

  // Save layouts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts))
    }
  }, [layouts])

  const handleLayoutChange = useCallback((_current: Layout, allLayouts: Layouts) => {
    setLayouts(allLayouts)
  }, [])

  const handleResetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS)
    localStorage.removeItem(LAYOUT_KEY)
  }, [])

  const isCustom = !isDefaultLayout(layouts)

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

  if (loading || !data) return <DashboardSkeleton />

  const { kpis, recentInvoices, monthlyChart, expensesByCategory } = data
  const pieData = expensesByCategory.map(item => ({ name: getStatusLabel(item.category), value: item.amount }))
  const invoiceStatusData = data.invoicesByStatus.map(s => ({ name: getStatusLabel(s.status), value: s.total, count: s.count, fill: STATUS_COLORS[s.status] || '#6b7280' }))
  const dealStages = data.dealsByStage.filter(d => d.stage !== 'won' && d.stage !== 'lost').map(d => ({ name: getStatusLabel(d.stage), value: d.value, count: d.count, fill: DEAL_STAGE_COLORS[d.stage] || '#6b7280' }))
  const overdueAndDueToday = data.overdueCount + data.todayDueInvoices.length
  const todayStr = new Date().toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-4">

      {/* ============ HEADER ============ */}
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
          {/* Lock/Unlock toggle */}
          <Button
            variant={isLocked ? 'default' : 'outline'}
            size="sm"
            className="h-9 gap-2 text-xs rounded-lg"
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? 'Otključaj dashboard' : 'Zaključaj dashboard'}
          >
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isLocked ? 'Zaključano' : 'Podesi'}</span>
          </Button>

          {/* Reset layout */}
          {isCustom && (
            <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground" onClick={handleResetLayout} title="Resetuj raspored">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resetuj</span>
            </Button>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            {quickActions.slice(0, 3).map(action => (
              <Button key={action.module} variant="outline" size="sm" className="hidden md:flex h-9 gap-1.5 text-xs rounded-lg font-medium" onClick={() => setActiveModule(action.module)}>
                <action.icon className="h-3.5 w-3.5" />
                {t(action.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="md:hidden">
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

      {/* ============ GRID LAYOUT ============ */}
      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        draggableHandle=".widget-drag-handle"
        draggableCancel=".widget-no-drag"
        rowHeight={52}
        cols={{ lg: 12, md: 12, sm: 4, xs: 4 }}
        margin={{ lg: [16, 16], md: [14, 14], sm: [10, 10], xs: [8, 8] }}
        containerPadding={{ lg: [0, 0], md: [0, 0], sm: [0, 0], xs: [0, 0] }}
        compactType="vertical"
        useCSSTransforms
        measureBeforeMount={false}
      >
        {/* ===== KPI CARDS ===== */}
        <WidgetWrapper key="kpi-revenue" widgetId="kpi-revenue">
          <WidgetCard title="Prihodi" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}>
            <KPICard
              title={t('dashboard.totalRevenue')}
              value={formatRSD(kpis.totalRevenue)}
              change={kpis.revenueGrowth}
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
              iconBg="bg-emerald-50"
              sparkline={revenueSparkline}
            />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="kpi-expenses" widgetId="kpi-expenses">
          <WidgetCard title="Rashodi" icon={<TrendingDown className="h-4 w-4 text-red-500" />}>
            <KPICard
              title={t('dashboard.totalExpenses')}
              value={formatRSD(kpis.totalExpenses)}
              change={kpis.revenueGrowth !== 0 ? -kpis.revenueGrowth * 0.6 : null}
              icon={<TrendingDown className="h-4 w-4 text-red-500" />}
              iconBg="bg-red-50"
              sparkline={expenseSparkline}
            />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="kpi-profit" widgetId="kpi-profit">
          <WidgetCard title="Profit" icon={<DollarSign className="h-4 w-4 text-emerald-500" />}>
            <KPICard
              title={t('dashboard.netProfit')}
              value={formatRSD(kpis.netProfit)}
              icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="kpi-cash" widgetId="kpi-cash">
          <WidgetCard title="Blagajna" icon={<Banknote className="h-4 w-4 text-sky-500" />}>
            <KPICard
              title={t('dashboard.cashBalance')}
              value={formatRSD(kpis.cashBalance)}
              change={kpis.invoiceCountGrowth}
              icon={<Banknote className="h-4 w-4 text-sky-600" />}
              iconBg="bg-sky-50"
              sparkline={cashFlowSparkline}
            />
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== ALERT CARDS ===== */}
        <WidgetWrapper key="alert-overdue" widgetId="alert-overdue">
          <WidgetCard title={t('dashboard.overdueCount')}>
            <AlertCard label={t('dashboard.overdueCount')} value={data.overdueCount} color="red" icon={<AlertCircle className="h-4 w-4" />} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="alert-lowstock" widgetId="alert-lowstock">
          <WidgetCard title={t('dashboard.lowStockCount')}>
            <AlertCard label={t('dashboard.lowStockCount')} value={kpis.lowStockProducts} color="amber" icon={<BoxIcon className="h-4 w-4" />} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="alert-unpaid" widgetId="alert-unpaid">
          <WidgetCard title={t('dashboard.unpaidAmount')}>
            <AlertCard label={t('dashboard.unpaidAmount')} value={formatRSDShort(kpis.unpaidInvoiceAmount)} color="orange" icon={<DollarSign className="h-4 w-4" />} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="alert-partners" widgetId="alert-partners">
          <WidgetCard title={t('dashboard.newPartnersMonth')}>
            <AlertCard label={t('dashboard.newPartnersMonth')} value={data.newPartnersThisMonth} color="sky" icon={<Users className="h-4 w-4" />} />
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== HEALTH + GOALS + RECEIVABLES ===== */}
        <WidgetWrapper key="health-score" widgetId="health-score">
          <WidgetCard title="Zdravlje biznisa">
            <HealthScoreCard score={data.businessHealthScore.score} profitMargin={data.businessHealthScore.profitMargin} stockHealth={data.businessHealthScore.stockHealth} collectionRate={data.businessHealthScore.collectionRate} unpaidRatio={data.businessHealthScore.unpaidRatio} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="goals" widgetId="goals">
          <WidgetCard title="Ciljevi meseca">
            <GoalTrackerCard goals={data.monthlyGoals} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="receivables" widgetId="receivables">
          <WidgetCard title="Naplate po dospeću">
            <ReceivablesCard aging={data.receivablesAging} />
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== SECONDARY METRICS ===== */}
        <WidgetWrapper key="metrics-partners" widgetId="metrics-partners">
          <WidgetCard title={t('dashboard.totalPartners')}>
            <MiniMetricCard icon={<Users className="h-4 w-4 text-violet-600" />} iconBg="bg-violet-50" label={t('dashboard.totalPartners')} value={String(kpis.partnerCount)} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="metrics-products" widgetId="metrics-products">
          <WidgetCard title={t('dashboard.totalProducts')}>
            <MiniMetricCard icon={<BoxIcon className="h-4 w-4 text-slate-600" />} iconBg="bg-slate-100" label={t('dashboard.totalProducts')} value={String(kpis.productCount)} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="metrics-projects" widgetId="metrics-projects">
          <WidgetCard title="Aktivni projekti">
            <MiniMetricCard icon={<FolderKanban className="h-4 w-4 text-emerald-600" />} iconBg="bg-emerald-50" label="Aktivni projekti" value={String(data.activeProjects.count)} />
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="metrics-crm" widgetId="metrics-crm">
          <WidgetCard title="CRM Pipeline">
            <MiniMetricCard icon={<Heart className="h-4 w-4 text-sky-600" />} iconBg="bg-sky-50" label="CRM Pipeline" value={formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))} />
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== REVENUE CHART ===== */}
        <WidgetWrapper key="revenue-chart" widgetId="revenue-chart">
          <WidgetCard title={t('dashboard.revenueTrend')} subtitle="Prihodi vs rashodi — poslednjih 12 meseci" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} className="h-full">
            <div className="h-full min-h-[200px]">
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
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== CHARTS ROW ===== */}
        <WidgetWrapper key="chart-invoices" widgetId="chart-invoices">
          <WidgetCard title="Status faktura" subtitle="Raspodela po statusu" icon={<FileText className="h-4 w-4 text-sky-500" />} className="h-full">
            <div className="h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={invoiceStatusData} cx="50%" cy="45%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
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
        </WidgetWrapper>

        <WidgetWrapper key="chart-crm" widgetId="chart-crm">
          <WidgetCard title="CRM Pipeline" subtitle={`Ukupno ${formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))}`} icon={<Heart className="h-4 w-4 text-rose-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('crm')}><ArrowUpRight className="h-3 w-3" /> CRM</Button>} className="h-full">
            {dealStages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[160px]"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
            ) : (
              <div className="h-full min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealStages} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" tickFormatter={formatRSDShort} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                      {dealStages.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </WidgetCard>
        </WidgetWrapper>

        <WidgetWrapper key="chart-expenses" widgetId="chart-expenses">
          <WidgetCard title={t('dashboard.expensesByCategory')} subtitle={t('dashboard.expenseDistribution')} icon={<TrendingDown className="h-4 w-4 text-rose-500" />} className="h-full">
            <div className="h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </WidgetCard>
        </WidgetWrapper>

        {/* ===== TOP PRODUCTS ===== */}
        <WidgetWrapper key="top-products" widgetId="top-products">
          <WidgetCard title="Top proizvodi" subtitle="Po iznosu fakturisanja" icon={<BarChart3 className="h-4 w-4 text-violet-500" />} className="h-full">
            <div className="space-y-2 h-full overflow-y-auto max-h-[300px]">
              {data.topProducts.length === 0 ? (
                <div className="flex items-center justify-center h-32"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
              ) : (
                data.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground')}>{i + 1}</span>
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
        </WidgetWrapper>

        {/* ===== CASH FLOW ===== */}
        <WidgetWrapper key="cash-flow" widgetId="cash-flow">
          <WidgetCard title="Dnevni tok novca" subtitle="Ulazi vs izlazi — poslednjih 30 dana" icon={<Zap className="h-4 w-4 text-cyan-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('finance')}><ArrowUpRight className="h-3 w-3" /> Finansije</Button>} className="h-full">
            <div className="h-full min-h-[200px]">
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
        </WidgetWrapper>

        {/* ===== RECENT INVOICES ===== */}
        <WidgetWrapper key="recent-invoices" widgetId="recent-invoices">
          <WidgetCard title={t('dashboard.recentInvoices')} subtitle={t('dashboard.recentInvoicesSubtitle')} icon={<FileText className="h-4 w-4 text-emerald-500" />} action={<Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('invoices')}><ArrowUpRight className="h-3 w-3" /> Fakture</Button>} className="h-full">
            <div className="overflow-auto h-full max-h-[300px]">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {recentInvoices.slice(0, 8).map(inv => (
                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50 widget-no-drag" onClick={() => setActiveModule('invoices')}>
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
        </WidgetWrapper>

        {/* ===== TOP PARTNERS ===== */}
        <WidgetWrapper key="top-partners" widgetId="top-partners">
          <WidgetCard title="Top Partneri" subtitle="Po iznosu fakturisanja" icon={<Users className="h-4 w-4 text-violet-500" />} className="h-full">
            <div className="space-y-2.5 h-full overflow-y-auto max-h-[220px]">
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
        </WidgetWrapper>

        {/* ===== LOW STOCK ===== */}
        <WidgetWrapper key="low-stock" widgetId="low-stock">
          <WidgetCard title={t('dashboard.lowStock')} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} action={lowStock.length > 0 && <Badge variant="destructive" className="text-xs">{lowStock.length}</Badge>} className="h-full">
            <div className="space-y-2 h-full overflow-y-auto max-h-[200px]">
              {lowStock.length === 0 ? (
                <div className="flex items-center justify-center h-16"><p className="text-sm text-muted-foreground">{t('dashboard.stockOk')}</p></div>
              ) : (
                lowStock.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2.5">
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
        </WidgetWrapper>

        {/* ===== TASKS ===== */}
        <WidgetWrapper key="tasks" widgetId="tasks">
          <WidgetCard title={t('dashboard.todayTasks')} icon={<Clock className="h-4 w-4 text-amber-500" />} action={overdueAndDueToday > 0 && <Badge variant="destructive" className="text-xs">{overdueAndDueToday}</Badge>} className="h-full">
            <div className="space-y-3 h-full overflow-y-auto max-h-[300px]">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" /> {t('dashboard.overdueInvoices')} ({data.overdueCount})
                </p>
                {data.overdueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noOverdue')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.overdueInvoices.slice(0, 4).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2.5">
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
                    {data.todayDueInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5">
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
        </WidgetWrapper>

        {/* ===== ACTIVITY ===== */}
        <WidgetWrapper key="activity" widgetId="activity">
          <WidgetCard title={t('dashboard.activityFeed')} icon={<Activity className="h-4 w-4 text-sky-500" />} action={<CircleDot className="h-4 w-4 text-muted-foreground" />} className="h-full">
            <ScrollArea className="h-full max-h-[300px]">
              {groupedActivity.length === 0 ? (
                <div className="flex items-center justify-center h-full"><p className="text-sm text-muted-foreground">{t('common.noData')}</p></div>
              ) : (
                <div className="space-y-4 pr-4">
                  {groupedActivity.map(group => (
                    <div key={group.label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                      <div className="space-y-2">
                        {group.items.slice(0, 5).map(a => (
                          <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
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
        </WidgetWrapper>
      </ResponsiveGridLayout>
    </div>
  )
}

// ============ WIDGET CARD WITH DRAG HANDLE ============
function WidgetCard({ title, subtitle, icon, action, children, className }: { title?: string; subtitle?: string; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={`h-full overflow-hidden transition-shadow hover:shadow-sm ${className || ''}`}>
      {/* Drag handle area (header) */}
      <div className="widget-drag-handle cursor-grab active:cursor-grabbing select-none px-5 pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0">
            {title && <p className="text-sm font-semibold tracking-tight truncate">{title}</p>}
            {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0 widget-no-drag">{action}</div>}
      </div>
      <CardContent className="px-5 pb-4 min-w-0">
        {children}
      </CardContent>
    </Card>
  )
}

// ============ MINI METRIC CARD ============
function MiniMetricCard({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm">
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className={cn('rounded-lg p-2 shrink-0', iconBg)}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-sm font-bold tabular-nums truncate leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ HELPERS ============
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-32 w-full" /></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-5"><Skeleton className="h-72 w-full" /></CardContent></Card>
    </div>
  )
}
