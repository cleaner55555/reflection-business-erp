'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { formatRSD, formatRSDShort } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  CreditCard, Plus, Search, Eye, Trash2, Edit3, RefreshCw, ArrowLeft,
  CheckCircle2, Clock, BarChart3, DollarSign, TrendingUp,
  TrendingDown, AlertCircle, Users, Calendar, Tag, Gift,
  Percent, Crown, Zap, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

// ==================== TYPES ====================

interface Subscription {
  id: string
  customer: string
  planId: string
  planName: string
  startDate: string
  renewalDate: string
  amount: number
  status: 'active' | 'trial' | 'paused' | 'cancelled' | 'expired'
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  trialDays: number
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  features: string[]
  subscriberCount: number
  isActive: boolean
  trialPeriod: number
  setupFee: number
}

interface Payment {
  id: string
  date: string
  customer: string
  subscriptionId: string
  subscriptionName: string
  amount: number
  method: 'card' | 'bank' | 'stripe' | 'paypal'
  status: 'paid' | 'pending' | 'failed' | 'refunded'
}

interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  usedCount: number
  validFrom: string
  validTo: string
  status: 'active' | 'inactive' | 'expired'
  usageLog: Array<{ date: string; customer: string; subscription: string }>
}

// ==================== CONSTANTS ====================

