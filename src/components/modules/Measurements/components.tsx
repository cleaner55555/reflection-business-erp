'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Ruler, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Measurement } from './types'
import { STATUSES, UNITS, PARAMETERS } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

/* ─── KPI Cards ─── */
export function MeasurementKpiCards({ data }: { data: Measurement[] }) {
  const okCount = data.filter(i => i.status === 'ok').length
  const warnCount = data.filter(i => i.status === 'warning').length
  const failCount = data.filter(i => i.status === 'fail').length
  const passRate = data.length > 0 ? ((okCount / data.length) * 100).toFixed(1) : '0'
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />OK</div><p className="text-2xl font-bold text-emerald-700">{okCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Upozorenja</div><p className="text-2xl font-bold text-amber-700">{warnCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Otkaz</div><p className="text-2xl font-bold text-red-700">{failCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Stopa prolaza</div><p className="text-2xl font-bold">{passRate}%</p></Card>
    </div>
  )
}

/* ─── Table ─── */
export function MeasurementTable({
  filtered, search, setSearch, statusFilter, setStatusFilter, onView, onEdit, onDelete,
}: {
  filtered: Measurement[]
  search: string; setSearch: (v: string) => void
  statusFilter: string; setStatusFilter: (v: string) => void
  onView: (id: string) => void; onEdit: (item: Measurement) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2"><Ruler className="h-4 w-4" />Lista merenja</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="ok">OK</SelectItem><SelectItem value="warning">Upozorenje</SelectItem><SelectItem value="fail">Otkaz</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Šifra</TableHead><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs hidden sm:table-cell">Parametar</TableHead><TableHead className="text-xs hidden md:table-cell">Nominalno</TableHead><TableHead className="text-xs hidden md:table-cell">Izmereno</TableHead><TableHead className="text-xs hidden lg:table-cell">Odstupanje</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Operater</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema merenja</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-mono font-medium">{item.code}</TableCell>
                  <TableCell className="text-xs font-medium">{item.product}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.parameter}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.nominalValue} {item.unit}</TableCell>
                  <TableCell className="text-xs font-medium hidden md:table-cell">{item.measuredValue} {item.unit}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell"><span className={item.status === 'fail' ? 'text-red-600 font-semibold' : item.status === 'warning' ? 'text-amber-600 font-semibold' : ''}>{item.deviation}</span></TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.operator}</TableCell>
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
export function MeasurementCreateTab({ form, setForm, onSave }: {
  form: Partial<Measurement>; setForm: (f: Partial<Measurement>) => void; onSave: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novo merenje</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Šifra</Label><Input className="text-xs" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MER-2024-XXX" /></div>
            <div className="grid gap-2"><Label className="text-xs">Proizvod *</Label><Input className="text-xs" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="Naziv proizvoda" /></div>
            <div className="grid gap-2"><Label className="text-xs">Parametar *</Label><Select value={form.parameter || ''} onValueChange={v => setForm({ ...form, parameter: v })}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi parametar" /></SelectTrigger><SelectContent>{PARAMETERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Jedinica mere</Label><Select value={form.unit || 'mm'} onValueChange={v => setForm({ ...form, unit: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Nominalna vrednost</Label><Input className="text-xs" type="number" step="0.001" value={form.nominalValue || ''} onChange={e => setForm({ ...form, nominalValue: e.target.value })} placeholder="0.000" /></div>
            <div className="grid gap-2"><Label className="text-xs">Izmerena vrednost</Label><Input className="text-xs" type="number" step="0.001" value={form.measuredValue || ''} onChange={e => setForm({ ...form, measuredValue: e.target.value })} placeholder="0.000" /></div>
            <div className="grid gap-2"><Label className="text-xs">Tolerancija (±)</Label><Input className="text-xs" value={form.tolerance || ''} onChange={e => setForm({ ...form, tolerance: e.target.value })} placeholder="±0.010" /></div>
            <div className="grid gap-2"><Label className="text-xs">Paket</Label><Input className="text-xs" value={form.batch || ''} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="LOT-2024-XXX" /></div>
            <div className="grid gap-2"><Label className="text-xs">Instrument</Label><Input className="text-xs" value={form.instrument || ''} onChange={e => setForm({ ...form, instrument: e.target.value })} placeholder="Naziv instrumenta" /></div>
            <div className="grid gap-2"><Label className="text-xs">Operater</Label><Input className="text-xs" value={form.operator || ''} onChange={e => setForm({ ...form, operator: e.target.value })} placeholder="Ime operatera" /></div>
            <div className="grid gap-2"><Label className="text-xs">Stanica</Label><Input className="text-xs" value={form.station || ''} onChange={e => setForm({ ...form, station: e.target.value })} placeholder="QC-XX" /></div>
            <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Napomene o merenju..." /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj merenje</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Edit Tab ─── */
export function MeasurementEditTab({ data, onEdit, onDelete }: {
  data: Measurement[]; onEdit: (item: Measurement) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi merenja</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium">{item.code}</span>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.product} — {item.parameter}: {item.measuredValue} {item.unit} (nom. {item.nominalValue})</p>
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

