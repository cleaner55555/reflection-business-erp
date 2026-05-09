'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Archive, Download, Upload, Trash2, Plus, Search, HardDrive, Clock, CheckCircle2, XCircle, AlertTriangle, Database, FolderOpen, RotateCcw, ShieldCheck, Server } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatDateTime } from '@/lib/helpers'

// ==================== TYPES ====================

interface BackupRecord {
  id: string
  name: string
  type: 'full' | 'incremental' | 'snapshot'
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled'
  size: string
  duration: string
  location: string
  createdAt: string
  expiresAt: string
  autoDelete: boolean
  encrypted: boolean
}

interface BackupSchedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  type: 'full' | 'incremental'
  retentionDays: number
  lastRun: string | null
  nextRun: string | null
  active: boolean
}

// ==================== DATA ====================

const INITIAL_BACKUPS: BackupRecord[] = [
  { id: '1', name: 'Full Backup — 15 Jun 2024', type: 'full', status: 'completed', size: '245 MB', duration: '4m 32s', location: 'Local + Cloud', createdAt: '2024-06-15T02:00:00', expiresAt: '2024-09-15T02:00:00', autoDelete: true, encrypted: true },
  { id: '2', name: 'Incremental — 14 Jun 2024', type: 'incremental', status: 'completed', size: '12 MB', duration: '0m 45s', location: 'Local', createdAt: '2024-06-14T02:00:00', expiresAt: '2024-08-14T02:00:00', autoDelete: true, encrypted: true },
  { id: '3', name: 'Full Backup — 10 Jun 2024', type: 'full', status: 'completed', size: '238 MB', duration: '4m 18s', location: 'Local + Cloud', createdAt: '2024-06-10T02:00:00', expiresAt: '2024-09-10T02:00:00', autoDelete: true, encrypted: true },
  { id: '4', name: 'Snapshot — Pre-migration', type: 'snapshot', status: 'completed', size: '231 MB', duration: '0m 12s', location: 'Local', createdAt: '2024-06-08T14:30:00', expiresAt: '2024-12-08T14:30:00', autoDelete: false, encrypted: true },
  { id: '5', name: 'Incremental — 13 Jun 2024', type: 'incremental', status: 'failed', size: '—', duration: '2m 05s', location: 'Cloud', createdAt: '2024-06-13T02:00:00', expiresAt: '2024-08-13T02:00:00', autoDelete: true, encrypted: true },
  { id: '6', name: 'Full Backup — 01 Jun 2024', type: 'full', status: 'completed', size: '220 MB', duration: '3m 55s', location: 'Local + Cloud', createdAt: '2024-06-01T02:00:00', expiresAt: '2024-09-01T02:00:00', autoDelete: true, encrypted: true },
]

const INITIAL_SCHEDULES: BackupSchedule[] = [
  { id: '1', name: 'Dnevni backup', frequency: 'daily', time: '02:00', type: 'incremental', retentionDays: 30, lastRun: '2024-06-15T02:00:00', nextRun: '2024-06-16T02:00:00', active: true },
  { id: '2', name: 'Nedeljni full backup', frequency: 'weekly', time: '03:00', type: 'full', retentionDays: 90, lastRun: '2024-06-10T02:00:00', nextRun: '2024-06-17T03:00:00', active: true },
  { id: '3', name: 'Mesečni arhivski backup', frequency: 'monthly', time: '01:00', type: 'full', retentionDays: 365, lastRun: '2024-06-01T01:00:00', nextRun: '2024-07-01T01:00:00', active: true },
]

// ==================== HELPERS ====================

function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    full: { color: 'bg-blue-100 text-blue-800', label: 'Потпуни' },
    incremental: { color: 'bg-emerald-100 text-emerald-800', label: 'Инкрементални' },
    snapshot: { color: 'bg-violet-100 text-violet-800', label: 'Снимак' },
  }
  const s = map[type] || map.full
  return <Badge className={`${s.color} text-[10px]`}>{s.label}</Badge>
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Завршено', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-800', label: 'Неуспело', icon: XCircle },
    in_progress: { color: 'bg-amber-100 text-amber-800', label: 'У току', icon: Clock },
    scheduled: { color: 'bg-slate-100 text-slate-600', label: 'Заказано', icon: Clock },
  }
  const s = map[status] || map.completed
  return <Badge className={`${s.color} gap-1 text-[10px]`}><s.icon className="h-3 w-3" />{s.label}</Badge>
}

function getFreqLabel(f: string) {
  return { daily: 'Дневно', weekly: 'Nedeljno', monthly: 'Mesečno' }[f] || f
}

// ==================== MAIN ====================

