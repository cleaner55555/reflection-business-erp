'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShoppingCart, Plus, Search, Trash2, Pencil, Package, Truck, CheckCircle2, Clock, XCircle, Eye, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, formatDateTime } from '@/lib/helpers'

interface Order { id: string; number: string; partnerName: string; items: OrderItem[]; status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; total: number; date: string; deliveryDate: string | null; notes: string; paymentMethod: string }
interface OrderItem { id: string; productName: string; quantity: number; unitPrice: number; total: number }

const INITIAL: Order[] = [
  { id: '1', number: 'POR-2024-001', partnerName: 'ACME doo', items: [{ id: '1', productName: 'Hleb beli 500g', quantity: 50, unitPrice: 80, total: 4000 }, { id: '2', productName: 'Mleko 1L', quantity: 30, unitPrice: 150, total: 4500 }], status: 'delivered', total: 8500, date: '2024-06-10T09:00:00', deliveryDate: '2024-06-11T14:00:00', notes: '', paymentMethod: 'racun' },
  { id: '2', number: 'POR-2024-002', partnerName: 'Tech Solutions', items: [{ id: '1', productName: 'Kafa zrna 250g', quantity: 20, unitPrice: 800, total: 16000 }], status: 'shipped', total: 16000, date: '2024-06-14T10:00:00', deliveryDate: null, notes: 'Hitna isporuka', paymentMethod: 'racun' },
  { id: '3', number: 'POR-2024-003', partnerName: 'Mini Market', items: [{ id: '1', productName: 'Šećer 1kg', quantity: 100, unitPrice: 120, total: 12000 }, { id: '2', productName: 'Ulje 1L', quantity: 50, unitPrice: 350, total: 17500 }], status: 'processing', total: 29500, date: '2024-06-15T11:00:00', deliveryDate: null, notes: '', paymentMethod: 'gotovina' },
  { id: '4', number: 'POR-2024-004', partnerName: 'Delta Trade', items: [{ id: '1', productName: 'Cokolada 100g', quantity: 200, unitPrice: 180, total: 36000 }], status: 'confirmed', total: 36000, date: '2024-06-15T14:30:00', deliveryDate: null, notes: 'Poštanska štedionica', paymentMethod: 'racun' },
  { id: '5', number: 'POR-2024-005', partnerName: 'Green Energy', items: [{ id: '1', productName: 'Hleb beli 500g', quantity: 25, unitPrice: 80, total: 2000 }], status: 'draft', total: 2000, date: '2024-06-15T16:00:00', deliveryDate: null, notes: '', paymentMethod: 'racun' },
  { id: '6', number: 'POR-2024-006', partnerName: 'StartUp Lab', items: [{ id: '1', productName: 'Mleko 1L', quantity: 10, unitPrice: 150, total: 1500 }], status: 'cancelled', total: 1500, date: '2024-06-12T08:00:00', deliveryDate: null, notes: 'Otkazano od strane kupca', paymentMethod: 'racun' },
]

function getStatusBadge(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-slate-100 text-slate-600', label: 'Načrt' },
    confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Potvrđena' },
    processing: { color: 'bg-amber-100 text-amber-800', label: 'U obradi' },
    shipped: { color: 'bg-violet-100 text-violet-800', label: 'Poslata' },
    delivered: { color: 'bg-emerald-100 text-emerald-800', label: 'Isporučena' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazana' },
  }
  const r = map[s] || map.draft; return <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge>
}

