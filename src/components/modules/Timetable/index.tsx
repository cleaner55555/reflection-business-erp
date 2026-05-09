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
import { Plus, Search, Trash2, Pencil, Eye, Calendar, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type ScheduleEntry = {
  id: string
  subject: string
  teacher: string
  classGroup: string
  room: string
  dayOfWeek: 'ponedeljak' | 'utorak' | 'sreda' | 'cetvrtak' | 'petak' | 'subota'
  timeStart: string
  timeEnd: string
  type: 'lecture' | 'exercise' | 'lab' | 'seminar' | 'exam'
  semester: string
  status: 'active' | 'cancelled' | 'rescheduled' | 'completed'
  notes: string
}

const DAYS = ['ponedeljak', 'utorak', 'sreda', 'cetvrtak', 'petak', 'subota'] as const
const DAY_LABELS: Record<string, string> = { ponedeljak: 'Ponedeljak', utorak: 'Utorak', sreda: 'Sreda', cetvrtak: 'Četvrtak', petak: 'Petak', subota: 'Subota' }

const INITIAL: ScheduleEntry[] = [
  { id: '1', subject: 'Matematika III', teacher: 'Prof. Jelena Marković', classGroup: 'II-1', room: 'A-101', dayOfWeek: 'ponedeljak', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '2', subject: 'Matematika III — Vežbe', teacher: 'Asist. Miloš Rakić', classGroup: 'II-1', room: 'A-203', dayOfWeek: 'ponedeljak', timeStart: '10:00', timeEnd: '11:30', type: 'exercise', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '3', subject: 'Fizika II', teacher: 'Prof. Snežana Đorđević', classGroup: 'II-1', room: 'A-102', dayOfWeek: 'utorak', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '4', subject: 'Fizika II — Laboratorija', teacher: 'Asist. Branislav Popović', classGroup: 'II-1 (grupa A)', room: 'B-105', dayOfWeek: 'utorak', timeStart: '13:00', timeEnd: '16:00', type: 'lab', semester: '2023/2024 zimski', status: 'active', notes: 'Dve grupe — A (13-16) i B (16-19)' },
  { id: '5', subject: 'Programiranje II', teacher: 'Nenad Stojanović', classGroup: 'II-1', room: 'B-201', dayOfWeek: 'sreda', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '6', subject: 'Programiranje II — Vežbe', teacher: 'Asist. Dejan Stefanović', classGroup: 'II-1', room: 'B-201', dayOfWeek: 'sreda', timeStart: '10:00', timeEnd: '11:30', type: 'exercise', semester: '2023/2024 zimski', status: 'active', notes: 'Računarska sala — laptop ne potreban' },
  { id: '7', subject: 'Hemija', teacher: 'Prof. Goran Savić', classGroup: 'II-1', room: 'A-101', dayOfWeek: 'cetvrtak', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '8', subject: 'Elektrotehnika', teacher: 'Prof. Zoran Antić', classGroup: 'II-1', room: 'A-102', dayOfWeek: 'petak', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'cancelled', notes: 'Otkazano 14.06. — profesor odsutan' },
  { id: '9', subject: 'Kolokvijum — Matematika III', teacher: 'Prof. Jelena Marković', classGroup: 'II-1', room: 'C-001', dayOfWeek: 'petak', timeStart: '10:00', timeEnd: '12:00', type: 'exam', semester: '2023/2024 zimski', status: 'completed', notes: 'Pisani kolokvijum iz integralnog računa' },
  { id: '10', subject: 'Engleski jezik B2', teacher: 'Ana Kostić', classGroup: 'II-1', room: 'B-302', dayOfWeek: 'subota', timeStart: '09:00', timeEnd: '10:30', type: 'exercise', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '11', subject: 'Ekonomija', teacher: 'Prof. Dragan Milić', classGroup: 'II-2', room: 'A-101', dayOfWeek: 'ponedeljak', timeStart: '10:00', timeEnd: '11:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' },
  { id: '12', subject: 'Preduzetništvo', teacher: 'Prof. Ana Nikolić', classGroup: 'II-2', room: 'A-203', dayOfWeek: 'sreda', timeStart: '13:00', timeEnd: '14:30', type: 'seminar', semester: '2023/2024 zimski', status: 'active', notes: ' gost predavač iz privrede 19.06.' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivno' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazano' },
  rescheduled: { color: 'bg-amber-100 text-amber-800', label: 'Pomeren' },
  completed: { color: 'bg-gray-100 text-gray-800', label: 'Završeno' },
}

const TYPES: Record<string, { color: string; label: string }> = {
  lecture: { color: 'bg-blue-50 text-blue-700', label: 'Predavanje' },
  exercise: { color: 'bg-green-50 text-green-700', label: 'Vežbe' },
  lab: { color: 'bg-purple-50 text-purple-700', label: 'Laboratorija' },
  seminar: { color: 'bg-amber-50 text-amber-700', label: 'Seminar' },
  exam: { color: 'bg-red-50 text-red-700', label: 'Ispit' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function Timetable() {
  const [data, setData] = useState<ScheduleEntry[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<ScheduleEntry | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ScheduleEntry>>({})
  const [activeTab, setActiveTab] = useState('pregled')
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const groups = [...new Set(data.map(i => i.classGroup.split(' (')[0]))]

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.subject, item.teacher, item.room].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchDay = !dayFilter || item.dayOfWeek === dayFilter
    const matchGroup = !groupFilter || item.classGroup.startsWith(groupFilter)
    return matchSearch && matchDay && matchGroup
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati unos rasporeda?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Unos obrisan')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ subject: '', teacher: '', classGroup: '', room: '', dayOfWeek: 'ponedeljak', timeStart: '08:00', timeEnd: '09:30', type: 'lecture', semester: '2023/2024 zimski', status: 'active', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: ScheduleEntry) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.subject || !form.teacher) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as ScheduleEntry : i))
      toast.success('Raspored ažuriran')
    } else {
      const newItem: ScheduleEntry = { id: Date.now().toString(), ...form } as ScheduleEntry
      setData(prev => [...prev, newItem])
      toast.success('Unos kreiran')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const activeCount = data.filter(i => i.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Raspored</h1><p className="text-sm text-muted-foreground">Nedeljni raspored nastave i ispita</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi unos</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Odjeljenja</div><p className="text-2xl font-bold text-blue-700">{groups.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Semestar</div><p className="text-lg font-bold text-amber-700">2023/24</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
          <div className="flex gap-1">
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setViewMode('list')}>Lista</Button>
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setViewMode('table')}>Tabela</Button>
          </div>
        </div>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Raspored nastave</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={dayFilter || 'all'} onValueChange={v => setDayFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi dani</SelectItem>{DAYS.map(d => <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>)}</SelectContent></Select>
                  <Select value={groupFilter || 'all'} onValueChange={v => setGroupFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem>{groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">{DAYS.map(d => <th key={d} className="p-2 text-left font-medium text-muted-foreground min-w-[140px]">{DAY_LABELS[d]}</th>)}</tr>
                    </thead>
                    <tbody>
                      {['08:00', '10:00', '12:00', '14:00', '16:00'].map(time => (
                        <tr key={time} className="border-b">
                          {DAYS.map(day => {
                            const entries = filtered.filter(e => e.dayOfWeek === day && e.timeStart.startsWith(time.slice(0, 2)))
                            return <td key={day} className="p-1 align-top">
                              {entries.length > 0 ? entries.map(e => (
                                <div key={e.id} className={`p-1.5 rounded mb-1 cursor-pointer border-l-2 ${e.type === 'lecture' ? 'border-l-blue-500 bg-blue-50/50' : e.type === 'exercise' ? 'border-l-green-500 bg-green-50/50' : e.type === 'lab' ? 'border-l-purple-500 bg-purple-50/50' : e.type === 'exam' ? 'border-l-red-500 bg-red-50/50' : 'border-l-amber-500 bg-amber-50/50'}`} onClick={() => setDetailId(e.id)}>
                                  <div className="font-medium">{e.subject}</div>
                                  <div className="text-muted-foreground">{e.timeStart}-{e.timeEnd}</div>
                                  <div className="text-muted-foreground">{e.room}</div>
                                  {e.status === 'cancelled' && <Badge className="text-[9px] bg-red-100 text-red-700">OTK</Badge>}
                                </div>
                              )) : <div className="h-12" />}
                            </td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="max-h-[480px] overflow-y-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-xs">Dan</TableHead><TableHead className="text-xs">Vreme</TableHead><TableHead className="text-xs">Predmet</TableHead><TableHead className="text-xs hidden sm:table-cell">Nastavnik</TableHead><TableHead className="text-xs hidden md:table-cell">Sala</TableHead><TableHead className="text-xs hidden md:table-cell">Grupa</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema unosa</TableCell></TableRow> : filtered.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs font-medium">{DAY_LABELS[item.dayOfWeek]}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{item.timeStart}-{item.timeEnd}</TableCell>
                          <TableCell className="text-xs font-medium">{item.subject}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.teacher}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{item.room}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{item.classGroup}</TableCell>
                          <TableCell>{getTypeBadge(item.type)}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Novi unos rasporeda</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Predmet *</Label><Input className="text-xs" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Nastavnik *</Label><Input className="text-xs" value={form.teacher || ''} onChange={e => setForm({ ...form, teacher: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Odjeljenje</Label><Input className="text-xs" value={form.classGroup || ''} onChange={e => setForm({ ...form, classGroup: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Sala</Label><Input className="text-xs" value={form.room || ''} onChange={e => setForm({ ...form, room: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Dan</Label><Select value={form.dayOfWeek || 'ponedeljak'} onValueChange={v => setForm({ ...form, dayOfWeek: v as ScheduleEntry['dayOfWeek'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'lecture'} onValueChange={v => setForm({ ...form, type: v as ScheduleEntry['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lecture">Predavanje</SelectItem><SelectItem value="exercise">Vežbe</SelectItem><SelectItem value="lab">Laboratorija</SelectItem><SelectItem value="seminar">Seminar</SelectItem><SelectItem value="exam">Ispit</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Početak</Label><Input className="text-xs" type="time" value={form.timeStart || ''} onChange={e => setForm({ ...form, timeStart: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Kraj</Label><Input className="text-xs" type="time" value={form.timeEnd || ''} onChange={e => setForm({ ...form, timeEnd: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj unos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi raspored</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.subject}</span>{getTypeBadge(item.type)}{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{DAY_LABELS[item.dayOfWeek]} {item.timeStart}-{item.timeEnd} — {item.room} — {item.classGroup}</p>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Detalji rasporeda</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{detailItem.subject}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Dan', DAY_LABELS[detailItem.dayOfWeek]],
                  ['Vreme', `${detailItem.timeStart} - ${detailItem.timeEnd}`],
                  ['Nastavnik', detailItem.teacher],
                  ['Sala', detailItem.room],
                  ['Odjeljenje', detailItem.classGroup],
                  ['Tip', TYPES[detailItem.type]?.label],
                  ['Semestar', detailItem.semester],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi unos' : 'Novi unos'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Predmet *</Label><Input className="text-xs" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v as ScheduleEntry['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivno</SelectItem><SelectItem value="cancelled">Otkazano</SelectItem><SelectItem value="rescheduled">Pomeren</SelectItem><SelectItem value="completed">Završeno</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Dan</Label><Select value={form.dayOfWeek || 'ponedeljak'} onValueChange={v => setForm({ ...form, dayOfWeek: v as ScheduleEntry['dayOfWeek'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Vreme</Label><div className="flex gap-1"><Input className="text-xs" type="time" value={form.timeStart || ''} onChange={e => setForm({ ...form, timeStart: e.target.value })} /><Input className="text-xs" type="time" value={form.timeEnd || ''} onChange={e => setForm({ ...form, timeEnd: e.target.value })} /></div></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
