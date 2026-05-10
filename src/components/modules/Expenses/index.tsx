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
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Receipt, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, DollarSign,
  TrendingUp, TrendingDown, AlertTriangle, FileText,
  Calendar, CreditCard, Building2, Users, Filter,
  Download, Printer, ArrowRight, X, Wallet, PiggyBank,
  Shield, Settings, ArrowLeft,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

// ==================== TYPES ====================

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  employee: string
  employeeId: string
  paymentMethod: string
  status: string
  hasReceipt: boolean
  notes?: string
  reportId?: string
  createdAt: string
}

interface ExpenseReport {
  id: string
  title: string
  employee: string
  employeeId: string
  dateFrom: string
  dateTo: string
  status: string
  totalAmount: number
  expenseCount: number
  notes?: string
  createdAt: string
}

interface Budget {
  id: string
  name: string
  category: string
  allocatedAmount: number
  spentAmount: number
  period: string
  startDate: string
  endDate: string
}

interface Policy {
  id: string
  name: string
  category: string
  maxAmount: number
  frequency: string
  approvalThreshold: number
  isActive: boolean
}

// ==================== CONSTANTS ====================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Poslata', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  paid: { label: 'Placeno', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  manager_review: { label: 'Pregled menadzera', color: 'bg-orange-100 text-orange-700' },
}

const CATEGORY_LABELS: Record<string, string> = {
  office: 'Kancelarija',
  travel: 'Putovanja',
  equipment: 'Oprema',
  marketing: 'Marketing',
  utilities: 'Komunalije',
  salaries: 'Plate',
  other: 'Ostalo',
}

const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Gotovina',
  card: 'Kartica',
  bank_transfer: 'Bankovni transfer',
  company_account: 'Firmni racun',
}

const PIE_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b']

const EMPLOYEES = [
  { id: 'emp-1', name: 'Marko Petrovic' },
  { id: 'emp-2', name: 'Jelena Nikolic' },
  { id: 'emp-3', name: 'Stefan Jovanovic' },
  { id: 'emp-4', name: 'Ana Popovic' },
  { id: 'emp-5', name: 'Nikola Milovanovic' },
]

const EMPTY_EXPENSE_FORM = {
  description: '',
  category: 'office',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  employeeId: 'emp-1',
  paymentMethod: 'card',
  hasReceipt: false,
  notes: '',
  status: 'draft',
}

const EMPTY_REPORT_FORM = {
  title: '',
  employeeId: 'emp-1',
  dateFrom: '',
  dateTo: '',
  notes: '',
}

const EMPTY_BUDGET_FORM = {
  name: '',
  category: 'office',
  allocatedAmount: 0,
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
}

const EMPTY_POLICY_FORM = {
  name: '',
  category: 'office',
  maxAmount: 50000,
  frequency: 'monthly',
  approvalThreshold: 30000,
  isActive: true,
}

// ==================== MOCK DATA ====================

