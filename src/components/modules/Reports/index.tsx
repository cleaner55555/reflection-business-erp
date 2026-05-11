'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Package,
  DollarSign,
  PieChart as PieChartIcon,
  FileText,
  Filter,
  Save,
  Play,
  Plus,
  Trash2,
  Eye,
  ArrowLeft,
} from 'lucide-react'
import { formatRSD, formatRSDShort, getStatusLabel, getMonthLabel } from '@/lib/helpers'
import { useTranslation } from '@/lib/i18n'
import { ReportDownloadButton } from '@/components/modules/ReportDownloadButton'

// ── Constants ──────────────────────────────────────────────────────
const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777', '#0284c7', '#ca8a04']
const COLORS_SEMI = ['#05966980', '#0891b280', '#7c3aed80', '#ea580c80', '#db277780', '#0284c780', '#ca8a0480']

// ── Types ──────────────────────────────────────────────────────────
interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    thisMonthRevenue: number
    lastMonthRevenue: number
  }
  monthlyRevenueChart: Array<{ month: string; revenue: number }>
  expensesByCategory: Array<{ category: string; amount: number }>
}

interface Partner {
  id: string
  name: string
  type: string
  _count: { invoices: number; purchaseOrders: number }
}

interface Product {
  id: string
  name: string
  category: string | null
  sellingPrice: number
  currentStock: number
  minStock?: number
}

interface SavedReport {
  id: string
  name: string
  description: string
  metric: string
  dimension: string
  dateFrom: string
  dateTo: string
}

// ── Tooltip style (shared) ────────────────────────────────────────
const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
} as const

