'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Viewing } from './types'
import { INITIAL } from './data'
import { KpiCards, ViewingTable, AddForm, EditList, DetailDialog, EditDialog } from './components'

export function PreglediNekretnine() {
  const [data, setData] = useState<Viewing[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Viewing | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Viewing>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.propertyTitle, item.clientName, item.agent].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })
  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  const openCreate = () => { setEditItem(null); setForm({ propertyTitle: '', clientName: '', phone: '', agent: '', date: new Date().toISOString().split('T')[0], time: '17:00', duration: 30, status: 'scheduled', clientInterest: 'medium', feedback: '', notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Viewing) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => { if (!form.propertyTitle || !form.clientName) { toast.error('Popunite obavezna polja'); return }; if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Viewing : i)); toast.success('Ažurirano') } else { setData(prev => [{ id: Date.now().toString(), ...form } as Viewing, ...prev]); toast.success('Kreirano') }; setDialogOpen(false) }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const upcomingCount = data.filter(i => i.status === 'scheduled').length
  const highInterestCount = data.filter(i => i.clientInterest === 'high').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Pregledi nekretnina</h1><p className="text-sm text-muted-foreground">Zakazivanje i praćenje obilazaka</p></div><Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi pregled</Button></div>
      <KpiCards total={data.length} upcomingCount={upcomingCount} highInterestCount={highInterestCount} noShowCount={data.filter(i => i.status === 'no_show').length} />
      <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4"><ViewingTable filtered={filtered} search={search} statusFilter={statusFilter} onSearchChange={setSearch} onStatusFilterChange={setStatusFilter} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} /></TabsContent>
        <TabsContent value="dodaj" className="mt-4"><AddForm form={form} onFormChange={setForm} onSave={handleSave} /></TabsContent>
        <TabsContent value="uredi" className="mt-4"><EditList data={data} onEdit={openEdit} onDelete={handleDelete} /></TabsContent>
      </Tabs>
      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} form={form} onFormChange={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