const SUB_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  trial: { label: 'Probni period', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  paused: { label: 'Pauzirana', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Otkazana', color: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Istekla', color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Kartica',
  bank: 'Bankovni transfer',
  stripe: 'Stripe',
  paypal: 'PayPal',
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: 'Plaćeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Neuspešno', color: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refundirano', color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Mesečno',
  quarterly: 'Kvartalno',
  annually: 'Godišnje',
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b']

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4']

// ==================== MOCK DATA ====================

function generateMockPlans(): Plan[] {
  return [
    { id: 'plan-1', name: 'Starter', description: 'Osnovni paket za male timove', price: 2900, billingCycle: 'monthly', features: ['5 korisnika', '10 GB skladište', 'Email podrška', 'Osnovne izveštaje'], subscriberCount: 3, isActive: true, trialPeriod: 7, setupFee: 0 },
    { id: 'plan-2', name: 'Professional', description: 'Napredni paket za rastuće kompanije', price: 7900, billingCycle: 'monthly', features: ['25 korisnika', '100 GB skladište', 'Prioritetna podrška', 'Napredni izveštaji', 'API pristup', 'Automatizacije'], subscriberCount: 4, isActive: true, trialPeriod: 14, setupFee: 5000 },
    { id: 'plan-3', name: 'Enterprise', description: 'Kompletno rešenje za velike organizacije', price: 19900, billingCycle: 'monthly', features: ['Neograničeno korisnika', '1 TB skladište', '24/7 podrška', 'Prilagođeni izveštaji', 'API pristup', 'Automatizacije', 'SSO integracija', 'Dedikovani menadžer'], subscriberCount: 2, isActive: true, trialPeriod: 30, setupFee: 15000 },
    { id: 'plan-4', name: 'Business', description: 'Paket za srednje firme', price: 12900, billingCycle: 'quarterly', features: ['50 korisnika', '250 GB skladište', 'Prioritetna podrška', 'Izveštaji', 'API pristup'], subscriberCount: 2, isActive: true, trialPeriod: 14, setupFee: 8000 },
    { id: 'plan-5', name: 'Legacy', description: 'Stari paket - više nije dostupan', price: 1900, billingCycle: 'monthly', features: ['3 korisnika', '5 GB skladište', 'Email podrška'], subscriberCount: 1, isActive: false, trialPeriod: 0, setupFee: 0 },
  ]
}

function generateMockSubscriptions(): Subscription[] {
  return [
    { id: 'sub-1', customer: 'Jovan Petrović - JP Doo', planId: 'plan-3', planName: 'Enterprise', startDate: '2024-06-15', renewalDate: '2025-06-15', amount: 19900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-2', customer: 'Ana Marković - AM Solutions', planId: 'plan-2', planName: 'Professional', startDate: '2024-09-01', renewalDate: '2025-09-01', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-3', customer: 'Nikola Stanković - NS Tech', planId: 'plan-1', planName: 'Starter', startDate: '2025-01-10', renewalDate: '2025-02-10', amount: 2900, status: 'trial', billingCycle: 'monthly', trialDays: 7 },
    { id: 'sub-4', customer: 'Milena Jovanović - MJ Consulting', planId: 'plan-2', planName: 'Professional', startDate: '2024-03-20', renewalDate: '2025-03-20', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-5', customer: 'Marko Nikolić - MN Doo', planId: 'plan-3', planName: 'Enterprise', startDate: '2024-11-01', renewalDate: '2025-11-01', amount: 19900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-6', customer: 'Jelena Đorđević - JD Studio', planId: 'plan-1', planName: 'Starter', startDate: '2024-07-01', renewalDate: '2025-07-01', amount: 2900, status: 'paused', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-7', customer: 'Stefan Ilić - SI Group', planId: 'plan-4', planName: 'Business', startDate: '2024-08-15', renewalDate: '2025-05-15', amount: 12900, status: 'active', billingCycle: 'quarterly', trialDays: 0 },
    { id: 'sub-8', customer: 'Ivana Vasić - IV Marketing', planId: 'plan-2', planName: 'Professional', startDate: '2024-12-01', renewalDate: '2025-12-01', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-9', customer: 'Darko Todorović - DT Systems', planId: 'plan-5', planName: 'Legacy', startDate: '2023-01-01', renewalDate: '2024-01-01', amount: 1900, status: 'expired', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-10', customer: 'Sanja Milosavljević - SM Design', planId: 'plan-1', planName: 'Starter', startDate: '2024-10-15', renewalDate: '2025-04-15', amount: 2900, status: 'cancelled', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-11', customer: 'Branislav Kostić - BK Finance', planId: 'plan-4', planName: 'Business', startDate: '2025-01-01', renewalDate: '2025-04-01', amount: 12900, status: 'active', billingCycle: 'quarterly', trialDays: 0 },
    { id: 'sub-12', customer: 'Dragana Radovanović - DR Legal', planId: 'plan-2', planName: 'Professional', startDate: '2025-01-05', renewalDate: '2025-01-19', amount: 7900, status: 'trial', billingCycle: 'monthly', trialDays: 14 },
  ]
}

function generateMockPayments(): Payment[] {
  return [
    { id: 'pay-1', date: '2025-01-15', customer: 'Jovan Petrović - JP Doo', subscriptionId: 'sub-1', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-2', date: '2025-01-15', customer: 'Ana Marković - AM Solutions', subscriptionId: 'sub-2', subscriptionName: 'Professional', amount: 7900, method: 'stripe', status: 'paid' },
    { id: 'pay-3', date: '2025-01-14', customer: 'Milena Jovanović - MJ Consulting', subscriptionId: 'sub-4', subscriptionName: 'Professional', amount: 7900, method: 'bank', status: 'paid' },
    { id: 'pay-4', date: '2025-01-13', customer: 'Marko Nikolić - MN Doo', subscriptionId: 'sub-5', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-5', date: '2025-01-12', customer: 'Nikola Stanković - NS Tech', subscriptionId: 'sub-3', subscriptionName: 'Starter', amount: 0, method: 'stripe', status: 'pending' },
    { id: 'pay-6', date: '2025-01-12', customer: 'Ivana Vasić - IV Marketing', subscriptionId: 'sub-8', subscriptionName: 'Professional', amount: 7900, method: 'paypal', status: 'paid' },
    { id: 'pay-7', date: '2025-01-11', customer: 'Stefan Ilić - SI Group', subscriptionId: 'sub-7', subscriptionName: 'Business', amount: 38700, method: 'bank', status: 'paid' },
    { id: 'pay-8', date: '2025-01-10', customer: 'Dragana Radovanović - DR Legal', subscriptionId: 'sub-12', subscriptionName: 'Professional', amount: 0, method: 'card', status: 'pending' },
    { id: 'pay-9', date: '2025-01-08', customer: 'Branislav Kostić - BK Finance', subscriptionId: 'sub-11', subscriptionName: 'Business', amount: 38700, method: 'bank', status: 'failed' },
    { id: 'pay-10', date: '2024-12-15', customer: 'Jovan Petrović - JP Doo', subscriptionId: 'sub-1', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-11', date: '2024-12-15', customer: 'Ana Marković - AM Solutions', subscriptionId: 'sub-2', subscriptionName: 'Professional', amount: 7900, method: 'stripe', status: 'refunded' },
    { id: 'pay-12', date: '2024-12-14', customer: 'Milena Jovanović - MJ Consulting', subscriptionId: 'sub-4', subscriptionName: 'Professional', amount: 7900, method: 'bank', status: 'paid' },
    { id: 'pay-13', date: '2024-12-10', customer: 'Ivana Vasić - IV Marketing', subscriptionId: 'sub-8', subscriptionName: 'Professional', amount: 7900, method: 'paypal', status: 'paid' },
    { id: 'pay-14', date: '2024-11-15', customer: 'Jovan Petrović - JP Doo', subscriptionId: 'sub-1', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-15', date: '2024-11-01', customer: 'Sanja Milosavljević - SM Design', subscriptionId: 'sub-10', subscriptionName: 'Starter', amount: 2900, method: 'stripe', status: 'refunded' },
  ]
}

function generateMockCoupons(): Coupon[] {
  return [
    { id: 'coup-1', code: 'WELCOME2025', discountType: 'percentage', discountValue: 20, maxUses: 100, usedCount: 34, validFrom: '2025-01-01', validTo: '2025-03-31', status: 'active', usageLog: [{ date: '2025-01-15', customer: 'Nikola Stanković', subscription: 'Starter' }, { date: '2025-01-14', customer: 'Dragana Radovanović', subscription: 'Professional' }] },
    { id: 'coup-2', code: 'STARTER50', discountType: 'fixed', discountValue: 1500, maxUses: 50, usedCount: 50, validFrom: '2024-10-01', validTo: '2024-12-31', status: 'expired', usageLog: [{ date: '2024-12-30', customer: 'Sanja Milosavljević', subscription: 'Starter' }] },
    { id: 'coup-3', code: 'ANNUAL30', discountType: 'percentage', discountValue: 30, maxUses: 200, usedCount: 12, validFrom: '2025-01-01', validTo: '2025-12-31', status: 'active', usageLog: [{ date: '2025-01-12', customer: 'Stefan Ilić', subscription: 'Business' }] },
    { id: 'coup-4', code: 'REFER10', discountType: 'percentage', discountValue: 10, maxUses: 500, usedCount: 87, validFrom: '2024-06-01', validTo: '2025-06-30', status: 'active', usageLog: [{ date: '2025-01-10', customer: 'Branislav Kostić', subscription: 'Business' }] },
    { id: 'coup-5', code: 'UPGRADE25', discountType: 'percentage', discountValue: 25, maxUses: 0, usedCount: 5, validFrom: '2025-01-01', validTo: '2025-06-30', status: 'active', usageLog: [] },
    { id: 'coup-6', code: 'SUMMER2024', discountType: 'fixed', discountValue: 3000, maxUses: 100, usedCount: 67, validFrom: '2024-06-01', validTo: '2024-08-31', status: 'expired', usageLog: [] },
    { id: 'coup-7', code: 'VIPACCESS', discountType: 'percentage', discountValue: 50, maxUses: 10, usedCount: 3, validFrom: '2025-01-15', validTo: '2025-02-15', status: 'active', usageLog: [{ date: '2025-01-15', customer: 'Ivana Vasić', subscription: 'Professional' }] },
    { id: 'coup-8', code: 'BETA2024', discountType: 'percentage', discountValue: 100, maxUses: 20, usedCount: 20, validFrom: '2024-01-01', validTo: '2024-06-30', status: 'inactive', usageLog: [] },
  ]
}

function generateMrrTrend() {
  return [
    { month: 'Avg', mrr: 58500 },
    { month: 'Sep', mrr: 61400 },
    { month: 'Okt', mrr: 67200 },
    { month: 'Nov', mrr: 78600 },
    { month: 'Dec', mrr: 74200 },
    { month: 'Jan', mrr: 82200 },
  ]
}

function generateSubGrowth() {
  return [
    { month: 'Avg', count: 5 },
    { month: 'Sep', count: 7 },
    { month: 'Okt', count: 8 },
    { month: 'Nov', count: 10 },
    { month: 'Dec', count: 11 },
    { month: 'Jan', count: 12 },
  ]
}

function generateChurnTrend() {
  return [
    { month: 'Avg', rate: 3.2 },
    { month: 'Sep', rate: 2.8 },
    { month: 'Okt', rate: 4.1 },
    { month: 'Nov', rate: 2.5 },
    { month: 'Dec', rate: 3.8 },
    { month: 'Jan', rate: 2.1 },
  ]
}

function generateConversionFunnel() {
  return [
    { stage: 'Probni period', count: 18, fill: '#06b6d4' },
    { stage: 'Plaćeno', count: 14, fill: '#f59e0b' },
    { stage: 'Obnovljeno', count: 10, fill: '#10b981' },
  ]
}

// ==================== EMPTY FORMS ====================

const EMPTY_SUB_FORM = {
  customer: '',
  planId: 'plan-1',
  billingCycle: 'monthly' as const,
  trialDays: 0,
  amount: 0,
  startDate: new Date().toISOString().split('T')[0],
}

const EMPTY_PLAN_FORM = {
  name: '',
  description: '',
  price: 0,
  billingCycle: 'monthly' as const,
  trialPeriod: 0,
  setupFee: 0,
  features: '',
}

const EMPTY_COUPON_FORM = {
  code: '',
  discountType: 'percentage' as const,
  discountValue: 0,
  maxUses: 100,
  validFrom: new Date().toISOString().split('T')[0],
  validTo: '',
}

// ==================== MAIN COMPONENT ====================

export function Subscriptions() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('pregled')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('subscriptions.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subscriptions.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab)}>
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="pretplate" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.subscriptions')}</span>
          </TabsTrigger>
          <TabsTrigger value="planovi" className="gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.plans')}</span>
          </TabsTrigger>
          <TabsTrigger value="placanja" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.payments')}</span>
          </TabsTrigger>
          <TabsTrigger value="kuponi" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.coupons')}</span>
          </TabsTrigger>
          <TabsTrigger value="analitika" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('subscriptions.analytics')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pregled"><PregledTab /></TabsContent>
        <TabsContent value="pretplate"><PretplateTab /></TabsContent>
        <TabsContent value="planovi"><PlanoviTab /></TabsContent>
        <TabsContent value="placanja"><PlacanjaTab /></TabsContent>
        <TabsContent value="kuponi"><KuponiTab /></TabsContent>
        <TabsContent value="analitika"><AnalitikaTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== TAB 1: PREGLED ====================

function PregledTab() {
  const { t } = useTranslation()
  const { activeCompanyId } = useAppStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const payments = useMemo(() => generateMockPayments(), [])
  const plans = useMemo(() => generateMockPlans(), [])

  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/subscriptions?companyId=${activeCompanyId}&limit=100`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) setSubscriptions(data.items)
        else setSubscriptions(generateMockSubscriptions())
      })
      .catch(() => setSubscriptions(generateMockSubscriptions()))
  }, [activeCompanyId])

  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions])
  const trialSubs = useMemo(() => subscriptions.filter(s => s.status === 'trial'), [subscriptions])
  const monthlyRevenue = useMemo(() => activeSubs.reduce((sum, s) => sum + s.amount, 0), [activeSubs])
  const avgValue = useMemo(() => activeSubs.length > 0 ? monthlyRevenue / activeSubs.length : 0, [activeSubs, monthlyRevenue])
  const churnRate = useMemo(() => {
    const cancelled = subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length
    return subscriptions.length > 0 ? ((cancelled / subscriptions.length) * 100) : 0
  }, [subscriptions])
  const newThisMonth = useMemo(() => trialSubs.length, [trialSubs])
  const renewalsDue = useMemo(() => {
    const now = new Date()
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return activeSubs.filter(s => {
      const renewal = new Date(s.renewalDate)
      return renewal <= next30
    }).length
  }, [activeSubs])

  const statusPieData = useMemo(() => {
    const map: Record<string, number> = {}
    subscriptions.forEach(s => { map[s.status] = (map[s.status] || 0) + 1 })
    return Object.entries(map).map(([key, value]) => ({
      name: SUB_STATUS_CONFIG[key]?.label || key,
      value,
    }))
  }, [subscriptions])

  const topPlans = useMemo(() => {
    const map: Record<string, number> = {}
    subscriptions.forEach(s => { map[s.planName] = (map[s.planName] || 0) + 1 })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }))
  }, [subscriptions])

  const upcomingRenewals = useMemo(() => {
    return activeSubs
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
      .slice(0, 5)
  }, [activeSubs])

  const mrrTrend = useMemo(() => generateMrrTrend(), [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.activeSubs')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{activeSubs.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.monthlyRevenue')}</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold">{formatRSDShort(monthlyRevenue)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.churnRate')}</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{churnRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.avgValue')}</span>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold">{formatRSDShort(avgValue)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.newThisMonth')}</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-sky-600">{newThisMonth}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.renewalsDue')}</span>
            <Calendar className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-xl font-bold text-violet-600">{renewalsDue}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('subscriptions.mrrTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mrrTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('subscriptions.statusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {statusPieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {statusPieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t('subscriptions.topPlans')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPlans.map(plan => {
              const pct = subscriptions.length > 0 ? (plan.count / subscriptions.length) * 100 : 0
              return (
                <div key={plan.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-muted-foreground">{plan.count} {t('subscriptions.subscribers')}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('subscriptions.upcomingRenewals')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingRenewals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('common.noData')}</p>
              ) : (
                upcomingRenewals.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{sub.customer}</div>
                      <div className="text-xs text-muted-foreground">{sub.planName} · {CYCLE_LABELS[sub.billingCycle]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatRSD(sub.amount)}</div>
                      <div className="text-xs text-muted-foreground">{sub.renewalDate}</div>
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

// ==================== TAB 2: PRETPLATE ====================

function PretplateTab() {
  const { t } = useTranslation()
  const { activeCompanyId } = useAppStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [selected, setSelected] = useState<Subscription | null>(null)
  const [form, setForm] = useState(EMPTY_SUB_FORM)
  const payments = useMemo(() => generateMockPayments(), [])

  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/subscriptions?companyId=${activeCompanyId}&limit=100`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) {
          setSubscriptions(data.items)
        } else {
          setSubscriptions(generateMockSubscriptions())
        }
      })
      .catch(() => setSubscriptions(generateMockSubscriptions()))
    setPlans(generateMockPlans())
  }, [activeCompanyId])

  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      if (search && !s.customer.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (planFilter !== 'all' && s.planId !== planFilter) return false
      return true
    })
  }, [subscriptions, search, statusFilter, planFilter])

  const handleCreate = () => {
    const plan = plans.find(p => p.id === form.planId)
    if (!plan || !activeCompanyId) return
    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: activeCompanyId,
        customer: form.customer,
        planId: form.planId,
        planName: plan.name,
        startDate: form.startDate,
        renewalDate: form.startDate,
        amount: form.amount || plan.price,
        status: form.trialDays > 0 ? 'trial' : 'active',
        billingCycle: form.billingCycle,
        trialDays: form.trialDays,
      }),
    }).then(res => {
      if (res.ok) return res.json()
    }).then(newSub => {
      if (newSub) setSubscriptions(prev => [newSub, ...prev])
    })
    setSubTab('pregled')
    setForm(EMPTY_SUB_FORM)
  }

  const handleAdvanceStatus = (sub: Subscription) => {
    const nextStatus: Record<string, Subscription['status']> = {
      trial: 'active',
      active: 'paused',
      paused: 'active',
      cancelled: 'active',
      expired: 'active',
    }
    const newStatus = nextStatus[sub.status]
    if (newStatus) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s))
    }
  }

  const handleDelete = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  const handleViewDetail = (sub: Subscription) => {
    setSelected(sub)
    setSubTab('detalji')
  }

  const subPayments = useMemo(() => {
    if (!selected) return []
    return payments.filter(p => p.subscriptionId === selected.id)
  }, [selected, payments])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('subscriptions.searchSubs')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('subscriptions.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('subscriptions.allStatuses')}</SelectItem>
              {Object.entries(SUB_STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('subscriptions.allPlans')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('subscriptions.allPlans')}</SelectItem>
              {plans.filter(p => p.isActive).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Sub-tabs: Pregled / Dodaj / Detalji */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as typeof subTab)} className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="pregled" className="text-xs gap-1"><Eye className="h-3 w-3" /> Pregled</TabsTrigger>
          <TabsTrigger value="dodaj" className="text-xs gap-1"><Plus className="h-3 w-3" /> Dodaj</TabsTrigger>
          <TabsTrigger value="detalji" className="text-xs gap-1" disabled={!selected}><CreditCard className="h-3 w-3" /> Detalji</TabsTrigger>
        </TabsList>

        {/* Sub-tab: Pregled */}
        <TabsContent value="pregled" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setForm(EMPTY_SUB_FORM); setSubTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('subscriptions.newSubscription')}
            </Button>
            <div className="ml-auto text-sm text-muted-foreground self-center">
              {filtered.length} {t('subscriptions.itemsFound')}
            </div>
          </div>

          <Card>
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">{t('subscriptions.noSubscriptions')}</p>
                <Button variant="outline" className="mt-3" onClick={() => { setForm(EMPTY_SUB_FORM); setSubTab('dodaj') }}>
                  <Plus className="h-4 w-4 mr-1" /> {t('subscriptions.newSubscription')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('subscriptions.customer')}</TableHead>
                      <TableHead className="text-xs">{t('subscriptions.plan')}</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">{t('subscriptions.startDate')}</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">{t('subscriptions.renewalDate')}</TableHead>
                      <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                      <TableHead className="text-xs">{t('common.status')}</TableHead>
                      <TableHead className="text-xs">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(sub => {
                      const cfg = SUB_STATUS_CONFIG[sub.status]
                      return (
                        <TableRow key={sub.id} className="hover:bg-muted/30">
                          <TableCell className="text-xs font-medium">{sub.customer}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="secondary" className="text-xs">{sub.planName}</Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{sub.startDate}</TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">{sub.renewalDate}</TableCell>
                          <TableCell className="text-xs text-right font-semibold">{formatRSD(sub.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || sub.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleViewDetail(sub)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {sub.status !== 'cancelled' && sub.status !== 'expired' && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAdvanceStatus(sub)}>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(sub.id)}>
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
        </TabsContent>

        {/* Sub-tab: Dodaj (Create Form) */}
        <TabsContent value="dodaj">
          <Card className="max-w-lg">
            <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('subscriptions.newSubscription')}</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('subscriptions.customer')} *</Label>
                <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder={t('subscriptions.customerPlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('subscriptions.plan')}</Label>
                <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.isActive).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} - {formatRSD(p.price)}/{CYCLE_LABELS[p.billingCycle]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.billingCycle')}</Label>
                  <Select value={form.billingCycle} onValueChange={(v) => setForm({ ...form, billingCycle: v as 'monthly' | 'quarterly' | 'annually' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('subscriptions.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('subscriptions.quarterly')}</SelectItem>
                      <SelectItem value="annually">{t('subscriptions.annually')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.trialDays')}</Label>
                  <Input type="number" min={0} value={form.trialDays || ''} onChange={(e) => setForm({ ...form, trialDays: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('common.amount')} (RSD)</Label>
                  <Input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder={t('subscriptions.amountPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.startDate')}</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSubTab('pregled')}>{t('common.cancel')}</Button>
                <Button onClick={handleCreate} disabled={!form.customer}>
                  <Plus className="h-4 w-4 mr-1" /> {t('subscriptions.createSubscription')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-tab: Detalji (Detail View) */}
        <TabsContent value="detalji">
          {selected && (
            <Card className="max-w-lg">
              <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('subscriptions.subscriptionDetails')}</CardTitle></div></CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.customer')}</p>
                    <p className="text-sm font-medium">{selected.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.plan')}</p>
                    <p className="text-sm font-medium">{selected.planName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('common.amount')}</p>
                    <p className="text-sm font-bold">{formatRSD(selected.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('common.status')}</p>
                    <Badge variant="outline" className={`text-xs ${SUB_STATUS_CONFIG[selected.status]?.color || ''}`}>
                      {SUB_STATUS_CONFIG[selected.status]?.label || selected.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.startDate')}</p>
                    <p className="text-sm">{selected.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.renewalDate')}</p>
                    <p className="text-sm">{selected.renewalDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.billingCycle')}</p>
                    <p className="text-sm">{CYCLE_LABELS[selected.billingCycle]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('subscriptions.trialDays')}</p>
                    <p className="text-sm">{selected.trialDays}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t('subscriptions.paymentHistory')}
                  </h4>
                  {subPayments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">{t('subscriptions.noPayments')}</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('common.date')}</TableHead>
                          <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                          <TableHead className="text-xs">{t('subscriptions.method')}</TableHead>
                          <TableHead className="text-xs">{t('common.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subPayments.map(p => {
                          const pCfg = PAYMENT_STATUS_CONFIG[p.status]
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="text-xs">{p.date}</TableCell>
                              <TableCell className="text-xs text-right font-semibold">{formatRSD(p.amount)}</TableCell>
                              <TableCell className="text-xs">{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${pCfg?.color || ''}`}>{pCfg?.label || p.status}</Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== TAB 3: PLANOVI ====================

function PlanoviTab() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_PLAN_FORM)

  useEffect(() => { setPlans(generateMockPlans()) }, [])

  const handleCreate = () => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: form.name,
      description: form.description,
      price: form.price,
      billingCycle: form.billingCycle,
      features: form.features.split('\n').filter(f => f.trim()),
      subscriberCount: 0,
      isActive: true,
      trialPeriod: form.trialPeriod,
      setupFee: form.setupFee,
    }
    setPlans(prev => [...prev, newPlan])
    setSubTab('pregled')
    setForm(EMPTY_PLAN_FORM)
    setIsEditing(false)
  }

  const handleEdit = (plan: Plan) => {
    setForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      trialPeriod: plan.trialPeriod,
      setupFee: plan.setupFee,
      features: plan.features.join('\n'),
    })
    setEditingId(plan.id)
    setIsEditing(true)
    setSubTab('dodaj')
  }

  const handleSave = () => {
    if (isEditing && editingId) {
      setPlans(prev => prev.map(p => p.id === editingId ? {
        ...p,
        name: form.name,
        description: form.description,
        price: form.price,
        billingCycle: form.billingCycle,
        features: form.features.split('\n').filter(f => f.trim()),
        trialPeriod: form.trialPeriod,
        setupFee: form.setupFee,
      } : p))
    } else {
      handleCreate()
      return
    }
    setSubTab('pregled')
    setForm(EMPTY_PLAN_FORM)
    setIsEditing(false)
    setEditingId(null)
  }

  const handleToggleActive = (planId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, isActive: !p.isActive } : p))
  }

  const handleDelete = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Pregled / Dodaj */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as typeof subTab)} className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="pregled" className="text-xs gap-1"><Crown className="h-3 w-3" /> Pregled</TabsTrigger>
          <TabsTrigger value="dodaj" className="text-xs gap-1"><Plus className="h-3 w-3" /> Dodaj</TabsTrigger>
        </TabsList>

        {/* Sub-tab: Pregled */}
        <TabsContent value="pregled" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setForm(EMPTY_PLAN_FORM); setIsEditing(false); setSubTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('subscriptions.newPlan')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}>
                {plan.isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      <Zap className="h-3 w-3 mr-1" /> {t('common.active')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    {plan.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-2xl font-bold">{formatRSD(plan.price)}</span>
                    <span className="text-sm text-muted-foreground">/{CYCLE_LABELS[plan.billingCycle]?.toLowerCase()}</span>
                  </div>

                  {plan.setupFee > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {t('subscriptions.setupFee')}: {formatRSD(plan.setupFee)}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-semibold">{t('subscriptions.features')}</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-xs flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('subscriptions.subscribers')}: <strong className="text-foreground">{plan.subscriberCount}</strong></span>
                    {plan.trialPeriod > 0 && (
                      <span>{t('subscriptions.trial')}: <strong className="text-foreground">{plan.trialPeriod}d</strong></span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={plan.isActive} onCheckedChange={() => handleToggleActive(plan.id)} />
                      <span className="text-xs">{plan.isActive ? t('common.active') : t('common.inactive')}</span>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(plan)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sub-tab: Dodaj (Create/Edit Plan Form) */}
        <TabsContent value="dodaj">
          <Card className="max-w-lg">
            <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{isEditing ? t('subscriptions.editPlan') : t('subscriptions.newPlan')}</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.name')} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.description')}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('common.price')} (RSD)</Label>
                  <Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.billingCycle')}</Label>
                  <Select value={form.billingCycle} onValueChange={(v) => setForm({ ...form, billingCycle: v as 'monthly' | 'quarterly' | 'annually' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('subscriptions.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('subscriptions.quarterly')}</SelectItem>
                      <SelectItem value="annually">{t('subscriptions.annually')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.trialPeriod')} ({t('subscriptions.days')})</Label>
                  <Input type="number" min={0} value={form.trialPeriod || ''} onChange={(e) => setForm({ ...form, trialPeriod: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.setupFee')} (RSD)</Label>
                  <Input type="number" min={0} value={form.setupFee || ''} onChange={(e) => setForm({ ...form, setupFee: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('subscriptions.features')} ({t('subscriptions.onePerLine')})</Label>
                <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={5} placeholder={t('subscriptions.featuresPlaceholder')} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSubTab('pregled')}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} disabled={!form.name}>
                  {isEditing ? t('common.save') : t('subscriptions.createPlan')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== TAB 4: PLACANJA ====================

function PlacanjaTab() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<Payment[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => { setPayments(generateMockPayments()) }, [])

  const filtered = useMemo(() => {
    return payments.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (dateFrom && p.date < dateFrom) return false
      if (dateTo && p.date > dateTo) return false
      return true
    })
  }, [payments, statusFilter, dateFrom, dateTo])

  const totalPaid = useMemo(() => filtered.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0), [filtered])
  const totalPending = useMemo(() => filtered.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0), [filtered])
  const totalFailed = useMemo(() => filtered.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0), [filtered])

  const handleRefund = (paymentId: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' as const } : p))
  }

  const handleRetry = (paymentId: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'pending' as const } : p))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">{t('subscriptions.paid')}</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">{formatRSD(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">{t('common.pending')}</span>
          </div>
          <p className="text-lg font-bold text-amber-600">{formatRSD(totalPending)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">{t('subscriptions.failed')}</span>
          </div>
          <p className="text-lg font-bold text-red-600">{formatRSD(totalFailed)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('subscriptions.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('subscriptions.allStatuses')}</SelectItem>
              {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" className="w-[160px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" className="w-[160px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <div className="ml-auto text-sm text-muted-foreground self-center">
            {filtered.length} {t('subscriptions.paymentsFound')}
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t('subscriptions.noPayments')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('subscriptions.customer')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('subscriptions.subscription')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">{t('subscriptions.method')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const cfg = PAYMENT_STATUS_CONFIG[p.status]
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs">{p.date}</TableCell>
                      <TableCell className="text-xs font-medium">{p.customer}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{p.subscriptionName}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{formatRSD(p.amount)}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">{PAYMENT_METHOD_LABELS[p.method]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.status === 'paid' && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => handleRefund(p.id)} title={t('subscriptions.refund')}>
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {p.status === 'failed' && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleRetry(p.id)} title={t('subscriptions.retry')}>
                              <Zap className="h-3.5 w-3.5" />
                            </Button>
                          )}
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
    </div>
  )
}

// ==================== TAB 5: KUPONI ====================

function KuponiTab() {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_COUPON_FORM)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  useEffect(() => { setCoupons(generateMockCoupons()) }, [])

  const handleCreate = () => {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxUses: form.maxUses,
      usedCount: 0,
      validFrom: form.validFrom,
      validTo: form.validTo,
      status: 'active',
      usageLog: [],
    }
    setCoupons(prev => [...prev, newCoupon])
    setSubTab('pregled')
    setForm(EMPTY_COUPON_FORM)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (isEditing && editingId) {
      setCoupons(prev => prev.map(c => c.id === editingId ? {
        ...c,
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        maxUses: form.maxUses,
        validFrom: form.validFrom,
        validTo: form.validTo,
      } : c))
    } else {
      handleCreate()
      return
    }
    setSubTab('pregled')
    setForm(EMPTY_COUPON_FORM)
    setIsEditing(false)
    setEditingId(null)
  }

  const handleEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
    })
    setEditingId(coupon.id)
    setIsEditing(true)
    setSubTab('dodaj')
  }

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  const handleViewLog = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setSubTab('detalji')
  }

  const activeCoupons = coupons.filter(c => c.status === 'active').length

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Pregled / Dodaj / Detalji */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as typeof subTab)} className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="pregled" className="text-xs gap-1"><Tag className="h-3 w-3" /> Pregled</TabsTrigger>
          <TabsTrigger value="dodaj" className="text-xs gap-1"><Plus className="h-3 w-3" /> Dodaj</TabsTrigger>
          <TabsTrigger value="detalji" className="text-xs gap-1" disabled={!selectedCoupon}><Eye className="h-3 w-3" /> Detalji</TabsTrigger>
        </TabsList>

        {/* Sub-tab: Pregled */}
        <TabsContent value="pregled" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setForm(EMPTY_COUPON_FORM); setIsEditing(false); setSubTab('dodaj') }}>
              <Plus className="h-4 w-4 mr-1" /> {t('subscriptions.newCoupon')}
            </Button>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>{activeCoupons} {t('subscriptions.activeCoupons')}</span>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('subscriptions.code')}</TableHead>
                    <TableHead className="text-xs">{t('common.discount')}</TableHead>
                    <TableHead className="text-xs">{t('subscriptions.usage')}</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">{t('subscriptions.validPeriod')}</TableHead>
                    <TableHead className="text-xs">{t('common.status')}</TableHead>
                    <TableHead className="text-xs">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(coupon => {
                    const usagePct = coupon.maxUses > 0 ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100) : 0
                    return (
                      <TableRow key={coupon.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold">{coupon.code}</code>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {coupon.discountType === 'percentage' ? (
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              {coupon.discountValue}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {formatRSD(coupon.discountValue)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={usagePct} className="h-2" />
                            </div>
                            <span className="text-muted-foreground">
                              {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : '/∞'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell text-muted-foreground">
                          {coupon.validFrom} — {coupon.validTo}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${
                            coupon.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            coupon.status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {coupon.status === 'active' ? t('common.active') :
                             coupon.status === 'expired' ? t('subscriptions.expired') :
                             t('common.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleViewLog(coupon)} title={t('subscriptions.usageLog')}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(coupon)}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(coupon.id)}>
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
          </Card>
        </TabsContent>

        {/* Sub-tab: Dodaj (Create/Edit Coupon Form) */}
        <TabsContent value="dodaj">
          <Card className="max-w-lg">
            <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{isEditing ? t('subscriptions.editCoupon') : t('subscriptions.newCoupon')}</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('subscriptions.code')} *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder={t('subscriptions.codePlaceholder')} className="uppercase font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.discountType')}</Label>
                  <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as 'percentage' | 'fixed' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t('subscriptions.percentage')}</SelectItem>
                      <SelectItem value="fixed">{t('subscriptions.fixedAmount')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.discountValue')}</Label>
                  <Input type="number" min={0} value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('subscriptions.maxUses')} (0 = {t('subscriptions.unlimited')})</Label>
                <Input type="number" min={0} value={form.maxUses || ''} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.validFrom')}</Label>
                  <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('subscriptions.validTo')}</Label>
                  <Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSubTab('pregled')}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} disabled={!form.code}>
                  {isEditing ? t('common.save') : t('subscriptions.createCoupon')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-tab: Detalji (Usage Log View) */}
        <TabsContent value="detalji">
          {selectedCoupon && (
            <Card className="max-w-lg">
              <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('subscriptions.usageLog')} - {selectedCoupon.code}</CardTitle></div></CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">{t('common.discount')}</span>
                    <p className="font-semibold">
                      {selectedCoupon.discountType === 'percentage' ? `${selectedCoupon.discountValue}%` : formatRSD(selectedCoupon.discountValue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t('subscriptions.usage')}</span>
                    <p className="font-semibold">{selectedCoupon.usedCount}{selectedCoupon.maxUses > 0 ? `/${selectedCoupon.maxUses}` : '/∞'}</p>
                  </div>
                </div>
                <Separator />
                {selectedCoupon.usageLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t('subscriptions.noUsageYet')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('common.date')}</TableHead>
                        <TableHead className="text-xs">{t('subscriptions.customer')}</TableHead>
                        <TableHead className="text-xs">{t('subscriptions.subscription')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCoupon.usageLog.map((log, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs">{log.date}</TableCell>
                          <TableCell className="text-xs font-medium">{log.customer}</TableCell>
                          <TableCell className="text-xs">{log.subscription}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== TAB 6: ANALITIKA ====================

function AnalitikaTab() {
  const { t } = useTranslation()
  const { activeCompanyId } = useAppStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const plans = useMemo(() => generateMockPlans(), [])

  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/subscriptions?companyId=${activeCompanyId}&limit=100`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) setSubscriptions(data.items)
        else setSubscriptions(generateMockSubscriptions())
      })
      .catch(() => setSubscriptions(generateMockSubscriptions()))
  }, [activeCompanyId])

  const mrrTrend = useMemo(() => generateMrrTrend(), [])
  const subGrowth = useMemo(() => generateSubGrowth(), [])
  const churnTrend = useMemo(() => generateChurnTrend(), [])
  const conversionFunnel = useMemo(() => generateConversionFunnel(), [])

  const revenueByPlan = useMemo(() => {
    const map: Record<string, number> = {}
    subscriptions.filter(s => s.status === 'active').forEach(s => {
      map[s.planName] = (map[s.planName] || 0) + s.amount
    })
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }))
  }, [subscriptions])

  const totalMrr = useMemo(() => revenueByPlan.reduce((s, p) => s + p.revenue, 0), [revenueByPlan])
  const totalSubs = subscriptions.length
  const activeSubs = subscriptions.filter(s => s.status === 'active').length
  const avgMrr = totalSubs > 0 ? totalMrr / totalSubs : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.totalMrr')}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatRSDShort(totalMrr)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.totalSubscribers')}</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-sky-600">{totalSubs}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.activeRate')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold">{totalSubs > 0 ? `${((activeSubs / totalSubs) * 100).toFixed(1)}%` : '0%'}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('subscriptions.avgRevPerSub')}</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold">{formatRSDShort(avgMrr)}</p>
        </Card>
      </div>

      {/* MRR Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('subscriptions.mrrTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatRSD(value)} />
                <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={t('subscriptions.mrr')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('subscriptions.revenueByPlan')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatRSD(value)} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueByPlan.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscriber Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('subscriptions.subscriberGrowth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={subGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name={t('subscriptions.subscribers')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Rate Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {t('subscriptions.churnTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t('subscriptions.conversionFunnel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="stage" type="category" className="text-xs" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {conversionFunnel.map((stage, idx) => {
                if (idx === 0) return null
                const prev = conversionFunnel[idx - 1].count
                const rate = prev > 0 ? ((stage.count / prev) * 100).toFixed(1) : '0'
                return (
                  <div key={stage.stage} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    <span>{stage.stage}: {rate}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
