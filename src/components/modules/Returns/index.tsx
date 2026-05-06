'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { ReturnItem } from './types'
import { INITIAL_DATA, STATUSES } from './data'
import { KpiCards, TableSection, AnalyticsTab, DetailDialog } from './components'

export function PovratRobe() {
  const [data, setData] = useState<ReturnItem[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.returnNumber.toLowerCase().includes(search.toLowerCase()) || item.orderNumber.toLowerCase().includes(search.toLowerCase()) || item.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchReason = !reasonFilter || item.returnReason === reasonFilter
    return matchSearch && matchStatus && matchReason
  }), [data, search, statusFilter, reasonFilter])

  const stats = useMemo(() => ({
    total: data.length, requested: data.filter(d => d.status === 'requested').length, inProcess: data.filter(d => ['approved', 'received', 'inspecting'].includes(d.status)).length,
    refunded: data.filter(d => d.status === 'refunded').length, rejected: data.filter(d => d.status === 'rejected').length, exchanged: data.filter(d => d.status === 'exchanged').length,
    totalRefunds: data.filter(d => ['refunded', 'completed'].includes(d.status)).reduce((s, d) => s + d.netRefund, 0),
    avgDays: (() => { const completed = data.filter(d => d.receivedDate && d.processedDate); if (!completed.length) return 0; return (completed.reduce((s, d) => s + (new Date(d.processedDate!).getTime() - new Date(d.receivedDate!).getTime()) / 86400000, 0) / completed.length).toFixed(1) })(),
  }), [data])

  const handleStatusChange = (id: string, newStatus: ReturnItem['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, processedDate: ['refunded', 'exchanged', 'completed', 'rejected'].includes(newStatus) ? new Date().toISOString().split('T')[0] : d.processedDate } : d))
    toast.success(`Status: ${STATUSES[newStatus]?.label}`)
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati povrat?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Povrat obrisan') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><RotateCcw className="h-5 w-5 text-red-700 dark:text-red-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Povrat robe</h1><p className="text-sm text-muted-foreground">Upravljanje povratom i zamjenama</p></div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novi povrat</Button>
      </div>

      <KpiCards stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Svi povrati</TabsTrigger><TabsTrigger value="analytics">Analitika</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <TableSection
            filtered={filtered} search={search} statusFilter={statusFilter} reasonFilter={reasonFilter}
            onSearch={setSearch} onStatusFilter={setStatusFilter} onReasonFilter={setReasonFilter}
            onDetail={setDetailId} onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab data={data} stats={stats} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} onClose={() => setDetailId(null)} onStatusChange={handleStatusChange} />
    </div>
  )
}
