'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Eye, RotateCcw, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface ReturnItem {
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  condition: string
}

interface ReturnOrder {
  id: string
  returnNumber: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  returnReason: string
  items: string
  refundAmount: number
  refundMethod: string
  shippingCost: number
  restockingFee: number
  netRefund: number
  requestedDate: string
  receivedDate: string | null
  processedDate: string | null
  notes: string | null
  internalNotes: string | null
  createdAt: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  requested: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Zahtev' },
  approved: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Odobren' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Odbijen' },
  received: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Primljen' },
  inspecting: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Inspekcija' },
  refunded: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Refundiran' },
  exchanged: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', label: 'Zamena' },
  completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Završeno' },
}

const REASONS: Record<string, { label: string }> = {
  defective: { label: 'Defektan' },
  wrong_item: { label: 'Pogrešan artikal' },
  damaged: { label: 'Oštećen' },
  not_as_described: { label: 'Nije po opisu' },
  change_of_mind: { label: 'Promena mišljenja' },
  warranty: { label: 'Garancija' },
  other: { label: 'Ostalo' },
}

const REFUND_METHODS: Record<string, { label: string }> = {
  original: { label: 'Originalna plaćanja' },
  store_credit: { label: 'Bon kupovine' },
  bank_transfer: { label: 'Bankovni transfer' },
  replacement: { label: 'Zamena' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n)
}

