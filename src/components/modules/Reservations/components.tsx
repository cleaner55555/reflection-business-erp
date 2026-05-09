'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Calendar, Clock, Users } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Reservation } from './types'
import { STATUSES, AREAS } from './data'

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function KpiCards({ data }: { data: Reservation[] }) {
  const todayReservations = data.filter(i => i.date === new Date().toISOString().split('T')[0] && i.status !== 'cancelled').length
  const totalGuests = data.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.partySize, 0)
  const totalDeposits = data.reduce((s, i) => s + i.deposit, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Danas</div><p className="text-2xl font-bold text-blue-700">{todayReservations}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Ukupno gostiju</div><p className="text-2xl font-bold text-amber-700">{totalGuests}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Depoziti</div><p className="text-xl font-bold text-emerald-700">{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(totalDeposits)}</p></Card>
    </div>
  )
}

export function TableSection({ filtered, search, statusFilter, dateFilter, onSearch, onStatusFilter, onDateFilter, onDetail, onEdit, onDelete }: {
  filtered: Reservation[]
  search: string
  statusFilter: string
  dateFilter: string
  onSearch: (v: string) => void
  onStatusFilter: (v: string) => void
  onDateFilter: (v: string) => void
  onDetail: (id: string) => void
  onEdit: (item: Reservation) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base font-semibold">Lista rezervacija</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => onSearch(e.target.value)} /></div>
            <Input type="date" className="h-8 w-36 text-xs" value={dateFilter} onChange={e => onDateFilter(e.target.value)} />
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="confirmed">Potvrđena</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="checked_in">Prijavljena</SelectItem><SelectItem value="completed">Završena</SelectItem><SelectItem value="cancelled">Otkazana</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Gost</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs hidden sm:table-cell">Vreme</TableHead><TableHead className="text-xs hidden md:table-cell">Osoba</TableHead><TableHead className="text-xs hidden md:table-cell">Sto</TableHead><TableHead className="text-xs hidden lg:table-cell">Povod</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema rezervacija</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">{item.guestName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(item.date)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">{item.time}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.partySize}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.tableNo || AREAS[item.area]?.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.occasion || '—'}</TableCell>
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

export function CreateTab({ form, onFormChange, onSave }: { form: Partial<Reservation>; onFormChange: (f: Partial<Reservation>) => void; onSave: () => void }) {
  return (
    <Card>
      <CardHeader><h3 className="text-base font-semibold">Nova rezervacija</h3></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Ime gosta *</Label><Input className="text-xs" value={form.guestName || ''} onChange={e => onFormChange({ ...form, guestName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => onFormChange({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Datum *</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => onFormChange({ ...form, date: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Vreme *</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => onFormChange({ ...form, time: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Broj osoba</Label><Input className="text-xs" type="number" value={form.partySize || ''} onChange={e => onFormChange({ ...form, partySize: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Zona</Label><Select value={form.area || 'indoor'} onValueChange={v => onFormChange({ ...form, area: v as Reservation['area'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Sto</Label><Input className="text-xs" value={form.tableNo || ''} onChange={e => onFormChange({ ...form, tableNo: e.target.value })} placeholder="T-XX" /></div>
            <div className="grid gap-2"><Label className="text-xs">Trajanje (min)</Label><Input className="text-xs" type="number" value={form.duration || ''} onChange={e => onFormChange({ ...form, duration: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Povod</Label><Input className="text-xs" value={form.occasion || ''} onChange={e => onFormChange({ ...form, occasion: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Izvor</Label><Select value={form.source || 'phone'} onValueChange={v => onFormChange({ ...form, source: v as Reservation['source'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="phone">Telefon</SelectItem><SelectItem value="website">Web sajt</SelectItem><SelectItem value="app">Aplikacija</SelectItem><SelectItem value="walk_in">Usmeno</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Depozit (RSD)</Label><Input className="text-xs" type="number" value={form.deposit || ''} onChange={e => onFormChange({ ...form, deposit: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Specijalni zahtevi</Label><Input className="text-xs" value={form.specialRequests || ''} onChange={e => onFormChange({ ...form, specialRequests: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj rezervaciju</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EditTab({ data, onEdit, onDelete }: { data: Reservation[]; onEdit: (item: Reservation) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><h3 className="text-base font-semibold">Uredi rezervacije</h3></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.guestName}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{formatDate(item.date)} {item.time} — {item.partySize} osoba — {item.tableNo || AREAS[item.area]?.label}</p>
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

export function DetailDialog({ detailItem, onClose }: { detailItem: Reservation | null; onClose: () => void }) {
  return (
    <Dialog open={!!detailItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader><DialogTitle>Detalji rezervacije</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.guestName}</h3>{getStatusBadge(detailItem.status)}</div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Br. rezervacije', detailItem.reservationNo],
                ['Telefon', detailItem.phone],
                ['Email', detailItem.email || '—'],
                ['Datum', formatDate(detailItem.date)],
                ['Vreme', detailItem.time],
                ['Trajanje', `${detailItem.duration} min`],
                ['Osoba', String(detailItem.partySize)],
                ['Sto', detailItem.tableNo || 'Nije dodeljen'],
                ['Zona', AREAS[detailItem.area]?.label],
                ['Povod', detailItem.occasion || '—'],
                ['Izvor', detailItem.source],
                ['Depozit', detailItem.deposit > 0 ? new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(detailItem.deposit) : 'Nema'],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            {detailItem.specialRequests && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Specijalni zahtevi</div><div className="text-xs">{detailItem.specialRequests}</div></div>}
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function EditDialog({ editItem, form, onFormChange, onSave, onClose }: { editItem: Reservation | null; form: Partial<Reservation>; onFormChange: (f: Partial<Reservation>) => void; onSave: () => void; onClose: (open: boolean) => void }) {
  return (
    <Dialog open={!!editItem || false} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi' : 'Nova rezervacija'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.guestName || ''} onChange={e => onFormChange({ ...form, guestName: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => onFormChange({ ...form, status: v as Reservation['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="confirmed">Potvrđena</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="checked_in">Prijavljena</SelectItem><SelectItem value="completed">Završena</SelectItem><SelectItem value="cancelled">Otkazana</SelectItem><SelectItem value="no_show">Nije došao</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => onFormChange({ ...form, date: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Vreme</Label><Input className="text-xs" type="time" value={form.time || ''} onChange={e => onFormChange({ ...form, time: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => onFormChange({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => onClose(false)}>Otkaži</Button><Button size="sm" onClick={onSave}>Sačuvaj</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
