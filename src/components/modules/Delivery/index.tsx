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
import { Plus, Search, Trash2, Pencil, Eye, Filter, Download, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

const INITIAL = [
  { id: '1', name: 'Zapis 1', description: 'Prvi test zapis', status: 'active', date: '2024-06-15', value: '1000' },
  { id: '2', name: 'Zapis 2', description: 'Drugi test zapis', status: 'completed', date: '2024-06-14', value: '2500' },
  { id: '3', name: 'Zapis 3', description: 'Treći test zapis', status: 'pending', date: '2024-06-13', value: '800' },
  { id: '4', name: 'Zapis 4', description: 'Četvrti zapis', status: 'cancelled', date: '2024-06-12', value: '3200' },
  { id: '5', name: 'Zapis 5', description: 'Peti test zapis', status: 'active', date: '2024-06-11', value: '1500' },
  { id: '6', name: 'Zapis 6', description: 'Šesti zapis', status: 'completed', date: '2024-06-10', value: '4100' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Završen' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazan' },
  in_progress: { color: 'bg-amber-100 text-amber-800', label: 'U toku' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

export function DostavaModul() {
  const [data, setData] = useState(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Модул</h1><p className="text-sm text-muted-foreground">Управљање подацима</p></div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Novi</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Укупно</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Активних</div><p className="text-2xl font-bold text-emerald-700">{data.filter(i => i.status === 'active').length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Завршених</div><p className="text-2xl font-bold text-blue-700">{data.filter(i => i.status === 'completed').length}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">На чекању</div><p className="text-2xl font-bold text-amber-700">{data.filter(i => i.status === 'pending').length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Nazив</TableHead><TableHead className="text-xs hidden sm:table-cell">Opis</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Datum</TableHead><TableHead className="text-xs hidden lg:table-cell">Vrednost</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nema podataka</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.description}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{formatDate(item.date)}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.value}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Detalji</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              {Object.entries(detailItem).filter(([k]) => k !== 'id').map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">{key}</span><span className="text-xs font-medium">{key === 'status' ? getStatusBadge(String(val)) : String(val)}</span></div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Novi zapis</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label className="text-xs">Naziv</Label><Input placeholder="Naziv..." /></div>
            <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input placeholder="Opis..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={() => { toast.success('Kreirano'); setDialogOpen(false) }}>Kreiraj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
