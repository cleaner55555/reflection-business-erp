'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { MenuItem } from './types'
import { INITIAL } from './data'
import { KpiCards, TableSection, CreateTab, EditTab, DetailDialog, EditDialog } from './components'

export function Jelovnik() {
  const [data, setData] = useState<MenuItem[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MenuItem>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.name, item.description, item.ingredients.join(' ')].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchCategory = !categoryFilter || item.category === categoryFilter
    const matchAvailability = !availabilityFilter || (availabilityFilter === 'available' ? item.isAvailable : !item.isAvailable)
    return matchSearch && matchCategory && matchAvailability
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati artikal?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Artikal obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', description: '', category: 'main_course', price: 0, preparationTime: 15, calories: 0, isVegetarian: false, isVegan: false, isGlutenFree: false, isSpicy: false, isAvailable: true, allergens: [], ingredients: [], rating: 0, orderCount: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItem) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.name) { toast.error('Unesite naziv'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as MenuItem : i)); toast.success('Artikal ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as MenuItem, ...prev]); toast.success('Artikal kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Jelovnik</h1><p className="text-sm text-muted-foreground">Upravljanje jelovnikom i cenama</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novo jelo</Button>
      </div>

      <KpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <TableSection filtered={filtered} search={search} categoryFilter={categoryFilter} availabilityFilter={availabilityFilter} onSearchChange={setSearch} onCategoryChange={setCategoryFilter} onAvailabilityChange={setAvailabilityFilter} onViewDetail={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <CreateTab form={form} onFormChange={setForm} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <EditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog form={form} editItem={editItem} open={dialogOpen} onClose={() => setDialogOpen(false)} onFormChange={setForm} onSave={handleSave} />
    </div>
  )
}
