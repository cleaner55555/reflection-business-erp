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
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, Package, Truck, Clock, MapPin, CheckCircle2, AlertTriangle, XCircle, BarChart3, FileText, CalendarDays, User, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────
interface DeliveryItem {
  id: string
  trackingNumber: string
  senderName: string
  senderPhone: string
  senderAddress: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  priority: 'express' | 'standard' | 'economy'
  weight: number
  dimensions: string
  codAmount: number
  shippingCost: number
  estimatedDelivery: string
  actualDelivery: string | null
  assignedDriver: string
  currentLocation: string
  notes: string
  history: { date: string; status: string; location: string; note: string }[]
}

// ─── Data ────────────────────────────────────────────────
const INITIAL_DELIVERIES: DeliveryItem[] = [
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

const STATUSES: Record<string, { color: string; label: string }> = {
  pending_pickup: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Čeka preuzimanje' },
  picked_up: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Preuzeto' },
  in_transit: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U tranzitu' },
  out_for_delivery: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', label: 'Isporuka' },
  delivered: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Isporučeno' },
  failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Neuspešno' },
  returned: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'Vraćeno' },
}

const PRIORITIES: Record<string, { color: string; label: string }> = {
  express: { color: 'bg-red-100 text-red-700', label: 'Ekspress' },
  standard: { color: 'bg-blue-100 text-blue-700', label: 'Standard' },
  economy: { color: 'bg-slate-100 text-slate-600', label: 'Ekonomik' },
}

const DRIVERS = ['Marko Petrović', 'Jovan Stanković', 'Slobodan Nikolić', 'Dragan Milić', 'Nebojša Jovanović', 'Predrag Tomić']

// ─── Helpers ─────────────────────────────────────────────
function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

function getPriorityBadge(p: string) {
  const r = PRIORITIES[p]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{p}</Badge>
}

