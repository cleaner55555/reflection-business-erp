'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Archive, Download, Upload, Trash2, Plus, Search, HardDrive, Clock, CheckCircle2,
  XCircle, AlertTriangle, Database, FolderOpen, RotateCcw, ShieldCheck, Server,
  Info, PlayCircle,
} from 'lucide-react'
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
  checksum: string | null
  filePath: string | null
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

interface DiskUsage {
  backupDirPath: string
  totalSizeBytes: number
  totalSizeFormatted: string
  fileCount: number
  fullBackupCount: number
  incrementalBackupCount: number
  dbFileSizeBytes: number
  dbFileSizeFormatted: string
  oldestBackupDate: string | null
  newestBackupDate: string | null
}

interface BackupApiResponse {
  backups: BackupRecord[]
  diskUsage: DiskUsage | null
}

// ==================== HELPERS ====================

function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    full: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Потпуни' },
    incremental: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Инкрементални' },
    snapshot: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', label: 'Снимак' },
  }
  const s = map[type] || map.full
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Завршено', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Неуспело', icon: XCircle },
    in_progress: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', label: 'У току', icon: Clock },
    scheduled: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', label: 'Заказано', icon: Clock },
  }
  const s = map[status] || map.completed
  return <Badge className={`${s.color} gap-1 text-xs`}><s.icon className="h-3 w-3" />{s.label}</Badge>
}

function getFreqLabel(f: string) {
  return { daily: 'Дневно', weekly: 'Nedeljno', monthly: 'Mesečno' }[f] || f
}

