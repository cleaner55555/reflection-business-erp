'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowLeft,
  Printer,
  FileText,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  BarChart3,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  BookOpen,
  TrendingUp,
  DollarSign,
  FilePlus,
  CalendarClock,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import { RecurringInvoices } from './RecurringInvoices'
import { RateOtplateTab, FiskalizacijaTab } from './FaktureEnhanced'
import { formatRSD, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { ReportDownloadButton } from './ReportDownloadButton'
import { generateInvoicePDF, downloadPDF, type InvoiceData } from '@/lib/reports/pdf-generator'

// ==================== INTERFACES ====================

interface Partner {
  id: string
  name: string
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  total: number
}

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  sefStatus: string | null
  sefSentAt: string | null
  sefUuid: string | null
  partner: { id: string; name: string } | null
  items: InvoiceItem[]
}

interface Product {
  id: string
  name: string
  sellingPrice: number
}

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
}

// Full invoice data for printing
interface FullInvoice {
  id: string
  number: string
  date: string
  dueDate: string
  partnerId: string
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  partner: {
    id: string
    name: string
    pib: string
    maticniBr: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    email: string | null
    account: string | null
    bank: string | null
  } | null
  items: InvoiceItem[]
}

// ==================== COMPANY INFO ====================

const COMPANY = {
  name: 'Reflection Business',
  address: 'Bulevar Mihajla Pupina 10a',
  city: 'Beograd, 11070',
  pib: '123456789',
  maticniBr: '21012345',
  account: '265-12345678-12',
  bank: 'Banca Intesa Beograd',
  phone: '+381 11 123 4567',
  email: 'office@reflectionbusiness.rs',
}

// ==================== SEF STATUS HELPERS ====================

function getSefStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    not_sent: 'Nije poslata',
    sent: 'Poslata',
    accepted: 'Prihvaćena',
    rejected: 'Odbijena',
  }
  return labels[status || 'not_sent'] || status || 'Nije poslata'
}

function getSefStatusColor(status: string | null): string {
  const colors: Record<string, string> = {
    not_sent: 'bg-slate-100 text-slate-600 border-slate-200',
    sent: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }
  return colors[status || 'not_sent'] || 'bg-slate-100 text-slate-600 border-slate-200'
}

// ==================== MAIN COMPONENT ====================

export function Fakture() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('invoices.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('invoices.subtitle') || 'Управљање излазним и улазним фатурама'}
        </p>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pregled</span></TabsTrigger>
          <TabsTrigger value="fakture" className="gap-1.5"><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('efakture.tabInvoices')}</span></TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5"><Clock className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('recurring.tabLabel')}</span></TabsTrigger>
          <TabsTrigger value="efakture" className="gap-1.5"><Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('efakture.tab')}</span></TabsTrigger>
          <TabsTrigger value="rate" className="gap-1.5"><CalendarClock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Rate</span></TabsTrigger>
          <TabsTrigger value="fiskalizacija" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /><span className="hidden sm:inline">Fiskalizacija</span></TabsTrigger>
        </TabsList>

        <TabsContent value="pregled"><InvoiceDashboard /></TabsContent>
        <TabsContent value="fakture">
          <FaktureTab />
        </TabsContent>
        <TabsContent value="recurring">
          <RecurringInvoices />
        </TabsContent>
        <TabsContent value="efakture">
          <EFaktureTab />
        </TabsContent>
        <TabsContent value="rate"><RateOtplateTab /></TabsContent>
        <TabsContent value="fiskalizacija"><FiskalizacijaTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== INVOICE DASHBOARD ====================

