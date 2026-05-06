'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL } from './data'
import type { Enrollment } from './types'
import {
  EnrollmentKpiCards,
  EnrollmentTable,
  EnrollmentCreateTab,
  EnrollmentEditTab,
  EnrollmentDetailDialog,
  EnrollmentEditDialog,
} from './components'

export function Prijave() {
  const [data, setData] = useState<Enrollment[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Enrollment | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Enrollment>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.applicantName, item.program, item.city, item.previousSchool].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchLevel = !levelFilter || item.studyLevel === levelFilter
    return matchSearch && matchStatus && matchLevel
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati prijavu?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Prijava obrisana') }
  const openCreate = () => { setEditItem(null); setForm({ applicantName: '', jmbg: '', email: '', phone: '', program: '', studyLevel: 'bachelor', status: 'pending', applicationDate: new Date().toISOString().split('T')[0], entranceExamScore: 0, highSchoolGPA: 0, previousSchool: '', city: '', documentsComplete: false, interviewDate: '', notes: '' }); setDialogOpen(true) }
  const openEdit = (item: Enrollment) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }
  const handleSave = () => {
    if (!form.applicantName || !form.program) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Enrollment : i)); toast.success('Prijava ažurirana') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Enrollment, ...prev]); toast.success('Prijava kreirana') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Prijave za upis</h1><p className="text-sm text-muted-foreground">Upravljanje prijavama, dokumentacijom i upisom kandidata</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova prijava</Button>
      </div>
      <EnrollmentKpiCards data={data} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <EnrollmentTable filtered={filtered} search={search} statusFilter={statusFilter} levelFilter={levelFilter} setSearch={setSearch} setStatusFilter={setStatusFilter} setLevelFilter={setLevelFilter} onDetail={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <EnrollmentCreateTab form={form} setForm={setForm} onSubmit={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <EnrollmentEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
      <EnrollmentDetailDialog detailId={detailId} onClose={() => setDetailId(null)} data={data} />
      <EnrollmentEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editItem={editItem} form={form} setForm={setForm} onSave={handleSave} />
    </div>
  )
}
