'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Wallet, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { STATUSES } from './data'
import type { Tuition } from './types'

/* ── helpers ── */

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function formatRSD(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p)
}

/* ── KPI cards ── */

export function TuitionKpiCards({ data }: { data: Tuition[] }) {
  const totalAmount = data.reduce((s, i) => s + i.amount, 0)
  const totalPaid = data.reduce((s, i) => s + i.paidAmount, 0)
  const overdueCount = data.filter(i => i.status === 'overdue').length
  const paidCount = data.filter(i => i.status === 'paid' || i.status === 'scholarship' || i.status === 'exempt').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wallet className="h-3 w-3" />Ukupno</div><p className="text-xl font-bold">{formatRSD(totalAmount)}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Uplaćeno</div><p className="text-xl font-bold text-emerald-700">{formatRSD(totalPaid)}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kasni</div><p className="text-2xl font-bold text-red-700">{overdueCount}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Regulisanih</div><p className="text-2xl font-bold text-blue-700">{paidCount}/{data.length}</p></Card>
    </div>
  )
}

/* ── Table ── */

export function TuitionTable({
  filtered,
  programs,
  search,
  statusFilter,
  programFilter,
  setSearch,
  setStatusFilter,
  setProgramFilter,
  onDetail,
  onEdit,
  onDelete,
}: {
  filtered: Tuition[]
  programs: string[]
  search: string
  statusFilter: string
  programFilter: string
  setSearch: (v: string) => void
  setStatusFilter: (v: string) => void
  setProgramFilter: (v: string) => void
  onDetail: (id: string) => void
  onEdit: (item: Tuition) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Lista uplata</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="paid">Plaćena</SelectItem><SelectItem value="partial">Delimično</SelectItem><SelectItem value="unpaid">Neplaćena</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="scholarship">Stipendija</SelectItem></SelectContent></Select>
            <Select value={programFilter || 'all'} onValueChange={v => setProgramFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi programi</SelectItem>{programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Student</TableHead><TableHead className="text-xs hidden sm:table-cell">Br. indeksa</TableHead><TableHead className="text-xs hidden md:table-cell">Program</TableHead><TableHead className="text-xs hidden md:table-cell">Iznos</TableHead><TableHead className="text-xs hidden lg:table-cell">Uplaćeno</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">{item.student}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.indexNo}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{item.program}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{formatRSD(item.amount)}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{formatRSD(item.paidAmount)}{item.discount > 0 && <span className="ml-1 text-emerald-600">(-{item.discount}%)</span>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
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

export function TuitionCreateTab({
  form,
  setForm,
  onSubmit,
}: {
  form: Partial<Tuition>
  setForm: (f: Partial<Tuition>) => void
  onSubmit: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Novi zapis školarine</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">Student *</Label><Input className="text-xs" value={form.student || ''} onChange={e => setForm({ ...form, student: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Broj indeksa</Label><Input className="text-xs" value={form.indexNo || ''} onChange={e => setForm({ ...form, indexNo: e.target.value })} placeholder="2024/XXX" /></div>
            <div className="grid gap-2"><Label className="text-xs">Program *</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Godina/Semestar</Label><div className="flex gap-2"><Input className="text-xs" type="number" value={form.year || ''} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /><Input className="text-xs" type="number" value={form.semester || ''} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} /></div></div>
            <div className="grid gap-2"><Label className="text-xs">Iznos školarine (RSD)</Label><Input className="text-xs" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Popust (%)</Label><Input className="text-xs" type="number" value={form.discount || '0'} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Rok uplate</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Rate</Label><Input className="text-xs" type="number" value={form.installments || '1'} onChange={e => setForm({ ...form, installments: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSubmit}><Plus className="h-4 w-4" />Kreiraj zapis</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Edit tab ── */

export function TuitionEditTab({
  data,
  onEdit,
  onDelete,
}: {
  data: Tuition[]
  onEdit: (item: Tuition) => void
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
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.student}</span><span className="text-xs text-muted-foreground font-mono">{item.indexNo}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.program} — {formatRSD(item.amount)} — Uplaćeno: {formatRSD(item.paidAmount)}</p>
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


