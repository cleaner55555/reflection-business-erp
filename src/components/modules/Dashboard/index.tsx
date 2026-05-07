'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BoxIcon,
  FilePlus2,
  UserPlus,
  Wallet,
  ShoppingCart,
  PackagePlus,
  Clock,
  FileText,
  Users,
  AlertCircle,
  CircleDot,
  Activity,
  Banknote,
} from 'lucide-react'
import { motion } from 'framer-motion'
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatRSD, formatRSDShort, formatDate, formatDateTime, getStatusLabel, getStatusColor, getMonthLabel } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { useAppStore, type ModuleType } from '@/lib/store'

// ============ TYPES ============

interface OverdueInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  status: string
  totalAmount: number
  partner: { id: string; name: string } | null
}

interface RecentPartner {
  id: string
  name: string
  pib: string
  type: string
  city: string | null
  createdAt: string
}

interface RecentTransaction {
  id: string
  date: string
  type: string
  category: string
  amount: number
  description: string
}

interface ActivityItem {
  id: string
  type: 'invoice' | 'partner' | 'transaction'
  title: string
  subtitle: string
  timestamp: Date
  amount?: number
  icon: 'invoice' | 'partner' | 'transaction'
}

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    unpaidInvoiceAmount: number
    unpaidInvoiceCount: number
    invoiceCount: number
    lowStockProducts: number
    partnerCount: number
    productCount: number
    revenueGrowth: number
    cashBalance: number
    cashIn: number
    cashOut: number
  }
  recentInvoices: Array<{
    id: string
    number: string
    date: string
    dueDate: string
    status: string
    totalAmount: number
    partner: { id: string; name: string } | null
  }>
  monthlyRevenueChart: Array<{ month: string; revenue: number }>
  expensesByCategory: Array<{ category: string; amount: number }>
  // New fields
  overdueInvoices: OverdueInvoice[]
  overdueCount: number
  overdueTotal: number
  todayDueInvoices: OverdueInvoice[]
  recentPartners: RecentPartner[]
  recentTransactions: RecentTransaction[]
  newPartnersThisMonth: number
}

interface LowStockProduct {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  category: string | null
}

const PIE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777']

// ============ ANIMATION VARIANTS ============

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ============ QUICK ACTION BUTTONS ============

