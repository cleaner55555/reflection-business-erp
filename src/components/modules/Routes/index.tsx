'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navigation, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { RouteItem } from './types'
import { INITIAL_ROUTES, formatCurrency,
  RouteList, OverviewTab, DetailDialog, RouteFormDialog,
} from './components'

export function Rute() {
  const [data, setData] = useState<RouteItem[]>(INITIAL_ROUTES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<RouteItem | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ name: '', code: '', driver: '', vehicle: '', origin: '', destination: '', priority: 'medium' as RouteItem['priority'], totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()) || item.driver.toLowerCase().includes(search.toLowerCase()) || item.origin.toLowerCase().includes(search.toLowerCase()) || item.destination.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  }), [data, search, statusFilter, priorityFilter])

  const stats = useMemo(() => ({
    total: data.length, planned: data.filter(r => r.status === 'planned').length,
    inProgress: data.filter(r => r.status === 'in_progress').length, completed: data.filter(r => r.status === 'completed').length,
    delayed: data.filter(r => r.status === 'delayed').length,
    totalDistance: data.reduce((s, r) => s + r.totalDistance, 0), totalCost: data.reduce((s, r) => s + r.fuelCost + r.tollCost, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati rutu?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Ruta obrisana') }
  const handleOpenCreate = () => { setFormData({ name: '', code: `RT-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, driver: '', vehicle: '', origin: '', destination: '', priority: 'medium', totalDistance: 0, estimatedTime: '', fuelCost: 0, tollCost: 0, notes: '' }); setDialogOpen(true) }
  const handleOpenEdit = (item: RouteItem) => { setFormData({ name: item.name, code: item.code, driver: item.driver, vehicle: item.vehicle, origin: item.origin, destination: item.destination, priority: item.priority, totalDistance: item.totalDistance, estimatedTime: item.estimatedTime, fuelCost: item.fuelCost, tollCost: item.tollCost, notes: item.notes }); setEditItem(item); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.name || !formData.origin || !formData.destination || !formData.driver) { toast.error('Popunite sva obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...formData } : r)); toast.success('Ruta ažurirana') }
    else { const newItem: RouteItem = { ...formData, id: String(Date.now()), status: 'planned', stops: [], startDate: new Date().toISOString().split('T')[0], endDate: null, actualTime: null }; setData(prev => [newItem, ...prev]); toast.success('Nova ruta kreirana') }
    setDialogOpen(false); setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Navigation className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Rute</h1><p className="text-sm text-muted-foreground">Upravljanje transportnim rutama</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova ruta</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Planirane</div><p className="text-xl font-bold text-slate-700">{stats.planned}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Završene</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">Kasne</div><p className="text-xl font-bold text-amber-700">{stats.delayed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Udaljenost</div><p className="text-xl font-bold">{stats.totalDistance} km</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Troškovi</div><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Lista ruta</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>
        <TabsContent value="list" className="space-y-4">
          <RouteList filtered={filtered} search={search} statusFilter={statusFilter} priorityFilter={priorityFilter} onSearch={setSearch} onStatusFilter={setStatusFilter} onPriorityFilter={setPriorityFilter} onView={setDetailId} onEdit={handleOpenEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab data={data} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} onClose={() => setDetailId(null)} />
      <RouteFormDialog open={dialogOpen} editItem={editItem} formData={formData} onOpenChange={setDialogOpen} onFieldChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} onSave={handleSave} onEditItemChange={setEditItem} />
    </div>
  )
}
