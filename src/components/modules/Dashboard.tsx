'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BoxIcon,
} from 'lucide-react'
import {
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
import { formatRSD, formatRSDShort, formatDate, getStatusLabel, getStatusColor, getMonthLabel } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    unpaidInvoiceAmount: number
    invoiceCount: number
    lowStockProducts: number
    partnerCount: number
    productCount: number
    revenueGrowth: number
    cashBalance: number
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

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()

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
    }
    lowStock.forEach((p) => {
      if (p.name) texts.push(p.name)
    })
    if (texts.length > 0) translateTexts(texts)
  }, [data, lowStock, translateTexts])

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
      change: null,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
  ]

  const pieData = expensesByCategory.map((item) => ({
    name: getStatusLabel(item.category),
    value: item.amount,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  {kpi.change !== null && (
                    <div className="flex items-center gap-1">
                      {kpi.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(kpi.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth')}</span>
                    </div>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
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
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('dashboard.recentInvoices')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.recentInvoicesDesc')}</p>
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
                <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.lowStockDesc')}</p>
              </div>
              <BoxIcon className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('dashboard.allStockOk')}
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
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
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
