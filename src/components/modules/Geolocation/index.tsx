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
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import {
import { useGeolocation } from './hooks'

export function Geolokacija() {
  const {activeTab, alerts, d, deleteConfirmOpen, employeeDetailOpen, employees, filterDept, filterEventType, filterStatus, filteredEmployees, filteredEvents, geofenceDialogOpen, geofences, handleDeleteGeofence, handleSaveGeofence, loadData, searchQuery, selectedEmployee, selectedGeofence, setActiveTab, setDeleteConfirmOpen, setEmployeeDetailOpen, setFilterDept, setFilterEventType, setFilterStatus, setGeofenceDialogOpen} = useGeolocation()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Geolokacija
          </h1>
          <p className="text-sm text-muted-foreground">Praćenje lokacija zaposlenih, geo-ograničenja i aktivnosti</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => openGeofenceDialog()}><Plus className="h-4 w-4 mr-1" /> Novo ograničenje</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="employees"><Users className="h-3.5 w-3.5 mr-1" /> Zaposleni</TabsTrigger>
          <TabsTrigger value="geofences"><Target className="h-3.5 w-3.5 mr-1" /> Geo ograničenja</TabsTrigger>
          <TabsTrigger value="activities"><CalendarDays className="h-3.5 w-3.5 mr-1" /> Aktivnosti</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <OverviewTab alerts={alerts} employees={employees} geofences={geofences} />

        {/* ===== ZAPOSLENI ===== */}
        <EmployeesTab d={d} filterDept={filterDept} filterStatus={filterStatus} filteredEmployees={filteredEmployees} searchQuery={searchQuery} setFilterDept={setFilterDept} setFilterStatus={setFilterStatus} />

        {/* ===== GEO OGRANIČENJA ===== */}
        <GeofencesTab geofences={geofences} />

        {/* ===== AKTIVNOSTI ===== */}
        <ActivitiesTab alerts={alerts} filterEventType={filterEventType} filteredEvents={filteredEvents} setFilterEventType={setFilterEventType} />
      </Tabs>

      {/* Geofence Dialog */}
              <SelectedGeofenceIzmenige geofenceDialogOpen={geofenceDialogOpen} handleSaveGeofence={handleSaveGeofence} selectedGeofence={selectedGeofence} setGeofenceDialogOpen={setGeofenceDialogOpen} />

      {/* Employee Detail Dialog */}
              <SelectedEmployeename employeeDetailOpen={employeeDetailOpen} selectedEmployee={selectedEmployee} setEmployeeDetailOpen={setEmployeeDetailOpen} />

      {/* Delete Confirm Dialog */}
              <Brisanjegeoogranienja deleteConfirmOpen={deleteConfirmOpen} handleDeleteGeofence={handleDeleteGeofence} selectedGeofence={selectedGeofence} setDeleteConfirmOpen={setDeleteConfirmOpen} />
    </div>
  )
}
