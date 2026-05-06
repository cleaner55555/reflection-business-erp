'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES, LEVELS } from './data'
import type { Enrollment } from './types'

/* ── helpers ── */

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

/* ── KPI cards ── */

export function EnrollmentKpiCards({ data }: { data: Enrollment[] }) {
  const pendingCount = data.filter(i => i.status === 'pending').length
  const acceptedCount = data.filter(i => i.status === 'accepted' || i.status === 'enrolled').length
  const rejectedCount = data.filter(i => i.status === 'rejected').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UserPlus className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Na čekanju</div><p className="text-2xl font-bold text-amber-700">{pendingCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Prihvaćeni</div><p className="text-2xl font-bold text-emerald-700">{acceptedCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Odbijeni</div><p className="text-2xl font-bold text-red-700">{rejectedCount}</p></Card>
    </div>
  )
}

/* ── Table ── */

export function EnrollmentTable({
  filtered,
  search,
  statusFilter,
  levelFilter,
  setSearch,
  setStatusFilter,
  setLevelFilter,
  onDetail,
  onEdit,
  onDelete,
}: {
  filtered: Enrollment[]
  search: string
  statusFilter: string
  levelFilter: string
  setSearch: (v: string) => void
  setStatusFilter: (v: string) => void
  setLevelFilter: (v: string) => void
  onDetail: (id: string) => void
  onEdit: (item: Enrollment) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista prijava</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="documents_submitted">Dokumenta</SelectItem><SelectItem value="under_review">U proceduri</SelectItem><SelectItem value="accepted">Prihvaćen</SelectItem><SelectItem value="rejected">Odbijen</SelectItem><SelectItem value="enrolled">Upisan</SelectItem></SelectContent></Select>
            <Select value={levelFilter || 'all'} onValueChange={v => setLevelFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="bachelor">Osnovne</SelectItem><SelectItem value="master">Master</SelectItem><SelectItem value="phd">Doktorske</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Kandidat</TableHead><TableHead className="text-xs hidden sm:table-cell">Program</TableHead><TableHead className="text-xs hidden md:table-cell">Nivo</TableHead><TableHead className="text-xs hidden md:table-cell">Prosek</TableHead><TableHead className="text-xs hidden lg:table-cell">Grad</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema prijava</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">{item.applicantName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.program}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{LEVELS[item.studyLevel]?.label}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.highSchoolGPA > 0 ? item.highSchoolGPA : '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.city}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDetail(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
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

/* ── Create tab ── */

export function EnrollmentCreateTab({
  form,
  setForm,
  onSubmit,
}: {
  form: Partial<Enrollment>
  setForm: (f: Partial<Enrollment>) => void
  onSubmit: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Nova prijava</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Ime i prezime *</Label><Input className="text-xs" value={form.applicantName || ''} onChange={e => setForm({ ...form, applicantName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">JMBG</Label><Input className="text-xs" value={form.jmbg || ''} onChange={e => setForm({ ...form, jmbg: e.target.value })} maxLength={13} /></div>
            <div className="grid gap-2"><Label className="text-xs">Email</Label><Input className="text-xs" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Program *</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Nivo studija</Label><Select value={form.studyLevel || 'bachelor'} onValueChange={v => setForm({ ...form, studyLevel: v as Enrollment['studyLevel'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bachelor">Osnovne studije</SelectItem><SelectItem value="master">Master</SelectItem><SelectItem value="phd">Doktorske</SelectItem><SelectItem value="specialist">Specijalističke</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Grad</Label><Input className="text-xs" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Prethodna škola</Label><Input className="text-xs" value={form.previousSchool || ''} onChange={e => setForm({ ...form, previousSchool: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Prosek ocena</Label><Input className="text-xs" type="number" step="0.01" value={form.highSchoolGPA || ''} onChange={e => setForm({ ...form, highSchoolGPA: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Rezultat prijemnog</Label><Input className="text-xs" type="number" value={form.entranceExamScore || ''} onChange={e => setForm({ ...form, entranceExamScore: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSubmit}><Plus className="h-4 w-4" />Kreiraj prijavu</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Edit tab ── */

export function EnrollmentEditTab({
  data,
  onEdit,
  onDelete,
}: {
  data: Enrollment[]
  onEdit: (item: Enrollment) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi prijave</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.applicantName}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.program} — {LEVELS[item.studyLevel]?.label} — {item.city}</p>
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

/* ── Detail dialog ── */

export function EnrollmentDetailDialog({
  detailId,
  onClose,
  data,
}: {
  detailId: string | null
  onClose: () => void
  data: Enrollment[]
}) {
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <Dialog open={!!detailId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader><DialogTitle>Detalji prijave</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.applicantName}</h3>{getStatusBadge(detailItem.status)}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['JMBG', detailItem.jmbg],
                ['Email', detailItem.email],
                ['Telefon', detailItem.phone],
                ['Program', detailItem.program],
                ['Nivo', LEVELS[detailItem.studyLevel]?.label],
                ['Prethodna škola', detailItem.previousSchool],
                ['Grad', detailItem.city],
                ['Prosek ocena', detailItem.highSchoolGPA > 0 ? String(detailItem.highSchoolGPA) : '—'],
                ['Prijemni ispit', detailItem.entranceExamScore > 0 ? String(detailItem.entranceExamScore) : 'Nije polagan'],
                ['Datum prijave', formatDate(detailItem.applicationDate)],
                ['Intervju', detailItem.interviewDate ? formatDate(detailItem.interviewDate) : 'Nije zakazan'],
                ['Dokumenta kompletna', detailItem.documentsComplete ? 'Da' : 'Ne'],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ── Edit dialog ── */

export function EnrollmentEditDialog({
  open,
  onClose,
  editItem,
  form,
  setForm,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editItem: Enrollment | null
  form: Partial<Enrollment>
  setForm: (f: Partial<Enrollment>) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi prijavu' : 'Nova prijava'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.applicantName || ''} onChange={e => setForm({ ...form, applicantName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v as Enrollment['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="documents_submitted">Dokumenta</SelectItem><SelectItem value="under_review">U proceduri</SelectItem><SelectItem value="accepted">Prihvaćen</SelectItem><SelectItem value="rejected">Odbijen</SelectItem><SelectItem value="enrolled">Upisan</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Program</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Prosek</Label><Input className="text-xs" type="number" step="0.01" value={form.highSchoolGPA || ''} onChange={e => setForm({ ...form, highSchoolGPA: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
