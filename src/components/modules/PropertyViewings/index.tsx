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
import { Plus, Search, Trash2, Pencil, Eye, Eye as EyeIcon, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Viewing = {
  id: string; viewingNo: string; propertyTitle: string; clientName: string; phone: string; agent: string
  date: string; time: string; duration: number; status: string; clientInterest: string; feedback: string; notes: string
}

const STATUSES: Record<string, { color: string; label: string }> = { scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Zakazano' }, completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Obavljeno' }, cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazano' }, no_show: { color: 'bg-amber-100 text-amber-800', label: 'Nije došao' } }
const INTERESTS: Record<string, { color: string; label: string }> = { high: { color: 'bg-emerald-100 text-emerald-800', label: 'Visoko' }, medium: { color: 'bg-amber-100 text-amber-800', label: 'Srednje' }, low: { color: 'bg-gray-100 text-gray-800', label: 'Nisko' }, none: { color: 'bg-red-100 text-red-800', label: 'Nema' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getInterestBadge(s: string) { const r = INTERESTS[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function PropertyViewings() {
  const [data, setData] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Viewing | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Viewing>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/property-viewings?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch { toast.error('Greška pri učitavanju') } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data
  const handleDelete = async (id: string) => { if (!confirm('Obrisati?')) return; try { const res = await fetch(`/api/property-viewings/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); toast.success('Obrisano'); fetchData() } catch { toast.error('Greška pri brisanju') } }
  const openCreate = () => { setEditItem(null); setForm({ propertyTitle: '', clientName: '', phone: '', agent: '', date: new Date().toISOString().split('T')[0], time: '17:00', duration: 30, status: 'scheduled', clientInterest: 'medium', feedback: '', notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Viewing) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = async () => { if (!form.propertyTitle || !form.clientName) { toast.error('Popunite obavezna polja'); return }; try { const url = editItem ? `/api/property-viewings/${editItem.id}` : '/api/property-viewings'; const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!res.ok) throw new Error(); toast.success(editItem ? 'Ažurirano' : 'Kreirano'); setDialogOpen(false); fetchData() } catch { toast.error('Greška pri čuvanju') } }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const upcomingCount = data.filter(i => i.status === 'scheduled').length
  const highInterestCount = data.filter(i => i.clientInterest === 'high').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Pregledi nekretnina</h1><p className="text-sm text-muted-foreground">Zakazivanje i praćenje obilazaka</p></div><Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi pregled</Button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Predstojeći</div><p className="text-2xl font-bold text-blue-700">{upcomingCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Zainteresovani</div><p className="text-2xl font-bold text-emerald-700">{highInterestCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Nije došao</div><p className="text-2xl font-bold text-red-700">{data.filter(i => i.status === 'no_show').length}</p></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4"><Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Lista pregleda</CardTitle><div className="flex gap-2 items-center"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="scheduled">Zakazano</SelectItem><SelectItem value="completed">Obavljeno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent><div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Nekretnina</TableHead><TableHead className="text-xs hidden sm:table-cell">Klijent</TableHead><TableHead className="text-xs hidden md:table-cell">Datum/Vreme</TableHead><TableHead className="text-xs hidden md:table-cell">Agent</TableHead><TableHead className="text-xs hidden lg:table-cell">Interes</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema pregleda</TableCell></TableRow> : filtered.map(item => (<TableRow key={item.id}><TableCell className="text-xs font-medium max-w-[160px] truncate">{item.propertyTitle}</TableCell><TableCell className="text-xs hidden sm:table-cell">{item.clientName}</TableCell><TableCell className="text-xs text-muted-foreground hidden md:table-cell">{formatDate(item.date)} {item.time}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.agent}</TableCell><TableCell className="hidden lg:table-cell">{item.status !== 'scheduled' ? getInterestBadge(item.clientInterest) : <span className="text-xs text-muted-foreground">—</span>}</TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card></TabsContent>
        <TabsContent value="dodaj" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Novi pregled</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Nekretnina *</Label><Input className="text-xs" value={form.propertyTitle || ''} onChange={e => setForm({ ...form, propertyTitle: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Klijent *</Label><Input className="text-xs" value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Agent</Label><Input className="text-xs" value={form.agent || ''} onChange={e => setForm({ ...form, agent: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Vreme</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div></div><div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div><Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj</Button></div></CardContent></Card></TabsContent>
        <TabsContent value="uredi" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Uredi</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{item.propertyTitle}</span>{getStatusBadge(item.status)}</div><p className="text-xs text-muted-foreground truncate">{item.clientName} — {formatDate(item.date)} {item.time}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card></TabsContent>
      </Tabs>
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Detalji pregleda</DialogTitle></DialogHeader>{detailItem && (<div className="space-y-3"><h3 className="text-sm font-semibold">{detailItem.propertyTitle}</h3><div className="grid grid-cols-2 gap-3">{[['Klijent', detailItem.clientName],['Telefon', detailItem.phone],['Agent', detailItem.agent],['Datum', formatDate(detailItem.date)],['Vreme', detailItem.time],['Trajanje', `${detailItem.duration} min`]].map(([l, v]) => (<div key={l} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{l}</div><div className="text-xs font-medium">{v}</div></div>))}</div><div className="flex gap-3"><div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div><div className="p-2 rounded-lg bg-muted/50 flex-1"><div className="text-xs text-muted-foreground mb-1">Interes</div>{getInterestBadge(detailItem.clientInterest)}</div></div>{detailItem.feedback && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Fidbek</div><div className="text-xs">{detailItem.feedback}</div></div>}{detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}</div>)}</DialogContent></Dialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novi pregled'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'scheduled'} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Zakazano</SelectItem><SelectItem value="completed">Obavljeno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Interes</Label><Select value={form.clientInterest || 'medium'} onValueChange={v => setForm({ ...form, clientInterest: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">Visoko</SelectItem><SelectItem value="medium">Srednje</SelectItem><SelectItem value="low">Nisko</SelectItem><SelectItem value="none">Nema</SelectItem></SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Fidbek</Label><Input className="text-xs" value={form.feedback || ''} onChange={e => setForm({ ...form, feedback: e.target.value })} /></div></div><DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
