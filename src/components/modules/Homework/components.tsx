'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Homework } from './types'
import { STATUSES, TYPES } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

/* ─── KPI Cards ─── */
export function HomeworkKpiCards({ data }: { data: Homework[] }) {
  const assignedCount = data.filter(i => i.status === 'assigned').length
  const gradedCount = data.filter(i => i.status === 'graded').length
  const overdueCount = data.filter(i => i.status === 'overdue').length
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Aktivnih</div><p className="text-2xl font-bold text-blue-700">{assignedCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ocenjenih</div><p className="text-2xl font-bold text-emerald-700">{gradedCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kasne</div><p className="text-2xl font-bold text-red-700">{overdueCount}</p></Card>
    </div>
  )
}

/* ─── Table ─── */
export function HomeworkTable({
  filtered, search, setSearch, statusFilter, setStatusFilter, subjectFilter, setSubjectFilter, subjects, onView, onEdit, onDelete,
}: {
  filtered: Homework[]
  search: string; setSearch: (v: string) => void
  statusFilter: string; setStatusFilter: (v: string) => void
  subjectFilter: string; setSubjectFilter: (v: string) => void
  subjects: string[]
  onView: (id: string) => void; onEdit: (item: Homework) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista obaveza</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="assigned">Dodeljena</SelectItem><SelectItem value="submitted">Predana</SelectItem><SelectItem value="graded">Ocenjena</SelectItem><SelectItem value="overdue">Kasni</SelectItem></SelectContent></Select>
            <Select value={subjectFilter || 'all'} onValueChange={v => setSubjectFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi predmeti</SelectItem>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden sm:table-cell">Predmet</TableHead><TableHead className="text-xs hidden md:table-cell">Odjeljenje</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs hidden lg:table-cell">Predano</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema obaveza</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium max-w-[200px] truncate">{item.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.subject}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.classGroup}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{TYPES[item.type]?.label || item.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{item.submittedCount}/{item.totalStudents}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
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

/* ─── Create Tab ─── */
export function HomeworkCreateTab({ form, setForm, onSave }: {
  form: Partial<Homework>; setForm: (f: Partial<Homework>) => void; onSave: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Nova obaveza</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2 sm:col-span-2"><Label className="text-xs">Naslov *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Naslov zadatka" /></div>
            <div className="grid gap-2"><Label className="text-xs">Predmet *</Label><Input className="text-xs" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Predmet" /></div>
            <div className="grid gap-2"><Label className="text-xs">Odjeljenje</Label><Input className="text-xs" value={form.classGroup || ''} onChange={e => setForm({ ...form, classGroup: e.target.value })} placeholder="III-2" /></div>
            <div className="grid gap-2"><Label className="text-xs">Nastavnik</Label><Input className="text-xs" value={form.teacher || ''} onChange={e => setForm({ ...form, teacher: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'essay'} onValueChange={v => setForm({ ...form, type: v as Homework['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Rok predaje</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Max bodova</Label><Input className="text-xs" type="number" value={form.maxPoints || ''} onChange={e => setForm({ ...form, maxPoints: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input className="text-xs" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Uputstva</Label><Input className="text-xs" value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj obavezu</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Edit Tab ─── */
export function HomeworkEditTab({ data, onEdit, onDelete }: {
  data: Homework[]; onEdit: (item: Homework) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi obaveze</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.title}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.subject} — {item.classGroup} — Rok: {formatDate(item.dueDate)}</p>
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

