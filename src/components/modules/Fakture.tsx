'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Plus, Search, Trash2, Pencil, ArrowLeft, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

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

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
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

// ==================== MAIN COMPONENT ====================

export function Fakture() {
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
  const printRef = useRef<HTMLDivElement>(null)

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
      if (!res.ok) { toast.error('Greška pri učitavanju fakture'); return }
      const data: FullInvoice = await res.json()
      setPrintInvoice(data)
    } catch {
      toast.error('Greška pri učitavanju fakture')
    } finally {
      setPrintLoading(false)
    }
  }

  const doPrint = () => {
    window.print()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu fakturu?')) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Faktura uspešno obrisana')
      fetchInvoices()
    } catch { toast.error('Greška') }
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
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success(isEditing ? 'Faktura uspešno ažurirana' : 'Faktura uspešno kreirana')
      setViewMode('list')
      setEditingInvoice(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }])
      fetchInvoices()
    } catch {
      toast.error('Greška pri kreiranju fakture')
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
    <>
      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base font-semibold">
                  {editingInvoice ? 'Izmeni Fakturu' : 'Nova Faktura'}
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
                  Pregled Fakture {printInvoice?.number || ''}
                </CardTitle>
              </div>
              <div className="ml-auto">
                <Button size="sm" className="gap-2" onClick={doPrint}>
                  <Printer className="h-4 w-4" /> Štampaj
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Fakture</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Upravljanje fakturama</p>
                </div>
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> Nova Faktura
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži fakture..."
                    className="pl-8 h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve</SelectItem>
                    <SelectItem value="predracun">Predračun</SelectItem>
                    <SelectItem value="izlazna">Izlazna</SelectItem>
                    <SelectItem value="ulazna">Ulazna</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Svi statusi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi statusi</SelectItem>
                    <SelectItem value="nacrt">Načrt</SelectItem>
                    <SelectItem value="poslata">Poslata</SelectItem>
                    <SelectItem value="placena">Plaćena</SelectItem>
                    <SelectItem value="otkazana">Otkazana</SelectItem>
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
                    <p className="text-xs text-gray-500 mt-1">Broj: <span className="font-mono font-medium text-gray-800">{printInvoice.number}</span></p>
                    <p className="text-xs text-gray-500">Datum: {formatDate(printInvoice.date)}</p>
                    <p className="text-xs text-gray-500">Mesto: Beograd</p>
                  </div>
                </div>

                {/* Partner Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Kupac</p>
                  <p className="text-sm font-semibold">{printInvoice.partner?.name || '-'}</p>
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
                      <th className="border border-gray-300 px-2 py-2 text-center w-10">R.br</th>
                      <th className="border border-gray-300 px-2 py-2">Naziv robe/usluge</th>
                      <th className="border border-gray-300 px-2 py-2 text-center w-12">Kol.</th>
                      <th className="border border-gray-300 px-2 py-2 text-center w-12">JM</th>
                      <th className="border border-gray-300 px-2 py-2 text-right w-24">Cena</th>
                      <th className="border border-gray-300 px-2 py-2 text-center w-14">Popust%</th>
                      <th className="border border-gray-300 px-2 py-2 text-center w-14">PDV%</th>
                      <th className="border border-gray-300 px-2 py-2 text-right w-24">Iznos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printInvoice.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{idx + 1}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{item.productName}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">kom</td>
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
                      <span className="text-gray-500">Osnovica:</span>
                      <span className="font-medium">
                        {formatRSD(printInvoice.items.reduce((s, i) => s + calcItemBase(i), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs py-1 px-2">
                      <span className="text-gray-500">Ukupan PDV:</span>
                      <span className="font-medium">
                        {formatRSD(printInvoice.items.reduce((s, i) => s + calcItemTax(i), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 px-2 bg-gray-100 rounded font-bold border">
                      <span>UKUPNO:</span>
                      <span>{formatRSD(printInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 px-2">
                      <span className="text-gray-500">Slovima:</span>
                      <span className="font-medium italic text-gray-600">
                        {numberToSerbian(printInvoice.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Plaćanje</p>
                    <p><span className="text-gray-500">Način: </span>{getStatusLabel(printInvoice.paymentMethod)}</p>
                    <p><span className="text-gray-500">Rok plaćanja: </span>{formatDate(printInvoice.dueDate)}</p>
                    <p><span className="text-gray-500">Račun: </span>{COMPANY.account}</p>
                    <p><span className="text-gray-500">Banka: </span>{COMPANY.bank}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Status</p>
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
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Napomene</p>
                    <p className="text-gray-600">{printInvoice.notes}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="print-footer grid grid-cols-2 gap-16 mt-10 pt-6 border-t">
                  <div className="text-center">
                    <div className="border-b border-gray-300 mb-1 pb-8"></div>
                    <p className="text-[10px] text-gray-400">Potpis izdavaoca</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-300 mb-1 pb-8"></div>
                    <p className="text-[10px] text-gray-400">Potpis primanja</p>
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
                  <Label className="text-xs">Tip fakture *</Label>
                  <Select name="type" defaultValue={editingInvoice?.type || 'izlazna'}>
                    <SelectTrigger><SelectValue placeholder="Izaberite tip" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="predracun">Predračun</SelectItem>
                      <SelectItem value="izlazna">Izlazna</SelectItem>
                      <SelectItem value="ulazna">Ulazna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select name="status" defaultValue={editingInvoice?.status || 'nacrt'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacrt">Načrt</SelectItem>
                      <SelectItem value="poslata">Poslata</SelectItem>
                      <SelectItem value="placena">Plaćena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Partner *</Label>
                  <Select name="partnerId" defaultValue={editingInvoice?.partnerId || ''} required>
                    <SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Rok plaćanja *</Label>
                  <Input name="dueDate" type="date" required defaultValue={editingInvoice?.dueDate?.split('T')[0] || ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Način plaćanja</Label>
                  <Select name="paymentMethod" defaultValue={editingInvoice?.paymentMethod || 'racun'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="racun">Račun</SelectItem>
                      <SelectItem value="gotovina">Gotovina</SelectItem>
                      <SelectItem value="kartica">Kartica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Stavke fakture</Label>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      {idx === 0 && <Label className="text-[10px] text-muted-foreground">Proizvod</Label>}
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateLineItem(idx, 'productId', v)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Izaberite" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-[10px] text-muted-foreground">Količina</Label>}
                      <Input
                        type="number"
                        className="h-9 text-xs"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-[10px] text-muted-foreground">Cena</Label>}
                      <Input
                        type="number"
                        className="h-9 text-xs"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-[10px] text-muted-foreground">Popust %</Label>}
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
                  <Plus className="h-3 w-3" /> Dodaj stavku
                </Button>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-right">
                <span className="text-sm font-medium">Ukupno: </span>
                <span className="text-lg font-bold text-primary">{formatRSD(grandTotal)}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Napomene (opciono)</Label>
                <Input name="notes" placeholder="Napomene na fakturi" defaultValue={editingInvoice?.notes || ''} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : editingInvoice ? 'Sačuvaj Izmene' : 'Kreiraj Fakturu'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
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
                    <TableHead className="text-xs">Broj</TableHead>
                    <TableHead className="text-xs">Tip</TableHead>
                    <TableHead className="text-xs">Partner</TableHead>
                    <TableHead className="text-xs">Datum</TableHead>
                    <TableHead className="text-xs">Rok plaćanja</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Iznos</TableHead>
                    <TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                        Nema faktura za prikaz
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
                        <TableCell className="text-xs">{inv.partner?.name || '-'}</TableCell>
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
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(inv)} title="Štampaj">
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(inv)} title="Izmeni">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(inv.id)} title="Obriši">
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
    </>
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
