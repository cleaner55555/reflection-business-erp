'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { LabEquipment } from './types'
import { INITIAL } from './data'
import { LabStatsCards, LabTabs, EquipmentDetailDialog, EditEquipmentDialog } from './components'

export function Laboratorija() {
  const [data, setData] = useState<LabEquipment[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<LabEquipment | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<LabEquipment>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.inventoryNo, item.name, item.manufacturer, item.model, item.location, item.responsible].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati opremu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Oprema obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ inventoryNo: `INV-LAB-${String(data.length + 1).padStart(3, '0')}`, name: '', category: 'measurement', manufacturer: '', model: '', serialNo: '', location: '', status: 'operational', purchaseDate: new Date().toISOString().split('T')[0], purchasePrice: 0, lastCalibration: '', nextCalibration: '', responsible: '', condition: 'good', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: LabEquipment) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.manufacturer) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as LabEquipment : i))
      toast.success('Oprema ažurirana')
    } else {
      const newItem: LabEquipment = { id: Date.now().toString(), ...form } as LabEquipment
      setData(prev => [newItem, ...prev])
      toast.success('Oprema kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const operationalCount = data.filter(i => i.status === 'operational').length
  const maintenanceCount = data.filter(i => i.status === 'maintenance' || i.status === 'out_of_order').length
  const totalValue = data.reduce((s, i) => s + i.purchasePrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Laboratorija</h1><p className="text-sm text-muted-foreground">Inventar laboratorijske opreme i instrumenta</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova oprema</Button>
      </div>

      <LabStatsCards total={data.length} operationalCount={operationalCount} maintenanceCount={maintenanceCount} totalValue={totalValue} />

      <LabTabs
        activeTab={activeTab} setActiveTab={setActiveTab}
        filtered={filtered}
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        onViewDetail={(item) => setDetailId(item.id)}
        onEdit={openEdit}
        onDelete={handleDelete}
        dodajForm={form} setDodajForm={setForm} onSave={handleSave}
      />

      <EquipmentDetailDialog
        detailItem={detailItem}
        onClose={() => setDetailId(null)}
      />

      <EditEquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
    </div>
  )
}