function generateMockExpenses(): Expense[] {
  return [
    { id: 'exp-1', description: 'Kancelarijski materijal - papir, toneri', category: 'office', amount: 18500, date: '2025-01-15', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'card', status: 'approved', hasReceipt: true, notes: 'Mesečna nabavka', createdAt: '2025-01-15T08:00:00Z' },
    { id: 'exp-2', description: 'Putovanje Novi Sad - sastanak klijent', category: 'travel', amount: 12400, date: '2025-01-18', employee: 'Jelena Nikolic', employeeId: 'emp-2', paymentMethod: 'company_account', status: 'submitted', hasReceipt: true, notes: 'Voz karta + taksii', createdAt: '2025-01-18T09:30:00Z' },
    { id: 'exp-3', description: 'Marketing kampanja - Google Ads', category: 'marketing', amount: 85000, date: '2025-01-10', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'approved', hasReceipt: true, createdAt: '2025-01-10T10:00:00Z' },
    { id: 'exp-4', description: 'Laptop za novog zaposlenog', category: 'equipment', amount: 125000, date: '2025-01-20', employee: 'Stefan Jovanovic', employeeId: 'emp-3', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, notes: 'Dell Latitude 5540', createdAt: '2025-01-20T11:00:00Z' },
    { id: 'exp-5', description: 'Struja za januar', category: 'utilities', amount: 28700, date: '2025-01-25', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-25T08:00:00Z' },
    { id: 'exp-6', description: 'Timski ručak - projekat Alpha', category: 'other', amount: 15600, date: '2025-01-22', employee: 'Jelena Nikolic', employeeId: 'emp-2', paymentMethod: 'cash', status: 'draft', hasReceipt: false, createdAt: '2025-01-22T12:00:00Z' },
    { id: 'exp-7', description: 'Printanje flajera 5000 kom', category: 'marketing', amount: 42000, date: '2025-01-12', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'approved', hasReceipt: true, createdAt: '2025-01-12T14:00:00Z' },
    { id: 'exp-8', description: 'Pretplate softver - Adobe, Slack', category: 'software', amount: 35600, date: '2025-01-05', employee: 'Stefan Jovanovic', employeeId: 'emp-3', paymentMethod: 'card', status: 'paid', hasReceipt: true, createdAt: '2025-01-05T09:00:00Z' },
    { id: 'exp-9', description: 'Kancelarijski sto za recepciju', category: 'equipment', amount: 67800, date: '2025-01-28', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'bank_transfer', status: 'submitted', hasReceipt: true, createdAt: '2025-01-28T10:00:00Z' },
    { id: 'exp-10', description: 'Internet provajder - januar', category: 'utilities', amount: 9500, date: '2025-01-03', employee: 'Nikola Milovanovic', employeeId: 'emp-5', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-03T08:00:00Z' },
    { id: 'exp-11', description: 'Putovanje Beograd-Nis - sajam', category: 'travel', amount: 28900, date: '2025-01-14', employee: 'Nikola Milovanovic', employeeId: 'emp-5', paymentMethod: 'company_account', status: 'rejected', hasReceipt: true, notes: 'Nije prethodno odobreno', createdAt: '2025-01-14T07:00:00Z' },
    { id: 'exp-12', description: 'Stolice za konferencijsku salu x8', category: 'office', amount: 48000, date: '2025-01-08', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-08T11:00:00Z' },
  ]
}

function generateMockReports(): ExpenseReport[] {
  return [
    { id: 'rep-1', title: 'Putni troškovi - januar', employee: 'Jelena Nikolic', employeeId: 'emp-2', dateFrom: '2025-01-01', dateTo: '2025-01-31', status: 'submitted', totalAmount: 41300, expenseCount: 3, notes: 'Sastanci sa klijentima', createdAt: '2025-01-25T10:00:00Z' },
    { id: 'rep-2', title: 'Marketing - Q1 2025', employee: 'Ana Popovic', employeeId: 'emp-4', dateFrom: '2025-01-01', dateTo: '2025-03-31', status: 'approved', totalAmount: 127000, expenseCount: 2, notes: 'Online i print kampanje', createdAt: '2025-01-20T09:00:00Z' },
    { id: 'rep-3', title: 'IT oprema - januar', employee: 'Stefan Jovanovic', employeeId: 'emp-3', dateFrom: '2025-01-01', dateTo: '2025-01-31', status: 'paid', totalAmount: 160600, expenseCount: 2, notes: 'Nabavka za nove zaposlene', createdAt: '2025-01-28T14:00:00Z' },
  ]
}

function generateMockBudgets(): Budget[] {
  return [
    { id: 'bud-1', name: 'Kancelarija', category: 'office', allocatedAmount: 150000, spentAmount: 66500, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-2', name: 'Putovanja', category: 'travel', allocatedAmount: 100000, spentAmount: 41300, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-3', name: 'Oprema', category: 'equipment', allocatedAmount: 200000, spentAmount: 192800, period: 'quarterly', startDate: '2025-01-01', endDate: '2025-03-31' },
    { id: 'bud-4', name: 'Marketing', category: 'marketing', allocatedAmount: 180000, spentAmount: 127000, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-5', name: 'Komunalije', category: 'utilities', allocatedAmount: 80000, spentAmount: 38200, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
  ]
}

function generateMockPolicies(): Policy[] {
  return [
    { id: 'pol-1', name: 'Kancelarijski limit', category: 'office', maxAmount: 50000, frequency: 'monthly', approvalThreshold: 20000, isActive: true },
    { id: 'pol-2', name: 'Putni limit', category: 'travel', maxAmount: 80000, frequency: 'monthly', approvalThreshold: 30000, isActive: true },
    { id: 'pol-3', name: 'Oprema - odobrenje menadzera', category: 'equipment', maxAmount: 500000, frequency: 'quarterly', approvalThreshold: 0, isActive: true },
    { id: 'pol-4', name: 'Marketing budzet', category: 'marketing', maxAmount: 200000, frequency: 'monthly', approvalThreshold: 50000, isActive: true },
    { id: 'pol-5', name: 'Komunalije auto', category: 'utilities', maxAmount: 100000, frequency: 'monthly', approvalThreshold: 100000, isActive: false },
  ]
}

function generateMonthlyTrend() {
  return [
    { month: 'Avg', amount: 380000 },
    { month: 'Sep', amount: 420000 },
    { month: 'Okt', amount: 395000 },
    { month: 'Nov', amount: 450000 },
    { month: 'Dec', amount: 510000 },
    { month: 'Jan', amount: 517100 },
  ]
}

function generateCategoryDistribution(expenses: Expense[]) {
  const map: Record<string, number> = {}
  expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
  return Object.entries(map).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value: Math.round(value),
  }))
}

function generateBudgetVsActual(budgets: Budget[]) {
  return budgets.map(b => ({
    name: b.name,
    budget: b.allocatedAmount,
    actual: b.spentAmount,
  }))
}

function generateDayOfWeekData() {
  return [
    { day: 'Pon', amount: 85000 },
    { day: 'Uto', amount: 62000 },
    { day: 'Sre', amount: 95000 },
    { day: 'Cet', amount: 78000 },
    { day: 'Pet', amount: 110000 },
    { day: 'Sub', amount: 15000 },
    { day: 'Ned', amount: 5000 },
  ]
}

function generateDeptComparison() {
  return [
    { dept: 'IT', amount: 160600 },
    { dept: 'Marketing', amount: 127000 },
    { dept: 'HR', amount: 48000 },
    { dept: 'Prodaja', amount: 41300 },
    { dept: 'Admin', amount: 38200 },
  ]
}

// ==================== HELPER FUNCTIONS ====================

function getEmployeeName(id: string): string {
  return EMPLOYEES.find(e => e.id === id)?.name || id
}

function getPercentUsed(spent: number, allocated: number): number {
  if (allocated <= 0) return 0
  return Math.min(Math.round((spent / allocated) * 100), 100)
}

function getBudgetAlertClass(pct: number): string {
  if (pct >= 100) return 'text-red-600'
  if (pct >= 80) return 'text-amber-600'
  return 'text-emerald-600'
}

// ==================== MAIN COMPONENT ====================

export function Expenses() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('expenses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab)}>
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('expenses.refresh')}</span>
          </Button>
          <Button size="sm" onClick={() => setActiveTab('expenses')}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('expenses.newExpense')}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.expenses')}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.reports')}</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="gap-1.5">
            <PiggyBank className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.budgets')}</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.policies')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('expenses.analytics')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewDashboard /></TabsContent>
        <TabsContent value="expenses"><ExpensesTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="budgets"><BudgetsTab /></TabsContent>
        <TabsContent value="policies"><PoliciesTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== TAB 1: OVERVIEW DASHBOARD ====================

