'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Filter, Download, Clock, List, BarChart3, Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { ActiveTimer, StatsCards, TimeEntriesTable, EntryFormDialog, ActivityLog, ProjectReportTable, EmployeeReportTable, WeeklySummaryTable, ReportSummaryCards, ReportFilterBar, SettingsPanel, PracenjeTab, ReportsTab, ActivitiesTab, SettingsTab, DeleteConfirmDialog0 } from './components'

import { useTimeTracking } from './hooks'

export function VremenskiTrag() {
  const {activeTab, activities, confirmDelete, deleteDialogOpen, editingEntry, entries, entryDialogOpen, filteredEntries, handleDeleteEntry, handleEditEntry, handleExportCSV, handleGenerateReports, handleStatusChange, handleTimerPause, handleTimerReset, handleTimerResume, handleTimerStart, handleTimerStop, i, mockEmployees, mockProjects, mockTasks, reportType, setActiveTab, setDeleteDialogOpen, setEntryDialogOpen, setReportDateFrom, setReportDateTo, setReportEmployeeId, setReportProjectId, setSettings, setTrackingEmployeeFilter, setTrackingProjectFilter, setTrackingStatusFilter, trackingDateFrom, trackingDateTo, trackingEmployeeFilter, trackingProjectFilter, trackingSearch, trackingStatusFilter} = useTimeTracking()
  if (false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Евиденција радног времена
          </h1>
          <p className="text-sm text-muted-foreground">
            Праћење и управљање временом по пројектима и задацима
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Извези CSV</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditingEntry(null); setEntryDialogOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />
            Нови унос
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="pracenje" className="gap-1.5 text-xs sm:text-sm">
            <Clock className="h-3.5 w-3.5 hidden sm:block" />
            Праћење
          </TabsTrigger>
          <TabsTrigger value="izvestaji" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:block" />
            Извештаји
          </TabsTrigger>
          <TabsTrigger value="aktivnosti" className="gap-1.5 text-xs sm:text-sm">
            <List className="h-3.5 w-3.5 hidden sm:block" />
            Активности
          </TabsTrigger>
          <TabsTrigger value="podesavanja" className="gap-1.5 text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5 hidden sm:block" />
            Подешавања
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: ПРАЋЕЊЕ ==================== */}
        <PracenjeTab entries={entries} filteredEntries={filteredEntries} handleDeleteEntry={handleDeleteEntry} handleEditEntry={handleEditEntry} handleStatusChange={handleStatusChange} handleTimerPause={handleTimerPause} handleTimerReset={handleTimerReset} handleTimerResume={handleTimerResume} handleTimerStart={handleTimerStart} handleTimerStop={handleTimerStop} setTrackingEmployeeFilter={setTrackingEmployeeFilter} setTrackingProjectFilter={setTrackingProjectFilter} setTrackingStatusFilter={setTrackingStatusFilter} trackingDateFrom={trackingDateFrom} trackingDateTo={trackingDateTo} trackingEmployeeFilter={trackingEmployeeFilter} trackingProjectFilter={trackingProjectFilter} trackingSearch={trackingSearch} trackingStatusFilter={trackingStatusFilter} />

        {/* ==================== TAB 2: ИЗВЕШТАЈИ ==================== */}
        <ReportsTab handleGenerateReports={handleGenerateReports} reportType={reportType} setReportDateFrom={setReportDateFrom} setReportDateTo={setReportDateTo} setReportEmployeeId={setReportEmployeeId} setReportProjectId={setReportProjectId} />

        {/* ==================== TAB 3: АКТИВНОСТИ ==================== */}
        <ActivitiesTab activities={activities} />

        {/* ==================== TAB 4: ПОДЕШАВАЊА ==================== */}
        <SettingsTab entries={entries} setSettings={setSettings} />
      </Tabs>

      {/* Entry Form Dialog */}
      <EntryFormDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        editingEntry={editingEntry}
        projects={mockProjects}
        tasks={mockTasks}
        employees={mockEmployees}
        onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
      />

      {/* Delete Confirmation Dialog */}
              <DeleteConfirmDialog0 confirmDelete={confirmDelete} deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} />
    </div>
  )
}
