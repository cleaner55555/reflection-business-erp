'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Archive, Download, Upload, Trash2, HardDrive, Clock, CheckCircle2, XCircle, Database, FolderOpen, ShieldCheck, Server, Search } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/helpers'
import type { BackupRecord, BackupSchedule } from './types'

// ==================== HELPERS ====================

export function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    full: { color: 'bg-blue-100 text-blue-800', label: 'Потпуни' },
    incremental: { color: 'bg-emerald-100 text-emerald-800', label: 'Инкрементални' },
    snapshot: { color: 'bg-violet-100 text-violet-800', label: 'Снимак' },
  }
  const s = map[type] || map.full
  return <Badge className={`${s.color} text-[10px]`}>{s.label}</Badge>
}

export function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Завршено', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-800', label: 'Неуспело', icon: XCircle },
    in_progress: { color: 'bg-amber-100 text-amber-800', label: 'У току', icon: Clock },
    scheduled: { color: 'bg-slate-100 text-slate-600', label: 'Заказано', icon: Clock },
  }
  const s = map[status] || map.completed
  return <Badge className={`${s.color} gap-1 text-[10px]`}><s.icon className="h-3 w-3" />{s.label}</Badge>
}

export function getFreqLabel(f: string) {
  return { daily: 'Дневно', weekly: 'Nedeljno', monthly: 'Mesečno' }[f] || f
}

// ==================== KPI CARDS ====================

interface BackupStats {
  total: number
  completed: number
  failed: number
  totalSize: string
  lastBackup: string
  activeSchedules: number
}

export function BackupKpiCards({ stats }: { stats: BackupStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Database className="h-3.5 w-3.5" />Укупно</div><p className="text-2xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Завршених</div><p className="text-2xl font-bold text-emerald-700">{stats.completed}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><XCircle className="h-3.5 w-3.5" />Неуспелих</div><p className="text-2xl font-bold text-red-700">{stats.failed}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><HardDrive className="h-3.5 w-3.5" />Укупна veličина</div><p className="text-lg font-bold">{stats.totalSize}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Clock className="h-3.5 w-3.5" />Poslednji</div><p className="text-sm font-bold">{stats.lastBackup}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Server className="h-3.5 w-3.5" />Aktivnih rasporeda</div><p className="text-2xl font-bold">{stats.activeSchedules}</p></Card>
    </div>
  )
}

// ==================== TABLE SECTION ====================

interface BackupTableProps {
  filtered: BackupRecord[]
  search: string
  typeFilter: string
  setSearch: (v: string) => void
  setTypeFilter: (v: string) => void
  onRestore: (id: string) => void
  onDownload: () => void
  onDelete: (id: string) => void
}

export function BackupTableSection({ filtered, search, typeFilter, setSearch, setTypeFilter, onRestore, onDownload, onDelete }: BackupTableProps) {
  return (
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
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRestore(b.id)} title="Restauriraj"><Upload className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDownload} title="Preuzmi"><Download className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(b.id)} title="Obriši"><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== SCHEDULE LIST ====================

interface ScheduleListProps {
  schedules: BackupSchedule[]
  onToggle: (id: string) => void
}

export function ScheduleList({ schedules, onToggle }: ScheduleListProps) {
  return (
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
              <Button variant="outline" size="sm" onClick={() => onToggle(s.id)}>{s.active ? 'Паузирај' : 'Активирај'}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ==================== TABS WRAPPER ====================

interface BackupTabsProps {
  filtered: BackupRecord[]
  search: string
  typeFilter: string
  setSearch: (v: string) => void
  setTypeFilter: (v: string) => void
  schedules: BackupSchedule[]
  onRestore: (id: string) => void
  onDownload: () => void
  onDelete: (id: string) => void
  onToggleSchedule: (id: string) => void
}

export function BackupTabs({ filtered, search, typeFilter, setSearch, setTypeFilter, schedules, onRestore, onDownload, onDelete, onToggleSchedule }: BackupTabsProps) {
  return (
    <Tabs defaultValue="backupi" className="space-y-4">
      <TabsList><TabsTrigger value="backupi" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" />Бекапи</TabsTrigger><TabsTrigger value="raspored" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Распореди</TabsTrigger></TabsList>

      <TabsContent value="backupi">
        <BackupTableSection filtered={filtered} search={search} typeFilter={typeFilter} setSearch={setSearch} setTypeFilter={setTypeFilter} onRestore={onRestore} onDownload={onDownload} onDelete={onDelete} />
      </TabsContent>

      <TabsContent value="raspored">
        <ScheduleList schedules={schedules} onToggle={onToggleSchedule} />
      </TabsContent>
    </Tabs>
  )
}
