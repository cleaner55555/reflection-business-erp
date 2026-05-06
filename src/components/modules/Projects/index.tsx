import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { BarChart3, FolderKanban, ListTodo, Timer, GanttChart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type * as Types from './types'
import * as Data from './data'
import { getStatusInfo, getPriorityInfo, getTaskStatusInfo, parseTags, ProjectDashboard, KpiCard, ProjectsList, ProjectDetailView, MiniStat, TaskKanban, TimesheetView, TimelineView } from './components'

export function Projekti() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('projects.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljanje projektima, zadacima, vremenom i napretkom</p>
      </div>
      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pregled</span></TabsTrigger>
          <TabsTrigger value="projekti" className="gap-1.5"><FolderKanban className="h-3.5 w-3.5" /><span className="hidden sm:inline">Projekti</span></TabsTrigger>
          <TabsTrigger value="zadaci" className="gap-1.5"><ListTodo className="h-3.5 w-3.5" /><span className="hidden sm:inline">Zadaci</span></TabsTrigger>
          <TabsTrigger value="timesheet" className="gap-1.5"><Timer className="h-3.5 w-3.5" /><span className="hidden sm:inline">Evidencija</span></TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5"><GanttChart className="h-3.5 w-3.5" /><span className="hidden sm:inline">Timeline</span></TabsTrigger>

        </TabsList>
        <TabsContent value="pregled"><ProjectDashboard /></TabsContent>
        <TabsContent value="projekti"><ProjectsList /></TabsContent>
        <TabsContent value="zadaci"><TaskKanban /></TabsContent>
        <TabsContent value="timesheet"><TimesheetView /></TabsContent>
        <TabsContent value="timeline"><TimelineView /></TabsContent>

      </Tabs>
    </div>
  )
}