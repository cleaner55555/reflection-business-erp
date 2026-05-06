'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { KitchenItem } from './types'
import { INITIAL } from './data'
import { KpiCards, TableSection, CreateTab, EditTab, DetailDialog, EditDialog } from './components'

export function Kuhinja() {
  const [data, setData] = useState<KitchenItem[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<KitchenItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<KitchenItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.name, item.supplier, item.storageArea].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati artikal?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Artikal obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', category: 'ingredient', unit: 'kom', quantity: 0, minQuantity: 5, maxQuantity: 50, unitPrice: 0, supplier: '', storageArea: '', expiryDate: '', receivedDate: new Date().toISOString().split('T')[0], status: 'in_stock', allergens: [], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: KitchenItem) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.name) { toast.error('Unesite naziv'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as KitchenItem : i)); toast.success('Artikal ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as KitchenItem, ...prev]); toast.success('Artikal kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Kuhinja — Inventar</h1><p className="text-sm text-muted-foreground">Magacinski inventar namirnica i sirovina</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi artikal</Button>
      </div>

      <KpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <TableSection
            filtered={filtered} search={search} statusFilter={statusFilter} categoryFilter={categoryFilter}
            onSearch={setSearch} onStatusFilter={setStatusFilter} onCategoryFilter={setCategoryFilter}
            onDetail={setDetailId} onEdit={openEdit} onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <CreateTab form={form} onFormChange={setForm} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <EditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} form={form} onFormChange={setForm} onSave={handleSave} onClose={setDialogOpen} />
    </div>
  )
}