function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = useCallback(async (): Promise<void> => {
    setLoading(true)
    const res = await fetch('/api/invoices')
    setInvoices(await res.json())
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = invoices.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const overdue = invoices.filter(i => new Date(i.dueDate) < now && i.status === 'poslata')
    const byType = {
      izlazna: invoices.filter(i => i.type === 'izlazna'),
      ulazna: invoices.filter(i => i.type === 'ulazna'),
      predracun: invoices.filter(i => i.type === 'predracun'),
    }
    const byStatus = {
      nacrt: invoices.filter(i => i.status === 'nacrt').length,
      poslata: invoices.filter(i => i.status === 'poslata').length,
      placena: invoices.filter(i => i.status === 'placena').length,
      otkazana: invoices.filter(i => i.status === 'otkazana').length,
    }
    return {
      total: invoices.length,
      totalAmount: invoices.reduce((s, i) => s + i.totalAmount, 0),
      monthCount: thisMonth.length,
      monthAmount: thisMonth.reduce((s, i) => s + i.totalAmount, 0),
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((s, i) => s + i.totalAmount, 0),
      avgInvoice: invoices.length > 0 ? invoices.reduce((s, i) => s + i.totalAmount, 0) / invoices.length : 0,
      unpaid: invoices.filter(i => i.status === 'poslata'),
      byType,
      byStatus,
    }
  }, [invoices])

  if (loading) return <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-48 w-full" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><FileText className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><DollarSign className="h-3.5 w-3.5" />Ukupan iznos</div><p className="text-lg font-bold">{formatRSD(stats.totalAmount)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><TrendingUp className="h-3.5 w-3.5" />Ovaj mesec</div><p className="text-2xl font-bold text-emerald-700">{stats.monthCount}</p><p className="text-xs text-muted-foreground">{formatRSD(stats.monthAmount)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarChart3 className="h-3.5 w-3.5" />Prosek</div><p className="text-lg font-bold">{formatRSD(stats.avgInvoice)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Plaćene</div><p className="text-2xl font-bold text-blue-700">{stats.byStatus.placena}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Prekoračene</div><p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p><p className="text-xs text-muted-foreground">{formatRSD(stats.overdueAmount)}</p></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Izlazne fakture</span><div className="text-right"><span className="text-sm font-bold">{stats.byType.izlazna.length}</span><p className="text-[10px] text-muted-foreground">{formatRSD(stats.byType.izlazna.reduce((s, i) => s + i.totalAmount, 0))}</p></div></div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ulazne fakture</span><div className="text-right"><span className="text-sm font-bold">{stats.byType.ulazna.length}</span><p className="text-[10px] text-muted-foreground">{formatRSD(stats.byType.ulazna.reduce((s, i) => s + i.totalAmount, 0))}</p></div></div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Predračuni</span><div className="text-right"><span className="text-sm font-bold">{stats.byType.predracun.length}</span><p className="text-[10px] text-muted-foreground">{formatRSD(stats.byType.predracun.reduce((s, i) => s + i.totalAmount, 0))}</p></div></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Prekoračene fakture</CardTitle></CardHeader>
          <CardContent>
            {stats.overdueCount === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nema prekoračenih faktura</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {stats.overdue.slice(0, 10).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200">
                    <div><span className="text-xs font-medium">{inv.number}</span><span className="text-[10px] text-muted-foreground ml-2">{inv.partner?.name || '—'}</span></div>
                    <div className="text-right"><span className="text-xs font-bold text-red-600">{formatRSD(inv.totalAmount)}</span><p className="text-[10px] text-muted-foreground">Rok: {formatDate(inv.dueDate)}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== FAKTURE TAB (ORIGINAL) ====================

function FaktureTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'print'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [printInvoice, setPrintInvoice] = useState<FullInvoice | null>(null)
  const [printLoading, setPrintLoading] = useState(false)
  const [pdfDownloading, setPdfDownloading] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()

  // Form state
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 },
  ])

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/invoices?${params.toString()}`)
    const data = await res.json()
    setInvoices(data)
    setLoading(false)
  }, [search, statusFilter, typeFilter])

  useEffect(() => {
    fetchInvoices()
    fetch('/api/partners').then((r) => r.json()).then(setPartners)
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchInvoices])

  useEffect(() => {
    if (invoices.length === 0) return
    const texts: string[] = []
    invoices.forEach((inv) => {
      if (inv.partner?.name) texts.push(inv.partner.name)
      if (inv.notes) texts.push(inv.notes)
      inv.items.forEach((item) => {
        if (item.productName) texts.push(item.productName)
      })
    })
    if (texts.length > 0) translateTexts(texts)
  }, [invoices, translateTexts])

  const handleNew = () => {
    setEditingInvoice(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
    setViewMode('form')
  }

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv)
    setLineItems(inv.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountPct: i.discountPct,
      taxRate: i.taxRate,
    })))
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingInvoice(null)
    setPrintInvoice(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
  }

  const handlePrint = async (inv: Invoice) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (!res.ok) { toast.error(t('invoices.loadError')); return }
      const data: FullInvoice = await res.json()
      setPrintInvoice(data)
    } catch {
      toast.error(t('invoices.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

  const doPrint = () => {
    window.print()
  }

  const handleDownloadPDF = async (inv: Invoice) => {
    setPdfDownloading(inv.id)
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (!res.ok) { toast.error(t('common.errorOccurred')); return }
      const data: FullInvoice = await res.json()

      const invoicePdfData: InvoiceData = {
        id: data.id,
        number: data.number,
        date: data.date,
        dueDate: data.dueDate,
        type: data.type,
        status: data.status,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount,
        discountPct: data.discountPct,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        partner: data.partner ? {
          name: data.partner.name,
          pib: data.partner.pib,
          maticniBr: data.partner.maticniBr,
          address: data.partner.address,
          city: data.partner.city,
          phone: data.partner.phone,
          email: data.partner.email,
          account: data.partner.account,
          bank: data.partner.bank,
        } : null,
        items: data.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          taxRate: item.taxRate,
          total: item.total,
        })),
      }

      const doc = generateInvoicePDF(invoicePdfData)
      downloadPDF(doc, `faktura_${data.number}.pdf`)
      toast.success(t('reports.downloadReady'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setPdfDownloading(null)
    }
  }

  // Convert predracun to izlazna faktura
  const handleConvertToInvoice = async (inv: Invoice) => {
    if (!confirm(`Konvertovati predračun ${inv.number} u fakturu?`)) return
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const count = String(Math.floor(Math.random() * 9000) + 1000)
      const res = await fetch(`/api/invoices/${inv.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'izlazna', number: `F-${year}-${month}-${count}` }) })
      if (!res.ok) { toast.error('Greška pri konverziji'); return }
      toast.success('Predračun konvertovan u fakturu')
      fetchInvoices()
    } catch { toast.error('Greška') }
  }

  // Post invoice to accounting (knjiženje)
  const handlePostToAccounting = async (inv: Invoice) => {
    try {
      const res = await fetch('/api/journal-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: inv.date, description: `Faktura ${inv.number} - ${inv.partner?.name || ''}`, debit: inv.totalAmount, credit: 0, documentRef: inv.number, partnerId: inv.partnerId }) })
      if (!res.ok) { toast.error('Greška pri knjiženju'); return }
      const entry = await res.json()
      // Create credit entry for counter-account
      await fetch('/api/journal-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: inv.date, description: `Faktura ${inv.number} - potraživanje`, debit: 0, credit: inv.totalAmount, documentRef: inv.number, partnerId: inv.partnerId }) })
      await fetch(`/api/invoices/${inv.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'placena' }) })
      toast.success('Faktura knjižena u nalog')
      fetchInvoices()
    } catch { toast.error('Greška pri knjiženju') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('invoices.confirmDelete'))) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('invoices.deleteSuccess'))
      fetchInvoices()
    } catch { toast.error(t('common.error')) }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.sellingPrice
      }
    }

    setLineItems(updated)
  }

  const calcTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * (item.discountPct / 100)
    return subtotal - discount + (subtotal - discount) * (item.taxRate / 100)
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + calcTotal(item), 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const isEditing = !!editingInvoice
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 9000) + 1000)

    const invoiceType = fd.get('type') as string || 'izlazna'

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: isEditing ? editingInvoice.number : `F-${year}-${month}-${count}`,
      date: isEditing ? editingInvoice.date : new Date().toISOString(),
      type: invoiceType,
      status: fd.get('status') as string || 'nacrt',
      dueDate: fd.get('dueDate') as string,
      paymentMethod: fd.get('paymentMethod') as string || 'racun',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        discountPct: String(item.discountPct),
        taxRate: String(item.taxRate),
      })),
    }

    try {
      const url = isEditing ? `/api/invoices/${editingInvoice.id}` : '/api/invoices'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('invoices.updatedSuccess') : t('invoices.createdSuccess'))
      setViewMode('list')
      setEditingInvoice(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
      fetchInvoices()
    } catch {
      toast.error(t('invoices.createError'))
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== CALCULATIONS FOR PRINT ====================

  const calcItemBase = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * ((item.discountPct || 0) / 100)
    return subtotal - discount
  }

  const calcItemTax = (item: InvoiceItem) => {
    return calcItemBase(item) * ((item.taxRate || 20) / 100)
  }

  const calcItemTotal = (item: InvoiceItem) => {
    return calcItemBase(item) + calcItemTax(item)
  }

  // ==================== RENDER ====================

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {editingInvoice ? t('invoices.editInvoice') : t('invoices.newInvoice')}
              </CardTitle>
            </div>
          </div>
        ) : viewMode === 'print' ? (
          <div className="flex items-center gap-3 no-print">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base font-semibold">
                {t('invoices.previewInvoice')} {printInvoice?.number || ''}
              </CardTitle>
            </div>
            <div className="ml-auto">
              <Button size="sm" className="gap-2" onClick={doPrint}>
                <Printer className="h-4 w-4" /> {t('common.print')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('invoices.title')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('invoices.subtitle') || 'Управљање излазним и улазним фатурама'}</p>
              </div>
              <div className="flex items-center gap-2">
                <ReportDownloadButton type="invoice" />
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> {t('invoices.newInvoice')}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('invoices.searchInvoices')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder={t('invoices.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="predracun">{t('invoices.preinvoice')}</SelectItem>
                  <SelectItem value="izlazna">{t('invoices.outgoing')}</SelectItem>
                  <SelectItem value="ulazna">{t('invoices.incoming')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder={t('invoices.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('invoices.allStatuses')}</SelectItem>
                  <SelectItem value="nacrt">{t('common.nacrt')}</SelectItem>
                  <SelectItem value="poslata">{t('common.poslata')}</SelectItem>
                  <SelectItem value="placena">{t('common.placena')}</SelectItem>
                  <SelectItem value="otkazana">{t('common.otkazana')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {/* ============ PRINT PREVIEW ============ */}
        {viewMode === 'print' && (
          printLoading ? (
            <div className="flex items-center justify-center py-12">
              <Skeleton className="h-[600px] w-full max-w-4xl" />
            </div>
          ) : printInvoice ? (
            <div ref={printRef} className="invoice-print-area bg-white rounded-lg border p-6 max-w-4xl mx-auto text-sm">
              {/* Company Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">{COMPANY.name}</h1>
                  <p className="text-xs text-gray-500 mt-1">{COMPANY.address}</p>
                  <p className="text-xs text-gray-500">{COMPANY.city}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-[10px] text-gray-500">PIB: {COMPANY.pib}</span>
                    <span className="text-[10px] text-gray-500">MB: {COMPANY.maticniBr}</span>
                    <span className="text-[10px] text-gray-500">{COMPANY.account}</span>
                    <span className="text-[10px] text-gray-500">{COMPANY.bank}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold uppercase tracking-wide">
                    {getStatusLabel(printInvoice.type)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t('invoices.numberLabel')}: <span className="font-mono font-medium text-gray-800">{printInvoice.number}</span></p>
                  <p className="text-xs text-gray-500">{t('common.date')}: {formatDate(printInvoice.date)}</p>
                  <p className="text-xs text-gray-500">{t('invoices.place')}: Beograd</p>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('invoices.buyer')}</p>
                <p className="text-sm font-semibold">{tc(printInvoice.partner?.name || '-')}</p>
                {printInvoice.partner && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {printInvoice.partner.address && (
                      <span className="text-[10px] text-gray-500">{printInvoice.partner.address}{printInvoice.partner.city ? `, ${printInvoice.partner.city}` : ''}</span>
                    )}
                    {printInvoice.partner.pib && (
                      <span className="text-[10px] text-gray-500">PIB: {printInvoice.partner.pib}</span>
                    )}
                    {printInvoice.partner.maticniBr && (
                      <span className="text-[10px] text-gray-500">MB: {printInvoice.partner.maticniBr}</span>
                    )}
                    {printInvoice.partner.account && (
                      <span className="text-[10px] text-gray-500">{printInvoice.partner.account}</span>
                    )}
                    {printInvoice.partner.bank && (
                      <span className="text-[10px] text-gray-500">{printInvoice.partner.bank}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-xs mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-center w-10">{t('invoices.rowNum')}</th>
                    <th className="border border-gray-300 px-2 py-2">{t('invoices.itemName')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-12">{t('invoices.qty')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-12">{t('invoices.unit')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.price')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-14">{t('invoices.discountPct')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-14">{t('invoices.taxPct')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {printInvoice.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{tc(item.productName)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{t('invoices.unitPiece')}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right">{formatRSD(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{item.discountPct || 0}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{item.taxRate || 20}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-medium">{formatRSD(calcItemTotal(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-72 space-y-1">
                  <div className="flex justify-between text-xs py-1 px-2">
                    <span className="text-gray-500">{t('invoices.baseAmount')}:</span>
                    <span className="font-medium">
                      {formatRSD(printInvoice.items.reduce((s, i) => s + calcItemBase(i), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1 px-2">
                    <span className="text-gray-500">{t('invoices.totalTax')}:</span>
                    <span className="font-medium">
                      {formatRSD(printInvoice.items.reduce((s, i) => s + calcItemTax(i), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 px-2 bg-gray-100 rounded font-bold border">
                    <span>{t('common.total').toUpperCase()}:</span>
                    <span>{formatRSD(printInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 px-2">
                    <span className="text-gray-500">{t('invoices.inWords')}:</span>
                    <span className="font-medium italic text-gray-600">
                      {numberToSerbian(printInvoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('finance.payment')}</p>
                  <p><span className="text-gray-500">{t('finance.methodLabel')}: </span>{getStatusLabel(printInvoice.paymentMethod)}</p>
                  <p><span className="text-gray-500">{t('invoices.dueDate')}: </span>{formatDate(printInvoice.dueDate)}</p>
                  <p><span className="text-gray-500">{t('invoices.accountLabel')}: </span>{COMPANY.account}</p>
                  <p><span className="text-gray-500">{t('invoices.bankLabel')}: </span>{COMPANY.bank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('common.status')}</p>
                  <p>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(printInvoice.status)}`}>
                      {getStatusLabel(printInvoice.status)}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Notes */}
              {printInvoice.notes && (
                <div className="mb-6 text-xs">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('common.note')}</p>
                  <p className="text-gray-600">{tc(printInvoice.notes)}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="print-footer grid grid-cols-2 gap-16 mt-10 pt-6 border-t">
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('invoices.signatureIssuer')}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('invoices.signatureReceiver')}</p>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* ============ FORM ============ */}
        {viewMode === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('invoices.invoiceType')} *</Label>
                <Select name="type" defaultValue={editingInvoice?.type || 'izlazna'}>
                  <SelectTrigger><SelectValue placeholder={t('invoices.selectType')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predracun">{t('invoices.preinvoice')}</SelectItem>
                    <SelectItem value="izlazna">{t('invoices.outgoing')}</SelectItem>
                    <SelectItem value="ulazna">{t('invoices.incoming')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.status')}</Label>
                <Select name="status" defaultValue={editingInvoice?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">{t('common.nacrt')}</SelectItem>
                    <SelectItem value="poslata">{t('common.poslata')}</SelectItem>
                    <SelectItem value="placena">{t('common.placena')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('common.partner')} *</Label>
                <Select name="partnerId" defaultValue={editingInvoice?.partnerId || ''} required>
                  <SelectTrigger><SelectValue placeholder={t('invoices.selectPartner')} /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('invoices.dueDate')} *</Label>
                <Input name="dueDate" type="date" required defaultValue={editingInvoice?.dueDate?.split('T')[0] || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('finance.paymentMethod')}</Label>
                <Select name="paymentMethod" defaultValue={editingInvoice?.paymentMethod || 'racun'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="racun">{t('invoices.bankTransfer')}</SelectItem>
                    <SelectItem value="gotovina">{t('finance.cash')}</SelectItem>
                    <SelectItem value="kartica">{t('finance.card')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold">{t('invoices.invoiceItems')}</Label>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('invoices.product')}</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateLineItem(idx, 'productId', v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder={t('invoices.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('common.quantity')}</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('common.price')}</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('invoices.discountPct')}</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.discountPct}
                      onChange={(e) => updateLineItem(idx, 'discountPct', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="w-full gap-1">
                <Plus className="h-3 w-3" /> {t('invoices.addItem')}
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-right">
              <span className="text-sm font-medium">{t('common.total')}: </span>
              <span className="text-lg font-bold text-primary">{formatRSD(grandTotal)}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t('invoices.notesOptional')}</Label>
              <Input name="notes" placeholder={t('invoices.notesPlaceholder')} defaultValue={editingInvoice?.notes || ''} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : editingInvoice ? t('common.saveChanges') : t('invoices.createInvoice')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        )}

        {/* ============ LIST ============ */}
        {viewMode === 'list' && loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {viewMode === 'list' && !loading && (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs">{t('common.type')}</TableHead>
                  <TableHead className="text-xs">{t('common.partner')}</TableHead>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('invoices.dueDate')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      {t('invoices.noInvoices')}
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-xs font-medium">{inv.number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(inv.type || 'izlazna')}`}>
                          {getStatusLabel(inv.type || 'izlazna')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{tc(inv.partner?.name || '-')}</TableCell>
                      <TableCell className="text-xs">{formatDate(inv.date)}</TableCell>
                      <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {formatRSD(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDownloadPDF(inv)}
                            title={t('reports.invoicePDF')}
                            disabled={pdfDownloading === inv.id}
                          >
                            {pdfDownloading === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(inv)} title={t('common.print')}>
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          {inv.type === 'predracun' && inv.status === 'nacrt' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleConvertToInvoice(inv)} title="Konvertuj u fakturu">
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {inv.status === 'poslata' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handlePostToAccounting(inv)} title="Knjiži u nalog">
                              <BookOpen className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(inv)} title={t('common.edit')}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(inv.id)} title={t('common.delete')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== EFAKTURE TAB ====================

function EFaktureTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [sefStatusFilter, setSefStatusFilter] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [xmlCache, setXmlCache] = useState<Record<string, { xml: string; filename: string }>>({})
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const { t } = useTranslation()
  const { tc } = useContentTranslation()

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sefStatusFilter) params.set('sefStatus', sefStatusFilter)
      const res = await fetch(`/api/invoices?${params.toString()}`)
      const data = await res.json()
      setInvoices(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [sefStatusFilter])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Summary stats
  const stats = {
    total: invoices.length,
    notSent: invoices.filter((i) => i.sefStatus === 'not_sent' || !i.sefStatus).length,
    sent: invoices.filter((i) => i.sefStatus === 'sent').length,
    accepted: invoices.filter((i) => i.sefStatus === 'accepted').length,
    rejected: invoices.filter((i) => i.sefStatus === 'rejected').length,
  }

  const handleGenerateXml = async (invoiceId: string) => {
    setGeneratingId(invoiceId)
    try {
      const res = await fetch('/api/efakture/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('efakture.generateError'))
        return
      }
      const data = await res.json()
      setXmlCache((prev) => ({ ...prev, [invoiceId]: { xml: data.xml, filename: data.filename } }))
      toast.success(t('efakture.generateSuccess'))
      fetchInvoices()
    } catch {
      toast.error(t('efakture.generateError'))
    } finally {
      setGeneratingId(null)
    }
  }

  const handleDownloadXml = async (invoiceId: string) => {
    // Generate if not cached
    if (!xmlCache[invoiceId]) {
      await handleGenerateXml(invoiceId)
      // Wait for state update
      setTimeout(() => downloadXml(invoiceId), 500)
      return
    }
    downloadXml(invoiceId)
  }

  const downloadXml = (invoiceId: string) => {
    const cached = xmlCache[invoiceId]
    if (!cached) return

    const blob = new Blob([cached.xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = cached.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(t('efakture.downloadSuccess'))
  }

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    setUpdatingId(invoiceId)
    try {
      const res = await fetch('/api/efakture/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(t('efakture.statusUpdateSuccess'))
      fetchInvoices()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredInvoices = sefStatusFilter
    ? invoices.filter((i) => (i.sefStatus || 'not_sent') === sefStatusFilter)
    : invoices

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{t('efakture.statusNotSent')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.accepted}</p>
              <p className="text-xs text-muted-foreground">{t('efakture.statusAccepted')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Send className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sent}</p>
              <p className="text-xs text-muted-foreground">{t('efakture.statusSent')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">{t('efakture.statusRejected')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* XML Preview Dialog */}
      {previewInvoice && xmlCache[previewInvoice.id] && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {t('efakture.xmlPreview')} — {previewInvoice.number}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => downloadXml(previewInvoice.id)}
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('efakture.downloadXml')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewInvoice(null)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-[400px] font-mono leading-relaxed whitespace-pre-wrap break-all">
              {xmlCache[previewInvoice.id].xml}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('efakture.title')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t('efakture.subtitle')}</p>
            </div>
            <Select
              value={sefStatusFilter || 'all'}
              onValueChange={(v) => setSefStatusFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder={t('efakture.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('efakture.allStatuses')}</SelectItem>
                <SelectItem value="not_sent">{t('efakture.statusNotSent')}</SelectItem>
                <SelectItem value="sent">{t('efakture.statusSent')}</SelectItem>
                <SelectItem value="accepted">{t('efakture.statusAccepted')}</SelectItem>
                <SelectItem value="rejected">{t('efakture.statusRejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('efakture.invoiceNumber')}</TableHead>
                    <TableHead className="text-xs">{t('efakture.partner')}</TableHead>
                    <TableHead className="text-xs">{t('efakture.amount')}</TableHead>
                    <TableHead className="text-xs">{t('efakture.status')}</TableHead>
                    <TableHead className="text-xs">{t('efakture.uuid')}</TableHead>
                    <TableHead className="text-xs">{t('efakture.sentAt')}</TableHead>
                    <TableHead className="text-xs text-right">{t('efakture.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                        {t('efakture.noInvoices')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const sefStatus = inv.sefStatus || 'not_sent'
                      const isGenerating = generatingId === inv.id
                      const isUpdating = updatingId === inv.id

                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="text-xs font-medium">{inv.number}</TableCell>
                          <TableCell className="text-xs">{tc(inv.partner?.name || '-')}</TableCell>
                          <TableCell className="text-xs font-medium">{formatRSD(inv.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 ${getSefStatusColor(sefStatus)}`}
                            >
                              {getSefStatusLabel(sefStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                            {inv.sefUuid || '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {inv.sefSentAt ? formatDateTime(inv.sefSentAt) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title={t('efakture.generateXml')}
                                onClick={() => handleGenerateXml(inv.id)}
                                disabled={isGenerating}
                              >
                                <FileText className={`h-3.5 w-3.5 ${isGenerating ? 'animate-pulse' : ''}`} />
                              </Button>
                              {xmlCache[inv.id] && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title={t('efakture.xmlPreview')}
                                  onClick={() => setPreviewInvoice(previewInvoice?.id === inv.id ? null : inv)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title={t('efakture.downloadXml')}
                                onClick={() => handleDownloadXml(inv.id)}
                                disabled={downloadingId === inv.id}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              {sefStatus === 'not_sent' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-amber-600 hover:text-amber-700"
                                  title={t('efakture.markAsSent')}
                                  onClick={() => handleUpdateStatus(inv.id, 'sent')}
                                  disabled={isUpdating}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {sefStatus === 'sent' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                                    title={t('efakture.markAsAccepted')}
                                    onClick={() => handleUpdateStatus(inv.id, 'accepted')}
                                    disabled={isUpdating}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700"
                                    title={t('efakture.markAsRejected')}
                                    onClick={() => handleUpdateStatus(inv.id, 'rejected')}
                                    disabled={isUpdating}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== NUMBER TO SERBIAN WORDS ====================

function numberToSerbian(amount: number): string {
  if (amount === 0) return 'nula dinara'

  const units = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
  const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
  const tens = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']
  const hundreds = ['', 'sto', 'dvesto', 'tristo', 'četristo', 'petsto', 'šestosto', 'sedamsto', 'osamsto', 'devetsto']

  function convertChunk(n: number): string {
    if (n === 0) return ''
    let result = ''
    const h = Math.floor(n / 100)
    const remainder = n % 100
    const t = Math.floor(remainder / 10)
    const u = remainder % 10

    if (h > 0) result += hundreds[h]
    if (remainder === 0) return result

    if (remainder < 10) {
      result += (result ? ' ' : '') + units[u]
    } else if (remainder < 20) {
      result += (result ? ' ' : '') + teens[remainder - 10]
    } else {
      result += (result ? ' ' : '') + tens[t]
      if (u > 0) result += (result ? ' ' : '') + units[u]
    }
    return result
  }

  const intPart = Math.floor(Math.abs(amount))
  const decPart = Math.round((Math.abs(amount) - intPart) * 100)

  if (intPart === 0 && decPart > 0) {
    return `${decPart} ${getParaWord(decPart)}`
  }

  let result = ''
  // Handle millions
  const millions = Math.floor(intPart / 1000000)
  if (millions > 0) {
    if (millions === 1) result += 'jedan milion'
    else {
      result += convertChunk(millions) + ' ' + getMillionWord(millions)
    }
  }

  // Handle thousands
  const thousands = Math.floor((intPart % 1000000) / 1000)
  if (thousands > 0) {
    if (result) result += ' '
    if (thousands === 1) result += 'jedna hiljada'
    else if (thousands < 5) result += convertChunk(thousands) + ' hiljade'
    else result += convertChunk(thousands) + ' hiljada'
  }

  // Handle remaining
  const remaining = intPart % 1000
  if (remaining > 0) {
    if (result) result += ' '
    result += convertChunk(remaining) + ' ' + getDinarWord(remaining)
  } else if (intPart > 0 && millions > 0 && thousands === 0) {
    // millions only, already handled
  }

  if (intPart === 0 && decPart > 0) {
    result = ''
  }

  if (decPart > 0) {
    if (result) result += ' i '
    result += `${decPart} ${getParaWord(decPart)}`
  }

  return result
}

function getDinarWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'dinara'
  if (lastOne >= 2 && lastOne <= 4) return 'dinara'
  if (lastOne === 1) return 'dinar'
  return 'dinara'
}

function getMillionWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'miliona'
  if (lastOne >= 2 && lastOne <= 4) return 'miliona'
  return 'miliona'
}

function getParaWord(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'para'
  if (lastOne >= 2 && lastOne <= 4) return 'pare'
  if (lastOne === 1) return 'para'
  return 'para'
}
