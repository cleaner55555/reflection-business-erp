'use client'
import { RefreshCw, BarChart3, ListChecks, ClipboardCheck, AlertOctagon, Target, Zap } from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

import { OverviewTab, RequirementsTab, AuditsTab, NcTab, CapaTab, RisksTab, DialogBlock0, CreateTyperequirement } from './components'

import { useCompliance } from './hooks'

export function Usklađenost() {
  const {activeTab, audits, c, capaList, categoryFilter, createOpen, d, deptFilter, detailOpen, handleCreate, isOverdue, loadData, loading, lv, ncList, o, requirements, risks, rlv, sc, search, selectedItem, setActiveTab, setCategoryFilter, setCreateOpen, setDeptFilter, setDetailOpen, sev, st} = useCompliance()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usklađenost</h1>
          <p className="text-sm text-muted-foreground">Upravljanje usklađenošću, auditima, neusklađenostima i rizicima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="requirements"><ListChecks className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger>
          <TabsTrigger value="audits"><ClipboardCheck className="h-4 w-4 mr-1" /> Auditi</TabsTrigger>
          <TabsTrigger value="nc"><AlertOctagon className="h-4 w-4 mr-1" /> NC</TabsTrigger>
          <TabsTrigger value="capa"><Target className="h-4 w-4 mr-1" /> CAPA</TabsTrigger>
          <TabsTrigger value="risks"><Zap className="h-4 w-4 mr-1" /> Rizici</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <OverviewTab  />

        {/* ===== ZAHTEVI ===== */}
        <RequirementsTab c={c} categoryFilter={categoryFilter} d={d} deptFilter={deptFilter} loading={loading} requirements={requirements} sc={sc} search={search} setCategoryFilter={setCategoryFilter} setDeptFilter={setDeptFilter} />

        {/* ===== AUDITI ===== */}
        <AuditsTab audits={audits} sc={sc} />

        {/* ===== NC ===== */}
        <NcTab isOverdue={isOverdue} ncList={ncList} search={search} sev={sev} st={st} />

        {/* ===== CAPA ===== */}
        <CapaTab capaList={capaList} isOverdue={isOverdue} st={st} />

        {/* ===== RIZICI ===== */}
        <RisksTab lv={lv} risks={risks} rlv={rlv} />
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
              <DialogBlock0 detailOpen={detailOpen} selectedItem={selectedItem} setDetailOpen={setDetailOpen} />

      {/* ===== CREATE DIALOG ===== */}
              <CreateTyperequirement c={c} createOpen={createOpen} d={d} handleCreate={handleCreate} o={o} setCreateOpen={setCreateOpen} />
    </div>
  )
}
