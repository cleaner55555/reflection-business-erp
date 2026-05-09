'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Filter, Download, Clock, List, BarChart3, Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type {
  TimerState, TimeEntry, ActivityLogEntry, EntryStatus,
  ProjectReportRow, EmployeeReportRow, WeeklySummaryRow,
  ReportSummary, TimeTrackingSettings, ReportType,
} from './types'

import {
  mockEmployees, mockProjects, mockTasks,
  mockTimeEntries, mockActivityLog, defaultSettings,
  fetchTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry,
  generateProjectReport, generateEmployeeReport, generateWeeklySummary,
  calculateReportSummary, calculateDashboardStats,
  createActivityEntry, formatDuration,
} from './data'

import {
  ActiveTimer, StatsCards, TimeEntriesTable, EntryFormDialog,
  ActivityLog, ProjectReportTable, EmployeeReportTable,
  WeeklySummaryTable, ReportSummaryCards, ReportFilterBar, SettingsPanel,
} from './components'

// ============ MAIN EXPORT ============

export function TimeTracking() {
  // ============ STATE ============

  const [activeTab, setActiveTab] = useState('pracenje')
  const [isLoading, setIsLoading] = useState(true)

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    status: 'idle',
    entryId: null,
    projectId: '',
    taskId: '',
    description: '',
    startTime: null,
    elapsed: 0,
  })
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Data state
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activities, setActivities] = useState<ActivityLogEntry[]>(mockActivityLog)
  const [settings, setSettings] = useState<TimeTrackingSettings>(defaultSettings)

  // Tracking tab filters
  const [trackingSearch, setTrackingSearch] = useState('')
  const [trackingProjectFilter, setTrackingProjectFilter] = useState('all')
  const [trackingEmployeeFilter, setTrackingEmployeeFilter] = useState('all')
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('all')
  const [trackingDateFrom, setTrackingDateFrom] = useState('')
  const [trackingDateTo, setTrackingDateTo] = useState('')

  // Report state
  const [reportType, setReportType] = useState<ReportType>('project')
  const [reportDateFrom, setReportDateFrom] = useState('')
  const [reportDateTo, setReportDateTo] = useState('')
  const [reportProjectId, setReportProjectId] = useState('all')
  const [reportEmployeeId, setReportEmployeeId] = useState('all')
  const [projectReportData, setProjectReportData] = useState<ProjectReportRow[]>([])
  const [employeeReportData, setEmployeeReportData] = useState<EmployeeReportRow[]>([])
  const [weeklyReportData, setWeeklyReportData] = useState<WeeklySummaryRow[]>([])
  const [reportSummary, setReportSummary] = useState<ReportSummary>({
    totalHours: 0, totalEntries: 0, avgHoursPerDay: 0,
    mostActiveProject: '-', mostActiveEmployee: '-', overtimeHours: 0,
  })

  // Dialogs
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ============ LOAD DATA ============

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchTimeEntries()
        setEntries(data)
        // Set default date range for tracking tab (current month)
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString().split('T')[0]
        setTrackingDateFrom(firstDay)
        setTrackingDateTo(today.toISOString().split('T')[0])
        // Set default date range for reports (current week)
        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
        const monday = new Date(today)
        monday.setDate(today.getDate() - dayOfWeek)
        setReportDateFrom(monday.toISOString().split('T')[0])
        setReportDateTo(today.toISOString().split('T')[0])
      } catch {
        toast.error('Грешка при учитавању података')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ============ TIMER INTERVAL ============

  useEffect(() => {
    if (timer.status === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev.startTime) return prev
          const elapsed = Math.floor((Date.now() - new Date(prev.startTime).getTime()) / 1000)
          return { ...prev, elapsed }
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [timer.status])

  // ============ TIMER HANDLERS ============

  const handleTimerStart = useCallback(() => {
    if (!timer.projectId || !timer.taskId) {
      toast.error('Изаберите пројекат и задатак')
      return
    }
    const now = new Date().toISOString()
    setTimer({
      ...timer,
      status: 'running',
      startTime: now,
      elapsed: 0,
      entryId: `timer-${Date.now()}`,
    })
    const employee = mockEmployees.find((e) => e.id === timer.entryId)
    const empName = employee?.name || 'Корисник'
    const project = mockProjects.find((p) => p.id === timer.projectId)
    const task = mockTasks.find((t) => t.id === timer.taskId)
    setActivities((prev) => [
      createActivityEntry(
        'timer_started',
        `Започео рад на "${task?.title || 'задатак'}" (${project?.name || ''})`,
        empName
      ),
      ...prev,
    ])
    toast.success('Тајмер покренут')
  }, [timer])

  const handleTimerPause = useCallback(() => {
    setTimer((prev) => {
      const newTimer = { ...prev, status: 'paused' as const }
      const employee = mockEmployees.find((e) => e.id === prev.entryId)
      const empName = employee?.name || 'Корисник'
      setActivities((a) => [
        createActivityEntry('timer_paused', 'Паузирао тајмер', empName),
        ...a,
      ])
      return newTimer
    })
    toast.info('Тајмер паузиран')
  }, [])

  const handleTimerResume = useCallback(() => {
    const now = new Date().toISOString()
    setTimer((prev) => {
      // Adjust start time to account for already elapsed time
      const adjustedStart = new Date(Date.now() - prev.elapsed * 1000).toISOString()
      const employee = mockEmployees.find((e) => e.id === prev.entryId)
      const empName = employee?.name || 'Корисник'
      setActivities((a) => [
        createActivityEntry('timer_resumed', 'Наставио рад након паузе', empName),
        ...a,
      ])
      return { ...prev, status: 'running', startTime: adjustedStart }
    })
    toast.success('Тајмер настављен')
  }, [])

  const handleTimerStop = useCallback(() => {
    setTimer((prev) => {
      if (prev.elapsed < 60) {
        toast.error('Минимално 1 минут за унос')
        return prev
      }
      const durationMinutes = Math.floor(prev.elapsed / 60)
      const now = new Date()
      const startTime = prev.startTime ? new Date(prev.startTime) : now
      const endTime = new Date(startTime.getTime() + prev.elapsed * 1000)

      const pad2 = (n: number) => n.toString().padStart(2, '0')
      const startTimeStr = `${pad2(startTime.getHours())}:${pad2(startTime.getMinutes())}`
      const endTimeStr = `${pad2(endTime.getHours())}:${pad2(endTime.getMinutes())}`
      const dateStr = now.toISOString().split('T')[0]

      const project = mockProjects.find((p) => p.id === prev.projectId)
      const task = mockTasks.find((t) => t.id === prev.taskId)
      const employee = mockEmployees.find((e) => e.id === prev.entryId)
      const empName = employee?.name || 'Корисник'

      const newEntry: TimeEntry = {
        id: `te-${Date.now()}`,
        employeeId: prev.entryId || 'emp-1',
        employeeName: empName,
        projectId: prev.projectId,
        projectName: project?.name || '',
        taskTitle: task?.title || '',
        description: prev.description,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: durationMinutes,
        status: 'draft',
        createdAt: dateStr,
      }

      setEntries((prevEntries) => [newEntry, ...prevEntries])
      setActivities((a) => [
        createActivityEntry(
          'timer_stopped',
          `Зауставио тајмер: ${formatDuration(durationMinutes)} на "${task?.title || 'задатак'}"`,
          empName
        ),
        createActivityEntry(
          'entry_created',
          `Креирао унос за "${task?.title || 'задатак'}" (${formatDuration(durationMinutes)})`,
          empName
        ),
        ...a,
      ])
      toast.success(`Унос креиран: ${formatDuration(durationMinutes)}`)

      return {
        status: 'idle' as const,
        entryId: null,
        projectId: prev.projectId,
        taskId: prev.taskId,
        description: '',
        startTime: null,
        elapsed: 0,
      }
    })
  }, [])

  const handleTimerReset = useCallback(() => {
    setTimer((prev) => {
      const employee = mockEmployees.find((e) => e.id === prev.entryId)
      const empName = employee?.name || 'Корисник'
      setActivities((a) => [
        createActivityEntry('timer_stopped', 'Поништио тајмер', empName),
        ...a,
      ])
      return {
        ...prev,
        status: 'idle',
        entryId: null,
        description: '',
        startTime: null,
        elapsed: 0,
      }
    })
    toast.info('Тајмер поништен')
  }, [])

  // ============ ENTRY CRUD ============

  const handleCreateEntry = useCallback(async (data: {
    employeeId: string; projectId: string; taskId: string
    description: string; date: string; startTime: string; endTime: string
  }) => {
    try {
      const newEntry = await createTimeEntry(data)
      setEntries((prev) => [newEntry, ...prev])
      const employee = mockEmployees.find((e) => e.id === data.employeeId)
      const task = mockTasks.find((t) => t.id === data.taskId)
      setActivities((prev) => [
        createActivityEntry(
          'entry_created',
          `Креирао унос за "${task?.title || ''}" (${formatDuration(newEntry.duration)})`,
          employee?.name || ''
        ),
        ...prev,
      ])
      toast.success('Унос креиран')
    } catch {
      toast.error('Грешка при креирању уноса')
    }
  }, [])

  const handleEditEntry = useCallback((entry: TimeEntry) => {
    setEditingEntry(entry)
    setEntryDialogOpen(true)
  }, [])

  const handleUpdateEntry = useCallback(async (data: {
    employeeId: string; projectId: string; taskId: string
    description: string; date: string; startTime: string; endTime: string
  }) => {
    if (!editingEntry) return
    try {
      const updated = await updateTimeEntry({ ...data, id: editingEntry.id })
      if (updated) {
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
        const employee = mockEmployees.find((emp) => emp.id === data.employeeId)
        setActivities((prev) => [
          createActivityEntry(
            'entry_updated',
            `Ажурирао унос #${updated.id.slice(-4)}`,
            employee?.name || ''
          ),
          ...prev,
        ])
        toast.success('Унос ажуриран')
      }
      setEditingEntry(null)
    } catch {
      toast.error('Грешка при ажурирању')
    }
  }, [editingEntry])

  const handleDeleteEntry = useCallback((id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      await deleteTimeEntry(deletingId)
      setEntries((prev) => prev.filter((e) => e.id !== deletingId))
      setActivities((prev) => [
        createActivityEntry('entry_deleted', `Обрисао унос #${deletingId.slice(-4)}`, 'Корисник'),
        ...prev,
      ])
      toast.success('Унос обрисан')
    } catch {
      toast.error('Грешка при брисању')
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }, [deletingId])

  const handleStatusChange = useCallback((id: string, status: EntryStatus) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const statusLabels: Record<EntryStatus, string> = {
          draft: 'Нацрт', submitted: 'Предат', approved: 'Одобрен', rejected: 'Одбијен',
        }
        setActivities((a) => [
          createActivityEntry(
            `entry_${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status === 'submitted' ? 'submitted' : 'updated'}` as 'entry_updated',
            `Статус уноса промењен у "${statusLabels[status]}"`,
            e.employeeName
          ),
          ...a,
        ])
        return { ...e, status }
      })
    )
  }, [])

  // ============ FILTER ENTRIES (TRACKING TAB) ============

  const filteredEntries = entries.filter((entry) => {
    if (trackingSearch) {
      const q = trackingSearch.toLowerCase()
      const matchesSearch =
        entry.employeeName.toLowerCase().includes(q) ||
        entry.projectName.toLowerCase().includes(q) ||
        entry.taskTitle.toLowerCase().includes(q) ||
        (entry.description || '').toLowerCase().includes(q)
      if (!matchesSearch) return false
    }
    if (trackingProjectFilter !== 'all' && entry.projectId !== trackingProjectFilter) return false
    if (trackingEmployeeFilter !== 'all' && entry.employeeId !== trackingEmployeeFilter) return false
    if (trackingStatusFilter !== 'all' && entry.status !== trackingStatusFilter) return false
    if (trackingDateFrom && entry.date < trackingDateFrom) return false
    if (trackingDateTo && entry.date > trackingDateTo) return false
    return true
  })

  // ============ REPORTS ============

  const handleGenerateReports = useCallback(async () => {
    const reportEntries = entries.filter((e) => {
      if (reportDateFrom && e.date < reportDateFrom) return false
      if (reportDateTo && e.date > reportDateTo) return false
      if (reportProjectId !== 'all' && e.projectId !== reportProjectId) return false
      if (reportEmployeeId !== 'all' && e.employeeId !== reportEmployeeId) return false
      return true
    })

    const summary = calculateReportSummary(reportEntries)
    setReportSummary(summary)

    const projReport = await generateProjectReport(reportEntries)
    setProjectReportData(projReport)

    const empReport = await generateEmployeeReport(reportEntries)
    setEmployeeReportData(empReport)

    const weekReport = await generateWeeklySummary(reportEntries)
    setWeeklyReportData(weekReport)

    toast.success('Извештај генерисан')
  }, [entries, reportDateFrom, reportDateTo, reportProjectId, reportEmployeeId])

  // Generate reports on filter change
  useEffect(() => {
    if (entries.length > 0 && reportDateFrom && reportDateTo) {
      handleGenerateReports()
    }
  }, [entries, reportDateFrom, reportDateTo, reportProjectId, reportEmployeeId])

  // ============ DASHBOARD STATS ============

  const dashboardStats = calculateDashboardStats(entries, timer.status === 'running')

  // ============ EXPORT CSV ============

  const handleExportCSV = useCallback(() => {
    const headers = ['Датум', 'Запослени', 'Пројекат', 'Задатак', 'Опис', 'Почетак', 'Крај', 'Трајање (мин)', 'Статус']
    const rows = filteredEntries.map((e) => [
      e.date, e.employeeName, e.projectName, e.taskTitle,
      e.description || '', e.startTime, e.endTime, e.duration.toString(), e.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vreme_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV извоз успешан')
  }, [filteredEntries])

  // ============ RENDER ============

  if (isLoading) {
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
        <TabsContent value="pracenje" className="space-y-6 mt-6">
          {/* Active Timer */}
          <ActiveTimer
            timer={timer}
            projects={mockProjects}
            tasks={mockTasks}
            employees={mockEmployees}
            onProjectChange={(v) => setTimer((t) => ({ ...t, projectId: v, taskId: '' }))}
            onTaskChange={(v) => setTimer((t) => ({ ...t, taskId: v }))}
            onDescriptionChange={(v) => setTimer((t) => ({ ...t, description: v }))}
            onEmployeeChange={(v) => setTimer((t) => ({ ...t, entryId: v }))}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onResume={handleTimerResume}
            onStop={handleTimerStop}
            onReset={handleTimerReset}
          />

          {/* Stats */}
          <StatsCards stats={dashboardStats} />

          {/* Filter bar */}
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Претрага уноса..."
                    className="pl-8"
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={trackingProjectFilter} onValueChange={setTrackingProjectFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue placeholder="Пројекат" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Сви пројекти</SelectItem>
                      {mockProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={trackingEmployeeFilter} onValueChange={setTrackingEmployeeFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue placeholder="Запослени" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Сви запослени</SelectItem>
                      {mockEmployees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={trackingStatusFilter} onValueChange={setTrackingStatusFilter}>
                    <SelectTrigger className="w-[120px] h-9 text-xs">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Сви</SelectItem>
                      <SelectItem value="draft">Нацрт</SelectItem>
                      <SelectItem value="submitted">Предат</SelectItem>
                      <SelectItem value="approved">Одобрен</SelectItem>
                      <SelectItem value="rejected">Одбијен</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      className="h-9 w-[140px] text-xs"
                      value={trackingDateFrom}
                      onChange={(e) => setTrackingDateFrom(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">—</span>
                    <Input
                      type="date"
                      className="h-9 w-[140px] text-xs"
                      value={trackingDateTo}
                      onChange={(e) => setTrackingDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entries count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Приказано <span className="font-medium text-foreground">{filteredEntries.length}</span> уноса
              (укупно {entries.length})
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Укупно: {formatDuration(filteredEntries.reduce((s, e) => s + e.duration, 0))}
              </Badge>
            </div>
          </div>

          {/* Time entries table */}
          <TimeEntriesTable
            entries={filteredEntries}
            projects={mockProjects}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        {/* ==================== TAB 2: ИЗВЕШТАЈИ ==================== */}
        <TabsContent value="izvestaji" className="space-y-6 mt-6">
          {/* Report type selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Извештаји</h2>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">По пројектима</SelectItem>
                  <SelectItem value="employee">По запосленима</SelectItem>
                  <SelectItem value="weekly">Недељни преглед</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={handleGenerateReports}>
              <Loader2 className="h-3.5 w-3.5" />
              Генериши извештај
            </Button>
          </div>

          {/* Report summary */}
          <ReportSummaryCards summary={reportSummary} />

          {/* Filter bar */}
          <ReportFilterBar
            dateFrom={reportDateFrom}
            dateTo={reportDateTo}
            projectId={reportProjectId}
            employeeId={reportEmployeeId}
            projects={mockProjects}
            employees={mockEmployees}
            onDateFromChange={setReportDateFrom}
            onDateToChange={setReportDateTo}
            onProjectChange={setReportProjectId}
            onEmployeeChange={setReportEmployeeId}
          />

          {/* Report tables */}
          {reportType === 'project' && <ProjectReportTable data={projectReportData} />}
          {reportType === 'employee' && <EmployeeReportTable data={employeeReportData} />}
          {reportType === 'weekly' && <WeeklySummaryTable data={weeklyReportData} />}
        </TabsContent>

        {/* ==================== TAB 3: АКТИВНОСТИ ==================== */}
        <TabsContent value="aktivnosti" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Дневник активности</h2>
            <Badge variant="outline">{activities.length} догађаја</Badge>
          </div>

          {/* Activity summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Тајмер догађаји</p>
                    <p className="text-lg font-bold">
                      {activities.filter((a) => a.action.startsWith('timer_')).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                    <List className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Креирани уноси</p>
                    <p className="text-lg font-bold">
                      {activities.filter((a) => a.action === 'entry_created').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                    <Filter className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ажурирани уноси</p>
                    <p className="text-lg font-bold">
                      {activities.filter((a) => a.action === 'entry_updated' || a.action === 'entry_submitted').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                    <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Обрисано</p>
                    <p className="text-lg font-bold">
                      {activities.filter((a) => a.action === 'entry_deleted').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity list */}
          <ActivityLog activities={activities} />
        </TabsContent>

        {/* ==================== TAB 4: ПОДЕШАВАЊА ==================== */}
        <TabsContent value="podesavanja" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Подешавања праћења времена</h2>
          </div>
          <SettingsPanel
            settings={settings}
            projects={mockProjects}
            onSettingsChange={setSettings}
          />

          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информације о модулу</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between py-2 border-b">
                <span>Укупно уноса</span>
                <span className="font-medium text-foreground">{entries.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Пројеката</span>
                <span className="font-medium text-foreground">{mockProjects.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Задатака</span>
                <span className="font-medium text-foreground">{mockTasks.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Запослених</span>
                <span className="font-medium text-foreground">{mockEmployees.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Укупно сати (сви уноси)</span>
                <span className="font-medium text-foreground">
                  {formatDuration(entries.reduce((s, e) => s + e.duration, 0))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-base text-red-600 dark:text-red-400">Опасна зона</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ове акције су неповратне. Будите опрезни.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  onClick={() => {
                    setEntries([])
                    setActivities([])
                    toast.info('Сви уноси су обрисани')
                  }}
                >
                  Обриши све уносе
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  onClick={() => {
                    setSettings(defaultSettings)
                    toast.info('Подешавања су враћена на подразумевана')
                  }}
                >
                  Врати подразумевана подешавања
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потврда брисања</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете овај унос? Ова акција је неповратна.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
