'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Eye, FlaskConical, Clock, CalendarDays, Users, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface LabItem {
  id: string; name: string; room: string; type: 'physics' | 'chemistry' | 'biology' | 'computer' | 'electronics'; status: 'available' | 'in_use' | 'maintenance' | 'calibration';
  responsible: string; lastMaintenance: string; nextMaintenance: string; condition: 'excellent' | 'good' | 'fair' | 'poor';
  inventory: string[]; notes: string
}

const INITIAL: LabItem[] = [
  { id: '1', name: 'Mikroskop Zeiss Primo Star', room: 'B-005', type: 'biology', status: 'available', responsible: 'Dr. M. Ilić', lastMaintenance: '2024-06-01', nextMaintenance: '2024-09-01', condition: 'excellent', inventory: ['Objektivi 4x, 10x, 40x', 'Osvjetljenje LED', 'Digitalna kamera'], notes: '' },
  { id: '2', name: 'Multimetar Fluke 87V', room: 'B-102', type: 'electronics', status: 'in_use', responsible: 'M. Đorđević', lastMaintenance: '2024-05-15', nextMaintenance: '2024-08-15', condition: 'good', inventory: ['Kalibracioni sertifikat', 'Probes set', 'USB kabel'], notes: 'U upotrebi za vezbe DSP' },
  { id: '3', name: 'Spektrofotometar UV-Vis', room: 'B-006', type: 'chemistry', status: 'maintenance', responsible: 'Dr. J. Popović', lastMaintenance: '2024-03-20', nextMaintenance: '2024-06-20', condition: 'fair', inventory: ['Kuvete 1cm, 2cm', 'Reagensi'], notes: 'Potrebna zamjena lampe' },
  { id: '4', name: 'Osciloskop Tektronix TBS1052B', room: 'B-102', type: 'electronics', status: 'available', responsible: 'G. Jovanović', lastMaintenance: '2024-04-10', nextMaintenance: '2024-07-10', condition: 'good', inventory: ['2x Sonda 10:1', 'USB kabel', 'Manual'], notes: '' },
  { id: '5', name: 'Centrifuga Eppendorf 5424', room: 'B-006', type: 'biology', status: 'calibration', responsible: 'Dr. M. Ilić', lastMaintenance: '2024-05-01', nextMaintenance: '2024-06-15', condition: 'good', inventory: ['Rotor za 15ml epruvete', 'Rotor za 1.5ml'], notes: 'Kalibracija u toku' },
  { id: '6', name: 'Vibracioni sto', room: 'B-004', type: 'physics', status: 'available', responsible: 'Dr. S. Stanković', lastMaintenance: '2024-06-10', nextMaintenance: '2024-12-10', condition: 'excellent', inventory: ['Pojacivač', 'Generator signala', 'Accelerometar'], notes: '' },
]

const STATUSES: Record<string, { color: string; label: string }> = { available: { color: 'bg-emerald-100 text-emerald-800', label: 'Dostupan' }, in_use: { color: 'bg-sky-100 text-sky-800', label: 'U upotrebi' }, maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Održavanje' }, calibration: { color: 'bg-violet-100 text-violet-800', label: 'Kalibracija' } }
const TYPES: Record<string, { label: string }> = { physics: { label: 'Fizika' }, chemistry: { label: 'Hemija' }, biology: { label: 'Biologija' }, computer: { label: 'Računari' }, electronics: { label: 'Elektronika' } }
const CONDITIONS: Record<string, { color: string; label: string }> = { excellent: { color: 'bg-emerald-100 text-emerald-700', label: 'Odlično' }, good: { color: 'bg-sky-100 text-sky-700', label: 'Dobro' }, fair: { color: 'bg-amber-100 text-amber-700', label: 'Zadovoljavajuće' }, poor: { color: 'bg-red-100 text-red-700', label: 'Loše' } }
function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getConditionBadge(c: string) { const r = CONDITIONS[c]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{c}</Badge> }

export function Laboratorija() {
  const [data, setData] = useState<LabItem[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = useMemo(() => data.filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.room.toLowerCase().includes(search.toLowerCase())), [data, search])
  const stats = useMemo(() => ({ total: data.length, available: data.filter(d => d.status === 'available').length, inUse: data.filter(d => d.status === 'in_use').length, maint: data.filter(d => d.status !== 'available' && d.status !== 'in_use').length }), [data])
  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><FlaskConical className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Laboratorija</h1><p className="text-sm text-muted-foreground">Oprema i oprema laboratorija</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Dostupno</div><p className="text-xl font-bold text-emerald-700">{stats.available}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">U upotrebi</div><p className="text-xl font-bold text-sky-700">{stats.inUse}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">Održavanje</div><p className="text-xl font-bold text-amber-700">{stats.maint}</p></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Oprema</CardTitle><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, sala..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div></div></CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Sala</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Stanje</TableHead><TableHead className="text-xs hidden lg:table-cell">Odgovoran</TableHead><TableHead className="text-xs hidden lg:table-cell">Sledeći serv.</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema opreme</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{item.room}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{TYPES[item.type]?.label}</Badge></TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getConditionBadge(item.condition)}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.responsible}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.nextMaintenance)}</TableCell>
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
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Detalji opreme</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><p className="text-lg font-bold">{detailItem.name}</p><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getConditionBadge(detailItem.condition)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Sala</div><p className="text-xs">{detailItem.room}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Tip</div><p className="text-xs">{TYPES[detailItem.type]?.label}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Odgovoran</div><p className="text-xs">{detailItem.responsible}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Servis</div><p className="text-xs">Zadnji: {formatDate(detailItem.lastMaintenance)}</p><p className="text-[10px] text-muted-foreground">Sledeći: {formatDate(detailItem.nextMaintenance)}</p></div>
              </div>
              <div className="flex flex-wrap gap-1">{detailItem.inventory.map((i, idx) => <Badge key={idx} variant="outline" className="text-[10px]">{i}</Badge>)}</div>
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs">{detailItem.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