// ── Helper: generate semi-realistic mock data ─────────────────────
function generateFinancialData(
  dashboardData: DashboardData,
  products: Product[],
  partners: Partner[]
) {
  const { kpis, monthlyRevenueChart } = dashboardData
  const totalRev = Math.max(kpis.totalRevenue, 1)
  const expenseRatio = kpis.totalExpenses / totalRev

  // Monthly P&L trend
  const monthlyPL = monthlyRevenueChart.map((item) => {
    const rev = item.revenue
    const exp = rev * expenseRatio * (0.8 + Math.random() * 0.4)
    return {
      month: item.month,
      revenue: Math.round(rev),
      expenses: Math.round(exp),
      profit: Math.round(rev - exp),
    }
  })

  // Profit margin trend
  const profitMarginTrend = monthlyPL.map((item) => ({
    month: item.month,
    margin: Number(((item.profit / Math.max(item.revenue, 1)) * 100).toFixed(1)),
  }))

  // Payment method pie (mock)
  const paymentMethodData = [
    { name: 'Gotovina', value: Math.round(totalRev * 0.35) },
    { name: 'Račun', value: Math.round(totalRev * 0.40) },
    { name: 'Kartica', value: Math.round(totalRev * 0.25) },
  ]

  // Income statement categories
  const incomeCategories = [
    { category: 'Prodaja robe', amount: Math.round(totalRev * 0.75) },
    { category: 'Usluge', amount: Math.round(totalRev * 0.15) },
    { category: 'Ostali prihodi', amount: Math.round(totalRev * 0.10) },
  ]
  const expenseCategories = [
    { category: 'Nabavka robe', amount: Math.round(kpis.totalExpenses * 0.55) },
    { category: 'Plata zaposlenih', amount: Math.round(kpis.totalExpenses * 0.25) },
    { category: 'Režije', amount: Math.round(kpis.totalExpenses * 0.12) },
    { category: 'Ostali rashodi', amount: Math.round(kpis.totalExpenses * 0.08) },
  ]

  // Cash flow
  const cashFlow = [
    { activity: 'Operativni', inflow: Math.round(totalRev * 0.90), outflow: Math.round(kpis.totalExpenses * 0.85), net: 0 },
    { activity: 'Investicioni', inflow: 0, outflow: Math.round(totalRev * 0.08), net: 0 },
    { activity: 'Finansijski', inflow: Math.round(totalRev * 0.05), outflow: Math.round(kpis.totalExpenses * 0.03), net: 0 },
  ]
  cashFlow.forEach((c) => { c.net = c.inflow - c.outflow })

  // Tax summary
  const taxSummary = {
    vatCollected: Math.round(totalRev * 0.20),
    vatPaid: Math.round(kpis.totalExpenses * 0.20),
  }
  taxSummary['netVat' as keyof typeof taxSummary] = taxSummary.vatCollected - taxSummary.vatPaid

  // Sales by partner (top 20)
  const salesByPartner = partners.slice(0, 20).map((p) => ({
    name: p.name,
    invoiceCount: p._count.invoices,
    totalRevenue: Math.round((p._count.invoices * totalRev) / Math.max(partners.length, 1) * (0.5 + Math.random())),
  })).sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Sales by product
  const salesByProduct = products.slice(0, 15).map((p) => ({
    name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
    quantitySold: Math.round(Math.random() * 200 + 10),
    revenue: Math.round(p.sellingPrice * (Math.random() * 50 + 5)),
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  // Sales by category bar chart
  const categorySalesMap = new Map<string, number>()
  products.forEach((p) => {
    const cat = p.category || 'Bez kategorije'
    categorySalesMap.set(cat, (categorySalesMap.get(cat) || 0) + p.sellingPrice * (Math.random() * 30 + 5))
  })
  const salesByCategory = Array.from(categorySalesMap.entries())
    .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue)

  // Daily sales trend (last 30 days mock)
  const dailySales = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      day: d.toISOString().slice(5, 10),
      amount: Math.round(totalRev / 30 * (0.6 + Math.random() * 0.8)),
    }
  })

  // Sales pipeline funnel
  const salesPipeline = [
    { stage: 'Lead', count: Math.round(Math.random() * 100 + 80) },
    { stage: 'Ponuda', count: Math.round(Math.random() * 60 + 50) },
    { stage: 'Narudžbenica', count: Math.round(Math.random() * 40 + 30) },
    { stage: 'Faktura', count: Math.round(Math.random() * 25 + 15) },
  ]

  // Stock valuation by category
  const stockValuation = Array.from(categorySalesMap.entries()).map(([name]) => {
    const catProducts = products.filter((p) => (p.category || 'Bez kategorije') === name)
    const totalValue = catProducts.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0)
    return { category: name, value: Math.round(totalValue), itemCount: catProducts.length }
  }).sort((a, b) => b.value - a.value)

  // Low stock alerts
  const lowStockAlerts = products
    .filter((p) => p.currentStock < (p.minStock || 5))
    .slice(0, 15)
    .map((p) => ({
      name: p.name,
      current: p.currentStock,
      minimum: p.minStock || 5,
      value: Math.round(p.sellingPrice * p.currentStock),
    }))

  // Stock movement summary
  const stockMovement = stockValuation.map((s) => ({
    category: s.category,
    incoming: Math.round(Math.random() * 500 + 100),
    outgoing: Math.round(Math.random() * 400 + 80),
  }))

  // Inventory turnover
  const inventoryTurnover = products.slice(0, 10).map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    turnoverRate: Number((Math.random() * 8 + 1).toFixed(1)),
  })).sort((a, b) => b.turnoverRate - a.turnoverRate)

  // Dead stock (no movement 90+ days)
  const deadStock = products.slice(0, 8).map((p) => ({
    name: p.name,
    stockValue: Math.round(p.sellingPrice * p.currentStock),
    daysInactive: Math.round(Math.random() * 200 + 90),
  }))

  // Partner activity summary
  const partnerActivity = partners.map((p) => ({
    name: p.name,
    type: p.type,
    invoiceCount: p._count.invoices,
    orderCount: p._count.purchaseOrders,
    totalAmount: Math.round((p._count.invoices + p._count.purchaseOrders) * totalRev / Math.max(partners.length, 1) * (0.3 + Math.random() * 1.4)),
    lastActivity: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString().slice(0, 10),
  }))

  // Partner type distribution
  const partnerTypeMap = new Map<string, number>()
  partners.forEach((p) => {
    const typeName = getStatusLabel(p.type)
    partnerTypeMap.set(typeName, (partnerTypeMap.get(typeName) || 0) + 1)
  })
  const partnerTypeDistribution = Array.from(partnerTypeMap.entries()).map(([name, value]) => ({ name, value }))

  // Top debtors
  const topDebtors = partners
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      overdueAmount: Math.round(totalRev / Math.max(partners.length, 1) * (Math.random() * 3 + 0.5)),
      daysOverdue: Math.round(Math.random() * 60 + 5),
    }))
    .sort((a, b) => b.overdueAmount - a.overdueAmount)

  // New partners trend (monthly)
  const newPartnersTrend = monthlyRevenueChart.map(() => ({
    count: Math.round(Math.random() * 8 + 1),
  }))

  // Employee mock data
  const departments = ['Razvoj', 'Prodaja', 'Marketing', 'Finansije', 'Logistika']
  const employeeNames = [
    'Marko Petrović', 'Ana Jovanović', 'Nikola Stanković',
    'Jelena Ilić', 'Milan Nikolić', 'Marija Đorđević',
    'Ivan Milić', 'Sara Tadić', 'Luka Vukčević', 'Maja Stojanović',
  ]
  const employeeData = employeeNames.map((name, i) => ({
    name,
    department: departments[i % departments.length],
    tasksCompleted: Math.round(Math.random() * 40 + 10),
    revenueGenerated: Math.round(totalRev / employeeNames.length * (0.3 + Math.random() * 1.4)),
    overtimeHours: Number((Math.random() * 30).toFixed(1)),
    attendanceRate: Number((85 + Math.random() * 15).toFixed(1)),
  }))

  const departmentHeadcount = departments.map((dept) => ({
    department: dept,
    count: employeeData.filter((e) => e.department === dept).length,
    avgSalary: Math.round(Math.random() * 80000 + 50000),
  }))

  const salaryDistribution = [
    { range: '50K-70K', count: Math.round(Math.random() * 5 + 2) },
    { range: '70K-90K', count: Math.round(Math.random() * 5 + 3) },
    { range: '90K-110K', count: Math.round(Math.random() * 4 + 1) },
    { range: '110K+', count: Math.round(Math.random() * 3) },
  ]

  return {
    kpis,
    monthlyRevenueChart,
    monthlyPL,
    profitMarginTrend,
    paymentMethodData,
    incomeCategories,
    expenseCategories,
    cashFlow,
    taxSummary,
    salesByPartner,
    salesByProduct,
    salesByCategory,
    dailySales,
    salesPipeline,
    stockValuation,
    lowStockAlerts,
    stockMovement,
    inventoryTurnover,
    deadStock,
    partnerActivity,
    partnerTypeDistribution,
    topDebtors,
    newPartnersTrend,
    employeeData,
    departmentHeadcount,
    salaryDistribution,
    categoryData: Array.from(categorySalesMap.entries()).map(([name, value]) => ({ name, value: Math.round(value) })),
    topProducts: [...products]
      .sort((a, b) => (b.sellingPrice * b.currentStock) - (a.sellingPrice * a.currentStock))
      .slice(0, 8)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        vrednost: p.sellingPrice * p.currentStock,
      })),
  }
}

