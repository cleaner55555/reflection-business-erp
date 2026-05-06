'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL } from './data'
import type { Tuition } from './types'
import {
  TuitionKpiCards,
  TuitionTable,
  TuitionCreateTab,
  TuitionEditTab,
  TuitionDetailDialog,
  TuitionEditDialog,
} from './components'

export function Skolarina() {
  const [data, setData] = useState<Tuition[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Tuition | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tuition>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const programs = [...new Set(data.map(i => i.program))]
  const filtered = data.filter(item => {
    const matchSearch = !search || [item.student, item.indexNo, item.program].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchProgram = !programFilter || item.program === programFilter
    return matchSearch && matchStatus && matchProgram
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati zapis o školarini?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Zapis obrisan') }
  const openCreate = () => { setEditItem(null); setForm({ student: '', indexNo: '', program: '', year: 1, semester: 1, amount: 85000, paidAmount: 0, status: 'unpaid', dueDate: '', paidDate: '', paymentMethod: 'cash', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Tuition) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => {
    if (!form.student || !form.program) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Tuition : i)); toast.success('Zapis ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Tuition, ...prev]); toast.success('Zapis kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Školarina</h1><p className="text-sm text-muted-foreground">Upravljanje školarinom, uplatama i stipendijama</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi zapis</Button>
      </div>
      <TuitionKpiCards data={data} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <TuitionTable filtered={filtered} programs={programs} search={search} statusFilter={statusFilter} programFilter={programFilter} setSearch={setSearch} setStatusFilter={setStatusFilter} setProgramFilter={setProgramFilter} onDetail={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <TuitionCreateTab form={form} setForm={setForm} onSubmit={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <TuitionEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
      <TuitionDetailDialog detailId={detailId} onClose={() => setDetailId(null)} data={data} />
      <TuitionEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editItem={editItem} form={form} setForm={setForm} onSave={handleSave} />
    </div>
  )
}
