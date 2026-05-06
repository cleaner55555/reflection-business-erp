import { useState, useEffect, useCallback, useMemo } from 'react'

export function useTimeTracking() {
  const {activeTab, activities, confirmDelete, deleteDialogOpen, editingEntry, entries, entryDialogOpen, filteredEntries, handleDeleteEntry, handleEditEntry, handleExportCSV, handleGenerateReports, handleStatusChange, handleTimerPause, handleTimerReset, handleTimerResume, handleTimerStart, handleTimerStop, i, project, reportType, setActiveTab, setDeleteDialogOpen, setEntryDialogOpen, setReportDateFrom, setReportDateTo, setReportEmployeeId, setReportProjectId, setSettings, setTrackingEmployeeFilter, setTrackingProjectFilter, setTrackingStatusFilter, task, trackingDateFrom, trackingDateTo, trackingEmployeeFilter, trackingProjectFilter, trackingSearch, trackingStatusFilter} = useTimeTracking()
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

  return {
    activeTab,
    activities,
    confirmDelete,
    deleteDialogOpen,
    editingEntry,
    entries,
    entryDialogOpen,
    filteredEntries,
    handleDeleteEntry,
    handleEditEntry,
    handleExportCSV,
    handleGenerateReports,
    handleStatusChange,
    handleTimerPause,
    handleTimerReset,
    handleTimerResume,
    handleTimerStart,
    handleTimerStop,
    i,
    mockEmployees,
    mockProjects,
    mockTasks,
    reportType,
    setActiveTab,
    setDeleteDialogOpen,
    setEntryDialogOpen,
    setReportDateFrom,
    setReportDateTo,
    setReportEmployeeId,
    setReportProjectId,
    setSettings,
    setTrackingEmployeeFilter,
    setTrackingProjectFilter,
    setTrackingStatusFilter,
    trackingDateFrom,
    trackingDateTo,
    trackingEmployeeFilter,
    trackingProjectFilter,
    trackingSearch,
    trackingStatusFilter,
  }
}
