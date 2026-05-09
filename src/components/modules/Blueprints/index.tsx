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

const INITIAL_DATA: Blueprint[] = [
  {
    id: '1', name: 'Arhitektonski projekat stambenog objekta', code: 'BP-2024-001', project: 'Naselje Sunčani breg', category: 'architectural', status: 'approved',
    version: 'v2.1', author: 'Branko Kovačević', client: 'Invest Plus d.o.o.', scale: '1:100', sheetSize: 'A1', fileSize: 24.5, fileFormat: 'PDF',
    createdDate: '2024-05-15', updatedDate: '2024-06-10', approvedBy: 'Marko Savić', approvedDate: '2024-06-12', notes: 'Izmenjen balkon na spratu 3-5',
    revisions: [
      { version: 'v1.0', date: '2024-05-15', author: 'Branko Kovačević', description: 'Inicijalni nacrt' },
      { version: 'v1.5', date: '2024-05-28', author: 'Branko Kovačević', description: 'Proširenje garáže' },
      { version: 'v2.0', date: '2024-06-03', author: 'Branko Kovačević', description: 'Dodat lift' },
      { version: 'v2.1', date: '2024-06-10', author: 'Branko Kovačević', description: 'Modifikacija balkona' },
    ]
  },
  {
    id: '2', name: 'Statički proračun - armiranobetonska konstrukcija', code: 'BP-2024-002', project: 'Naselje Sunčani breg', category: 'structural', status: 'review',
    version: 'v1.3', author: 'Nenad Stojanović', client: 'Invest Plus d.o.o.', scale: '1:50', sheetSize: 'A0', fileSize: 18.2, fileFormat: 'DWG',
    createdDate: '2024-05-20', updatedDate: '2024-06-14', approvedBy: null, approvedDate: null, notes: 'Čeka potvrdu od stručnjaka za seizmiku',
    revisions: [
      { version: 'v1.0', date: '2024-05-20', author: 'Nenad Stojanović', description: 'Početni proračun' },
      { version: 'v1.2', date: '2024-06-01', author: 'Nenad Stojanović', description: 'Korekcija armature - sprat 4' },
      { version: 'v1.3', date: '2024-06-14', author: 'Nenad Stojanović', description: 'Seizmička analiza - revizija' },
    ]
  },
  {
    id: '3', name: 'Elektro instalacije - raspored i šema', code: 'BP-2024-003', project: 'Naselje Sunčani breg', category: 'electrical', status: 'draft',
    version: 'v0.5', author: 'Ivana Petrović', client: 'Invest Plus d.o.o.', scale: '1:100', sheetSize: 'A1', fileSize: 8.7, fileFormat: 'PDF',
    createdDate: '2024-06-10', updatedDate: null, approvedBy: null, approvedDate: null, notes: 'Priprema za prvu reviziju',
    revisions: [{ version: 'v0.5', date: '2024-06-10', author: 'Ivana Petrović', description: 'Radna verzija - 60% kompletno' }]
  },
  {
    id: '4', name: 'Geodetski elaborat', code: 'BP-2024-004', project: 'Tržni centar Nova', category: 'geodetic', status: 'final',
    version: 'v3.0', author: 'Slobodan Radovanović', client: 'Nova Commerce', scale: '1:500', sheetSize: 'A0', fileSize: 45.3, fileFormat: 'PDF',
    createdDate: '2024-04-01', updatedDate: '2024-05-20', approvedBy: 'Dragan Milić', approvedDate: '2024-05-22', notes: 'Kompletan elaborat sa katastarskim planom',
    revisions: [
      { version: 'v1.0', date: '2024-04-01', author: 'Slobodan Radovanović', description: 'Poligonska mreža' },
      { version: 'v2.0', date: '2024-04-20', author: 'Slobodan Radovanović', description: 'Detaljno merenje terena' },
      { version: 'v3.0', date: '2024-05-20', author: 'Slobodan Radovanović', description: 'Finalna verzija sa katastarskim planom' },
    ]
  },
  {
    id: '5', name: 'Vodovodne i kanalizacione instalacije', code: 'BP-2024-005', project: 'Tržni centar Nova', category: 'plumbing', status: 'revision',
    version: 'v2.1', author: 'Goran Janković', client: 'Nova Commerce', scale: '1:100', sheetSize: 'A1', fileSize: 12.1, fileFormat: 'DWG',
    createdDate: '2024-05-01', updatedDate: '2024-06-13', approvedBy: null, approvedDate: null, notes: 'Revizija - promenjena lokacija glavnog kolektora',
    revisions: [
      { version: 'v1.0', date: '2024-05-01', author: 'Goran Janković', description: 'Inicijalni projekat' },
      { version: 'v2.0', date: '2024-05-25', author: 'Goran Janković', description: 'Kompletan projekat' },
      { version: 'v2.1', date: '2024-06-13', author: 'Goran Janković', description: 'Promena kolektora po zahtevu komunalije' },
    ]
  },
  {
    id: '6', name: 'Enterijer - dnevni boravak i kuhinja', code: 'BP-2024-006', project: 'Vila Panorama', category: 'interior', status: 'draft',
    version: 'v1.0', author: 'Jelena Nikolić', client: ' Privatni klijent', scale: '1:50', sheetSize: 'A2', fileSize: 15.8, fileFormat: 'PDF',
    createdDate: '2024-06-12', updatedDate: null, approvedBy: null, approvedDate: null, notes: 'Prva skica za klijenta',
    revisions: [{ version: 'v1.0', date: '2024-06-12', author: 'Jelena Nikolić', description: 'Konceptualni dizajn - dnevni boravak i kuhinja' }]
  },
]

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

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getCategoryBadge(c: string) { const r = CATEGORIES[c]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{c}</Badge> }

