'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, FileSignature, Plus } from 'lucide-react'
import type { SigningRequest, DashboardData } from './components'
import { OverviewTab, RequestsTab, CreateSigningDialog, DetailDialog } from './components'

export function Potpisi() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<SigningRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<SigningRequest | null>(null)
  const emptyForm = { title: '', documentType: 'contract', signerName: '', priority: 'medium', notes: '' }
  const [form, setForm] = useState(emptyForm)
  const handleFormChange = useCallback((field: string, value: string) => { setForm((prev) => ({ ...prev, [field]: value })) }, [])
  const loadDashboard = useCallback(async () => { if (!activeCompanyId) return; try { const res = await fetch(`/api/signing-requests/dashboard?companyId=${activeCompanyId}`); if (res.ok) setDashboard(await res.json()) } catch { /* silent */ } }, [activeCompanyId])
  const loadItems = useCallback(async () => { if (!activeCompanyId) return; setLoading(true); try { const params = new URLSearchParams({ companyId: activeCompanyId }); if (filter !== 'all') params.set('status', filter); if (search) params.set('search', search); const res = await fetch(`/api/signing-requests?${params}`); if (res.ok) setItems(await res.json()) } catch { /* silent */ } setLoading(false) }, [activeCompanyId, filter, search])
  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'requests') loadItems() }, [activeTab, loadItems])
  const handleCreate = async () => { if (!activeCompanyId) return; try { const res = await fetch('/api/signing-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) }); if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() } } catch { /* silent */ } }
  const handleUpdateStatus = async (id: string, status: string) => { try { const res = await fetch('/api/signing-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ } }
  const handleDelete = async (id: string) => { if (!confirm('Obrisati zahtev za potpis?')) return; try { const res = await fetch(`/api/signing-requests?id=${id}`, { method: 'DELETE' }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ } }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Potpisi</h1><p className="text-sm text-muted-foreground">Upravljanje zahtevima za potpisivanje dokumenata</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button><Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi zahtev</Button></div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger><TabsTrigger value="requests"><FileSignature className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-6"><OverviewTab dashboard={dashboard} /></TabsContent>
        <TabsContent value="requests" className="space-y-4"><RequestsTab items={items} loading={loading} search={search} filter={filter} onSearchChange={setSearch} onFilterChange={setFilter} onView={(item) => { setSelected(item); setDetailOpen(true) }} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onOpenCreate={() => setDialogOpen(true)} /></TabsContent>
      </Tabs>
      <CreateSigningDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onFormChange={handleFormChange} onCreate={handleCreate} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={selected} />
    </div>
  )
}
