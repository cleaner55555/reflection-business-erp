'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CalendarOff, RefreshCw, Plus } from 'lucide-react'
import type { LeaveRequest, DashboardData } from './components'
import { OverviewContent, RequestsList, CreateDialog, DetailDialog } from './components'

export function Odsustva() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<LeaveRequest | null>(null)

  const emptyForm = { employeeName: '', type: 'vacation', startDate: new Date().toISOString().split('T')[0], endDate: '', reason: '' }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try { const res = await fetch(`/api/leave-requests/dashboard?companyId=${activeCompanyId}`); if (res.ok) setDashboard(await res.json()) } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/leave-requests?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'requests') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try { const res = await fetch('/api/leave-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) }); if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try { const res = await fetch('/api/leave-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za odsustvo?')) return
    try { const res = await fetch(`/api/leave-requests?id=${id}`, { method: 'DELETE' }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Odsustva</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zahtevima za odsustvo i godišnjim odmorom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi zahtev</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><CalendarOff className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="requests"><CalendarOff className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <OverviewContent dashboard={dashboard} loading={loading} />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <RequestsList items={items} loading={loading} search={search} filter={filter} onSearch={setSearch} onFilter={setFilter} onView={r => { setSelected(r); setDetailOpen(true) }} onApprove={id => handleUpdateStatus(id, 'approved')} onReject={id => handleUpdateStatus(id, 'rejected')} onDelete={handleDelete} onCreate={() => setDialogOpen(true)} />
        </TabsContent>
      </Tabs>

      <CreateDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onFormChange={(f, v) => setForm(p => ({ ...p, [f]: v }))} onSubmit={handleCreate} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} selected={selected} />
    </div>
  )
}
