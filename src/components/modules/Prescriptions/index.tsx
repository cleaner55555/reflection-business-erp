'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Prescription } from './types'
import { INITIAL } from './data'
import { KpiCards, TableSection, CreateTab, EditTab, DetailDialog, EditDialog } from './components'

export function Recepti() {
  const [data, setData] = useState<Prescription[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Prescription | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Prescription>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.prescriptionNo, item.patientName, item.doctor, item.diagnosis].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati recept?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Recept obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ prescriptionNo: `REC-2024-${String(data.length + 1).padStart(3, '0')}`, patientName: '', doctor: '', date: new Date().toISOString().split('T')[0], status: 'active', type: 'reimbursable', medications: [], diagnosis: '', totalCost: 0, patientShare: 0, insuranceCoverage: 0, pharmacy: '', validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Prescription) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.patientName || !form.doctor) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Prescription : i)); toast.success('Recept ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Prescription, ...prev]); toast.success('Recept kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Recepti</h1><p className="text-sm text-muted-foreground">Izdavanje i praćenje recepta za lekove</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi recept</Button>
      </div>

      <KpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <TableSection filtered={filtered} search={search} statusFilter={statusFilter} onSearchChange={setSearch} onStatusChange={setStatusFilter} onViewDetail={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
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
