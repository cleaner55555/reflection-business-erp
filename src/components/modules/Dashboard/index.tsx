'use client'

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  FilePlus2,
  BoxIcon,
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
  ArrowUpRight,
  FolderKanban,
  Heart,
  Truck,
} from 'lucide-react'
import { motion } from 'framer-motion'
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
import { KPICard, AlertCard, SectionCard } from './components'
import { PIE_COLORS, STATUS_COLORS, DEAL_STAGE_COLORS, CHART_COLORS } from './data'
import type { DashboardData, OverdueInvoice, ActivityItem, LowStockProduct } from './types'

// ============ ANIMATION ============
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ============ QUICK ACTIONS ============
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
    }
    lowStock.forEach(p => { if (p.name) texts.push(p.name) })
    if (texts.length > 0) translateTexts(texts)
  }, [data, lowStock, translateTexts])

  // Activity feed
  const activityFeed = useMemo<ActivityItem[]>(() => {
    if (!data) return []
    const items: ActivityItem[] = []
    data.recentInvoices.forEach(inv => {
      items.push({
        id: inv.id, type: 'invoice', title: tc(inv.partner?.name || '-'),
        subtitle: `${inv.number} · ${formatRSD(inv.totalAmount)}`,
        timestamp: new Date(inv.createdAt), amount: inv.totalAmount, icon: 'invoice',
      })
    })
    data.recentPartners.forEach(p => {
      items.push({
        id: p.id, type: 'partner', title: tc(p.name),
        subtitle: `${getStatusLabel(p.type)}${p.city ? ` · ${p.city}` : ''}`,
        timestamp: new Date(p.createdAt), icon: 'partner',
      })
    })
    data.recentTransactions.forEach(tr => {
      items.push({
        id: tr.id, type: 'transaction', title: tr.description,
        subtitle: `${getStatusLabel(tr.type)} · ${getStatusLabel(tr.category)}`,
        timestamp: new Date(tr.date), amount: tr.amount, icon: 'transaction',
      })
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

  // Chart data
  const pieData = expensesByCategory.map(item => ({
    name: getStatusLabel(item.category),
    value: item.amount,
  }))

  // Invoice status data for donut
  const invoiceStatusData = data.invoicesByStatus.map(s => ({
    name: getStatusLabel(s.status),
    value: s.total,
    count: s.count,
    fill: STATUS_COLORS[s.status] || '#6b7280',
  }))

  // Deals pipeline data
  const dealStages = data.dealsByStage
    .filter(d => d.stage !== 'won' && d.stage !== 'lost')
    .map(d => ({
      name: getStatusLabel(d.stage),
      value: d.value,
      count: d.count,
      fill: DEAL_STAGE_COLORS[d.stage] || '#6b7280',
    }))

  const overdueAndDueToday = data.overdueCount + data.todayDueInvoices.length

  // Date display
  const todayStr = new Date().toLocaleDateString('sr-RS', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">

      {/* ============ HEADER ============ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map(action => (
            <Button
              key={action.module}
              variant="outline"
              size="sm"
              className={cn2('hidden sm:flex h-8 gap-1.5 text-xs rounded-lg border transition-all', action.bg)}
              onClick={() => setActiveModule(action.module)}
            >
              <action.icon className={cn2('h-3.5 w-3.5', action.color)} />
              {t(action.labelKey)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Mobile Quick Actions */}
      <motion.div variants={item} className="sm:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1">
            {quickActions.map(action => (
              <Button
                key={action.module}
                variant="outline"
                size="sm"
                className={cn2('flex-shrink-0 h-9 gap-1.5 text-xs rounded-lg border', action.bg)}
                onClick={() => setActiveModule(action.module)}
              >
                <action.icon className={cn2('h-3.5 w-3.5', action.color)} />
                {t(action.labelKey)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* ============ ALERTS ROW ============ */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AlertCard
          label={t('dashboard.overdueCount')}
          value={data.overdueCount}
          color="red"
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
        <AlertCard
          label={t('dashboard.lowStockCount')}
          value={kpis.lowStockProducts}
          color="amber"
          icon={<BoxIcon className="h-4 w-4 text-amber-600" />}
        />
        <AlertCard
          label={t('dashboard.unpaidAmount')}
          value={formatRSDShort(kpis.unpaidInvoiceAmount)}
          color="orange"
          icon={<DollarSign className="h-4 w-4 text-orange-600" />}
        />
        <AlertCard
          label={t('dashboard.newPartnersMonth')}
          value={data.newPartnersThisMonth}
          color="sky"
          icon={<Users className="h-4 w-4 text-sky-600" />}
        />
      </motion.div>

      {/* ============ MAIN KPI CARDS ============ */}
      <motion.div variants={item} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={t('dashboard.totalRevenue')}
          value={formatRSD(kpis.totalRevenue)}
          change={kpis.revenueGrowth}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <KPICard
          title={t('dashboard.totalExpenses')}
          value={formatRSD(kpis.totalExpenses)}
          subtitle={`${formatRSDShort(kpis.cashIn)} ulaz · ${formatRSDShort(kpis.cashOut)} izlaz`}
          icon={<TrendingDown className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-100"
        />
        <KPICard
          title={t('dashboard.netProfit')}
          value={formatRSD(kpis.netProfit)}
          subtitle={kpis.netProfit >= 0 ? 'Pozitivno' : 'Negativno'}
          icon={<DollarSign className={cn2('h-5 w-5', kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')} />}
          iconBg={kpis.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}
        />
        <KPICard
          title={t('dashboard.cashBalance')}
          value={formatRSD(kpis.cashBalance)}
          subtitle={`${kpis.invoiceCount} faktura`}
          change={kpis.invoiceCountGrowth}
          icon={<Banknote className="h-5 w-5 text-teal-600" />}
          iconBg="bg-teal-100"
        />
      </motion.div>

      {/* ============ SECONDARY KPI CARDS ============ */}
      <motion.div variants={item} className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2"><Users className="h-4 w-4 text-violet-600" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">{t('dashboard.totalPartners')}</p>
              <p className="text-base font-bold">{kpis.partnerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2"><BoxIcon className="h-4 w-4 text-slate-600" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">{t('dashboard.totalProducts')}</p>
              <p className="text-base font-bold">{kpis.productCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2"><FolderKanban className="h-4 w-4 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Aktivni projekti</p>
              <p className="text-base font-bold">{data.activeProjects.count}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-2"><Heart className="h-4 w-4 text-sky-600" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">CRM Pipeline</p>
              <p className="text-base font-bold">{formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ============ CHARTS ROW 1: Revenue vs Expenses ============ */}
      <motion.div variants={item}>
        <SectionCard
          title={t('dashboard.revenueTrend')}
          subtitle="Prihodi vs rashodi — poslednjih 12 meseci"
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
        >
          <div className="h-72">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={getMonthLabel} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatRSDShort} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [formatRSD(value), name === 'revenue' ? 'Prihod' : 'Rashod']}
                  labelFormatter={getMonthLabel}
                />
                <Legend
                  verticalAlign="top" align="right" iconType="circle" iconSize={8}
                  formatter={(v: string) => <span className="text-xs text-muted-foreground">{v === 'revenue' ? 'Prihod' : 'Rashod'}</span>}
                />
                <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2.5} fill="url(#colorRev)" name="revenue" />
                <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} strokeWidth={2} fill="url(#colorExp)" name="expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </motion.div>

      {/* ============ CHARTS ROW 2: Invoice Status + CRM Pipeline + Expenses ============ */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">

        {/* Invoice Status Donut */}
        <SectionCard
          title="Status faktura"
          subtitle="Raspodela po statusu"
          icon={<FileText className="h-4 w-4 text-sky-500" />}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoiceStatusData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {invoiceStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatRSD(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {invoiceStatusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                {d.name} ({d.count})
              </div>
            ))}
          </div>
        </SectionCard>

        {/* CRM Pipeline */}
        <SectionCard
          title="CRM Pipeline"
          subtitle={`Ukupno ${formatRSDShort(dealStages.reduce((s, d) => s + d.value, 0))}`}
          icon={<Heart className="h-4 w-4 text-rose-500" />}
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('crm')}>
              <ArrowUpRight className="h-3 w-3" /> CRM
            </Button>
          }
        >
          {dealStages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dealStages} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" tickFormatter={formatRSDShort} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatRSD(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {dealStages.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {dealStages.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                {d.name} ({d.count})
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Expenses by Category */}
        <SectionCard
          title={t('dashboard.expensesByCategory')}
          subtitle={t('dashboard.expenseDistribution')}
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatRSD(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </motion.div>

      {/* ============ BOTTOM ROW: Tables + Side Panels ============ */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">

        {/* Recent Invoices Table */}
        <div className="lg:col-span-2">
          <SectionCard
            title={t('dashboard.recentInvoices')}
            subtitle={t('dashboard.recentInvoicesSubtitle')}
            icon={<FileText className="h-4 w-4 text-emerald-500" />}
            action={
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setActiveModule('fakture')}>
                <ArrowUpRight className="h-3 w-3" /> Fakture
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('common.number')}</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">{t('common.partner')}</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">{t('common.date')}</TableHead>
                    <TableHead className="text-xs">{t('common.status')}</TableHead>
                    <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.slice(0, 8).map(inv => (
                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveModule('fakture')}>
                      <TableCell className="text-xs font-medium">{inv.number}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{tc(inv.partner?.name || '-')}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{formatDate(inv.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn2('text-[10px] px-2 py-0', getStatusColor(inv.status))}>
                          {getStatusLabel(inv.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium tabular-nums">{formatRSD(inv.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Top Partners + Low Stock */}
        <div className="space-y-4">

          {/* Top Partners */}
          <SectionCard
            title="Top Partneri"
            subtitle="Po iznosu fakturisanja"
            icon={<Users className="h-4 w-4 text-violet-500" />}
          >
            <div className="space-y-2.5">
              {data.topPartners.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>
              ) : (
                data.topPartners.map((p, i) => (
                  <div key={p.partnerId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{tc(p.partnerName)}</p>
                        <p className="text-[10px] text-muted-foreground">{p.invoiceCount} faktura</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold tabular-nums text-emerald-600">{formatRSDShort(p.totalAmount)}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* Low Stock */}
          <SectionCard
            title={t('dashboard.lowStock')}
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            action={
              lowStock.length > 0 && (
                <Badge variant="destructive" className="text-[10px]">{lowStock.length}</Badge>
              )
            }
          >
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.stockOk')}</p>
              ) : (
                lowStock.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{tc(p.name)}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs font-bold text-red-600 tabular-nums">{p.currentStock}</p>
                      <p className="text-[10px] text-muted-foreground">min: {p.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </motion.div>

      {/* ============ TASKS + ACTIVITY ROW ============ */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">

        {/* Today's Tasks */}
        <SectionCard
          title={t('dashboard.todayTasks')}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          action={overdueAndDueToday > 0 && <Badge variant="destructive" className="text-[10px]">{overdueAndDueToday}</Badge>}
        >
          <div className="space-y-3 max-h-72 overflow-y-auto">
            <div>
              <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {t('dashboard.overdueInvoices')} ({data.overdueCount})
              </p>
              {data.overdueInvoices.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-4">{t('dashboard.noOverdue')}</p>
              ) : (
                <div className="space-y-1.5">
                  {data.overdueInvoices.slice(0, 4).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{inv.number}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{tc(inv.partner?.name || '-')} · {formatDate(inv.dueDate)}</p>
                      </div>
                      <p className="text-xs font-bold text-red-600 ml-2">{formatRSD(inv.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t('dashboard.dueToday')} ({data.todayDueInvoices.length})
              </p>
              {data.todayDueInvoices.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-4">{t('dashboard.noTasks')}</p>
              ) : (
                <div className="space-y-1.5">
                  {data.todayDueInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{inv.number}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{tc(inv.partner?.name || '-')}</p>
                      </div>
                      <p className="text-xs font-bold text-amber-600 ml-2">{formatRSD(inv.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {overdueAndDueToday > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">{t('dashboard.unpaidTotal')}</p>
                  <p className="text-sm font-bold text-red-600 tabular-nums">
                    {formatRSD(data.overdueTotal + data.todayDueInvoices.reduce((s, i) => s + i.totalAmount, 0))}
                  </p>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Activity Feed */}
        <SectionCard
          title={t('dashboard.activityFeed')}
          icon={<Activity className="h-4 w-4 text-sky-500" />}
          action={<CircleDot className="h-4 w-4 text-muted-foreground" />}
        >
          <ScrollArea className="h-72">
            {groupedActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
            ) : (
              <div className="space-y-3 pr-4">
                {groupedActivity.map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{group.label}</p>
                    <div className="space-y-1.5">
                      {group.items.slice(0, 5).map(a => (
                        <div key={a.id} className="flex items-start gap-2.5 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                          <div className={cn2(
                            'rounded-lg p-1.5 mt-0.5 shrink-0',
                            a.icon === 'invoice' ? 'bg-emerald-100' : a.icon === 'partner' ? 'bg-violet-100' : 'bg-amber-100'
                          )}>
                            {a.icon === 'invoice' ? <FileText className="h-3 w-3 text-emerald-600" />
                              : a.icon === 'partner' ? <Users className="h-3 w-3 text-violet-600" />
                              : <Receipt className="h-3 w-3 text-amber-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{a.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{a.subtitle}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {a.amount !== undefined && (
                              <p className={cn2('text-xs font-medium tabular-nums', a.type === 'transaction' ? 'text-muted-foreground' : 'text-slate-600')}>
                                {formatRSDShort(a.amount)}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground">{formatDateTime(a.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SectionCard>
      </motion.div>

    </motion.div>
  )
}

// ============ HELPERS ============
// cn2 is just cn imported from helpers
function cn2(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

// ============ SKELETON ============
function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
      <Skeleton className="h-80 rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  )
}
