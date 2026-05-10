'use client'
import { useState, useEffect, useCallback } from 'react'
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
import { Plus, Search, Trash2, Pencil, Eye, Zap, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

type Utility = {
  id: string; name: string; provider: string; accountNo: string
  type: string; status: string; monthlyAmount: number; lastReading: number; lastReadingDate: string
  lastBillDate: string; lastBillAmount: number; dueDate: string; paidDate: string
  location: string; notes: string
}

const TYPES: Record<string, string> = { electricity: 'Struja', water: 'Voda', gas: 'Gas', heating: 'Grejanje', internet: 'Internet', phone: 'Telefon', waste: 'Otpad', tv: 'TV' }
const STATUSES: Record<string, { color: string; label: string }> = { active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' }, disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Isključeno' }, overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' }, pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' } }
function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function formatRSD(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Utilities() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<Utility[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(''); const [typeFilter, setTypeFilter] = useState(''); const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false); const [editItem, setEditItem] = useState<Utility | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null); const [form, setForm] = useState<Partial<Utility>>({}); const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      setLoading(true)
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (search) params.set('search', search)
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/utilities?${params}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch { toast.error('Greška pri učitavanju') } finally { setLoading(false) }
  }, [activeCompanyId, search, typeFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data
  const handleDelete = async (id: string) => { if (!confirm('Obrisati?')) return; try { const res = await fetch(`/api/utilities/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); toast.success('Obrisano'); fetchData() } catch { toast.error('Greška pri brisanju') } }
  const openCreate = () => { setEditItem(null); setForm({ name: '', provider: '', accountNo: '', type: 'electricity', status: 'active', monthlyAmount: 0, location: '', notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Utility) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = async () => {
    if (!form.name) { toast.error('Unesite naziv'); return }
    try {
      const url = editItem ? `/api/utilities/${editItem.id}` : '/api/utilities'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form })
      })
      if (!res.ok) throw new Error()
      toast.success(editItem ? 'Ažurirano' : 'Kreirano')
      setDialogOpen(false)
      fetchData()
    } catch { toast.error('Greška pri čuvanju') }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const monthlyTotal = data.filter(i => i.status === 'active').reduce((s, i) => s + (i.monthlyAmount || 0), 0)

  return (<div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Komunalije</h1><p className="text-sm text-muted-foreground">Upravljanje komunalnim računima</p></div><Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi račun</Button></div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Zap className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card><Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{data.filter(i => i.status === 'active').length}</p></Card><Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Kasni</div><p className="text-2xl font-bold text-red-700">{data.filter(i => i.status === 'overdue').length}</p></Card><Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Mesečno</div><p className="text-lg font-bold">{formatRSD(monthlyTotal)}</p></Card></div>
    <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
      <TabsContent value="pregled" className="mt-4"><Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Lista</CardTitle><div className="flex gap-2 items-center"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select><Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="disconnected">Isključeno</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent><div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Dobavljač</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Iznos</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema</TableCell></TableRow> : filtered.map(item => (<TableRow key={item.id}><TableCell className="text-xs font-medium">{item.name}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.provider}</TableCell><TableCell className="text-xs hidden md:table-cell">{TYPES[item.type]}</TableCell><TableCell className="text-xs font-semibold hidden md:table-cell">{formatRSD(item.monthlyAmount)}</TableCell><TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.dueDate ? formatDate(item.dueDate) : '—'}</TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card></TabsContent>
      <TabsContent value="dodaj" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Novi račun</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Dobavljač</Label><Input className="text-xs" value={form.provider || ''} onChange={e => setForm({ ...form, provider: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'electricity'} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Mesečni iznos</Label><Input className="text-xs" type="number" value={form.monthlyAmount || ''} onChange={e => setForm({ ...form, monthlyAmount: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Br. računa</Label><Input className="text-xs" value={form.accountNo || ''} onChange={e => setForm({ ...form, accountNo: e.target.value })} /></div></div><Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Dodaj</Button></div></CardContent></Card></TabsContent>
      <TabsContent value="uredi" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Uredi</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}<Badge className="text-xs bg-muted">{TYPES[item.type]}</Badge></div><p className="text-xs text-muted-foreground truncate">{item.provider} — {formatRSD(item.monthlyAmount)}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card></TabsContent>
    </Tabs>
    <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Detalji</DialogTitle></DialogHeader>{detailItem && (<div className="space-y-3"><h3 className="text-sm font-semibold">{detailItem.name}</h3><div className="grid grid-cols-2 gap-3">{[['Dobavljač', detailItem.provider],['Br. računa', detailItem.accountNo],['Tip', TYPES[detailItem.type]],['Mesečni iznos', formatRSD(detailItem.monthlyAmount)],['Zadnji račun', detailItem.lastBillAmount ? formatRSD(detailItem.lastBillAmount) : '—'],['Datum računa', formatDate(detailItem.lastBillDate)],['Rok plaćanja', detailItem.dueDate ? formatDate(detailItem.dueDate) : '—'],['Plaćeno', detailItem.paidDate ? formatDate(detailItem.paidDate) : 'Ne'],['Lokacija', detailItem.location]].map(([l, v]) => (<div key={l} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{l}</div><div className="text-xs font-medium">{v || '—'}</div></div>))}</div><div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div></div>)}</DialogContent></Dialog>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novi'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="disconnected">Isključeno</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Iznos</Label><Input className="text-xs" type="number" value={form.monthlyAmount || ''} onChange={e => setForm({ ...form, monthlyAmount: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'electricity'} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
  </div>)
}
