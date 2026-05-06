'use client'
import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HardHat } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL_DATA } from './data'
import type { ConstructionSite } from './types'
import { KpiCards, TableSection, OverviewTab, DetailDialog } from './components'

export function Gradiliste() {
  const [data, setData] = useState<ConstructionSite[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()) || item.city.toLowerCase().includes(search.toLowerCase()) || item.investor.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  }), [data, search, statusFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => !['completed', 'on_hold'].includes(d.status)).length, completed: data.filter(d => d.status === 'completed').length,
    onHold: data.filter(d => d.status === 'on_hold').length,
    totalWorkers: data.reduce((s, d) => s + d.workers, 0), totalBudget: data.reduce((s, d) => s + d.budget, 0), totalSpent: data.reduce((s, d) => s + d.spent, 0),
    avgProgress: Math.round(data.filter(d => d.status !== 'completed').reduce((s, d) => s + d.progress, 0) / data.filter(d => d.status !== 'completed').length),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati gradilište?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><HardHat className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Gradilište</h1><p className="text-sm text-muted-foreground">Upravljanje gradilištima i projektima</p></div>
        </div>
      </div>

      <KpiCards stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Gradilišta</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>
        <TabsContent value="list" className="space-y-4">
          <TableSection
            filtered={filtered} search={search} statusFilter={statusFilter}
            onSearchChange={setSearch} onStatusFilterChange={setStatusFilter}
            onView={item => setDetailId(item.id)} onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab data={data} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}
