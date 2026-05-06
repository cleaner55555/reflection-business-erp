'use client'

import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Standard } from './types'
import { INITIAL_DATA } from './data'
import { StandardsHeader, StandardsKpiCards, StandardsTableSection, StandardDetailDialog } from './components'

export function StandardiKvaliteta() {
  const [data, setData] = useState<Standard[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

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

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <StandardsHeader />

      <StandardsKpiCards stats={stats} />

      <StandardsTableSection
        filtered={filtered}
        search={search}
        statusFilter={statusFilter}
        setSearch={setSearch}
        setStatusFilter={setStatusFilter}
        onView={setDetailId}
        onDelete={handleDelete}
      />

      <StandardDetailDialog open={!!detailId} onOpenChange={() => setDetailId(null)} item={detailItem ?? null} />
    </div>
  )
}
