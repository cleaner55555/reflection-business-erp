'use client'
import { useState, useEffect, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, Warehouse, Truck, Clock, Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, CheckCircle2, Timer, ClipboardList, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

import type { DockAppointment } from './types'

export const INITIAL_DATA: DockAppointment[] = [
  { id: '1', dockNumber: 'R-01', dockType: 'unloading', vehiclePlate: 'BG-123-AB', driverName: 'Marko Petrović', companyName: 'Distributerija d.o.o.', appointmentDate: '2024-06-15', scheduledTime: '06:00', actualStart: '06:15', actualEnd: '07:45', status: 'completed', cargoType: 'Elektronika', cargoWeight: 5200, cargoUnit: 'kg', palletCount: 24, priority: 'normal', notes: '', doorAssignment: 'Vrata 1', handlingInstructions: 'Pažljivo, lomljivo' },
  { id: '2', dockNumber: 'R-02', dockType: 'loading', vehiclePlate: 'NS-456-CD', driverName: 'Jovan Stanković', companyName: 'EksportLog', appointmentDate: '2024-06-15', scheduledTime: '08:00', actualStart: '08:00', actualEnd: null, status: 'in_progress', cargoType: 'Tekstil', cargoWeight: 3800, cargoUnit: 'kg', palletCount: 18, priority: 'normal', notes: '', doorAssignment: 'Vrata 2', handlingInstructions: 'Standardno' },
  { id: '3', dockNumber: 'R-03', dockType: 'unloading', vehiclePlate: 'BG-789-EF', driverName: 'Slobodan Nikolić', companyName: 'FreshFoods', appointmentDate: '2024-06-15', scheduledTime: '09:30', actualStart: null, actualEnd: null, status: 'checked_in', cargoType: 'Hrana', cargoWeight: 8500, cargoUnit: 'kg', palletCount: 42, priority: 'urgent', notes: 'Hlađeni teret - -18°C', doorAssignment: 'Vrata 3 (hlađeno)', handlingInstructions: 'Lanac hladnjače obavezan' },
  { id: '4', dockNumber: 'R-04', dockType: 'both', vehiclePlate: 'KG-321-GH', driverName: 'Dragan Milić', companyName: 'AutoParts RS', appointmentDate: '2024-06-15', scheduledTime: '11:00', actualStart: null, actualEnd: null, status: 'scheduled', cargoType: 'Auto delovi', cargoWeight: 6200, cargoUnit: 'kg', palletCount: 30, priority: 'normal', notes: '', doorAssignment: 'Vrata 4', handlingInstructions: 'Utovar i istovar - prvo istovar povratne robe' },
  { id: '5', dockNumber: 'R-01', dockType: 'loading', vehiclePlate: 'SUB-654-IJ', driverName: 'Predrag Tomić', companyName: 'PharmaExpress', appointmentDate: '2024-06-15', scheduledTime: '13:00', actualStart: null, actualEnd: null, status: 'scheduled', cargoType: 'Lekovi', cargoWeight: 1200, cargoUnit: 'kg', palletCount: 8, priority: 'urgent', notes: 'Temperaturno kontrolisano', doorAssignment: 'Vrata 1 ( nakon čišćenja)', handlingInstructions: 'Temperatura 2-8°C' },
  { id: '6', dockNumber: 'R-02', dockType: 'unloading', vehiclePlate: 'NI-987-KL', driverName: 'Nebojša Jovanović', companyName: 'BuildMat', appointmentDate: '2024-06-15', scheduledTime: '10:00', actualStart: null, actualEnd: null, status: 'no_show', cargoType: 'Građevinski materijal', cargoWeight: 15000, cargoUnit: 'kg', palletCount: 60, priority: 'low', notes: 'Vozač nije došao', doorAssignment: 'Vrata 2', handlingInstructions: 'Teška roba - potrebna viljuškar' },
  { id: '7', dockNumber: 'R-03', dockType: 'unloading', vehiclePlate: 'CZ-147-MN', driverName: 'Goran Đorđević', companyName: 'AgroSupply', appointmentDate: '2024-06-16', scheduledTime: '07:00', actualStart: null, actualEnd: null, status: 'scheduled', cargoType: 'Poljoprivredna oprema', cargoWeight: 9800, cargoUnit: 'kg', palletCount: 35, priority: 'normal', notes: '', doorAssignment: 'Vrata 3', handlingInstructions: 'Velike palete - širina 120cm' },
  { id: '8', dockNumber: 'R-04', dockType: 'loading', vehiclePlate: 'BG-258-OP', driverName: 'Milan Stojanović', companyName: 'RetailChain', appointmentDate: '2024-06-16', scheduledTime: '09:00', actualStart: null, actualEnd: null, status: 'scheduled', cargoType: 'Mješovita roba', cargoWeight: 7200, cargoUnit: 'kg', palletCount: 36, priority: 'normal', notes: '', doorAssignment: 'Vrata 4', handlingInstructions: 'Razvrstavanje po zonama' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Zakazano' }, checked_in: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Prijavljen' }, in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U toku' }, completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Završeno' }, no_show: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Nije došao' }, cancelled: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'Otkazano' },
}

