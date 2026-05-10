'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, Shield, AlertTriangle, CheckCircle2, Clock, FileText, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

interface SafetyIncident {
  id: string
  number: string
  type: string
  severity: string
  status: string
  location: string
  department: string
  reporterName: string
  reporterRole: string
  description: string
  incidentDate: string
  incidentTime: string
  injuredWorkers: number
  lostDays: number
  rootCause: string
  correctiveAction: string
  responsible: string
  deadline: string
  createdAt: string
  updatedAt: string
}

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

const TYPES: Record<string, { label: string }> = {
  injury: { label: 'Povreda' },
  near_miss: { label: 'Incident' },
  property_damage: { label: 'Šteta' },
  fire: { label: 'Požar' },
  chemical: { label: 'Hemikalija' },
  environmental: { label: 'Ekološki' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}
function getSeverityBadge(s: string) {
  const r = SEVERITIES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function Safety() {
  const [data, setData] = useState<SafetyIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<SafetyIncident | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (severityFilter) params.set('severity', severityFilter)
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/safety?${params.toString()}`)
      const items = await res.json()
      setData(items)
    } catch { toast.error('Greška pri učitavanju') }
    setLoading(false)
  }, [search, statusFilter, severityFilter, typeFilter])

  useEffect(() => { fetchIncidents() }, [fetchIncidents])

  const filtered = useMemo(() => data, [data])

  const stats = useMemo(() => ({
    total: data.length,
    reported: data.filter(d => d.status === 'reported').length,
    investigating: data.filter(d => d.status === 'investigating').length,
    resolved: data.filter(d => d.status === 'resolved').length,
    closed: data.filter(d => d.status === 'closed').length,
    injuries: data.filter(d => d.type === 'injury').length,
    totalLostDays: data.reduce((s, d) => s + d.lostDays, 0),
    critical: data.filter(d => d.severity === 'critical' || d.severity === 'serious').length,
  }), [data])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati incident?')) return
    try {
      const res = await fetch(`/api/safety/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error); return }
      toast.success('Incident obrisan')
      fetchIncidents()
    } catch { toast.error('Greška') }
  }

  const handleCreateOpen = () => {
    setEditItem(null)
    setCreateOpen(true)
  }

  const handleEdit = (item: SafetyIncident) => {
    setEditItem(item)
    setCreateOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      const body = {
        type: fd.get('type') as string,
        severity: fd.get('severity') as string,
        status: fd.get('status') as string,
        location: fd.get('location') as string,
        department: fd.get('department') as string,
        reporterName: fd.get('reporterName') as string,
        reporterRole: fd.get('reporterRole') as string,
        description: fd.get('description') as string,
        incidentDate: fd.get('incidentDate') as string,
        incidentTime: fd.get('incidentTime') as string,
        injuredWorkers: Number(fd.get('injuredWorkers')) || 0,
        lostDays: Number(fd.get('lostDays')) || 0,
        rootCause: fd.get('rootCause') as string,
        correctiveAction: fd.get('correctiveAction') as string,
        responsible: fd.get('responsible') as string,
        deadline: fd.get('deadline') as string,
      }

      if (!body.description || !body.location || !body.reporterName) {
        toast.error('Popunite obavezna polja: opis, lokacija, prijavio')
        setSubmitting(false)
        return
      }

      const isEditing = !!editItem
      const url = isEditing ? `/api/safety/${editItem.id}` : '/api/safety'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error); return }
      toast.success(isEditing ? 'Incident ažuriran' : 'Incident kreiran')
      setCreateOpen(false)
      setEditItem(null)
      fetchIncidents()
    } catch { toast.error('Greška') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><Shield className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Zaštita na radu</h1>
            <p className="text-sm text-muted-foreground">Prijava i praćenje incidenata</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleCreateOpen}>
          <Plus className="h-4 w-4" /> Novi incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Ukupno</div>
          <p className="text-xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-600 mb-1">Prijavljeni</div>
          <p className="text-xl font-bold text-slate-700">{stats.reported}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-amber-600 mb-1">Ispitivanje</div>
          <p className="text-xl font-bold text-amber-700">{stats.investigating}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-emerald-600 mb-1">Rešeni</div>
          <p className="text-xl font-bold text-emerald-700">{stats.resolved}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-red-600 mb-1">Povrede</div>
          <p className="text-xl font-bold text-red-700">{stats.injuries}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-red-600 mb-1">Kritični</div>
          <p className="text-xl font-bold text-red-700">{stats.critical}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Izgubljeni dani</div>
          <p className="text-xl font-bold">{stats.totalLostDays}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Zatvoreno</div>
          <p className="text-xl font-bold">{stats.closed}</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Incidenti</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Opis, lokacija..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={severityFilter || 'all'} onValueChange={v => setSeverityFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi</SelectItem>
                  {Object.entries(SEVERITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Broj</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Lokacija</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Opis</TableHead>
                  <TableHead className="text-xs">Ozbiljnost</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Datum</TableHead>
                  <TableHead className="text-xs text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema incidenata</TableCell></TableRow>
                ) : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell className="text-xs font-mono">{item.number}</TableCell>
                    <TableCell className="text-xs">{TYPES[item.type]?.label || item.type}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">
                      <div>{item.location}</div>
                      <div className="text-xs text-muted-foreground">{item.department}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{item.description}</TableCell>
                    <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.incidentDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail View */}
      {!!detailId && (
        <Card className="max-w-3xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle>Detalji incidenta</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[85vh] overflow-y-auto">
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold font-mono">{detailItem.number}</p>
                  <p className="text-xs text-muted-foreground">{TYPES[detailItem.type]?.label || detailItem.type} · {detailItem.department}</p>
                </div>
                <div className="flex gap-2">{getSeverityBadge(detailItem.severity)}{getStatusBadge(detailItem.status)}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{detailItem.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{detailItem.location} · {formatDate(detailItem.incidentDate)} {detailItem.incidentTime}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Prijavio</div>
                  <p className="text-sm font-medium">{detailItem.reporterName}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.reporterRole}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Povrede</div>
                  <p className="text-sm font-bold">{detailItem.injuredWorkers}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Izgubljeni dani</div>
                  <p className="text-sm font-bold">{detailItem.lostDays}</p>
                </div>
              </div>
              {detailItem.rootCause && (
                <div className="p-3 rounded-lg bg-amber-50">
                  <p className="text-xs font-medium text-amber-600 mb-1">Koreni uzrok</p>
                  <p className="text-sm">{detailItem.rootCause}</p>
                </div>
              )}
              {detailItem.correctiveAction && (
                <div className="p-3 rounded-lg bg-emerald-50">
                  <p className="text-xs font-medium text-emerald-600 mb-1">Korektivna mera</p>
                  <p className="text-sm">{detailItem.correctiveAction}</p>
                  <p className="text-xs text-muted-foreground mt-1">Odgovoran: {detailItem.responsible} · Rok: {detailItem.deadline ? formatDate(detailItem.deadline) : 'N/A'}</p>
                </div>
              )}
            </div>
          )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {createOpen && (
        <Card className="max-w-3xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(null); setCreateOpen(false) }}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle>{editItem ? 'Uredi incident' : 'Novi incident'}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tip *</Label>
                <Select name="type" defaultValue={editItem?.type || 'injury'}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ozbiljnost *</Label>
                <Select name="severity" defaultValue={editItem?.severity || 'moderate'}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select name="status" defaultValue={editItem?.status || 'reported'}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Datum *</Label>
                <Input name="incidentDate" type="date" defaultValue={editItem?.incidentDate?.split('T')[0] || new Date().toISOString().split('T')[0]} className="text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vreme</Label>
              <Input name="incidentTime" placeholder="10:30" defaultValue={editItem?.incidentTime || ''} className="text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Lokacija *</Label>
                <Input name="location" defaultValue={editItem?.location || ''} placeholder="npr. Montažna hala 3" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Odeljenje</Label>
                <Input name="department" defaultValue={editItem?.department || ''} placeholder="npr. Proizvodnja" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Prijavio *</Label>
                <Input name="reporterName" defaultValue={editItem?.reporterName || ''} placeholder="Ime i prezime" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pozicija</Label>
                <Input name="reporterRole" defaultValue={editItem?.reporterRole || ''} placeholder="npr. Operater" className="text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Opis incidenta *</Label>
              <Textarea name="description" defaultValue={editItem?.description || ''} placeholder="Detaljan opis incidenta..." rows={3} className="text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Povređeni</Label>
                <Input name="injuredWorkers" type="number" min={0} defaultValue={String(editItem?.injuredWorkers || 0)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Izgubljeni dani</Label>
                <Input name="lostDays" type="number" min={0} defaultValue={String(editItem?.lostDays || 0)} className="text-sm" />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-semibold">Istraga</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Koreni uzrok</Label>
                <Textarea name="rootCause" defaultValue={editItem?.rootCause || ''} placeholder="Uzrok incidenta..." rows={2} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Korektivna mera</Label>
                <Textarea name="correctiveAction" defaultValue={editItem?.correctiveAction || ''} placeholder="Preduzete mera..." rows={2} className="text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Odgovoran</Label>
                  <Input name="responsible" defaultValue={editItem?.responsible || ''} placeholder="Ime i prezime" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Rok za rešavanje</Label>
                  <Input name="deadline" type="date" defaultValue={editItem?.deadline?.split('T')[0] || ''} className="text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Čuvanje...' : editItem ? 'Sačuvaj izmene' : 'Kreiraj incident'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditItem(null) }}>
                Otkaži
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
