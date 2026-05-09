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
import { Plus, Search, Trash2, Pencil, Eye, Key, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Rental = {
  id: string
  contractNo: string
  tenantName: string
  phone: string
  email: string
  propertyTitle: string
  propertyAddress: string
  monthlyRent: number
  deposit: number
  startDate: string
  endDate: string
  paymentDay: number
  status: 'active' | 'expiring' | 'expired' | 'terminated' | 'pending'
  lastPayment: string
  nextPayment: string
  paymentMethod: 'bank_transfer' | 'cash' | 'standing_order'
  securityDeposit: number
  notes: string
}

const INITIAL: Rental[] = [
  { id: '1', contractNo: 'IZN-2024-001', tenantName: 'Ana Stanković', phone: '+381 64 987 6543', email: 'ana.s@email.com', propertyTitle: 'Dvosoban stan — Novi Beograd', propertyAddress: 'Bulevar Mihajla Pupina 165/12', monthlyRent: 550, deposit: 550, startDate: '2024-03-15', endDate: '2025-03-15', paymentDay: 15, status: 'active', lastPayment: '2024-06-01', nextPayment: '2024-07-01', paymentMethod: 'standing_order', securityDeposit: 550, notes: 'Zakup na godinu dana' },
  { id: '2', contractNo: 'IZN-2024-002', tenantName: 'Marko Tomić', phone: '+381 65 555 6666', email: 'marko.t@email.com', propertyTitle: 'Dvosoban stan — Novi Beograd', propertyAddress: 'Bulevar Mihajla Pupina 165/12', monthlyRent: 550, deposit: 550, startDate: '2024-06-01', endDate: '2025-06-01', paymentDay: 1, status: 'active', lastPayment: '2024-06-01', nextPayment: '2024-07-01', paymentMethod: 'bank_transfer', securityDeposit: 550, notes: 'Zamena zakupca — Ana odlazi u inostranstvo' },
  { id: '3', contractNo: 'IZN-2024-003', tenantName: 'Dragan Milić', phone: '+381 63 222 3333', email: '', propertyTitle: 'Kancelarija — Niš', propertyAddress: 'Vojvode Mišića 14', monthlyRent: 800, deposit: 800, startDate: '2024-01-01', endDate: '2024-12-31', paymentDay: 1, status: 'active', lastPayment: '2024-06-01', nextPayment: '2024-07-01', paymentMethod: 'bank_transfer', securityDeposit: 800, notes: 'IT kompanija — redovne uplate' },
  { id: '4', contractNo: 'IZN-2023-015', tenantName: 'Ivan Savić', phone: '+381 62 444 5555', email: 'ivan.s@email.com', propertyTitle: 'Lokal — Čubura', propertyAddress: 'Maksima Gorkog 42', monthlyRent: 650, deposit: 650, startDate: '2023-07-01', endDate: '2024-06-30', paymentDay: 5, status: 'expiring', lastPayment: '2024-06-05', nextPayment: '', paymentMethod: 'cash', securityDeposit: 650, notes: 'Ugovor ističe za 15 dana — ponuda za obnovu' },
  { id: '5', contractNo: 'IZN-2023-010', tenantName: 'Gordana Petrović', phone: '+381 63 111 2222', email: 'gordana.p@email.com', propertyTitle: 'Garsonjera — Dorćol', propertyAddress: 'Cara Dušana 88/3', monthlyRent: 350, deposit: 350, startDate: '2023-06-01', endDate: '2024-05-31', paymentDay: 1, status: 'expired', lastPayment: '2024-05-01', nextPayment: '', paymentMethod: 'cash', securityDeposit: 350, notes: 'Ugovor završen — depozit vraćen 10.06.' },
  { id: '6', contractNo: 'IZN-2024-004', tenantName: 'Sara Đorđević', phone: '+381 60 999 8888', email: 'sara.dj@email.com', propertyTitle: 'Trosoban stan — Voždovac', propertyAddress: 'Jove Ilića 154', monthlyRent: 700, deposit: 700, startDate: '2024-07-01', endDate: '2025-07-01', paymentDay: 1, status: 'pending', lastPayment: '', nextPayment: '2024-07-01', paymentMethod: 'standing_order', securityDeposit: 700, notes: 'Čeka se potpis — ključevi predati 30.06.' },
]

const STATUSES: Record<string, { color: string; label: string }> = { active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' }, expiring: { color: 'bg-amber-100 text-amber-800', label: 'Ističe' }, expired: { color: 'bg-gray-100 text-gray-800', label: 'Istekao' }, terminated: { color: 'bg-red-100 text-red-800', label: 'Prekinut' }, pending: { color: 'bg-blue-100 text-blue-800', label: 'Na čekanju' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function formatEUR(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p) }

export function Rentals() {
  const [data, setData] = useState<Rental[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Rental | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Rental>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.tenantName, item.propertyTitle, item.contractNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })
  const handleDelete = (id: string) => { if (!confirm('Obrisati ugovor?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  const openCreate = () => { setEditItem(null); setForm({ contractNo: `IZN-2024-${String(data.length + 1).padStart(3, '0')}`, tenantName: '', phone: '', email: '', propertyTitle: '', propertyAddress: '', monthlyRent: 0, deposit: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', paymentDay: 1, status: 'pending', lastPayment: '', nextPayment: '', paymentMethod: 'bank_transfer', securityDeposit: 0, notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Rental) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => { if (!form.tenantName || !form.propertyTitle) { toast.error('Popunite obavezna polja'); return }; if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Rental : i)); toast.success('Ažurirano') } else { setData(prev => [{ id: Date.now().toString(), ...form } as Rental, ...prev]); toast.success('Kreirano') }; setDialogOpen(false) }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const activeCount = data.filter(i => i.status === 'active').length
  const monthlyIncome = data.filter(i => i.status === 'active').reduce((s, i) => s + i.monthlyRent, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Iznajmljivanje</h1><p className="text-sm text-muted-foreground">Upravljanje zakupnih ugovora</p></div><Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi ugovor</Button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Key className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Ističu</div><p className="text-2xl font-bold text-amber-700">{data.filter(i => i.status === 'expiring').length}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Mesečni prihod</div><p className="text-xl font-bold">{formatEUR(monthlyIncome)}</p></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4"><Card><CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Zakupni ugovori</CardTitle><div className="flex gap-2 items-center"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="expiring">Ističe</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div></div></CardHeader><CardContent><div className="max-h-[480px] overflow-y-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Br. ugovora</TableHead><TableHead className="text-xs">Zakupec</TableHead><TableHead className="text-xs hidden sm:table-cell">Nekretnina</TableHead><TableHead className="text-xs hidden md:table-cell">Kirija</TableHead><TableHead className="text-xs hidden lg:table-cell">Period</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema ugovora</TableCell></TableRow> : filtered.map(item => (<TableRow key={item.id}><TableCell className="text-xs font-mono">{item.contractNo}</TableCell><TableCell className="text-xs font-medium">{item.tenantName}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">{item.propertyTitle}</TableCell><TableCell className="text-xs font-semibold hidden md:table-cell">{formatEUR(item.monthlyRent)}</TableCell><TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.startDate)} — {formatDate(item.endDate)}</TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card></TabsContent>
        <TabsContent value="dodaj" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Novi zakupni ugovor</CardTitle></CardHeader><CardContent><div className="grid gap-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="grid gap-2"><Label className="text-xs">Zakupec *</Label><Input className="text-xs" value={form.tenantName || ''} onChange={e => setForm({ ...form, tenantName: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Nekretnina *</Label><Input className="text-xs" value={form.propertyTitle || ''} onChange={e => setForm({ ...form, propertyTitle: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input className="text-xs" value={form.propertyAddress || ''} onChange={e => setForm({ ...form, propertyAddress: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Mesečna kirija (€)</Label><Input className="text-xs" type="number" value={form.monthlyRent || ''} onChange={e => setForm({ ...form, monthlyRent: Number(e.target.value), deposit: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Početak</Label><Input className="text-xs" type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Kraj</Label><Input className="text-xs" type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div><div className="grid gap-2"><Label className="text-xs">Dan plaćanja</Label><Input className="text-xs" type="number" value={form.paymentDay || ''} onChange={e => setForm({ ...form, paymentDay: Number(e.target.value) })} /></div><div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div></div><Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj</Button></div></CardContent></Card></TabsContent>
        <TabsContent value="uredi" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Uredi ugovore</CardTitle></CardHeader><CardContent><div className="max-h-[500px] overflow-y-auto space-y-3">{data.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-mono">{item.contractNo}</span><span className="text-xs font-medium">{item.tenantName}</span>{getStatusBadge(item.status)}</div><p className="text-xs text-muted-foreground truncate">{item.propertyTitle} — {formatEUR(item.monthlyRent)}/mes</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>))}</div></CardContent></Card></TabsContent>
      </Tabs>
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}><DialogContent className="sm:max-w-[550px]"><DialogHeader><DialogTitle>Detalji ugovora</DialogTitle></DialogHeader>{detailItem && (<div className="space-y-3"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.contractNo}</h3>{getStatusBadge(detailItem.status)}</div><div className="grid grid-cols-2 gap-3">{[['Zakupec', detailItem.tenantName],['Telefon', detailItem.phone],['Email', detailItem.email || '—'],['Nekretnina', detailItem.propertyTitle],['Adresa', detailItem.propertyAddress],['Mesečna kirija', formatEUR(detailItem.monthlyRent)],['Depozit', formatEUR(detailItem.deposit)],['Sigurnosni depozit', formatEUR(detailItem.securityDeposit)],['Početak', formatDate(detailItem.startDate)],['Kraj', formatDate(detailItem.endDate)],['Dan plaćanja', `${detailItem.paymentDay}. u mesecu`],['Način plaćanja', detailItem.paymentMethod === 'bank_transfer' ? 'Bankovni prenos' : detailItem.paymentMethod === 'standing_order' ? 'Stalni nalog' : 'Gotovina'],['Poslednja uplata', detailItem.lastPayment ? formatDate(detailItem.lastPayment) : '—'],['Sledeća uplata', detailItem.nextPayment ? formatDate(detailItem.nextPayment) : '—']].map(([l, v]) => (<div key={l} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{l}</div><div className="text-xs font-medium">{v}</div></div>))}</div>{detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}</div>)}</DialogContent></Dialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Novi ugovor'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v as Rental['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="expiring">Ističe</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="terminated">Prekinut</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label className="text-xs">Kirija (€)</Label><Input className="text-xs" type="number" value={form.monthlyRent || ''} onChange={e => setForm({ ...form, monthlyRent: Number(e.target.value) })} /></div></div><div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div></div><DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
