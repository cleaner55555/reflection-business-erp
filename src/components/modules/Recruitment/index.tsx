'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, Briefcase, Plus } from 'lucide-react'
import type { JobPosting, DashboardData } from './components'
import { OverviewTab, JobsTab, CreateJobDialog, DetailDialog } from './components'

export function Regrutacija() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<JobPosting[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<JobPosting | null>(null)
  const emptyForm = { title: '', department: '', location: '', type: 'full_time', salaryMin: 0, salaryMax: 0, description: '', requirements: '' }
  const [form, setForm] = useState(emptyForm)
  const handleFormChange = useCallback((field: string, value: string | number) => { setForm((prev) => ({ ...prev, [field]: value })) }, [])

  const loadDashboard = useCallback(async () => { if (!activeCompanyId) return; try { const res = await fetch(`/api/recruitment/jobs/dashboard?companyId=${activeCompanyId}`); if (res.ok) setDashboard(await res.json()) } catch { /* silent */ } }, [activeCompanyId])
  const loadItems = useCallback(async () => { if (!activeCompanyId) return; setLoading(true); try { const params = new URLSearchParams({ companyId: activeCompanyId }); if (filter !== 'all') params.set('status', filter); if (search) params.set('search', search); const res = await fetch(`/api/recruitment/jobs?${params}`); if (res.ok) setItems(await res.json()) } catch { /* silent */ } setLoading(false) }, [activeCompanyId, filter, search])
  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'jobs') loadItems() }, [activeTab, loadItems])
  const handleCreate = async () => { if (!activeCompanyId) return; try { const res = await fetch('/api/recruitment/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) }); if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() } } catch { /* silent */ } }
  const handleUpdateStatus = async (id: string, status: string) => { try { const res = await fetch('/api/recruitment/jobs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ } }
  const handleDelete = async (id: string) => { if (!confirm('Obrisati oglas za posao?')) return; try { const res = await fetch(`/api/recruitment/jobs?id=${id}`, { method: 'DELETE' }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Regrutacija</h1><p className="text-sm text-muted-foreground">Upravljanje oglasima za zapošljavanje i kandidatima</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button><Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi oglas</Button></div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger><TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" /> Oglasi</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-6"><OverviewTab dashboard={dashboard} /></TabsContent>
        <TabsContent value="jobs" className="space-y-4"><JobsTab items={items} loading={loading} search={search} filter={filter} onSearchChange={setSearch} onFilterChange={setFilter} onView={(item) => { setSelected(item); setDetailOpen(true) }} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onOpenCreate={() => setDialogOpen(true)} /></TabsContent>
      </Tabs>
      <CreateJobDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onFormChange={handleFormChange} onCreate={handleCreate} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={selected} />
    </div>
  )
}
