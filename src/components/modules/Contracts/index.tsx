'use client'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
import { useContracts } from './hooks'

export function Ugovori() {
  const {activeTab, contractTypes, contracts, detailOpen, dialogOpen, filteredContracts, handleCreate, handleRenewalCreate, k, loading, renewalDialogOpen, renewals, sCfg, search, selected, setActiveTab, setDetailOpen, setDialogOpen, setRenewalDialogOpen, setStatusFilter, setTypeFilter, statusFilter, tCfg, typeFilter} = useContracts()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ugovori</h1>
          <p className="text-sm text-muted-foreground">Upravljanje radnim ugovorima, obnavljanjima i dokumentima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadContracts(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi ugovor
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="contracts"><FileSignature className="h-4 w-4 mr-1" /> Ugovori</TabsTrigger>
          <TabsTrigger value="renewals"><RefreshCw className="h-4 w-4 mr-1" /> Obnavljanja</TabsTrigger>
          <TabsTrigger value="documents"><FolderOpen className="h-4 w-4 mr-1" /> Dokumenta</TabsTrigger>
          <TabsTrigger value="types"><Briefcase className="h-4 w-4 mr-1" /> Tipovi</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <OverviewTab sCfg={sCfg} tCfg={tCfg} />

        {/* ─── Ugovori Tab ─────────────────────────────────────────────── */}
        <ContractsTab filteredContracts={filteredContracts} k={k} loading={loading} sCfg={sCfg} search={search} setStatusFilter={setStatusFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} tCfg={tCfg} typeFilter={typeFilter} />

        {/* ─── Obnavljanja Tab ─────────────────────────────────────────── */}
        <RenewalsTab renewals={renewals} />

        {/* ─── Dokumenta Tab ──────────────────────────────────────────── */}
        <DocumentsTab  />

        {/* ─── Tipovi Tab ─────────────────────────────────────────────── */}
        <TypesTab contractTypes={contractTypes} tCfg={tCfg} />
      </Tabs>

      {/* ─── Create Contract Dialog ────────────────────────────────────────── */}
              <Noviugovor dialogOpen={dialogOpen} handleCreate={handleCreate} k={k} setDialogOpen={setDialogOpen} />

      {/* ─── Detail Dialog ────────────────────────────────────────────────── */}
              <Detaljiugovora detailOpen={detailOpen} selected={selected} setDetailOpen={setDetailOpen} />

      {/* ─── Renewal Dialog ────────────────────────────────────────────────── */}
              <Obnavljanjeugovora contracts={contracts} handleRenewalCreate={handleRenewalCreate} renewalDialogOpen={renewalDialogOpen} setRenewalDialogOpen={setRenewalDialogOpen} />

      {/* ─── Contract Statistics Panel ────────────────────────────────────── */}
      {activeTab === 'contracts' && filteredContracts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Statistika filtera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{filteredContracts.length}</p>
                <p className="text-[10px] text-muted-foreground">Prikazano</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{filteredContracts.filter((c) => c.status === 'active').length}</p>
                <p className="text-[10px] text-muted-foreground">Aktivnih</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{formatCurrency(filteredContracts.reduce((sum, c) => sum + c.salaryGross, 0) / filteredContracts.length)}</p>
                <p className="text-[10px] text-muted-foreground">Prosečna bruto</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{formatCurrency(filteredContracts.reduce((sum, c) => sum + c.salaryGross, 0))}</p>
                <p className="text-[10px] text-muted-foreground">Ukupno bruto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
