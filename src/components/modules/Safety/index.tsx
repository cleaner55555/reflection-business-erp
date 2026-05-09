'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, Shield, AlertTriangle, CheckCircle2, Clock, FileText, User, HardHat, CalendarDays, TrendingUp, BarChart3, Warning, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Incident {
  id: string
  number: string
  type: 'injury' | 'near_miss' | 'property_damage' | 'fire' | 'chemical' | 'environmental'
  severity: 'minor' | 'moderate' | 'serious' | 'critical'
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  location: string
  department: string
  reporterName: string
  reporterRole: string
  description: string
  date: string
  time: string
  injuredWorkers: number
  lostDays: number
  rootCause: string
  correctiveAction: string
  responsible: string
  deadline: string
}

const INITIAL_DATA: Incident[] = [
  { id: '1', number: 'SFT-2024-001', type: 'injury', severity: 'moderate', status: 'investigating', location: 'Montažna hala 3', department: 'Proizvodnja', reporterName: 'Nenad Popović', reporterRole: 'Operater', description: 'Radnik pao sa lestve visine 2.5m prilikom montaže rasvete. Povreda leve ruke - sumnja na lom', date: '2024-06-14', time: '10:30', injuredWorkers: 1, lostDays: 5, rootCause: 'Lestva nije bila osigurana', correctiveAction: 'Obavezna inspekcija opreme pre svake upotrebe', responsible: 'Milan Đorđević', deadline: '2024-06-20' },
  { id: '2', number: 'SFT-2024-002', type: 'near_miss', severity: 'serious', status: 'resolved', location: 'Skladište B', department: 'Logistika', reporterName: 'Jelena Marković', reporterRole: 'Viljuškarista', description: 'Regal sa teškom robom skoro pao - zakačio ga viljuškar. Regal je podrhtavao.', date: '2024-06-13', time: '14:15', injuredWorkers: 0, lostDays: 0, rootCause: 'Regal preopterećen - limit 500kg, bilo 800kg', correctiveAction: 'Ograničenje kapaciteta regala, oznake sa max. težinom', responsible: 'Goran Stanković', deadline: '2024-06-18' },
  { id: '3', number: 'SFT-2024-003', type: 'chemical', severity: 'minor', status: 'closed', location: 'Laboratorija QC', department: 'Kvalitet', reporterName: 'Ivana Petrović', reporterRole: 'Laborant', description: 'Manje prosipanje hemikalije (acetona) - nema povreda ali je neophodna ventilacija', date: '2024-06-12', time: '09:45', injuredWorkers: 0, lostDays: 0, rootCause: 'Nepravilno rukovanje hemikalijom - nedostajale rukavice', correctiveAction: 'Dodatna obuka za rukovanje hemikalijama', responsible: 'Sana Marković', deadline: '2024-06-15' },
  { id: '4', number: 'SFT-2024-004', type: 'property_damage', severity: 'minor', status: 'closed', location: 'Parking zaposlenih', department: 'Administracija', reporterName: 'Predrag Tomić', reporterRole: 'Vozač', description: 'Oštećenje vozila firme - ogrebotina na desnom braniku', date: '2024-06-10', time: '16:00', injuredWorkers: 0, lostDays: 0, rootCause: 'Usko parking mesto', correctiveAction: 'Oznake i ograničenja brzine na parkingu', responsible: 'Dragan Milić', deadline: '2024-06-20' },
  { id: '5', number: 'SFT-2024-005', type: 'injury', severity: 'serious', status: 'reported', location: 'Proizvodna linija 2', department: 'Proizvodnja', reporterName: 'Slobodan Nikolić', reporterRole: 'Majstor', description: 'Radnik uklještio prste u presi - amputacija vrha kažiprsta desne ruke', date: '2024-06-15', time: '08:20', injuredWorkers: 1, lostDays: 15, rootCause: '', correctiveAction: '', responsible: '', deadline: '' },
  { id: '6', number: 'SFT-2024-006', type: 'fire', severity: 'critical', status: 'investigating', location: 'Kuhinja', department: 'Ugostiteljstvo', reporterName: 'Mladen Jovanović', reporterRole: 'Kuvar', description: 'Požar na štednjaku - brzo ugašen ali oštećena oprema za 150.000 RSD', date: '2024-06-14', time: '12:30', injuredWorkers: 0, lostDays: 0, rootCause: 'Masnoća na štednjiku - zapalila se', correctiveAction: 'Redovno čišćenje štednjaka, protivpožarna obuka', responsible: 'Mladen Jovanović', deadline: '2024-06-21' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  reported: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Prijavljen' },
  investigating: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Ispitivanje' },
  resolved: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Rešeno' },
  closed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Zatvoreno' },
}

const SEVERITIES: Record<string, { color: string; label: string }> = {
  minor: { color: 'bg-green-100 text-green-700', label: 'Lako' },
  moderate: { color: 'bg-amber-100 text-amber-700', label: 'Umjereno' },
  serious: { color: 'bg-red-100 text-red-700', label: 'Ozbiljno' },
  critical: { color: 'bg-red-200 text-red-800', label: 'Kritično' },
}

const TYPES: Record<string, { label: string }> = { injury: { label: 'Povreda' }, near_miss: { label: 'Incident' }, property_damage: { label: 'Šteta' }, fire: { label: 'Požar' }, chemical: { label: 'Hemikalija' }, environmental: { label: 'Ekološki' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getSeverityBadge(s: string) { const r = SEVERITIES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function Safety() {
  const [data, setData] = useState<Incident[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.number.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()) || item.reporterName.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchSeverity = !severityFilter || item.severity === severityFilter
    return matchSearch && matchStatus && matchSeverity
  }), [data, search, statusFilter, severityFilter])

  const stats = useMemo(() => ({
    total: data.length, reported: data.filter(d => d.status === 'reported').length, investigating: data.filter(d => d.status === 'investigating').length,
    resolved: data.filter(d => d.status === 'resolved').length, closed: data.filter(d => d.status === 'closed').length,
    injuries: data.filter(d => d.type === 'injury').length, totalLostDays: data.reduce((s, d) => s + d.lostDays, 0),
    critical: data.filter(d => d.severity === 'critical' || d.severity === 'serious').length,
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><Shield className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Zaštita na radu</h1><p className="text-sm text-muted-foreground">Prijava i praćenje incidenta</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Prijavljeni</div><p className="text-xl font-bold text-slate-700">{stats.reported}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">Ispitivanje</div><p className="text-xl font-bold text-amber-700">{stats.investigating}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Rešeni</div><p className="text-xl font-bold text-emerald-700">{stats.resolved}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Povrede</div><p className="text-xl font-bold text-red-700">{stats.injuries}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Kritični</div><p className="text-xl font-bold text-red-700">{stats.critical}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Izgubljeni dani</div><p className="text-xl font-bold">{stats.totalLostDays}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Zatvoreno</div><p className="text-xl font-bold">{stats.closed}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Incidenti</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Opis, lokacija..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={severityFilter || 'all'} onValueChange={v => setSeverityFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(SEVERITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Broj</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs hidden sm:table-cell">Lokacija</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Opis</TableHead><TableHead className="text-xs">Ozbiljnost</TableHead><TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema incidenta</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-mono">{item.number}</TableCell>
                    <TableCell className="text-xs">{TYPES[item.type]?.label}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell"><div>{item.location}</div><div className="text-[10px] text-muted-foreground">{item.department}</div></TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{item.description}</TableCell>
                    <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.date)}</TableCell>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji incidenta</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.number}</p><p className="text-xs text-muted-foreground">{TYPES[detailItem.type]?.label} · {detailItem.department}</p></div><div className="flex gap-2">{getSeverityBadge(detailItem.severity)}{getStatusBadge(detailItem.status)}</div></div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium">{detailItem.description}</p><p className="text-[10px] text-muted-foreground mt-1">{detailItem.location} · {formatDate(detailItem.date)} {detailItem.time}</p></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Prijavio</div><p className="text-xs font-medium">{detailItem.reporterName}</p><p className="text-[10px] text-muted-foreground">{detailItem.reporterRole}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Povrede</div><p className="text-xs font-bold">{detailItem.injuredWorkers}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Izgubljeni dani</div><p className="text-xs font-bold">{detailItem.lostDays}</p></div>
              </div>
              {detailItem.rootCause && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Koreni uzrok</p><p className="text-xs">{detailItem.rootCause}</p></div>}
              {detailItem.correctiveAction && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-[10px] text-emerald-600 mb-1">Korektivna mera</p><p className="text-xs">{detailItem.correctiveAction}</p><p className="text-[10px] text-muted-foreground mt-1">Odgovoran: {detailItem.responsible} · Rok: {detailItem.deadline ? formatDate(detailItem.deadline) : 'N/A'}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
