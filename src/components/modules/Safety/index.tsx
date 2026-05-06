'use client'

import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Incident } from './types'
import { INITIAL_DATA } from './data'
import { HeaderSection, KpiCards, IncidentsTable, DetailDialog } from './components'

export function ZastitaNaRadu() {
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
      <HeaderSection />
      <KpiCards stats={stats} />
      <IncidentsTable
        filtered={filtered}
        search={search}
        severityFilter={severityFilter}
        onSearchChange={setSearch}
        onSeverityFilterChange={setSeverityFilter}
        onView={setDetailId}
        onDelete={handleDelete}
      />
      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}