function formatCurrency(n: number) {
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

// ─── Component ───────────────────────────────────────────
export function Dostava() {
  const [data, setData] = useState<DeliveryItem[]>(INITIAL_DELIVERIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<DeliveryItem | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard' as DeliveryItem['priority'], weight: 0, dimensions: '', codAmount: 0, notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.trackingNumber.toLowerCase().includes(search.toLowerCase()) || item.recipientName.toLowerCase().includes(search.toLowerCase()) || item.senderName.toLowerCase().includes(search.toLowerCase()) || item.recipientAddress.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  }), [data, search, statusFilter, priorityFilter])

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter(d => d.status === 'pending_pickup').length,
    inTransit: data.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length,
    delivered: data.filter(d => d.status === 'delivered').length,
    failed: data.filter(d => d.status === 'failed').length,
    returned: data.filter(d => d.status === 'returned').length,
    totalRevenue: data.reduce((s, d) => s + d.shippingCost, 0),
    totalCOD: data.filter(d => d.status === 'delivered').reduce((s, d) => s + d.codAmount, 0),
  }), [data])

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati dostavu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Dostava obrisana')
  }

  const handleStatusChange = (id: string, newStatus: DeliveryItem['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, history: [...d.history, { date: new Date().toLocaleString('sr-RS'), status: newStatus, location: d.currentLocation, note: `Status changed to ${STATUSES[newStatus]?.label}` }] } : d))
    toast.success(`Status promenjen: ${STATUSES[newStatus]?.label}`)
  }

  const handleOpenCreate = () => {
    setFormData({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard', weight: 0, dimensions: '', codAmount: 0, notes: '' })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: DeliveryItem) => {
    setFormData({ senderName: item.senderName, senderPhone: item.senderPhone, senderAddress: item.senderAddress, recipientName: item.recipientName, recipientPhone: item.recipientPhone, recipientAddress: item.recipientAddress, priority: item.priority, weight: item.weight, dimensions: item.dimensions, codAmount: item.codAmount, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.senderName || !formData.recipientName || !formData.recipientAddress) {
      toast.error('Popunite sva obavezna polja')
      return
    }
    if (editItem) {
      setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d))
      toast.success('Dostava ažurirana')
    } else {
      const newItem: DeliveryItem = {
        ...formData, id: String(Date.now()), trackingNumber: `DLY-${new Date().getFullYear()}-${String(data.length + 1).padStart(5, '0')}`,
        status: 'pending_pickup', shippingCost: formData.priority === 'express' ? 850 : formData.priority === 'standard' ? 420 : 280,
        estimatedDelivery: new Date(Date.now() + (formData.priority === 'express' ? 1 : formData.priority === 'standard' ? 3 : 5) * 86400000).toISOString().split('T')[0],
        actualDelivery: null, assignedDriver: '', currentLocation: formData.senderAddress, history: [{ date: new Date().toLocaleString('sr-RS'), status: 'pending_pickup', location: formData.senderAddress, note: 'Order created' }]
      }
      setData(prev => [newItem, ...prev])
      toast.success('Nova dostava kreirana')
    }
    setDialogOpen(false)
    setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Package className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Dostava</h1><p className="text-sm text-muted-foreground">Upravljanje isporukama i praćenje pošiljki</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova dostava</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U tranzitu</div><p className="text-xl font-bold text-blue-700">{stats.inTransit}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Isporučeno</div><p className="text-xl font-bold text-emerald-700">{stats.delivered}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Neuspešno</div><p className="text-xl font-bold text-red-700">{stats.failed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-orange-600 mb-1">Vraćeno</div><p className="text-xl font-bold text-orange-700">{stats.returned}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prihodi</div><p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">COD</div><p className="text-xl font-bold">{formatCurrency(stats.totalCOD)}</p></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Pošiljke</TabsTrigger><TabsTrigger value="tracking">Praćenje</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sve pošiljke</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj pošiljke, primalac..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={priorityFilter || 'all'} onValueChange={v => setPriorityFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Prioritet" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
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
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                        <TableCell className="text-xs font-mono">{item.trackingNumber}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.recipientName}</div><div className="text-[10px] text-muted-foreground">{item.recipientPhone}</div></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">{item.recipientAddress}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{item.codAmount > 0 ? formatCurrency(item.codAmount) : '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.estimatedDelivery)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
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

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" />Praćenje pošiljki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
              {data.filter(d => !['delivered', 'returned'].includes(d.status)).map(item => (
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
                      <div key={idx} className="flex items-start gap-2 text-[10px]">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        <div><span className="text-muted-foreground">{h.date}</span> — <span className="font-medium">{STATUSES[h.status]?.label || h.status}</span> — {h.location}{h.note ? `: ${h.note}` : ''}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v as DeliveryItem['status'])}>
                      <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDetailId(item.id)}>Detalji</Button>
                  </div>
                </div>
              ))}
              {data.filter(d => !['delivered', 'returned'].includes(d.status)).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nema aktivnih pošiljki za praćenje</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
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
                    <div><p className="text-xs font-medium">{d.trackingNumber}</p><p className="text-[10px] text-muted-foreground">{d.recipientName}</p></div>
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
                      <div><p className="text-xs font-medium">{driver}</p><p className="text-[10px] text-muted-foreground">{info.total} pošiljki · {info.delivered} isporučeno</p></div>
                      {info.active > 0 && <Badge className="bg-blue-100 text-blue-700 text-[10px]">{info.active} aktivna</Badge>}
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
                    <div className="flex justify-between"><span className="text-xs font-mono">{d.trackingNumber}</span><Badge className="bg-red-100 text-red-700 text-[10px]">{d.attempt || 1}. pokušaj</Badge></div>
                    <p className="text-xs">{d.recipientName} — {d.recipientAddress}</p>
                    <p className="text-[10px] text-muted-foreground">{d.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji pošiljke</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-lg font-bold font-mono">{detailItem.trackingNumber}</p><p className="text-xs text-muted-foreground">{formatDate(detailItem.estimatedDelivery)}</p></div>
                <div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Pošiljalac</p>
                  <p className="text-xs font-medium">{detailItem.senderName}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.senderPhone}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.senderAddress}</p>
                </div>
                <div className="p-3 rounded-lg border space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Primalac</p>
                  <p className="text-xs font-medium">{detailItem.recipientName}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.recipientPhone}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.recipientAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Težina</div><p className="text-xs font-medium">{detailItem.weight} kg</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Dimenzije</div><p className="text-xs font-medium">{detailItem.dimensions}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Trošak</div><p className="text-xs font-medium">{formatCurrency(detailItem.shippingCost)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">COD</div><p className="text-xs font-bold">{detailItem.codAmount > 0 ? formatCurrency(detailItem.codAmount) : 'Nema'}</p></div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vozač</div><p className="text-xs font-medium">{detailItem.assignedDriver || 'Nije dodeljen'}</p><p className="text-[10px] text-muted-foreground mt-1">Trenutna lokacija: {detailItem.currentLocation}</p></div>

              {/* Timeline */}
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
                          <span className="text-[10px] text-muted-foreground">{h.date}</span>
                          {getStatusBadge(h.status)}
                        </div>
                        <p className="text-xs">{h.location}</p>
                        {h.note && <p className="text-[10px] text-muted-foreground">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}

              <div className="flex gap-2">
                <Select value={detailItem.status} onValueChange={v => handleStatusChange(detailItem.id, v as DeliveryItem['status'])}>
                  <SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi dostavu' : 'Nova dostava'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-3 rounded-lg border space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Pošiljalac</p>
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input placeholder="Naziv firme ili ime" className="text-xs" value={formData.senderName} onChange={e => setFormData(p => ({ ...p, senderName: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input placeholder="+381..." className="text-xs" value={formData.senderPhone} onChange={e => setFormData(p => ({ ...p, senderPhone: e.target.value }))} /></div>
                <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as DeliveryItem['priority'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input placeholder="Ulica i broj, grad" className="text-xs" value={formData.senderAddress} onChange={e => setFormData(p => ({ ...p, senderAddress: e.target.value }))} /></div>
            </div>
            <div className="p-3 rounded-lg border space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Primalac</p>
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input placeholder="Ime primaoca" className="text-xs" value={formData.recipientName} onChange={e => setFormData(p => ({ ...p, recipientName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input placeholder="+381..." className="text-xs" value={formData.recipientPhone} onChange={e => setFormData(p => ({ ...p, recipientPhone: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Adresa *</Label><Input placeholder="Ulica i broj, grad" className="text-xs" value={formData.recipientAddress} onChange={e => setFormData(p => ({ ...p, recipientAddress: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Težina (kg)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.weight || ''} onChange={e => setFormData(p => ({ ...p, weight: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Dimenzije</Label><Input placeholder="40x30x20 cm" className="text-xs" value={formData.dimensions} onChange={e => setFormData(p => ({ ...p, dimensions: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">COD (RSD)</Label><Input type="number" placeholder="0" className="text-xs" value={formData.codAmount || ''} onChange={e => setFormData(p => ({ ...p, codAmount: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Posebne instrukcije..." className="text-xs" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