// ── Sub-components ─────────────────────────────────────────────────

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendLabel?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {trendLabel && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <BarChart3 className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────
export function Reports() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [finDateFrom, setFinDateFrom] = useState('')
  const [finDateTo, setFinDateTo] = useState('')
  const [salesDateFrom, setSalesDateFrom] = useState('')
  const [salesDateTo, setSalesDateTo] = useState('')
  const [savedReports, setSavedReports] = useState<SavedReport[]>([
    { id: '1', name: 'Mesečni prihodi', description: 'Prikaz prihoda po mesecima', metric: 'revenue', dimension: 'month', dateFrom: '2025-01-01', dateTo: '2025-12-31' },
    { id: '2', name: 'Top partneri', description: 'Najbolji partneri po prihodu', metric: 'revenue', dimension: 'partner', dateFrom: '2025-01-01', dateTo: '2025-12-31' },
  ])
  const [customMetric, setCustomMetric] = useState('revenue')
  const [customDimension, setCustomDimension] = useState('month')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [customReportName, setCustomReportName] = useState('')
  const [customReportDesc, setCustomReportDesc] = useState('')
  const [customGenerated, setCustomGenerated] = useState(false)
  const [customSubTab, setCustomSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const { t } = useTranslation()

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/partners').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([dash, parts, prods]) => {
      setDashboardData(dash)
      setPartners(parts)
      setProducts(prods)
      setLoading(false)
    })
  }, [])

  const data = useMemo(() => {
    if (!dashboardData) return null
    return generateFinancialData(dashboardData, products, partners)
  }, [dashboardData, products, partners])

  // Custom report results
  const customResults = useMemo(() => {
    if (!data || !customGenerated) return null
    const { monthlyPL, salesByPartner, salesByProduct, salesByCategory } = data
    if (customDimension === 'month' && (customMetric === 'revenue' || customMetric === 'profit' || customMetric === 'expenses')) {
      return {
        tableData: monthlyPL.map((m) => ({
          label: getMonthLabel(m.month),
          value: customMetric === 'revenue' ? m.revenue : customMetric === 'expenses' ? m.expenses : m.profit,
        })),
        chartData: monthlyPL.map((m) => ({
          label: getMonthLabel(m.month),
          value: customMetric === 'revenue' ? m.revenue : customMetric === 'expenses' ? m.expenses : m.profit,
        })),
      }
    }
    if (customDimension === 'partner') {
      return {
        tableData: salesByPartner.map((s) => ({ label: s.name, value: s.totalRevenue })),
        chartData: salesByPartner.slice(0, 8).map((s) => ({ label: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name, value: s.totalRevenue })),
      }
    }
    if (customDimension === 'product') {
      return {
        tableData: salesByProduct.map((s) => ({ label: s.name, value: s.revenue })),
        chartData: salesByProduct.map((s) => ({ label: s.name, value: s.revenue })),
      }
    }
    if (customDimension === 'category') {
      return {
        tableData: salesByCategory.map((s) => ({ label: s.name, value: s.revenue })),
        chartData: salesByCategory.map((s) => ({ label: s.name, value: s.revenue })),
      }
    }
    return null
  }, [data, customGenerated, customMetric, customDimension])

  if (loading || !dashboardData || !data) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  const { kpis, monthlyRevenueChart, monthlyPL, profitMarginTrend, paymentMethodData } = data
  const totalRev = Math.max(kpis.totalRevenue, 1)
  const profitMargin = ((kpis.netProfit / totalRev) * 100).toFixed(1)
  const avgInvoiceValue = totalRev / Math.max(partners.reduce((s, p) => s + p._count.invoices, 0), 1)
  const openInvoices = Math.round(partners.reduce((s, p) => s + p._count.invoices, 0) * 0.3)

  const handleGenerateCustom = () => {
    setCustomGenerated(true)
  }

  const handleSaveReport = () => {
    if (!customReportName.trim()) return
    const newReport: SavedReport = {
      id: String(Date.now()),
      name: customReportName,
      description: customReportDesc,
      metric: customMetric,
      dimension: customDimension,
      dateFrom: customDateFrom,
      dateTo: customDateTo,
    }
    setSavedReports((prev) => [...prev, newReport])
    setCustomReportName('')
    setCustomReportDesc('')
    setCustomSubTab('pregled')
  }

  const handleDeleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleRunSavedReport = (report: SavedReport) => {
    setCustomMetric(report.metric)
    setCustomDimension(report.dimension)
    setCustomDateFrom(report.dateFrom)
    setCustomDateTo(report.dateTo)
    setCustomGenerated(true)
    setActiveTab('custom')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ReportDownloadButton type="financial" />
          <ReportDownloadButton type="partners" />
          <ReportDownloadButton type="products" />
          <ReportDownloadButton type="transactions" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabOverview')}
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm">
            <DollarSign className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabFinancial')}
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabSales')}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabInventory')}
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabPartners')}
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-1.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabEmployees')}
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 hidden sm:block" />
            {t('reports.tabCustom')}
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Overview ────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard
                title={t('reports.kpiTotalRevenue')}
                value={formatRSD(kpis.totalRevenue)}
                icon={DollarSign}
                trend="up"
                trendLabel={`+${kpis.thisMonthRevenue > kpis.lastMonthRevenue ? '12' : '5'}%`}
              />
              <KPICard
                title={t('reports.kpiTotalExpenses')}
                value={formatRSD(kpis.totalExpenses)}
                icon={TrendingDown}
              />
              <KPICard
                title={t('reports.kpiNetProfit')}
                value={formatRSD(kpis.netProfit)}
                icon={TrendingUp}
                trend={kpis.netProfit > 0 ? 'up' : 'down'}
              />
              <KPICard
                title={t('reports.kpiProfitMargin')}
                value={`${profitMargin}%`}
                icon={PieChartIcon}
              />
              <KPICard
                title={t('reports.kpiAvgInvoice')}
                value={formatRSD(avgInvoiceValue)}
                icon={FileText}
              />
              <KPICard
                title={t('reports.kpiOpenInvoices')}
                value={String(openInvoices)}
                icon={Calendar}
              />
            </div>

            {/* Revenue vs Expenses + Profit Margin Trend */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                title={t('reports.monthlyRevenueVsExpenses')}
                subtitle={t('reports.revenueExpenseComparison')}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPL}>
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
                        formatter={(value: number, name: string) => [
                          formatRSD(value),
                          name === 'revenue' ? t('common.prihod') : t('common.rashod'),
                        ]}
                        labelFormatter={getMonthLabel}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} name={t('common.prihod')} />
                      <Bar dataKey="expenses" fill="#ea580c" radius={[4, 4, 0, 0]} name={t('common.rashod')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title={t('reports.profitMarginTrend')}
                subtitle={t('reports.profitMarginTrendDesc')}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitMarginTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={getMonthLabel}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        unit="%"
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, t('reports.profitMargin')]}
                        labelFormatter={getMonthLabel}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Line type="monotone" dataKey="margin" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Revenue by Payment Method */}
            <SectionCard
              title={t('reports.revenueByPaymentMethod')}
              subtitle={t('reports.revenueByPaymentMethodDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {paymentMethodData.map((_, index) => (
                        <Cell key={`cell-pm-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatRSD(value)}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Financial ───────────────────────────────── */}
        <TabsContent value="financial">
          <div className="space-y-6">
            {/* Date Range Filter */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex items-end gap-3 flex-1">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label className="text-xs">{t('reports.from')}</Label>
                    <Input
                      type="date"
                      value={finDateFrom}
                      onChange={(e) => setFinDateFrom(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label className="text-xs">{t('reports.to')}</Label>
                    <Input
                      type="date"
                      value={finDateTo}
                      onChange={(e) => setFinDateTo(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {t('reports.applyFilter')}
                </Button>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Income Statement */}
              <SectionCard
                title={t('reports.incomeStatement')}
                subtitle={t('reports.incomeStatementDesc')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('reports.category')}</TableHead>
                      <TableHead className="text-xs text-right">{t('common.iznos')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell className="text-xs font-semibold">{t('reports.revenueCategories')}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">
                        {formatRSD(data.incomeCategories.reduce((s, c) => s + c.amount, 0))}
                      </TableCell>
                    </TableRow>
                    {data.incomeCategories.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell className="text-xs pl-6">{cat.category}</TableCell>
                        <TableCell className="text-xs text-right">{formatRSD(cat.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell className="text-xs font-semibold">{t('reports.expenseCategories')}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">
                        {formatRSD(data.expenseCategories.reduce((s, c) => s + c.amount, 0))}
                      </TableCell>
                    </TableRow>
                    {data.expenseCategories.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell className="text-xs pl-6">{cat.category}</TableCell>
                        <TableCell className="text-xs text-right">{formatRSD(cat.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell className="text-xs">{t('reports.netProfit')}</TableCell>
                      <TableCell className={`text-xs text-right font-bold ${kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatRSD(kpis.netProfit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </SectionCard>

              {/* Cash Flow */}
              <SectionCard
                title={t('reports.cashFlow')}
                subtitle={t('reports.cashFlowDesc')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('reports.activity')}</TableHead>
                      <TableHead className="text-xs text-right">{t('reports.inflow')}</TableHead>
                      <TableHead className="text-xs text-right">{t('reports.outflow')}</TableHead>
                      <TableHead className="text-xs text-right">{t('reports.netCashFlow')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.cashFlow.map((cf) => (
                      <TableRow key={cf.activity}>
                        <TableCell className="text-xs font-medium">{cf.activity}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-600">{formatRSD(cf.inflow)}</TableCell>
                        <TableCell className="text-xs text-right text-red-500">{formatRSD(cf.outflow)}</TableCell>
                        <TableCell className={`text-xs text-right font-medium ${cf.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {formatRSD(cf.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell className="text-xs">{t('reports.total')}</TableCell>
                      <TableCell className="text-xs text-right">
                        {formatRSD(data.cashFlow.reduce((s, c) => s + c.inflow, 0))}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {formatRSD(data.cashFlow.reduce((s, c) => s + c.outflow, 0))}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold">
                        {formatRSD(data.cashFlow.reduce((s, c) => s + c.net, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </SectionCard>
            </div>

            {/* Monthly P&L Trend Chart */}
            <SectionCard
              title={t('reports.monthlyPLTrend')}
              subtitle={t('reports.monthlyPLTrendDesc')}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPL}>
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
                      formatter={(value: number) => formatRSD(value)}
                      labelFormatter={getMonthLabel}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} name={t('common.prihod')} />
                    <Line type="monotone" dataKey="expenses" stroke="#ea580c" strokeWidth={2} name={t('common.rashod')} />
                    <Line type="monotone" dataKey="profit" stroke="#0891b2" strokeWidth={2} name={t('reports.profit')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* Tax Summary */}
            <SectionCard title={t('reports.taxSummary')} subtitle={t('reports.taxSummaryDesc')}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('reports.taxType')}</TableHead>
                    <TableHead className="text-xs text-right">{t('reports.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs font-medium">{t('reports.vatCollected')}</TableCell>
                    <TableCell className="text-xs text-right text-emerald-600">{formatRSD(data.taxSummary.vatCollected)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">{t('reports.vatPaid')}</TableCell>
                    <TableCell className="text-xs text-right text-red-500">{formatRSD(data.taxSummary.vatPaid)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-2">
                    <TableCell className="text-xs">{t('reports.netVat')}</TableCell>
                    <TableCell className={`text-xs text-right font-bold ${data.taxSummary.netVat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatRSD(data.taxSummary.netVat)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Sales ───────────────────────────────────── */}
        <TabsContent value="sales">
          <div className="space-y-6">
            {/* Date Range Filter */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex items-end gap-3 flex-1">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label className="text-xs">{t('reports.from')}</Label>
                    <Input
                      type="date"
                      value={salesDateFrom}
                      onChange={(e) => setSalesDateFrom(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label className="text-xs">{t('reports.to')}</Label>
                    <Input
                      type="date"
                      value={salesDateTo}
                      onChange={(e) => setSalesDateTo(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {t('reports.applyFilter')}
                </Button>
              </div>
            </Card>

            {/* Sales by Partner + Sales by Product */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title={t('reports.salesByPartner')} subtitle={t('reports.salesByPartnerDesc')}>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('common.name')}</TableHead>
                        <TableHead className="text-xs text-center">{t('reports.invoices')}</TableHead>
                        <TableHead className="text-xs text-right">{t('common.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.salesByPartner.map((sp, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{sp.name}</TableCell>
                          <TableCell className="text-xs text-center">{sp.invoiceCount}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(sp.totalRevenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>

              <SectionCard title={t('reports.salesByProduct')} subtitle={t('reports.salesByProductDesc')}>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('reports.product')}</TableHead>
                        <TableHead className="text-xs text-center">{t('reports.quantity')}</TableHead>
                        <TableHead className="text-xs text-right">{t('common.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.salesByProduct.map((sp, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{sp.name}</TableCell>
                          <TableCell className="text-xs text-center">{sp.quantitySold}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(sp.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>
            </div>

            {/* Sales by Category + Sales Pipeline */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title={t('reports.salesByCategory')} subtitle={t('reports.salesByCategoryDesc')}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tickFormatter={formatRSDShort}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatRSD(value), t('reports.revenue')]}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Bar dataKey="revenue" fill="#0891b2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title={t('reports.salesPipeline')} subtitle={t('reports.salesPipelineDesc')}>
                <div className="space-y-4 pt-2">
                  {data.salesPipeline.map((stage, i) => {
                    const maxCount = Math.max(...data.salesPipeline.map((s) => s.count))
                    const widthPercent = (stage.count / maxCount) * 100
                    return (
                      <div key={stage.stage} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{stage.stage}</span>
                          <span className="text-xs text-muted-foreground">{stage.count}</span>
                        </div>
                        <div className="h-6 w-full rounded bg-muted overflow-hidden">
                          <div
                            className="h-full rounded flex items-center pl-2 text-xs text-white font-semibold transition-all"
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          >
                            {widthPercent > 25 && `${((stage.count / data.salesPipeline[0].count) * 100).toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>
            </div>

            {/* Daily Sales Trend */}
            <SectionCard title={t('reports.dailySalesTrend')} subtitle={t('reports.dailySalesTrendDesc')}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatRSDShort}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => formatRSD(value)}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#059669"
                      fill="#05966920"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 4: Inventory ───────────────────────────────── */}
        <TabsContent value="inventory">
          <div className="space-y-6">
            {/* Stock Valuation */}
            <SectionCard title={t('reports.stockValuation')} subtitle={t('reports.stockValuationDesc')}>
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('reports.category')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.itemCount')}</TableHead>
                      <TableHead className="text-xs text-right">{t('reports.totalValue')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.stockValuation.map((sv, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{sv.category}</TableCell>
                        <TableCell className="text-xs text-center">{sv.itemCount}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatRSD(sv.value)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell className="text-xs">{t('reports.total')}</TableCell>
                      <TableCell className="text-xs text-center">
                        {data.stockValuation.reduce((s, v) => s + v.itemCount, 0)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold">
                        {formatRSD(data.stockValuation.reduce((s, v) => s + v.value, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            {/* Low Stock + Stock Movement */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title={t('reports.lowStockAlerts')} subtitle={t('reports.lowStockAlertsDesc')}>
                {data.lowStockAlerts.length === 0 ? (
                  <EmptyState message={t('reports.noLowStock')} />
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('reports.product')}</TableHead>
                          <TableHead className="text-xs text-center">{t('reports.currentStock')}</TableHead>
                          <TableHead className="text-xs text-center">{t('reports.minStock')}</TableHead>
                          <TableHead className="text-xs text-right">{t('reports.stockValue')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.lowStockAlerts.map((ls, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-medium">{ls.name}</TableCell>
                            <TableCell className="text-xs text-center">
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">{ls.current}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-center text-muted-foreground">{ls.minimum}</TableCell>
                            <TableCell className="text-xs text-right">{formatRSD(ls.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </SectionCard>

              <SectionCard title={t('reports.stockMovement')} subtitle={t('reports.stockMovementDesc')}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.stockMovement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend />
                      <Bar dataKey="incoming" fill="#059669" radius={[4, 4, 0, 0]} name={t('reports.incoming')} />
                      <Bar dataKey="outgoing" fill="#ea580c" radius={[4, 4, 0, 0]} name={t('reports.outgoing')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Inventory Turnover */}
            <SectionCard title={t('reports.inventoryTurnover')} subtitle={t('reports.inventoryTurnoverDesc')}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.inventoryTurnover} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, t('reports.turnoverRate')]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Bar dataKey="turnoverRate" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* Dead Stock */}
            <SectionCard title={t('reports.deadStock')} subtitle={t('reports.deadStockDesc')}>
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('reports.product')}</TableHead>
                      <TableHead className="text-xs text-right">{t('reports.stockValue')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.daysInactive')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.deadStock.map((ds, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{ds.name}</TableCell>
                        <TableCell className="text-xs text-right">{formatRSD(ds.stockValue)}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="outline" className="text-xs px-1.5 py-0 text-red-600 border-red-200">
                            {ds.daysInactive}d
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 5: Partners ────────────────────────────────── */}
        <TabsContent value="partners">
          <div className="space-y-6">
            {/* Partner Activity Summary */}
            <SectionCard title={t('reports.partnerActivitySummary')} subtitle={t('reports.partnerActivitySummaryDesc')}>
              <div className="max-h-[420px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('common.name')}</TableHead>
                      <TableHead className="text-xs">{t('common.type')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.invoices')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.purchaseOrders')}</TableHead>
                      <TableHead className="text-xs text-right">{t('common.total')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.lastActivity')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.partnerActivity.map((pa, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{pa.name}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {getStatusLabel(pa.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">{pa.invoiceCount}</TableCell>
                        <TableCell className="text-xs text-center">{pa.orderCount}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatRSD(pa.totalAmount)}</TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground">{pa.lastActivity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            {/* Partner Type Distribution + Top Debtors */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title={t('reports.partnerTypeDistribution')} subtitle={t('reports.partnerTypeDistributionDesc')}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.partnerTypeDistribution}
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {data.partnerTypeDistribution.map((_, index) => (
                          <Cell key={`cell-pt-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, t('reports.count')]}
                        contentStyle={TOOLTIP_STYLE}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title={t('reports.topDebtors')} subtitle={t('reports.topDebtorsDesc')}>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('common.name')}</TableHead>
                        <TableHead className="text-xs text-right">{t('reports.overdueAmount')}</TableHead>
                        <TableHead className="text-xs text-center">{t('reports.daysOverdue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topDebtors.map((td, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{td.name}</TableCell>
                          <TableCell className="text-xs text-right font-medium text-red-600">
                            {formatRSD(td.overdueAmount)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {td.daysOverdue}d
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>
            </div>

            {/* New Partners Trend */}
            <SectionCard title={t('reports.newPartnersTrend')} subtitle={t('reports.newPartnersTrendDesc')}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRevenueChart.map((m, i) => ({
                      month: m.month,
                      count: data.newPartnersTrend[i]?.count || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={getMonthLabel}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, t('reports.newPartners')]}
                      labelFormatter={getMonthLabel}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Bar dataKey="count" fill="#db2777" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 6: Employees ───────────────────────────────── */}
        <TabsContent value="employees">
          <div className="space-y-6">
            {/* Employee Productivity + Department Headcount */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title={t('reports.employeeProductivity')} subtitle={t('reports.employeeProductivityDesc')}>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('reports.employee')}</TableHead>
                        <TableHead className="text-xs">{t('reports.department')}</TableHead>
                        <TableHead className="text-xs text-center">{t('reports.tasksCompleted')}</TableHead>
                        <TableHead className="text-xs text-right">{t('reports.revenueGenerated')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.employeeData.map((ed, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{ed.name}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs px-2 py-0">{ed.department}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-center">{ed.tasksCompleted}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatRSD(ed.revenueGenerated)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>

              <SectionCard title={t('reports.departmentHeadcount')} subtitle={t('reports.departmentHeadcountDesc')}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.departmentHeadcount}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="department"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === 'count' ? value : formatRSD(value),
                          name === 'count' ? t('reports.employees') : t('reports.avgSalary'),
                        ]}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} name={t('reports.employees')} />
                      <Bar dataKey="avgSalary" fill="#7c3aed" radius={[4, 4, 0, 0]} name={t('reports.avgSalary')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Attendance Summary */}
            <SectionCard title={t('reports.attendanceSummary')} subtitle={t('reports.attendanceSummaryDesc')}>
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('reports.employee')}</TableHead>
                      <TableHead className="text-xs">{t('reports.department')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.attendanceRate')}</TableHead>
                      <TableHead className="text-xs text-center">{t('reports.overtimeHours')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.employeeData.map((ed, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{ed.name}</TableCell>
                        <TableCell className="text-xs">{ed.department}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 ${
                              ed.attendanceRate >= 95
                                ? 'text-emerald-600 border-emerald-200'
                                : ed.attendanceRate >= 90
                                  ? 'text-amber-600 border-amber-200'
                                  : 'text-red-600 border-red-200'
                            }`}
                          >
                            {ed.attendanceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {ed.overtimeHours > 15 ? (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 text-amber-600 border-amber-200">
                              {ed.overtimeHours}h
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{ed.overtimeHours}h</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            {/* Salary Distribution */}
            <SectionCard title={t('reports.salaryDistribution')} subtitle={t('reports.salaryDistributionDesc')}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salaryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, t('reports.count')]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Bar dataKey="count" fill="#ca8a04" radius={[4, 4, 0, 0]} name={t('reports.count')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── Tab 7: Custom Reports ──────────────────────────── */}
        <TabsContent value="custom">
          <div className="space-y-6">
            {/* Custom Report Builder */}
            <SectionCard title={t('reports.customReportBuilder')} subtitle={t('reports.customReportBuilderDesc')}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('reports.metric')}</Label>
                  <Select value={customMetric} onValueChange={setCustomMetric}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">{t('reports.metricRevenue')}</SelectItem>
                      <SelectItem value="expenses">{t('reports.metricExpenses')}</SelectItem>
                      <SelectItem value="profit">{t('reports.metricProfit')}</SelectItem>
                      <SelectItem value="invoiceCount">{t('reports.metricInvoiceCount')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('reports.dimension')}</Label>
                  <Select value={customDimension} onValueChange={setCustomDimension}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">{t('reports.dimensionMonth')}</SelectItem>
                      <SelectItem value="partner">{t('reports.dimensionPartner')}</SelectItem>
                      <SelectItem value="product">{t('reports.dimensionProduct')}</SelectItem>
                      <SelectItem value="category">{t('reports.dimensionCategory')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('reports.from')}</Label>
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('reports.to')}</Label>
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={handleGenerateCustom} size="sm" className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  {t('reports.generateReport')}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCustomSubTab('dodaj')}>
                  <Save className="h-3.5 w-3.5" />
                  {t('reports.saveReport')}
                </Button>
              </div>
            </SectionCard>
            {customSubTab === 'dodaj' && (
              <Card className="mt-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCustomSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle>{t('reports.saveReportTitle')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('reports.reportName')}</Label>
                    <Input
                      value={customReportName}
                      onChange={(e) => setCustomReportName(e.target.value)}
                      placeholder={t('reports.reportNamePlaceholder')}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('reports.reportDescription')}</Label>
                    <Input
                      value={customReportDesc}
                      onChange={(e) => setCustomReportDesc(e.target.value)}
                      placeholder={t('reports.reportDescPlaceholder')}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCustomSubTab('pregled')}>
                      {t('common.cancel') || 'Otkaži'}
                    </Button>
                    <Button size="sm" onClick={handleSaveReport} disabled={!customReportName.trim()}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      {t('common.save') || 'Sačuvaj'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Report Results */}
            {customGenerated && customResults && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title={t('reports.results')} subtitle={t('reports.resultsDesc')}>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('reports.label')}</TableHead>
                          <TableHead className="text-xs text-right">{t('reports.value')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customResults.tableData.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-medium">{row.label}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatRSD(row.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </SectionCard>

                <SectionCard title={t('reports.chart')} subtitle={t('reports.chartDesc')}>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customResults.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={formatRSDShort}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value: number) => formatRSD(value)}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
            )}

            <Separator />

            {/* Saved Reports */}
            <SectionCard title={t('reports.savedReports')} subtitle={t('reports.savedReportsDesc')}>
              {savedReports.length === 0 ? (
                <EmptyState message={t('reports.noSavedReports')} />
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('reports.reportName')}</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">{t('reports.reportDescription')}</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">{t('reports.metric')}</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">{t('reports.dimension')}</TableHead>
                        <TableHead className="text-xs text-right">{t('reports.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedReports.map((sr) => (
                        <TableRow key={sr.id}>
                          <TableCell className="text-xs font-medium">{sr.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                            {sr.description || '—'}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-xs px-2 py-0">{sr.metric}</Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-xs px-2 py-0">{sr.dimension}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleRunSavedReport(sr)}
                                title={t('reports.runReport')}
                              >
                                <Play className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteReport(sr.id)}
                                title={t('reports.deleteReport')}
                              >
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
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
