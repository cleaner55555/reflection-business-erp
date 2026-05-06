'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, RotateCcw, Package, AlertTriangle, CheckCircle2, Clock, XCircle, DollarSign, TrendingUp, BarChart3, FileText, User, CalendarDays, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface ReturnItem {
  id: string
  returnNumber: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'inspecting' | 'refunded' | 'exchanged' | 'completed'
  returnReason: 'defective' | 'wrong_item' | 'damaged' | 'not_as_described' | 'change_of_mind' | 'warranty' | 'other'
  items: { productName: string; sku: string; quantity: number; unitPrice: number; condition: 'new' | 'used' | 'damaged' | 'missing' }[]
  refundAmount: number
  refundMethod: 'original' | 'store_credit' | 'bank_transfer' | 'replacement'
  shippingCost: number
  restockingFee: number
  netRefund: number
  requestedDate: string
  receivedDate: string | null
  processedDate: string | null
  notes: string
  internalNotes: string
}

const INITIAL_DATA: ReturnItem[] = [
  {
    id: '1', returnNumber: 'RET-2024-001', orderNumber: 'ORD-4521', customerName: 'Jelena Marković', customerEmail: 'jelena@email.com', customerPhone: '+381 63 111 2222',
    status: 'received', returnReason: 'defective',
    items: [{ productName: 'Bluetooth zvučnik', sku: 'BTS-001', quantity: 1, unitPrice: 8990, condition: 'used' }],
    refundAmount: 8990, refundMethod: 'original', shippingCost: 450, restockingFee: 0, netRefund: 8990,
    requestedDate: '2024-06-12', receivedDate: '2024-06-14', processedDate: null, notes: 'Zvučnik ne radi - distorzija zvuka', internalNotes: 'Poslato za inspekciju kvaliteta'
  },
  {
    id: '2', returnNumber: 'RET-2024-002', orderNumber: 'ORD-4518', customerName: 'Stefan Ilić', customerEmail: 'stefan@email.com', customerPhone: '+381 64 333 4444',
    status: 'refunded', returnReason: 'wrong_item',
    items: [{ productName: 'Tenisice vel. 43', sku: 'SHO-043', quantity: 1, unitPrice: 12500, condition: 'new' }, { productName: 'Tenisice vel. 44', sku: 'SHO-044', quantity: 1, unitPrice: 12500, condition: 'new' }],
    refundAmount: 25000, refundMethod: 'original', shippingCost: 0, restockingFee: 0, netRefund: 25000,
    requestedDate: '2024-06-10', receivedDate: '2024-06-12', processedDate: '2024-06-13', notes: 'Stigla pogrešna veličina (42 umesto 43 i 44)', internalNotes: 'Greška magacionera - kompenzacija za transport'
  },
  {
    id: '3', returnNumber: 'RET-2024-003', orderNumber: 'ORD-4525', customerName: 'Ana Đorđević', customerEmail: 'ana@email.com', customerPhone: '+381 65 555 6666',
    status: 'requested', returnReason: 'change_of_mind',
    items: [{ productName: 'Majica - crna', sku: 'TSH-BLK', quantity: 2, unitPrice: 2490, condition: 'new' }],
    refundAmount: 4980, refundMethod: 'store_credit', shippingCost: 450, restockingFee: 250, netRefund: 4280,
    requestedDate: '2024-06-15', receivedDate: null, processedDate: null, notes: 'Nije odgovara veličina', internalNotes: ''
  },
  {
    id: '4', returnNumber: 'RET-2024-004', orderNumber: 'ORD-4510', customerName: 'Petar Stanković', customerEmail: 'petar@email.com', customerPhone: '+381 66 777 8888',
    status: 'rejected', returnReason: 'not_as_described',
    items: [{ productName: 'Drvena stolica', sku: 'CHR-W01', quantity: 2, unitPrice: 18500, condition: 'damaged' }],
    refundAmount: 0, refundMethod: 'original', shippingCost: 0, restockingFee: 0, netRefund: 0,
    requestedDate: '2024-06-08', receivedDate: '2024-06-10', processedDate: '2024-06-11', notes: 'Stolica je oštećena pri transportu', internalNotes: 'Oštećenje nije naša greška - kupac je odbio da plati transport povratka'
  },
  {
    id: '5', returnNumber: 'RET-2024-005', orderNumber: 'ORD-4505', customerName: 'Miroslav Jovanović', customerEmail: 'miroslav@email.com', customerPhone: '+381 62 999 0000',
    status: 'inspecting', returnReason: 'warranty',
    items: [{ productName: 'Bosch bušilica', sku: 'DRL-BOS01', quantity: 1, unitPrice: 35900, condition: 'used' }],
    refundAmount: 35900, refundMethod: 'replacement', shippingCost: 0, restockingFee: 0, netRefund: 0,
    requestedDate: '2024-06-13', receivedDate: '2024-06-14', processedDate: null, notes: 'Garancija 2 godine - motor ne radi', internalNotes: 'Poslato servisu Bosch za dijagnostiku'
  },
  {
    id: '6', returnNumber: 'RET-2024-006', orderNumber: 'ORD-4530', customerName: 'Ljubica Perić', customerEmail: 'ljubica@email.com', customerPhone: '+381 61 123 4567',
    status: 'exchanged', returnReason: 'damaged',
    items: [{ productName: 'Keramičke šolje set (6 kom)', sku: 'CUP-SET6', quantity: 1, unitPrice: 4200, condition: 'damaged' }],
    refundAmount: 0, refundMethod: 'replacement', shippingCost: 0, restockingFee: 0, netRefund: 4200,
    requestedDate: '2024-06-11', receivedDate: '2024-06-13', processedDate: '2024-06-14', notes: '2 šolje nastradale u transportu', internalNotes: 'Zamena poslata - nove šolje pakovane bolje'
  },
]

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

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }

