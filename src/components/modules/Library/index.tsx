'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Book } from './types'
import { INITIAL } from './data'
import { LibraryKpiCards, LibraryTable, LibraryCreateTab, LibraryEditTab, LibraryDetailDialog, LibraryEditDialog } from './components'

export function Biblioteka() {
  const [data, setData] = useState<Book[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Book | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Book>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.author, item.isbn, item.publisher].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati knjigu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Knjiga obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ isbn: '', title: '', author: '', publisher: '', year: new Date().getFullYear(), category: 'fiction', totalCopies: 1, availableCopies: 1, borrowedCount: 0, location: '', status: 'available', language: 'Srpski', pages: 0, addedDate: new Date().toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Book) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.title || !form.author) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Book : i))
      toast.success('Knjiga ažurirana')
    } else {
      setData(prev => [{ id: Date.now().toString(), ...form } as Book, ...prev])
      toast.success('Knjiga kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Biblioteka</h1><p className="text-sm text-muted-foreground">Katalog knjiga, inventar i praćenje pozajmica</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova knjiga</Button>
      </div>

      <LibraryKpiCards data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">
          <LibraryTable filtered={filtered} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} onView={setDetailId} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="dodaj" className="mt-4">
          <LibraryCreateTab form={form} setForm={setForm} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="uredi" className="mt-4">
          <LibraryEditTab data={data} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <LibraryDetailDialog item={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <LibraryEditDialog editItem={editItem} form={form} setForm={setForm} open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  )
}
