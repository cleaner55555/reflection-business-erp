'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, School, Users, Monitor, Clock, BookOpen, Chair } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Classroom {
  id: string; name: string; building: string; floor: number; roomNumber: string; capacity: number; occupiedSeats: number
  type: 'lecture' | 'lab' | 'computer' | 'seminar' | 'workshop'; status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  equipment: string[]; teacher: string | null; currentSubject: string | null; nextClass: string | null; nextClassTime: string | null
  schedule: { day: string; time: string; subject: string; teacher: string; group: string }[]; notes: string
}

const INITIAL_DATA: Classroom[] = [
  { id: '1', name: 'Amfiteatar 1', building: 'A', floor: 0, roomNumber: 'A-001', capacity: 120, occupiedSeats: 95, type: 'lecture', status: 'occupied', equipment: ['Projektor', 'Mikrofon', 'Tabla', 'Zvučnici', 'Kamera'], teacher: 'Dr. Petar Nikolić', currentSubject: 'Linearna algebra', nextClass: 'Fizika 1', nextClassTime: '12:00', schedule: [{ day: 'Pon', time: '08-10', subject: 'Linearna algebra', teacher: 'Dr. P. Nikolić', group: '1IT-24' }, { day: 'Pon', time: '12-14', subject: 'Fizika 1', teacher: 'Dr. J. Stanković', group: '1IT-24' }, { day: 'Sre', time: '08-10', subject: 'Linearna algebra', teacher: 'Dr. P. Nikolić', group: '1IT-24' }], notes: '' },
  { id: '2', name: 'Računarska laboratorija 1', building: 'B', floor: 1, roomNumber: 'B-101', capacity: 30, occupiedSeats: 28, type: 'computer', status: 'occupied', equipment: ['30 računara', 'Projektor', 'Internet', 'Štampač'], teacher: 'Marko Đorđević', currentSubject: 'Programiranje 1 - C', nextClass: 'Baze podataka', nextClassTime: '14:00', schedule: [{ day: 'Pon', time: '10-12', subject: 'Programiranje 1', teacher: 'M. Đorđević', group: '1IT-24' }, { day: 'Pon', time: '14-16', subject: 'Baze podataka', teacher: 'G. Jovanović', group: '2IT-24' }], notes: 'Licenca VS ističe u avgustu' },
  { id: '3', name: 'Fizička laboratorija', building: 'B', floor: 0, roomNumber: 'B-005', capacity: 25, occupiedSeats: 0, type: 'lab', status: 'available', equipment: ['Oprema za fiziku', 'Mikroskopi', 'Projektor'], teacher: null, currentSubject: null, nextClass: 'Lab vežbe', nextClassTime: '13:00', schedule: [{ day: 'Uto', time: '13-15', subject: 'Lab - Mehanika', teacher: 'Dr. J. Stanković', group: '1IT-24' }], notes: '' },
  { id: '4', name: 'Seminarska sala 1', building: 'A', floor: 2, roomNumber: 'A-201', capacity: 40, occupiedSeats: 0, type: 'seminar', status: 'reserved', equipment: ['Projektor', 'Tabla', 'Video konf.', 'Klima'], teacher: null, currentSubject: null, nextClass: 'Menadžment', nextClassTime: '14:00', schedule: [{ day: 'Sre', time: '14-16', subject: 'Menadžment projekata', teacher: 'Prof. S. Perić', group: '3IT-24' }], notes: 'Rezervisana za diplomski od 16h' },
  { id: '5', name: 'Amfiteatar 2', building: 'A', floor: 0, roomNumber: 'A-002', capacity: 80, occupiedSeats: 0, type: 'lecture', status: 'available', equipment: ['Projektor', 'Mikrofon', 'Tabla'], teacher: null, currentSubject: null, nextClass: 'Engleski', nextClassTime: '09:00', schedule: [{ day: 'Uto', time: '09-11', subject: 'Engleski', teacher: 'Jelena Stanković', group: '1IT-24' }], notes: '' },
  { id: '6', name: 'Radionica robotike', building: 'C', floor: 0, roomNumber: 'C-001', capacity: 20, occupiedSeats: 0, type: 'workshop', status: 'maintenance', equipment: ['3D štampači', 'Roboti', 'Alati'], teacher: null, currentSubject: null, nextClass: null, nextClassTime: null, schedule: [], notes: 'Renoviranje - završetak do 01.07' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  available: { color: 'bg-emerald-100 text-emerald-800', label: 'Slobodna' }, occupied: { color: 'bg-red-100 text-red-800', label: 'Zauzeta' },
  maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Održavanje' }, reserved: { color: 'bg-sky-100 text-sky-800', label: 'Rezervisana' },
}
const TYPES: Record<string, { color: string; label: string }> = {
  lecture: { color: 'bg-blue-100 text-blue-700', label: 'Predavaonica' }, lab: { color: 'bg-emerald-100 text-emerald-700', label: 'Laboratorija' },
  computer: { color: 'bg-violet-100 text-violet-700', label: 'Računarska' }, seminar: { color: 'bg-amber-100 text-amber-700', label: 'Seminarska' },
  workshop: { color: 'bg-pink-100 text-pink-700', label: 'Radionica' },
}
function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getTypeBadge(t: string) { const r = TYPES[t]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{t}</Badge> }

export function Ucionica() {
  const [data, setData] = useState<Classroom[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.roomNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  }), [data, search, statusFilter])

  const stats = useMemo(() => ({
    total: data.length, available: data.filter(d => d.status === 'available').length, occupied: data.filter(d => d.status === 'occupied').length,
    totalSeats: data.reduce((s, d) => s + d.capacity, 0), occupied: data.reduce((s, d) => s + d.occupiedSeats, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><School className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Učionice</h1><p className="text-sm text-muted-foreground">Upravljanje učionicama i prostorijama</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Slobodne</div><p className="text-xl font-bold text-emerald-700">{stats.available}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Zauzete</div><p className="text-xl font-bold text-red-700">{stats.occupied}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Kapacitet</div><p className="text-xl font-bold">{stats.totalSeats}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Zauzeto</div><p className="text-xl font-bold">{stats.occupied}/{stats.totalSeats}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Sve učionice</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, broj..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Sala</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead>
                <TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Kapacitet</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Trenutno</TableHead><TableHead className="text-xs hidden lg:table-cell">Sledeće</TableHead>
                <TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema učionica</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-mono font-bold">{item.roomNumber}</TableCell>
                    <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-[10px] text-muted-foreground">Zgrada {item.building} · Sprat {item.floor}</div></TableCell>
                    <TableCell className="hidden sm:table-cell">{getTypeBadge(item.type)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell"><Users className="h-3 w-3 inline mr-1" />{item.capacity}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.teacher ? <div><p className="text-xs">{item.currentSubject}</p><p className="text-[10px] text-muted-foreground">{item.teacher}</p></div> : <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.nextClass ? `${item.nextClass} · ${item.nextClassTime}` : '-'}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji učionice</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold">{detailItem.name}</p><p className="text-xs text-muted-foreground font-mono">{detailItem.roomNumber} · Zgrada {detailItem.building} · Sprat {detailItem.floor}</p></div><div className="flex gap-2">{getTypeBadge(detailItem.type)}{getStatusBadge(detailItem.status)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Kapacitet</div><p className="text-xs font-bold">{detailItem.capacity} mesta</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Zauzeto</div><p className="text-xs font-bold">{detailItem.occupiedSeats}/{detailItem.capacity}</p></div>
              </div>
              <div className="flex flex-wrap gap-1">{detailItem.equipment.map((e, i) => <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>)}</div>
              {detailItem.currentSubject && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20"><p className="text-[10px] text-red-600 mb-1">Trenutno</p><p className="text-xs font-medium">{detailItem.currentSubject}</p><p className="text-[10px] text-muted-foreground">{detailItem.teacher}</p></div>}
              {detailItem.nextClass && <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20"><p className="text-[10px] text-sky-600 mb-1">Sledeći čas</p><p className="text-xs font-medium">{detailItem.nextClass} · {detailItem.nextClassTime}</p></div>}
              {detailItem.schedule.length > 0 && <div className="space-y-1 max-h-36 overflow-y-auto">{detailItem.schedule.map((s, i) => <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"><span>{s.subject} · {s.teacher} · {s.group}</span><span className="text-muted-foreground shrink-0 ml-2">{s.day} {s.time}</span></div>)}</div>}
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs">{detailItem.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
