'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL } from './data'
import type { Classroom } from './types'
import { ClassroomKpiCards, ClassroomTable, ClassroomCreateTab, ClassroomEditTab, ClassroomDetailDialog, ClassroomEditDialog } from './components'

export function Ucionica() {
  const [data, setData] = useState<Classroom[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Classroom | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Classroom>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.name, item.building, item.responsible, item.type].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati učionicu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Učionica obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', building: '', floor: '1', capacity: 30, currentOccupancy: 0, type: 'lecture', status: 'available', equipment: [], responsible: '', area: 45, hasProjector: true, hasAC: false, hasWhiteboard: true, lastInspection: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Classroom) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.building) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Classroom : i))
      toast.success('Učionica ažurirana')
    } else {
      const newItem: Classroom = { id: Date.now().toString(), ...form } as Classroom
      setData(prev => [newItem, ...prev])
      toast.success('Učionica kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Učionice</h1><p className="text-sm text-muted-foreground">Upravljanje učionicama, laboratorijama i prostorijama</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova učionica</Button>
      </div>

      <ClassroomKpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <ClassroomTable
            filtered={filtered}
            search={search}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            setTypeFilter={setTypeFilter}
            onView={(item) => setDetailId(item.id)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <ClassroomCreateTab form={form} setForm={setForm} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <ClassroomEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <ClassroomDetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <ClassroomEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editItem={editItem} form={form} setForm={setForm} onSave={handleSave} />
    </div>
  )
}
