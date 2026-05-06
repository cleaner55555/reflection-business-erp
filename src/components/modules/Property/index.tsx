'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Property } from './types'
import { INITIAL } from './data'
import { KpiCards, PropertyTable, AddForm, EditList, DetailDialog, EditDialog } from './components'

export function Nekretnine() {
  const [data, setData] = useState<Property[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Property | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Property>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.address, item.city, item.neighborhood].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  })
  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  const openCreate = () => { setEditItem(null); setForm({ propertyNo: `NEK-${String(data.length + 1).padStart(3, '0')}`, title: '', type: 'apartment', transactionType: 'sale', status: 'available', address: '', city: '', neighborhood: '', area: 60, landArea: 0, price: 0, pricePerSqm: 0, bedrooms: 2, bathrooms: 1, floor: '', yearBuilt: 2000, heating: 'gas', furnishing: 'unfurnished', parking: false, elevator: false, terrace: false, registered: true, agent: '', listedDate: new Date().toISOString().split('T')[0], views: 0, inquiries: 0, notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Property) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => { if (!form.title || !form.city) { toast.error('Popunite obavezna polja'); return }; if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Property : i)); toast.success('Ažurirano') } else { setData(prev => [{ id: Date.now().toString(), ...form } as Property, ...prev]); toast.success('Kreirano') }; setDialogOpen(false) }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalCount = data.length
  const availableCount = data.filter(i => i.status === 'available').length
  const totalValue = data.reduce((s, i) => s + i.price, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Nekretnine</h1><p className="text-sm text-muted-foreground">Baza nekretnina — prodaja i zakup</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova nekretnina</Button>
      </div>
      <KpiCards totalCount={totalCount} availableCount={availableCount} cityCount={new Set(data.map(i => i.city)).size} totalValue={totalValue} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <PropertyTable filtered={filtered} search={search} typeFilter={typeFilter} statusFilter={statusFilter} onSearchChange={setSearch} onTypeFilterChange={setTypeFilter} onStatusFilterChange={setStatusFilter} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4"><AddForm form={form} onFormChange={setForm} onSave={handleSave} /></TabsContent>
        <TabsContent value="uredi" className="mt-4"><EditList data={data} onEdit={openEdit} onDelete={handleDelete} /></TabsContent>
      </Tabs>
      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} form={form} onFormChange={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
