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
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, Package, Truck, Clock, MapPin, CheckCircle2, AlertTriangle, XCircle, BarChart3, FileText, CalendarDays, User, Phone, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface HistoryEntry {
  date: string
  status: string
  location: string
  note: string
}

interface DeliveryOrder {
  id: string
  trackingNumber: string
  senderName: string
  senderPhone: string
  senderAddress: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  status: string
  priority: string
  weight: number
  dimensions: string
  codAmount: number
  shippingCost: number
  estimatedDelivery: string
  actualDelivery: string | null
  assignedDriver: string
  currentLocation: string
  notes: string | null
  history: string
  createdAt: string
}

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

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function getPriorityBadge(p: string) {
  const r = PRIORITIES[p]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{p}</Badge>
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

function parseHistory(historyStr: string): HistoryEntry[] {
  try { return JSON.parse(historyStr || '[]') } catch { return [] }
}

export function Delivery() {
  const [data, setData] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<DeliveryOrder | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard', weight: 0, dimensions: '', codAmount: 0, notes: '' })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      const res = await fetch(`/api/delivery?${params}`)
      if (res.ok) setData(await res.json())
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [search, statusFilter, priorityFilter])

  useEffect(() => { fetchData() }, [fetchData])

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

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati dostavu?')) return
    try {
      const res = await fetch(`/api/delivery/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Dostava obrisana'); if (detailId === id) { setDetailId(null); setSubTab('pregled'); } fetchData() }
    } catch { toast.error('Greška') }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/delivery/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) { toast.success(`Status: ${STATUSES[newStatus]?.label}`); fetchData() }
    } catch { toast.error('Greška') }
  }

  const handleOpenCreate = () => {
    setFormData({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard', weight: 0, dimensions: '', codAmount: 0, notes: '' })
    setEditItem(null)
    setSubTab('dodaj')
  }

  const handleOpenEdit = (item: DeliveryOrder) => {
    setFormData({ senderName: item.senderName, senderPhone: item.senderPhone, senderAddress: item.senderAddress, recipientName: item.recipientName, recipientPhone: item.recipientPhone, recipientAddress: item.recipientAddress, priority: item.priority, weight: item.weight, dimensions: item.dimensions, codAmount: item.codAmount, notes: item.notes || '' })
    setEditItem(item)
    setSubTab('dodaj')
  }

  const handleSave = async () => {
    if (!formData.senderName || !formData.recipientName || !formData.recipientAddress) { toast.error('Popunite sva obavezna polja'); return }
    setSaving(true)
    try {
      if (editItem) {
        const res = await fetch(`/api/delivery/${editItem.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
        })
        if (res.ok) { toast.success('Dostava ažurirana'); setSubTab('pregled'); setEditItem(null); fetchData() }
      } else {
        const res = await fetch('/api/delivery', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
        })
        if (res.ok) { toast.success('Nova dostava kreirana'); setSubTab('pregled'); fetchData() }
      }
    } catch { toast.error('Greška') } finally { setSaving(false) }
  }

  if (loading && data.length === 0) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const detailSubTab = subTab === 'detalji' && detailItem ? 'detalji' : subTab

  const handleMainTabChange = (val: string) => { setActiveTab(val); setSubTab('pregled'); setEditItem(null); setDetailId(null); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Package className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Dostava</h1><p className="text-sm text-muted-foreground">Upravljanje isporukama i praćenje pošiljki</p></div>
        </div>
        {subTab === 'pregled' && <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova dostava</Button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U tranzitu</div><p className="text-xl font-bold text-blue-700">{stats.inTransit}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Isporučeno</div><p className="text-xl font-bold text-emerald-700">{stats.delivered}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Neuspešno</div><p className="text-xl font-bold text-red-700">{stats.failed}</p></Card>
        <Card className="p-4"><div className="text-xs text-orange-600 mb-1">Vraćeno</div><p className="text-xl font-bold text-orange-700">{stats.returned}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prihodi</div><p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">COD</div><p className="text-xl font-bold">{formatCurrency(stats.totalCOD)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleMainTabChange}>
        <TabsList><TabsTrigger value="list">Pošiljke</TabsTrigger><TabsTrigger value="tracking">Praćenje</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'pregled' | 'dodaj' | 'detalji')}>
            <TabsList>
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              {editItem && <TabsTrigger value="dodaj">Uredi</TabsTrigger>}
              {!editItem && subTab === 'dodaj' && <TabsTrigger value="dodaj">Dodaj</TabsTrigger>}
              {detailItem && <TabsTrigger value="detalji">Detalji</TabsTrigger>}
            </TabsList>
            <TabsContent value="pregled" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sve pošiljke</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, primalac..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={priorityFilter || 'all'} onValueChange={v => setPriorityFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Broj</TableHead><TableHead className="text-xs">Primalac</TableHead><TableHead className="text-xs hidden sm:table-cell">Adresa</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Prioritet</TableHead><TableHead className="text-xs hidden lg:table-cell">COD</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {data.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema pošiljki</TableCell></TableRow> : data.map(item => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setDetailId(item.id); setSubTab('detalji'); }}>
                        <TableCell className="text-xs font-mono">{item.trackingNumber}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.recipientName}</div><div className="text-xs text-muted-foreground">{item.recipientPhone}</div></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">{item.recipientAddress}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{item.codAmount > 0 ? formatCurrency(item.codAmount) : '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.estimatedDelivery)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailId(item.id); setSubTab('detalji'); }}><Eye className="h-3.5 w-3.5" /></Button>
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

            {/* Detalji Sub-tab */}
            {detailItem && (
            <TabsContent value="detalji" className="space-y-4">
              <Card className="max-w-[700px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailId(null); setSubTab('pregled'); }}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle className="text-base">Detalji pošiljke</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>{(() => {
                  const history = parseHistory(detailItem.history)
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-lg font-bold font-mono">{detailItem.trackingNumber}</p><p className="text-xs text-muted-foreground">{formatDate(detailItem.estimatedDelivery)}</p></div>
                        <div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border space-y-1"><p className="text-xs font-medium text-muted-foreground uppercase">Pošiljalac</p><p className="text-xs font-medium">{detailItem.senderName}</p><p className="text-xs text-muted-foreground">{detailItem.senderPhone}</p><p className="text-xs text-muted-foreground">{detailItem.senderAddress}</p></div>
                        <div className="p-3 rounded-lg border space-y-1"><p className="text-xs font-medium text-muted-foreground uppercase">Primalac</p><p className="text-xs font-medium">{detailItem.recipientName}</p><p className="text-xs text-muted-foreground">{detailItem.recipientPhone}</p><p className="text-xs text-muted-foreground">{detailItem.recipientAddress}</p></div>
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
                          {[...history].reverse().map((h, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="flex flex-col items-center"><div className="h-6 w-6 rounded-full flex items-center justify-center bg-muted">{getStatusIcon(h.status)}</div>{idx < history.length - 1 && <div className="w-px h-4 bg-border mt-1" />}</div>
                              <div className="pb-2"><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{h.date}</span>{getStatusBadge(h.status)}</div><p className="text-xs">{h.location}</p>{h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
                      <div className="flex gap-2">
                        <Select value={detailItem.status} onValueChange={v => handleStatusChange(detailItem.id, v)}><SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                      </div>
                    </div>
                  )
                })()}</CardContent>
              </Card>
            </TabsContent>
            )}

            {/* Dodaj/Uredi Sub-tab */}
            <TabsContent value="dodaj" className="space-y-4">
              <Card className="max-w-[600px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSubTab('pregled'); setEditItem(null); }}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle className="text-base">{editItem ? 'Uredi dostavu' : 'Nova dostava'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="p-3 rounded-lg border space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Pošiljalac</p>
                    <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input placeholder="Naziv firme ili ime" className="text-xs" value={formData.senderName} onChange={e => setFormData(p => ({ ...p, senderName: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input placeholder="+381..." className="text-xs" value={formData.senderPhone} onChange={e => setFormData(p => ({ ...p, senderPhone: e.target.value }))} /></div>
                      <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input placeholder="Ulica i broj, grad" className="text-xs" value={formData.senderAddress} onChange={e => setFormData(p => ({ ...p, senderAddress: e.target.value }))} /></div>
                  </div>
                  <div className="p-3 rounded-lg border space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Primalac</p>
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
                  <div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => { setSubTab('pregled'); setEditItem(null); }}>Otkaži</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Čuvanje...' : editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" />Praćenje pošiljki</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
              {data.filter(d => !['delivered', 'returned'].includes(d.status)).map(item => {
                const history = parseHistory(item.history)
                return (
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /><span>Trenutna lokacija: {item.currentLocation}</span></div>
                    <div className="space-y-1.5">
                      {history.slice(-3).map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                          <div><span className="text-muted-foreground">{h.date}</span> — <span className="font-medium">{STATUSES[h.status]?.label || h.status}</span> — {h.location}{h.note ? `: ${h.note}` : ''}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDetailId(item.id); setSubTab('detalji'); }}>Detalji</Button>
                    </div>
                  </div>
                )
              })}
              {data.filter(d => !['delivered', 'returned'].includes(d.status)).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nema aktivnih pošiljki</p>}
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
                    return (<div key={k} className="space-y-1"><div className="flex justify-between text-xs"><span>{v.label}</span><span className="font-medium">{count} ({pct}%)</span></div><Progress value={pct} className="h-2" /></div>)
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" />Predviđene dostave</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {data.filter(d => !['delivered', 'returned', 'failed'].includes(d.status)).sort((a, b) => a.estimatedDelivery.localeCompare(b.estimatedDelivery)).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{d.trackingNumber}</p><p className="text-xs text-muted-foreground">{d.recipientName}</p></div><div className="text-right"><p className="text-xs">{formatDate(d.estimatedDelivery)}</p>{getPriorityBadge(d.priority)}</div></div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-amber-600" />Po vozaču</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {(() => {
                  const driverMap: Record<string, { total: number; active: number; delivered: number }> = {}
                  data.forEach(d => { if (!d.assignedDriver) return; if (!driverMap[d.assignedDriver]) driverMap[d.assignedDriver] = { total: 0, active: 0, delivered: 0 }; driverMap[d.assignedDriver].total++; if (['in_transit', 'out_for_delivery'].includes(d.status)) driverMap[d.assignedDriver].active++; if (d.status === 'delivered') driverMap[d.assignedDriver].delivered++ })
                  return Object.entries(driverMap).map(([driver, info]) => (
                    <div key={driver} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{driver}</p><p className="text-xs text-muted-foreground">{info.total} pošiljki · {info.delivered} isporučeno</p></div>{info.active > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{info.active} aktivna</Badge>}</div>
                  ))
                })()}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-violet-600" />Neuspešne isporuke</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {data.filter(d => d.status === 'failed').length === 0 ? <p className="text-xs text-muted-foreground">Nema neuspešnih isporuka</p> : data.filter(d => d.status === 'failed').map(d => (
                  <div key={d.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 space-y-1"><div className="flex justify-between"><span className="text-xs font-mono">{d.trackingNumber}</span></div><p className="text-xs">{d.recipientName} — {d.recipientAddress}</p><p className="text-xs text-muted-foreground">{d.notes}</p></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
