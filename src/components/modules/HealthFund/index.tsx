'use client'

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
import { Progress } from '@/components/ui/progress'
import {
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

import { useHealthFund } from './hooks'

export function FondZdravlja() {
  const {activeTab, claimStatusFilter, claims, createOpen, detailOpen, filteredClaims, filteredContributions, loadData, m, search, selectedItem, setActiveTab, setClaimStatusFilter, setCreateOpen, setDetailOpen, setStatusFilter, st, statusFilter, util} = useHealthFund()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fond Zdravlja</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje zdravstvenim osiguranjem, doprinosima i zahtevima
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => openCreate('contribution')}>
            <Plus className="h-4 w-4 mr-1" /> Novi doprinos
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="contributions">
            <DollarSign className="h-4 w-4 mr-1" /> Doprinosi
          </TabsTrigger>
          <TabsTrigger value="claims">
            <Heart className="h-4 w-4 mr-1" /> Zahtevi
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-1" /> Izveštaji
          </TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <OverviewTab claims={claims} />

        {/* ===== DOPRINOSI ===== */}
        <ContributionsTab filteredContributions={filteredContributions} search={search} setStatusFilter={setStatusFilter} statusFilter={statusFilter} />

        {/* ===== ZAHTEVI ===== */}
        <ClaimsTab claimStatusFilter={claimStatusFilter} claims={claims} filteredClaims={filteredClaims} search={search} setClaimStatusFilter={setClaimStatusFilter} />

        {/* ===== IZVEŠTAJI ===== */}
        <ReportsTab util={util} />
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
              <SelectedItememployeeName detailOpen={detailOpen} selectedItem={selectedItem} setDetailOpen={setDetailOpen} />

      {/* ===== CREATE DIALOG ===== */}
              <CreateTypecontribution createOpen={createOpen} m={m} setCreateOpen={setCreateOpen} st={st} />
    </div>
  )
}
