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
import { Plus, Search, Trash2, Pencil, Eye, Users, Monitor, School, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Classroom = {
  id: string
  name: string
  building: string
  floor: string
  capacity: number
  currentOccupancy: number
  type: 'lecture' | 'lab' | 'seminar' | 'computer' | 'workshop'
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  equipment: string[]
  responsible: string
  area: number
  hasProjector: boolean
  hasAC: boolean
  hasWhiteboard: boolean
  lastInspection: string
  notes: string
}

const INITIAL: Classroom[] = [
  { id: '1', name: 'Učionica A-101', building: 'Glavna zgrada', floor: '1', capacity: 40, currentOccupancy: 35, type: 'lecture', status: 'occupied', equipment: ['Projektor', 'Tabla', 'Zvučnici'], responsible: 'Prof. Dragan Milić', area: 65, hasProjector: true, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-01', notes: 'Renovirana 2023' },
  { id: '2', name: 'Učionica A-102', building: 'Glavna zgrada', floor: '1', capacity: 30, currentOccupancy: 0, type: 'seminar', status: 'available', equipment: ['Projektor', 'Flip chart'], responsible: 'Prof. Ana Nikolić', area: 45, hasProjector: true, hasAC: true, hasWhiteboard: false, lastInspection: '2024-05-28', notes: '' },
  { id: '3', name: 'Računarska laboratorija B-201', building: 'Tehnički blok', floor: '2', capacity: 25, currentOccupancy: 20, type: 'computer', status: 'occupied', equipment: ['25 PC računara', 'Projektor', 'UPS'], responsible: 'Nenad Stojanović', area: 55, hasProjector: true, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-10', notes: 'Novi računari postavljeni januar 2024' },
  { id: '4', name: 'Fizička laboratorija B-105', building: 'Tehnički blok', floor: '1', capacity: 20, currentOccupancy: 0, type: 'lab', status: 'maintenance', equipment: ['Osciloskop', 'Generators', 'Merni instrumenti'], responsible: 'Prof. Snežana Đorđević', area: 60, hasProjector: false, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-12', notes: 'Popravka ventilacije u toku' },
  { id: '5', name: 'Amfiteatar C-001', building: 'Centar za nastavu', floor: '0', capacity: 120, currentOccupancy: 95, type: 'lecture', status: 'occupied', equipment: ['Projektor HD', 'Zvučni sistem', 'Kamere', 'Pametna tabla'], responsible: 'Prof. Dragan Milić', area: 150, hasProjector: true, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-05', notes: 'Predavanja snimana i streamovana' },
  { id: '6', name: 'Radionica D-301', building: 'Radionički blok', floor: '3', capacity: 15, currentOccupancy: 12, type: 'workshop', status: 'occupied', equipment: ['Alatne mašine', 'Oprema za zavarivanje', 'Zaštitna oprema'], responsible: 'Miodrag Petrović', area: 80, hasProjector: false, hasAC: false, hasWhiteboard: true, lastInspection: '2024-05-15', notes: 'Obavezna zaštitna oprema pri ulazu' },
  { id: '7', name: 'Učionica A-203', building: 'Glavna zgrada', floor: '2', capacity: 35, currentOccupancy: 0, type: 'lecture', status: 'available', equipment: ['Projektor', 'Tabla'], responsible: 'Prof. Jelena Marković', area: 55, hasProjector: true, hasAC: false, hasWhiteboard: true, lastInspection: '2024-05-20', notes: '' },
  { id: '8', name: 'Jezički centar B-302', building: 'Tehnički blok', floor: '3', capacity: 20, currentOccupancy: 0, type: 'seminar', status: 'reserved', equipment: ['Audio sistem', 'Projektor', 'Jezičke kabinete'], responsible: 'Prof. Marija Ilić', area: 40, hasProjector: true, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-08', notes: 'Rezervisana za KEM kurs 15-19.06.' },
  { id: '9', name: 'Hemijska laboratorija B-106', building: 'Tehnički blok', floor: '1', capacity: 18, currentOccupancy: 0, type: 'lab', status: 'available', equipment: ['Napa', 'Mernice', 'Mikroskopi', 'Spectrofotometar'], responsible: 'Prof. Goran Savić', area: 55, hasProjector: false, hasAC: true, hasWhiteboard: true, lastInspection: '2024-06-11', notes: 'Kontrola hemikalija prošla' },
  { id: '10', name: 'Učionica A-301', building: 'Glavna zgrada', floor: '3', capacity: 30, currentOccupancy: 0, type: 'lecture', status: 'maintenance', equipment: ['Projektor', 'Tabla'], responsible: 'Prof. Ana Nikolić', area: 48, hasProjector: true, hasAC: false, hasWhiteboard: true, lastInspection: '2024-04-20', notes: 'Zamena podova — dostupna od 20.06.' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  available: { color: 'bg-emerald-100 text-emerald-800', label: 'Slobodna' },
  occupied: { color: 'bg-blue-100 text-blue-800', label: 'Zauzeta' },
  maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Održavanje' },
  reserved: { color: 'bg-purple-100 text-purple-800', label: 'Rezervisana' },
}

const TYPES: Record<string, { label: string }> = {
  lecture: { label: 'Predavaonica' },
  lab: { label: 'Laboratorija' },
  seminar: { label: 'Seminarska' },
  computer: { label: 'Računarska' },
  workshop: { label: 'Radionica' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function Classroom() {
  const [data, setData] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Classroom | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Classroom>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/classrooms')
      const items = await res.json()
      setData(items.map((i: Record<string, unknown>) => ({
        ...i,
        equipment: typeof i.equipment === 'string' ? JSON.parse(i.equipment) : (i.equipment || []),
        lastInspection: i.lastInspection ? new Date(i.lastInspection as string).toISOString().split('T')[0] : '',
        notes: i.notes || '',
      })))
    } catch { toast.error('Greška pri učitavanju') }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.name, item.building, item.responsible, item.type].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati učionicu?')) return
    try { await fetch(`/api/classrooms/${id}`, { method: 'DELETE' }); setData(prev => prev.filter(i => i.id !== id)); toast.success('Učionica obrisana') }
    catch { toast.error('Greška') }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', building: '', floor: '1', capacity: 30, currentOccupancy: 0, type: 'lecture', status: 'available', equipment: [], responsible: '', area: 45, hasProjector: true, hasAC: false, hasWhiteboard: true, lastInspection: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Classroom) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.building) { toast.error('Popunite obavezna polja'); return }
    try {
      if (editItem) {
        const res = await fetch(`/api/classrooms/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const updated = await res.json()
        setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...updated, equipment: typeof updated.equipment === 'string' ? JSON.parse(updated.equipment) : updated.equipment, lastInspection: updated.lastInspection ? new Date(updated.lastInspection).toISOString().split('T')[0] : '', notes: updated.notes || '' } : i))
        toast.success('Učionica ažurirana')
      } else {
        const res = await fetch('/api/classrooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const created = await res.json()
        setData(prev => [{ ...created, equipment: typeof created.equipment === 'string' ? JSON.parse(created.equipment) : created.equipment, lastInspection: created.lastInspection ? new Date(created.lastInspection).toISOString().split('T')[0] : '', notes: created.notes || '' }, ...prev])
        toast.success('Učionica kreirana')
      }
      setDialogOpen(false)
    } catch { toast.error('Greška pri čuvanju') }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalCapacity = data.reduce((s, i) => s + i.capacity, 0)
  const currentUsage = data.reduce((s, i) => s + i.currentOccupancy, 0)
  const availableCount = data.filter(i => i.status === 'available').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Učionice</h1><p className="text-sm text-muted-foreground">Upravljanje učionicama, laboratorijama i prostorijama</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova učionica</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><School className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Slobodnih</div><p className="text-2xl font-bold text-emerald-700">{availableCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Kapacitet</div><p className="text-2xl font-bold text-blue-700">{totalCapacity}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Monitor className="h-3 w-3" />Zauzetost</div><p className="text-2xl font-bold text-amber-700">{totalCapacity > 0 ? Math.round((currentUsage / totalCapacity) * 100) : 0}%</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista učionica</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="available">Slobodna</SelectItem><SelectItem value="occupied">Zauzeta</SelectItem><SelectItem value="maintenance">Održavanje</SelectItem><SelectItem value="reserved">Rezervisana</SelectItem></SelectContent></Select>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem><SelectItem value="lecture">Predavaonica</SelectItem><SelectItem value="lab">Laboratorija</SelectItem><SelectItem value="seminar">Seminarska</SelectItem><SelectItem value="computer">Računarska</SelectItem><SelectItem value="workshop">Radionica</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Zgrada</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Kapacitet</TableHead><TableHead className="text-xs hidden lg:table-cell">Zauzetost</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Odgovoran</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema učionica</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.building} — sprat {item.floor}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{TYPES[item.type]?.label || item.type}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.capacity} mesta</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">
                          <div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${item.currentOccupancy / item.capacity > 0.8 ? 'bg-red-500' : item.currentOccupancy / item.capacity > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((item.currentOccupancy / item.capacity) * 100, 100)}%` }} /></div><span className="text-xs">{item.currentOccupancy}/{item.capacity}</span></div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.responsible}</TableCell>
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
            <CardHeader><CardTitle className="text-base">Nova učionica</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Učionica A-XXX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Zgrada *</Label><Input className="text-xs" value={form.building || ''} onChange={e => setForm({ ...form, building: e.target.value })} placeholder="Naziv zgrade" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Sprat</Label><Select value={form.floor || '1'} onValueChange={v => setForm({ ...form, floor: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{['0','1','2','3','4','5'].map(f => <SelectItem key={f} value={f}>Sprat {f}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'lecture'} onValueChange={v => setForm({ ...form, type: v as Classroom['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Kapacitet (mesta)</Label><Input className="text-xs" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Površina (m²)</Label><Input className="text-xs" type="number" value={form.area || ''} onChange={e => setForm({ ...form, area: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Odgovorna osoba</Label><Input className="text-xs" value={form.responsible || ''} onChange={e => setForm({ ...form, responsible: e.target.value })} placeholder="Ime profesora" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Oprema (zarez)</Label><Input className="text-xs" value={(form.equipment || []).join(', ')} onChange={e => setForm({ ...form, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Projektor, Tabla, ..." /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-xs flex items-center gap-2"><input type="checkbox" checked={form.hasProjector || false} onChange={e => setForm({ ...form, hasProjector: e.target.checked })} />Projektor</Label>
                  <Label className="text-xs flex items-center gap-2"><input type="checkbox" checked={form.hasAC || false} onChange={e => setForm({ ...form, hasAC: e.target.checked })} />Klima</Label>
                  <Label className="text-xs flex items-center gap-2"><input type="checkbox" checked={form.hasWhiteboard || false} onChange={e => setForm({ ...form, hasWhiteboard: e.target.checked })} />Tabla</Label>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj učionicu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi učionice</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}<Badge className="text-xs bg-muted">{TYPES[item.type]?.label}</Badge></div>
                      <p className="text-xs text-muted-foreground truncate">{item.building} — {item.capacity} mesta — {item.responsible}</p>
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
          <DialogHeader><DialogTitle>Detalji učionice</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Naziv', detailItem.name],
                  ['Zgrada', `${detailItem.building} — sprat ${detailItem.floor}`],
                  ['Tip', TYPES[detailItem.type]?.label],
                  ['Kapacitet', `${detailItem.capacity} mesta`],
                  ['Trenutna zauzetost', `${detailItem.currentOccupancy} mesta`],
                  ['Površina', `${detailItem.area} m²`],
                  ['Odgovorna osoba', detailItem.responsible],
                  ['Poslednja inspekcija', formatDate(detailItem.lastInspection)],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-2">Oprema</div>
                <div className="flex flex-wrap gap-1">{detailItem.equipment.map(e => <Badge key={e} className="text-xs bg-muted">{e}</Badge>)}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {detailItem.hasProjector && <Badge className="text-xs bg-emerald-100 text-emerald-800">Projektor</Badge>}
                {detailItem.hasAC && <Badge className="text-xs bg-emerald-100 text-emerald-800">Klima uređaj</Badge>}
                {detailItem.hasWhiteboard && <Badge className="text-xs bg-emerald-100 text-emerald-800">Tabla</Badge>}
              </div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi učionicu' : 'Nova učionica'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input className="text-xs" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'available'} onValueChange={v => setForm({ ...form, status: v as Classroom['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Slobodna</SelectItem><SelectItem value="occupied">Zauzeta</SelectItem><SelectItem value="maintenance">Održavanje</SelectItem><SelectItem value="reserved">Rezervisana</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Kapacitet</Label><Input className="text-xs" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Odgovoran</Label><Input className="text-xs" value={form.responsible || ''} onChange={e => setForm({ ...form, responsible: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
