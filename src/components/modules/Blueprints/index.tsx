'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { Plus, Search, Trash2, Pencil, Eye, FileText, Ruler, Layers, AlertTriangle, CheckCircle2, Clock, CalendarDays, Building2, HardHat, ClipboardList, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Blueprint {
  id: string
  name: string
  code: string
  project: string
  category: 'architectural' | 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'geodetic' | 'interior'
  status: 'draft' | 'review' | 'approved' | 'revision' | 'final' | 'archived'
  version: string
  author: string
  client: string
  scale: string
  sheetSize: string
  fileSize: number
  fileFormat: string
  createdDate: string
  updatedDate: string | null
  approvedBy: string | null
  approvedDate: string | null
  notes: string
  revisions: { version: string; date: string; author: string; description: string }[]
}

const STATUSES: Record<string, { color: string; label: string }> = {
  draft: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Nacrt' },
  review: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Pregled' },
  approved: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Odobren' },
  revision: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Revizija' },
  final: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', label: 'Finalan' },
  archived: { color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400', label: 'Arhiviran' },
}

const CATEGORIES: Record<string, { color: string; label: string }> = {
  architectural: { color: 'bg-blue-100 text-blue-700', label: 'Arhitektonski' },
  structural: { color: 'bg-red-100 text-red-700', label: 'Statički' },
  mechanical: { color: 'bg-amber-100 text-amber-700', label: 'Mašinski' },
  electrical: { color: 'bg-yellow-100 text-yellow-700', label: 'Elektro' },
  plumbing: { color: 'bg-sky-100 text-sky-700', label: 'Vodoinstalacije' },
  geodetic: { color: 'bg-emerald-100 text-emerald-700', label: 'Geodetski' },
  interior: { color: 'bg-violet-100 text-violet-700', label: 'Enterijer' },
}

const AUTHORS = ['Branko Kovačević', 'Nenad Stojanović', 'Ivana Petrović', 'Slobodan Radovanović', 'Goran Janković', 'Jelena Nikolić', 'Marko Đorđević']

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getCategoryBadge(c: string) { const r = CATEGORIES[c]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{c}</Badge> }

export function Blueprints() {
  const [data, setData] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Blueprint | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', project: '', category: 'architectural' as Blueprint['category'], author: '', client: '', scale: '', sheetSize: '', notes: '' })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/blueprints')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json.map((d: Record<string, unknown>) => ({ ...d, revisions: typeof d.revisions === 'string' ? JSON.parse(d.revisions) : d.revisions || [] })))
    } catch { toast.error('Greška pri učitavanju') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()) || item.project.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCat = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  }), [data, search, statusFilter, categoryFilter])

  const stats = useMemo(() => ({
    total: data.length, draft: data.filter(d => d.status === 'draft').length, review: data.filter(d => d.status === 'review').length,
    approved: data.filter(d => d.status === 'approved').length, final: data.filter(d => d.status === 'final').length,
    totalSize: data.reduce((s, d) => s + d.fileSize, 0),
    projects: [...new Set(data.map(d => d.project))].length,
  }), [data])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati nacrt?')) return
    try {
      await fetch(`/api/blueprints/${id}`, { method: 'DELETE' })
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Nacrt obrisan')
    } catch { toast.error('Greška pri brisanju') }
  }, [])

  const handleOpenCreate = useCallback(() => {
    setFormData({ name: '', code: `BP-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, project: '', category: 'architectural', author: '', client: '', scale: '', sheetSize: '', notes: '' })
    setDialogOpen(true)
  }, [data.length])

  const handleOpenEdit = useCallback((item: Blueprint) => {
    setFormData({ name: item.name, code: item.code, project: item.project, category: item.category, author: item.author, client: item.client, scale: item.scale, sheetSize: item.sheetSize, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.project || !formData.author) { toast.error('Popunite obavezna polja'); return }
    try {
      if (editItem) {
        const res = await fetch(`/api/blueprints/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...updated, revisions: typeof updated.revisions === 'string' ? JSON.parse(updated.revisions) : updated.revisions || [] } : d))
        toast.success('Nacrt ažuriran')
      } else {
        const res = await fetch('/api/blueprints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setData(prev => [{ ...created, revisions: typeof created.revisions === 'string' ? JSON.parse(created.revisions) : created.revisions || [] }, ...prev])
        toast.success('Novi nacrt kreiran')
      }
      setDialogOpen(false); setEditItem(null)
    } catch { toast.error('Greška pri čuvanju') }
  }, [formData, editItem])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Ruler className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Projektovanje</h1><p className="text-sm text-muted-foreground">Upravljanje nacrtima i projektima</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Novi nacrt</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Nacrti</div><p className="text-xl font-bold text-slate-700">{stats.draft}</p></Card>
        <Card className="p-4"><div className="text-xs text-sky-600 mb-1">Pregled</div><p className="text-xl font-bold text-sky-700">{stats.review}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Odobreni</div><p className="text-xl font-bold text-emerald-700">{stats.approved}</p></Card>
        <Card className="p-4"><div className="text-xs text-violet-600 mb-1">Finalni</div><p className="text-xl font-bold text-violet-700">{stats.final}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Projekti</div><p className="text-xl font-bold">{stats.projects}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Veličina</div><p className="text-xl font-bold">{stats.totalSize.toFixed(1)} MB</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Svi nacrti</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, projekat, autor..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={categoryFilter || 'all'} onValueChange={v => setCategoryFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Kod</TableHead>
                <TableHead className="text-xs">Naziv</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Projekat</TableHead>
                <TableHead className="text-xs">Kategorija</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Verzija</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Autor</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
                <TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema nacrta</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-mono">{item.code}</TableCell>
                    <TableCell><div className="text-xs font-medium max-w-[200px] truncate">{item.name}</div><div className="text-xs text-muted-foreground">{item.scale} · {item.sheetSize} · {item.fileSize}MB</div></TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{item.project}</TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs font-mono hidden md:table-cell">{item.version}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.author}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji nacrta</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold">{detailItem.name}</p><p className="text-xs text-muted-foreground font-mono">{detailItem.code} · {detailItem.version}</p></div><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getCategoryBadge(detailItem.category)}</div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Projekat</div><p className="text-xs font-medium">{detailItem.project}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Autor</div><p className="text-xs font-medium">{detailItem.author}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Klijent</div><p className="text-xs font-medium">{detailItem.client}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Format</div><p className="text-xs font-medium">{detailItem.scale} · {detailItem.sheetSize} · {detailItem.fileSize}MB {detailItem.fileFormat}</p></div>
              </div>
              {detailItem.approvedBy && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-xs text-emerald-700">Odobrio: {detailItem.approvedBy} · {detailItem.approvedDate ? formatDate(detailItem.approvedDate) : ''}</p></div>}
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}

              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-2"><Layers className="h-3.5 w-3.5" />Istorija revizija</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...detailItem.revisions].reverse().map((rev, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="text-xs font-mono shrink-0 mt-0.5">{rev.version}</Badge>
                      <div className="flex-1"><p className="text-xs">{rev.description}</p><p className="text-xs text-muted-foreground">{rev.author} · {formatDate(rev.date)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi nacrt' : 'Novi nacrt'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Kod</Label><Input placeholder="BP-2024-001" className="text-xs font-mono" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v as Blueprint['category'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Naziv *</Label><Input placeholder="Naziv nacrta" className="text-xs" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Projekat *</Label><Input placeholder="Naziv projekta" className="text-xs" value={formData.project} onChange={e => setFormData(p => ({ ...p, project: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Autor *</Label><Select value={formData.author} onValueChange={v => setFormData(p => ({ ...p, author: v }))}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent>{AUTHORS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Klijent</Label><Input placeholder="Ime klijenta" className="text-xs" value={formData.client} onChange={e => setFormData(p => ({ ...p, client: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Skala</Label><Input placeholder="1:100" className="text-xs" value={formData.scale} onChange={e => setFormData(p => ({ ...p, scale: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Format</Label><Select value={formData.sheetSize} onValueChange={v => setFormData(p => ({ ...p, sheetSize: v }))}><SelectTrigger className="text-xs"><SelectValue placeholder="Format" /></SelectTrigger><SelectContent>{['A0', 'A1', 'A2', 'A3', 'A4'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Opis projekta..." className="text-xs" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
