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
import { Plus, Search, Trash2, Pencil, Eye, HardHat, Building2, Users, CalendarDays, MapPin, DollarSign, AlertTriangle, CheckCircle2, Clock, FileText, Ruler, Package, Truck, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface ConstructionSite {
  id: string
  name: string
  code: string
  type: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'renovation'
  status: 'planning' | 'excavation' | 'foundation' | 'structural' | 'envelope' | 'systems' | 'finishing' | 'inspection' | 'completed' | 'on_hold'
  address: string
  city: string
  investor: string
  contractor: string
  projectManager: string
  workers: number
  budget: number
  spent: number
  startDate: string
  endDate: string | null
  progress: number
  area: number
  floors: number
  units: number
  notes: string
  tasks: { name: string; status: 'pending' | 'in_progress' | 'completed'; deadline: string }[]
}

const INITIAL_DATA: ConstructionSite[] = [
  { id: '1', name: 'Naselje Sunčani breg - Blok A', code: 'CS-2024-001', type: 'residential', status: 'structural', address: 'Bulevar Svetog Save 125', city: 'Novi Sad', investor: 'Invest Plus d.o.o.', contractor: 'Graditelj d.o.o.', projectManager: 'Milan Đorđević', workers: 45, budget: 85000000, spent: 38000000, startDate: '2024-03-01', endDate: null, progress: 42, area: 4500, floors: 5, units: 60, notes: 'Završena kotlovnica, u toku armatura sprat 3', tasks: [{ name: 'Armatura sprat 3', status: 'in_progress', deadline: '2024-06-20' }, { name: 'Betoniranje sprat 3', status: 'pending', deadline: '2024-06-25' }, { name: 'Prozor-vestacka stolarija', status: 'pending', deadline: '2024-07-15' }, { name: 'Fasada - sprat 1-2', status: 'completed', deadline: '2024-06-10' }] },
  { id: '2', name: 'Tržni centar Nova', code: 'CS-2024-002', type: 'commercial', status: 'systems', address: 'Bulevar Mihajla Pupina 88', city: 'Beograd', investor: 'Nova Commerce', contractor: 'MegaGradnja', projectManager: 'Jovan Stanković', workers: 120, budget: 250000000, spent: 180000000, startDate: '2023-06-01', endDate: null, progress: 72, area: 25000, floors: 3, units: 85, notes: 'Instalacije HVAC u toku', tasks: [{ name: 'HVAC instalacija', status: 'in_progress', deadline: '2024-07-01' }, { name: 'Elektro instalacija', status: 'completed', deadline: '2024-05-30' }, { name: 'Podno grijanje', status: 'completed', deadline: '2024-05-15' }] },
  { id: '3', name: 'Fabrika Betonije - Hala 3', code: 'CS-2024-003', type: 'industrial', status: 'foundation', address: 'Industrijska zona BB', city: 'Niš', investor: 'BetonCo', contractor: 'NišGradnja', projectManager: 'Slobodan Nikolić', workers: 30, budget: 45000000, spent: 8000000, startDate: '2024-05-15', endDate: null, progress: 18, area: 8000, floors: 1, units: 1, notes: 'Izrada temelja', tasks: [{ name: 'Temeji', status: 'in_progress', deadline: '2024-07-01' }, { name: 'Kanalizacija', status: 'completed', deadline: '2024-06-01' }] },
  { id: '4', name: 'Renovacija stana Marex', code: 'CS-2024-004', type: 'renovation', status: 'finishing', address: 'Knez Mihailova 42, stan 7', city: 'Beograd', investor: 'Privatni', contractor: 'DesignBuild', projectManager: 'Ana Popović', workers: 5, budget: 3500000, spent: 3100000, startDate: '2024-05-01', endDate: '2024-06-20', progress: 88, area: 120, floors: 1, units: 1, notes: 'Preostalo farbanje i montaža kuhinje', tasks: [{ name: 'Farbanje', status: 'in_progress', deadline: '2024-06-18' }, { name: 'Montaža kuhinje', status: 'pending', deadline: '2024-06-20' }] },
  { id: '5', name: 'Put Niš - Sofia, deonica 2', code: 'CS-2024-005', type: 'infrastructure', status: 'excavation', address: 'Niš - Dimitrovgrad', city: 'Niš', investor: 'Vlada RS', contractor: 'Hidrogradnja', projectManager: 'Dragan Milić', workers: 200, budget: 450000000, spent: 55000000, startDate: '2024-04-01', endDate: null, progress: 12, area: 0, floors: 0, units: 0, notes: 'Izrada trase, rušenje objekata', tasks: [{ name: 'Rušenje objekata', status: 'completed', deadline: '2024-05-30' }, { name: 'Zemljani radovi', status: 'in_progress', deadline: '2024-08-01' }, { name: 'Most preko Nišave', status: 'pending', deadline: '2024-12-01' }] },
  { id: '6', name: 'Stara škola - adaptacija', code: 'CS-2023-012', type: 'renovation', status: 'completed', address: 'Vojvode Mišića 5', city: 'Subotica', investor: 'Opština Subotica', contractor: 'SuboticaGrad', projectManager: 'Predrag Tomić', workers: 15, budget: 18000000, spent: 17200000, startDate: '2023-09-01', endDate: '2024-05-30', progress: 100, area: 1500, floors: 2, units: 8, notes: 'Projekt završen', tasks: [{ name: 'Završni radovi', status: 'completed', deadline: '2024-05-30' }] },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  planning: { color: 'bg-slate-100 text-slate-800', label: 'Planiranje' }, excavation: { color: 'bg-amber-100 text-amber-800', label: 'Kopanje' },
  foundation: { color: 'bg-orange-100 text-orange-800', label: 'Temelji' }, structural: { color: 'bg-red-100 text-red-800', label: 'Konstrukcija' },
  envelope: { color: 'bg-sky-100 text-sky-800', label: 'Obloga' }, systems: { color: 'bg-blue-100 text-blue-800', label: 'Instalacije' },
  finishing: { color: 'bg-violet-100 text-violet-800', label: 'Završni radovi' }, inspection: { color: 'bg-emerald-100 text-emerald-800', label: 'Inspekcija' },
  completed: { color: 'bg-emerald-200 text-emerald-900', label: 'Završen' }, on_hold: { color: 'bg-red-100 text-red-800', label: 'Pauziran' },
}
const TYPES: Record<string, { color: string; label: string }> = {
  residential: { color: 'bg-blue-100 text-blue-700', label: 'Stambeni' }, commercial: { color: 'bg-violet-100 text-violet-700', label: 'Poslovni' },
  industrial: { color: 'bg-amber-100 text-amber-700', label: 'Industrijski' }, infrastructure: { color: 'bg-emerald-100 text-emerald-700', label: 'Infrastruktura' },
  renovation: { color: 'bg-pink-100 text-pink-700', label: 'Renoviranje' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getTypeBadge(t: string) { const r = TYPES[t]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{t}</Badge> }
function formatCurrency(n: number) { return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K` }
function formatCurrencyFull(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(n) }

export function ConstructionSite() {
  const [data, setData] = useState<ConstructionSite[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()) || item.city.toLowerCase().includes(search.toLowerCase()) || item.investor.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  }), [data, search, statusFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => !['completed', 'on_hold'].includes(d.status)).length, completed: data.filter(d => d.status === 'completed').length,
    onHold: data.filter(d => d.status === 'on_hold').length,
    totalWorkers: data.reduce((s, d) => s + d.workers, 0), totalBudget: data.reduce((s, d) => s + d.budget, 0), totalSpent: data.reduce((s, d) => s + d.spent, 0),
    avgProgress: Math.round(data.filter(d => d.status !== 'completed').reduce((s, d) => s + d.progress, 0) / data.filter(d => d.status !== 'completed').length),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati gradilište?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><HardHat className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Gradilište</h1><p className="text-sm text-muted-foreground">Upravljanje gradilištima i projektima</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Aktivna</div><p className="text-xl font-bold text-blue-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Završena</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Pauzirana</div><p className="text-xl font-bold text-red-700">{stats.onHold}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Radnici</div><p className="text-xl font-bold">{stats.totalWorkers}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Budžet</div><p className="text-xl font-bold">{formatCurrency(stats.totalBudget)}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Potrošeno</div><p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prosek napr.</div><p className="text-xl font-bold">{stats.avgProgress}%</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Gradilišta</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sva gradilišta</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, grad..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Kod</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Grad</TableHead>
                    <TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Napredak</TableHead><TableHead className="text-xs hidden lg:table-cell">Budžet</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Radnika</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema gradilišta</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                        <TableCell className="text-xs font-mono">{item.code}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.address}</div></TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{item.city}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden md:table-cell"><div className="w-20"><div className="flex justify-between text-xs mb-0.5"><span>{item.progress}%</span></div><Progress value={item.progress} className="h-1.5" /></div></TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatCurrency(item.budget)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell"><Users className="h-3 w-3 inline mr-1" />{item.workers}</TableCell>
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
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-600" />Budžet po projektu</CardTitle></CardHeader><CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {data.map(d => <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.city}</p></div><div className="text-right"><p className="text-xs font-bold">{formatCurrencyFull(d.spent)}</p><p className="text-xs text-muted-foreground">od {formatCurrencyFull(d.budget)}</p></div></div>)}
            </CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Aktivni zadaci</CardTitle></CardHeader><CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {data.flatMap(d => d.tasks.filter(t => t.status !== 'completed').map(t => ({ ...t, site: d.name }))).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.site}</p></div><div className="flex items-center gap-2"><Badge className={`${t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'} text-xs`}>{t.status === 'in_progress' ? 'U toku' : 'Čeka'}</Badge><span className="text-xs text-muted-foreground">{formatDate(t.deadline)}</span></div></div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji gradilišta</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold">{detailItem.name}</p><p className="text-xs text-muted-foreground font-mono">{detailItem.code}</p></div><div className="flex gap-2">{getStatusBadge(detailItem.status)}{getTypeBadge(detailItem.type)}</div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Investitor</div><p className="text-xs font-medium">{detailItem.investor}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Izvođač</div><p className="text-xs font-medium">{detailItem.contractor}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Rukovodilac</div><p className="text-xs font-medium">{detailItem.projectManager}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Lokacija</div><p className="text-xs">{detailItem.city}</p><p className="text-xs text-muted-foreground">{detailItem.address}</p></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Radnika</div><p className="text-xs font-bold">{detailItem.workers}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Površina</div><p className="text-xs font-bold">{detailItem.area > 0 ? `${detailItem.area} m²` : '-'}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Spratova</div><p className="text-xs font-bold">{detailItem.floors || '-'}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Jedinica</div><p className="text-xs font-bold">{detailItem.units || '-'}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Početak</div><p className="text-xs">{formatDate(detailItem.startDate)}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Budžet</div><p className="text-sm font-bold">{formatCurrencyFull(detailItem.budget)}</p><p className="text-xs text-muted-foreground">Potrošeno: {formatCurrencyFull(detailItem.spent)}</p></div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-xs text-emerald-600 mb-1">Napredak</div><p className="text-sm font-bold text-emerald-700">{detailItem.progress}%</p><Progress value={detailItem.progress} className="h-2 mt-1" /></div>
              </div>
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
              {detailItem.tasks.length > 0 && (
                <div className="space-y-2"><p className="text-xs font-medium">Aktivni zadaci:</p>
                  {detailItem.tasks.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">{t.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : t.status === 'in_progress' ? <Clock className="h-3.5 w-3.5 text-blue-600" /> : <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />}<span className="text-xs">{t.name}</span></div>
                      <span className="text-xs text-muted-foreground">{formatDate(t.deadline)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
