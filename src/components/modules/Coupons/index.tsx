'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Trash2, Pencil, Eye, Tag, Percent, DollarSign, Gift, Ticket, Clock, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: string
  discountValue: number
  minOrder: number
  maxDiscount: number
  usageLimit: number
  usageCount: number
  perUserLimit: number
  status: string
  startDate: string
  endDate: string
  applicableCategories: string
  applicableProducts: string
  customerGroups: string
  createdAt: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Aktivan' },
  scheduled: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Zakazan' },
  expired: { color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Istekao' },
  paused: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Pauziran' },
  disabled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Onemogućen' },
}

const TYPES: Record<string, { label: string }> = {
  percentage: { label: 'Procentualni' },
  fixed: { label: 'Fiksni iznos' },
  free_shipping: { label: 'Bespl. dostava' },
  bogo: { label: 'Kupi 1 Dobij 1' },
  gift_card: { label: 'Poklon kartica' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getTypeLabel(t: string) { return TYPES[t]?.label || t }
function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n) }
function parseJSON(s: string): string[] { try { return JSON.parse(s) } catch { return [] } }

export function Coupons() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeTab, setActiveTab] = useState('pregled')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({ code: '', name: '', description: '', type: 'percentage', discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, perUserLimit: 1, startDate: '', endDate: '' })

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId, limit: '200' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/coupons?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.items || [])
      }
    } catch (err) {
      console.error('Failed to load coupons:', err)
    }
    setLoading(false)
  }, [activeCompanyId, search, statusFilter, typeFilter])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => {
    if (!search && !statusFilter && !typeFilter) return data
    return data.filter(item => {
      const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || item.status === statusFilter
      const matchType = !typeFilter || item.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => d.status === 'active').length, scheduled: data.filter(d => d.status === 'scheduled').length,
    expired: data.filter(d => d.status === 'expired').length,
    totalUsed: data.reduce((s, d) => s + d.usageCount, 0), totalDiscount: data.reduce((s, d) => s + d.usageCount * d.discountValue, 0),
  }), [data])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati kupon?')) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Kupon obrisan'); loadData() }
    } catch { toast.error('Greška') }
  }

  const handleToggleStatus = async (id: string) => {
    const item = data.find(d => d.id === id)
    if (!item) return
    const newStatus = item.status === 'active' ? 'paused' : item.status === 'paused' ? 'active' : item.status
    if (newStatus === item.status) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (res.ok) { toast.success('Status promenjen'); loadData() }
    } catch { toast.error('Greška') }
  }

  const emptyForm = { code: '', name: '', description: '', type: 'percentage', discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, perUserLimit: 1, startDate: '', endDate: '' }
  const handleOpenCreate = () => {
    setFormData(emptyForm)
    setEditItem(null); setActiveTab('dodaj')
  }

  const handleOpenEdit = (item: Coupon) => {
    setFormData({ code: item.code, name: item.name, description: item.description, type: item.type, discountValue: item.discountValue, minOrder: item.minOrder, maxDiscount: item.maxDiscount, usageLimit: item.usageLimit, perUserLimit: item.perUserLimit, startDate: item.startDate, endDate: item.endDate })
    setEditItem(item); setActiveTab('uredi')
  }

  const handleSave = async () => {
    if (!formData.code || !formData.name) { toast.error('Popunite obavezna polja'); return }
    try {
      const payload = { ...formData, companyId: activeCompanyId, applicableCategories: '["Sve"]', applicableProducts: '[]', customerGroups: '["Svi kupci"]' }
      if (editItem) {
        const res = await fetch(`/api/coupons/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { toast.success('Kupon ažuriran'); loadData() }
      } else {
        const res = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, status: 'active', usageCount: 0 }) })
        if (res.ok) { toast.success('Novi kupon kreiran'); loadData() }
      }
    } catch { toast.error('Greška pri čuvanju') }
    setEditItem(null); setActiveTab('pregled')
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={loadData}><RefreshCw className="h-4 w-4" /> Osveži</Button>
          <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" /> Novi kupon</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivni</div><p className="text-xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="text-xs text-sky-600 mb-1">Zakazani</div><p className="text-xl font-bold text-sky-700">{stats.scheduled}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Istekli</div><p className="text-xl font-bold text-slate-700">{stats.expired}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Iskorišćeno</div><p className="text-xl font-bold">{stats.totalUsed}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupan popust</div><p className="text-xl font-bold">{formatCurrency(stats.totalDiscount)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); if (v !== 'uredi') setEditItem(null) }}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
      <TabsContent value="pregled" className="mt-4"><Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Svi kuponi</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kod, naziv..." className="pl-8 h-8 w-40 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nema kupona</p>
                <Button className="mt-4" size="sm" onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj kupon</Button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Kod</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead>
                  <TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Popust</TableHead><TableHead className="text-xs hidden md:table-cell">Korišćenje</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Period</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(item => {
                    const usagePct = item.usageLimit > 0 ? Math.round((item.usageCount / item.usageLimit) * 100) : 0
                    return (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                        <TableCell className="text-xs font-mono font-bold text-emerald-700">{item.code}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground truncate max-w-[150px]">{item.description}</div></TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{getTypeLabel(item.type)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell font-medium">{item.type === 'percentage' ? `${item.discountValue}%` : item.type === 'fixed' ? formatCurrency(item.discountValue) : item.type === 'free_shipping' ? 'Besplatan' : item.type === 'bogo' ? '2 za 1' : formatCurrency(item.discountValue)}</TableCell>
                        <TableCell className="hidden md:table-cell"><div className="w-20"><div className="flex justify-between text-xs mb-1"><span>{item.usageCount}/{item.usageLimit}</span><span>{usagePct}%</span></div><Progress value={usagePct} className="h-1.5" /></div></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.startDate ? formatDate(item.startDate) : '—'} — {item.endDate ? formatDate(item.endDate) : '—'}</TableCell>
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
            )}
          </div>
        </CardContent>
      </Card></TabsContent>
      {!!detailId && (<Card className="sm:max-w-[550px]">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">Detalji kupona<Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button></CardTitle></CardHeader>
        <CardContent>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Badge className="bg-emerald-100 text-emerald-700 font-mono text-sm px-3">{detailItem.code}</Badge><span className="text-sm font-medium">{detailItem.name}</span></div>{getStatusBadge(detailItem.status)}</div>
              <p className="text-xs text-muted-foreground">{detailItem.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Tip</div><p className="text-xs font-medium">{getTypeLabel(detailItem.type)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Vrednost</div><p className="text-xs font-bold">{detailItem.type === 'percentage' ? `${detailItem.discountValue}%` : formatCurrency(detailItem.discountValue)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Min. narudžba</div><p className="text-xs font-medium">{formatCurrency(detailItem.minOrder)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Max. popust</div><p className="text-xs font-medium">{detailItem.maxDiscount > 0 ? formatCurrency(detailItem.maxDiscount) : 'Bez limita'}</p></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Korišćenje</span><span className="font-medium">{detailItem.usageCount} / {detailItem.usageLimit}</span></div>
                <Progress value={detailItem.usageLimit > 0 ? (detailItem.usageCount / detailItem.usageLimit) * 100 : 0} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>Po korisniku: {detailItem.perUserLimit > 0 ? `${detailItem.perUserLimit}x` : 'Bez limita'}</span><span>Preostalo: {detailItem.usageLimit - detailItem.usageCount}</span></div>
              </div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Period</span><span>{detailItem.startDate ? formatDate(detailItem.startDate) : '—'} — {detailItem.endDate ? formatDate(detailItem.endDate) : '—'}</span></div>
              <div className="flex flex-wrap gap-1">{parseJSON(detailItem.applicableCategories).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}{parseJSON(detailItem.customerGroups).map((g: string) => <Badge key={g} variant="outline" className="text-xs">{g}</Badge>)}</div>
            </div>
          )}
        </CardContent>
      </Card>)}

      <TabsContent value="dodaj" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Novi kupon</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Kod *</Label><Input placeholder="SUMMER24" className="text-sm font-mono uppercase" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}><SelectTrigger className="text-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input placeholder="Naziv kupona" className="text-sm" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div><div className="grid gap-2"><Label className="text-xs">Opis</Label><Textarea placeholder="Opis akcije..." className="text-sm" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div><div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label className="text-xs">Vrednost</Label><Input type="number" className="text-sm" value={formData.discountValue || ''} onChange={e => setFormData(p => ({ ...p, discountValue: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Min. narudžba</Label><Input type="number" className="text-sm" value={formData.minOrder || ''} onChange={e => setFormData(p => ({ ...p, minOrder: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Max. popust</Label><Input type="number" className="text-sm" value={formData.maxDiscount || ''} onChange={e => setFormData(p => ({ ...p, maxDiscount: Number(e.target.value) }))} /></div></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Limit (ukupno)</Label><Input type="number" className="text-sm" value={formData.usageLimit || ''} onChange={e => setFormData(p => ({ ...p, usageLimit: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Po korisniku</Label><Input type="number" className="text-sm" value={formData.perUserLimit || ''} onChange={e => setFormData(p => ({ ...p, perUserLimit: Number(e.target.value) }))} /></div></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Od</Label><Input type="date" className="text-sm" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} /></div><div className="grid gap-2"><Label className="text-xs">Do</Label><Input type="date" className="text-sm" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} /></div></div></div><div className="flex gap-2 pt-4"><Button onClick={handleSave}><Plus className="h-4 w-4 mr-1" />Kreiraj</Button><Button variant="outline" onClick={() => setFormData(emptyForm)}>Poništi</Button></div></CardContent></Card></TabsContent>
      <TabsContent value="uredi" className="mt-4">
        {editItem ? (<Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(null); setActiveTab('pregled') }}><ArrowLeft className="h-4 w-4" /></Button>Uredi: {editItem.code}</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Kod *</Label><Input className="text-sm font-mono uppercase" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}><SelectTrigger className="text-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div><div className="grid gap-2"><Label className="text-xs">Opis</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div><div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label className="text-xs">Vrednost</Label><Input type="number" value={formData.discountValue || ''} onChange={e => setFormData(p => ({ ...p, discountValue: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Min. narudžba</Label><Input type="number" value={formData.minOrder || ''} onChange={e => setFormData(p => ({ ...p, minOrder: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Max. popust</Label><Input type="number" value={formData.maxDiscount || ''} onChange={e => setFormData(p => ({ ...p, maxDiscount: Number(e.target.value) }))} /></div></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Limit</Label><Input type="number" value={formData.usageLimit || ''} onChange={e => setFormData(p => ({ ...p, usageLimit: Number(e.target.value) }))} /></div><div className="grid gap-2"><Label className="text-xs">Po korisniku</Label><Input type="number" value={formData.perUserLimit || ''} onChange={e => setFormData(p => ({ ...p, perUserLimit: Number(e.target.value) }))} /></div></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Od</Label><Input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} /></div><div className="grid gap-2"><Label className="text-xs">Do</Label><Input type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} /></div></div></div><div className="flex gap-2 pt-4"><Button onClick={handleSave}>Sačuvaj</Button><Button variant="outline" onClick={() => { setEditItem(null); setActiveTab('pregled') }}>Otkaži</Button></div></CardContent></Card>) : (<Card><CardHeader><CardTitle className="text-base">Lista za uređivanje</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-mono font-bold text-emerald-700">{item.code}</span><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}</div><p className="text-xs text-muted-foreground truncate">{item.description}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card>)}
      </TabsContent>
    </Tabs>
    </div>
  )
}
