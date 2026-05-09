'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, Package, Box, CheckCircle2, ScanBarcode, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

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

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getPriorityBadge(p: string) { const r = PRIORITIES[p]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{p}</Badge> }
function getPackTypeBadge(t: string) { const r = PACK_TYPES[t]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{t}</Badge> }

function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }

export function Packaging() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<PackagingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<PackagingOrder | null>(null)
  const [formData, setFormData] = useState({ orderNumber: '', orderId: '', customerName: '', priority: 'normal' as PackagingOrder['priority'], packagingType: 'standard' as PackagingOrder['packagingType'], notes: '' })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/packaging?companyId=${activeCompanyId}`)
      if (res.ok) {
        const items = await res.json()
        setData(items)
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }, [activeCompanyId])

  useEffect(() => { fetchData() }, [fetchData])

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

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati nalog?')) return
    try {
      const res = await fetch(`/api/packaging/${id}?companyId=${activeCompanyId}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => prev.filter(i => i.id !== id))
        toast.success('Nalog obrisan')
      }
    } catch { toast.error('Greška pri brisanju') }
  }, [activeCompanyId])

  const handleToggleLabel = useCallback(async (orderId: string, itemId: string) => {
    const order = data.find(d => d.id === orderId)
    if (!order) return
    const updatedItems = order.items.map(i => i.id === itemId ? { ...i, labelPrinted: !i.labelPrinted } : i)
    try {
      const res = await fetch(`/api/packaging/${orderId}?companyId=${activeCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: JSON.stringify(updatedItems) }),
      })
      if (res.ok) {
        setData(prev => prev.map(d => d.id === orderId ? { ...d, items: updatedItems } : d))
        toast.success('Labela ažurirana')
      }
    } catch { toast.error('Greška') }
  }, [data, activeCompanyId])

  const handleToggleQC = useCallback(async (orderId: string, itemId: string, passed: boolean) => {
    const order = data.find(d => d.id === orderId)
    if (!order) return
    const updatedItems = order.items.map(i => i.id === itemId ? { ...i, qcPassed: passed } : i)
    try {
      const res = await fetch(`/api/packaging/${orderId}?companyId=${activeCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: JSON.stringify(updatedItems) }),
      })
      if (res.ok) {
        setData(prev => prev.map(d => d.id === orderId ? { ...d, items: updatedItems } : d))
        toast.success(passed ? 'QC prošao' : 'QC pao')
      }
    } catch { toast.error('Greška') }
  }, [data, activeCompanyId])

  const handleOpenCreate = useCallback(() => {
    setFormData({ orderNumber: `PKG-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, orderId: '', customerName: '', priority: 'normal', packagingType: 'standard', notes: '' })
    setEditItem(null)
    setDialogOpen(true)
  }, [data.length])

  const handleSave = useCallback(async () => {
    if (!formData.orderNumber || !formData.customerName) { toast.error('Popunite obavezna polja'); return }
    try {
      const url = editItem ? `/api/packaging/${editItem.id}?companyId=${activeCompanyId}` : `/api/packaging?companyId=${activeCompanyId}`
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem ? { ...formData, companyId: activeCompanyId } : { ...formData, companyId: activeCompanyId, status: 'pending', items: '[]', totalWeight: 0, totalVolume: 0, boxCount: 0, packagingCost: 0, assignedTo: '', startDate: '', completedDate: '' }),
      })
      if (res.ok) {
        const saved = await res.json()
        if (editItem) {
          setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d))
          toast.success('Nalog ažuriran')
        } else {
          setData(prev => [saved, ...prev])
          toast.success('Novi nalog kreiran')
        }
        setDialogOpen(false)
        setEditItem(null)
      }
    } catch { toast.error('Greška pri čuvanju') }
  }, [editItem, formData, activeCompanyId])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Box className="h-5 w-5 text-orange-700 dark:text-orange-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Pakovanje</h1><p className="text-sm text-muted-foreground">Upravljanje pakovanjem robe i etiketiranjem</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Novi nalog</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">QC</div><p className="text-xl font-bold text-amber-700">{stats.qc}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Završeno</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Stavki</div><p className="text-xl font-bold">{stats.totalItems}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Troškovi</div><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></Card>
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
                    <TableCell><div className="text-xs font-medium">{item.customerName}</div><div className="text-xs text-muted-foreground">{item.assignedTo || 'Nije dodeljen'}</div></TableCell>
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
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Ukupno kutija</div><p className="text-xs font-bold">{detailItem.boxCount}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Težina</div><p className="text-xs font-bold">{detailItem.totalWeight >= 1000 ? `${(detailItem.totalWeight / 1000).toFixed(1)}t` : `${detailItem.totalWeight}kg`}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Zapremina</div><p className="text-xs font-bold">{detailItem.totalVolume} m³</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Troškovi</div><p className="text-xs font-bold">{formatCurrency(detailItem.packagingCost)}</p></div>
              </div>
              {detailItem.assignedTo && <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Zaduzeni</div><p className="text-xs font-medium">{detailItem.assignedTo}</p></div>}
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Instrukcije</p><p className="text-xs">{detailItem.notes}</p></div>}

              <div className="space-y-2">
                <p className="text-xs font-medium">Stavke:</p>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Proizvod</TableHead>
                    <TableHead className="text-xs">SKU</TableHead>
                    <TableHead className="text-xs">Količina</TableHead>
                    <TableHead className="text-xs">Kutija</TableHead>
                    <TableHead className="text-xs">Dimenzije</TableHead>
                    <TableHead className="text-xs">Labela</TableHead>
                    <TableHead className="text-xs">QC</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {detailItem.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                        <TableCell className="text-xs font-mono">{item.sku}</TableCell>
                        <TableCell className="text-xs">{item.quantity}</TableCell>
                        <TableCell className="text-xs">{item.boxType}</TableCell>
                        <TableCell className="text-xs">{item.boxDimensions}</TableCell>
                        <TableCell><Button variant={item.labelPrinted ? 'outline' : 'ghost'} size="sm" className="h-6 text-xs gap-1" onClick={() => handleToggleLabel(detailItem.id, item.id)}>{item.labelPrinted ? <><CheckCircle2 className="h-3 w-3 text-emerald-600" />Štamp.</> : <><ScanBarcode className="h-3 w-3" />Nije</>}</Button></TableCell>
                        <TableCell><div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 text-emerald-600" onClick={() => handleToggleQC(detailItem.id, item.id, true)}><CheckCircle2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 text-red-600" onClick={() => handleToggleQC(detailItem.id, item.id, false)}><AlertTriangle className="h-3 w-3" /></Button>
                          {item.qcPassed === true && <Badge className="bg-emerald-100 text-emerald-700 text-xs">OK</Badge>}
                          {item.qcPassed === false && <Badge className="bg-red-100 text-red-700 text-xs">FAIL</Badge>}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi nalog' : 'Novi nalog za pakovanje'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Broj naloga *</Label><Input placeholder="PKG-2024-001" className="text-xs" value={formData.orderNumber} onChange={e => setFormData(p => ({ ...p, orderNumber: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as PackagingOrder['priority'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Narudžba</Label><Input placeholder="ORD-4521" className="text-xs" value={formData.orderId} onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kupac *</Label><Input placeholder="Ime kupca" className="text-xs" value={formData.customerName} onChange={e => setFormData(p => ({ ...p, customerName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Tip pakovanja</Label><Select value={formData.packagingType} onValueChange={v => setFormData(p => ({ ...p, packagingType: v as PackagingOrder['packagingType'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PACK_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Zaduženi</Label><Select value="" onValueChange={v => setFormData(p => ({ ...p, assignedTo: v }))}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent><SelectItem value="">Nije dodeljen</SelectItem>{WORKERS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Textarea placeholder="Instrukcije..." className="text-xs" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
