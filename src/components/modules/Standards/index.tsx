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
import { Plus, Search, Trash2, Pencil, Eye, FileCheck, Award, AlertTriangle, CheckCircle2, Clock, CalendarDays, BookOpen, Target, ListChecks, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Standard {
  id: string
  code: string
  name: string
  category: 'iso' | 'ce' | 'haccp' | 'gmp' | 'ohsas' | 'other'
  status: 'active' | 'expiring' | 'expired' | 'in_progress' | 'draft'
  version: string
  issuingBody: string
  scope: string
  validFrom: string
  validUntil: string
  auditor: string
  lastAudit: string | null
  nextAudit: string | null
  compliance: number
  findings: { id: string; type: 'major' | 'minor' | 'observation'; description: string; status: 'open' | 'in_progress' | 'closed'; deadline: string }[]
  notes: string
}

const INITIAL_DATA: Standard[] = [
  { id: '1', code: 'ISO 9001:2015', name: 'Sistem upravljanja kvalitetom', category: 'iso', status: 'active', version: '2015', issuingBody: 'ISO', scope: 'Svi procesi kompanije', validFrom: '2022-03-01', validUntil: '2025-03-01', auditor: 'Bureau Veritas', lastAudit: '2024-03-15', nextAudit: '2025-03-15', compliance: 92, notes: '3 minor nalaza iz zadnjeg audita', findings: [
    { id: 'f1', type: 'minor', description: 'Nedostaju zapisnici o obuci za nove radnike', status: 'in_progress', deadline: '2024-07-01' },
    { id: 'f2', type: 'minor', description: 'Kontrola dokumenata - zastarela verzija SOP-12', status: 'open', deadline: '2024-06-30' },
    { id: 'f3', type: 'observation', description: 'Predloženo unapređenje softvera za praćenje', status: 'open', deadline: '2024-12-01' },
  ] },
  { id: '2', code: 'ISO 14001:2015', name: 'Sistem upravljanja životnom sredinom', category: 'iso', status: 'active', version: '2015', issuingBody: 'ISO', scope: 'Proizvodnja i logistika', validFrom: '2023-01-15', validUntil: '2026-01-15', auditor: 'SGS', lastAudit: '2024-01-20', nextAudit: '2025-01-20', compliance: 88, notes: '', findings: [
    { id: 'f4', type: 'minor', description: 'Nedostaju dnevne kontrole emisija', status: 'closed', deadline: '2024-04-01' },
    { id: 'f5', type: 'observation', description: 'Edukacija o reciklaži otpada', status: 'in_progress', deadline: '2024-08-01' },
  ] },
  { id: '3', code: 'CE', name: 'CE oznaka - proizvodi', category: 'ce', status: 'active', version: '2024', issuingBody: 'EU', scope: 'Elektronski proizvodi', validFrom: '2024-01-01', validUntil: '2027-01-01', auditor: 'TÜV Rheinland', lastAudit: '2024-02-10', nextAudit: '2025-02-10', compliance: 100, notes: 'Svi proizvodi u skladu', findings: [] },
  { id: '4', code: 'HACCP', name: 'Analiza hazarda i kritične kontrolne tačke', category: 'haccp', status: 'expiring', version: 'v3.2', issuingBody: 'Ministarstvo poljoprivrede', scope: 'Proizvodnja hrane', validFrom: '2021-06-01', validUntil: '2024-07-01', auditor: 'Državni inspektorat', lastAudit: '2023-06-15', nextAudit: '2024-06-30', compliance: 85, notes: 'Upozorenje - certifikat uskoro ističe! Obavezna recertifikacija.', findings: [
    { id: 'f6', type: 'major', description: 'Hladnjača broj 3 - temperatura iznad dozvoljene', status: 'in_progress', deadline: '2024-06-20' },
    { id: 'f7', type: 'minor', description: 'Nedostaju PCR zapisi za maj 2024', status: 'open', deadline: '2024-06-25' },
  ] },
  { id: '5', code: 'ISO 45001:2018', name: 'Sistem upravljanja zaštitom na radu', category: 'iso', status: 'in_progress', version: '2018', issuingBody: 'ISO', scope: 'Svi radnici', validFrom: '', validUntil: '', auditor: 'Bureau Veritas', lastAudit: null, nextAudit: '2024-09-01', compliance: 65, notes: 'Priprema za inicijalnu sertifikaciju', findings: [
    { id: 'f8', type: 'major', description: 'Nedostaje procena rizika za proizvodnu liniju 2', status: 'in_progress', deadline: '2024-07-15' },
    { id: 'f9', type: 'minor', description: 'Evidencija PPE nije ažurirana', status: 'open', deadline: '2024-07-01' },
  ] },
  { id: '6', code: 'ISO 27001:2022', name: 'Informaciona bezbednost', category: 'iso', status: 'draft', version: '2022', issuingBody: 'ISO', scope: 'IT infrastruktura', validFrom: '', validUntil: '', auditor: '', lastAudit: null, nextAudit: null, compliance: 30, notes: 'Ranoj fazi implementacije', findings: [] },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' }, expiring: { color: 'bg-amber-100 text-amber-800', label: 'Ističe' },
  expired: { color: 'bg-red-100 text-red-800', label: 'Istekao' }, in_progress: { color: 'bg-blue-100 text-blue-800', label: 'U implementaciji' }, draft: { color: 'bg-slate-100 text-slate-800', label: 'Priprema' },
}
const CATEGORIES: Record<string, { color: string; label: string }> = {
  iso: { color: 'bg-blue-100 text-blue-700', label: 'ISO' }, ce: { color: 'bg-violet-100 text-violet-700', label: 'CE' },
  haccp: { color: 'bg-orange-100 text-orange-700', label: 'HACCP' }, gmp: { color: 'bg-emerald-100 text-emerald-700', label: 'GMP' },
  ohsas: { color: 'bg-amber-100 text-amber-700', label: 'OHSAS' }, other: { color: 'bg-slate-100 text-slate-700', label: 'Ostalo' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getCategoryBadge(c: string) { const r = CATEGORIES[c]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{c}</Badge> }

export function Standards() {
  const [data, setData] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/standards')
      const items = await res.json()
      setData(items.map((s: Record<string, unknown>) => ({
        ...s,
        validFrom: s.validFrom ? new Date(s.validFrom as string).toISOString().split('T')[0] : '',
        validUntil: s.validUntil ? new Date(s.validUntil as string).toISOString().split('T')[0] : '',
        lastAudit: s.lastAudit ? new Date(s.lastAudit as string).toISOString().split('T')[0] : null,
        nextAudit: s.nextAudit ? new Date(s.nextAudit as string).toISOString().split('T')[0] : null,
        findings: typeof s.findings === 'string' ? JSON.parse(s.findings) : (s.findings || []),
      })) as Standard[])
    } catch { toast.error('Greška pri učitavanju') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  }), [data, search, statusFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => d.status === 'active').length, expiring: data.filter(d => d.status === 'expiring').length,
    inProgress: data.filter(d => d.status === 'in_progress').length, avgCompliance: Math.round(data.reduce((s, d) => s + d.compliance, 0) / data.length),
    openFindings: data.reduce((s, d) => s + d.findings.filter(f => f.status !== 'closed').length, 0), majorFindings: data.reduce((s, d) => s + d.findings.filter(f => f.type === 'major' && f.status !== 'closed').length, 0),
  }), [data])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati?')) return
    try {
      await fetch(`/api/standards/${id}`, { method: 'DELETE' })
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Obrisano')
    } catch { toast.error('Greška pri brisanju') }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Award className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Standardi kvaliteta</h1><p className="text-sm text-muted-foreground">Upravljanje sertifikatima i usklađenost</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivni</div><p className="text-xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Ističu</div><p className="text-xl font-bold text-amber-700">{stats.expiring}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U implement.</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Usklađenost</div><p className="text-xl font-bold">{stats.avgCompliance}%</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Otvoreni nalazi</div><p className="text-xl font-bold text-red-700">{stats.openFindings}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Major</div><p className="text-xl font-bold text-red-700">{stats.majorFindings}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Svi standardi</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="ISO, CE..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Standard</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs">Kategorija</TableHead><TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Usklađ.</TableHead><TableHead className="text-xs hidden md:table-cell">Auditor</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Sledeći audit</TableHead><TableHead className="text-xs hidden lg:table-cell">Nalazi</TableHead>
                <TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema standarda</TableCell></TableRow> : filtered.map(item => {
                  const openF = item.findings.filter(f => f.status !== 'closed').length
                  return (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                      <TableCell className="text-xs font-mono font-bold">{item.code}</TableCell>
                      <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.scope}</div></TableCell>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><div className={`w-10 h-1.5 rounded-full ${item.compliance >= 90 ? 'bg-emerald-500' : item.compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${item.compliance}%` }} /><span className="text-xs">{item.compliance}%</span></div></TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{item.auditor || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.nextAudit ? formatDate(item.nextAudit) : '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{openF > 0 ? <Badge className="bg-red-100 text-red-700 text-xs">{openF}</Badge> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}</TableCell>
                      <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji standarda</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold">{detailItem.code}</p><p className="text-xs text-muted-foreground">{detailItem.name}</p></div><div className="flex gap-2">{getCategoryBadge(detailItem.category)}{getStatusBadge(detailItem.status)}</div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Verzija</div><p className="text-xs font-medium">{detailItem.version}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Izdavalac</div><p className="text-xs font-medium">{detailItem.issuingBody}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Važi od</div><p className="text-xs">{detailItem.validFrom ? formatDate(detailItem.validFrom) : '-'}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Važi do</div><p className="text-xs">{detailItem.validUntil ? formatDate(detailItem.validUntil) : '-'}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Opseg</div><p className="text-xs">{detailItem.scope}</p><p className="text-xs text-muted-foreground mt-1">Auditor: {detailItem.auditor || 'Nije dodeljen'} · Zadnji: {detailItem.lastAudit ? formatDate(detailItem.lastAudit) : 'N/A'} · Sledeći: {detailItem.nextAudit ? formatDate(detailItem.nextAudit) : 'N/A'}</p></div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="flex justify-between items-center"><span className="text-xs text-emerald-600">Nivo usklađenosti</span><span className="text-lg font-bold text-emerald-700">{detailItem.compliance}%</span></div></div>
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-xs text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
              {detailItem.findings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Nalazi audita:</p>
                  {detailItem.findings.map(f => (
                    <div key={f.id} className="p-2 rounded-lg border space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Badge className={`${f.type === 'major' ? 'bg-red-100 text-red-700' : f.type === 'minor' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'} text-xs`}>{f.type}</Badge><Badge className={`${f.status === 'open' ? 'bg-red-100 text-red-600' : f.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'} text-xs`}>{f.status === 'open' ? 'Otvoren' : f.status === 'in_progress' ? 'U toku' : 'Zatvoren'}</Badge></div>
                        <span className="text-xs text-muted-foreground">{f.deadline ? formatDate(f.deadline) : ''}</span>
                      </div>
                      <p className="text-xs">{f.description}</p>
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
