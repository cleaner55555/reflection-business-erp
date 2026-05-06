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
import { useTranslation, useContentTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
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

  // Batch-translate order content fields when data loads
  useEffect(() => {
    if (orders.length > 0) {
      const texts = orders.flatMap((po) => [
        po.partner?.name, po.notes, ...po.items.map((i) => i.productName)
      ].filter(Boolean) as string[])
      translateTexts(texts)
    }
  }, [orders, translateTexts])

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
      if (!res.ok) { toast.error(t('procurement.loadError')); return }
      const data: FullPurchaseOrder = await res.json()
      setPrintOrder(data)
    } catch {
      toast.error(t('procurement.loadError'))
    } finally {
      setPrintLoading(false)
    }
  }

  const doPrint = () => {
    window.print()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('procurement.confirmDelete'))) return
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('procurement.deleteSuccess'))
      fetchOrders()
    } catch { toast.error(t('common.error')) }
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
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(editingOrder ? t('procurement.updateSuccess') : t('procurement.createSuccess'))
      setViewMode('list')
      setEditingOrder(null)
      setLineItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }])
      fetchOrders()
    } catch {
      toast.error(editingOrder ? t('procurement.updateError') : t('procurement.createError'))
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
                {editingOrder ? t('procurement.editOrder') : t('procurement.newOrder')}
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
                {t('procurement.previewOrder')} {printOrder?.number || ''}
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
                <CardTitle className="text-base font-semibold">{t('procurement.title')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t('procurement.subtitle')}</p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> {t('procurement.newOrder')}
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('procurement.searchOrders')}
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder={t('procurement.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('procurement.allStatuses')}</SelectItem>
                  <SelectItem value="nacrt">{t('common.draft')}</SelectItem>
                  <SelectItem value="poslata">{t('common.sent')}</SelectItem>
                  <SelectItem value="primljena">{t('common.received')}</SelectItem>
                  <SelectItem value="otkazana">{t('common.cancelled')}</SelectItem>
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
                  <p className="text-lg font-bold uppercase tracking-wide">{t('procurement.purchaseOrder')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('common.number')}: <span className="font-mono font-medium text-gray-800">{printOrder.number}</span></p>
                  <p className="text-xs text-gray-500">{t('common.date')}: {formatDate(printOrder.date)}</p>
                  <p className="text-xs text-gray-500">{t('procurement.city')}: Beograd</p>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('procurement.supplier')}</p>
                <p className="text-sm font-semibold">{printOrder.partner?.name ? tc(printOrder.partner.name) : '-'}</p>
                {printOrder.partner && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {printOrder.partner.address && (
                      <span className="text-[10px] text-gray-500">{tc(printOrder.partner.address)}{printOrder.partner.city ? `, ${tc(printOrder.partner.city)}` : ''}</span>
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
                    <th className="border border-gray-300 px-2 py-2">{t('procurement.itemNameService')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-12">{t('common.quantity')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.price')}</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-14">%</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{tc(item.productName)}</td>
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
                    <span>{t('common.total')}:</span>
                    <span>{formatRSD(printOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 px-2">
                    <span className="text-gray-500">{t('procurement.inWords')}:</span>
                    <span className="font-medium italic text-gray-600">
                      {numberToSerbian(printOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('procurement.payment')}</p>
                  <p><span className="text-gray-500">{t('procurement.method')}: </span>{t('procurement.orderPayment')}</p>
                  <p><span className="text-gray-500">{t('procurement.account')}: </span>{COMPANY.account}</p>
                  <p><span className="text-gray-500">{t('procurement.bank')}: </span>{COMPANY.bank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('common.status')}</p>
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
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">{t('common.notes')}</p>
                  <p className="text-gray-600">{tc(printOrder.notes)}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="print-footer grid grid-cols-2 gap-16 mt-10 pt-6 border-t">
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('procurement.ordererSignature')}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-300 mb-1 pb-8"></div>
                  <p className="text-[10px] text-gray-400">{t('procurement.supplierSignature')}</p>
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
                <Label className="text-xs">{t('procurement.supplier')} *</Label>
                <Select name="partnerId" required defaultValue={editingOrder?.partnerId || ''}>
                  <SelectTrigger><SelectValue placeholder={t('procurement.selectSupplier')} /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.status')}</Label>
                <Select name="status" defaultValue={editingOrder?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">{t('common.draft')}</SelectItem>
                    <SelectItem value="poslata">{t('common.sent')}</SelectItem>
                    <SelectItem value="primljena">{t('common.received')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold">{t('procurement.orderItems')}</Label>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('procurement.product')}</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateLineItem(idx, 'productId', v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('common.quantity')}</Label>}
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('procurement.unitPrice')}</Label>}
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
                <Plus className="h-3 w-3" /> {t('procurement.addItem')}
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-right">
              <span className="text-sm font-medium">{t('common.total')}: </span>
              <span className="text-lg font-bold text-primary">{formatRSD(grandTotal)}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t('procurement.notesOptional')}</Label>
              <Input name="notes" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : editingOrder ? t('common.saveChanges') : t('procurement.createOrder')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
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
                  <TableHead className="text-xs">{t('common.number')}</TableHead>
                  <TableHead className="text-xs">{t('procurement.supplier')}</TableHead>
                  <TableHead className="text-xs">{t('common.date')}</TableHead>
                  <TableHead className="text-xs">{t('common.status')}</TableHead>
                  <TableHead className="text-xs">{t('procurement.items')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
                  <TableHead className="text-xs text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      {t('procurement.noOrders')}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="text-xs font-medium">{po.number}</TableCell>
                      <TableCell className="text-xs">{po.partner?.name ? tc(po.partner.name) : '-'}</TableCell>
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handlePrint(po)} title={t('common.print')}>
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(po)} title={t('common.edit')}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(po.id)} title={t('common.delete')}>
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
