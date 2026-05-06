'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { formatRSD, formatRSDShort } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
  CreditCard, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
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

import { generateMockPlans, generateMockSubscriptions, generateMockPayments, generateMockCoupons, generateMrrTrend, generateSubGrowth, generateChurnTrend, generateConversionFunnel, PregledTab, PretplateTab, PlanoviTab, PlacanjaTab, KuponiTab, AnalitikaTab } from './components'

export function Pretplate() {
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


// ==================== TAB 2: PRETPLATE ====================


// ==================== TAB 3: PLANOVI ====================


// ==================== TAB 4: PLACANJA ====================


// ==================== TAB 5: KUPONI ====================


// ==================== TAB 6: ANALITIKA ====================