const quickActions = [
  { labelKey: 'dashboard.newInvoice', icon: FilePlus2, module: 'fakture' as ModuleType, color: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', iconBg: 'bg-emerald-100' },
  { labelKey: 'dashboard.newPartner', icon: UserPlus, module: 'partneri' as ModuleType, color: 'text-violet-700', bg: 'bg-violet-50 hover:bg-violet-100 border-violet-200', iconBg: 'bg-violet-100' },
  { labelKey: 'dashboard.cashEntry', icon: Wallet, module: 'finansije' as ModuleType, color: 'text-amber-700', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200', iconBg: 'bg-amber-100' },
  { labelKey: 'dashboard.newOrder', icon: ShoppingCart, module: 'nabavka' as ModuleType, color: 'text-cyan-700', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200', iconBg: 'bg-cyan-100' },
  { labelKey: 'dashboard.newProduct', icon: PackagePlus, module: 'magacin' as ModuleType, color: 'text-rose-700', bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200', iconBg: 'bg-rose-100' },
]

// ============ MAIN COMPONENT ============

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const { setActiveModule } = useAppStore()

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/products?lowStock=true').then((r) => r.json()),
    ]).then(([dashData, stockData]) => {
      setData(dashData)
      setLowStock(stockData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!data && lowStock.length === 0) return
    const texts: string[] = []
    if (data) {
      data.recentInvoices.forEach((inv) => {
        if (inv.partner?.name) texts.push(inv.partner.name)
      })
      data.overdueInvoices.forEach((inv) => {
        if (inv.partner?.name) texts.push(inv.partner.name)
      })
      data.todayDueInvoices.forEach((inv) => {
        if (inv.partner?.name) texts.push(inv.partner.name)
      })
      data.recentPartners.forEach((p) => {
        if (p.name) texts.push(p.name)
      })
    }
    lowStock.forEach((p) => {
      if (p.name) texts.push(p.name)
    })
    if (texts.length > 0) translateTexts(texts)
  }, [data, lowStock, translateTexts])

  // Build activity feed from invoices, partners, transactions
  const activityFeed = useMemo<ActivityItem[]>(() => {
    if (!data) return []
    const items: ActivityItem[] = []

    data.recentInvoices.forEach((inv) => {
      items.push({
        id: inv.id,
        type: 'invoice',
        title: tc(inv.partner?.name || '-'),
        subtitle: `${inv.number} - ${formatRSD(inv.totalAmount)}`,
        timestamp: new Date(inv.createdAt),
        amount: inv.totalAmount,
        icon: 'invoice',
      })
    })

    data.recentPartners.forEach((p) => {
      items.push({
        id: p.id,
        type: 'partner',
        title: tc(p.name),
        subtitle: `${getStatusLabel(p.type)}${p.city ? ` · ${p.city}` : ''}`,
        timestamp: new Date(p.createdAt),
        icon: 'partner',
      })
    })

    data.recentTransactions.forEach((tr) => {
      items.push({
        id: tr.id,
        type: 'transaction',
        title: tr.description,
        subtitle: `${getStatusLabel(tr.type)} · ${getStatusLabel(tr.category)}`,
        timestamp: new Date(tr.date),
        amount: tr.amount,
        icon: 'transaction',
      })
    })

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [data, tc])

  // Group activity by time period
  const groupedActivity = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)

    const groups: { label: string; items: ActivityItem[] }[] = [
      { label: t('dashboard.today'), items: [] },
      { label: t('dashboard.yesterday'), items: [] },
      { label: t('dashboard.earlier'), items: [] },
    ]

    activityFeed.forEach((item) => {
      if (item.timestamp >= todayStart) {
        groups[0].items.push(item)
      } else if (item.timestamp >= yesterdayStart) {
        groups[1].items.push(item)
      } else {
        groups[2].items.push(item)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [activityFeed, t])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  const { kpis, recentInvoices, monthlyRevenueChart, expensesByCategory } = data

  const kpiCards = [
    {
      title: t('dashboard.totalRevenue'),
      value: formatRSD(kpis.totalRevenue),
      change: kpis.revenueGrowth,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
    },
    {
      title: t('dashboard.totalExpenses'),
      value: formatRSD(kpis.totalExpenses),
      change: null,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
    },
    {
      title: t('dashboard.netProfit'),
      value: formatRSD(kpis.netProfit),
      change: null,
      icon: DollarSign,
      color: kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: kpis.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconBg: kpis.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100',
    },
    {
      title: t('dashboard.unpaidInvoices'),
      value: formatRSD(kpis.unpaidInvoiceAmount),
      subtitle: `${kpis.unpaidInvoiceCount} faktura`,
      change: null,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
    {
      title: t('dashboard.cashBalance'),
      value: formatRSD(kpis.cashBalance),
      change: null,
      icon: Banknote,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
    },
    {
      title: t('dashboard.totalProducts'),
      value: String(kpis.productCount),
      change: null,
      icon: BoxIcon,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
    },
    {
      title: t('dashboard.totalPartners'),
      value: String(kpis.partnerCount),
      change: null,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
    },
  ]

  const pieData = expensesByCategory.map((item) => ({
    name: getStatusLabel(item.category),
    value: item.amount,
  }))

  const overdueAndDueToday = data.overdueCount + data.todayDueInvoices.length

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.module}
              variant="outline"
              className={`h-auto flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${action.bg}`}
              onClick={() => setActiveModule(action.module)}
            >
              <div className={`rounded-lg p-2 ${action.iconBg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className={`text-xs font-medium ${action.color}`}>{t(action.labelKey)}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Alerts Summary Bar */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.overdueCount')}</p>
                <p className="text-lg font-bold text-red-600">{data.overdueCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <BoxIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.lowStockCount')}</p>
                <p className="text-lg font-bold text-amber-600">{kpis.lowStockProducts}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.unpaidAmount')}</p>
                <p className="text-lg font-bold text-orange-600">{formatRSD(kpis.unpaidInvoiceAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-sky-100 p-2">
                <Users className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.newPartnersMonth')}</p>
                <p className="text-lg font-bold text-sky-600">{data.newPartnersThisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Today's Tasks + Activity Feed */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  {t('dashboard.todayTasks')}
                </CardTitle>
              </div>
              {overdueAndDueToday > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overdueAndDueToday}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Overdue Invoices */}
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {t('dashboard.overdueInvoices')} ({data.overdueCount})
                </p>
                {data.overdueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noOverdue')}</p>
                ) : (
                  <div className="space-y-2">
                    {data.overdueInvoices.slice(0, 5).map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{inv.number}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {tc(inv.partner?.name || '-')} · {formatDate(inv.dueDate)}
                          </p>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-xs font-bold text-red-600">{formatRSD(inv.totalAmount)}</p>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700 border-red-200"
                          >
                            {t('dashboard.overdue')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Due Today */}
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {t('dashboard.dueToday')} ({data.todayDueInvoices.length})
                </p>
                {data.todayDueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noTasks')}</p>
                ) : (
                  <div className="space-y-2">
                    {data.todayDueInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{inv.number}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {tc(inv.partner?.name || '-')}
                          </p>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-xs font-bold text-amber-600">{formatRSD(inv.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {overdueAndDueToday > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-medium text-muted-foreground">{t('dashboard.unpaidTotal')}</p>
                    <p className="text-sm font-bold text-red-600">
                      {formatRSD(data.overdueTotal + data.todayDueInvoices.reduce((s, i) => s + i.totalAmount, 0))}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                {t('dashboard.activityFeed')}
              </CardTitle>
              <CircleDot className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              {groupedActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('common.noData')}
                </p>
              ) : (
                <div className="space-y-4 pr-4">
                  {groupedActivity.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="space-y-2">
                        {group.items.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div
                              className={`rounded-lg p-1.5 mt-0.5 shrink-0 ${
                                activity.icon === 'invoice'
                                  ? 'bg-emerald-100'
                                  : activity.icon === 'partner'
                                  ? 'bg-violet-100'
                                  : 'bg-amber-100'
                              }`}
                            >
                              {activity.icon === 'invoice' ? (
                                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                              ) : activity.icon === 'partner' ? (
                                <Users className="h-3.5 w-3.5 text-violet-600" />
                              ) : (
                                <Receipt className="h-3.5 w-3.5 text-amber-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{activity.title}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {activity.subtitle}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {activity.amount !== undefined && (
                                <p className={`text-xs font-medium ${activity.type === 'transaction' ? (activity.icon === 'invoice' || (activity as ActivityItem & { type: string }).type === 'transaction' ? '' : '') : ''}`}>
                                  {activity.type === 'transaction'
                                    ? (() => {
                                        const trItem = activity as ActivityItem & { type: string }
                                        return (
                                          <span className={trItem.amount && (data.recentTransactions.find(r => r.id === activity.id)?.type === 'prihod') ? 'text-emerald-600' : 'text-red-600'}>
                                            {formatRSD(activity.amount)}
                                          </span>
                                        )
                                      })()
                                    : <span className="text-slate-600">{formatRSD(activity.amount)}</span>
                                  }
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground">
                                {formatDateTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                    {kpi.title}
                  </p>
                  <p className="text-lg font-bold truncate">{kpi.value}</p>
                  {kpi.change !== null && (
                    <div className="flex items-center gap-1">
                      {kpi.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-[10px] font-medium ${
                          kpi.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(kpi.change).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">{t('dashboard.fromLastMonth')}</span>
                    </div>
                  )}
                  {(kpi as { subtitle?: string }).subtitle && (
                    <p className="text-[10px] text-muted-foreground">{(kpi as { subtitle: string }).subtitle}</p>
                  )}
                </div>
                <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('dashboard.revenueTrend')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('dashboard.revenueByMonth')}</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={getMonthLabel}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatRSDShort}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRSD(value), t('common.prihod')]}
                    labelFormatter={getMonthLabel}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('dashboard.expensesByCategory')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('dashboard.expenseDistribution')}</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatRSD(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('dashboard.recentInvoices')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.recentInvoicesSubtitle')}</p>
              </div>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-xs font-medium">{invoice.number}</TableCell>
                    <TableCell className="text-xs">{tc(invoice.partner?.name || '-')}</TableCell>
                    <TableCell className="text-xs">{formatDate(invoice.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 ${getStatusColor(invoice.status)}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      {formatRSD(invoice.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('dashboard.lowStock')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.lowStockSubtitle')}</p>
              </div>
              <BoxIcon className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('dashboard.stockOk')}
                </p>
              ) : (
                lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium">{tc(product.name)}</p>
                      <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">{product.currentStock}</p>
                      <p className="text-[10px] text-muted-foreground">min: {product.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ============ SKELETON ============

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      {/* Quick Actions skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Alerts skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      {/* Today tasks + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