function formatBytesEstimate(sizeStr: string): string {
  const num = parseFloat(sizeStr)
  if (isNaN(num) || sizeStr.includes(' ')) return sizeStr
  if (num === 0) return '0 B'
  if (num > 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`
  if (num > 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${num} B`
}

function shortChecksum(checksum: string | null): string {
  if (!checksum) return '—'
  return `${checksum.substring(0, 8)}...${checksum.substring(checksum.length - 4)}`
}

// ==================== RESTORE CONFIRMATION DIALOG ====================

function RestoreConfirmDialog({
  backup,
  onConfirm,
  onCancel,
}: {
  backup: BackupRecord
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Потврда рестаурације</h3>
            <p className="text-sm text-muted-foreground">Ова акција ће заменити тренутну базу података</p>
          </div>
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">⚠️ Упозорење</p>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
            <li>Тренутна база података ће бити замењена подацима из бекапа</li>
            <li>Аутоматски ће се креирати бекап пре рестаурације</li>
            <li>Све промене од овог бекапа ће бити изгубљене</li>
            <li>Рестаурација може потрајати неколико секунди</li>
          </ul>
        </div>

        <div className="space-y-1.5 text-sm">
          <p><span className="text-muted-foreground">Бекап:</span> <span className="font-medium">{backup.name}</span></p>
          <p><span className="text-muted-foreground">Тип:</span> {getTypeBadge(backup.type)}</p>
          <p><span className="text-muted-foreground">Величина:</span> {backup.size || '—'}</p>
          <p><span className="text-muted-foreground">Датум:</span> {formatDateTime(backup.createdAt)}</p>
          {backup.checksum && (
            <p className="flex items-center gap-1">
              <span className="text-muted-foreground">Checksum:</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{shortChecksum(backup.checksum)}</code>
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Откажи</Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />Рестаурирај
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ==================== CREATE SCHEDULE DIALOG ====================

function CreateScheduleDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (data: { name: string; frequency: string; time: string; type: string; retentionDays: number }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [time, setTime] = useState('02:00')
  const [type, setType] = useState('full')
  const [retentionDays, setRetentionDays] = useState('30')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Нови распоред бекапа</h3>
          <p className="text-sm text-muted-foreground">Конфигуришите аутоматски бекап</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Назив</Label>
            <Input placeholder="нпр. Дневни бекап" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Учесталост</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Дневно</SelectItem>
                  <SelectItem value="weekly">Nedeljno</SelectItem>
                  <SelectItem value="monthly">Mesečno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Време</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Тип</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Потпуни</SelectItem>
                  <SelectItem value="incremental">Инкрементални</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Задржавање (дана)</Label>
              <Input type="number" min={1} max={365} value={retentionDays} onChange={e => setRetentionDays(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Откажи</Button>
          <Button
            onClick={() => {
              if (!name.trim()) { toast.error('Унесите назив'); return }
              onConfirm({ name: name.trim(), frequency, time, type, retentionDays: parseInt(retentionDays) || 30 })
            }}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" />Креирај
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ==================== MAIN ====================

export function Backup() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [diskUsage, setDiskUsage] = useState<DiskUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full')
  const [restoringBackup, setRestoringBackup] = useState<BackupRecord | null>(null)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [bulkVerifying, setBulkVerifying] = useState(false)
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)

  const fetchBackups = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/backups?${params.toString()}`)
      if (res.ok) {
        const data: BackupApiResponse = await res.json()
        setBackups(data.backups || [])
        setDiskUsage(data.diskUsage || null)
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

  // Calculate real total size from backup records
  const totalSizeBytes = backups.reduce((acc, b) => {
    const sizeStr = b.size || ''
    const match = sizeStr.match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
    if (match) {
      const val = parseFloat(match[1])
      const unit = match[2].toUpperCase()
      const multipliers: Record<string, number> = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 }
      return acc + (val * (multipliers[unit] || 1))
    }
    return acc
  }, 0)

  function formatTotalBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const val = bytes / Math.pow(1024, i)
    return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
  }

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    failed: backups.filter(b => b.status === 'failed').length,
    totalSize: diskUsage?.totalSizeFormatted || formatTotalBytes(totalSizeBytes),
    lastBackup: backups.length > 0 ? formatDate(backups[0].createdAt) : '—',
    activeSchedules: schedules.filter(s => s.active).length,
  }

  const filtered = backups

  const handleCreateBackup = async () => {
    setBackupInProgress(true)
    toast.info('Бекап се креира...', { description: 'Копирање базе података и компресија' })
    try {
      const res = await fetch(`/api/backups?type=${backupType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const data = await res.json()
        await fetchBackups()
        toast.success('Бекап успешно креиран!', {
          description: `Величина: ${data.size}, Трајање: ${data.duration}, Checksum: ${shortChecksum(data.checksum)}`,
        })
      } else {
        const err = await res.json()
        toast.error('Грешка при креирању бекапа', { description: err.error || 'Непозната грешка' })
      }
    } catch {
      toast.error('Грешка при креирању бекапа', { description: 'Мрежна грешка' })
    }
    setBackupInProgress(false)
  }

  const handleRestore = async (backup: BackupRecord) => {
    setRestoringBackup(backup)
  }

  const confirmRestore = async () => {
    if (!restoringBackup) return
    setRestoreInProgress(true)
    toast.info('Рестаурација у току...', { description: 'Креира се пред-бекап и замењује база' })
    try {
      const res = await fetch(`/api/backups/${restoringBackup.id}/restore`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        toast.success('Рестаурација успешна!', {
          description: data.preRestoreBackupId
            ? `Пред-бекап креиран (ID: ${data.preRestoreBackupId.substring(0, 8)}...)`
            : 'База података је рестаурирана.',
        })
        await fetchBackups()
      } else {
        const err = await res.json()
        toast.error('Грешка при рестаурацији', { description: err.error || 'Непозната грешка' })
      }
    } catch {
      toast.error('Грешка при рестаурацији', { description: 'Мрежна грешка' })
    }
    setRestoreInProgress(false)
    setRestoringBackup(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Оbrisati backup?')) return
    try {
      const res = await fetch(`/api/backups/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBackups(prev => prev.filter(b => b.id !== id))
        toast.success('Бекап обрисан')
      } else {
        toast.error('Грешка при брисању')
      }
    } catch {
      toast.error('Грешка при брисању')
    }
  }

  const handleDownload = async (id: string) => {
    toast.info('Преузимање започето...')
    try {
      const res = await fetch(`/api/backups/${id}/download`)
      if (res.ok) {
        const blob = await res.blob()
        const contentDisposition = res.headers.get('Content-Disposition')
        const fileName = contentDisposition
          ? contentDisposition.split('filename="')[1]?.replace('"', '') || 'backup.gz'
          : 'backup.gz'

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Бекап преузет', { description: `Фајл: ${fileName}` })
      } else {
        toast.error('Грешка при преузимању', { description: 'Фајл није пронађен' })
      }
    } catch {
      toast.error('Грешка при преузимању')
    }
  }

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      const res = await fetch(`/api/backups/${id}/verify`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.valid) {
          toast.success('Бекап верификован ✓', { description: data.message })
        } else {
          toast.error('Бекап није исправан!', { description: data.message })
        }
      } else {
        toast.error('Грешка при верификацији')
      }
    } catch {
      toast.error('Грешка при верификацији')
    }
    setVerifyingId(null)
  }

  const handleVerifyAll = async () => {
    setBulkVerifying(true)
    toast.info('Верификација свих бекапа у току...')
    try {
      const res = await fetch('/api/backups/verify', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        const { summary, results } = data
        if (summary.invalid === 0) {
          toast.success(`Сви бекапи верификовани ✓`, { description: `${summary.valid} од ${summary.total} бекапа су исправни` })
        } else {
          toast.warning(`Верификација завршена са грешкама`, {
            description: `${summary.valid} исправно, ${summary.invalid} оштећено. Проверите детаље у конзоли.`,
          })
          // Log details to console for investigation
          const failed = results.filter((r: { valid: boolean }) => !r.valid)
          console.warn('Failed backup verifications:', failed)
        }
      } else {
        toast.error('Грешка при верификацији')
      }
    } catch {
      toast.error('Грешка при верификацији')
    }
    setBulkVerifying(false)
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
      toast.error('Грешка при ажурирању rasporeda')
    }
  }

  const handleCreateSchedule = async (data: { name: string; frequency: string; time: string; type: string; retentionDays: number }) => {
    try {
      const res = await fetch('/api/backups/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchSchedules()
        toast.success('Распоред креиран')
        setShowCreateSchedule(false)
      } else {
        toast.error('Грешка при креирању rasporeda')
      }
    } catch {
      toast.error('Грешка при креирању rasporeda')
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Обрисати овај распоред?')) return
    try {
      const res = await fetch(`/api/backups/schedules/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSchedules(prev => prev.filter(s => s.id !== id))
        toast.success('Распоред обрисан')
      }
    } catch {
      toast.error('Грешка при брисању')
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      {restoringBackup && (
        <RestoreConfirmDialog
          backup={restoringBackup}
          onConfirm={confirmRestore}
          onCancel={() => !restoreInProgress && setRestoringBackup(null)}
        />
      )}

      {showCreateSchedule && (
        <CreateScheduleDialog
          onConfirm={handleCreateSchedule}
          onCancel={() => setShowCreateSchedule(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6" />Бекап и рестаурација
          </h1>
          <p className="text-sm text-muted-foreground">Управљање бекапима података и распоредима</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={backupType} onValueChange={v => setBackupType(v as 'full' | 'incremental')}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Потпуни</SelectItem>
              <SelectItem value="incremental">Инкрементални</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateBackup} disabled={backupInProgress} className="gap-2">
            {backupInProgress ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {backupInProgress ? 'Креира се...' : 'Креирај бекап'}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Database className="h-3.5 w-3.5" />Укупно</div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Завршених</div>
          <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-red-600 mb-1"><XCircle className="h-3.5 w-3.5" />Неуспелих</div>
          <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><HardDrive className="h-3.5 w-3.5" />Укупна величина</div>
          <p className="text-lg font-bold">{stats.totalSize}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Clock className="h-3.5 w-3.5" />Последњи</div>
          <p className="text-sm font-bold">{stats.lastBackup}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Server className="h-3.5 w-3.5" />Активних распореда</div>
          <p className="text-2xl font-bold">{stats.activeSchedules}</p>
        </Card>
      </div>

      {/* Disk Usage Panel */}
      {diskUsage && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Информације о диску
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyAll}
                disabled={bulkVerifying || stats.total === 0}
                className="gap-1.5"
              >
                {bulkVerifying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                {bulkVerifying ? 'Верификујем...' : 'Верификуј све'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Бекап фајлова</p>
                <p className="text-lg font-bold">{diskUsage.fileCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Потпуних</p>
                <p className="text-lg font-bold text-blue-700">{diskUsage.fullBackupCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Инкременталних</p>
                <p className="text-lg font-bold text-emerald-700">{diskUsage.incrementalBackupCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Величина бекапа</p>
                <p className="text-lg font-bold">{diskUsage.totalSizeFormatted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Величина базе</p>
                <p className="text-lg font-bold">{diskUsage.dbFileSizeFormatted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Најстарији</p>
                <p className="text-sm font-bold">{diskUsage.oldestBackupDate ? formatDate(diskUsage.oldestBackupDate) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Најновији</p>
                <p className="text-sm font-bold">{diskUsage.newestBackupDate ? formatDate(diskUsage.newestBackupDate) : '—'}</p>
              </div>
            </div>
            {diskUsage.dbFileSizeBytes > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>Компресија: {(1 - diskUsage.totalSizeBytes / (diskUsage.totalSizeBytes + diskUsage.dbFileSizeBytes)) > 0
                    ? `Бекапи су значајно мањи од активне базе`
                    : `Укупна величина бекапа: ${diskUsage.totalSizeFormatted} на диску`
                  }</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="backupi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backupi" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" />Бекапи</TabsTrigger>
          <TabsTrigger value="raspored" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Распореди</TabsTrigger>
        </TabsList>

        <TabsContent value="backupi">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Листа бекапа</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Претрага..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Сви типови</SelectItem>
                      <SelectItem value="full">Потпуни</SelectItem>
                      <SelectItem value="incremental">Инкрементални</SelectItem>
                      <SelectItem value="snapshot">Снимак</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Назив</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Тип</TableHead>
                      <TableHead className="text-xs">Статус</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Величина</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Checksum</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Датум</TableHead>
                      <TableHead className="text-xs text-right">Акције</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <Archive className="h-8 w-8 text-muted-foreground/50" />
                            <span>Нема бекапа. Кликните &quot;Креирај бекап&quot; да почнете.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(b => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={`h-3.5 w-3.5 ${b.checksum ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                            <div>
                              <p className="text-xs font-medium">{b.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {b.duration}
                                {b.autoDelete ? ' · Auto-брисање' : ''}
                                {b.expiresAt ? ` · Истеče ${formatDate(b.expiresAt)}` : ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getTypeBadge(b.type)}</TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono">{b.size || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded" title={b.checksum || ''}>
                            {shortChecksum(b.checksum)}
                          </code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleVerify(b.id)}
                              disabled={verifyingId === b.id || !b.checksum}
                              title="Верификуј интегритет"
                            >
                              {verifyingId === b.id ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRestore(b)}
                              disabled={b.type === 'incremental' || b.status !== 'completed'}
                              title={b.type === 'incremental' ? 'Инкрементални бекап не може директно рестаурати' : 'Рестаурирај'}
                            >
                              <Upload className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDownload(b.id)}
                              disabled={b.status !== 'completed'}
                              title="Преузми"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500"
                              onClick={() => handleDelete(b.id)}
                              title="Обриши"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
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
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowCreateSchedule(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Нови распоред
              </Button>
            </div>

            {schedules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">Нема распореда бекапа</p>
                  <p className="text-xs mt-1">Креирајте распоред за аутоматске бекапе</p>
                </CardContent>
              </Card>
            ) : schedules.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{s.name}</p>
                        <Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">
                          {s.active ? 'Активан' : 'Неактиван'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{getFreqLabel(s.frequency)}</span><span>·</span>
                        <span>{s.time}</span><span>·</span>
                        <span>{getTypeBadge(s.type)}</span><span>·</span>
                        <span>Задржавање: {s.retentionDays} дана</span>
                      </div>
                      {s.lastRun && (
                        <p className="text-xs text-muted-foreground">
                          Последње: {formatDateTime(s.lastRun)} · Следеће: {s.nextRun ? formatDateTime(s.nextRun) : '—'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleSchedule(s.id)}>
                        {s.active ? 'Паузирај' : 'Активирај'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteSchedule(s.id)} title="Обриши">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
