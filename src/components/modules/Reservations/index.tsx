'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Reservation } from './types'
import { INITIAL } from './data'
import { KpiCards, TableSection, CreateTab, EditTab, DetailDialog, EditDialog } from './components'

export function Rezervacije() {
  const [data, setData] = useState<Reservation[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Reservation | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Reservation>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.guestName, item.phone, item.reservationNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchDate = !dateFilter || item.date === dateFilter
    return matchSearch && matchStatus && matchDate
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati rezervaciju?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Rezervacija obrisana') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ reservationNo: `REZ-2024-${String(data.length + 1).padStart(3, '0')}`, guestName: '', phone: '', email: '', date: new Date().toISOString().split('T')[0], time: '19:00', partySize: 2, tableNo: '', area: 'indoor', status: 'pending', occasion: '', specialRequests: '', source: 'phone', duration: 90, deposit: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Reservation) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.guestName) { toast.error('Unesite ime gosta'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Reservation : i)); toast.success('Rezervacija ažurirana') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Reservation, ...prev]); toast.success('Rezervacija kreirana') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Rezervacije</h1><p className="text-sm text-muted-foreground">Upravljanje rezervacijama i stolovima</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova rezervacija</Button>
      </div>

      <KpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <TableSection
            filtered={filtered} search={search} statusFilter={statusFilter} dateFilter={dateFilter}
            onSearch={setSearch} onStatusFilter={setStatusFilter} onDateFilter={setDateFilter}
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
