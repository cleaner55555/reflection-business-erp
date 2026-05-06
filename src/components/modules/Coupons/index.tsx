'use client'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL_DATA } from './data'
import type { Coupon } from './types'
import { KpiCards, TableSection, DetailDialog, EditDialog } from './components'

const EMPTY_FORM = { code: '', name: '', description: '', type: 'percentage' as Coupon['type'], discountValue: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, perUserLimit: 1, startDate: '', endDate: '' }

export function Kuponi() {
  const [data, setData] = useState<Coupon[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  }), [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, active: data.filter(d => d.status === 'active').length, scheduled: data.filter(d => d.status === 'scheduled').length,
    expired: data.filter(d => d.status === 'expired').length,
    totalUsed: data.reduce((s, d) => s + d.usageCount, 0), totalDiscount: data.reduce((s, d) => s + d.usageCount * d.discountValue, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati kupon?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Kupon obrisan') }

  const handleToggleStatus = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'paused' as Coupon['status'] : d.status === 'paused' ? 'active' as Coupon['status'] : d.status } : d))
    toast.success('Status promenjen')
  }

  const handleOpenCreate = () => { setFormData(EMPTY_FORM); setEditItem(null); setDialogOpen(true) }
  const handleOpenEdit = (item: Coupon) => { setFormData({ code: item.code, name: item.name, description: item.description, type: item.type, discountValue: item.discountValue, minOrder: item.minOrder, maxDiscount: item.maxDiscount, usageLimit: item.usageLimit, perUserLimit: item.perUserLimit, startDate: item.startDate, endDate: item.endDate }); setEditItem(item); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.code || !formData.name) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d)); toast.success('Kupon ažuriran') }
    else { const newItem: Coupon = { ...formData, id: String(Date.now()), status: 'active', usageCount: 0, applicableCategories: ['Sve'], applicableProducts: [], customerGroups: ['Svi kupci'], createdAt: new Date().toISOString().split('T')[0] }; setData(prev => [newItem, ...prev]); toast.success('Novi kupon kreiran') }
    setDialogOpen(false); setEditItem(null)
  }

  const handleCloseDialog = () => { setDialogOpen(false); setEditItem(null) }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Tag className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Kuponik</h1><p className="text-sm text-muted-foreground">Upravljanje kuponskim akcijama</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Novi kupon</Button>
      </div>

      <KpiCards stats={stats} />
      <TableSection
        filtered={filtered} search={search} statusFilter={statusFilter} typeFilter={typeFilter}
        onSearchChange={setSearch} onStatusFilterChange={setStatusFilter} onTypeFilterChange={setTypeFilter}
        onView={item => setDetailId(item.id)} onEdit={handleOpenEdit} onToggleStatus={handleToggleStatus} onDelete={handleDelete}
      />
      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} formData={formData} open={dialogOpen} onClose={handleCloseDialog} onFormDataChange={setFormData} onSave={handleSave} />
    </div>
  )
}