function parseItems(itemsStr: string): ReturnItem[] {
  try {
    const parsed = JSON.parse(itemsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function Returns() {
  const [data, setData] = useState<ReturnOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [formOrderNumber, setFormOrderNumber] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerEmail, setFormCustomerEmail] = useState('')
  const [formCustomerPhone, setFormCustomerPhone] = useState('')
  const [formReason, setFormReason] = useState('other')
  const [formRefundMethod, setFormRefundMethod] = useState('original')
  const [formRefundAmount, setFormRefundAmount] = useState('')
  const [formShippingCost, setFormShippingCost] = useState('')
  const [formRestockingFee, setFormRestockingFee] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formProductName, setFormProductName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formQty, setFormQty] = useState('1')
  const [formUnitPrice, setFormUnitPrice] = useState('')
  const [formCondition, setFormCondition] = useState('new')
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (reasonFilter) params.set('reason', reasonFilter)
      const res = await fetch(`/api/returns?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, reasonFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    // Server-side filtering is done, but we can also filter client-side for analytics
    return data
  }, [data])

  const stats = useMemo(() => ({
    total: data.length,
    requested: data.filter(d => d.status === 'requested').length,
    inProcess: data.filter(d => ['approved', 'received', 'inspecting'].includes(d.status)).length,
    refunded: data.filter(d => d.status === 'refunded').length,
    rejected: data.filter(d => d.status === 'rejected').length,
    exchanged: data.filter(d => d.status === 'exchanged').length,
    totalRefunds: data.filter(d => ['refunded', 'completed'].includes(d.status)).reduce((s, d) => s + d.netRefund, 0),
    avgDays: (() => {
      const completed = data.filter(d => d.receivedDate && d.processedDate)
      if (!completed.length) return 0
      return (completed.reduce((s, d) => s + (new Date(d.processedDate!).getTime() - new Date(d.receivedDate!).getTime()) / 86400000, 0) / completed.length).toFixed(1)
    })(),
  }), [data])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status: ${STATUSES[newStatus]?.label}`)
        fetchData()
      }
    } catch {
      toast.error('Greška pri promeni statusa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati povrat?')) return
    try {
      const res = await fetch(`/api/returns/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Povrat obrisan')
        if (detailId === id) setDetailId(null)
        fetchData()
      }
    } catch {
      toast.error('Greška pri brisanju')
    }
  }

  const handleCreate = async () => {
    if (!formCustomerName.trim()) { toast.error('Unesite ime kupca'); return }
    setCreating(true)
    try {
      const items: ReturnItem[] = formProductName.trim() ? [{
        productName: formProductName, sku: formSku, quantity: parseInt(formQty) || 1,
        unitPrice: parseFloat(formUnitPrice) || 0, condition: formCondition,
      }] : []

      const refundAmount = parseFloat(formRefundAmount) || 0
      const shippingCost = parseFloat(formShippingCost) || 0
      const restockingFee = parseFloat(formRestockingFee) || 0
      const netRefund = Math.max(0, refundAmount - shippingCost - restockingFee)

      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: formOrderNumber, customerName: formCustomerName,
          customerEmail: formCustomerEmail, customerPhone: formCustomerPhone,
          returnReason: formReason, refundMethod: formRefundMethod,
          refundAmount, shippingCost, restockingFee, netRefund,
          items: JSON.stringify(items), notes: formNotes,
        }),
      })
      if (res.ok) {
        toast.success('Povrat kreiran')
        setShowCreate(false)
        resetForm()
        fetchData()
      } else {
        toast.error('Greška pri kreiranju')
      }
    } catch {
      toast.error('Greška pri kreiranju')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setFormOrderNumber(''); setFormCustomerName(''); setFormCustomerEmail('')
    setFormCustomerPhone(''); setFormReason('other'); setFormRefundMethod('original')
    setFormRefundAmount(''); setFormShippingCost(''); setFormRestockingFee('')
    setFormNotes(''); setFormProductName(''); setFormSku(''); setFormQty('1')
    setFormUnitPrice(''); setFormCondition('new')
  }

  if (loading && data.length === 0) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><RotateCcw className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Povrat robe</h1><p className="text-sm text-muted-foreground">Upravljanje povratom i zamjenama</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />Novi povrat</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Zahtevi</div><p className="text-xl font-bold text-slate-700">{stats.requested}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U procesu</div><p className="text-xl font-bold text-blue-700">{stats.inProcess}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Refundirano</div><p className="text-xl font-bold text-emerald-700">{stats.refunded}</p></Card>
        <Card className="p-4"><div className="text-xs text-violet-600 mb-1">Zamene</div><p className="text-xl font-bold text-violet-700">{stats.exchanged}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Odbijeni</div><p className="text-xl font-bold text-red-700">{stats.rejected}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno refund.</div><p className="text-xl font-bold">{formatCurrency(stats.totalRefunds)}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prosek dana</div><p className="text-xl font-bold">{stats.avgDays}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Svi povrati</TabsTrigger><TabsTrigger value="analytics">Analitika</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Povrati robe</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, kupac..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={reasonFilter || 'all'} onValueChange={v => setReasonFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi razlozi</SelectItem>{Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Broj</TableHead>
                    <TableHead className="text-xs">Narudžba</TableHead>
                    <TableHead className="text-xs">Kupac</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Razlog</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Refund</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
                    <TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema povrata</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                        <TableCell className="text-xs font-mono">{item.returnNumber}</TableCell>
                        <TableCell className="text-xs font-mono">{item.orderNumber}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-xs text-muted-foreground">{item.customerEmail}</div></TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{REASONS[item.returnReason]?.label}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.netRefund > 0 ? formatCurrency(item.netRefund) : '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.requestedDate)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-red-600" />Po razlogu povrata</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(REASONS).map(([k, v]) => {
                  const count = data.filter(d => d.returnReason === k).length
                  const amount = data.filter(d => d.returnReason === k).reduce((s, d) => s + d.netRefund, 0)
                  return <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{v.label}</p><p className="text-xs text-muted-foreground">{count} povrata</p></div><p className="text-xs font-bold">{formatCurrency(amount)}</p></div>
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-amber-600" />Finansijski pregled</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno refundirano</span><span className="text-xs font-bold text-red-600">{formatCurrency(stats.totalRefunds)}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno troškovi transporta</span><span className="text-xs font-bold">{formatCurrency(data.reduce((s, d) => s + d.shippingCost, 0))}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Ukupno restocking fee</span><span className="text-xs font-bold">{formatCurrency(data.reduce((s, d) => s + d.restockingFee, 0))}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><span className="text-xs font-medium">Neto gubitak</span><span className="text-xs font-bold text-emerald-700">{formatCurrency(stats.totalRefunds + data.reduce((s, d) => s + d.shippingCost + d.restockingFee, 0))}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs">Prosek obrade (dana)</span><span className="text-xs font-bold">{stats.avgDays}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail View */}
      {detailId && detailItem && (() => {
        const items = parseItems(detailItem.items)
        return (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-base">Detalji povrata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.returnNumber}</p><p className="text-xs text-muted-foreground">Narudžba: {detailItem.orderNumber}</p></div><div>{getStatusBadge(detailItem.status)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Kupac</div><p className="text-xs font-medium">{detailItem.customerName}</p><p className="text-xs text-muted-foreground">{detailItem.customerEmail}</p><p className="text-xs text-muted-foreground">{detailItem.customerPhone}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Razlog</div><p className="text-xs font-medium">{REASONS[detailItem.returnReason]?.label}</p><p className="text-xs text-muted-foreground">Način: {REFUND_METHODS[detailItem.refundMethod]?.label}</p><p className="text-xs text-muted-foreground">{detailItem.requestedDate && `Datum: ${formatDate(detailItem.requestedDate)}`}</p></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Refund</div><p className="text-xs font-bold">{formatCurrency(detailItem.refundAmount)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Transport</div><p className="text-xs font-bold">{formatCurrency(detailItem.shippingCost)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Restocking</div><p className="text-xs font-bold">{formatCurrency(detailItem.restockingFee)}</p></div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-xs text-emerald-600 mb-1">Neto refund</div><p className="text-xs font-bold text-emerald-700">{formatCurrency(detailItem.netRefund)}</p></div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Stavke:</p>
                  <Table><TableHeader><TableRow><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs">SKU</TableHead><TableHead className="text-xs">Kol.</TableHead><TableHead className="text-xs">Cena</TableHead><TableHead className="text-xs">Stanje</TableHead></TableRow></TableHeader>
                  <TableBody>{items.map((item, idx) => (
                    <TableRow key={idx}><TableCell className="text-xs">{item.productName}</TableCell><TableCell className="text-xs font-mono">{item.sku}</TableCell><TableCell className="text-xs">{item.quantity}</TableCell><TableCell className="text-xs">{formatCurrency(item.unitPrice)}</TableCell><TableCell className="text-xs"><Badge variant="outline" className="text-xs">{item.condition}</Badge></TableCell></TableRow>
                  ))}</TableBody></Table>
                </div>
              )}

              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Napomena kupca</p><p className="text-xs">{detailItem.notes}</p></div>}
              {detailItem.internalNotes && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-xs text-blue-600 mb-1">Interna beleška</p><p className="text-xs">{detailItem.internalNotes}</p></div>}

              <div className="flex items-center gap-3">
                <Label className="text-xs">Promeni status:</Label>
                <Select value={detailItem.status} onValueChange={v => handleStatusChange(detailItem.id, v)}><SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setShowCreate(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">Novi povrat robe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Broj narudžbe</Label><Input className="h-8 text-xs mt-1" value={formOrderNumber} onChange={e => setFormOrderNumber(e.target.value)} placeholder="ORD-..." /></div>
                <div><Label className="text-xs">Razlog povrata</Label><Select value={formReason} onValueChange={setFormReason}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Ime kupca *</Label><Input className="h-8 text-xs mt-1" value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} /></div>
                <div><Label className="text-xs">Telefon</Label><Input className="h-8 text-xs mt-1" value={formCustomerPhone} onChange={e => setFormCustomerPhone(e.target.value)} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="h-8 text-xs mt-1" value={formCustomerEmail} onChange={e => setFormCustomerEmail(e.target.value)} /></div>

              <div className="border-t pt-3"><p className="text-xs font-medium mb-2">Artikal</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Naziv proizvoda</Label><Input className="h-8 text-xs mt-1" value={formProductName} onChange={e => setFormProductName(e.target.value)} /></div>
                  <div><Label className="text-xs">SKU</Label><Input className="h-8 text-xs mt-1" value={formSku} onChange={e => setFormSku(e.target.value)} /></div>
                  <div><Label className="text-xs">Količina</Label><Input type="number" className="h-8 text-xs mt-1" value={formQty} onChange={e => setFormQty(e.target.value)} /></div>
                  <div><Label className="text-xs">Cena (RSD)</Label><Input type="number" className="h-8 text-xs mt-1" value={formUnitPrice} onChange={e => setFormUnitPrice(e.target.value)} /></div>
                </div>
                <div className="mt-2"><Label className="text-xs">Stanje artikla</Label><Select value={formCondition} onValueChange={setFormCondition}><SelectTrigger className="h-8 text-xs mt-1 w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">Nov</SelectItem><SelectItem value="used">Korišćen</SelectItem><SelectItem value="damaged">Oštećen</SelectItem><SelectItem value="missing">Nedostaje</SelectItem></SelectContent></Select></div>
              </div>

              <div className="border-t pt-3"><p className="text-xs font-medium mb-2">Refundacija</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Iznos refundacije</Label><Input type="number" className="h-8 text-xs mt-1" value={formRefundAmount} onChange={e => setFormRefundAmount(e.target.value)} /></div>
                  <div><Label className="text-xs">Način</Label><Select value={formRefundMethod} onValueChange={setFormRefundMethod}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(REFUND_METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs">Trošak transporta</Label><Input type="number" className="h-8 text-xs mt-1" value={formShippingCost} onChange={e => setFormShippingCost(e.target.value)} /></div>
                  <div><Label className="text-xs">Restocking fee</Label><Input type="number" className="h-8 text-xs mt-1" value={formRestockingFee} onChange={e => setFormRestockingFee(e.target.value)} /></div>
                </div>
              </div>

              <div><Label className="text-xs">Napomena</Label><Textarea className="text-xs mt-1" value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Otkaži</Button>
              <Button size="sm" onClick={handleCreate} disabled={creating}>{creating ? 'Čuvanje...' : 'Kreiraj povrat'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