export const PRIORITIES: Record<string, { color: string; label: string }> = {
  urgent: { color: 'bg-red-100 text-red-700', label: 'Hitno' }, normal: { color: 'bg-blue-100 text-blue-700', label: 'Normalan' }, low: { color: 'bg-slate-100 text-slate-600', label: 'Nizak' },
}

export const DOCK_TYPES: Record<string, { label: string; icon: typeof ArrowDownToLine }> = {
  loading: { label: 'Utovar', icon: ArrowUpFromLine }, unloading: { label: 'Istovar', icon: ArrowDownToLine }, both: { label: 'Utovar/Istovar', icon: ClipboardList },
}

export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
export function getPriorityBadge(p: string) { const r = PRIORITIES[p]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{p}</Badge> }

export function ScheduleTab({ filtered, search, statusFilter, dockFilter, dockList, onSearch, onStatusFilter, onDockFilter, onView, onEdit, onDelete }: {
  filtered: DockAppointment[]; search: string; statusFilter: string; dockFilter: string; dockList: { number: string; current: DockAppointment | null; next: DockAppointment | null; total: number; completed: number }[]
  onSearch: (v: string) => void; onStatusFilter: (v: string) => void; onDockFilter: (v: string) => void
  onView: (id: string) => void; onEdit: (item: DockAppointment) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Termini</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Reg. broj, vozač..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => onSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => onStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={dockFilter || 'all'} onValueChange={v => onDockFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem>{dockList.map(d => <SelectItem key={d.number} value={d.number}>{d.number}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">Rampa</TableHead><TableHead className="text-xs">Vreme</TableHead><TableHead className="text-xs">Vozilo</TableHead><TableHead className="text-xs hidden sm:table-cell">Firma</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Roba</TableHead><TableHead className="text-xs hidden lg:table-cell">Prioritet</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
          </TableRow></TableHeader><TableBody>
            {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema termina</TableCell></TableRow> : filtered.map(item => (
              <TableRow key={item.id}><TableCell className="text-xs font-mono font-bold">{item.dockNumber}</TableCell><TableCell><div className="text-xs font-medium">{item.scheduledTime}</div><div className="text-[10px] text-muted-foreground">{formatDate(item.appointmentDate)}</div></TableCell><TableCell><div className="text-xs font-medium">{item.vehiclePlate}</div><div className="text-[10px] text-muted-foreground">{item.driverName}</div></TableCell><TableCell className="text-xs hidden sm:table-cell">{item.companyName}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{DOCK_TYPES[item.dockType]?.label}</Badge></TableCell><TableCell>{getStatusBadge(item.status)}</TableCell><TableCell className="text-xs hidden md:table-cell">{item.cargoType}</TableCell><TableCell className="hidden lg:table-cell">{getPriorityBadge(item.priority)}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function DocksTab({ dockList }: { dockList: { number: string; current: DockAppointment | null; next: DockAppointment | null; total: number; completed: number }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dockList.map(dock => (
        <Card key={dock.number} className={`border-l-4 ${dock.current ? 'border-l-blue-500' : dock.next ? 'border-l-sky-400' : 'border-l-slate-300'}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Warehouse className="h-4 w-4" />Rampa {dock.number}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Termini danas</span><span className="font-medium">{dock.total}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Završeno</span><span className="font-medium text-emerald-700">{dock.completed}</span></div>
            {dock.current && (<div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-1"><div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /><span className="text-[10px] font-medium text-blue-700">AKTIVNO</span></div><p className="text-xs font-medium">{dock.current.vehiclePlate}</p><p className="text-[10px] text-muted-foreground">{dock.current.companyName} · {dock.current.cargoType}</p><p className="text-[10px] text-muted-foreground">{dock.current.scheduledTime} - {dock.current.actualStart || '?'}</p></div>)}
            {!dock.current && dock.next && (<div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20 space-y-1"><p className="text-[10px] font-medium text-sky-700">SLEDEĆI</p><p className="text-xs font-medium">{dock.next.vehiclePlate}</p><p className="text-[10px] text-muted-foreground">{dock.next.companyName} · {dock.next.scheduledTime}</p></div>)}
            {!dock.current && !dock.next && (<div className="p-2 rounded-lg bg-muted/50 text-center"><p className="text-[10px] text-muted-foreground">Slobodna rampa</p></div>)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function OverviewTab({ data }: { data: DockAppointment[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-amber-600" />Roba po tipu</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {(() => { const typeMap: Record<string, { count: number; weight: number; pallets: number }> = {}; data.filter(d => d.appointmentDate === '2024-06-15').forEach(d => { if (!typeMap[d.cargoType]) typeMap[d.cargoType] = { count: 0, weight: 0, pallets: 0 }; typeMap[d.cargoType].count++; typeMap[d.cargoType].weight += d.cargoWeight; typeMap[d.cargoType].pallets += d.palletCount }); return Object.entries(typeMap).sort((a, b) => b[1].weight - a[1].weight).map(([type, info]) => (
            <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{type}</p><p className="text-[10px] text-muted-foreground">{info.count} termin · {info.pallets} pal.</p></div><p className="text-xs font-bold">{(info.weight / 1000).toFixed(1)}t</p></div>
          )) })()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" />Firme</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {(() => { const firmMap: Record<string, number> = {}; data.filter(d => d.appointmentDate === '2024-06-15').forEach(d => { firmMap[d.companyName] = (firmMap[d.companyName] || 0) + 1 }); return Object.entries(firmMap).sort((a, b) => b[1] - a[1]).map(([firm, count]) => (
            <div key={firm} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><p className="text-xs font-medium">{firm}</p><Badge className="text-[10px] bg-slate-100">{count} termin</Badge></div>
          )) })()}
        </CardContent>
      </Card>
    </div>
  )
}

export function DetailDialog({ detailItem, onClose, onStatusChange }: { detailItem: DockAppointment | null; onClose: () => void; onStatusChange: (id: string, s: DockAppointment['status']) => void }) {
  if (!detailItem) return null
  return (
    <Dialog open={!!detailItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>Detalji termina</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-lg font-bold">Rampa {detailItem.dockNumber}</p><p className="text-xs text-muted-foreground">{formatDate(detailItem.appointmentDate)} · {detailItem.scheduledTime}</p></div><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getPriorityBadge(detailItem.priority)}</div></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vozilo</div><p className="text-xs font-bold">{detailItem.vehiclePlate}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vozač</div><p className="text-xs font-medium">{detailItem.driverName}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Firma</div><p className="text-xs font-medium">{detailItem.companyName}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Tip</div><p className="text-xs">{DOCK_TYPES[detailItem.dockType]?.label}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Roba</div><p className="text-xs font-medium">{detailItem.cargoType}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Težina</div><p className="text-xs font-medium">{detailItem.cargoWeight} {detailItem.cargoUnit}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Palete</div><p className="text-xs font-medium">{detailItem.palletCount}</p></div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vrata</div><p className="text-xs font-medium">{detailItem.doorAssignment}</p><div className="text-[10px] text-muted-foreground mt-1">Instrukcije: {detailItem.handlingInstructions}</div></div>
          {detailItem.actualStart && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-xs text-blue-700">Početak: {detailItem.actualStart} {detailItem.actualEnd ? `· Kraj: ${detailItem.actualEnd}` : ''}</p></div>}
          {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
          <div className="flex gap-2"><Select value={detailItem.status} onValueChange={v => onStatusChange(detailItem.id, v as DockAppointment['status'])}><SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FormDialog({ open, editItem, formData, onOpenChange, onFieldChange, onSave, onEditItemChange }: {
  open: boolean; editItem: DockAppointment | null; formData: Record<string, unknown>
  onOpenChange: (open: boolean) => void; onFieldChange: (f: string, v: unknown) => void; onSave: () => void; onEditItemChange: (item: DockAppointment | null) => void
}) {
  return (
    <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) onEditItemChange(null) }}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editItem ? 'Uredi termin' : 'Novi termin'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Rampa</Label><Input placeholder="R-01" className="text-xs" value={formData.dockNumber as string} onChange={e => onFieldChange('dockNumber', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.dockType as string} onValueChange={v => onFieldChange('dockType', v)}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(DOCK_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Reg. broj *</Label><Input placeholder="BG-123-AB" className="text-xs" value={formData.vehiclePlate as string} onChange={e => onFieldChange('vehiclePlate', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Vozač *</Label><Input placeholder="Ime vozača" className="text-xs" value={formData.driverName as string} onChange={e => onFieldChange('driverName', e.target.value)} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Firma *</Label><Input placeholder="Naziv firme" className="text-xs" value={formData.companyName as string} onChange={e => onFieldChange('companyName', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input type="date" className="text-xs" value={formData.appointmentDate as string} onChange={e => onFieldChange('appointmentDate', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Vreme *</Label><Input type="time" className="text-xs" value={formData.scheduledTime as string} onChange={e => onFieldChange('scheduledTime', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Roba</Label><Input placeholder="Tip robe" className="text-xs" value={formData.cargoType as string} onChange={e => onFieldChange('cargoType', e.target.value)} /></div>
            <div className="grid gap-2"><Label className="text-xs">Težina (kg)</Label><Input type="number" className="text-xs" value={formData.cargoWeight as number || ''} onChange={e => onFieldChange('cargoWeight', Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label className="text-xs">Palete</Label><Input type="number" className="text-xs" value={formData.palletCount as number || ''} onChange={e => onFieldChange('palletCount', Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Prioritet</Label><Select value={formData.priority as string} onValueChange={v => onFieldChange('priority', v)}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Vrata</Label><Input placeholder="Vrata 1" className="text-xs" value={formData.doorAssignment as string} onChange={e => onFieldChange('doorAssignment', e.target.value)} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Instrukcije</Label><Textarea placeholder="Uputstva za rukovanje..." className="text-xs" value={formData.handlingInstructions as string} onChange={e => onFieldChange('handlingInstructions', e.target.value)} /></div>
          <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Dodatne beleške..." className="text-xs" value={formData.notes as string} onChange={e => onFieldChange('notes', e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => { onOpenChange(false); onEditItemChange(null) }}>Otkaži</Button><Button onClick={onSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
