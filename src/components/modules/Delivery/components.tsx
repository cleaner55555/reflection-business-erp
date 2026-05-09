'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Search, Trash2, Pencil, Eye, Package, Truck, Clock, MapPin, CheckCircle2, AlertTriangle, XCircle, BarChart3, FileText, CalendarDays, User, Phone, Plus } from 'lucide-react'
import { formatDate } from '@/lib/helpers'

import type { DeliveryItem } from './types'

// ─── Data ────────────────────────────────────────────────
export const INITIAL_DELIVERIES: DeliveryItem[] = [
  {
    id: '1', trackingNumber: 'DLY-2024-00001', senderName: 'TehnoShop d.o.o.', senderPhone: '+381 11 234 5678', senderAddress: 'Bulevar Mihajla Pupina 10, Beograd',
    recipientName: 'Jelena Marković', recipientPhone: '+381 21 456 7890', recipientAddress: 'Njegoševa 25, Novi Sad',
    status: 'out_for_delivery', priority: 'express', weight: 2.5, dimensions: '40x30x20 cm', codAmount: 15490, shippingCost: 850,
    estimatedDelivery: '2024-06-15', actualDelivery: null, assignedDriver: 'Marko Petrović', currentLocation: 'Novi Sad',
    notes: 'Fragile - electronics',
    history: [
      { date: '2024-06-14 08:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created' },
      { date: '2024-06-14 10:30', status: 'picked_up', location: 'Beograd', note: 'Package picked up from warehouse' },
      { date: '2024-06-14 12:00', status: 'in_transit', location: 'Beograd - Novi Sad', note: 'Departed hub' },
      { date: '2024-06-15 08:30', status: 'out_for_delivery', location: 'Novi Sad', note: 'Out for delivery' },
    ]
  },
  {
    id: '2', trackingNumber: 'DLY-2024-00002', senderName: 'BookWorld', senderPhone: '+381 11 345 6789', senderAddress: 'Knez Mihailova 5, Beograd',
    recipientName: 'Stefan Ilić', recipientPhone: '+381 18 567 8901', recipientAddress: 'Vojvode Mišića 12, Niš',
    status: 'in_transit', priority: 'standard', weight: 3.8, dimensions: '50x35x15 cm', codAmount: 0, shippingCost: 420,
    estimatedDelivery: '2024-06-16', actualDelivery: null, assignedDriver: 'Jovan Stanković', currentLocation: 'Beograd - Niš',
    notes: 'Books - no special handling',
    history: [
      { date: '2024-06-14 09:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created' },
      { date: '2024-06-14 14:00', status: 'picked_up', location: 'Beograd', note: 'Package picked up' },
      { date: '2024-06-15 06:00', status: 'in_transit', location: 'Beograd - Niš', note: 'In transit' },
    ]
  },
  {
    id: '3', trackingNumber: 'DLY-2024-00003', senderName: 'FurniturePro', senderPhone: '+381 11 456 7890', senderAddress: 'Industrijska zona 8, Beograd',
    recipientName: 'Ana Đorđević', recipientPhone: '+381 31 678 9012', recipientAddress: 'Bulevar Kralja Aleksandra 88, Subotica',
    status: 'delivered', priority: 'standard', weight: 45.2, dimensions: '120x80x60 cm', codAmount: 89900, shippingCost: 2100,
    estimatedDelivery: '2024-06-14', actualDelivery: '2024-06-14', assignedDriver: 'Slobodan Nikolić', currentLocation: 'Subotica',
    notes: 'Heavy furniture - 2 person delivery',
    history: [
      { date: '2024-06-13 08:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created' },
      { date: '2024-06-13 11:00', status: 'picked_up', location: 'Beograd', note: 'Package picked up' },
      { date: '2024-06-13 14:00', status: 'in_transit', location: 'Beograd - Subotica', note: 'In transit' },
      { date: '2024-06-14 09:00', status: 'out_for_delivery', location: 'Subotica', note: 'Out for delivery' },
      { date: '2024-06-14 11:30', status: 'delivered', location: 'Subotica', note: 'Delivered - COD collected' },
    ]
  },
  {
    id: '4', trackingNumber: 'DLY-2024-00004', senderName: 'PharmaPlus', senderPhone: '+381 11 567 8901', senderAddress: 'Takovska 3, Beograd',
    recipientName: 'Petar Stanković', recipientPhone: '+381 34 789 0123', recipientAddress: 'Kraljeva Petra I 15, Kragujevac',
    status: 'failed', priority: 'express', weight: 0.5, dimensions: '15x10x5 cm', codAmount: 3200, shippingCost: 620,
    estimatedDelivery: '2024-06-15', actualDelivery: null, assignedDriver: 'Dragan Milić', currentLocation: 'Kragujevac',
    notes: 'Medicines - temperature sensitive',
    history: [
      { date: '2024-06-14 10:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created' },
      { date: '2024-06-14 12:00', status: 'picked_up', location: 'Beograd', note: 'Package picked up (refrigerated)' },
      { date: '2024-06-15 07:00', status: 'in_transit', location: 'Beograd - Kragujevac', note: 'In transit' },
      { date: '2024-06-15 10:00', status: 'out_for_delivery', location: 'Kragujevac', note: 'Out for delivery' },
      { date: '2024-06-15 12:00', status: 'failed', location: 'Kragujevac', note: 'Recipient not home - 2nd attempt scheduled' },
    ]
  },
  {
    id: '5', trackingNumber: 'DLY-2024-00005', senderName: 'AutoParts RS', senderPhone: '+381 11 678 9012', senderAddress: 'Zmaj Jovina 7, Beograd',
    recipientName: 'Miroslav Jovanović', recipientPhone: '+381 36 890 1234', recipientAddress: 'Partizanska 42, Zrenjanin',
    status: 'pending_pickup', priority: 'economy', weight: 12.5, dimensions: '80x50x30 cm', codAmount: 0, shippingCost: 380,
    estimatedDelivery: '2024-06-18', actualDelivery: null, assignedDriver: '', currentLocation: 'Beograd',
    notes: 'Auto parts - brake pads and filters',
    history: [
      { date: '2024-06-15 08:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created - awaiting pickup' },
    ]
  },
  {
    id: '6', trackingNumber: 'DLY-2024-00006', senderName: 'Gourmet Foods', senderPhone: '+381 11 789 0123', senderAddress: 'Strahinjića Bana 22, Beograd',
    recipientName: 'Ljubica Perić', recipientPhone: '+381 35 901 2345', recipientAddress: 'Trg Kralja Milana 5, Čačak',
    status: 'returned', priority: 'standard', weight: 5.0, dimensions: '60x40x25 cm', codAmount: 12800, shippingCost: 560,
    estimatedDelivery: '2024-06-13', actualDelivery: null, assignedDriver: 'Nebojša Jovanović', currentLocation: 'Beograd',
    notes: 'Food products - cold chain required. Returned due to wrong address.',
    history: [
      { date: '2024-06-12 09:00', status: 'pending_pickup', location: 'Beograd', note: 'Order created' },
      { date: '2024-06-12 14:00', status: 'picked_up', location: 'Beograd', note: 'Package picked up (refrigerated)' },
      { date: '2024-06-13 06:00', status: 'in_transit', location: 'Beograd - Čačak', note: 'In transit' },
      { date: '2024-06-13 11:00', status: 'failed', location: 'Čačak', note: 'Wrong address - no one at location' },
      { date: '2024-06-13 15:00', status: 'returned', location: 'Beograd', note: 'Returned to sender' },
    ]
  },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  pending_pickup: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Čeka preuzimanje' },
  picked_up: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Preuzeto' },
  in_transit: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U tranzitu' },
  out_for_delivery: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', label: 'Isporuka' },
  delivered: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Isporučeno' },
  failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Neuspešno' },
  returned: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'Vraćeno' },
}

