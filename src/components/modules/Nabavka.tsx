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
import { Pencil, Plus, Search, Trash2, ArrowLeft, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusLabel, getStatusColor } from '@/lib/helpers'

// ==================== INTERFACES ====================

interface Partner {
  id: string
  name: string
}

interface POItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

interface PurchaseOrder {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  totalAmount: number
  notes: string | null
  partner: { id: string; name: string } | null
  items: POItem[]
}

// Full purchase order data for printing (includes full partner details)
interface FullPurchaseOrder {
  id: string
  number: string
  date: string
  partnerId: string
  status: string
  totalAmount: number
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
  items: POItem[]
}

interface Product {
  id: string
  name: string
  purchasePrice: number
}

interface OrderLineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
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

export function Nabavka() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'print'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [printOrder, setPrintOrder] = useState<FullPurchaseOrder | null>(null)
  const [printLoading, setPrintLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [lineItems, setLineItems] = useState<OrderLineItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0 },
  ])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/purchase-orders?${params.toString()}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchOrders()
    fetch('/api/partners?type=dobavljac').then((r) => r.json()).then(setPartners)
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [fetchOrders])

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', productName: '', quantity: 1, unitPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof OrderLineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.purchasePrice
      }
    }
    setLineItems(updated)
  }

  const handleNew = () => {
    setEditingOrder(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
    setViewMode('form')
  }

  const handleEdit = (po: PurchaseOrder) => {
    setEditingOrder(po)
    setLineItems(po.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })))
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingOrder(null)
    setPrintOrder(null)
    setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
  }

  const handlePrint = async (po: PurchaseOrder) => {
    setPrintLoading(true)
    setViewMode('print')
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`)
      if (!res.ok) { toast.error('Greška pri učitavanju narudžbenice'); return }
      const data: FullPurchaseOrder = await res.json()
      setPrintOrder(data)
    } catch {
      toast.error('Greška pri učitavanju narudžbenice')
    } finally {
      setPrintLoading(false)
    }
  }

  const doPrint = () => {
    window.print()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu narudžbenicu?')) return
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      toast.success('Narudžbenica uspešno obrisana')
      fetchOrders()
    } catch { toast.error('Greška') }
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = String(Math.floor(Math.random() * 900) + 100)

    const body = {
      partnerId: fd.get('partnerId') as string,
      number: editingOrder ? editingOrder.number : `PO-${year}-${month}-${count}`,
      status: fd.get('status') as string || 'nacrt',
      notes: fd.get('notes') as string,
      items: lineItems.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    }

    try {
      const url = editingOrder ? `/api/purchase-orders/${editingOrder.id}` : '/api/purchase-orders'
      const res = await fetch(url, {
        method: editingOrder ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška')
        return
      }
      toast.success(editingOrder ? 'Narudžbenica uspešno ažurirana' : 'Narudžbenica uspešno kreirana')
      setViewMode('list')
      setEditingOrder(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
      fetchOrders()
    } catch {
      toast.error(editingOrder ? 'Greška pri ažuriranju narudžbenice' : 'Greška pri kreiranju narudžbenice')
    } finally {
      setSubmitting(false)
    }
  }

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
                {editingOrder ? 'Izmeni Narudžbenicu' : 'Nova Narudžbenica'}
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
                Pregled Narudžbenice {printOrder?.number || ''}
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
                <CardTitle className="text-base font-semibold">Nabavka</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Upravljanje narudžbenicama</p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> Nova Narudžbenica
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži narudžbenice..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="nacrt">Načrt</SelectItem>
                  <SelectItem value="poslata">Poslata</SelectItem>
                  <SelectItem value="primljena">Primljena</SelectItem>
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
          ) : printOrder ? (
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
                  <p className="text-lg font-bold uppercase tracking-wide">Narudžbenica</p>
                  <p className="text-xs text-gray-500 mt-1">Broj: <span className="font-mono font-medium text-gray-800">{printOrder.number}</span></p>
                  <p className="text-xs text-gray-500">Datum: {formatDate(printOrder.date)}</p>
                  <p className="text-xs text-gray-500">Mesto: Beograd</p>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Dobavljač</p>
                <p className="text-sm font-semibold">{printOrder.partner?.name || '-'}</p>
                {printOrder.partner && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {printOrder.partner.address && (
                      <span className="text-[10px] text-gray-500">{printOrder.partner.address}{printOrder.partner.city ? `, ${printOrder.partner.city}` : ''}</span>
                    )}
                    {printOrder.partner.pib && (
                      <span className="text-[10px] text-gray-500">PIB: {printOrder.partner.pib}</span>
                    )}
                    {printOrder.partner.maticniBr && (
                      <span className="text-[10px] text-gray-500">MB: {printOrder.partner.maticniBr}</span>
                    )}
                    {printOrder.partner.account && (
                      <span className="text-[10px] text-gray-500">{printOrder.partner.account}</span>
                    )}
                    {printOrder.partner.bank && (
                      <span className="text-[10px] text-gray-500">{printOrder.partner.bank}</span>
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
                    <th className="border border-gray-300 px-2 py-2 text-center w-12">Količina</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">Cena</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-14">Popust%</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">Iznos</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{item.productName}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right">{formatRSD(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">0</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-medium">{formatRSD(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end mb-6">
                <div className="w-72 space-y-1">
                  <div className="flex justify-between text-sm py-2 px-2 bg-gray-100 rounded font-bold border">
                    <span>UKUPNO:</span>
                    <span>{formatRSD(printOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 px-2">
                    <span className="text-gray-500">Slovima:</span>
                    <span className="font-medium italic text-gray-600">
                      {numberToSerbian(printOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Plaćanje</p>
                  <p><span className="text-gray-500">Način: </span>Uputnica</p>
                  <p><span className="text-gray-500">Račun: </span>{COMPANY.account}</p>
                  <p><span className="text-gray-500">Banka: </span>{COMPANY.bank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Status</p>
                  <p>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(printOrder.status)}`}>
                      {getStatusLabel(printOrder.status)}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Notes */}
              {printOrder.notes && (
                <div className="mb-6 text-xs">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Napomene</p>
                  <p className="text-gray-600">{printOrder.notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="print-footer grid grid-cols-2 gap-16 mt-10 pt-6 border-t">
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">Potpis naručioca</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">Potpis dobavljača</p>
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
                <Label className="text-xs">Dobavljač *</Label>
                <Select name="partnerId" required defaultValue={editingOrder?.partnerId || ''}>
                  <SelectTrigger><SelectValue placeholder="Izaberite dobavljača" /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select name="status" defaultValue={editingOrder?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">Načrt</SelectItem>
                    <SelectItem value="poslata">Poslata</SelectItem>
                    <SelectItem value="primljena">Primljena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold">Stavke narudžbenice</Label>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
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
                  <div className="col-span-3">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">Količina</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">Jed. cena</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
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
              <Input name="notes" placeholder="Napomene" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Čuvanje...' : editingOrder ? 'Sačuvaj Izmene' : 'Kreiraj Narudžbenicu'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </form>
        )}

        {/* ============ LIST ============ */}
        {viewMode === 'list' && loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
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
                  <TableHead className="text-xs">Dobavljač</TableHead>
                  <TableHead className="text-xs">Datum</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Stavki</TableHead>
                  <TableHead className="text-xs text-right">Iznos</TableHead>
                  <TableHead className="text-xs text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      Nema narudžbenica za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="text-xs font-medium">{po.number}</TableCell>
                      <TableCell className="text-xs">{po.partner?.name || '-'}</TableCell>
                      <TableCell className="text-xs">{formatDate(po.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getStatusColor(po.status)}`}>
                          {getStatusLabel(po.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{po.items.length}</TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {formatRSD(po.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handlePrint(po)} title="Štampaj">
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(po)} title="Izmeni">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(po.id)} title="Obriši">
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
