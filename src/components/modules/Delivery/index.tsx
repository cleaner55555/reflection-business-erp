'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import type { DeliveryItem } from './components'
import { INITIAL_DELIVERIES, formatCurrency,
  DeliveryListTab, TrackingTab, OverviewTab, DetailDialog, DeliveryFormDialog,
} from './components'

// ─── Component ───────────────────────────────────────────
export function Dostava() {
  const [data, setData] = useState<DeliveryItem[]>(INITIAL_DELIVERIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<DeliveryItem | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard' as DeliveryItem['priority'], weight: 0, dimensions: '', codAmount: 0, notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.trackingNumber.toLowerCase().includes(search.toLowerCase()) || item.recipientName.toLowerCase().includes(search.toLowerCase()) || item.senderName.toLowerCase().includes(search.toLowerCase()) || item.recipientAddress.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  }), [data, search, statusFilter, priorityFilter])

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter(d => d.status === 'pending_pickup').length,
    inTransit: data.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length,
    delivered: data.filter(d => d.status === 'delivered').length,
    failed: data.filter(d => d.status === 'failed').length,
    returned: data.filter(d => d.status === 'returned').length,
    totalRevenue: data.reduce((s, d) => s + d.shippingCost, 0),
    totalCOD: data.filter(d => d.status === 'delivered').reduce((s, d) => s + d.codAmount, 0),
  }), [data])

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati dostavu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Dostava obrisana')
  }

  const handleStatusChange = (id: string, newStatus: DeliveryItem['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, history: [...d.history, { date: new Date().toLocaleString('sr-RS'), status: newStatus, location: d.currentLocation, note: `Status changed to ${{ STATUSES[newStatus]?.label }}` }] } : d))
    toast.success(`Status promenjen`)
  }

  const handleOpenCreate = () => {
    setFormData({ senderName: '', senderPhone: '', senderAddress: '', recipientName: '', recipientPhone: '', recipientAddress: '', priority: 'standard', weight: 0, dimensions: '', codAmount: 0, notes: '' })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: DeliveryItem) => {
    setFormData({ senderName: item.senderName, senderPhone: item.senderPhone, senderAddress: item.senderAddress, recipientName: item.recipientName, recipientPhone: item.recipientPhone, recipientAddress: item.recipientAddress, priority: item.priority, weight: item.weight, dimensions: item.dimensions, codAmount: item.codAmount, notes: item.notes })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.senderName || !formData.recipientName || !formData.recipientAddress) { toast.error('Popunite sva obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d))
      toast.success('Dostava ažurirana')
    } else {
      const newItem: DeliveryItem = {
        ...formData, id: String(Date.now()), trackingNumber: `DLY-${new Date().getFullYear()}-${String(data.length + 1).padStart(5, '0')}`,
        status: 'pending_pickup', shippingCost: formData.priority === 'express' ? 850 : formData.priority === 'standard' ? 420 : 280,
        estimatedDelivery: new Date(Date.now() + (formData.priority === 'express' ? 1 : formData.priority === 'standard' ? 3 : 5) * 86400000).toISOString().split('T')[0],
        actualDelivery: null, assignedDriver: '', currentLocation: formData.senderAddress, history: [{ date: new Date().toLocaleString('sr-RS'), status: 'pending_pickup', location: formData.senderAddress, note: 'Order created' }]
      }
      setData(prev => [newItem, ...prev])
      toast.success('Nova dostava kreirana')
    }
    setDialogOpen(false)
    setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Package className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Dostava</h1><p className="text-sm text-muted-foreground">Upravljanje isporukama i praćenje pošiljki</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova dostava</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U tranzitu</div><p className="text-xl font-bold text-blue-700">{stats.inTransit}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Isporučeno</div><p className="text-xl font-bold text-emerald-700">{stats.delivered}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Neuspešno</div><p className="text-xl font-bold text-red-700">{stats.failed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-orange-600 mb-1">Vraćeno</div><p className="text-xl font-bold text-orange-700">{stats.returned}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prihodi</div><p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">COD</div><p className="text-xl font-bold">{formatCurrency(stats.totalCOD)}</p></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Pošiljke</TabsTrigger><TabsTrigger value="tracking">Praćenje</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>
        <TabsContent value="list" className="space-y-4">
          <DeliveryListTab filtered={filtered} search={search} statusFilter={statusFilter} priorityFilter={priorityFilter} onSearch={setSearch} onStatusFilter={setStatusFilter} onPriorityFilter={setPriorityFilter} onView={setDetailId} onEdit={handleOpenEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="tracking" className="space-y-4">
          <TrackingTab data={data} onStatusChange={handleStatusChange} onView={setDetailId} />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab data={data} stats={stats} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} onClose={() => setDetailId(null)} onStatusChange={handleStatusChange} />
      <DeliveryFormDialog open={dialogOpen} editItem={editItem} formData={formData} onOpenChange={setDialogOpen} onFormFieldChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} onSave={handleSave} onEditItemChange={setEditItem} />
    </div>
  )
}
