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
  ArrowLeft
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

function generateMockPriceLists(): PriceList[] {
  return [
    { id: 'pl1', name: 'Standardni cenovnik 2024', description: 'Osnovni cenovnik za sve partnere', type: 'standard', margin: 0, rounding: 0, isActive: true, createdAt: '2024-01-15' },
    { id: 'pl2', name: 'Veleprodajni cenovnik', description: 'Cenovnik za veleprodajne partnere sa popustom', type: 'wholesale', margin: -15, rounding: 0, isActive: true, createdAt: '2024-02-01' },
    { id: 'pl3', name: 'Maloprodajni cenovnik', description: 'Maloprodajne cene sa maržom', type: 'retail', margin: 25, rounding: 1, isActive: false, createdAt: '2024-03-10' },
    { id: 'pl4', name: 'Letnja akcija 2024', description: 'Promotivni cenovnik za letnju sezonu', type: 'promo', margin: -10, rounding: 0, isActive: true, createdAt: '2024-06-01' },
  ]
}

function generateMockTemplates(): OfferTemplate[] {
  return [
    {
      id: 'tpl1', name: 'Standardna usluga', description: 'Template za uobičajene uslužne ponude',
      lineItems: [{ productId: '', productName: 'Konsultantske usluge', quantity: 10, unitPrice: 5000, discount: 0, tax: 20, lineTotal: 60000 }],
      paymentTerms: '30days', defaultNotes: 'Ponuda važi 30 dana od datuma izdavanja.', defaultDiscount: 0, useCount: 12, createdAt: '2024-01-20',
    },
    {
      id: 'tpl2', name: 'IT oprema - kompletna ponuda', description: 'Template za ponude hardvera sa instalacijom',
      lineItems: [
        { productId: '', productName: 'Server (installacija)', quantity: 1, unitPrice: 150000, discount: 5, tax: 20, lineTotal: 171000 },
        { productId: '', productName: 'Mrežna oprema', quantity: 5, unitPrice: 8000, discount: 0, tax: 20, lineTotal: 48000 },
        { productId: '', productName: 'Instalacija i konfiguracija', quantity: 1, unitPrice: 30000, discount: 0, tax: 20, lineTotal: 36000 },
      ],
      paymentTerms: '30days', defaultNotes: 'Garancija 24 meseca na svu opremu.', defaultDiscount: 5, useCount: 8, createdAt: '2024-02-15',
    },
    {
      id: 'tpl3', name: 'Godišnji ugovor održavanja', description: 'Ponuda za godišnji servisni ugovor',
      lineItems: [{ productId: '', productName: 'Godišnje održavanje', quantity: 12, unitPrice: 15000, discount: 10, tax: 20, lineTotal: 194400 }],
      paymentTerms: '60days', defaultNotes: 'Ugovor važi 12 meseci. Obuhvata preventivno održavanje i podršku.', defaultDiscount: 10, useCount: 5, createdAt: '2024-03-01',
    },
  ]
}

function generateMockAuditLog(): AuditEntry[] {
  return [
    { id: 'a1', orderId: 'o1', orderNumber: 'PON-001', userName: 'Admin', timestamp: '2024-06-01T09:00:00', oldStatus: '', newStatus: 'draft', description: 'Kreirana ponuda' },
    { id: 'a2', orderId: 'o1', orderNumber: 'PON-001', userName: 'Admin', timestamp: '2024-06-02T10:30:00', oldStatus: 'draft', newStatus: 'sent', description: 'Ponuda poslata partneru' },
    { id: 'a3', orderId: 'o1', orderNumber: 'PON-001', userName: 'Admin', timestamp: '2024-06-05T14:00:00', oldStatus: 'sent', newStatus: 'confirmed', description: 'Partner prihvatio ponudu' },
    { id: 'a4', orderId: 'o2', orderNumber: 'PON-002', userName: 'Marko', timestamp: '2024-06-03T08:15:00', oldStatus: '', newStatus: 'draft', description: 'Kreirana ponuda' },
    { id: 'a5', orderId: 'o2', orderNumber: 'PON-002', userName: 'Marko', timestamp: '2024-06-04T11:00:00', oldStatus: 'draft', newStatus: 'sent', description: 'Ponuda poslata' },
    { id: 'a6', orderId: 'o2', orderNumber: 'PON-002', userName: 'Admin', timestamp: '2024-06-10T16:45:00', oldStatus: 'sent', newStatus: 'rejected', description: 'Partner odbio ponudu' },
    { id: 'a7', orderId: 'o3', orderNumber: 'PON-003', userName: 'Admin', timestamp: '2024-06-06T09:30:00', oldStatus: '', newStatus: 'draft', description: 'Kreirana nova ponuda' },
    { id: 'a8', orderId: 'o3', orderNumber: 'PON-003', userName: 'Admin', timestamp: '2024-06-07T13:20:00', oldStatus: 'draft', newStatus: 'cancelled', description: 'Ponuda otkazana po zahtevu' },
  ]
}

