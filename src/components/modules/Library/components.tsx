'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, BookOpen, BookCopy, Users } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Book } from './types'
import { STATUSES, CATEGORIES } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

/* ─── KPI Cards ─── */
export function LibraryKpiCards({ data }: { data: Book[] }) {
  const totalBooks = data.reduce((s, i) => s + i.totalCopies, 0)
  const availableBooks = data.reduce((s, i) => s + i.availableCopies, 0)
  const totalBorrows = data.reduce((s, i) => s + i.borrowedCount, 0)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" />Naslova</div><p className="text-2xl font-bold">{data.length}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><BookCopy className="h-3 w-3" />Ukupno primeraka</div><p className="text-2xl font-bold text-blue-700">{totalBooks}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Dostupnih</div><p className="text-2xl font-bold text-emerald-700">{availableBooks}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Pozajmica</div><p className="text-2xl font-bold text-amber-700">{totalBorrows}</p></Card>
    </div>
  )
}

/* ─── Table ─── */
export function LibraryTable({
  filtered, search, setSearch, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, onView, onEdit, onDelete,
}: {
  filtered: Book[]
  search: string; setSearch: (v: string) => void
  statusFilter: string; setStatusFilter: (v: string) => void
  categoryFilter: string; setCategoryFilter: (v: string) => void
  onView: (id: string) => void; onEdit: (item: Book) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Katalog knjiga</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="available">Dostupna</SelectItem><SelectItem value="limited">Ograničena</SelectItem><SelectItem value="reference_only">Samo čitanje</SelectItem><SelectItem value="lost">Izgubljena</SelectItem></SelectContent></Select>
            <Select value={categoryFilter || 'all'} onValueChange={v => setCategoryFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem><SelectItem value="fiction">Književnost</SelectItem><SelectItem value="science">Nauka</SelectItem><SelectItem value="technical">Tehnika</SelectItem><SelectItem value="history">Istorija</SelectItem><SelectItem value="law">Pravo</SelectItem><SelectItem value="economics">Ekonomija</SelectItem><SelectItem value="medicine">Medicina</SelectItem></SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden sm:table-cell">Autor</TableHead><TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Godina</TableHead><TableHead className="text-xs hidden lg:table-cell">Primeraka</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema knjiga</TableCell></TableRow> : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium max-w-[180px] truncate">{item.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.author}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{CATEGORIES[item.category]?.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{item.year}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{item.availableCopies}/{item.totalCopies}</TableCell>
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
export function LibraryCreateTab({ form, setForm, onSave }: {
  form: Partial<Book>; setForm: (f: Partial<Book>) => void; onSave: () => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Nova knjiga</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label className="text-xs">ISBN</Label><Input className="text-xs" value={form.isbn || ''} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="978-..." /></div>
            <div className="grid gap-2"><Label className="text-xs">Naslov *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Autor *</Label><Input className="text-xs" value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Izdavač</Label><Input className="text-xs" value={form.publisher || ''} onChange={e => setForm({ ...form, publisher: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Godina</Label><Input className="text-xs" type="number" value={form.year || ''} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'fiction'} onValueChange={v => setForm({ ...form, category: v as Book['category'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label className="text-xs">Broj primeraka</Label><Input className="text-xs" type="number" value={form.totalCopies || ''} onChange={e => setForm({ ...form, totalCopies: Number(e.target.value), availableCopies: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Jezik</Label><Input className="text-xs" value={form.language || ''} onChange={e => setForm({ ...form, language: e.target.value })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Strana</Label><Input className="text-xs" type="number" value={form.pages || ''} onChange={e => setForm({ ...form, pages: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label className="text-xs">Lokacija</Label><Input className="text-xs" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="A-XX Police X" /></div>
          </div>
          <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <Button size="sm" className="w-fit gap-2" onClick={onSave}><Plus className="h-4 w-4" />Kreiraj knjigu</Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Edit Tab ─── */
export function LibraryEditTab({ data, onEdit, onDelete }: {
  data: Book[]; onEdit: (item: Book) => void; onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Uredi knjige</CardTitle></CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.title}</span>{getStatusBadge(item.status)}</div>
                <p className="text-xs text-muted-foreground truncate">{item.author} — {item.publisher} ({item.year}) — {item.availableCopies}/{item.totalCopies}</p>
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

