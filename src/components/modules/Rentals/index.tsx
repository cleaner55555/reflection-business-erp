'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Rental } from './types'
import { INITIAL } from './data'
import { KpiCards, RentalTable, AddForm, EditList, DetailDialog, EditDialog } from './components'

export function Iznajmljivanje() {
  const [data, setData] = useState<Rental[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Rental | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Rental>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.tenantName, item.propertyTitle, item.contractNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })
  const handleDelete = (id: string) => { if (!confirm('Obrisati ugovor?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }
  const openCreate = () => { setEditItem(null); setForm({ contractNo: `IZN-2024-${String(data.length + 1).padStart(3, '0')}`, tenantName: '', phone: '', email: '', propertyTitle: '', propertyAddress: '', monthlyRent: 0, deposit: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', paymentDay: 1, status: 'pending', lastPayment: '', nextPayment: '', paymentMethod: 'bank_transfer', securityDeposit: 0, notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Rental) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => { if (!form.tenantName || !form.propertyTitle) { toast.error('Popunite obavezna polja'); return }; if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Rental : i)); toast.success('Ažurirano') } else { setData(prev => [{ id: Date.now().toString(), ...form } as Rental, ...prev]); toast.success('Kreirano') }; setDialogOpen(false) }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const activeCount = data.filter(i => i.status === 'active').length
  const monthlyIncome = data.filter(i => i.status === 'active').reduce((s, i) => s + i.monthlyRent, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Iznajmljivanje</h1><p className="text-sm text-muted-foreground">Upravljanje zakupnih ugovora</p></div><Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi ugovor</Button></div>
      <KpiCards total={data.length} activeCount={activeCount} expiringCount={data.filter(i => i.status === 'expiring').length} monthlyIncome={monthlyIncome} />
      <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4"><RentalTable filtered={filtered} search={search} statusFilter={statusFilter} onSearchChange={setSearch} onStatusFilterChange={setStatusFilter} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} /></TabsContent>
        <TabsContent value="dodaj" className="mt-4"><AddForm form={form} onFormChange={setForm} onSave={handleSave} /></TabsContent>
        <TabsContent value="uredi" className="mt-4"><EditList data={data} onEdit={openEdit} onDelete={handleDelete} /></TabsContent>
      </Tabs>
      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} form={form} onFormChange={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
