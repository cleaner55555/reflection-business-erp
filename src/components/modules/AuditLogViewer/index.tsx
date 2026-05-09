'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  History,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Activity,
  FileEdit,
  PlusCircle,
  Trash,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { formatDate } from '@/lib/helpers'

// ============ TYPES ============

interface AuditLog {
  id: string
  companyId: string
  userId?: string | null
  userName: string
  entity: string
  entityId?: string | null
  action: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

interface AuditStats {
  total: number
  recentHour: number
  today: number
  byAction: Array<{ action: string; _count: number }>
  byEntity: Array<{ entity: string; _count: number }>
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: PlusCircle,
  update: FileEdit,
  delete: Trash,
  login: Activity,
  logout: Activity,
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  update: 'bg-amber-100 text-amber-700 border-amber-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  login: 'bg-sky-100 text-sky-700 border-sky-200',
  logout: 'bg-slate-100 text-slate-600 border-slate-200',
  read: 'bg-violet-100 text-violet-700 border-violet-200',
  export: 'bg-teal-100 text-teal-700 border-teal-200',
  import: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

const ENTITY_LABELS: Record<string, string> = {
  invoice: 'Faktura',
  partner: 'Partner',
  product: 'Proizvod',
  journal_entry: 'Nalog knjiženja',
  account: 'Konto',
  employee: 'Zaposleni',
  payroll: 'Plata',
  project: 'Projekat',
  task: 'Zadatak',
  deal: 'Poslovna prilika',
  contact: 'Kontakt',
  stock_movement: 'Kretanje zaliha',
  purchase_order: 'Narudžbenica',
  delivery_note: 'Otpremnica',
  crm_activity: 'CRM aktivnost',
  user: 'Korisnik',
  role: 'Uloga',
  company: 'Kompanija',
  budget: 'Budžet',
  asset: 'Osnovno sredstvo',
  document: 'Dokument',
  webhook: 'Webhook',
  api_key: 'API ključ',
  settings: 'Podešavanja',
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Kreiranje',
  update: 'Izmena',
  delete: 'Brisanje',
  read: 'Čitanje',
  login: 'Prijava',
  logout: 'Odjava',
  export: 'Izvoz',
  import: 'Uvoz',
  approve: 'Odobrenje',
  reject: 'Odbijanje',
  close: 'Zatvaranje',
  send: 'Slanje',
  reconcile: 'Usklađivanje',
}

// ============ MAIN COMPONENT ============

export function AuditLogViewer() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [clearing, setClearing] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const pageSize = 50

  const fetchLogs = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('companyId', activeCompanyId)
      if (entityFilter) params.set('entity', entityFilter)
      if (actionFilter) params.set('action', actionFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setStats(data.stats || null)
    } catch {
      toast.error('Greška pri učitavanju audit logova')
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId, entityFilter, actionFilter, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])
  useEffect(() => { setPage(0) }, [entityFilter, actionFilter, dateFrom, dateTo])

