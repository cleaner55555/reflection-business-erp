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
import { Plus, Search, Trash2, Pencil, Eye, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Reservation = {
  id: string
  reservationNo: string
  guestName: string
  phone: string
  email: string
  date: string
  time: string
  partySize: number
  tableNo: string
  area: 'indoor' | 'outdoor' | 'terrace' | 'vip' | 'bar'
  status: 'confirmed' | 'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
  occasion: string
  specialRequests: string
  source: 'phone' | 'website' | 'walk_in' | 'app' | 'email'
  duration: number
  deposit: number
  notes: string
}

const INITIAL: Reservation[] = [
  { id: '1', reservationNo: 'REZ-2024-001', guestName: 'Luka Petrović', phone: '+381 63 123 4567', email: 'luka.p@email.com', date: '2024-06-16', time: '19:00', partySize: 4, tableNo: 'T-5', area: 'indoor', status: 'confirmed', occasion: 'Rođendan', specialRequests: 'Torta za 4 osobe, svetlića na sto', source: 'phone', duration: 120, deposit: 2000, notes: '' },
  { id: '2', reservationNo: 'REZ-2024-002', guestName: 'Ana Stanković', phone: '+381 64 987 6543', email: 'ana.s@email.com', date: '2024-06-15', time: '20:00', partySize: 2, tableNo: 'T-12', area: 'terrace', status: 'checked_in', occasion: '', specialRequests: 'Mesto pored prozora ako moguće', source: 'website', duration: 90, deposit: 0, notes: 'Stigla na vreme' },
  { id: '3', reservationNo: 'REZ-2024-003', guestName: 'Dragan Milić', phone: '+381 65 555 1234', email: '', date: '2024-06-15', time: '12:30', partySize: 8, tableNo: 'T-1', area: 'vip', status: 'pending', occasion: 'Poslovni ručak', specialRequests: 'Privatna prostorija, projektor, meni za 8 osoba', source: 'phone', duration: 180, deposit: 5000, notes: 'Čeka potvrdu — admin treba da odobri VIP' },
  { id: '4', reservationNo: 'REZ-2024-004', guestName: 'Jelena Nikolić', phone: '+381 62 444 8899', email: 'jelena.n@email.com', date: '2024-06-14', time: '19:30', partySize: 6, tableNo: 'T-3', area: 'indoor', status: 'completed', occasion: '', specialRequests: '', source: 'app', duration: 120, deposit: 0, notes: 'Sve prošlo u redu' },
  { id: '5', reservationNo: 'REZ-2024-005', guestName: 'Nikola Jovanović', phone: '+381 61 777 3344', email: '', date: '2024-06-14', time: '20:00', partySize: 3, tableNo: '', area: 'outdoor', status: 'cancelled', occasion: '', specialRequests: '', source: 'phone', duration: 90, deposit: 0, notes: 'Otkazano zbog kiše' },
  { id: '6', reservationNo: 'REZ-2024-006', guestName: 'Sara Đorđević', phone: '+381 60 222 7766', email: 'sara.dj@email.com', date: '2024-06-16', time: '18:00', partySize: 2, tableNo: 'T-8', area: 'bar', status: 'confirmed', occasion: '', specialRequests: 'Veganski meni', source: 'website', duration: 60, deposit: 0, notes: '' },
  { id: '7', reservationNo: 'REZ-2024-007', guestName: 'Ivan Savić', phone: '+381 66 888 1122', email: '', date: '2024-06-13', time: '19:00', partySize: 5, tableNo: 'T-7', area: 'indoor', status: 'no_show', occasion: '', specialRequests: '', source: 'phone', duration: 90, deposit: 0, notes: 'Nije se pojavio — 2x poziv, nema odgovora' },
  { id: '8', reservationNo: 'REZ-2024-008', guestName: 'Milica Marković', phone: '+381 63 333 6688', email: 'milica.m@email.com', date: '2024-06-17', time: '13:00', partySize: 10, tableNo: 'T-1+T-2', area: 'indoor', status: 'confirmed', occasion: 'Slava', specialRequests: 'Slavski kolač, žito, sveće. Sto za 10 sa prostorom oko', source: 'email', duration: 180, deposit: 8000, notes: 'Depozit plaćen — preostalo na licu mesta' },
  { id: '9', reservationNo: 'REZ-2024-009', guestName: 'Goran Petrović', phone: '+381 62 555 7799', email: '', date: '2024-06-16', time: '21:00', partySize: 2, tableNo: '', area: 'terrace', status: 'pending', occasion: '', specialRequests: '', source: 'walk_in', duration: 60, deposit: 0, notes: 'Dospel bez rezervacije — upisan na terasu' },
  { id: '10', reservationNo: 'REZ-2024-010', guestName: 'Maja Stojanović', phone: '+381 64 111 4455', email: 'maja.s@email.com', date: '2024-06-18', time: '20:00', partySize: 4, tableNo: 'T-4', area: 'indoor', status: 'confirmed', occasion: 'Anniversary', specialRequests: 'Romantično uređenje stola, sveće', source: 'app', duration: 120, deposit: 1500, notes: '' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  confirmed: { color: 'bg-emerald-100 text-emerald-800', label: 'Potvrđena' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
  checked_in: { color: 'bg-blue-100 text-blue-800', label: 'Prijavljena' },
  completed: { color: 'bg-gray-100 text-gray-800', label: 'Završena' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazana' },
  no_show: { color: 'bg-orange-100 text-orange-800', label: 'Nije došao' },
}

const AREAS: Record<string, { label: string }> = { indoor: { label: 'Sala' }, outdoor: { label: 'Bašta' }, terrace: { label: 'Terasa' }, vip: { label: 'VIP' }, bar: { label: 'Bar' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function Rezervacije() {
  const [data, setData] = useState<Reservation[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Reservation | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Reservation>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.guestName, item.phone, item.reservationNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchDate = !dateFilter || item.date === dateFilter
    return matchSearch && matchStatus && matchDate
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati rezervaciju?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Rezervacija obrisana') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ reservationNo: `REZ-2024-${String(data.length + 1).padStart(3, '0')}`, guestName: '', phone: '', email: '', date: new Date().toISOString().split('T')[0], time: '19:00', partySize: 2, tableNo: '', area: 'indoor', status: 'pending', occasion: '', specialRequests: '', source: 'phone', duration: 90, deposit: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Reservation) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.guestName) { toast.error('Unesite ime gosta'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Reservation : i)); toast.success('Rezervacija ažurirana') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Reservation, ...prev]); toast.success('Rezervacija kreirana') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const todayReservations = data.filter(i => i.date === new Date().toISOString().split('T')[0] && i.status !== 'cancelled').length
  const totalGuests = data.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.partySize, 0)
  const totalDeposits = data.reduce((s, i) => s + i.deposit, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Rezervacije</h1><p className="text-sm text-muted-foreground">Upravljanje rezervacijama i stolovima</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova rezervacija</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Danas</div><p className="text-2xl font-bold text-blue-700">{todayReservations}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Ukupno gostiju</div><p className="text-2xl font-bold text-amber-700">{totalGuests}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Depoziti</div><p className="text-xl font-bold text-emerald-700">{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(totalDeposits)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista rezervacija</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Input type="date" className="h-8 w-36 text-xs" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="confirmed">Potvrđena</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="checked_in">Prijavljena</SelectItem><SelectItem value="completed">Završena</SelectItem><SelectItem value="cancelled">Otkazana</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Gost</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs hidden sm:table-cell">Vreme</TableHead><TableHead className="text-xs hidden md:table-cell">Osoba</TableHead><TableHead className="text-xs hidden md:table-cell">Sto</TableHead><TableHead className="text-xs hidden lg:table-cell">Povod</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema rezervacija</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.guestName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(item.date)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">{item.time}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.partySize}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.tableNo || AREAS[item.area]?.label}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.occasion || '—'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
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

        <TabsContent value="dodaj" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Nova rezervacija</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Ime gosta *</Label><Input className="text-xs" value={form.guestName || ''} onChange={e => setForm({ ...form, guestName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum *</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Vreme *</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Broj osoba</Label><Input className="text-xs" type="number" value={form.partySize || ''} onChange={e => setForm({ ...form, partySize: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Zona</Label><Select value={form.area || 'indoor'} onValueChange={v => setForm({ ...form, area: v as Reservation['area'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Sto</Label><Input className="text-xs" value={form.tableNo || ''} onChange={e => setForm({ ...form, tableNo: e.target.value })} placeholder="T-XX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Trajanje (min)</Label><Input className="text-xs" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Povod</Label><Input className="text-xs" value={form.occasion || ''} onChange={e => setForm({ ...form, occasion: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Izvor</Label><Select value={form.source || 'phone'} onValueChange={v => setForm({ ...form, source: v as Reservation['source'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="phone">Telefon</SelectItem><SelectItem value="website">Web sajt</SelectItem><SelectItem value="app">Aplikacija</SelectItem><SelectItem value="walk_in">Usmeno</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Depozit (RSD)</Label><Input className="text-xs" type="number" value={form.deposit || ''} onChange={e => setForm({ ...form, deposit: Number(e.target.value) })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Specijalni zahtevi</Label><Input className="text-xs" value={form.specialRequests || ''} onChange={e => setForm({ ...form, specialRequests: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4"">Kreiraj rezervaciju</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi rezervacije</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.guestName}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{formatDate(item.date)} {item.time} — {item.partySize} osoba — {item.tableNo || AREAS[item.area]?.label}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji rezervacije</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.guestName}</h3>{getStatusBadge(detailItem.status)}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Br. rezervacije', detailItem.reservationNo],
                  ['Telefon', detailItem.phone],
                  ['Email', detailItem.email || '—'],
                  ['Datum', formatDate(detailItem.date)],
                  ['Vreme', detailItem.time],
                  ['Trajanje', `${detailItem.duration} min`],
                  ['Osoba', String(detailItem.partySize)],
                  ['Sto', detailItem.tableNo || 'Nije dodeljen'],
                  ['Zona', AREAS[detailItem.area]?.label],
                  ['Povod', detailItem.occasion || '—'],
                  ['Izvor', detailItem.source],
                  ['Depozit', detailItem.deposit > 0 ? new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(detailItem.deposit) : 'Nema'],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              {detailItem.specialRequests && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Specijalni zahtevi</div><div className="text-xs">{detailItem.specialRequests}</div></div>}
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Nova rezervacija'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.guestName || ''} onChange={e => setForm({ ...form, guestName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v as Reservation['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="confirmed">Potvrđena</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="checked_in">Prijavljena</SelectItem><SelectItem value="completed">Završena</SelectItem><SelectItem value="cancelled">Otkazana</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Vreme</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