export function Narudzbenice() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const [formData, setFormData] = useState({ partnerName: '', paymentMethod: 'racun', notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => { setOrders(INITIAL); setLoading(false) }, 200) }, [])

  const stats = { total: orders.length, draft: orders.filter(o => o.status === 'draft').length, active: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length, delivered: orders.filter(o => o.status === 'delivered').length, totalValue: orders.reduce((s, o) => s + o.total, 0), cancelled: orders.filter(o => o.status === 'cancelled').length }

  const filtered = orders.filter(o => (!search || o.number.toLowerCase().includes(search.toLowerCase()) || o.partnerName.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || o.status === statusFilter))

  const handleNew = () => { setEditing(null); setFormData({ partnerName: '', paymentMethod: 'racun', notes: '' }); setDialogOpen(true) }
  const handleEdit = (o: Order) => { setEditing(o); setFormData({ partnerName: o.partnerName, paymentMethod: o.paymentMethod, notes: o.notes }); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.partnerName) { toast.error('Unesite partnera'); return }
    if (editing) { setOrders(prev => prev.map(o => o.id === editing.id ? { ...o, ...formData } : o)); toast.success('Narudžbenica ažurirana') }
    else {
      const now = new Date()
      const num = `POR-${now.getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`
      setOrders(prev => [{ id: `ord-${Date.now()}`, number: num, partnerName: formData.partnerName, items: [], status: 'draft', total: 0, date: now.toISOString(), deliveryDate: null, notes: formData.notes, paymentMethod: formData.paymentMethod }, ...prev])
      toast.success('Narudžbenica kreirana')
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setOrders(prev => prev.filter(o => o.id !== id)); toast.success('Obrisano') }

  const handleStatusChange = (id: string, status: Order['status']) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, status, deliveryDate: status === 'delivered' ? new Date().toISOString() : o.deliveryDate } : o)); toast.success('Status promenjen') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  const detailOrder = detailId ? orders.find(o => o.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShoppingCart className="h-6 w-6" />Наруджбенице</h1><p className="text-sm text-muted-foreground">Управљање набавком и наруџбеницама</p></div>
        <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Нова наруџбеница</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><ShoppingCart className="h-3.5 w-3.5" />Укупно</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-slate-600 mb-1"><Clock className="h-3.5 w-3.5" />Нацрти</div><p className="text-2xl font-bold">{stats.draft}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><Package className="h-3.5 w-3.5" />Активних</div><p className="text-2xl font-bold text-blue-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Isporučeno</div><p className="text-2xl font-bold text-emerald-700">{stats.delivered}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Truck className="h-3.5 w-3.5" />Ukupna vrednost</div><p className="text-lg font-bold">{formatRSD(stats.totalValue)}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><XCircle className="h-3.5 w-3.5" />Otkazano</div><p className="text-2xl font-bold text-red-700">{stats.cancelled}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista narudžbenica</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem><SelectItem value="draft">Načrt</SelectItem><SelectItem value="confirmed">Potvrđena</SelectItem><SelectItem value="processing">U obradi</SelectItem><SelectItem value="shipped">Poslata</SelectItem><SelectItem value="delivered">Isporučena</SelectItem><SelectItem value="cancelled">Otkazana</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Broj</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs hidden sm:table-cell">Stavki</TableHead><TableHead className="text-xs">Iznos</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema narudžbenica</TableCell></TableRow> : filtered.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono font-bold">{o.number}</TableCell>
                    <TableCell className="text-xs font-medium">{o.partnerName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{o.items.length} stavki</TableCell>
                    <TableCell className="text-xs font-bold">{formatRSD(o.total)}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(o.date)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(o.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      {o.status !== 'delivered' && o.status !== 'cancelled' && <Select value={o.status} onValueChange={v => handleStatusChange(o.id, v as Order['status'])}><SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{Object.keys(getStatusBadge({} as string) ? {} : { draft: '', confirmed: '', processing: '', shipped: '', cancelled: '' }).map(k => <SelectItem key={k} value={k}>{getStatusBadge(k).props.children}</SelectItem>)}</SelectContent></Select>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Narudžbenica {detailOrder?.number}</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Partner:</span> <span className="font-medium">{detailOrder.partnerName}</span></div>
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(detailOrder.status)}</div>
                <div><span className="text-muted-foreground">Datum:</span> {formatDateTime(detailOrder.date)}</div>
                <div><span className="text-muted-foreground">Isporuka:</span> {detailOrder.deliveryDate ? formatDate(detailOrder.deliveryDate) : '—'}</div>
              </div>
              <Table><TableHeader><TableRow><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs text-right">Kol.</TableHead><TableHead className="text-xs text-right">Cena</TableHead><TableHead className="text-xs text-right">Ukupno</TableHead></TableRow></TableHeader><TableBody>
                {detailOrder.items.map(item => (<TableRow key={item.id}><TableCell className="text-xs">{item.productName}</TableCell><TableCell className="text-xs text-right">{item.quantity}</TableCell><TableCell className="text-xs text-right">{formatRSD(item.unitPrice)}</TableCell><TableCell className="text-xs text-right font-bold">{formatRSD(item.total)}</TableCell></TableRow>))}
                <TableRow className="font-bold"><TableCell colSpan={3} className="text-xs text-right">Ukupno:</TableCell><TableCell className="text-xs text-right">{formatRSD(detailOrder.total)}</TableCell></TableRow>
              </TableBody></Table>
              {detailOrder.notes && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">Napomena: {detailOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Nova'} narudžbenica</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Partner *</Label><Input value={formData.partnerName} onChange={e => setFormData(p => ({ ...p, partnerName: e.target.value }))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Način plaćanja</Label><Select value={formData.paymentMethod} onValueChange={v => setFormData(p => ({ ...p, paymentMethod: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="racun">Račun</SelectItem><SelectItem value="gotovina">Gotovina</SelectItem><SelectItem value="kartica">Kartica</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Napomena</Label><Input value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