export function Blueprints() {
  const [data, setData] = useState<Blueprint[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Blueprint | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', project: '', category: 'architectural' as Blueprint['category'], author: '', client: '', scale: '', sheetSize: '', notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

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

  const handleDelete = (id: string) => { if (!confirm('Obrisati nacrt?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Nacrt obrisan') }

  const handleOpenCreate = () => {
    setFormData({ name: '', code: `BP-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, project: '', category: 'architectural', author: '', client: '', scale: '', sheetSize: '', notes: '' })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: Blueprint) => {
    setFormData({ name: item.name, code: item.code, project: item.project, category: item.category, author: item.author, client: item.client, scale: item.scale, sheetSize: item.sheetSize, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.project || !formData.author) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData, updatedDate: new Date().toISOString().split('T')[0] } : d))
      toast.success('Nacrt ažuriran')
    } else {
      const newItem: Blueprint = { ...formData, id: String(Date.now()), status: 'draft', version: 'v1.0', fileSize: 0, fileFormat: 'PDF', createdDate: new Date().toISOString().split('T')[0], updatedDate: null, approvedBy: null, approvedDate: null, revisions: [{ version: 'v1.0', date: new Date().toISOString().split('T')[0], author: formData.author, description: 'Kreiran novi nacrt' }] }
      setData(prev => [newItem, ...prev])
      toast.success('Novi nacrt kreiran')
    }
    setDialogOpen(false); setEditItem(null)
  }

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
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Nacrti</div><p className="text-xl font-bold text-slate-700">{stats.draft}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Pregled</div><p className="text-xl font-bold text-sky-700">{stats.review}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Odobreni</div><p className="text-xl font-bold text-emerald-700">{stats.approved}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-violet-600 mb-1">Finalni</div><p className="text-xl font-bold text-violet-700">{stats.final}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Projekti</div><p className="text-xl font-bold">{stats.projects}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Veličina</div><p className="text-xl font-bold">{stats.totalSize.toFixed(1)} MB</p></Card>
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
                    <TableCell><div className="text-xs font-medium max-w-[200px] truncate">{item.name}</div><div className="text-[10px] text-muted-foreground">{item.scale} · {item.sheetSize} · {item.fileSize}MB</div></TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{item.project}</TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs font-mono hidden md:table-cell">{item.version}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.author}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.createdDate)}</TableCell>
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
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Projekat</div><p className="text-xs font-medium">{detailItem.project}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Autor</div><p className="text-xs font-medium">{detailItem.author}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Klijent</div><p className="text-xs font-medium">{detailItem.client}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Format</div><p className="text-xs font-medium">{detailItem.scale} · {detailItem.sheetSize} · {detailItem.fileSize}MB {detailItem.fileFormat}</p></div>
              </div>
              {detailItem.approvedBy && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-xs text-emerald-700">Odobrio: {detailItem.approvedBy} · {formatDate(detailItem.approvedDate!)}</p></div>}
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}

              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-2"><Layers className="h-3.5 w-3.5" />Istorija revizija</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...detailItem.revisions].reverse().map((rev, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0 mt-0.5">{rev.version}</Badge>
                      <div className="flex-1"><p className="text-xs">{rev.description}</p><p className="text-[10px] text-muted-foreground">{rev.author} · {formatDate(rev.date)}</p></div>
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
