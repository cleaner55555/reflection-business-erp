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
import { Plus, Search, Trash2, Pencil, Eye, Tag, Percent, DollarSign, CalendarDays, Users, Copy, BarChart3, Clock, Ticket, Gift, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo' | 'gift_card'
  discountValue: number
  minOrder: number
  maxDiscount: number
  usageLimit: number
  usageCount: number
  perUserLimit: number
  status: 'active' | 'scheduled' | 'expired' | 'paused' | 'disabled'
  startDate: string
  endDate: string
  applicableCategories: string[]
  applicableProducts: string[]
  customerGroups: string[]
  createdAt: string
}

const INITIAL_DATA: Coupon[] = [
  { id: '1', code: 'WELCOME10', name: 'Dobrodošlica 10%', description: '10% popust za nove kupce na prvu porudžbinu', type: 'percentage', discountValue: 10, minOrder: 2000, maxDiscount: 5000, usageLimit: 500, usageCount: 342, perUserLimit: 1, status: 'active', startDate: '2024-01-01', endDate: '2024-12-31', applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['Novi kupci'], createdAt: '2024-01-01' },
  { id: '2', code: 'SUMMER24', name: 'Letnji popust 20%', description: '20% na sve letnje artikle', type: 'percentage', discountValue: 20, minOrder: 5000, maxDiscount: 10000, usageLimit: 200, usageCount: 187, perUserLimit: 3, status: 'active', startDate: '2024-06-01', endDate: '2024-08-31', applicableCategories: ['Odeća', 'Obuća', 'Sportska oprema'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: '2024-05-28' },
  { id: '3', code: 'FREEDELIVERY', name: 'Besplatna dostava', description: 'Besplatna dostava za porudžbine preko 3000 RSD', type: 'free_shipping', discountValue: 0, minOrder: 3000, maxDiscount: 0, usageLimit: 1000, usageCount: 567, perUserLimit: 0, status: 'active', startDate: '2024-01-01', endDate: '2024-12-31', applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: '2024-01-01' },
  { id: '4', code: 'VIP500', name: 'VIP popust 500 RSD', description: 'Fiksni popust od 500 RSD za VIP kupce', type: 'fixed', discountValue: 500, minOrder: 3000, maxDiscount: 500, usageLimit: 100, usageCount: 45, perUserLimit: 2, status: 'active', startDate: '2024-04-01', endDate: '2024-06-30', applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['VIP kupci'], createdAt: '2024-03-28' },
  { id: '5', code: 'BOGO-SHOES', name: 'Kupi 1 dobij 1 - Obuća', description: 'Kupi jedne patike i dobij drugi par besplatno (niža cena)', type: 'bogo', discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 50, usageCount: 38, perUserLimit: 1, status: 'active', startDate: '2024-06-10', endDate: '2024-06-20', applicableCategories: ['Obuća'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: '2024-06-08' },
  { id: '6', code: 'GIFT2000', name: 'Poklon kartica 2000 RSD', description: 'Digitalna poklon kartica u vrednosti od 2000 RSD', type: 'gift_card', discountValue: 2000, minOrder: 0, maxDiscount: 2000, usageLimit: 30, usageCount: 12, perUserLimit: 0, status: 'active', startDate: '2024-06-01', endDate: '2024-07-31', applicableCategories: ['Sve'], applicableProducts: [], customerGroups: [], createdAt: '2024-06-01' },
  { id: '7', code: 'BLACKFRI', name: 'Black Friday 30%', description: '30% popust za Black Friday', type: 'percentage', discountValue: 30, minOrder: 5000, maxDiscount: 15000, usageLimit: 300, usageCount: 0, perUserLimit: 1, status: 'scheduled', startDate: '2024-11-29', endDate: '2024-11-29', applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: '2024-06-01' },
  { id: '8', code: 'WINTER23', name: 'Zimski popust 15%', description: 'Zimska akcija 2023 - završena', type: 'percentage', discountValue: 15, minOrder: 3000, maxDiscount: 7500, usageLimit: 400, usageCount: 400, perUserLimit: 5, status: 'expired', startDate: '2023-12-01', endDate: '2024-02-28', applicableCategories: ['Zimska oprema', 'Odeća'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: '2023-11-25' },
  { id: '9', code: 'FLASH50', name: 'Flash akcija 50%', description: 'Flash akcija - privremeno pauzirana', type: 'percentage', discountValue: 50, minOrder: 10000, maxDiscount: 25000, usageLimit: 20, usageCount: 5, perUserLimit: 1, status: 'paused', startDate: '2024-06-15', endDate: '2024-06-15', applicableCategories: ['Elektronika'], applicableProducts: [], customerGroups: ['VIP kupci'], createdAt: '2024-06-14' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Aktivan' },
  scheduled: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Zakazan' },
  expired: { color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Istekao' },
  paused: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Pauziran' },
  disabled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Onemogućen' },
}

const TYPES: Record<string, { label: string; icon: typeof Tag }> = {
  percentage: { label: 'Procentualni', icon: Percent },
  fixed: { label: 'Fiksni iznos', icon: DollarSign },
  free_shipping: { label: 'Bespl. dostava', icon: Gift },
  bogo: { label: 'Kupi 1 Dobij 1', icon: Ticket },
  gift_card: { label: 'Poklon kartica', icon: Gift },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getTypeLabel(t: string) { return TYPES[t]?.label || t }
function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }

export function Coupons() {
  const [data, setData] = useState<Coupon[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({ code: '', name: '', description: '', type: 'percentage' as Coupon['type'], discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, perUserLimit: 1, startDate: '', endDate: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  }), [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => d.status === 'active').length, scheduled: data.filter(d => d.status === 'scheduled').length,
    expired: data.filter(d => d.status === 'expired').length,
    totalUsed: data.reduce((s, d) => s + d.usageCount, 0), totalDiscount: data.reduce((s, d) => s + d.usageCount * d.discountValue, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati kupon?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Kupon obrisan') }

  const handleToggleStatus = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'paused' as Coupon['status'] : d.status === 'paused' ? 'active' as Coupon['status'] : d.status } : d))
    toast.success('Status promenjen')
  }

  const handleOpenCreate = () => { setFormData({ code: '', name: '', description: '', type: 'percentage', discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, perUserLimit: 1, startDate: '', endDate: '' }); setDialogOpen(true) }
  const handleOpenEdit = (item: Coupon) => { setFormData({ code: item.code, name: item.name, description: item.description, type: item.type, discountValue: item.discountValue, minOrder: item.minOrder, maxDiscount: item.maxDiscount, usageLimit: item.usageLimit, perUserLimit: item.perUserLimit, startDate: item.startDate, endDate: item.endDate }); setEditItem(item); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.code || !formData.name) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d)); toast.success('Kupon ažuriran') }
    else { const newItem: Coupon = { ...formData, id: String(Date.now()), status: 'active', usageCount: 0, applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: new Date().toISOString().split('T')[0] }; setData(prev => [newItem, ...prev]); toast.success('Novi kupon kreiran') }
    setDialogOpen(false); setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Tag className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Kuponik</h1><p className="text-sm text-muted-foreground">Upravljanje kuponskim akcijama</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Novi kupon</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Aktivni</div><p className="text-xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Zakazani</div><p className="text-xl font-bold text-sky-700">{stats.scheduled}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Istekli</div><p className="text-xl font-bold text-slate-700">{stats.expired}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Iskorišćeno</div><p className="text-xl font-bold">{stats.totalUsed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupan popust</div><p className="text-xl font-bold">{formatCurrency(stats.totalDiscount)}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Svi kuponi</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kod, naziv..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Kod</TableHead>
                <TableHead className="text-xs">Naziv</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Tip</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Popust</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Korišćenje</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Period</TableHead>
                <TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema kupona</TableCell></TableRow> : filtered.map(item => {
                  const usagePct = item.usageLimit > 0 ? Math.round((item.usageCount / item.usageLimit) * 100) : 0
                  return (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                      <TableCell className="text-xs font-mono font-bold text-emerald-700">{item.code}</TableCell>
                      <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.description}</div></TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{getTypeLabel(item.type)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell font-medium">{item.type === 'percentage' ? `${item.discountValue}%` : item.type === 'fixed' ? formatCurrency(item.discountValue) : item.type === 'free_shipping' ? 'Besplatan' : item.type === 'bogo' ? '2 za 1' : formatCurrency(item.discountValue)}</TableCell>
                      <TableCell className="hidden md:table-cell"><div className="w-20"><div className="flex justify-between text-[10px] mb-1"><span>{item.usageCount}/{item.usageLimit}</span><span>{usagePct}%</span></div><Progress value={usagePct} className="h-1.5" /></div></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground hidden lg:table-cell">{formatDate(item.startDate)} — {formatDate(item.endDate)}</TableCell>
                      <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => handleToggleStatus(item.id)}>{item.status === 'active' ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji kupona</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Badge className="bg-emerald-100 text-emerald-700 font-mono text-sm px-3">{detailItem.code}</Badge><span className="text-sm font-medium">{detailItem.name}</span></div>{getStatusBadge(detailItem.status)}</div>
              <p className="text-xs text-muted-foreground">{detailItem.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Tip</div><p className="text-xs font-medium">{getTypeLabel(detailItem.type)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vrednost</div><p className="text-xs font-bold">{detailItem.type === 'percentage' ? `${detailItem.discountValue}%` : formatCurrency(detailItem.discountValue)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Min. narudžba</div><p className="text-xs font-medium">{formatCurrency(detailItem.minOrder)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Max. popust</div><p className="text-xs font-medium">{detailItem.maxDiscount > 0 ? formatCurrency(detailItem.maxDiscount) : 'Bez limita'}</p></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Korišćenje</span><span className="font-medium">{detailItem.usageCount} / {detailItem.usageLimit}</span></div>
                <Progress value={detailItem.usageLimit > 0 ? (detailItem.usageCount / detailItem.usageLimit) * 100 : 0} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Po korisniku: {detailItem.perUserLimit > 0 ? `${detailItem.perUserLimit}x` : 'Bez limita'}</span><span>Preostalo: {detailItem.usageLimit - detailItem.usageCount}</span></div>
              </div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Period</span><span>{formatDate(detailItem.startDate)} — {formatDate(detailItem.endDate)}</span></div>
              <div className="flex flex-wrap gap-1">{detailItem.applicableCategories.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}{detailItem.customerGroups.map(g => <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi kupon' : 'Novi kupon'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Kod *</Label><Input placeholder="SUMMER24" className="text-xs font-mono uppercase" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as Coupon['type'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input placeholder="Naziv kupona" className="text-xs" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Opis</Label><Textarea placeholder="Opis akcije..." className="text-xs" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Vrednost</Label><Input type="number" className="text-xs" value={formData.discountValue || ''} onChange={e => setFormData(p => ({ ...p, discountValue: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Min. narudžba</Label><Input type="number" className="text-xs" value={formData.minOrder || ''} onChange={e => setFormData(p => ({ ...p, minOrder: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Max. popust</Label><Input type="number" className="text-xs" value={formData.maxDiscount || ''} onChange={e => setFormData(p => ({ ...p, maxDiscount: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Limit (ukupno)</Label><Input type="number" className="text-xs" value={formData.usageLimit || ''} onChange={e => setFormData(p => ({ ...p, usageLimit: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Po korisniku</Label><Input type="number" className="text-xs" value={formData.perUserLimit || ''} onChange={e => setFormData(p => ({ ...p, perUserLimit: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Od</Label><Input type="date" className="text-xs" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Do</Label><Input type="date" className="text-xs" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
