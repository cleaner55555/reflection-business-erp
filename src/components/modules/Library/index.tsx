'use client'
import { useState, useEffect } from 'react'
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
import { Plus, Search, Trash2, Pencil, Eye, BookOpen, BookCopy, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Book = {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string
  year: number
  category: 'fiction' | 'science' | 'technical' | 'history' | 'philosophy' | 'art' | 'law' | 'economics' | 'medicine' | 'education'
  totalCopies: number
  availableCopies: number
  borrowedCount: number
  location: string
  status: 'available' | 'limited' | 'reference_only' | 'lost' | 'damaged'
  language: string
  pages: number
  addedDate: string
  notes: string
}

const INITIAL: Book[] = [
  { id: '1', isbn: '978-86-10-01234-1', title: 'Na Drini ćuprija', author: 'Ivo Andrić', publisher: 'Prosveta', year: 1945, category: 'fiction', totalCopies: 5, availableCopies: 2, borrowedCount: 48, location: 'A-01 Police 3', status: 'available', language: 'Srpski', pages: 312, addedDate: '2020-09-01', notes: 'Nobelovac za književnost 1961' },
  { id: '2', isbn: '978-86-10-02345-2', title: 'Mehanika fluida', author: 'Frank M. White', publisher: 'McGraw-Hill', year: 2015, category: 'technical', totalCopies: 3, availableCopies: 1, borrowedCount: 22, location: 'T-12 Police 1', status: 'available', language: 'Engleski', pages: 892, addedDate: '2021-03-15', notes: '8. izdanje' },
  { id: '3', isbn: '978-86-10-03456-3', title: 'Istorija Srba', author: 'Vladimir Ćorović', publisher: 'BIGZ', year: 1993, category: 'history', totalCopies: 4, availableCopies: 0, borrowedCount: 65, location: 'A-05 Police 2', status: 'limited', language: 'Srpski', pages: 1048, addedDate: '2019-09-01', notes: 'Samo za čitanje u biblioteci' },
  { id: '4', isbn: '978-86-10-04567-4', title: 'Makroekonomija', author: 'N. Gregory Mankiw', publisher: 'Worth Publishers', year: 2019, category: 'economics', totalCopies: 6, availableCopies: 3, borrowedCount: 35, location: 'E-03 Police 1', status: 'available', language: 'Engleski', pages: 576, addedDate: '2020-01-20', notes: '9. izdanje — udžbenik' },
  { id: '5', isbn: '978-86-10-05678-5', title: 'Organicka hemija', author: 'Paula Yurkanis Bruice', publisher: 'Pearson', year: 2017, category: 'science', totalCopies: 4, availableCopies: 2, borrowedCount: 18, location: 'N-02 Police 4', status: 'available', language: 'Engleski', pages: 1440, addedDate: '2021-09-10', notes: '8. izdanje' },
  { id: '6', isbn: '978-86-10-06789-6', title: 'Gorski venac', author: 'Petar II Petrović Njegoš', publisher: 'Čigoja štampa', year: 1847, category: 'fiction', totalCopies: 8, availableCopies: 5, borrowedCount: 82, location: 'A-01 Police 1', status: 'available', language: 'Srpski', pages: 96, addedDate: '2018-09-01', notes: 'Klasično delo srpske književnosti' },
  { id: '7', isbn: '978-86-10-07890-7', title: 'Građansko pravo Srbije', author: 'Mihajlo Đurić', publisher: 'Nomos', year: 2020, category: 'law', totalCopies: 3, availableCopies: 0, borrowedCount: 40, location: 'P-01 Police 2', status: 'reference_only', language: 'Srpski', pages: 624, addedDate: '2021-02-15', notes: 'Samo za korišćenje u čitaonici' },
  { id: '8', isbn: '978-86-10-08901-8', title: 'Uvod u algoritme', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, category: 'technical', totalCopies: 5, availableCopies: 2, borrowedCount: 55, location: 'T-08 Police 3', status: 'available', language: 'Engleski', pages: 1312, addedDate: '2019-03-01', notes: '3. izdanje — CLRS' },
  { id: '9', isbn: '978-86-10-09012-9', title: 'Harrisonova interna medicina', author: 'Dennis L. Kasper', publisher: 'McGraw-Hill', year: 2022, category: 'medicine', totalCopies: 2, availableCopies: 1, borrowedCount: 12, location: 'M-01 Police 1', status: 'available', language: 'Engleski', pages: 3680, addedDate: '2023-01-15', notes: '21. izdanje — 2 toma' },
  { id: '10', isbn: '978-86-10-00123-0', title: 'Seobe', author: 'Miloš Crnjanski', publisher: 'Prosveta', year: 1929, category: 'fiction', totalCopies: 0, availableCopies: 0, borrowedCount: 0, location: '—', status: 'lost', language: 'Srpski', pages: 256, addedDate: '2018-09-01', notes: 'Gubitak pri premeštanju — treba nadoknaditi' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  available: { color: 'bg-emerald-100 text-emerald-800', label: 'Dostupna' },
  limited: { color: 'bg-amber-100 text-amber-800', label: 'Ograničena' },
  reference_only: { color: 'bg-blue-100 text-blue-800', label: 'Samo čitanje' },
  lost: { color: 'bg-red-100 text-red-800', label: 'Izgubljena' },
  damaged: { color: 'bg-red-100 text-red-800', label: 'Oštećena' },
}

const CATEGORIES: Record<string, { label: string }> = {
  fiction: { label: 'Književnost' },
  science: { label: 'Nauka' },
  technical: { label: 'Tehnika' },
  history: { label: 'Istorija' },
  philosophy: { label: 'Filozofija' },
  art: { label: 'Umetnost' },
  law: { label: 'Pravo' },
  economics: { label: 'Ekonomija' },
  medicine: { label: 'Medicina' },
  education: { label: 'Pedagogija' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

export function Biblioteka() {
  const [data, setData] = useState<Book[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Book | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Book>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.author, item.isbn, item.publisher].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati knjigu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Knjiga obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ isbn: '', title: '', author: '', publisher: '', year: new Date().getFullYear(), category: 'fiction', totalCopies: 1, availableCopies: 1, borrowedCount: 0, location: '', status: 'available', language: 'Srpski', pages: 0, addedDate: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Book) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.author) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Book : i))
      toast.success('Knjiga ažurirana')
    } else {
      const newItem: Book = { id: Date.now().toString(), ...form } as Book
      setData(prev => [newItem, ...prev])
      toast.success('Knjiga kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalBooks = data.reduce((s, i) => s + i.totalCopies, 0)
  const availableBooks = data.reduce((s, i) => s + i.availableCopies, 0)
  const totalBorrows = data.reduce((s, i) => s + i.borrowedCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Biblioteka</h1><p className="text-sm text-muted-foreground">Katalog knjiga, inventar i praćenje pozajmica</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova knjiga</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" />Naslova</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><BookCopy className="h-3 w-3" />Ukupno primeraka</div><p className="text-2xl font-bold text-blue-700">{totalBooks}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Dostupnih</div><p className="text-2xl font-bold text-emerald-700">{availableBooks}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Pozajmica</div><p className="text-2xl font-bold text-amber-700">{totalBorrows}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
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
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
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
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj knjigu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji knjige</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{detailItem.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Autor', detailItem.author],
                  ['ISBN', detailItem.isbn],
                  ['Izdavač', detailItem.publisher],
                  ['Godina', String(detailItem.year)],
                  ['Kategorija', CATEGORIES[detailItem.category]?.label],
                  ['Jezik', detailItem.language],
                  ['Strana', String(detailItem.pages)],
                  ['Primeraka', `${detailItem.availableCopies} / ${detailItem.totalCopies}`],
                  ['Pozajmica', String(detailItem.borrowedCount)],
                  ['Lokacija', detailItem.location],
                  ['Dodana', formatDate(detailItem.addedDate)],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi knjigu' : 'Nova knjiga'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Naslov *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Autor *</Label><Input className="text-xs" value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'available'} onValueChange={v => setForm({ ...form, status: v as Book['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Dostupna</SelectItem><SelectItem value="limited">Ograničena</SelectItem><SelectItem value="reference_only">Samo čitanje</SelectItem><SelectItem value="lost">Izgubljena</SelectItem><SelectItem value="damaged">Oštećena</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Primeraka</Label><Input className="text-xs" type="number" value={form.totalCopies || ''} onChange={e => setForm({ ...form, totalCopies: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