export const PRIORITIES: Record<string, { color: string; label: string }> = {
  express: { color: 'bg-red-100 text-red-700', label: 'Ekspress' },
  standard: { color: 'bg-blue-100 text-blue-700', label: 'Standard' },
  economy: { color: 'bg-slate-100 text-slate-600', label: 'Ekonomik' },
}

// ─── Helpers ─────────────────────────────────────────────
export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function getPriorityBadge(p: string) {
  const r = PRIORITIES[p]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{p}</Badge>
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n)
}

function getStatusIcon(s: string) {
  switch (s) {
    case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
    case 'returned': return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default: return <Package className="h-4 w-4 text-blue-600" />
  }
}

// ─── Sub-Components ──────────────────────────────────────

import type { DeliveryListTabProps } from './types'

export function DeliveryListTab({ filtered, search, statusFilter, priorityFilter, onSearch, onStatusFilter, onPriorityFilter, onView, onEdit, onDelete }: DeliveryListTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Sve pošiljke</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj pošiljke, primalac..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => onSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={priorityFilter || 'all'} onValueChange={v => onPriorityFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Prioritet" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Broj</TableHead>
              <TableHead className="text-xs">Primalac</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Adresa</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Prioritet</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">COD</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
              <TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema pronađenih pošiljki</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(item.id)}>
                  <TableCell className="text-xs font-mono">{item.trackingNumber}</TableCell>
                  <TableCell><div className="text-xs font-medium">{item.recipientName}</div><div className="text-xs text-muted-foreground">{item.recipientPhone}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">{item.recipientAddress}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">{getPriorityBadge(item.priority)}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{item.codAmount > 0 ? formatCurrency(item.codAmount) : '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.estimatedDelivery)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

import type { TrackingTabProps } from './types'

export function TrackingTab({ data, onStatusChange, onView }: TrackingTabProps) {
  const active = data.filter(d => !['delivered', 'returned'].includes(d.status))
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" />Praćenje pošiljki</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
        {active.map(item => (
          <div key={item.id} className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="text-xs font-mono font-bold">{item.trackingNumber}</span>{getPriorityBadge(item.priority)}</div>
              {getStatusBadge(item.status)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2"><User className="h-3 w-3 text-muted-foreground" /><span>{item.recipientName}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" /><span>{item.recipientPhone}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" /><span className="truncate">{item.recipientAddress}</span></div>
              <div className="flex items-center gap-2"><Truck className="h-3 w-3 text-muted-foreground" /><span>{item.assignedDriver || 'Nije dodeljen'}</span></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /><span>Trenutna lokacija: {item.currentLocation}</span>
            </div>
            <div className="space-y-1.5">
              {item.history.slice(-3).map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div><span className="text-muted-foreground">{h.date}</span> — <span className="font-medium">{STATUSES[h.status]?.label || h.status}</span> — {h.location}{h.note ? `: ${h.note}` : ''}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={item.status} onValueChange={v => onStatusChange(item.id, v as DeliveryItem['status'])}>
                <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onView(item.id)}>Detalji</Button>
            </div>
          </div>
        ))}
        {active.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nema aktivnih pošiljki za praćenje</p>}
      </CardContent>
    </Card>
  )
}

import type { OverviewTabProps } from './types'

export function OverviewTab({ data, stats }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-600" />Statistika dostava</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {Object.entries(STATUSES).map(([k, v]) => {
              const count = data.filter(d => d.status === k).length
              const pct = data.length > 0 ? Math.round((count / data.length) * 100) : 0
              return (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-xs"><span>{v.label}</span><span className="font-medium">{count} ({pct}%)</span></div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" />Predviđene dostave</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {data.filter(d => !['delivered', 'returned', 'failed'].includes(d.status)).sort((a, b) => a.estimatedDelivery.localeCompare(b.estimatedDelivery)).map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div><p className="text-xs font-medium">{d.trackingNumber}</p><p className="text-xs text-muted-foreground">{d.recipientName}</p></div>
              <div className="text-right"><p className="text-xs">{formatDate(d.estimatedDelivery)}</p>{getPriorityBadge(d.priority)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-amber-600" />Po vozaču</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {(() => {
            const driverMap: Record<string, { total: number; active: number; delivered: number }> = {}
            data.forEach(d => {
              if (!d.assignedDriver) return
              if (!driverMap[d.assignedDriver]) driverMap[d.assignedDriver] = { total: 0, active: 0, delivered: 0 }
              driverMap[d.assignedDriver].total++
              if (['in_transit', 'out_for_delivery'].includes(d.status)) driverMap[d.assignedDriver].active++
              if (d.status === 'delivered') driverMap[d.assignedDriver].delivered++
            })
            return Object.entries(driverMap).map(([driver, info]) => (
              <div key={driver} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div><p className="text-xs font-medium">{driver}</p><p className="text-xs text-muted-foreground">{info.total} pošiljki · {info.delivered} isporučeno</p></div>
                {info.active > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{info.active} aktivna</Badge>}
              </div>
            ))
          })()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-violet-600" />Neuspešne isporuke</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {data.filter(d => d.status === 'failed').length === 0 ? <p className="text-xs text-muted-foreground">Nema neuspešnih isporuka</p> : data.filter(d => d.status === 'failed').map(d => (
            <div key={d.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 space-y-1">
              <div className="flex justify-between"><span className="text-xs font-mono">{d.trackingNumber}</span><Badge className="bg-red-100 text-red-700 text-xs">{d.attempt || 1}. pokušaj</Badge></div>
              <p className="text-xs">{d.recipientName} — {d.recipientAddress}</p>
              <p className="text-xs text-muted-foreground">{d.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

import type { DetailDialogProps } from './types'

export function DetailDialog({ detailItem, onClose, onStatusChange }: DetailDialogProps) {
  if (!detailItem) return null
  return (
    <Dialog open={!!detailItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Detalji pošiljke</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-lg font-bold font-mono">{detailItem.trackingNumber}</p><p className="text-xs text-muted-foreground">{formatDate(detailItem.estimatedDelivery)}</p></div>
            <div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Pošiljalac</p>
              <p className="text-xs font-medium">{detailItem.senderName}</p>
              <p className="text-xs text-muted-foreground">{detailItem.senderPhone}</p>
              <p className="text-xs text-muted-foreground">{detailItem.senderAddress}</p>
            </div>
            <div className="p-3 rounded-lg border space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Primalac</p>
              <p className="text-xs font-medium">{detailItem.recipientName}</p>
              <p className="text-xs text-muted-foreground">{detailItem.recipientPhone}</p>
              <p className="text-xs text-muted-foreground">{detailItem.recipientAddress}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Težina</div><p className="text-xs font-medium">{detailItem.weight} kg</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Dimenzije</div><p className="text-xs font-medium">{detailItem.dimensions}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Trošak</div><p className="text-xs font-medium">{formatCurrency(detailItem.shippingCost)}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">COD</div><p className="text-xs font-bold">{detailItem.codAmount > 0 ? formatCurrency(detailItem.codAmount) : 'Nema'}</p></div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Vozač</div><p className="text-xs font-medium">{detailItem.assignedDriver || 'Nije dodeljen'}</p><p className="text-xs text-muted-foreground mt-1">Trenutna lokacija: {detailItem.currentLocation}</p></div>
          <div className="space-y-3">
            <p className="text-xs font-medium flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Istorija praćenja</p>
            <div className="space-y-2">
              {[...detailItem.history].reverse().map((h, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-muted">{getStatusIcon(h.status)}</div>
                    {idx < detailItem.history.length - 1 && <div className="w-px h-4 bg-border mt-1" />}
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{h.date}</span>
                      {getStatusBadge(h.status)}
                    </div>
                    <p className="text-xs">{h.location}</p>
                    {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
          <div className="flex gap-2">
            <Select value={detailItem.status} onValueChange={v => onStatusChange(detailItem.id, v as DeliveryItem['status'])}>
              <SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import type { DeliveryFormData, DeliveryFormDialogProps } from './types'

export function DeliveryFormDialog({ open, editItem, formData, onOpenChange, onFormFieldChange, onSave, onEditItemChange }: DeliveryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) onEditItemChange(null) }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi dostavu' : 'Nova dostava'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="p-3 rounded-lg border space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Pošiljalac</p>
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input placeholder="Naziv firme ili ime" className="text-xs" value={formData.senderName} onChange={e => onFormFieldChange('senderName', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input placeholder="+381..." className="text-xs" value={formData.senderPhone} onChange={e => onFormFieldChange('senderPhone', e.target.value)} /></div>
              <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority} onValueChange={v => onFormFieldChange('priority', v)}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input placeholder="Ulica i broj, grad" className="text-xs" value={formData.senderAddress} onChange={e => onFormFieldChange('senderAddress', e.target.value)} /></div>
          </div>
          <div className="p-3 rounded-lg border space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Primalac</p>
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input placeholder="Ime primaoca" className="text-xs" value={formData.recipientName} onChange={e => onFormFieldChange('recipientName', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input placeholder="+381..." className="text-xs" value={formData.recipientPhone} onChange={e => onFormFieldChange('recipientPhone', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Adresa *</Label><Input placeholder="Ulica i broj, grad" className="text-xs" value={formData.recipientAddress} onChange={e => onFormFieldChange('recipientAddress', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Težina (kg)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.weight || ''} onChange={e => onFormFieldChange('weight', Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Dimenzije</Label><Input placeholder="40x30x20 cm" className="text-xs" value={formData.dimensions} onChange={e => onFormFieldChange('dimensions', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">COD (RSD)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.codAmount || ''} onChange={e => onFormFieldChange('codAmount', Number(e.target.value))} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Posebne instrukcije..." className="text-xs" value={formData.notes} onChange={e => onFormFieldChange('notes', e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => { onOpenChange(false); onEditItemChange(null) }}>Otkaži</Button><Button onClick={onSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