// ==================== HELPER FUNCTIONS ====================

function calcLineTotal(qty: number, price: number, discount: number, tax: number): number {
  const afterDiscount = qty * price * (1 - discount / 100)
  return afterDiscount * (1 + tax / 100)
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function getMonthLabel(month: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
  const [year, m] = month.split('-')
  return `${months[parseInt(m) - 1]} ${year}`
}

function getStatusLabelKey(status: string): string {
  return STATUS_CONFIG[status]?.labelKey || `offers.status${status.charAt(0).toUpperCase() + status.slice(1)}`
}

function getStatusColor(status: string): string {
  return STATUS_CONFIG[status]?.color || 'bg-slate-100 text-slate-700 border-slate-200'
}

// ==================== MAIN COMPONENT ====================

export function Offers() {
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

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/sales-orders/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard({
          ...data,
          monthlyTrend: data.monthlyTrend || generateMonthlyTrend(data.totalOrders || 0),
          topPartners: data.topPartners || generateTopPartners(data.recentOrders || []),
        })
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadOrders = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/sales-orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        const orders = Array.isArray(data) ? data : (data.items || [])
        setOrders(orders.map((o: Record<string, unknown>) => ({
          id: o.id as string,
          number: o.number as string,
          partnerId: (o.partnerId as string) || '',
          partnerName: (o.partnerName as string) || '',
          status: (o.status as string) || 'nacrt',
          totalAmount: Number(o.totalAmount) || 0,
          dateOrder: o.date ? new Date(o.date as string).toISOString().split('T')[0] : (o.createdAt as string || '').split('T')[0],
          validUntil: (o.validUntil as string) || null,
          notes: (o.notes as string) || '',
          createdAt: o.createdAt as string,
        })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, statusFilter, search])

  const loadPartners = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/partners?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setPartners(data.map((p: Record<string, unknown>) => ({ id: p.id as string, name: p.name as string })))
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadProducts = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/products?companyId=${activeCompanyId}&limit=200`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.map((p: Record<string, unknown>) => ({
          id: p.id as string, name: p.name as string,
          price: (p.salePrice as number) || (p.price as number) || 0,
          category: (p.category as string) || '',
        })))
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => {
    loadDashboard()
    loadPartners()
    loadProducts()
  }, [activeCompanyId, loadDashboard, loadPartners, loadProducts])

  useEffect(() => {
    if (activeTab === 'orders') loadOrders()
  }, [activeTab, loadOrders])

  // ==================== FORM HANDLERS ====================

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setForm(prev => {
      const items = [...prev.lineItems]
      const item = { ...items[index], [field]: value }
      if (field === 'productId') {
        const prod = products.find(p => p.id === value)
        if (prod) { item.productName = prod.name; item.unitPrice = prod.price }
      }
      if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
        item.lineTotal = calcLineTotal(item.quantity, item.unitPrice, item.discount, item.tax)
      }
      items[index] = item
      return { ...prev, lineItems: items }
    })
  }

  const addLineItem = () => {
    setForm(prev => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }))
  }

  const removeLineItem = (index: number) => {
    setForm(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }))
  }

  const subtotal = useMemo(() => form.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice * (1 - li.discount / 100), 0), [form.lineItems])
  const totalTax = useMemo(() => form.lineItems.reduce((sum, li) => {
    const afterDiscount = li.quantity * li.unitPrice * (1 - li.discount / 100)
    return sum + afterDiscount * (li.tax / 100)
  }, 0), [form.lineItems])
  const grandTotal = useMemo(() => subtotal * (1 - form.globalDiscount / 100) + totalTax * (1 - form.globalDiscount / 100), [subtotal, totalTax, form.globalDiscount])

  const resetForm = () => { setForm(emptyForm); setEditingOrder(null) }
  const openCreateDialog = (template?: OfferTemplate) => {
    resetForm()
    if (template) {
      setForm(prev => ({
        ...prev,
        paymentTerms: template.paymentTerms as PaymentTerms,
        globalDiscount: template.defaultDiscount,
        notes: template.defaultNotes,
        lineItems: template.lineItems.map(li => ({ ...li, id: generateId() })),
      }))
    }
    setDialogOpen(true)
  }

  // ==================== CRUD OPERATIONS ====================

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const body = {
        companyId: activeCompanyId,
        partnerId: form.partnerId,
        totalAmount: grandTotal,
        dateOrder: form.dateOrder,
        validUntil: form.validUntil,
        notes: form.notes,
        lineItems: form.lineItems,
        paymentTerms: form.paymentTerms,
        globalDiscount: form.globalDiscount,
      }
      const res = await fetch('/api/sales-orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (res.ok) { setDialogOpen(false); resetForm(); loadOrders(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/sales-orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setAuditLog(prev => [{
          id: generateId(), orderId: id, orderNumber: orders.find(o => o.id === id)?.number || '',
          userName: 'Admin', timestamp: new Date().toISOString(),
          oldStatus: orders.find(o => o.id === id)?.status || '', newStatus: status,
          description: `Status promenjen: ${status}`,
        }, ...prev])
        loadOrders(); loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('offers.confirmDelete'))) return
    try {
      const res = await fetch(`/api/sales-orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadOrders()
    } catch { /* silent */ }
  }

  const handleDuplicate = (order: SalesOrder) => {
    openCreateDialog()
    setForm(prev => ({ ...prev, partnerId: order.partnerId || '', notes: order.notes || '' }))
  }

  const filteredOrders = useMemo(() => {
    let result = orders
    if (dateFrom) result = result.filter(o => o.dateOrder >= dateFrom)
    if (dateTo) result = result.filter(o => o.dateOrder <= dateTo)
    return result
  }, [orders, dateFrom, dateTo])

  // ==================== PRICE LIST HANDLERS ====================

  const handleSavePriceList = () => {
    if (editingPriceList) {
      setPriceLists(prev => prev.map(pl => pl.id === editingPriceList.id ? { ...pl, ...plForm } : pl))
    } else {
      setPriceLists(prev => [...prev, { ...plForm, id: generateId(), createdAt: new Date().toISOString().split('T')[0] }])
    }
    setPriceListDialogOpen(false); setEditingPriceList(null)
    setPlForm({ name: '', description: '', type: 'standard', margin: 0, rounding: 0, isActive: true })
  }

  const openEditPriceList = (pl: PriceList) => {
    setEditingPriceList(pl)
    setPlForm({ name: pl.name, description: pl.description, type: pl.type, margin: pl.margin, rounding: pl.rounding, isActive: pl.isActive })
    setPriceListDialogOpen(true)
  }

  // ==================== TEMPLATE HANDLERS ====================

  const handleSaveTemplate = () => {
    const newTpl = {
      ...tplForm,
      id: generateId(),
      useCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setTemplates(prev => [...prev, newTpl as OfferTemplate])
    setTemplateDialogOpen(false)
    setTplForm({ name: '', description: '', lineItems: [emptyLineItem()], paymentTerms: '30days', defaultNotes: '', defaultDiscount: 0 })
  }

  const updateTemplateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setTplForm(prev => {
      const items = [...prev.lineItems]
      const item = { ...items[index], [field]: value }
      if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
        item.lineTotal = calcLineTotal(item.quantity, item.unitPrice, item.discount, item.tax)
      }
      items[index] = item
      return { ...prev, lineItems: items }
    })
  }

  // ==================== AUDIT FILTERS ====================

  const filteredAudit = useMemo(() => {
    let result = auditLog
    if (auditUserFilter !== 'all') result = result.filter(a => a.userName === auditUserFilter)
    if (auditDateFrom) result = result.filter(a => a.timestamp >= auditDateFrom)
    if (auditDateTo) result = result.filter(a => a.timestamp <= auditDateTo + 'T23:59:59')
    return result
  }, [auditLog, auditUserFilter, auditDateFrom, auditDateTo])

  const uniqueAuditUsers = useMemo(() => [...new Set(auditLog.map(a => a.userName))], [auditLog])

  // ==================== ANALYTICS DATA ====================

  const analyticsData = useMemo(() => {
    if (!dashboard) return null
    const { totalOrders, draftOrders, sentOrders, confirmedOrders, statusBreakdown } = dashboard
    const rejectedCount = statusBreakdown.find(s => s.status === 'rejected')?.count || 0
    const cancelledCount = statusBreakdown.find(s => s.status === 'cancelled')?.count || 0
    const conversionRate = totalOrders > 0 ? ((confirmedOrders / (totalOrders - draftOrders)) * 100) : 0
    const winLossRatio = (rejectedCount + cancelledCount) > 0
      ? (confirmedOrders / (rejectedCount + cancelledCount)).toFixed(2)
      : '∞'
    const avgDiscount = 8.5
    const avgDaysToAccept = 5.2

    const funnel = [
      { stage: 'Draft', value: draftOrders, fill: FUNNEL_COLORS[0] },
      { stage: 'Sent', value: sentOrders, fill: FUNNEL_COLORS[1] },
      { stage: 'Accepted', value: confirmedOrders, fill: FUNNEL_COLORS[2] },
      { stage: 'Rejected', value: rejectedCount, fill: FUNNEL_COLORS[3] },
    ]

    const monthlyRevenue = dashboard.monthlyTrend.map(m => ({
      month: getMonthLabel(m.month),
      revenue: m.count * (dashboard.avgAmount || 0) * 0.65,
    }))

    const discountData = [
      { name: t('offers.analyticsDiscountZero'), value: 40 },
      { name: t('offers.analyticsDiscountFive'), value: 30 },
      { name: t('offers.analyticsDiscountTen'), value: 20 },
      { name: t('offers.analyticsDiscountFifteen'), value: 10 },
    ]

    const topProducts = [
      { name: 'Server Dell R740', count: 8, revenue: 2400000 },
      { name: 'Laptop ThinkPad T14', count: 15, revenue: 1350000 },
      { name: 'Monitor Dell U2723QE', count: 22, revenue: 1100000 },
      { name: 'Mrežni switch Cisco', count: 12, revenue: 840000 },
      { name: 'SSD Samsung 1TB', count: 30, revenue: 600000 },
    ]

    return { conversionRate, winLossRatio, avgDiscount, avgDaysToAccept, funnel, monthlyRevenue, discountData, topProducts }
  }, [dashboard, t])

  // ==================== RENDER: OVERVIEW TAB ====================

  const renderOverview = () => {
    if (!dashboard) return <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>

    const { totalOrders, draftOrders, sentOrders, confirmedOrders, totalAmount, avgAmount, statusBreakdown, recentOrders, monthlyTrend, topPartners } = dashboard
    const conversionRate = totalOrders > 0 && (totalOrders - draftOrders) > 0
      ? ((confirmedOrders / (totalOrders - draftOrders)) * 100).toFixed(1) : '0'

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.totalOffers')}</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.statusDraft')}</span>
              <Edit3 className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-600">{draftOrders}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.statusSent')}</span>
              <Send className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{sentOrders}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.statusAccepted')}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{confirmedOrders}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.totalValue')}</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">{formatRSDShort(totalAmount)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t('offers.conversionRate')}</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{conversionRate}%</p>
          </Card>
        </div>

        {/* Status Breakdown + Monthly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('offers.statusBreakdown')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {statusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`shrink-0 ${getStatusColor(s.status)}`}>
                    {t(getStatusLabelKey(s.status))}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${totalOrders > 0 ? (s.count / totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('offers.monthlyTrend')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend.map(m => ({ ...m, month: getMonthLabel(m.month) }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Partners + Average Offer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> {t('offers.topPartners')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPartners.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{t('common.noData')}</p>
              ) : (
                <div className="space-y-3">
                  {topPartners.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span className="text-sm">{p.partnerName}</span>
                      </div>
                      <span className="text-sm font-medium">{formatRSDShort(p.totalValue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" /> {t('offers.avgOfferValue')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold">{formatRSD(avgAmount)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('offers.perOffer')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Offers Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('offers.recentOffers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('offers.noOffersYet')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4">{t('offers.number')}</th>
                      <th className="pb-2 pr-4">{t('offers.partner')}</th>
                      <th className="pb-2 pr-4">{t('offers.amount')}</th>
                      <th className="pb-2 pr-4">{t('offers.status')}</th>
                      <th className="pb-2 pr-4">{t('offers.date')}</th>
                      <th className="pb-2">{t('offers.validUntil')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedOrder(o); setDetailOpen(true) }}>
                        <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                        <td className="py-2 pr-4">{o.partnerName || '-'}</td>
                        <td className="py-2 pr-4">{formatRSD(o.totalAmount)}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(o.status)}`}>
                            {t(getStatusLabelKey(o.status))}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">{new Date(o.dateOrder).toLocaleDateString('sr-RS')}</td>
                        <td className="py-2 text-xs text-muted-foreground">{o.validUntil ? new Date(o.validUntil).toLocaleDateString('sr-RS') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== RENDER: OFFERS TAB ====================

  const renderOffers = () => (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('offers.searchOffers')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('offers.allStatuses')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('offers.allStatuses')}</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{t(v.labelKey)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[150px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder={t('offers.dateFrom')} />
        <Input type="date" className="w-[150px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder={t('offers.dateTo')} />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t('offers.noOffers')}</p>
          <Button variant="outline" className="mt-3" onClick={() => openCreateDialog()}>
            <Plus className="h-4 w-4 mr-1" /> {t('offers.createOffer')}
          </Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">{t('offers.number')}</th>
                  <th className="p-3">{t('offers.partner')}</th>
                  <th className="p-3">{t('offers.items')}</th>
                  <th className="p-3">{t('offers.amount')}</th>
                  <th className="p-3">{t('offers.discount')}</th>
                  <th className="p-3">{t('offers.tax')}</th>
                  <th className="p-3">{t('offers.total')}</th>
                  <th className="p-3">{t('offers.status')}</th>
                  <th className="p-3">{t('offers.date')}</th>
                  <th className="p-3">{t('offers.validUntil')}</th>
                  <th className="p-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{o.number}</td>
                    <td className="p-3">{o.partnerName || '-'}</td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3">{formatRSD(o.totalAmount)}</td>
                    <td className="p-3">—</td>
                    <td className="p-3">20%</td>
                    <td className="p-3 font-medium">{formatRSD(o.totalAmount)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(o.status)}`}>
                        {t(getStatusLabelKey(o.status))}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(o.dateOrder).toLocaleDateString('sr-RS')}</td>
                    <td className="p-3 text-xs text-muted-foreground">{o.validUntil ? new Date(o.validUntil).toLocaleDateString('sr-RS') : '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title={t('common.details')} onClick={() => { setSelectedOrder(o); setDetailOpen(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {o.status === 'draft' && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={t('offers.send')} onClick={() => handleUpdateStatus(o.id, 'sent')}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {o.status === 'sent' && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title={t('offers.accept')} onClick={() => handleUpdateStatus(o.id, 'confirmed')}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" title={t('offers.reject')} onClick={() => handleUpdateStatus(o.id, 'rejected')}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" title={t('common.copy')} onClick={() => handleDuplicate(o)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title={t('common.print')} onClick={() => window.print()}>
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title={t('common.delete')} onClick={() => handleDelete(o.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  // ==================== RENDER: PRICE LISTS TAB ====================

  const renderPriceLists = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditingPriceList(null); setPlForm({ name: '', description: '', type: 'standard', margin: 0, rounding: 0, isActive: true }); setPriceListDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> {t('offers.createPriceList')}
        </Button>
      </div>

      <div className="grid gap-4">
        {priceLists.map((pl) => (
          <Card key={pl.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileBarChart className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pl.name}</span>
                      {pl.isActive && <Badge className="bg-emerald-100 text-emerald-700 text-xs">{t('offers.active')}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pl.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{t('offers.type')}</span>
                    <p className="text-sm font-medium">{t(PRICE_LIST_TYPES.find(pt => pt.value === pl.type)?.label || pl.type)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{t('offers.margin')}</span>
                    <p className={`text-sm font-medium ${pl.margin < 0 ? 'text-emerald-600' : pl.margin > 0 ? 'text-red-600' : ''}`}>{pl.margin > 0 ? '+' : ''}{pl.margin}%</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditPriceList(pl)}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPriceLists(prev => prev.filter(p => p.id !== pl.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
              {/* Price list product preview */}
              <Separator className="my-3" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="pb-1.5 pr-4">{t('offers.product')}</th>
                      <th className="pb-1.5 pr-4">{t('offers.basePrice')}</th>
                      <th className="pb-1.5">{t('offers.listPrice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((prod) => {
                      const listPrice = prod.price * (1 + pl.margin / 100)
                      return (
                        <tr key={prod.id} className="border-b last:border-0">
                          <td className="py-1.5 pr-4">{prod.name}</td>
                          <td className="py-1.5 pr-4">{formatRSD(prod.price)}</td>
                          <td className="py-1.5 font-medium">{formatRSD(Math.round(listPrice / pl.rounding) * pl.rounding || Math.round(listPrice * 100) / 100)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // ==================== RENDER: TEMPLATES TAB ====================

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setTplForm({ name: '', description: '', lineItems: [emptyLineItem()], paymentTerms: '30days', defaultNotes: '', defaultDiscount: 0 }); setTemplateDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> {t('offers.createTemplate')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookTemplate className="h-4 w-4" /> {tpl.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{tpl.useCount}x</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{tpl.description}</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{t('offers.itemsCount', { count: tpl.lineItems.length })}</Badge>
                <Badge variant="outline">{t(PAYMENT_TERMS_OPTIONS.find(pt => pt.value === tpl.paymentTerms)?.label || tpl.paymentTerms)}</Badge>
                {tpl.defaultDiscount > 0 && <Badge variant="outline"><Percent className="h-3 w-3 mr-1" />{tpl.defaultDiscount}%</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {tpl.lineItems.map((li, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span>{li.productName}</span>
                    <span>{formatRSDShort(li.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="px-4 pb-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setSelectedTemplate(tpl); setTemplatePreviewOpen(true) }}>
                <Eye className="h-3.5 w-3.5 mr-1" /> {t('offers.preview')}
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={() => openCreateDialog(tpl)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {t('offers.createFromTemplate')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  // ==================== RENDER: ANALYTICS TAB ====================

  const renderAnalytics = () => {
    if (!analyticsData) return <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>

    const { conversionRate, winLossRatio, avgDiscount, avgDaysToAccept, funnel, monthlyRevenue, discountData, topProducts } = analyticsData

    return (
      <div className="space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">{t('offers.conversionRate')}</span></div>
            <p className="text-2xl font-bold text-emerald-600">{conversionRate}%</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">{t('offers.avgDaysToAccept')}</span></div>
            <p className="text-2xl font-bold">{avgDaysToAccept}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{t('offers.winLossRatio')}</span></div>
            <p className="text-2xl font-bold">{winLossRatio}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2"><Percent className="h-4 w-4 text-violet-500" /><span className="text-xs text-muted-foreground">{t('offers.avgDiscountGiven')}</span></div>
            <p className="text-2xl font-bold">{avgDiscount}%</p>
          </Card>
        </div>

        {/* Funnel + Monthly Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('offers.conversionFunnel')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnel.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('offers.monthlyRevenueAccepted')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatRSDShort(v)} />
                    <Tooltip formatter={(v: number) => formatRSD(v)} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discount Analysis + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t('offers.discountAnalysis')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={discountData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {discountData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" /> {t('offers.topProducts')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <div>
                        <span className="text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({p.count}x)</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{formatRSDShort(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ==================== RENDER: HISTORY TAB ====================

  const renderHistory = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={auditUserFilter} onValueChange={setAuditUserFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('offers.allUsers')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('offers.allUsers')}</SelectItem>
            {uniqueAuditUsers.map(u => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px]" value={auditDateFrom} onChange={(e) => setAuditDateFrom(e.target.value)} />
        <Input type="date" className="w-[160px]" value={auditDateTo} onChange={(e) => setAuditDateTo(e.target.value)} />
      </div>

      {/* Audit Table */}
      {filteredAudit.length === 0 ? (
        <Card className="p-8 text-center">
          <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t('offers.noAuditEntries')}</p>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">{t('offers.orderNumber')}</th>
                  <th className="p-3">{t('offers.user')}</th>
                  <th className="p-3">{t('offers.timestamp')}</th>
                  <th className="p-3">{t('offers.oldStatus')}</th>
                  <th className="p-3">{t('offers.newStatus')}</th>
                  <th className="p-3">{t('offers.description')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((entry) => (
                  <tr key={entry.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{entry.orderNumber}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {entry.userName.charAt(0)}
                        </div>
                        {entry.userName}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString('sr-RS')}</td>
                    <td className="p-3">
                      {entry.oldStatus ? (
                        <Badge variant="outline" className={`text-xs ${getStatusColor(entry.oldStatus)}`}>{t(getStatusLabelKey(entry.oldStatus))}</Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(entry.newStatus)}`}>{t(getStatusLabelKey(entry.newStatus))}</Badge>
                    </td>
                    <td className="p-3 text-xs">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  // ==================== RENDER: OFFER FORM DIALOG ====================

  const renderOfferDialog = () => (
    dialogOpen && (
      <Card className="max-w-3xl max-h-[90vh] overflow-y-auto">

        <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{editingOrder ? t('offers.editOffer') : t('offers.newOffer')}</CardTitle></div></CardHeader>
        <div className="space-y-4">
          {/* Partner + Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.partner')}</Label>
              <Select value={form.partnerId} onValueChange={(v) => setForm(prev => ({ ...prev, partnerId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('offers.selectPartner')} /></SelectTrigger>
                <SelectContent>{partners.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('offers.paymentTerms')}</Label>
              <Select value={form.paymentTerms} onValueChange={(v) => setForm(prev => ({ ...prev, paymentTerms: v as PaymentTerms }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map(pt => (<SelectItem key={pt.value} value={pt.value}>{t(pt.label)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.dateOrder')}</Label>
              <Input type="date" value={form.dateOrder} onChange={(e) => setForm(prev => ({ ...prev, dateOrder: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('offers.validUntil')}</Label>
              <Input type="date" value={form.validUntil} onChange={(e) => setForm(prev => ({ ...prev, validUntil: e.target.value }))} />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('offers.lineItems')}</Label>
              <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="h-3.5 w-3.5 mr-1" /> {t('offers.addLineItem')}</Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-2">{t('offers.product')}</th>
                      <th className="p-2 w-16">{t('offers.qty')}</th>
                      <th className="p-2 w-24">{t('offers.unitPrice')}</th>
                      <th className="p-2 w-16">{t('offers.discountPct')}</th>
                      <th className="p-2 w-16">{t('offers.taxPct')}</th>
                      <th className="p-2 w-28">{t('offers.lineTotal')}</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineItems.map((li, idx) => (
                      <tr key={li.id} className="border-t">
                        <td className="p-1">
                          <Select value={li.productId} onValueChange={(v) => updateLineItem(idx, 'productId', v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('offers.selectProduct')} /></SelectTrigger>
                            <SelectContent>
                              {products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-1"><Input type="number" min="1" className="h-8 text-xs" value={li.quantity || ''} onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1"><Input type="number" min="0" step="0.01" className="h-8 text-xs" value={li.unitPrice || ''} onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1"><Input type="number" min="0" max="100" className="h-8 text-xs" value={li.discount || ''} onChange={(e) => updateLineItem(idx, 'discount', parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1"><Input type="number" min="0" max="100" className="h-8 text-xs" value={li.tax || ''} onChange={(e) => updateLineItem(idx, 'tax', parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1 text-xs font-medium text-right">{formatRSD(li.lineTotal)}</td>
                        <td className="p-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLineItem(idx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Global Discount + Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.globalDiscount')} (%)</Label>
              <Input type="number" min="0" max="100" value={form.globalDiscount || ''} onChange={(e) => setForm(prev => ({ ...prev, globalDiscount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('offers.notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <Separator />

          {/* Totals summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('offers.subtotal')}</span><span>{formatRSD(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('offers.taxTotal')}</span><span>{formatRSD(totalTax)}</span></div>
              {form.globalDiscount > 0 && (
                <div className="flex justify-between text-red-600"><span>{t('offers.globalDiscount')} (-{form.globalDiscount}%)</span><span>-{formatRSD((subtotal + totalTax) * form.globalDiscount / 100)}</span></div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>{t('offers.grandTotal')}</span><span>{formatRSD(grandTotal)}</span></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>{t('common.cancel')}</Button>
          <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('offers.createOffer')}</Button>
        </div>
      </Card>
    )
  )

  // ==================== RENDER: DETAIL DIALOG ====================

  const renderDetailDialog = () => (
    detailOpen && (
      <Card className="max-w-lg">
        <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('offers.offerDetails')}</CardTitle></div></CardHeader>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">{t('offers.number')}:</span> <span className="font-mono">{selectedOrder.number}</span></div>
              <div>
                <span className="text-muted-foreground">{t('offers.status')}:</span>{' '}
                <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>{t(getStatusLabelKey(selectedOrder.status))}</Badge>
              </div>
              <div><span className="text-muted-foreground">{t('offers.partner')}:</span> {selectedOrder.partnerName || '-'}</div>
              <div><span className="text-muted-foreground">{t('offers.total')}:</span> <span className="font-bold">{formatRSD(selectedOrder.totalAmount)}</span></div>
              <div><span className="text-muted-foreground">{t('offers.date')}:</span> {new Date(selectedOrder.dateOrder).toLocaleDateString('sr-RS')}</div>
              {selectedOrder.validUntil && (
                <div><span className="text-muted-foreground">{t('offers.validUntil')}:</span> {new Date(selectedOrder.validUntil).toLocaleDateString('sr-RS')}</div>
              )}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t('offers.notes')}:</span>
              <p className="bg-muted/50 p-3 rounded-md text-sm">{selectedOrder.notes || t('offers.noNotes')}</p>
            </div>
            {selectedOrder.status === 'confirmed' && (
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" /> {t('offers.convertToInvoice')}
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  )

  // ==================== RENDER: PRICE LIST DIALOG ====================

  const renderPriceListDialog = () => (
    priceListDialogOpen && (
      <Card className="max-w-lg">
        <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPriceListDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{editingPriceList ? t('offers.editPriceList') : t('offers.newPriceList')}</CardTitle></div></CardHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('offers.priceListName')}</Label>
            <Input value={plForm.name} onChange={(e) => setPlForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('offers.description')}</Label>
            <Textarea value={plForm.description} onChange={(e) => setPlForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.type')}</Label>
              <Select value={plForm.type} onValueChange={(v) => setPlForm(prev => ({ ...prev, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICE_LIST_TYPES.map(pt => (<SelectItem key={pt.value} value={pt.value}>{t(pt.label)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('offers.marginMarkup')} (%)</Label>
              <Input type="number" value={plForm.margin || ''} onChange={(e) => setPlForm(prev => ({ ...prev, margin: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={plForm.isActive} onCheckedChange={(v) => setPlForm(prev => ({ ...prev, isActive: v === true }))} />
            <Label>{t('offers.active')}</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setPriceListDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSavePriceList}>{t('common.save')}</Button>
        </div>
      </Card>
    )
  )

  // ==================== RENDER: TEMPLATE DIALOG ====================

  const renderTemplateDialog = () => (
    templateDialogOpen && (
      <Card className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTemplateDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('offers.newTemplate')}</CardTitle></div></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.templateName')}</Label>
              <Input value={tplForm.name} onChange={(e) => setTplForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('offers.paymentTerms')}</Label>
              <Select value={tplForm.paymentTerms} onValueChange={(v) => setTplForm(prev => ({ ...prev, paymentTerms: v as PaymentTerms }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map(pt => (<SelectItem key={pt.value} value={pt.value}>{t(pt.label)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('offers.description')}</Label>
            <Textarea value={tplForm.description} onChange={(e) => setTplForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t('offers.defaultNotes')}</Label>
            <Textarea value={tplForm.defaultNotes} onChange={(e) => setTplForm(prev => ({ ...prev, defaultNotes: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('offers.globalDiscount')} (%)</Label>
              <Input type="number" min="0" max="100" value={tplForm.defaultDiscount || ''} onChange={(e) => setTplForm(prev => ({ ...prev, defaultDiscount: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>

          {/* Template line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('offers.lineItems')}</Label>
              <Button size="sm" variant="outline" onClick={() => setTplForm(prev => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }))}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {t('offers.addLineItem')}
              </Button>
            </div>
            <div className="space-y-2">
              {tplForm.lineItems.map((li, idx) => (
                <div key={li.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">{t('offers.product')}</span>
                    <Input className="h-8 text-xs" value={li.productName} onChange={(e) => { const items = [...tplForm.lineItems]; items[idx] = { ...items[idx], productName: e.target.value }; setTplForm(prev => ({ ...prev, lineItems: items })) }} />
                  </div>
                  <div className="w-16 space-y-1">
                    <span className="text-xs text-muted-foreground">{t('offers.qty')}</span>
                    <Input type="number" min="1" className="h-8 text-xs" value={li.quantity || ''} onChange={(e) => updateTemplateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <span className="text-xs text-muted-foreground">{t('offers.unitPrice')}</span>
                    <Input type="number" min="0" className="h-8 text-xs" value={li.unitPrice || ''} onChange={(e) => updateTemplateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setTplForm(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveTemplate}>{t('common.save')}</Button>
        </div>
      </Card>
    )
  )

  // ==================== RENDER: TEMPLATE PREVIEW DIALOG ====================

  const renderTemplatePreviewDialog = () => (
    templatePreviewOpen && (
      <Card className="max-w-lg">
        <CardHeader><div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTemplatePreviewOpen(false)}><ArrowLeft className="h-4 w-4" /></Button><CardTitle className="text-base">{t('offers.templatePreview')}</CardTitle></div></CardHeader>
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{selectedTemplate.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
            <Separator />
            <div className="text-sm space-y-2">
              <div><span className="text-muted-foreground">{t('offers.paymentTerms')}:</span> {t(PAYMENT_TERMS_OPTIONS.find(pt => pt.value === selectedTemplate.paymentTerms)?.label || '')}</div>
              <div><span className="text-muted-foreground">{t('offers.defaultDiscount')}:</span> {selectedTemplate.defaultDiscount}%</div>
              <div><span className="text-muted-foreground">{t('offers.defaultNotes')}:</span> {selectedTemplate.defaultNotes || '—'}</div>
            </div>
            <Separator />
            <div>
              <span className="text-sm font-medium">{t('offers.lineItems')}:</span>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left pb-1.5">{t('offers.product')}</th>
                    <th className="text-right pb-1.5">{t('offers.qty')}</th>
                    <th className="text-right pb-1.5">{t('offers.unitPrice')}</th>
                    <th className="text-right pb-1.5">{t('offers.lineTotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplate.lineItems.map((li, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5">{li.productName}</td>
                      <td className="py-1.5 text-right">{li.quantity}</td>
                      <td className="py-1.5 text-right">{formatRSD(li.unitPrice)}</td>
                      <td className="py-1.5 text-right font-medium">{formatRSD(li.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    )
  )

  // ==================== MAIN RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('offers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('offers.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadOrders() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('common.refresh')}
          </Button>
          <Button size="sm" onClick={() => openCreateDialog()}>
            <Plus className="h-4 w-4 mr-1" /> {t('offers.newOffer')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabOverview')}</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabOffers')}</TabsTrigger>
          <TabsTrigger value="pricelists" className="text-xs sm:text-sm"><FileBarChart className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabPriceLists')}</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm"><BookTemplate className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabTemplates')}</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm"><TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabAnalytics')}</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm"><History className="h-4 w-4 mr-1 hidden sm:inline" /> {t('offers.tabHistory')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="orders">{renderOffers()}</TabsContent>
        <TabsContent value="pricelists">{renderPriceLists()}</TabsContent>
        <TabsContent value="templates">{renderTemplates()}</TabsContent>
        <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
        <TabsContent value="history">{renderHistory()}</TabsContent>
      </Tabs>

      {/* Dialogs */}
      {renderOfferDialog()}
      {renderDetailDialog()}
      {renderPriceListDialog()}
      {renderTemplateDialog()}
      {renderTemplatePreviewDialog()}
    </div>
  )
}

// ==================== MOCK DATA HELPERS ====================

function generateMonthlyTrend(totalOrders: number): Array<{ month: string; count: number }> {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: Math.max(1, Math.floor(totalOrders / 6) + Math.floor(Math.random() * 5) - 2),
    })
  }
  return months
}

function generateTopPartners(recentOrders: SalesOrder[]): Array<{ partnerName: string; totalValue: number }> {
  const partnerMap = new Map<string, number>()
  recentOrders.forEach(o => {
    if (o.partnerName) {
      partnerMap.set(o.partnerName, (partnerMap.get(o.partnerName) || 0) + o.totalAmount)
    }
  })
  return Array.from(partnerMap.entries())
    .map(([partnerName, totalValue]) => ({ partnerName, totalValue }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
}
