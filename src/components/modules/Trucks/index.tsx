'use client'

import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
import type {
import {
import { StatCards, MonthlyCostsBar, FleetTable, TruckFormDialog, RegistrationTab, MaintenanceTab, MaintenanceFormDialog, CostsTab, CostFormDialog, , VozniParkTab, RegistracijaTab, OdrzavanjeTab, ExpensesTab } from './components'

import { useTrucks } from './hooks'

export function Kamioni() {
  const {activeTab, costDialogOpen, costs, editingTruck, fleetStats, handleAddTruck, handleDeleteCost, handleDeleteMaintenance, handleDeleteTruck, handleEditTruck, handleSaveCost, handleSaveMaintenance, handleSaveTruck, i, maintenance, maintenanceDialogOpen, registrationItems, setCostDialogOpen, setMaintenanceDialogOpen, setSearch, setStatusFilter, setTruckDialogOpen, submitting, truckDialogOpen, trucks, urgentAlerts} = useTrucks()
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // ────────────────────────────────────────────────────────
  // RENDER: MAIN
  // ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Камини — Управљање возним парком
          </h1>
          <p className="text-sm text-muted-foreground">
            Reflection Business ERP · Србија
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 gap-1 px-3 py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {urgentAlerts.length} упозорења
            </Badge>
          )}
        </div>
      </div>

      {/* ─── STAT CARDS ─────────────────────────────────── */}
      <StatCards stats={fleetStats} />

      {/* ─── ALERTS BANNER ──────────────────────────────── */}
      {urgentAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              Хитна упозорења ({urgentAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto space-y-1.5">
              {urgentAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white dark:bg-red-950/50 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{alert.truckPlate}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{alert.message}</span>
                  </div>
                  <span className={`font-semibold ${alert.days < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.days < 0
                      ? `Истекло ${Math.abs(alert.days)} дана`
                      : alert.days === 0
                        ? 'Данас!'
                        : `${alert.days} дана`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── TABS ───────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TruckTab)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid">
          <TabsTrigger value="vozni_park" className="text-xs sm:text-sm gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Возни парк</span>
            <span className="sm:hidden">ВП</span>
          </TabsTrigger>
          <TabsTrigger value="registracija" className="text-xs sm:text-sm gap-1.5 relative">
            <FileCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Регистрација</span>
            <span className="sm:hidden">Рег</span>
            {(fleetStats.registrationDueCount + fleetStats.insuranceDueCount) > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {fleetStats.registrationDueCount + fleetStats.insuranceDueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="odrzavanje" className="text-xs sm:text-sm gap-1.5 relative">
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Одржавање</span>
            <span className="sm:hidden">Одж</span>
            {fleetStats.maintenanceDueCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {fleetStats.maintenanceDueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="troskovi" className="text-xs sm:text-sm gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Трошкови</span>
            <span className="sm:hidden">Тр</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: VOZNI PARK ──────────────────────────── */}
        <VozniParkTab handleAddTruck={handleAddTruck} handleDeleteTruck={handleDeleteTruck} handleEditTruck={handleEditTruck} setSearch={setSearch} setStatusFilter={setStatusFilter} />

        {/* ── TAB: REGISTRACIJA ─────────────────────────── */}
        <RegistracijaTab registrationItems={registrationItems} />

        {/* ── TAB: ODRŽAVANJE ────────────────────────────── */}
        <OdrzavanjeTab handleDeleteMaintenance={handleDeleteMaintenance} maintenance={maintenance} />

        {/* ── TAB: TROŠKOVI ──────────────────────────────── */}
        <ExpensesTab costs={costs} handleDeleteCost={handleDeleteCost} />
      </Tabs>

      {/* ─── DIALOGS ─────────────────────────────────────── */}
      <TruckFormDialog
        open={truckDialogOpen}
        onOpenChange={setTruckDialogOpen}
        truck={editingTruck}
        onSave={handleSaveTruck}
        submitting={submitting}
      />

      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        trucks={trucks}
        onSave={handleSaveMaintenance}
        submitting={submitting}
      />

      <CostFormDialog
        open={costDialogOpen}
        onOpenChange={setCostDialogOpen}
        trucks={trucks}
        onSave={handleSaveCost}
        submitting={submitting}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// MINI STATUS BADGE (for quick cards)
// ────────────────────────────────────────────────────────────

function MiniStatusBadge({ label, days }: { label: string; days: number }) {
  if (days <= -999) return null
  const isUrgent = days < 0
  const isWarning = days <= 30 && days > 0
  const color = isUrgent
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    : isWarning
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'

  const display = isUrgent
    ? 'IST'
    : isWarning
      ? `${days}d`
      : 'OK'

  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${color}`}>
      {label} {display}
    </span>
  )
}
