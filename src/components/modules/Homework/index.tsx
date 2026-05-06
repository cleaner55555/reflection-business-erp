'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Homework } from './types'
import { INITIAL } from './data'
import { HomeworkKpiCards, HomeworkTable, HomeworkCreateTab, HomeworkEditTab, HomeworkDetailDialog, HomeworkEditDialog } from './components'

export function Obaveze() {
  const [data, setData] = useState<Homework[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Homework | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Homework>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const subjects = [...new Set(data.map(i => i.subject))]

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.subject, item.classGroup, item.teacher].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchSubject = !subjectFilter || item.subject === subjectFilter
    return matchSearch && matchStatus && matchSubject
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati obavezu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Obaveza obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ title: '', subject: '', classGroup: '', teacher: '', type: 'essay', status: 'assigned', dueDate: '', assignedDate: new Date().toISOString().split('T')[0], maxPoints: 20, avgScore: 0, submittedCount: 0, totalStudents: 30, description: '', instructions: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Homework) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.title || !form.subject) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Homework : i))
      toast.success('Obaveza ažurirana')
    } else {
      setData(prev => [{ id: Date.now().toString(), ...form } as Homework, ...prev])
      toast.success('Obaveza kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Domaće obaveze</h1><p className="text-sm text-muted-foreground">Dodeljivanje, praćenje i ocenjivanje domaćih zadataka</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova obaveza</Button>
      </div>

      <HomeworkKpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <HomeworkTable filtered={filtered} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} subjectFilter={subjectFilter} setSubjectFilter={setSubjectFilter} subjects={subjects} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <HomeworkCreateTab form={form} setForm={setForm} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <HomeworkEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <HomeworkDetailDialog item={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <HomeworkEditDialog editItem={editItem} form={form} setForm={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
