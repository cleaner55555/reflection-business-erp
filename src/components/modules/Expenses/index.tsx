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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
  Shield, Settings,
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










// ==================== HELPER FUNCTIONS ====================




// ==================== MAIN COMPONENT ====================

import { generateMockExpenses, generateMockReports, generateMockBudgets, generateMockPolicies, generateMonthlyTrend, generateCategoryDistribution, generateBudgetVsActual, generateDayOfWeekData, generateDeptComparison, getEmployeeName, getPercentUsed, getBudgetAlertClass, OverviewDashboard, ExpensesTab, ReportsTab, BudgetsTab, PoliciesTab, AnalyticsTab } from './components'

export function Troškovi() {
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


// ==================== TAB 2: EXPENSES LIST ====================


// ==================== TAB 3: EXPENSE REPORTS ====================


// ==================== TAB 4: BUDGETS ====================


// ==================== TAB 5: POLICIES ====================


// ==================== TAB 6: ANALYTICS ====================

