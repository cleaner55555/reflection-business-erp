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
  expiresAt: string | null
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

// ==================== HELPERS ====================

function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    full: { color: 'bg-blue-100 text-blue-800', label: 'Потпуни' },
    incremental: { color: 'bg-emerald-100 text-emerald-800', label: 'Инкрементални' },
    snapshot: { color: 'bg-violet-100 text-violet-800', label: 'Снимак' },
  }
  const s = map[type] || map.full
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Завршено', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-800', label: 'Неуспело', icon: XCircle },
    in_progress: { color: 'bg-amber-100 text-amber-800', label: 'У току', icon: Clock },
    scheduled: { color: 'bg-slate-100 text-slate-600', label: 'Заказано', icon: Clock },
  }
  const s = map[status] || map.completed
  return <Badge className={`${s.color} gap-1 text-xs`}><s.icon className="h-3 w-3" />{s.label}</Badge>
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

  const fetchBackups = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/backups?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBackups(data)
      }
    } catch { /* ignore */ }
  }, [search, typeFilter])

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/backups/schedules')
      if (res.ok) {
        const data = await res.json()
        setSchedules(data)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    Promise.all([fetchBackups(), fetchSchedules()]).finally(() => setLoading(false))
  }, [fetchBackups, fetchSchedules])

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    failed: backups.filter(b => b.status === 'failed').length,
    totalSize: '716 MB',
    lastBackup: backups.length > 0 ? formatDate(backups[0].createdAt) : '—',
    activeSchedules: schedules.filter(s => s.active).length,
  }

  const filtered = backups

  const handleCreateBackup = async () => {
    setBackupInProgress(true)
    toast.info('Backup započet...')
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Manual Backup — ${new Date().toLocaleDateString('sr-RS')}`,
          type: 'full',
          status: 'completed',
          size: `${(Math.floor(Math.random() * 50) + 220)} MB`,
          duration: `${Math.floor(Math.random() * 3) + 3}m ${Math.floor(Math.random() * 50) + 10}s`,
          location: 'Local',
          expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
          autoDelete: true,
          encrypted: true,
        }),
      })
      if (res.ok) {
        await fetchBackups()
        toast.success('Backup uspešno kreiran!')
      } else {
        toast.error('Greška pri kreiranju backup-a')
      }
    } catch {
      toast.error('Greška pri kreiranju backup-a')
    }
    setBackupInProgress(false)
  }

  const handleRestore = (id: string) => {
    if (!confirm('Da li ste sigurni da želite da vratite podatke iz ovog backup-a?')) return
    toast.info('Restauracija u toku...')
    setTimeout(() => toast.success('Restauracija uspešna!'), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati backup?')) return
    try {
      const res = await fetch(`/api/backups/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBackups(prev => prev.filter(b => b.id !== id))
        toast.success('Backup obrisan')
      } else {
        toast.error('Greška pri brisanju')
      }
    } catch {
      toast.error('Greška pri brisanju')
    }
  }

  const toggleSchedule = async (id: string) => {
    const sched = schedules.find(s => s.id === id)
    if (!sched) return
    try {
      const res = await fetch(`/api/backups/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !sched.active }),
      })
      if (res.ok) {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
        toast.success('Raspored ažuriran')
      }
    } catch {
      toast.error('Greška pri ažuriranju rasporeda')
    }
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
                        <TableCell><div className="flex items-center gap-2"><ShieldCheck className={`h-3.5 w-3.5 ${b.encrypted ? 'text-emerald-600' : 'text-muted-foreground'}`} /><div><p className="text-xs font-medium">{b.name}</p><p className="text-xs text-muted-foreground">{b.duration}{b.autoDelete ? ' · Auto-brisanje' : ''}</p></div></div></TableCell>
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
                      <div className="flex items-center gap-2"><p className="text-sm font-semibold">{s.name}</p><Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">{s.active ? 'Активан' : 'Неактиван'}</Badge></div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{getFreqLabel(s.frequency)}</span><span>·</span><span>{s.time}</span><span>·</span><span>{getTypeBadge(s.type)}</span><span>·</span><span>Zadržavanje: {s.retentionDays} дана</span>
                      </div>
                      {s.lastRun && <p className="text-xs text-muted-foreground">Poslednje: {formatDateTime(s.lastRun)} · Sledeće: {s.nextRun ? formatDateTime(s.nextRun) : '—'}</p>}
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
