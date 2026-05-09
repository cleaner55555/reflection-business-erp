'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, Calendar, Clock, Users, RefreshCw } from 'lucide-react'
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
  area: string
  status: string
  occasion: string
  specialRequests: string
  source: string
  duration: number
  deposit: number
  notes: string
  createdAt: string
  updatedAt: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  confirmed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Potvrđena' },
  pending: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Na čekanju' },
  checked_in: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Prijavljena' },
  completed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Završena' },
  cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Otkazana' },
  no_show: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Nije došao' },
}

const AREAS: Record<string, { label: string }> = {
  indoor: { label: 'Sala' },
  outdoor: { label: 'Bašta' },
  terrace: { label: 'Terasa' },
  vip: { label: 'VIP' },
  bar: { label: 'Bar' },
}

const SOURCES: Record<string, { label: string }> = {
  phone: { label: 'Telefon' },
  website: { label: 'Web sajt' },
  walk_in: { label: 'Usmeno' },
  app: { label: 'Aplikacija' },
  email: { label: 'Email' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

const formatRSD = (n: number) => new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(n)

export function Reservations() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Reservation | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Reservation>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId, limit: '200' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (dateFilter) params.set('date', dateFilter)
      const res = await fetch(`/api/reservations?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.items || [])
      }
    } catch (err) {
      console.error('Failed to load reservations:', err)
    }
    setLoading(false)
  }, [activeCompanyId, search, statusFilter, dateFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati rezervaciju?')) return
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => prev.filter(i => i.id !== id))
        toast.success('Rezervacija obrisana')
      }
    } catch { toast.error('Greška pri brisanju') }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({
      guestName: '', phone: '', email: '',
      date: new Date().toISOString().split('T')[0], time: '19:00',
      partySize: 2, tableNo: '', area: 'indoor', status: 'pending',
      occasion: '', specialRequests: '', source: 'phone', duration: 90, deposit: 0, notes: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Reservation) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.guestName) { toast.error('Unesite ime gosta'); return }
    try {
      if (editItem) {
        const res = await fetch(`/api/reservations/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, companyId: activeCompanyId }),
        })
        if (res.ok) {
          toast.success('Rezervacija ažurirana')
          loadData()
        }
      } else {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, companyId: activeCompanyId }),
        })
        if (res.ok) {
          toast.success('Rezervacija kreirana')
          loadData()
        }
      }
    } catch { toast.error('Greška pri čuvanju') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const today = new Date().toISOString().split('T')[0]
  const todayReservations = data.filter(i => i.date === today && i.status !== 'cancelled').length
  const totalGuests = data.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.partySize, 0)
  const totalDeposits = data.reduce((s, i) => s + (i.deposit || 0), 0)
  const pendingCount = data.filter(i => i.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rezervacije</h1>
          <p className="text-sm text-muted-foreground">Upravljanje rezervacijama i stolovima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" /> Osveži
          </Button>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova rezervacija
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div>
          <p className="text-2xl font-bold">{data.length}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Danas</div>
          <p className="text-2xl font-bold text-blue-700">{todayReservations}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Gostiju</div>
          <p className="text-2xl font-bold text-amber-700">{totalGuests}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Depoziti</div>
          <p className="text-xl font-bold text-emerald-700">{formatRSD(totalDeposits)}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-orange-600 mb-1">Na čekanju</div>
          <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
          <TabsTrigger value="uredi">Uredi</TabsTrigger>
        </TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista rezervacija</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Input type="date" className="h-8 w-36 text-xs" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve</SelectItem>
                      {Object.entries(STATUSES).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                {data.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nema rezervacija</p>
                    <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj rezervaciju</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Gost</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Datum</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Vreme</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Osoba</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Sto</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Povod</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs text-right">Akcije</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[150px]">{item.guestName}</span>
                              {item.deposit > 0 && <span className="text-emerald-600 font-bold">({formatRSD(item.deposit)})</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(item.date)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">{item.time}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.partySize}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.tableNo || AREAS[item.area]?.label}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.occasion || '—'}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                  <div className="grid gap-2"><Label className="text-xs">Ime gosta *</Label><Input className="text-sm" value={form.guestName || ''} onChange={e => setForm({ ...form, guestName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-sm" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Email</Label><Input className="text-sm" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum *</Label><Input className="text-sm" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Vreme *</Label><Input className="text-sm" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Broj osoba</Label><Input className="text-sm" type="number" value={form.partySize || ''} onChange={e => setForm({ ...form, partySize: Number(e.target.value) })} /></div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Zona</Label>
                    <Select value={form.area || 'indoor'} onValueChange={v => setForm({ ...form, area: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label className="text-xs">Sto</Label><Input className="text-sm" value={form.tableNo || ''} onChange={e => setForm({ ...form, tableNo: e.target.value })} placeholder="T-XX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Trajanje (min)</Label><Input className="text-sm" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Povod</Label><Input className="text-sm" value={form.occasion || ''} onChange={e => setForm({ ...form, occasion: e.target.value })} /></div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Izvor</Label>
                    <Select value={form.source || 'phone'} onValueChange={v => setForm({ ...form, source: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(SOURCES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label className="text-xs">Depozit (RSD)</Label><Input className="text-sm" type="number" value={form.deposit || ''} onChange={e => setForm({ ...form, deposit: Number(e.target.value) })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Specijalni zahtevi</Label><Textarea className="text-sm" value={form.specialRequests || ''} onChange={e => setForm({ ...form, specialRequests: e.target.value })} rows={2} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" /> Kreiraj rezervaciju</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi rezervacije</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nema rezervacija</p>
                ) : data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.guestName}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDate(item.date)} {item.time} — {item.partySize} osoba — {item.tableNo || AREAS[item.area]?.label}
                      </p>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji rezervacije</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{detailItem.guestName}</h3>
                {getStatusBadge(detailItem.status)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Br. rezervacije', detailItem.reservationNo],
                  ['Telefon', detailItem.phone || '—'],
                  ['Email', detailItem.email || '—'],
                  ['Datum', formatDate(detailItem.date)],
                  ['Vreme', detailItem.time],
                  ['Trajanje', `${detailItem.duration} min`],
                  ['Osoba', String(detailItem.partySize)],
                  ['Sto', detailItem.tableNo || 'Nije dodeljen'],
                  ['Zona', AREAS[detailItem.area]?.label],
                  ['Povod', detailItem.occasion || '—'],
                  ['Izvor', SOURCES[detailItem.source]?.label || detailItem.source],
                  ['Depozit', detailItem.deposit > 0 ? formatRSD(detailItem.deposit) : 'Nema'],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium">{val}</div>
                  </div>
                ))}
              </div>
              {detailItem.specialRequests && (
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Specijalni zahtevi</div>
                  <div className="text-sm">{detailItem.specialRequests}</div>
                </div>
              )}
              {detailItem.notes && (
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Napomene</div>
                  <div className="text-sm">{detailItem.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Uredi rezervaciju' : 'Nova rezervacija'}</DialogTitle>
            <DialogDescription>{editItem ? 'Izmenite podatke rezervacije' : 'Popunite podatke za novu rezervaciju'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-sm" value={form.guestName || ''} onChange={e => setForm({ ...form, guestName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-sm" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label>
                <Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUSES).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label className="text-xs">Sto</Label><Input className="text-sm" value={form.tableNo || ''} onChange={e => setForm({ ...form, tableNo: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-sm" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Vreme</Label><Input className="text-sm" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Osoba</Label><Input className="text-sm" type="number" value={form.partySize || ''} onChange={e => setForm({ ...form, partySize: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Depozit (RSD)</Label><Input className="text-sm" type="number" value={form.deposit || ''} onChange={e => setForm({ ...form, deposit: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Textarea className="text-sm" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button size="sm" onClick={handleSave}>Sačuvaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
