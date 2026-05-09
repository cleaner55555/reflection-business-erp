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
import { Plus, Search, Trash2, Pencil, Eye, Filter, Ruler, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Measurement = {
  id: string
  code: string
  product: string
  parameter: string
  nominalValue: string
  unit: string
  measuredValue: string
  tolerance: string
  deviation: string
  status: 'ok' | 'warning' | 'fail' | 'pending'
  instrument: string
  operator: string
  station: string
  batch: string
  date: string
  notes: string
}

const INITIAL: Measurement[] = [
  { id: '1', code: 'MER-2024-001', product: 'Osovina fi-25mm', parameter: 'Prečnik', nominalValue: '25.000', unit: 'mm', measuredValue: '25.003', tolerance: '±0.010', deviation: '+0.003', status: 'ok', instrument: 'Mikrometar Mitutoyo 293', operator: 'Marko Petrović', station: 'QC-01', batch: 'LOT-2024-0156', date: '2024-06-15', notes: 'Unutar tolerancije' },
  { id: '2', code: 'MER-2024-002', product: 'Ležajna kućište HK-42', parameter: 'Unutrašnji prečnik', nominalValue: '42.000', unit: 'mm', measuredValue: '42.012', tolerance: '±0.008', deviation: '+0.012', status: 'fail', instrument: 'Mikrometar Mitutoyo 293', operator: 'Jelena Stanković', station: 'QC-02', batch: 'LOT-2024-0157', date: '2024-06-15', notes: 'Prekoračenje tolerancije — odbijeno' },
  { id: '3', code: 'MER-2024-003', product: 'Cev fi-12×1.5m', parameter: 'Debljina zida', nominalValue: '1.500', unit: 'mm', measuredValue: '1.492', tolerance: '±0.015', deviation: '-0.008', status: 'ok', instrument: 'Debljinomer ultrazvučni', operator: 'Nikola Jovanović', station: 'QC-01', batch: 'LOT-2024-0158', date: '2024-06-14', notes: 'Ispitivanje uzorka 3 od 10' },
  { id: '4', code: 'MER-2024-004', product: 'Flanša DN100 PN16', parameter: 'Ravnomernost površine', nominalValue: '0.050', unit: 'mm', measuredValue: '0.046', tolerance: '±0.010', deviation: '-0.004', status: 'ok', instrument: 'Površinski merač', operator: 'Marko Petrović', station: 'QC-03', batch: 'LOT-2024-0160', date: '2024-06-14', notes: '' },
  { id: '5', code: 'MER-2024-005', product: 'Ventil V-50 PN25', parameter: 'Radni pritisak test', nominalValue: '25.0', unit: 'bar', measuredValue: '24.8', tolerance: '±0.5', deviation: '-0.2', status: 'ok', instrument: 'Manometar digitalni', operator: 'Ana Milić', station: 'QC-04', batch: 'LOT-2024-0161', date: '2024-06-13', notes: 'Test na 5 min pod pritiskom' },
  { id: '6', code: 'MER-2024-006', product: 'Zatvarač Z-80', parameter: 'Hod ventila', nominalValue: '45.0', unit: 'mm', measuredValue: '44.2', tolerance: '±1.0', deviation: '-0.8', status: 'warning', instrument: 'Indikator satnji', operator: 'Nikola Jovanović', station: 'QC-02', batch: 'LOT-2024-0162', date: '2024-06-13', notes: 'Blizu donje granice tolerancije — monitoring' },
  { id: '7', code: 'MER-2024-007', product: 'Elektroda E-7018 fi-3.2', parameter: 'Prečnik jezgra', nominalValue: '3.200', unit: 'mm', measuredValue: '—', tolerance: '±0.050', deviation: '—', status: 'pending', instrument: 'Mikrometar Mitutoyo 293', operator: 'Jelena Stanković', station: 'QC-01', batch: 'LOT-2024-0165', date: '2024-06-12', notes: 'Čeka se isporuka instrumenta iz kalibracije' },
  { id: '8', code: 'MER-2024-008', product: 'Čelična ploča 10×1500×3000', parameter: 'Debljina', nominalValue: '10.000', unit: 'mm', measuredValue: '10.15', tolerance: '±0.200', deviation: '+0.150', status: 'ok', instrument: 'Debljinomer digitalni', operator: 'Marko Petrović', station: 'QC-05', batch: 'LOT-2024-0168', date: '2024-06-12', notes: 'Mereno na 5 tačaka — prosečna vrednost' },
  { id: '9', code: 'MER-2024-009', product: 'Pumpa P-65-2.2', parameter: 'Pritisak na izlazu', nominalValue: '6.5', unit: 'bar', measuredValue: '5.9', tolerance: '±0.3', deviation: '-0.6', status: 'fail', instrument: 'Manometar digitalni', operator: 'Ana Milić', station: 'QC-04', batch: 'LOT-2024-0170', date: '2024-06-11', notes: 'Pritisak ispod minimuma — servisna intervencija' },
  { id: '10', code: 'MER-2024-010', product: 'Rukavac RG-32', parameter: 'Spoljašnji prečnik', nominalValue: '32.00', unit: 'mm', measuredValue: '31.98', tolerance: '±0.05', deviation: '-0.02', status: 'ok', instrument: 'Mikrometar Mitutoyo 293', operator: 'Nikola Jovanović', station: 'QC-01', batch: 'LOT-2024-0172', date: '2024-06-11', notes: '' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  ok: { color: 'bg-emerald-100 text-emerald-800', label: 'OK' },
  warning: { color: 'bg-amber-100 text-amber-800', label: 'Upozorenje' },
  fail: { color: 'bg-red-100 text-red-800', label: 'Otkaz' },
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Na čekanju' },
}

const UNITS = ['mm', 'μm', 'bar', 'MPa', '°C', 'kg', 'g', 'l', 'm', 'cm', 'V', 'A', 'Ω', 'Hz']
const PARAMETERS = ['Prečnik', 'Debljina', 'Dužina', 'Širina', 'Težina', 'Pritisak', 'Temperatura', 'Brzina', 'Hod', 'Ravnomernost', 'Otvrdnuće', 'Čvrstoća', 'Hrapavost', 'Pravilnost']

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function Measurements() {
  const [data, setData] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Measurement | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Measurement>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/measurements')
      const items = await res.json()
      setData(items.map((m: Record<string, unknown>) => ({
        ...m,
        date: m.date ? new Date(m.date as string).toISOString().split('T')[0] : '',
      })) as Measurement[])
    } catch { toast.error('Greška pri učitavanju') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.code, item.product, item.parameter, item.operator, item.batch, item.station].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati merenje?')) return
    try {
      await fetch(`/api/measurements/${id}`, { method: 'DELETE' })
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Merenje obrisano')
    } catch { toast.error('Greška pri brisanju') }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ code: `MER-2024-${String(data.length + 1).padStart(3, '0')}`, product: '', parameter: '', nominalValue: '', unit: 'mm', measuredValue: '', tolerance: '', deviation: '', status: 'pending', instrument: '', operator: '', station: '', batch: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Measurement) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.product || !form.parameter) { toast.error('Popunite obavezna polja'); return }
    try {
      if (editItem) {
        const res = await fetch(`/api/measurements/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const updated = await res.json()
        setData(prev => prev.map(i => i.id === editItem.id ? ({ ...i, ...updated, date: updated.date ? new Date(updated.date).toISOString().split('T')[0] : i.date }) as Measurement : i))
        toast.success('Merenje ažurirano')
      } else {
        const res = await fetch('/api/measurements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const created = await res.json()
        setData(prev => [{ ...created, date: created.date ? new Date(created.date).toISOString().split('T')[0] : '' } as Measurement, ...prev])
        toast.success('Merenje kreirano')
      }
      setDialogOpen(false)
    } catch { toast.error('Greška pri čuvanju') }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const okCount = data.filter(i => i.status === 'ok').length
  const warnCount = data.filter(i => i.status === 'warning').length
  const failCount = data.filter(i => i.status === 'fail').length
  const pendingCount = data.filter(i => i.status === 'pending').length
  const passRate = data.length > 0 ? ((okCount / data.length) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Kontrolna merenja</h1><p className="text-sm text-muted-foreground">Kontrola kvaliteta — merenje i inspekcija proizvoda</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novo merenje</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />OK</div><p className="text-2xl font-bold text-emerald-700">{okCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Upozorenja</div><p className="text-2xl font-bold text-amber-700">{warnCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Otkaz</div><p className="text-2xl font-bold text-red-700">{failCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Stopa prolaza</div><p className="text-2xl font-bold">{passRate}%</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base flex items-center gap-2"><Ruler className="h-4 w-4" />Lista merenja</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="ok">OK</SelectItem><SelectItem value="warning">Upozorenje</SelectItem><SelectItem value="fail">Otkaz</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Šifra</TableHead><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs hidden sm:table-cell">Parametar</TableHead><TableHead className="text-xs hidden md:table-cell">Nominalno</TableHead><TableHead className="text-xs hidden md:table-cell">Izmereno</TableHead><TableHead className="text-xs hidden lg:table-cell">Odstupanje</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Operater</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema merenja</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-mono font-medium">{item.code}</TableCell>
                        <TableCell className="text-xs font-medium">{item.product}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.parameter}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.nominalValue} {item.unit}</TableCell>
                        <TableCell className="text-xs font-medium hidden md:table-cell">{item.measuredValue} {item.unit}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell"><span className={item.status === 'fail' ? 'text-red-600 font-semibold' : item.status === 'warning' ? 'text-amber-600 font-semibold' : ''}>{item.deviation}</span></TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.operator}</TableCell>
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
            <CardHeader><CardTitle className="text-base">Novo merenje</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Šifra</Label><Input className="text-xs" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MER-2024-XXX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Proizvod *</Label><Input className="text-xs" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="Naziv proizvoda" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Parametar *</Label><Select value={form.parameter || ''} onValueChange={v => setForm({ ...form, parameter: v })}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi parametar" /></SelectTrigger><SelectContent>{PARAMETERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Jedinica mere</Label><Select value={form.unit || 'mm'} onValueChange={v => setForm({ ...form, unit: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Nominalna vrednost</Label><Input className="text-xs" type="number" step="0.001" value={form.nominalValue || ''} onChange={e => setForm({ ...form, nominalValue: e.target.value })} placeholder="0.000" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Izmerena vrednost</Label><Input className="text-xs" type="number" step="0.001" value={form.measuredValue || ''} onChange={e => setForm({ ...form, measuredValue: e.target.value })} placeholder="0.000" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Tolerancija (±)</Label><Input className="text-xs" value={form.tolerance || ''} onChange={e => setForm({ ...form, tolerance: e.target.value })} placeholder="±0.010" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Paket</Label><Input className="text-xs" value={form.batch || ''} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="LOT-2024-XXX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Instrument</Label><Input className="text-xs" value={form.instrument || ''} onChange={e => setForm({ ...form, instrument: e.target.value })} placeholder="Naziv instrumenta" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Operater</Label><Input className="text-xs" value={form.operator || ''} onChange={e => setForm({ ...form, operator: e.target.value })} placeholder="Ime operatera" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Stanica</Label><Input className="text-xs" value={form.station || ''} onChange={e => setForm({ ...form, station: e.target.value })} placeholder="QC-XX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Napomene o merenju..." /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj merenje</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi merenja</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium">{item.code}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.product} — {item.parameter}: {item.measuredValue} {item.unit} (nom. {item.nominalValue})</p>
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
          <DialogHeader><DialogTitle>Detalji merenja</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Šifra', detailItem.code],
                  ['Proizvod', detailItem.product],
                  ['Parametar', detailItem.parameter],
                  ['Jedinica', detailItem.unit],
                  ['Nominalna vrednost', `${detailItem.nominalValue} ${detailItem.unit}`],
                  ['Izmerena vrednost', `${detailItem.measuredValue} ${detailItem.unit}`],
                  ['Tolerancija', detailItem.tolerance],
                  ['Odstupanje', detailItem.deviation],
                  ['Instrument', detailItem.instrument],
                  ['Operater', detailItem.operator],
                  ['Stanica', detailItem.station],
                  ['Paket', detailItem.batch],
                  ['Datum', formatDate(detailItem.date)],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi merenje' : 'Novo merenje'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Proizvod *</Label><Input className="text-xs" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Parametar</Label><Input className="text-xs" value={form.parameter || ''} onChange={e => setForm({ ...form, parameter: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Nominalna vrednost</Label><Input className="text-xs" value={form.nominalValue || ''} onChange={e => setForm({ ...form, nominalValue: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Izmerena vrednost</Label><Input className="text-xs" value={form.measuredValue || ''} onChange={e => setForm({ ...form, measuredValue: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v as Measurement['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ok">OK</SelectItem><SelectItem value="warning">Upozorenje</SelectItem><SelectItem value="fail">Otkaz</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Operater</Label><Input className="text-xs" value={form.operator || ''} onChange={e => setForm({ ...form, operator: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
