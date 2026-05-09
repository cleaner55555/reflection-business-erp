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
import { Plus, Search, Trash2, Pencil, Eye, Pill, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Prescription } from './types'
import { STATUSES, TYPES, formatRSD } from './data'

/* ---- Badge helpers ---- */
export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
export function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

/* ---- KPI Cards ---- */
export function KpiCards({ data }: { data: Prescription[] }) {
  const activeCount = data.filter(i => i.status === 'active').length
  const totalCost = data.reduce((s, i) => s + i.totalCost, 0)
  const totalInsurance = data.reduce((s, i) => s + i.insuranceCoverage, 0)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Pill className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupna vrednost</div><p className="text-lg font-bold">{formatRSD(totalCost)}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Osigranje</div><p className="text-lg font-bold text-blue-700">{formatRSD(totalInsurance)}</p></Card>
    </div>
  )
}

/* ---- Table Section ---- */
export function TableSection({ filtered, search, statusFilter, onSearchChange, onStatusChange, onViewDetail, onEdit, onDelete }: {
  filtered: Prescription[]
  search: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onViewDetail: (id: string) => void
  onEdit: (item: Prescription) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista recepata</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusChange(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="completed">Realizovan</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="cancelled">Otkazan</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Br. recepta</TableHead><TableHead className="text-xs">Pacijent</TableHead><TableHead className="text-xs hidden sm:table-cell">Lekar</TableHead><TableHead className="text-xs hidden md:table-cell">Lekovi</TableHead><TableHead className="text-xs hidden lg:table-cell">Vrednost</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema recepata</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-mono">{item.prescriptionNo}</TableCell>
                  <TableCell className="text-xs font-medium">{item.patientName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.doctor}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell max-w-[180px] truncate">{item.medications.map(m => m.name).join(', ')}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{formatRSD(item.totalCost)}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetail(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
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

/* ---- Create Tab ---- */
export function CreateTab({ form, onFormChange, onSave }: { form: Partial<Prescription>; onFormChange: (f: Partial<Prescription>) => void; onSave: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novi recept</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => onFormChange({ ...form, patientName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Lekar *</Label><Input className="text-xs" value={form.doctor || ''} onChange={e => onFormChange({ ...form, doctor: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Dijagnoza</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => onFormChange({ ...form, diagnosis: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'reimbursable'} onValueChange={v => onFormChange({ ...form, type: v as Prescription['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reimbursable">Reemburzibilni</SelectItem><SelectItem value="private">Privatni</SelectItem><SelectItem value="narcotic">Narkotik</SelectItem><SelectItem value="special">Specijalni</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Vredi do</Label><Input className="text-xs" type="date" value={form.validUntil || ''} onChange={e => onFormChange({ ...form, validUntil: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Apoteka</Label><Input className="text-xs" value={form.pharmacy || ''} onChange={e => onFormChange({ ...form, pharmacy: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Lek (ime, doza, učestalost)</Label><Input className="text-xs" value={form.medications?.map(m => m.name).join(', ') || ''} onChange={e => onFormChange({ ...form, medications: e.target.value.split(',').map(s => ({ name: s.trim(), dosage: '', frequency: '', duration: '', quantity: '' })).filter(m => m.name) })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Ukupna vrednost (RSD)</Label><Input className="text-xs" type="number" value={form.totalCost || ''} onChange={e => onFormChange({ ...form, totalCost: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Učešće pacijenta (RSD)</Label><Input className="text-xs" type="number" value={form.patientShare || ''} onChange={e => onFormChange({ ...form, patientShare: Number(e.target.value), insuranceCoverage: (form.totalCost || 0) - Number(e.target.value) })} /></div>
          </div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj recept</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---- Edit Tab ---- */
export function EditTab({ data, onEdit, onDelete }: { data: Prescription[]; onEdit: (item: Prescription) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi recepte</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.prescriptionNo}</span><span className="text-xs font-medium">{item.patientName}</span>{getTypeBadge(item.type)}{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.medications.map(m => m.name).join(', ')} — {formatRSD(item.totalCost)}</p>
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

/* ---- Detail Dialog ---- */
export function DetailDialog({ detailItem, open, onClose }: { detailItem: Prescription | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>Recept — {detailItem?.prescriptionNo}</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.patientName}</h3>{getTypeBadge(detailItem.type)}{getStatusBadge(detailItem.status)}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Lekar', detailItem.doctor],
                ['Datum', formatDate(detailItem.date)],
                ['Dijagnoza', detailItem.diagnosis],
                ['Vredi do', formatDate(detailItem.validUntil)],
                ['Apoteka', detailItem.pharmacy || '—'],
                ['Ukupna vrednost', formatRSD(detailItem.totalCost)],
                ['Učešće pacijenta', formatRSD(detailItem.patientShare)],
                ['Pokriće osiguranja', formatRSD(detailItem.insuranceCoverage)],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            <div className="p-2 rounded-lg bg-blue-50"><div className="text-xs text-blue-600 mb-2">Propisani lekovi</div>
              {detailItem.medications.map((m, i) => (
                <div key={i} className="text-xs mb-1"><span className="font-medium">{m.name}</span> — {m.dosage} — {m.frequency} — {m.duration} ({m.quantity})</div>
              ))}
            </div>
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---- Edit Dialog ---- */
export function EditDialog({ form, editItem, open, onClose, onFormChange, onSave }: { form: Partial<Prescription>; editItem: Prescription | null; open: boolean; onClose: () => void; onFormChange: (f: Partial<Prescription>) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi recept' : 'Novi recept'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => onFormChange({ ...form, patientName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => onFormChange({ ...form, status: v as Prescription['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="completed">Realizovan</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="cancelled">Otkazan</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'reimbursable'} onValueChange={v => onFormChange({ ...form, type: v as Prescription['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reimbursable">Reemburzibilni</SelectItem><SelectItem value="private">Privatni</SelectItem><SelectItem value="narcotic">Narkotik</SelectItem><SelectItem value="special">Specijalni</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Vrednost</Label><Input className="text-xs" type="number" value={form.totalCost || ''} onChange={e => onFormChange({ ...form, totalCost: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
