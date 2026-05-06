'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { INITIAL } from './data'
import type { Patient } from './types'
import { PatientKpiCards, PatientTable, PatientCreateTab, PatientEditTab, PatientDetailDialog, PatientEditDialog } from './components'

export function Pacijenti() {
  const [data, setData] = useState<Patient[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Patient | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Patient>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.patientNo, `${item.firstName} ${item.lastName}`, item.jmbg, item.city, item.primaryDoctor].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati pacijenta?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Pacijent obrisan')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ patientNo: `PAC-2024-${String(data.length + 1).padStart(3, '0')}`, firstName: '', lastName: '', jmbg: '', dateOfBirth: '', age: 0, gender: 'male', phone: '', email: '', address: '', city: '', bloodType: '', insuranceNo: '', insuranceStatus: 'pending', primaryDoctor: '', status: 'active', allergies: [], chronicConditions: [], lastVisit: '', nextAppointment: '', totalVisits: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Patient) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.firstName || !form.lastName) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Patient : i))
      toast.success('Pacijent ažuriran')
    } else {
      const newItem: Patient = { id: Date.now().toString(), ...form } as Patient
      setData(prev => [newItem, ...prev])
      toast.success('Pacijent kreiran')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Pacijenti</h1><p className="text-sm text-muted-foreground">Registar pacijenata i praćenje zdravstvenog stanja</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi pacijent</Button>
      </div>

      <PatientKpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <PatientTable
            filtered={filtered}
            search={search}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            onView={(item) => setDetailId(item.id)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <PatientCreateTab form={form} setForm={setForm} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <PatientEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <PatientDetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <PatientEditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editItem={editItem} form={form} setForm={setForm} onSave={handleSave} />
    </div>
  )
}
