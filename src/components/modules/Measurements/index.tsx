'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Measurement } from './types'
import { INITIAL } from './data'
import { MeasurementKpiCards, MeasurementTable, MeasurementCreateTab, MeasurementEditTab, MeasurementDetailDialog, MeasurementEditDialog } from './components'

export function Merenja() {
  const [data, setData] = useState<Measurement[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Measurement | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Measurement>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.code, item.product, item.parameter, item.operator, item.batch, item.station].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati merenje?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Merenje obrisano')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ code: `MER-2024-${String(data.length + 1).padStart(3, '0')}`, product: '', parameter: '', nominalValue: '', unit: 'mm', measuredValue: '', tolerance: '', deviation: '', status: 'pending', instrument: '', operator: '', station: '', batch: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Measurement) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.product || !form.parameter) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Measurement : i))
      toast.success('Merenje ažurirano')
    } else {
      setData(prev => [{ id: Date.now().toString(), ...form } as Measurement, ...prev])
      toast.success('Merenje kreirano')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Kontrolna merenja</h1><p className="text-sm text-muted-foreground">Kontrola kvaliteta — merenje i inspekcija proizvoda</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novo merenje</Button>
      </div>

      <MeasurementKpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <MeasurementTable filtered={filtered} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <MeasurementCreateTab form={form} setForm={setForm} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <MeasurementEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <MeasurementDetailDialog item={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <MeasurementEditDialog editItem={editItem} form={form} setForm={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
