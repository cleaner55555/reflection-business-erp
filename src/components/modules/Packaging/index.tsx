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
import { Plus, Search, Trash2, Pencil, Eye, Package, Box, Weight, Ruler, Tag, BarChart3, Layers, QrCode, ScanBarcode, FileCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface PackagingOrder {
  id: string
  orderNumber: string
  orderId: string
  customerName: string
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'shipped'
  priority: 'urgent' | 'normal' | 'low'
  packagingType: 'standard' | 'fragile' | 'temperature' | 'bulk' | 'custom'
  items: PackagingItem[]
  totalWeight: number
  totalVolume: number
  boxCount: number
  packagingCost: number
  assignedTo: string
  startDate: string
  completedDate: string | null
  notes: string
}

interface PackagingItem {
  id: string
  productName: string
  sku: string
  quantity: number
  boxType: string
  boxDimensions: string
  weight: number
  labelPrinted: boolean
  qcPassed: boolean | null
  barcode: string
}

const INITIAL_DATA: PackagingOrder[] = [
  {
    id: '1', orderNumber: 'PKG-2024-001', orderId: 'ORD-4521', customerName: 'TehnoShop d.o.o.', status: 'in_progress', priority: 'urgent',
    packagingType: 'fragile',
    items: [
      { id: 'i1', productName: 'Monitor 27"', sku: 'MON-2701', quantity: 10, boxType: 'Karton A', boxDimensions: '70x40x15 cm', weight: 8.5, labelPrinted: true, qcPassed: true, barcode: '8601234567890' },
      { id: 'i2', productName: 'Laptop 15.6"', sku: 'LAP-1501', quantity: 20, boxType: 'Karton B', boxDimensions: '50x35x10 cm', weight: 3.2, labelPrinted: true, qcPassed: null, barcode: '8601234567891' },
      { id: 'i3', productName: 'Tablet 10"', sku: 'TAB-1001', quantity: 30, boxType: 'Karton C', boxDimensions: '35x25x8 cm', weight: 1.1, labelPrinted: false, qcPassed: null, barcode: '8601234567892' },
    ],
    totalWeight: 185.5, totalVolume: 2.8, boxCount: 60, packagingCost: 4500, assignedTo: 'Sana Marković',
    startDate: '2024-06-15', completedDate: null, notes: 'Fragilna roba - koristiti penaste zaštitne folije'
  },
  {
    id: '2', orderNumber: 'PKG-2024-002', orderId: 'ORD-4522', customerName: 'BookWorld', status: 'pending', priority: 'normal',
    packagingType: 'standard',
    items: [
      { id: 'i4', productName: 'Knjiga - Roman', sku: 'BKN-R01', quantity: 100, boxType: 'Papirna kesica', boxDimensions: '30x20x5 cm', weight: 0.4, labelPrinted: false, qcPassed: null, barcode: '8609876543210' },
      { id: 'i5', productName: 'Knjiga - Enciklopedija', sku: 'BKN-E01', quantity: 50, boxType: 'Karton D', boxDimensions: '40x30x10 cm', weight: 2.8, labelPrinted: false, qcPassed: null, barcode: '8609876543211' },
    ],
    totalWeight: 180, totalVolume: 1.2, boxCount: 150, packagingCost: 2800, assignedTo: '',
    startDate: '', completedDate: null, notes: ''
  },
  {
    id: '3', orderNumber: 'PKG-2024-003', orderId: 'ORD-4518', customerName: 'FreshFoods', status: 'quality_check', priority: 'urgent',
    packagingType: 'temperature',
    items: [
      { id: 'i6', productName: 'Mlečni proizvodi paket', sku: 'MLK-P01', quantity: 200, boxType: 'Termo kutija', boxDimensions: '60x40x30 cm', weight: 12, labelPrinted: true, qcPassed: true, barcode: '8605554443332' },
      { id: 'i7', productName: 'Meso - pileća prsa', sku: 'MES-P01', quantity: 150, boxType: 'Stiropor kutija', boxDimensions: '50x35x25 cm', weight: 8, labelPrinted: true, qcPassed: true, barcode: '8605554443333' },
    ],
    totalWeight: 3600, totalVolume: 15.5, boxCount: 350, packagingCost: 18500, assignedTo: 'Mladen Jovanović',
    startDate: '2024-06-14', completedDate: null, notes: 'Hlađena roba - termometri obavezni. Temperatura: 2-4°C'
  },
  {
    id: '4', orderNumber: 'PKG-2024-004', orderId: 'ORD-4515', customerName: 'BuildMat', status: 'completed', priority: 'low',
    packagingType: 'bulk',
    items: [
      { id: 'i8', productName: 'Cement 25kg', sku: 'CMT-25', quantity: 500, boxType: 'Jumbo vreća', boxDimensions: '60x40x20 cm', weight: 25.5, labelPrinted: true, qcPassed: true, barcode: '8601112223334' },
      { id: 'i9', productName: 'Gips karton 12.5mm', sku: 'GKP-125', quantity: 200, boxType: 'Folia zavesa', boxDimensions: '120x25x12 cm', weight: 28, labelPrinted: true, qcPassed: true, barcode: '8601112223335' },
    ],
    totalWeight: 18650, totalVolume: 38, boxCount: 700, packagingCost: 5200, assignedTo: 'Goran Stanković',
    startDate: '2024-06-13', completedDate: '2024-06-14', notes: 'Teška roba - paletizacija'
  },
  {
    id: '5', orderNumber: 'PKG-2024-005', orderId: 'ORD-4525', customerName: 'PharmaPlus', status: 'pending', priority: 'urgent',
    packagingType: 'custom',
    items: [
      { id: 'i10', productName: 'Lek - Antibiotik', sku: 'LKM-A01', quantity: 500, boxType: 'Sigurnosna ambalaža', boxDimensions: '40x30x20 cm', weight: 5, labelPrinted: false, qcPassed: null, barcode: '8607778889990' },
      { id: 'i11', productName: 'Vitamini paket', sku: 'VIT-M01', quantity: 1000, boxType: 'Karton E', boxDimensions: '35x25x15 cm', weight: 2, labelPrinted: false, qcPassed: null, barcode: '8607778889991' },
    ],
    totalWeight: 4500, totalVolume: 8.5, boxCount: 1500, packagingCost: 12500, assignedTo: '',
    startDate: '', completedDate: null, notes: 'Farmaceutska ambalaža - GMP standard obavezan. Tamper evident zaštita.'
  },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Čeka' },
  in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U toku' },
  quality_check: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'QC' },
  completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Završeno' },
  shipped: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', label: 'Poslato' },
}

