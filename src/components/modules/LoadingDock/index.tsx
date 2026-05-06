'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Warehouse, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/helpers'
import type { DockAppointment } from './components'
import { INITIAL_DATA, STATUSES, PRIORITIES,
  ScheduleTab, DocksTab, OverviewTab, DetailDialog, FormDialog,
} from './components'

export function RampaUtovar() {
  const [data, setData] = useState<DockAppointment[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dockFilter, setDockFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<DockAppointment | null>(null)
  const [activeTab, setActiveTab] = useState('schedule')
  const [formData, setFormData] = useState({ dockNumber: '', dockType: 'unloading' as DockAppointment['dockType'], vehiclePlate: '', driverName: '', companyName: '', appointmentDate: '', scheduledTime: '', cargoType: '', cargoWeight: 0, palletCount: 0, priority: 'normal' as DockAppointment['priority'], doorAssignment: '', handlingInstructions: '', notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || item.driverName.toLowerCase().includes(search.toLowerCase()) || item.companyName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchDock = !dockFilter || item.dockNumber === dockFilter
    return matchSearch && matchStatus && matchDock
  }), [data, search, statusFilter, dockFilter])

  const stats = useMemo(() => {
    const today = data.filter(d => d.appointmentDate === '2024-06-15')
    return { total: today.length, completed: today.filter(d => d.status === 'completed').length, inProgress: today.filter(d => d.status === 'in_progress').length, checkedIn: today.filter(d => d.status === 'checked_in').length, scheduled: today.filter(d => d.status === 'scheduled').length, noShow: today.filter(d => d.status === 'no_show').length, totalWeight: today.reduce((s, d) => s + d.cargoWeight, 0), totalPallets: today.reduce((s, d) => s + d.palletCount, 0) }
  }, [data])

  const dockList = useMemo(() => {
    const docks = [...new Set(data.map(d => d.dockNumber))].sort()
    return docks.map(dock => {
      const dockItems = data.filter(d => d.dockNumber === dock && d.appointmentDate === '2024-06-15')
      return { number: dock, current: dockItems.find(d => d.status === 'in_progress'), next: dockItems.find(d => d.status === 'checked_in' || d.status === 'scheduled'), total: dockItems.length, completed: dockItems.filter(d => d.status === 'completed').length }
    })
  }, [data])

  const handleStatusChange = (id: string, newStatus: DockAppointment['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, actualStart: (newStatus === 'in_progress' && !d.actualStart) ? new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }) : d.actualStart, actualEnd: newStatus === 'completed' ? new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }) : null } : d))
    toast.success(`Status: ${STATUSES[newStatus]?.label}`)
  }
  const handleDelete = (id: string) => { if (!confirm('Obrisati termin?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Termin obrisan') }
  const handleOpenCreate = () => { setFormData({ dockNumber: '', dockType: 'unloading', vehiclePlate: '', driverName: '', companyName: '', appointmentDate: '', scheduledTime: '', cargoType: '', cargoWeight: 0, palletCount: 0, priority: 'normal', doorAssignment: '', handlingInstructions: '', notes: '' }); setDialogOpen(true) }
  const handleOpenEdit = (item: DockAppointment) => { setFormData({ dockNumber: item.dockNumber, dockType: item.dockType, vehiclePlate: item.vehiclePlate, driverName: item.driverName, companyName: item.companyName, appointmentDate: item.appointmentDate, scheduledTime: item.scheduledTime, cargoType: item.cargoType, cargoWeight: item.cargoWeight, palletCount: item.palletCount, priority: item.priority, doorAssignment: item.doorAssignment, handlingInstructions: item.handlingInstructions, notes: item.notes }); setEditItem(item); setDialogOpen(true) }

  const handleSave = () => {
    if (!formData.vehiclePlate || !formData.driverName || !formData.companyName || !formData.scheduledTime) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d)); toast.success('Termin ažuriran') }
    else { const newItem: DockAppointment = { ...formData, id: String(Date.now()), status: 'scheduled', cargoUnit: 'kg', actualStart: null, actualEnd: null }; setData(prev => [newItem, ...prev]); toast.success('Novi termin kreiran') }
    setDialogOpen(false); setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Warehouse className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Rampa za utovar</h1><p className="text-sm text-muted-foreground">Upravljanje rampama i terminalom</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Novi termin</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Danas</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Zakazano</div><p className="text-xl font-bold text-slate-700">{stats.scheduled}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Prijavljeni</div><p className="text-xl font-bold text-sky-700">{stats.checkedIn}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U toku</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Završeno</div><p className="text-xl font-bold text-emerald-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Nije došao</div><p className="text-xl font-bold text-red-700">{stats.noShow}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Težina</div><p className="text-xl font-bold">{(stats.totalWeight / 1000).toFixed(1)}t</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Palete</div><p className="text-xl font-bold">{stats.totalPallets}</p></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="schedule">Raspored</TabsTrigger><TabsTrigger value="docks">Rampa stanje</TabsTrigger><TabsTrigger value="overview">Pregled</TabsTrigger></TabsList>
        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab filtered={filtered} search={search} statusFilter={statusFilter} dockFilter={dockFilter} dockList={dockList} onSearch={setSearch} onStatusFilter={setStatusFilter} onDockFilter={setDockFilter} onView={setDetailId} onEdit={handleOpenEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="docks" className="space-y-4"><DocksTab dockList={dockList} /></TabsContent>
        <TabsContent value="overview" className="space-y-4"><OverviewTab data={data} /></TabsContent>
      </Tabs>
      <DetailDialog detailItem={detailItem} onClose={() => setDetailId(null)} onStatusChange={handleStatusChange} />
      <FormDialog open={dialogOpen} editItem={editItem} formData={formData} onOpenChange={setDialogOpen} onFieldChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} onSave={handleSave} onEditItemChange={setEditItem} />
    </div>
  )
}