function OverviewDashboard() {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/expenses')
        if (res.ok) {
          const data = await res.json()
          setExpenses(Array.isArray(data) ? data : generateMockExpenses())
        } else {
          setExpenses(generateMockExpenses())
        }
      } catch {
        setExpenses(generateMockExpenses())
      }
      setLoading(false)
    }
    load()
  }, [])

  const kpiData = useMemo(() => {
    const totalThisMonth = expenses.reduce((s, e) => s + e.amount, 0)
    const pendingCount = expenses.filter(e => e.status === 'submitted' || e.status === 'draft').length
    const overdueCount = expenses.filter(e => e.status === 'submitted').length
    const uniqueEmployees = new Set(expenses.map(e => e.employeeId)).size
    const avgPerEmployee = uniqueEmployees > 0 ? totalThisMonth / uniqueEmployees : 0
    const lastMonthTotal = 580000
    const savings = lastMonthTotal - totalThisMonth

    const budgetUsed = 72
    return { totalThisMonth, pendingCount, overdueCount, avgPerEmployee, savings, budgetUsed }
  }, [expenses])

  const monthlyTrend = useMemo(() => generateMonthlyTrend(), [])
  const categoryDist = useMemo(() => generateCategoryDistribution(expenses), [expenses])
  const budgetVsActual = useMemo(() => generateBudgetVsActual(generateMockBudgets()), [])
  const topSpenders = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => { map[e.employee] = (map[e.employee] || 0) + e.amount })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }))
  }, [expenses])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.totalThisMonth')}</span>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold">{formatRSDShort(kpiData.totalThisMonth)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.budgetUsed')}</span>
            <PiggyBank className="h-4 w-4 text-amber-500" />
          </div>
          <p className={`text-lg font-bold ${getBudgetAlertClass(kpiData.budgetUsed)}`}>{kpiData.budgetUsed}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.pendingApprovals')}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-600">{kpiData.pendingCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.overdueExpenses')}</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-lg font-bold text-red-600">{kpiData.overdueCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.avgPerEmployee')}</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold">{formatRSDShort(kpiData.avgPerEmployee)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.savingsVsLastMonth')}</span>
            {kpiData.savings >= 0 ? (
              <TrendingDown className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`text-lg font-bold ${kpiData.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatRSDShort(Math.abs(kpiData.savings))}
          </p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('expenses.monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('expenses.categoryDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {categoryDist.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            {t('expenses.budgetVsActual')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatRSD(value)} />
                <Legend />
                <Bar dataKey="budget" fill="#e2e8f0" name={t('expenses.budget')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#f59e0b" name={t('expenses.actual')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Spenders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('expenses.topSpenders')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">{t('expenses.employee')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.totalAmount')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.share')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSpenders.map((spender, i) => {
                const totalAll = topSpenders.reduce((s, sp) => s + sp.total, 0)
                const share = totalAll > 0 ? ((spender.total / totalAll) * 100).toFixed(1) : '0'
                return (
                  <TableRow key={spender.name}>
                    <TableCell className="text-xs font-medium">{i + 1}</TableCell>
                    <TableCell className="text-xs font-medium">{spender.name}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{formatRSD(spender.total)}</TableCell>
                    <TableCell className="text-xs text-right">{share}%</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== TAB 2: EXPENSES LIST ====================

function ExpensesTab() {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [empFilter, setEmpFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Expense | null>(null)
  const [form, setForm] = useState(EMPTY_EXPENSE_FORM)
  const [isEditing, setIsEditing] = useState(false)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/expenses')
      if (res.ok) {
        const data = await res.json()
        setExpenses(Array.isArray(data) ? data : generateMockExpenses())
      } else {
        setExpenses(generateMockExpenses())
      }
    } catch {
      setExpenses(generateMockExpenses())
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadExpenses() }, [loadExpenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (catFilter !== 'all' && e.category !== catFilter) return false
      if (empFilter !== 'all' && e.employeeId !== empFilter) return false
      if (dateFrom && e.date < dateFrom) return false
      if (dateTo && e.date > dateTo) return false
      return true
    })
  }, [expenses, search, statusFilter, catFilter, empFilter, dateFrom, dateTo])

  const handleCreate = () => {
    setForm(EMPTY_EXPENSE_FORM)
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      employeeId: expense.employeeId,
      paymentMethod: expense.paymentMethod,
      hasReceipt: expense.hasReceipt,
      notes: expense.notes || '',
      status: expense.status,
    })
    setIsEditing(true)
    setSelected(expense)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (isEditing && selected) {
      setExpenses(prev => prev.map(e =>
        e.id === selected.id ? { ...e, ...form } : e
      ))
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...form,
        employee: getEmployeeName(form.employeeId),
        createdAt: new Date().toISOString(),
      }
      setExpenses(prev => [newExpense, ...prev])
    }
    setDialogOpen(false)
    setForm(EMPTY_EXPENSE_FORM)
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setExpenses(prev => prev.map(e =>
      e.id === id ? { ...e, status: newStatus } : e
    ))
  }

  const handleBulkApprove = () => {
    setExpenses(prev => prev.map(e =>
      selectedIds.has(e.id) && e.status === 'submitted' ? { ...e, status: 'approved' } : e
    ))
    setSelectedIds(new Set())
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Datum', 'Zaposleni', 'Kategorija', 'Opis', 'Iznos', 'Nacin placanja', 'Status', 'Racun']
    const rows = filteredExpenses.map(e => [
      e.date, e.employee, CATEGORY_LABELS[e.category] || e.category,
      e.description, e.amount.toString(), PAYMENT_METHODS[e.paymentMethod] || e.paymentMethod,
      STATUS_CONFIG[e.status]?.label || e.status, e.hasReceipt ? 'Da' : 'Ne',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `troskovi_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const submittableCount = filteredExpenses.filter(e => e.status === 'submitted').length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('expenses.searchPlaceholder')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('expenses.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenses.allStatuses')}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('expenses.allCategories')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenses.allCategories')}</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={empFilter} onValueChange={setEmpFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('expenses.allEmployees')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenses.allEmployees')}</SelectItem>
                {EMPLOYEES.map(e => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-[160px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder={t('expenses.dateFrom')} />
            <Input type="date" className="w-[160px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder={t('expenses.dateTo')} />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" /> {t('expenses.newExpense')}
        </Button>
        {selectedIds.size > 0 && (
          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300" onClick={handleBulkApprove}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {t('expenses.bulkApprove')} ({selectedIds.size})
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" /> {t('expenses.exportCSV')}
        </Button>
        <div className="ml-auto text-sm text-muted-foreground self-center">
          {filteredExpenses.length} {t('expenses.itemsFound')}
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('expenses.noExpenses')}</p>
            <Button variant="outline" className="mt-3" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" /> {t('expenses.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-10">
                    <Checkbox checked={selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0} onCheckedChange={handleToggleAll} />
                  </TableHead>
                  <TableHead className="text-xs">{t('expenses.date')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.employee')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.category')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.description')}</TableHead>
                  <TableHead className="text-xs text-right">{t('expenses.amount')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.paymentMethod')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.status')}</TableHead>
                  <TableHead className="text-xs text-center">{t('expenses.receipt')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map(e => {
                  const cfg = STATUS_CONFIG[e.status]
                  return (
                    <TableRow key={e.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(e.id)} onCheckedChange={() => handleToggleSelect(e.id)} />
                      </TableCell>
                      <TableCell className="text-xs">{e.date}</TableCell>
                      <TableCell className="text-xs font-medium">{e.employee}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[e.category] || e.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{e.description}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{formatRSD(e.amount)}</TableCell>
                      <TableCell className="text-xs">{PAYMENT_METHODS[e.paymentMethod] || e.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {e.hasReceipt ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(e); setDetailOpen(true) }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(e)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          {e.status === 'submitted' && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleStatusChange(e.id, 'approved')}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Form */}
      {dialogOpen && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{isEditing ? t('expenses.editExpense') : t('expenses.newExpense')}<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent className="max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.description')} *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('expenses.descriptionPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.category')}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.amount')} (RSD)</Label>
                <Input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.employee')}</Label>
                <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYEES.map(e => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.paymentMethod')}</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHODS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.date')}</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.hasReceipt} onCheckedChange={(v) => setForm({ ...form, hasReceipt: v })} />
              <Label className="text-xs">{t('expenses.hasReceipt')}</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('expenses.cancel')}</Button>
            <Button onClick={handleSave}>
              <Plus className="h-4 w-4 mr-1" /> {isEditing ? t('expenses.save') : t('expenses.create')}
            </Button>
          </div>
        </CardContent>
      </Card>)}

      {/* Detail View */}
      {detailOpen && selected && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{t('expenses.expenseDetails')}<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('expenses.description')}:</span>
                  <p className="font-medium">{selected.description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.status')}:</span>
                  <Badge variant="outline" className={STATUS_CONFIG[selected.status]?.color}>{STATUS_CONFIG[selected.status]?.label}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.category')}:</span>
                  <p>{CATEGORY_LABELS[selected.category] || selected.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.amount')}:</span>
                  <p className="font-bold">{formatRSD(selected.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.employee')}:</span>
                  <p>{selected.employee}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.paymentMethod')}:</span>
                  <p>{PAYMENT_METHODS[selected.paymentMethod] || selected.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.date')}:</span>
                  <p>{selected.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.receipt')}:</span>
                  <p>{selected.hasReceipt ? 'Da' : 'Ne'}</p>
                </div>
              </div>
              {selected.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('expenses.notes')}:</span>
                  <p className="mt-1">{selected.notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleEdit(selected) }}>
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> {t('expenses.edit')}
                </Button>
                {selected.status === 'submitted' && (
                  <Button size="sm" className="text-emerald-600" onClick={() => { handleStatusChange(selected.id, 'approved'); setDetailOpen(false) }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t('expenses.approve')}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => { handleDelete(selected.id); setDetailOpen(false) }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> {t('expenses.delete')}
                </Button>
              </div>
            </div>
          </CardContent>
      </Card>)}
    </div>
  )
}

// ==================== TAB 3: EXPENSE REPORTS ====================

function ReportsTab() {
  const { t } = useTranslation()
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)
  const [form, setForm] = useState(EMPTY_REPORT_FORM)
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/expenses')
        if (res.ok) {
          const data = await res.json()
          setExpenses(Array.isArray(data) ? data : generateMockExpenses())
        } else {
          setExpenses(generateMockExpenses())
        }
      } catch {
        setExpenses(generateMockExpenses())
      }
      setReports(generateMockReports())
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = () => {
    const newReport: ExpenseReport = {
      id: `rep-${Date.now()}`,
      title: form.title,
      employee: getEmployeeName(form.employeeId),
      employeeId: form.employeeId,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      status: 'draft',
      totalAmount: 0,
      expenseCount: 0,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }
    setReports(prev => [newReport, ...prev])
    setDialogOpen(false)
    setForm(EMPTY_REPORT_FORM)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setReports(prev => prev.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    ))
  }

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const getReportExpenses = (reportId: string) => {
    return expenses.filter(e => e.reportId === reportId)
  }

  const handlePrint = (report: ExpenseReport) => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> {t('expenses.newReport')}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t('expenses.noReports')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => {
            const cfg = STATUS_CONFIG[report.status]
            const pct = getPercentUsed(report.totalAmount, 200000)
            return (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">{report.title}</h3>
                    <p className="text-xs text-muted-foreground">{report.employee}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || report.status}</Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('expenses.period')}</span>
                    <span>{report.dateFrom} - {report.dateTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('expenses.expenseCount')}</span>
                    <span>{report.expenseCount}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{t('expenses.totalAmount')}</span>
                    <span>{formatRSD(report.totalAmount)}</span>
                  </div>
                  <div className="pt-1">
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>{t('expenses.budgetUsed')}</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => { setSelectedReport(report); setDetailOpen(true) }}>
                    <Eye className="h-3 w-3 mr-1" /> {t('expenses.view')}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handlePrint(report)}>
                    <Printer className="h-3 w-3" />
                  </Button>
                  {report.status === 'draft' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-600" onClick={() => handleStatusChange(report.id, 'submitted')}>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                  {report.status === 'submitted' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => handleStatusChange(report.id, 'manager_review')}>
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDelete(report.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Report Form */}
      {dialogOpen && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{t('expenses.newReport')}<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.reportTitle')} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('expenses.reportTitlePlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.employee')}</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map(e => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.dateFrom')}</Label>
                <Input type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.dateTo')}</Label>
                <Input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('expenses.cancel')}</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('expenses.create')}</Button>
          </div>
        </CardContent>
      </Card>)}

      {/* Report Detail View */}
      {detailOpen && selectedReport && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="flex items-center gap-2"><span>{selectedReport.title}</span>{selectedReport && (<Badge variant="outline" className={STATUS_CONFIG[selectedReport.status]?.color}>{STATUS_CONFIG[selectedReport.status]?.label}</Badge>)}</div><Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent className="max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('expenses.employee')}:</span>
                  <p className="font-medium">{selectedReport.employee}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.period')}:</span>
                  <p>{selectedReport.dateFrom} - {selectedReport.dateTo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.totalAmount')}:</span>
                  <p className="font-bold text-lg">{formatRSD(selectedReport.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expenses.expenseCount')}:</span>
                  <p>{selectedReport.expenseCount}</p>
                </div>
              </div>
              {selectedReport.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('expenses.notes')}:</span>
                  <p className="mt-1">{selectedReport.notes}</p>
                </div>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground">{t('expenses.reportExpenses')}</div>
              {getReportExpenses(selectedReport.id).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('expenses.noExpensesInReport')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('expenses.date')}</TableHead>
                      <TableHead className="text-xs">{t('expenses.description')}</TableHead>
                      <TableHead className="text-xs text-right">{t('expenses.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getReportExpenses(selectedReport.id).map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{e.date}</TableCell>
                        <TableCell className="text-xs">{e.description}</TableCell>
                        <TableCell className="text-xs text-right">{formatRSD(e.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex gap-2">
                {selectedReport.status === 'draft' && (
                  <Button size="sm" onClick={() => { handleStatusChange(selectedReport.id, 'submitted'); setDetailOpen(false) }}>
                    <ArrowRight className="h-3.5 w-3.5 mr-1" /> {t('expenses.submit')}
                  </Button>
                )}
                {selectedReport.status === 'manager_review' && (
                  <Button size="sm" className="text-emerald-600" onClick={() => { handleStatusChange(selectedReport.id, 'approved'); setDetailOpen(false) }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t('expenses.approve')}
                  </Button>
                )}
                {selectedReport.status === 'approved' && (
                  <Button size="sm" className="text-emerald-600" onClick={() => { handleStatusChange(selectedReport.id, 'paid'); setDetailOpen(false) }}>
                    <Wallet className="h-3.5 w-3.5 mr-1" /> {t('expenses.markPaid')}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handlePrint(selectedReport)}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> {t('expenses.print')}
                </Button>
              </div>
            </div>
          )}
          </CardContent>
      </Card>)}
    </div>
  )
}

// ==================== TAB 4: BUDGETS ====================

function BudgetsTab() {
  const { t } = useTranslation()
  const [budgets, setBudgets] = useState<Budget[]>(generateMockBudgets())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_BUDGET_FORM)

  const handleCreate = () => {
    const newBudget: Budget = {
      id: `bud-${Date.now()}`,
      ...form,
      spentAmount: 0,
    }
    setBudgets(prev => [...prev, newBudget])
    setDialogOpen(false)
    setForm(EMPTY_BUDGET_FORM)
  }

  const budgetVsActual = useMemo(() => generateBudgetVsActual(budgets), [budgets])

  const alerts = useMemo(() => {
    return budgets.filter(b => {
      const pct = getPercentUsed(b.spentAmount, b.allocatedAmount)
      return pct >= 80
    }).map(b => ({
      id: b.id,
      name: b.name,
      pct: getPercentUsed(b.spentAmount, b.allocatedAmount),
      spent: b.spentAmount,
      allocated: b.allocatedAmount,
    }))
  }, [budgets])

  return (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <Card className="p-4 border-amber-300 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">{t('expenses.budgetAlerts')}</span>
          </div>
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs">
                <span className="text-amber-700">{a.name}</span>
                <span className={`font-semibold ${getBudgetAlertClass(a.pct)}`}>{a.pct}% ({formatRSDShort(a.spent)} / {formatRSDShort(a.allocated)})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Budget */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { setForm(EMPTY_BUDGET_FORM); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> {t('expenses.newBudget')}
        </Button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => {
          const pct = getPercentUsed(budget.spentAmount, budget.allocatedAmount)
          const remaining = budget.allocatedAmount - budget.spentAmount
          return (
            <Card key={budget.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{budget.name}</h3>
                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[budget.category] || budget.category}</p>
                </div>
                {pct >= 100 ? (
                  <Badge className="bg-red-100 text-red-700 text-xs">{t('expenses.overBudget')}</Badge>
                ) : pct >= 80 ? (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">{t('expenses.warning')}</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{t('expenses.onTrack')}</Badge>
                )}
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('expenses.allocated')}</span>
                  <span className="font-medium">{formatRSD(budget.allocatedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('expenses.spent')}</span>
                  <span className="font-medium">{formatRSD(budget.spentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('expenses.remaining')}</span>
                  <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatRSD(remaining)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('expenses.period')}</span>
                  <span>{budget.period === 'monthly' ? t('expenses.monthly') : budget.period === 'quarterly' ? t('expenses.quarterly') : t('expenses.annually')}</span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>{t('expenses.used')}</span>
                    <span className={getBudgetAlertClass(pct)}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Budget vs Actual Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            {t('expenses.budgetVsActual')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatRSD(value)} />
                <Legend />
                <Bar dataKey="budget" fill="#e2e8f0" name={t('expenses.budget')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#10b981" name={t('expenses.actual')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Create Budget Form */}
      {dialogOpen && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{t('expenses.newBudget')}<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.budgetName')} *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('expenses.budgetNamePlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.category')}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.allocatedAmount')} (RSD)</Label>
                <Input type="number" value={form.allocatedAmount || ''} onChange={(e) => setForm({ ...form, allocatedAmount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.period')}</Label>
                <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t('expenses.monthly')}</SelectItem>
                    <SelectItem value="quarterly">{t('expenses.quarterly')}</SelectItem>
                    <SelectItem value="annually">{t('expenses.annually')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.startDate')}</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('expenses.cancel')}</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('expenses.create')}</Button>
          </div>
        </CardContent>
      </Card>)}
    </div>
  )
}

// ==================== TAB 5: POLICIES ====================

function PoliciesTab() {
  const { t } = useTranslation()
  const [policies, setPolicies] = useState<Policy[]>(generateMockPolicies())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_POLICY_FORM)

  const handleCreate = () => {
    const newPolicy: Policy = {
      id: `pol-${Date.now()}`,
      ...form,
    }
    setPolicies(prev => [...prev, newPolicy])
    setDialogOpen(false)
    setForm(EMPTY_POLICY_FORM)
  }

  const handleToggleActive = (id: string) => {
    setPolicies(prev => prev.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const handleDelete = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id))
  }

  const violations = useMemo(() => {
    return [
      { id: 'v-1', expense: 'Laptop za novog zaposlenog', amount: 125000, policy: 'Kancelarijski limit', limit: 50000, date: '2025-01-20' },
      { id: 'v-2', expense: 'Putovanje Beograd-Nis', amount: 28900, policy: 'Putni limit - prethodno odobrenje', limit: 0, date: '2025-01-14' },
    ]
  }, [])

  const compliance = useMemo(() => {
    const totalPolicies = policies.length
    const activePolicies = policies.filter(p => p.isActive).length
    return {
      total: totalPolicies,
      active: activePolicies,
      inactive: totalPolicies - activePolicies,
      violations: violations.length,
      complianceRate: totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0,
    }
  }, [policies, violations])

  return (
    <div className="space-y-6">
      {/* Compliance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.totalPolicies')}</span>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold">{compliance.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.activePolicies')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{compliance.active}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.violations')}</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{compliance.violations}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('expenses.complianceRate')}</span>
            <Settings className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600">{compliance.complianceRate}%</p>
        </Card>
      </div>

      {/* Violations Alert */}
      {violations.length > 0 && (
        <Card className="p-4 border-red-300 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">{t('expenses.policyViolations')}</span>
          </div>
          <div className="space-y-2">
            {violations.map(v => (
              <div key={v.id} className="flex items-center justify-between text-xs bg-white rounded p-2 border border-red-200">
                <div>
                  <span className="font-medium">{v.expense}</span>
                  <span className="text-muted-foreground ml-2">({v.date})</span>
                </div>
                <Badge className="bg-red-100 text-red-700 text-xs">{v.policy}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Policies */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { setForm(EMPTY_POLICY_FORM); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> {t('expenses.newPolicy')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('expenses.policyName')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.category')}</TableHead>
                  <TableHead className="text-xs text-right">{t('expenses.maxAmount')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.frequency')}</TableHead>
                  <TableHead className="text-xs text-right">{t('expenses.approvalThreshold')}</TableHead>
                  <TableHead className="text-xs text-center">{t('expenses.status')}</TableHead>
                  <TableHead className="text-xs">{t('expenses.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map(policy => (
                  <TableRow key={policy.id} className={!policy.isActive ? 'opacity-50' : ''}>
                    <TableCell className="text-xs font-medium">{policy.name}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[policy.category] || policy.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(policy.maxAmount)}</TableCell>
                    <TableCell className="text-xs">
                      {policy.frequency === 'daily' ? t('expenses.daily') : policy.frequency === 'weekly' ? t('expenses.weekly') : policy.frequency === 'monthly' ? t('expenses.monthly') : t('expenses.quarterly')}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {policy.approvalThreshold === 0 ? t('expenses.allRequireApproval') : formatRSD(policy.approvalThreshold)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={policy.isActive} onCheckedChange={() => handleToggleActive(policy.id)} />
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(policy.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Policy Form */}
      {dialogOpen && (<Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{t('expenses.newPolicy')}<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('expenses.policyName')} *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('expenses.policyNamePlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.category')}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.frequency')}</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('expenses.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('expenses.weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('expenses.monthly')}</SelectItem>
                    <SelectItem value="quarterly">{t('expenses.quarterly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.maxAmount')} (RSD)</Label>
                <Input type="number" value={form.maxAmount || ''} onChange={(e) => setForm({ ...form, maxAmount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('expenses.approvalThreshold')} (RSD)</Label>
                <Input type="number" value={form.approvalThreshold || ''} onChange={(e) => setForm({ ...form, approvalThreshold: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="text-xs">{t('expenses.active')}</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('expenses.cancel')}</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('expenses.create')}</Button>
          </div>
        </CardContent>
      </Card>)}
    </div>
  )
}

// ==================== TAB 6: ANALYTICS ====================

function AnalyticsTab() {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/expenses')
        if (res.ok) {
          const data = await res.json()
          setExpenses(Array.isArray(data) ? data : generateMockExpenses())
        } else {
          setExpenses(generateMockExpenses())
        }
      } catch {
        setExpenses(generateMockExpenses())
      }
      setLoading(false)
    }
    load()
  }, [])

  const monthlyTrend = useMemo(() => generateMonthlyTrend(), [])
  const categoryDist = useMemo(() => generateCategoryDistribution(expenses), [expenses])
  const deptComparison = useMemo(() => generateDeptComparison(), [])
  const dayOfWeekData = useMemo(() => generateDayOfWeekData(), [])

  const paymentDist = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => { map[e.paymentMethod] = (map[e.paymentMethod] || 0) + e.amount })
    return Object.entries(map).map(([key, value]) => ({
      name: PAYMENT_METHODS[key] || key,
      value: Math.round(value),
    }))
  }, [expenses])

  const savings = useMemo(() => [
    { category: 'Putovanja', current: 41300, potential: 28000, saving: 13300 },
    { category: 'Kancelarija', current: 66500, potential: 55000, saving: 11500 },
    { category: 'Komunalije', current: 38200, potential: 32000, saving: 6200 },
    { category: 'Marketing', current: 127000, potential: 115000, saving: 12000 },
  ], [])

  const avgProcessing = useMemo(() => '3.2 dana', [])
  const yoyComparison = useMemo(() => [
    { metric: 'Ukupno', lastYear: 3450000, thisYear: 3580000 },
    { metric: 'Prosek/mesec', lastYear: 287500, thisYear: 298333 },
    { metric: 'Po zaposlenom', lastYear: 57500, thisYear: 59667 },
  ], [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Department Comparison + Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('expenses.deptComparison')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="dept" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('expenses.paymentDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {paymentDist.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Monthly Trend + Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('expenses.monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('expenses.expenseByDayOfWeek')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">{t('expenses.avgProcessingTime')}</span>
          </div>
          <p className="text-3xl font-bold">{avgProcessing}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('expenses.submissionToPayment')}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold">{t('expenses.totalPotentialSavings')}</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{formatRSDShort(savings.reduce((s, x) => s + x.saving, 0))}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('expenses.perMonth')}</p>
        </Card>
      </div>

      {/* Savings Opportunities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            {t('expenses.savingsOpportunities')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('expenses.category')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.currentSpend')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.potentialSpend')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.savings')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.savingsPercent')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.map(s => {
                const pct = s.current > 0 ? Math.round((s.saving / s.current) * 100) : 0
                return (
                  <TableRow key={s.category}>
                    <TableCell className="text-xs font-medium">{s.category}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(s.current)}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(s.potential)}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-emerald-600">{formatRSD(s.saving)}</TableCell>
                    <TableCell className="text-xs text-right">
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">{pct}%</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* YoY Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('expenses.yoyComparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('expenses.metric')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.lastYear')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.thisYear')}</TableHead>
                <TableHead className="text-xs text-right">{t('expenses.change')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yoyComparison.map(y => {
                const change = y.lastYear > 0 ? (((y.thisYear - y.lastYear) / y.lastYear) * 100).toFixed(1) : '0'
                const isUp = y.thisYear > y.lastYear
                return (
                  <TableRow key={y.metric}>
                    <TableCell className="text-xs font-medium">{y.metric}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(y.lastYear)}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(y.thisYear)}</TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={`flex items-center justify-end gap-1 ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : ''}{change}%
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
