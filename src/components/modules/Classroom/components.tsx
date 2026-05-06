'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Users, Monitor, School, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES, TYPES } from './data'
import type { Classroom } from './types'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

export function ClassroomKpiCards({ data }: { data: Classroom[] }) {
  const totalCapacity = data.reduce((s, i) => s + i.capacity, 0)
  const currentUsage = data.reduce((s, i) => s + i.currentOccupancy, 0)
  const availableCount = data.filter(i => i.status === 'available').length
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><School className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Slobodnih</div><p className="text-2xl font-bold text-emerald-700">{availableCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Kapacitet</div><p className="text-2xl font-bold text-blue-700">{totalCapacity}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Monitor className="h-3 w-3" />Zauzetost</div><p className="text-2xl font-bold text-amber-700">{totalCapacity > 0 ? Math.round((currentUsage / totalCapacity) * 100) : 0}%</p></Card>
    </div>
  )
}

export function ClassroomTable({ filtered, search, statusFilter, typeFilter, setSearch, setStatusFilter, setTypeFilter, onView, onEdit, onDelete }: {
  filtered: Classroom[]
  search: string
  statusFilter: string
  typeFilter: string
  setSearch: (v: string) => void
  setStatusFilter: (v: string) => void
  setTypeFilter: (v: string) => void
  onView: (item: Classroom) => void
  onEdit: (item: Classroom) => void
  onDelete: (id: string) => void
}) {
  return (
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
                    <div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${item.currentOccupancy / item.capacity > 0.8 ? 'bg-red-500' : item.currentOccupancy / item.capacity > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((item.currentOccupancy / item.capacity) * 100, 100)}%` }} /></div><span className="text-[10px]">{item.currentOccupancy}/{item.capacity}</span></div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.responsible}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClassroomCreateTab({ form, setForm, onSave }: { form: Partial<Classroom>; setForm: (v: Partial<Classroom>) => void; onSave: () => void }) {
  return (
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
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj učionicu</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClassroomEditTab({ data, onEdit, onDelete }: { data: Classroom[]; onEdit: (item: Classroom) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi učionice</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.name}</span>{getStatusBadge(item.status)}<Badge className="text-[10px] bg-muted">{TYPES[item.type]?.label}</Badge></div>
                <p className="text-xs text-muted-foreground truncate">{item.building} — {item.capacity} mesta — {item.responsible}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ClassroomDetailDialog({ detailItem, open, onClose }: { detailItem: Classroom | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-[10px] text-muted-foreground mb-2">Oprema</div>
              <div className="flex flex-wrap gap-1">{detailItem.equipment.map(e => <Badge key={e} className="text-[10px] bg-muted">{e}</Badge>)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {detailItem.hasProjector && <Badge className="text-[10px] bg-emerald-100 text-emerald-800">Projektor</Badge>}
              {detailItem.hasAC && <Badge className="text-[10px] bg-emerald-100 text-emerald-800">Klima uređaj</Badge>}
              {detailItem.hasWhiteboard && <Badge className="text-[10px] bg-emerald-100 text-emerald-800">Tabla</Badge>}
            </div>
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ClassroomEditDialog({ open, onClose, editItem, form, setForm, onSave }: {
  open: boolean
  onClose: () => void
  editItem: Classroom | null
  form: Partial<Classroom>
  setForm: (v: Partial<Classroom>) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
