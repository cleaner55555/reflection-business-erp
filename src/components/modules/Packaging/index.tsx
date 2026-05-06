'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Box } from 'lucide-react'
import { toast } from 'sonner'
import type { PackagingOrder, PackagingFormData } from './types'
import { INITIAL_DATA } from './data'
import { PackagingStatsCards, OrdersTableSection, OrderDetailDialog } from './components'

export function Pakovanje() {
  const [data, setData] = useState<PackagingOrder[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<PackagingOrder | null>(null)
  const [formData, setFormData] = useState<PackagingFormData>({ orderNumber: '', orderId: '', customerName: '', priority: 'normal', packagingType: 'standard', notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.orderNumber.toLowerCase().includes(search.toLowerCase()) || item.orderId.toLowerCase().includes(search.toLowerCase()) || item.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.packagingType === typeFilter
    return matchSearch && matchStatus && matchType
  }), [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, pending: data.filter(d => d.status === 'pending').length, inProgress: data.filter(d => d.status === 'in_progress').length,
    qc: data.filter(d => d.status === 'quality_check').length, completed: data.filter(d => d.status === 'completed').length,
    totalItems: data.reduce((s, d) => s + d.items.reduce((is, i) => is + i.quantity, 0), 0),
    totalCost: data.reduce((s, d) => s + d.packagingCost, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati nalog?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Nalog obrisan') }

  const handleToggleLabel = (orderId: string, itemId: string) => {
    setData(prev => prev.map(d => d.id === orderId ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, labelPrinted: !i.labelPrinted } : i) } : d))
    toast.success('Labela ažurirana')
  }

  const handleToggleQC = (orderId: string, itemId: string, passed: boolean) => {
    setData(prev => prev.map(d => d.id === orderId ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, qcPassed: passed } : i) } : d))
    toast.success(passed ? 'QC prošao' : 'QC pao')
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Box className="h-5 w-5 text-orange-700 dark:text-orange-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Pakovanje</h1><p className="text-sm text-muted-foreground">Upravljanje pakovanjem robe i etiketiranjem</p></div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novi nalog</Button>
      </div>

      <PackagingStatsCards stats={stats} />

      <OrdersTableSection
        filtered={filtered}
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        onViewDetail={(item) => setDetailId(item.id)}
        onDelete={handleDelete}
      />

      <OrderDetailDialog
        detailItem={detailItem}
        onClose={() => setDetailId(null)}
        onToggleLabel={handleToggleLabel}
        onToggleQC={handleToggleQC}
      />
    </div>
  )
}
