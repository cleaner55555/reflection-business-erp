'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Eye, Pencil, Trash2, Plus, FileText } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { TYPES } from './data'
import type { MedicalRecord } from './types'

export function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function KpiCards({ data }: { data: MedicalRecord[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Pregledi</div><p className="text-2xl font-bold text-emerald-700">{data.filter(i => i.type === 'checkup').length}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Kontrole</div><p className="text-2xl font-bold text-blue-700">{data.filter(i => i.type === 'follow_up').length}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Hitni</div><p className="text-2xl font-bold text-red-700">{data.filter(i => i.type === 'emergency').length}</p></Card>
    </div>
  )
}

export function TableSection({
  filtered, search, typeFilter,
  onSearchChange, onTypeFilterChange,
  onView, onEdit, onDelete
}: {
  filtered: MedicalRecord[]
  search: string
  typeFilter: string
  onSearchChange: (v: string) => void
  onTypeFilterChange: (v: string) => void
  onView: (item: MedicalRecord) => void
  onEdit: (item: MedicalRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista zapisa</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={typeFilter || 'all'} onValueChange={v => onTypeFilterChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab.</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Br. kartona</TableHead><TableHead className="text-xs">Pacijent</TableHead><TableHead className="text-xs hidden sm:table-cell">Lekar</TableHead><TableHead className="text-xs hidden md:table-cell">Dijagnoza</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-mono">{item.recordNo}</TableCell>
                  <TableCell className="text-xs font-medium">{item.patientName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.doctor}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell max-w-[180px] truncate">{item.diagnosis} <span className="text-muted-foreground">({item.diagnosisCode})</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.date)}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
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

export function CreateTab({
  form, onFormChange, onSave
}: {
  form: Partial<MedicalRecord>
  onFormChange: (form: Partial<MedicalRecord>) => void
  onSave: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novi medicinski zapis</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => onFormChange({ ...form, patientName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Lekar *</Label><Input className="text-xs" value={form.doctor || ''} onChange={e => onFormChange({ ...form, doctor: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Dijagnoza *</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => onFormChange({ ...form, diagnosis: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Šifra dijagnoze (ICD-10)</Label><Input className="text-xs" value={form.diagnosisCode || ''} onChange={e => onFormChange({ ...form, diagnosisCode: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'checkup'} onValueChange={v => onFormChange({ ...form, type: v as MedicalRecord['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab. rezultat</SelectItem><SelectItem value="surgery">Operacija</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => onFormChange({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Simptomi</Label><Input className="text-xs" value={form.symptoms || ''} onChange={e => onFormChange({ ...form, symptoms: e.target.value })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Tretman</Label><Input className="text-xs" value={form.treatment || ''} onChange={e => onFormChange({ ...form, treatment: e.target.value })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Recepti (zarez)</Label><Input className="text-xs" value={(form.prescribedMeds || []).join(', ')} onChange={e => onFormChange({ ...form, prescribedMeds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Vitalni znaci</Label><Input className="text-xs" value={form.vitalSigns || ''} onChange={e => onFormChange({ ...form, vitalSigns: e.target.value })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Lab. rezultati</Label><Input className="text-xs" value={form.labResults || ''} onChange={e => onFormChange({ ...form, labResults: e.target.value })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Sledeći korak</Label><Input className="text-xs" value={form.nextAction || ''} onChange={e => onFormChange({ ...form, nextAction: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj zapis</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EditTab({
  data, onEdit, onDelete
}: {
  data: MedicalRecord[]
  onEdit: (item: MedicalRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi zapise</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.recordNo}</span><span className="text-xs font-medium">{item.patientName}</span>{getTypeBadge(item.type)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.diagnosis} — {item.doctor}</p>
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

export function DetailDialog({ detailItem, open, onClose }: { detailItem: MedicalRecord | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>Medicinski karton — {detailItem?.recordNo}</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.patientName}</h3>{getTypeBadge(detailItem.type)}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Lekar', detailItem.doctor],
                ['Datum', formatDate(detailItem.date)],
                ['Dijagnoza', detailItem.diagnosis],
                ['Šifra (ICD-10)', detailItem.diagnosisCode],
                ['Simptomi', detailItem.symptoms],
                ['Tretman', detailItem.treatment],
                ['Vitalni znaci', detailItem.vitalSigns],
                ['Lab. rezultati', detailItem.labResults],
                ['Sledeći korak', detailItem.nextAction],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val || '—'}</div></div>
              ))}
            </div>
            {detailItem.prescribedMeds.length > 0 && <div className="p-2 rounded-lg bg-blue-50"><div className="text-[10px] text-blue-600 mb-1">Propisani lekovi</div><div className="flex flex-wrap gap-1">{detailItem.prescribedMeds.map(m => <Badge key={m} className="text-[10px] bg-blue-100 text-blue-700">{m}</Badge>)}</div></div>}
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function EditDialog({
  editItem, form, open, onClose,
  onFormChange, onSave
}: {
  editItem: MedicalRecord | null
  form: Partial<MedicalRecord>
  open: boolean
  onClose: () => void
  onFormChange: (form: Partial<MedicalRecord>) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi zapis' : 'Novi zapis'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => onFormChange({ ...form, patientName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'checkup'} onValueChange={v => onFormChange({ ...form, type: v as MedicalRecord['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab.</SelectItem><SelectItem value="surgery">Operacija</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Dijagnoza *</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => onFormChange({ ...form, diagnosis: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => onFormChange({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
