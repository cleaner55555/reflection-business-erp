'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Users, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES, INSURANCE } from './data'
import type { Patient } from './types'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function getInsuranceBadge(s: string) {
  const r = INSURANCE[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function PatientKpiCards({ data }: { data: Patient[] }) {
  const activeCount = data.filter(i => i.status === 'active').length
  const treatmentCount = data.filter(i => i.status === 'in_treatment').length
  const criticalCount = data.filter(i => i.status === 'critical').length
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Na lečenju</div><p className="text-2xl font-bold text-blue-700">{treatmentCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kritičnih</div><p className="text-2xl font-bold text-red-700">{criticalCount}</p></Card>
    </div>
  )
}

export function PatientTable({ filtered, search, statusFilter, setSearch, setStatusFilter, onView, onEdit, onDelete }: {
  filtered: Patient[]
  search: string
  statusFilter: string
  setSearch: (v: string) => void
  setStatusFilter: (v: string) => void
  onView: (item: Patient) => void
  onEdit: (item: Patient) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Registar pacijenata</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="in_treatment">Na lečenju</SelectItem><SelectItem value="critical">Kritičan</SelectItem><SelectItem value="discharged">Otpušten</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Ime</TableHead><TableHead className="text-xs hidden sm:table-cell">JMBG</TableHead><TableHead className="text-xs hidden md:table-cell">God</TableHead><TableHead className="text-xs hidden md:table-cell">Kr. grupa</TableHead><TableHead className="text-xs hidden lg:table-cell">Lekar</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Osigranje</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema pacijenata</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">{item.firstName} {item.lastName}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.jmbg}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.age}</TableCell>
                  <TableCell className="text-xs font-semibold hidden md:table-cell">{item.bloodType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.primaryDoctor}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getInsuranceBadge(item.insuranceStatus)}</TableCell>
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

export function PatientCreateTab({ form, setForm, onSave }: { form: Partial<Patient>; setForm: (v: Partial<Patient>) => void; onSave: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novi pacijent</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Prezime *</Label><Input className="text-xs" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">JMBG</Label><Input className="text-xs" value={form.jmbg || ''} onChange={e => setForm({ ...form, jmbg: e.target.value })} maxLength={13} /></div>
            <div className="grid gap-2"><Label className="text-xs">Datum rođenja</Label><Input className="text-xs" type="date" value={form.dateOfBirth || ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Pol</Label><Select value={form.gender || 'male'} onValueChange={v => setForm({ ...form, gender: v as Patient['gender'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Muški</SelectItem><SelectItem value="female">Ženski</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Krvna grupa</Label><Select value={form.bloodType || ''} onValueChange={v => setForm({ ...form, bloodType: v })}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Email</Label><Input className="text-xs" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Grad</Label><Input className="text-xs" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input className="text-xs" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Lekar opšte prakse</Label><Input className="text-xs" value={form.primaryDoctor || ''} onChange={e => setForm({ ...form, primaryDoctor: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Br. osiguranja</Label><Input className="text-xs" value={form.insuranceNo || ''} onChange={e => setForm({ ...form, insuranceNo: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Alergije (zarez)</Label><Input className="text-xs" value={(form.allergies || []).join(', ')} onChange={e => setForm({ ...form, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Penicilin, Aspirin..." /></div>
          <div className="grid gap-2"><Label className="text-xs">Hronične bolesti (zarez)</Label><Input className="text-xs" value={(form.chronicConditions || []).join(', ')} onChange={e => setForm({ ...form, chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj pacijenta</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PatientEditTab({ data, onEdit, onDelete }: { data: Patient[]; onEdit: (item: Patient) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi pacijente</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.firstName} {item.lastName}</span><span className="text-xs text-muted-foreground">{item.patientNo}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.city} — {item.primaryDoctor} — Poslednji: {item.lastVisit ? formatDate(item.lastVisit) : '—'}</p>
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

export function PatientDetailDialog({ detailItem, open, onClose }: { detailItem: Patient | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader><DialogTitle>Karton pacijenta</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.firstName} {detailItem.lastName}</h3>{getStatusBadge(detailItem.status)}{getInsuranceBadge(detailItem.insuranceStatus)}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Broj pacijenta', detailItem.patientNo],
                ['JMBG', detailItem.jmbg],
                ['Datum rođenja', formatDate(detailItem.dateOfBirth)],
                ['Starost', `${detailItem.age} god.`],
                ['Pol', detailItem.gender === 'male' ? 'Muški' : 'Ženski'],
                ['Krvna grupa', detailItem.bloodType],
                ['Grad', detailItem.city],
                ['Adresa', detailItem.address],
                ['Telefon', detailItem.phone],
                ['Email', detailItem.email || '—'],
                ['Lekar', detailItem.primaryDoctor],
                ['Br. osiguranja', detailItem.insuranceNo],
                ['Poslednja poseta', detailItem.lastVisit ? formatDate(detailItem.lastVisit) : '—'],
                ['Sledeći termin', detailItem.nextAppointment ? formatDate(detailItem.nextAppointment) : '—'],
                ['Ukupno poseta', String(detailItem.totalVisits)],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            {detailItem.allergies.length > 0 && <div className="p-2 rounded-lg bg-red-50"><div className="text-xs text-red-600 mb-1">⚠ Alergije</div><div className="flex flex-wrap gap-1">{detailItem.allergies.map(a => <Badge key={a} className="text-xs bg-red-100 text-red-700">{a}</Badge>)}</div></div>}
            {detailItem.chronicConditions.length > 0 && <div className="p-2 rounded-lg bg-amber-50"><div className="text-xs text-amber-600 mb-1">Hronične bolesti</div><div className="flex flex-wrap gap-1">{detailItem.chronicConditions.map(c => <Badge key={c} className="text-xs bg-amber-100 text-amber-700">{c}</Badge>)}</div></div>}
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function PatientEditDialog({ open, onClose, editItem, form, setForm, onSave }: {
  open: boolean
  onClose: () => void
  editItem: Patient | null
  form: Partial<Patient>
  setForm: (v: Partial<Patient>) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi pacijenta' : 'Novi pacijent'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Prezime *</Label><Input className="text-xs" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v as Patient['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="in_treatment">Na lečenju</SelectItem><SelectItem value="critical">Kritičan</SelectItem><SelectItem value="discharged">Otpušten</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Osigranje</Label><Select value={form.insuranceStatus || 'pending'} onValueChange={v => setForm({ ...form, insuranceStatus: v as Patient['insuranceStatus'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivno</SelectItem><SelectItem value="expired">Isteklo</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={onClose}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