export function PovratRobe() {
  const [data, setData] = useState<ReturnItem[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.returnNumber.toLowerCase().includes(search.toLowerCase()) || item.orderNumber.toLowerCase().includes(search.toLowerCase()) || item.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchReason = !reasonFilter || item.returnReason === reasonFilter
    return matchSearch && matchStatus && matchReason
  }), [data, search, statusFilter, reasonFilter])

  const stats = useMemo(() => ({
    total: data.length, requested: data.filter(d => d.status === 'requested').length, inProcess: data.filter(d => ['approved', 'received', 'inspecting'].includes(d.status)).length,
    refunded: data.filter(d => d.status === 'refunded').length, rejected: data.filter(d => d.status === 'rejected').length, exchanged: data.filter(d => d.status === 'exchanged').length,
    totalRefunds: data.filter(d => ['refunded', 'completed'].includes(d.status)).reduce((s, d) => s + d.netRefund, 0),
    avgDays: (() => { const completed = data.filter(d => d.receivedDate && d.processedDate); if (!completed.length) return 0; return (completed.reduce((s, d) => s + (new Date(d.processedDate!).getTime() - new Date(d.receivedDate!).getTime()) / 86400000, 0) / completed.length).toFixed(1) })(),
  }), [data])

  const handleStatusChange = (id: string, newStatus: ReturnItem['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, processedDate: ['refunded', 'exchanged', 'completed', 'rejected'].includes(newStatus) ? new Date().toISOString().split('T')[0] : d.processedDate } : d))
    toast.success(`Status: ${STATUSES[newStatus]?.label}`)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati povrat?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Povrat obrisan') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><RotateCcw className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Povrat robe</h1><p className="text-sm text-muted-foreground">Upravljanje povratom i zamjenama</p></div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novi povrat</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Zahtevi</div><p className="text-xl font-bold text-slate-700">{stats.requested}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U procesu</div><p className="text-xl font-bold text-blue-700">{stats.inProcess}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Refundirano</div><p className="text-xl font-bold text-emerald-700">{stats.refunded}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-violet-600 mb-1">Zamene</div><p className="text-xl font-bold text-violet-700">{stats.exchanged}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Odbijeni</div><p className="text-xl font-bold text-red-700">{stats.rejected}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno refund.</div><p className="text-xl font-bold">{formatCurrency(stats.totalRefunds)}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prosek dana</div><p className="text-xl font-bold">{stats.avgDays}</p></Card>
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
                        <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-[10px] text-muted-foreground">{item.customerEmail}</div></TableCell>
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
                  return <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{v.label}</p><p className="text-[10px] text-muted-foreground">{count} povrata</p></div><p className="text-xs font-bold">{formatCurrency(amount)}</p></div>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji povrata</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.returnNumber}</p><p className="text-xs text-muted-foreground">Narudžba: {detailItem.orderNumber}</p></div><div>{getStatusBadge(detailItem.status)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Kupac</div><p className="text-xs font-medium">{detailItem.customerName}</p><p className="text-[10px] text-muted-foreground">{detailItem.customerEmail}</p><p className="text-[10px] text-muted-foreground">{detailItem.customerPhone}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Razlog</div><p className="text-xs font-medium">{REASONS[detailItem.returnReason]?.label}</p><p className="text-[10px] text-muted-foreground">Nacin: {REFUND_METHODS[detailItem.refundMethod]?.label}</p><p className="text-[10px] text-muted-foreground">{detailItem.requestedDate && `Datum: ${formatDate(detailItem.requestedDate)}`}</p></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Refund</div><p className="text-xs font-bold">{formatCurrency(detailItem.refundAmount)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Transport</div><p className="text-xs font-bold">{formatCurrency(detailItem.shippingCost)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Restocking</div><p className="text-xs font-bold">{formatCurrency(detailItem.restockingFee)}</p></div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-[10px] text-emerald-600 mb-1">Neto refund</div><p className="text-xs font-bold text-emerald-700">{formatCurrency(detailItem.netRefund)}</p></div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Stavke:</p>
                <Table><TableHeader><TableRow><TableHead className="text-[10px]">Proizvod</TableHead><TableHead className="text-[10px]">SKU</TableHead><TableHead className="text-[10px]">Kol.</TableHead><TableHead className="text-[10px]">Cena</TableHead><TableHead className="text-[10px]">Stanje</TableHead></TableRow></TableHeader>
                <TableBody>{detailItem.items.map((item, idx) => (
                  <TableRow key={idx}><TableCell className="text-[10px]">{item.productName}</TableCell><TableCell className="text-[10px] font-mono">{item.sku}</TableCell><TableCell className="text-[10px]">{item.quantity}</TableCell><TableCell className="text-[10px]">{formatCurrency(item.unitPrice)}</TableCell><TableCell className="text-[10px]"><Badge variant="outline" className="text-[9px]">{item.condition}</Badge></TableCell></TableRow>
                ))}</TableBody></Table>
              </div>

              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Napomena kupca</p><p className="text-xs">{detailItem.notes}</p></div>}
              {detailItem.internalNotes && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-[10px] text-blue-600 mb-1">Interna beleška</p><p className="text-xs">{detailItem.internalNotes}</p></div>}

              <div className="flex items-center gap-3">
                <Label className="text-xs">Promeni status:</Label>
                <Select value={detailItem.status} onValueChange={v => handleStatusChange(detailItem.id, v as ReturnItem['status'])}><SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
