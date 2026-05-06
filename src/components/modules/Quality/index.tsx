'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ShieldCheck, RefreshCw, Plus } from 'lucide-react'
import type { Inspection, DashboardData } from './components'
import { statusConfig,
  OverviewContent, InspectionsList, CreateDialog, DetailDialog,
} from './components'

export function Kvalitet() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [items, setItems] = useState<Inspection[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Inspection | null>(null)

  const emptyForm = { title: '', type: 'final', productName: '', batchNumber: '', inspectorName: '', result: 'pending', defects: 0, notes: '' }
  const [form, setForm] = useState(emptyForm)

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try { const res = await fetch(`/api/quality/inspections/dashboard?companyId=${activeCompanyId}`); if (res.ok) setDashboard(await res.json()) } catch { /* silent */ }
  }, [activeCompanyId])

  const loadItems = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/quality/inspections?${params}`)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId, filter, search])

  useEffect(() => { loadDashboard() }, [activeCompanyId, loadDashboard])
  useEffect(() => { if (activeTab === 'inspections') loadItems() }, [activeTab, loadItems])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/quality/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: activeCompanyId, ...form }) })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleUpdateStatus = async (id: string, status: string, result: string) => {
    try { const res = await fetch('/api/quality/inspections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, result }) }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati inspekciju?')) return
    try { const res = await fetch(`/api/quality/inspections?id=${id}`, { method: 'DELETE' }); if (res.ok) { loadItems(); loadDashboard() } } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kvalitet</h1>
          <p className="text-sm text-muted-foreground">Upravljanje kontrolom kvaliteta i inspekcijama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadItems() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova inspekcija</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><ShieldCheck className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="inspections"><ShieldCheck className="h-4 w-4 mr-1" /> Inspekcije</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <OverviewContent dashboard={dashboard} loading={loading} onCreate={() => setDialogOpen(true)} />
        </TabsContent>
        <TabsContent value="inspections" className="space-y-4">
          <InspectionsList items={items} loading={loading} search={search} filter={filter} onSearch={setSearch} onFilter={setFilter} onView={i => { setSelected(i); setDetailOpen(true) }} onApprove={id => handleUpdateStatus(id, 'passed', 'passed')} onFail={id => handleUpdateStatus(id, 'failed', 'failed')} onDelete={handleDelete} onCreate={() => setDialogOpen(true)} />
        </TabsContent>
      </Tabs>

      <CreateDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onFormChange={(f, v) => setForm(p => ({ ...p, [f]: v }))} onSubmit={handleCreate} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} selected={selected} />
    </div>
  )
}
