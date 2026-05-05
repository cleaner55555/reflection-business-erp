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
import { Plus, Search, Trash2, Eye, BookOpen, Users, CalendarDays, BookMarked, BarChart3, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Book { id: string; title: string; author: string; isbn: string; category: string; status: 'available' | 'borrowed' | 'reserved' | 'lost'; publisher: string; year: number; copies: number; available: number; location: string; borrowCount: number }

const INITIAL: Book[] = [
  { id: '1', title: 'Algoritmi i strukture podataka', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Računarstvo', status: 'available', publisher: 'MIT Press', year: 2009, copies: 5, available: 3, location: 'Polica A-12', borrowCount: 142 },
  { id: '2', title: 'Linearna algebra i njene primene', author: 'Gilbert Strang', isbn: '978-0980232776', category: 'Matematika', status: 'borrowed', publisher: 'Wellesley', year: 2016, copies: 3, available: 0, location: 'Polica B-05', borrowCount: 98 },
  { id: '3', title: 'Uvod u programiranje sa C', author: 'Brian Kernighan', isbn: '978-0131103627', category: 'Računarstvo', status: 'available', publisher: 'Prentice Hall', year: 1988, copies: 8, available: 5, location: 'Polica A-01', borrowCount: 256 },
  { id: '4', title: 'Fizika - Udžbenik', author: 'Halliday, Resnick', isbn: '978-1118230725', category: 'Fizika', status: 'reserved', publisher: 'Wiley', year: 2013, copies: 10, available: 0, location: 'Polica C-03', borrowCount: 310 },
  { id: '5', title: 'Engleski jezik za IT', author: 'Jeremy Comfort', isbn: '978-0194579503', category: 'Jezici', status: 'available', publisher: 'Oxford', year: 2015, copies: 20, available: 15, location: 'Polica D-01', borrowCount: 87 },
  { id: '6', title: 'Baze podataka - Koncepti', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'Računarstvo', status: 'lost', publisher: 'McGraw-Hill', year: 2019, copies: 4, available: 3, location: 'Polica A-08', borrowCount: 65 },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  available: { color: 'bg-emerald-100 text-emerald-800', label: 'Dostupna' }, borrowed: { color: 'bg-sky-100 text-sky-800', label: 'Iznajmljena' },
  reserved: { color: 'bg-amber-100 text-amber-800', label: 'Rezervisana' }, lost: { color: 'bg-red-100 text-red-800', label: 'Izgubljena' },
}
function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function Biblioteka() {
  const [data, setData] = useState<Book[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()) || item.isbn.includes(search)
    return matchSearch
  }), [data, search])

  const stats = useMemo(() => ({
    total: data.length, available: data.filter(d => d.status === 'available').length, borrowed: data.filter(d => d.status === 'borrowed').length,
    totalCopies: data.reduce((s, d) => s + d.copies, 0), availableCopies: data.reduce((s, d) => s + d.available, 0),
    totalBorrows: data.reduce((s, d) => s + d.borrowCount, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><BookMarked className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Biblioteka</h1><p className="text-sm text-muted-foreground">Upravljanje knjigama i izdavanjima</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Naslova</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Dostupne</div><p className="text-xl font-bold text-emerald-700">{stats.available}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Iznajmljene</div><p className="text-xl font-bold text-sky-700">{stats.borrowed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno primeraka</div><p className="text-xl font-bold">{stats.totalCopies}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Na policama</div><p className="text-xl font-bold">{stats.availableCopies}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Izdavanja</div><p className="text-xl font-bold">{stats.totalBorrows}</p></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Knjige</CardTitle><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naslov, autor, ISBN..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div></div></CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden sm:table-cell">Autor</TableHead><TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Primeraka</TableHead><TableHead className="text-xs hidden lg:table-cell">Lokacija</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema knjiga</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell><div className="text-xs font-medium">{item.title}</div><div className="text-[10px] text-muted-foreground font-mono">{item.isbn}</div></TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{item.author}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.category}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.available}/{item.copies}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.location}</TableCell>
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
          <DialogHeader><DialogTitle>Detalji knjige</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><p className="text-lg font-bold">{detailItem.title}</p>{getStatusBadge(detailItem.status)}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Autor</div><p className="text-xs">{detailItem.author}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">ISBN</div><p className="text-xs font-mono">{detailItem.isbn}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Izdavač</div><p className="text-xs">{detailItem.publisher} ({detailItem.year})</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Lokacija</div><p className="text-xs">{detailItem.location}</p></div>
              </div>
              <div className="flex justify-between text-xs p-3 rounded-lg bg-muted/50"><span>Dostupno: {detailItem.available}/{detailItem.copies}</span><span>Izdavanja: {detailItem.borrowCount}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
