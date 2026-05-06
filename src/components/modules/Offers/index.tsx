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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  FileText, Plus, Search, Eye, Trash2, Edit3, RefreshCw, CheckCircle2,
  Clock, ArrowRight, BarChart3, DollarSign, TrendingUp, AlertCircle, Send,
  X, Copy, Printer, FileBarChart, BookTemplate, History, Percent,
  Calculator, Users, Package,
} from 'lucide-react'

// ==================== TYPES ====================

interface SalesOrder {
  id: string
  number: string
  partnerId?: string
  partnerName?: string
  status: string
  totalAmount: number
  dateOrder: string
  validUntil?: string
  notes?: string
  createdAt: string
}

interface LineItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  lineTotal: number
}

interface DashboardData {
  totalOrders: number
  draftOrders: number
  sentOrders: number
  confirmedOrders: number
  totalAmount: number
  avgAmount: number
  recentOrders: SalesOrder[]
  statusBreakdown: Array<{ status: string; count: number }>
  monthlyTrend: Array<{ month: string; count: number }>
  topPartners: Array<{ partnerName: string; totalValue: number }>
}

interface PriceList {
  id: string
  name: string
  description: string
  type: string
  margin: number
  rounding: number
  isActive: boolean
  createdAt: string
}

interface OfferTemplate {
  id: string
  name: string
  description: string
  lineItems: Omit<LineItem, 'id'>[]
  paymentTerms: string
  defaultNotes: string
  defaultDiscount: number
  useCount: number
  createdAt: string
}

interface AuditEntry {
  id: string
  orderId: string
  orderNumber: string
  userName: string
  timestamp: string
  oldStatus: string
  newStatus: string
  description: string
}

interface Product {
  id: string
  name: string
  price: number
  category?: string
}

interface Partner {
  id: string
  name: string
}

type PaymentTerms = 'cod' | '15days' | '30days' | '60days' | 'advance'

// ==================== CONSTANTS ====================

const STATUS_CONFIG: Record<string, { labelKey: string; color: string; icon: typeof Clock }> = {
  draft: { labelKey: 'offers.statusDraft', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Edit3 },
  sent: { labelKey: 'offers.statusSent', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Send },
  confirmed: { labelKey: 'offers.statusAccepted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { labelKey: 'offers.statusRejected', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
  cancelled: { labelKey: 'offers.statusCancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
}

const PAYMENT_TERMS_OPTIONS: Array<{ value: PaymentTerms; label: string }> = [
  { value: 'cod', label: 'offers.paymentCOD' },
  { value: '15days', label: 'offers.payment15Days' },
  { value: '30days', label: 'offers.payment30Days' },
  { value: '60days', label: 'offers.payment60Days' },
  { value: 'advance', label: 'offers.paymentAdvance' },
]

const PRICE_LIST_TYPES = [
  { value: 'standard', label: 'offers.priceListStandard' },
  { value: 'wholesale', label: 'offers.priceListWholesale' },
  { value: 'retail', label: 'offers.priceListRetail' },
  { value: 'promo', label: 'offers.priceListPromo' },
  { value: 'custom', label: 'offers.priceListCustom' },
]

const FUNNEL_COLORS = ['#94a3b8', '#f59e0b', '#10b981', '#ef4444']
const PIE_COLORS = ['#94a3b8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

// ==================== MOCK DATA GENERATORS ====================




// ==================== HELPER FUNCTIONS ====================






// ==================== MAIN COMPONENT ====================

import { generateMockPriceLists, generateMockTemplates, generateMockAuditLog, calcLineTotal, generateId, getMonthLabel, getStatusLabelKey, getStatusColor, generateMonthlyTrend, generateTopPartners } from './components'

import { updateLineItem, openCreateDialog, handleCreate, handleUpdateStatus, handleDelete, handleSavePriceList, openEditPriceList, handleSaveTemplate, updateTemplateLineItem, renderOverview, renderAnalytics } from './components'
import { PonudeContent } from './components'

export function Ponude() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Local state for price lists, templates, audit
  const [priceLists, setPriceLists] = useState<PriceList[]>(() => generateMockPriceLists())
  const [templates, setTemplates] = useState<OfferTemplate[]>(() => generateMockTemplates())
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => generateMockAuditLog())

  // Filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // UI states
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null)

  // Offer form state
  const emptyLineItem = (): LineItem => ({
    id: generateId(), productId: '', productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 20, lineTotal: 0,
  })

  const emptyForm = {
    partnerId: '', dateOrder: new Date().toISOString().split('T')[0],
    validUntil: '', paymentTerms: '30days' as PaymentTerms,
    globalDiscount: 0, notes: '', lineItems: [emptyLineItem()],
  }

  const [form, setForm] = useState(emptyForm)

  // Price list dialog
  const [priceListDialogOpen, setPriceListDialogOpen] = useState(false)
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null)
  const [plForm, setPlForm] = useState({ name: '', description: '', type: 'standard', margin: 0, rounding: 0, isActive: true })

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<OfferTemplate | null>(null)
  const [tplForm, setTplForm] = useState({
    name: '', description: '', lineItems: [emptyLineItem()],
    paymentTerms: '30days' as PaymentTerms, defaultNotes: '', defaultDiscount: 0,
  })

  // Audit filter
  const [auditUserFilter, setAuditUserFilter] = useState('all')
  const [auditDateFrom, setAuditDateFrom] = useState('')
  const [auditDateTo, setAuditDateTo] = useState('')

  // ==================== DATA LOADING ====================

  return (
    <PonudeContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboard={dashboard}
      setDashboard={setDashboard}
      orders={orders}
      setOrders={setOrders}
      partners={partners}
      setPartners={setPartners}
      products={products}
      setProducts={setProducts}
      priceLists={priceLists}
      setPriceLists={setPriceLists}
      templates={templates}
      setTemplates={setTemplates}
      auditLog={auditLog}
      setAuditLog={setAuditLog}
      search={search}
      setSearch={setSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      loading={loading}
      setLoading={setLoading}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      detailOpen={detailOpen}
      setDetailOpen={setDetailOpen}
      selectedOrder={selectedOrder}
      setSelectedOrder={setSelectedOrder}
      editingOrder={editingOrder}
      setEditingOrder={setEditingOrder}
      form={form}
      setForm={setForm}
      priceListDialogOpen={priceListDialogOpen}
      setPriceListDialogOpen={setPriceListDialogOpen}
      editingPriceList={editingPriceList}
      setEditingPriceList={setEditingPriceList}
      plForm={plForm}
      setPlForm={setPlForm}
      templateDialogOpen={templateDialogOpen}
      setTemplateDialogOpen={setTemplateDialogOpen}
      templatePreviewOpen={templatePreviewOpen}
      setTemplatePreviewOpen={setTemplatePreviewOpen}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      tplForm={tplForm}
      setTplForm={setTplForm}
      auditUserFilter={auditUserFilter}
      setAuditUserFilter={setAuditUserFilter}
      auditDateFrom={auditDateFrom}
      setAuditDateFrom={setAuditDateFrom}
      auditDateTo={auditDateTo}
      setAuditDateTo={setAuditDateTo}
      emptyLineItem={emptyLineItem}
      emptyForm={emptyForm}
    />
  )
}

// ==================== MOCK DATA HELPERS ====================


