'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, Headphones, Plus } from 'lucide-react'

import type { Ticket, DashboardData } from './components'
import { OverviewTab, TicketsTab, CreateTicketDialog, DetailDialog } from './components'

export function Podrška() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Ticket | null>(null)

  const emptyForm = { subject: '', description: '', customerName: '', category: 'general', priority: 'medium', assignedTo: '' }
  const [form, setForm] = useState(emptyForm)
  const handleFormChange = useCallback((field: string, value: string) => { setForm((prev) => ({ ...prev, [field]: value })) }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try { const res = await fetch(`/api/helpdesk/tickets/dashboard?companyId=${activeCompanyId}`); if (res.ok) setDashboard(await res.json()) } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/helpdesk/tickets?${params}`); if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'tickets') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try { const res = await fetch('/api/helpdesk/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) }); if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try { const res = await fetch('/api/helpdesk/tickets', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati tiket?')) return
    try { const res = await fetch(`/api/helpdesk/tickets?id=${id}`, { method: 'DELETE' }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Podrška</h1><p className="text-sm text-muted-foreground">Upravljanje tiketima i korisničkom podrškom</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi tiket</Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="tickets"><Headphones className="h-4 w-4 mr-1" /> Tiketi</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6"><OverviewTab dashboard={dashboard} /></TabsContent>
        <TabsContent value="tickets" className="space-y-4"><TicketsTab items={items} loading={loading} search={search} filter={filter} onSearchChange={setSearch} onFilterChange={setFilter} onView={(item) => { setSelected(item); setDetailOpen(true) }} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onOpenCreate={() => setDialogOpen(true)} /></TabsContent>
      </Tabs>
      <CreateTicketDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onFormChange={handleFormChange} onCreate={handleCreate} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={selected} />
    </div>
  )
}
