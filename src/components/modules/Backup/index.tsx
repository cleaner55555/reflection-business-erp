'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Archive, Plus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'
import type { BackupRecord, BackupSchedule } from './types'
import { INITIAL_BACKUPS, INITIAL_SCHEDULES } from './data'
import { BackupKpiCards, BackupTabs } from './components'

export function BackupModul() {
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

      <BackupKpiCards stats={stats} />

      <BackupTabs
        filtered={filtered}
        search={search}
        typeFilter={typeFilter}
        setSearch={setSearch}
        setTypeFilter={setTypeFilter}
        schedules={schedules}
        onRestore={handleRestore}
        onDownload={() => toast.info('Download započet...')}
        onDelete={handleDelete}
        onToggleSchedule={toggleSchedule}
      />
    </div>
  )
}
