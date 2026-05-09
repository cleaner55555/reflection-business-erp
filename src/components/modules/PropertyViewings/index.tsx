'use client'
import { useState, useEffect } from 'react'
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
  id: string
  propertyTitle: string
  clientName: string
  phone: string
  agent: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  clientInterest: 'high' | 'medium' | 'low' | 'none'
  feedback: string
  notes: string
}

const INITIAL: Viewing[] = [
  { id: '1', propertyTitle: 'Trosoban stan — Vračar', clientName: 'Jovan Perić', phone: '+381 63 111 2222', agent: 'Milan Ristić', date: '2024-06-16', time: '17:00', duration: 45, status: 'scheduled', clientInterest: 'high', feedback: '', notes: 'Zainteresovan za kupovinu — ima finansiranje spremno' },
  { id: '2', propertyTitle: 'Trosoban stan — Vračar', clientName: 'Ana Milić', phone: '+381 64 333 4444', agent: 'Milan Ristić', date: '2024-06-14', time: '18:00', duration: 30, status: 'completed', clientInterest: 'medium', feedback: 'Stan je u redu ali nedostaje parking', notes: 'Možda se vrati nakon što drugi stanovi budu pogledani' },
  { id: '3', propertyTitle: 'Dvosoban stan — Novi Beograd', clientName: 'Marko Tomić', phone: '+381 65 555 6666', agent: 'Jelena Kovačević', date: '2024-06-13', time: '19:00', duration: 40, status: 'completed', clientInterest: 'high', feedback: 'Sve odgovara, nema primedbi', notes: 'Potpisao ugovor o zakupu istog dana' },
  { id: '4', propertyTitle: 'Kancelarija — Niš', clientName: 'IT Solutions DOO', phone: '+381 18 222 333', agent: 'Ivana Đurić', date: '2024-06-15', time: '11:00', duration: 60, status: 'cancelled', clientInterest: 'low', feedback: 'Premala površina za njihov tim od 15 ljudi', notes: 'Predložiti veći prostor kod drugog vlasnika' },
  { id: '5', propertyTitle: 'Lokal — Knez Mihajlova', clientName: 'Petar Lazarević', phone: '+381 62 777 8888', agent: 'Nenad Stanković', date: '2024-06-16', time: '10:00', duration: 45, status: 'scheduled', clientInterest: 'high', feedback: '', notes: 'Investor — planira kafeteriju' },
  { id: '6', propertyTitle: 'Garsonjera — Stari Grad', clientName: 'Student Jovan', phone: '+381 61 999 0000', agent: 'Jelena Kovačević', date: '2024-06-12', time: '16:00', duration: 20, status: 'no_show', clientInterest: 'none', feedback: '', notes: 'Nije se pojavio — 2x poziv, nema odgovora' },
  { id: '7', propertyTitle: 'Porodična kuća — Zvezdara', clientName: 'Mladen i Snežana', phone: '+381 63 444 5555', agent: 'Milan Ristić', date: '2024-06-17', time: '15:00', duration: 60, status: 'scheduled', clientInterest: 'high', feedback: '', notes: 'Porodica sa 2 dece — trače dvorište' },
  { id: '8', propertyTitle: 'Luksuzni stan — Dedinje', clientName: 'Goran Đurić', phone: '+381 64 222 3333', agent: 'Milan Ristić', date: '2024-06-10', time: '14:00', duration: 50, status: 'completed', clientInterest: 'high', feedback: 'Impresioniran kvalitetom — jedina primedba je sto koji je previše mali', notes: 'Pregledao ga i sa arhitektom za renovaciju' },
]

const STATUSES: Record<string, { color: string; label: string }> = { scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Zakazano' }, completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Obavljeno' }, cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazano' }, no_show: { color: 'bg-amber-100 text-amber-800', label: 'Nije došao' } }
const INTERESTS: Record<string, { color: string; label: string }> = { high: { color: 'bg-emerald-100 text-emerald-800', label: 'Visoko' }, medium: { color: 'bg-amber-100 text-amber-800', label: 'Srednje' }, low: { color: 'bg-gray-100 text-gray-800', label: 'Nisko' }, none: { color: 'bg-red-100 text-red-800', label: 'Nema' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getInterestBadge(s: string) { const r = INTERESTS[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function PropertyViewings() {
  const [data, setData] = useState<Viewing[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Viewing | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Viewing>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.propertyTitle, item.clientName, item.agent].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })
  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  const openCreate = () => { setEditItem(null); setForm({ propertyTitle: '', clientName: '', phone: '', agent: '', date: new Date().toISOString().split('T')[0], time: '17:00', duration: 30, status: 'scheduled', clientInterest: 'medium', feedback: '', notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Viewing) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => { if (!form.propertyTitle || !form.clientName) { toast.error('Popunite obavezna polja'); return }; if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Viewing : i)); toast.success('Ažurirano') } else { setData(prev => [{ id: Date.now().toString(), ...form } as Viewing, ...prev]); toast.success('Kreirano') }; setDialogOpen(false) }
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novi pregled'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'scheduled'} onValueChange={v => setForm({ ...form, status: v as Viewing['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Zakazano</SelectItem><SelectItem value="completed">Obavljeno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Interes</Label><Select value={form.clientInterest || 'medium'} onValueChange={v => setForm({ ...form, clientInterest: v as Viewing['clientInterest'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">Visoko</SelectItem><SelectItem value="medium">Srednje</SelectItem><SelectItem value="low">Nisko</SelectItem><SelectItem value="none">Nema</SelectItem></SelectContent></Select></div></div><div className="grid gap-2"><Label className="text-xs">Fidbek</Label><Input className="text-xs" value={form.feedback || ''} onChange={e => setForm({ ...form, feedback: e.target.value })} /></div></div><DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