const PRIORITIES: Record<string, { color: string; label: string }> = {
  urgent: { color: 'bg-red-100 text-red-700', label: 'Hitno' },
  normal: { color: 'bg-blue-100 text-blue-700', label: 'Normalno' },
  low: { color: 'bg-slate-100 text-slate-600', label: 'Nizak' },
}

const PACK_TYPES: Record<string, { color: string; label: string }> = {
  standard: { color: 'bg-slate-100 text-slate-700', label: 'Standardno' },
  fragile: { color: 'bg-red-100 text-red-700', label: 'Fragilno' },
  temperature: { color: 'bg-sky-100 text-sky-700', label: 'Termo' },
  bulk: { color: 'bg-amber-100 text-amber-700', label: 'Bulk' },
  custom: { color: 'bg-violet-100 text-violet-700', label: 'Posebno' },
}

const WORKERS = ['Sana Marković', 'Mladen Jovanović', 'Goran Stanković', 'Ivana Petrović', 'Nenad Đorđević']

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getPriorityBadge(p: string) { const r = PRIORITIES[p]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{p}</Badge> }
function getPackTypeBadge(t: string) { const r = PACK_TYPES[t]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{t}</Badge> }

function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }

export function Packaging() {
  const [data, setData] = useState<PackagingOrder[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<PackagingOrder | null>(null)
  const [formData, setFormData] = useState({ orderNumber: '', orderId: '', customerName: '', priority: 'normal' as PackagingOrder['priority'], packagingType: 'standard' as PackagingOrder['packagingType'], notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.orderNumber.toLowerCase().includes(search.toLowerCase()) || item.orderId.toLowerCase().includes(search.toLowerCase()) || item.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.packagingType === typeFilter
    return matchSearch && matchStatus && matchType
  }), [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, pending: data.filter(d => d.status === 'pending').length, inProgress: data.filter(d => d.status === 'in_progress').length,
    qc: data.filter(d => d.status === 'quality_check').length, completed: data.filter(d => d.status === 'completed').length,
    totalItems: data.reduce((s, d) => s + d.items.reduce((is, i) => is + i.quantity, 0), 0),
    totalCost: data.reduce((s, d) => s + d.packagingCost, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati nalog?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Nalog obrisan') }

  const handleToggleLabel = (orderId: string, itemId: string) => {
    setData(prev => prev.map(d => d.id === orderId ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, labelPrinted: !i.labelPrinted } : i) } : d))
    toast.success('Labela ažurirana')
  }

  const handleToggleQC = (orderId: string, itemId: string, passed: boolean) => {
    setData(prev => prev.map(d => d.id === orderId ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, qcPassed: passed } : i) } : d))
    toast.success(passed ? 'QC prošao' : 'QC pao')
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Box className="h-5 w-5 text-orange-700 dark:text-orange-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Pakovanje</h1><p className="text-sm text-muted-foreground">Upravljanje pakovanjem robe i etiketiranjem</p></div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novi nalog</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">QC</div><p className="text-xl font-bold text-amber-700">{stats.qc}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Završeno</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Stavki</div><p className="text-xl font-bold">{stats.totalItems}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Troškovi</div><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Pakovanje narudžbina</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, kupac..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(PACK_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Nalog</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Narudžba</TableHead>
                <TableHead className="text-xs">Kupac</TableHead>
                <TableHead className="text-xs">Tip</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Stavke</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Kutije</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Težina</TableHead>
                <TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema naloga</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-mono font-bold">{item.orderNumber}</TableCell>
                    <TableCell className="text-xs font-mono hidden sm:table-cell">{item.orderId}</TableCell>
                    <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-[10px] text-muted-foreground">{item.assignedTo || 'Nije dodeljen'}</div></TableCell>
                    <TableCell>{getPackTypeBadge(item.packagingType)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.items.length} proizvoda</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.boxCount}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.totalWeight >= 1000 ? `${(item.totalWeight / 1000).toFixed(1)}t` : `${item.totalWeight}kg`}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji naloga za pakovanje</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.orderNumber}</p><p className="text-xs text-muted-foreground">Narudžba: {detailItem.orderId} · {detailItem.customerName}</p></div><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}{getPackTypeBadge(detailItem.packagingType)}</div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Ukupno kutija</div><p className="text-xs font-bold">{detailItem.boxCount}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Težina</div><p className="text-xs font-bold">{detailItem.totalWeight >= 1000 ? `${(detailItem.totalWeight / 1000).toFixed(1)}t` : `${detailItem.totalWeight}kg`}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Zapremina</div><p className="text-xs font-bold">{detailItem.totalVolume} m³</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Troškovi</div><p className="text-xs font-bold">{formatCurrency(detailItem.packagingCost)}</p></div>
              </div>
              {detailItem.assignedTo && <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Zaduzeni</div><p className="text-xs font-medium">{detailItem.assignedTo}</p></div>}
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Instrukcije</p><p className="text-xs">{detailItem.notes}</p></div>}

              <div className="space-y-2">
                <p className="text-xs font-medium">Stavke:</p>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-[10px]">Proizvod</TableHead>
                    <TableHead className="text-[10px]">SKU</TableHead>
                    <TableHead className="text-[10px]">Količina</TableHead>
                    <TableHead className="text-[10px]">Kutija</TableHead>
                    <TableHead className="text-[10px]">Dimenzije</TableHead>
                    <TableHead className="text-[10px]">Labela</TableHead>
                    <TableHead className="text-[10px]">QC</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {detailItem.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-[10px] font-medium">{item.productName}</TableCell>
                        <TableCell className="text-[10px] font-mono">{item.sku}</TableCell>
                        <TableCell className="text-[10px]">{item.quantity}</TableCell>
                        <TableCell className="text-[10px]">{item.boxType}</TableCell>
                        <TableCell className="text-[10px]">{item.boxDimensions}</TableCell>
                        <TableCell><Button variant={item.labelPrinted ? 'outline' : 'ghost'} size="sm" className="h-6 text-[10px] gap-1" onClick={() => handleToggleLabel(detailItem.id, item.id)}>{item.labelPrinted ? <><CheckCircle2 className="h-3 w-3 text-emerald-600" />Štamp.</> : <><ScanBarcode className="h-3 w-3" />Nije</>}</Button></TableCell>
                        <TableCell><div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 text-emerald-600" onClick={() => handleToggleQC(detailItem.id, item.id, true)}><CheckCircle2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 text-red-600" onClick={() => handleToggleQC(detailItem.id, item.id, false)}><AlertTriangle className="h-3 w-3" /></Button>
                          {item.qcPassed === true && <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">OK</Badge>}
                          {item.qcPassed === false && <Badge className="bg-red-100 text-red-700 text-[9px]">FAIL</Badge>}
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
