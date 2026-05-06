'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL } from './data'
import type { MedicalRecord } from './types'
import { KpiCards, TableSection, CreateTab, EditTab, DetailDialog, EditDialog } from './components'

export function Kartoni() {
  const [data, setData] = useState<MedicalRecord[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MedicalRecord | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MedicalRecord>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.recordNo, item.patientName, item.doctor, item.diagnosis, item.diagnosisCode].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchType
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati zapis?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Zapis obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ recordNo: `KAR-2024-${String(data.length + 1).padStart(4, '0')}`, patientName: '', patientNo: '', doctor: '', date: new Date().toISOString().split('T')[0], type: 'checkup', diagnosis: '', diagnosisCode: '', symptoms: '', treatment: '', prescribedMeds: [], vitalSigns: '', labResults: '', nextAction: '', notes: '' })
    setActiveTab('dodaj')
  }

  const openEdit = (item: MedicalRecord) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.patientName || !form.diagnosis) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as MedicalRecord : i)); toast.success('Zapis ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as MedicalRecord, ...prev]); toast.success('Zapis kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Medicinski kartoni</h1><p className="text-sm text-muted-foreground">Evidencija pregleda, dijagnoza i tretmana</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi zapis</Button>
      </div>

      <KpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <TableSection
            filtered={filtered} search={search} typeFilter={typeFilter}
            onSearchChange={setSearch} onTypeFilterChange={setTypeFilter}
            onView={item => setDetailId(item.id)} onEdit={openEdit} onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <CreateTab form={form} onFormChange={setForm} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <EditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <EditDialog editItem={editItem} form={form} open={dialogOpen} onClose={() => setDialogOpen(false)} onFormChange={setForm} onSave={handleSave} />
    </div>
  )
}