  // Filter logs by search
  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.entity?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      (ENTITY_LABELS[log.entity] || '').toLowerCase().includes(q) ||
      (ACTION_LABELS[log.action] || '').toLowerCase().includes(q)
    )
  })

  // Paginate
  const paginatedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filteredLogs.length / pageSize)

  // Clear old logs
  const handleClear = async () => {
    if (!activeCompanyId) return
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    if (!confirm('Obrisati sve logove starije od 3 meseca?')) return

    setClearing(true)
    try {
      const res = await fetch(
        `/api/audit-logs?companyId=${activeCompanyId}&before=${threeMonthsAgo.toISOString().split('T')[0]}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      toast.success(`Obrisano ${data.deleted || 0} starih logova`)
      fetchLogs()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setClearing(false)
    }
  }

  // Export CSV
  const handleExport = () => {
    const headers = ['Datum', 'Korisnik', 'Entitet', 'Akcija', 'Detalji', 'IP adresa']
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString('sr-Latn'),
      log.userName,
      ENTITY_LABELS[log.entity] || log.entity,
      ACTION_LABELS[log.action] || log.action,
      log.details || '',
      log.ipAddress || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV izvezen')
  }

  // Get unique entities and actions from stats
  const entities = stats?.byEntity?.map((e) => e.entity) || []
  const actions = stats?.byAction?.map((a) => a.action) || []

  const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || FileEdit
    return <Icon className="h-3.5 w-3.5" />
  }

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Upravo sada'
    if (diffMins < 60) return `Pre ${diffMins} min`
    if (diffHours < 24) return `Pre ${diffHours} h`
    if (diffDays < 7) return `Pre ${diffDays} d`
    return formatDate(dateStr)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Audit Log
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Praćenje svih aktivnosti korisnika u sistemu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={handleClear} disabled={clearing}>
            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Čisti stare
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <History className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ukupno</p>
                  <p className="text-base font-bold">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Danas</p>
                  <p className="text-base font-bold">{stats.today.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Poslednjih sat</p>
                  <p className="text-base font-bold">{stats.recentHour.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-50">
                  <Filter className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Filtrirano</p>
                  <p className="text-base font-bold">{filteredLogs.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži logove..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={entityFilter || 'all'} onValueChange={(v) => setEntityFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Svi entiteti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi entiteti</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e} value={e}>{ENTITY_LABELS[e] || e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter || 'all'} onValueChange={(v) => setActionFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Sve akcije" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve akcije</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{ACTION_LABELS[a] || a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-[130px] h-9" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" className="w-[130px] h-9" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {(entityFilter || actionFilter || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" className="h-9 gap-1" onClick={() => {
                setEntityFilter('')
                setActionFilter('')
                setDateFrom('')
                setDateTo('')
                setSearch('')
              }}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground">Nema logova</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {search || entityFilter || actionFilter
                  ? 'Pokušajte da promenite filtere'
                  : 'Aktivnosti korisnika će se pojaviti ovde'}
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-[50px]" />
                      <TableHead className="text-xs w-[130px]">Vreme</TableHead>
                      <TableHead className="text-xs w-[120px]">Korisnik</TableHead>
                      <TableHead className="text-xs w-[100px]">Entitet</TableHead>
                      <TableHead className="text-xs w-[90px]">Akcija</TableHead>
                      <TableHead className="text-xs">Detalji</TableHead>
                      <TableHead className="text-xs w-[100px]">IP adresa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                        <TableCell className="py-2">
                          <div className={`p-1.5 rounded-md border ${getActionColor(log.action)} inline-flex`}>
                            {getActionIcon(log.action)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          <div className="font-medium">{formatTime(log.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleTimeString('sr-Latn', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.userId ? log.userId.slice(0, 8) + '...' : 'Sistem'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs font-normal">
                            {ENTITY_LABELS[log.entity] || log.entity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="secondary" className={`text-xs ${getActionColor(log.action)}`}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[250px] truncate text-muted-foreground">
                          {log.details || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {log.ipAddress || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Prikaz {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredLogs.length)} od {filteredLogs.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Prethodna
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(0, Math.min(page - 2, totalPages - 5))
                      const p = start + i
                      if (p >= totalPages) return null
                      return (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 w-8 text-xs"
                          onClick={() => setPage(p)}
                        >
                          {p + 1}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Sledeća
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Top entities and actions */}
      {stats && (stats.byEntity.length > 0 || stats.byAction.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Top entities */}
          {stats.byEntity.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">Najaktivniji entiteti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byEntity.slice(0, 8).map((item, i) => {
                    const maxCount = stats.byEntity[0]?._count || 1
                    return (
                      <div key={item.entity} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-xs flex-1">{ENTITY_LABELS[item.entity] || item.entity}</span>
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item._count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">{item._count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top actions */}
          {stats.byAction.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">Najčešće akcije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byAction.slice(0, 8).map((item, i) => {
                    const maxCount = stats.byAction[0]?._count || 1
                    return (
                      <div key={item.action} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-xs flex-1">{ACTION_LABELS[item.action] || item.action}</span>
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item._count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">{item._count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