export function Backup() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [backupInProgress, setBackupInProgress] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => { setBackups(INITIAL_BACKUPS); setSchedules(INITIAL_SCHEDULES); setLoading(false) }, 300)
  }, [])

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    failed: backups.filter(b => b.status === 'failed').length,
    totalSize: '716 MB',
    lastBackup: backups.length > 0 ? formatDate(backups[0].createdAt) : '—',
    activeSchedules: schedules.filter(s => s.active).length,
  }

  const filtered = backups.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || b.type === typeFilter
    return matchSearch && matchType
  })

  const handleCreateBackup = () => {
    setBackupInProgress(true)
    toast.info('Backup započet...')
    setTimeout(() => {
      const newBackup: BackupRecord = {
        id: `bak-${Date.now()}`, name: `Manual Backup — ${new Date().toLocaleDateString('sr-RS')}`, type: 'full', status: 'completed',
        size: `${(Math.floor(Math.random() * 50) + 220)} MB`, duration: `${Math.floor(Math.random() * 3) + 3}m ${Math.floor(Math.random() * 50) + 10}s`,
        location: 'Local', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), autoDelete: true, encrypted: true
      }
      setBackups(prev => [newBackup, ...prev])
      setBackupInProgress(false)
      toast.success('Backup uspešno kreiran!')
    }, 3000)
  }

  const handleRestore = (id: string) => {
    if (!confirm('Da li ste sigurni da želite da vratite podatke iz ovog backup-a?')) return
    toast.info('Restauracija u toku...')
    setTimeout(() => toast.success('Restauracija uspešna!'), 2000)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati backup?')) return
    setBackups(prev => prev.filter(b => b.id !== id))
    toast.success('Backup obrisan')
  }

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
    toast.success('Raspored ažuriran')
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Archive className="h-6 w-6" />Бекап и рестаурација</h1><p className="text-sm text-muted-foreground">Управљање бекапима података и rasporedima</p></div>
        <Button onClick={handleCreateBackup} disabled={backupInProgress} className="gap-2">{backupInProgress ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{backupInProgress ? 'Backup u toku...' : 'Креирај бекап'}</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Database className="h-3.5 w-3.5" />Укупно</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Завршених</div><p className="text-2xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><XCircle className="h-3.5 w-3.5" />Неуспелих</div><p className="text-2xl font-bold text-red-700">{stats.failed}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><HardDrive className="h-3.5 w-3.5" />Укупна veličina</div><p className="text-lg font-bold">{stats.totalSize}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Clock className="h-3.5 w-3.5" />Poslednji</div><p className="text-sm font-bold">{stats.lastBackup}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Server className="h-3.5 w-3.5" />Aktivnih rasporeda</div><p className="text-2xl font-bold">{stats.activeSchedules}</p></Card>
      </div>

      <Tabs defaultValue="backupi" className="space-y-4">
        <TabsList><TabsTrigger value="backupi" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" />Бекапи</TabsTrigger><TabsTrigger value="raspored" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Распореди</TabsTrigger></TabsList>

        <TabsContent value="backupi">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista bckupa</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Претрага..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Сви типови</SelectItem><SelectItem value="full">Потпуни</SelectItem><SelectItem value="incremental">Инкрементални</SelectItem><SelectItem value="snapshot">Снимак</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Назив</TableHead><TableHead className="text-xs hidden sm:table-cell">Тип</TableHead><TableHead className="text-xs">Статус</TableHead><TableHead className="text-xs hidden md:table-cell">Величина</TableHead><TableHead className="text-xs hidden lg:table-cell">Локација</TableHead><TableHead className="text-xs hidden sm:table-cell">Датум</TableHead><TableHead className="text-xs text-right">Акције</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Нема бекапа</TableCell></TableRow> : filtered.map(b => (
                      <TableRow key={b.id}>
                        <TableCell><div className="flex items-center gap-2"><ShieldCheck className={`h-3.5 w-3.5 ${b.encrypted ? 'text-emerald-600' : 'text-muted-foreground'}`} /><div><p className="text-xs font-medium">{b.name}</p><p className="text-[10px] text-muted-foreground">{b.duration}{b.autoDelete ? ' · Auto-brisanje' : ''}</p></div></div></TableCell>
                        <TableCell className="hidden sm:table-cell">{getTypeBadge(b.type)}</TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono">{b.size}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{b.location}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRestore(b.id)} title="Restauriraj"><Upload className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info('Download započet...')} title="Preuzmi"><Download className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(b.id)} title="Obriši"><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raspored">
          <div className="space-y-4">
            {schedules.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><p className="text-sm font-semibold">{s.name}</p><Badge variant={s.active ? 'default' : 'secondary'} className="text-[10px]">{s.active ? 'Активан' : 'Неактиван'}</Badge></div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{getFreqLabel(s.frequency)}</span><span>·</span><span>{s.time}</span><span>·</span><span>{getTypeBadge(s.type)}</span><span>·</span><span>Zadržavanje: {s.retentionDays} дана</span>
                      </div>
                      {s.lastRun && <p className="text-[10px] text-muted-foreground">Poslednje: {formatDateTime(s.lastRun)} · Sledeće: {formatDateTime(s.nextRun!)}</p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleSchedule(s.id)}>{s.active ? 'Паузирај' : 'Активирај'}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
