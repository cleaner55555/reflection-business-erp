export const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normalan', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Hitan', color: 'bg-red-100 text-red-600' },
}

export const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7
  return `${hour.toString().padStart(2, '0')}:00`
});

export const DAY_NAMES_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Marko Petrović', capacity: 40, color: '#6366f1' },
  { id: 'emp2', name: 'Ana Jovanović', capacity: 40, color: '#f59e0b' },
  { id: 'emp3', name: 'Nikola Stanković', capacity: 40, color: '#10b981' },
  { id: 'emp4', name: 'Jelena Nikolić', capacity: 40, color: '#ef4444' },
  { id: 'emp5', name: 'Stefan Ilić', capacity: 40, color: '#8b5cf6' },
]

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj1', name: 'Web Portal v2.0', color: '#6366f1' },
  { id: 'proj2', name: 'Mobilna Aplikacija', color: '#f59e0b' },
  { id: 'proj3', name: 'ERP Integracija', color: '#10b981' },
  { id: 'proj4', name: 'Infrastruktura', color: '#ef4444' },
]

export const today = new Date();

export const slots: PlanningSlot[] = []

export const statuses = ['planned', 'in_progress', 'completed']

export const priorities = ['low', 'normal', 'high', 'urgent']

export const tasks = [
    'Frontend development', 'Backend API', 'Database design',
    'Code review', 'Testing', 'Deployment', 'Meeting', 'Documentation',
  ]

export const date = new Date(today);

export const dateStr = date.toISOString().split('T')[0]

export const slotsPerDay = 2 + Math.floor(Math.random() * 5);

export const emp = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)]

export const proj = MOCK_PROJECTS[Math.floor(Math.random() * MOCK_PROJECTS.length)]

export const startHour = 7 + Math.floor(Math.random() * 10);

export const duration = 1 + Math.floor(Math.random() * 7);

export const endHour = Math.min(startHour + duration, 21);

export const today = new Date();

export const items: GanttItem[] = [
    { id: 'g1', projectName: 'Web Portal v2.0', employeeName: 'Marko Petrović', startDate: offsetDate(today, -5), endDate: offsetDate(today, 10), progress: 65, color: '#6366f1' },
    { id: 'g2', projectName: 'Web Portal v2.0', employeeName: 'Ana Jovanović', startDate: offsetDate(today, -3), endDate: offsetDate(today, 12), progress: 40, color: '#6366f1' },
    { id: 'g3', projectName: 'Mobilna Aplikacija', employeeName: 'Nikola Stanković', startDate: offsetDate(today, -7), endDate: offsetDate(today, 5), progress: 80, color: '#f59e0b' },
    { id: 'g4', projectName: 'Mobilna Aplikacija', employeeName: 'Jelena Nikolić', startDate: offsetDate(today, -2), endDate: offsetDate(today, 15), progress: 25, color: '#f59e0b' },
    { id: 'g5', projectName: 'ERP Integracija', employeeName: 'Stefan Ilić', startDate: offsetDate(today, -10), endDate: offsetDate(today, 3), progress: 90, color: '#10b981', isMilestone: false },
    { id: 'g6', projectName: 'ERP Integracija', employeeName: 'Marko Petrović', startDate: offsetDate(today, 5), endDate: offsetDate(today, 20), progress: 0, color: '#10b981' },
    { id: 'g7', projectName: 'Infrastruktura', employeeName: 'Nikola Stanković', startDate: offsetDate(today, 0), endDate: offsetDate(today, 7), progress: 50, color: '#ef4444' },
    { id: 'g8', projectName: 'Infrastruktura', employeeName: 'Stefan Ilić', startDate: offsetDate(today, -1), endDate: offsetDate(today, 4), progress: 70, color: '#ef4444' },
    { id: 'g9', projectName: 'Web Portal v2.0', employeeName: 'Jelena Nikolić', startDate: offsetDate(today, 8), endDate: offsetDate(today, 8), progress: 0, color: '#6366f1', isMilestone: true },
    { id: 'g10', projectName: 'Mobilna Aplikacija', employeeName: 'Ana Jovanović', startDate: offsetDate(today, 14), endDate: offsetDate(today, 14), progress: 0, color: '#f59e0b', isMilestone: true },
  ]

export const today = new Date();

export const result: Record<string, AvailabilityDay[]> = {}

export const reasons = ['Godišnji', 'Bolovanje', 'Edukacija', 'Odsustvo']

export const days: AvailabilityDay[] = []

export const date = new Date(today);

export const dayOfWeek = date.getDay();

export const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

export const rand = Math.random();

export const d = new Date(base);

export const d = new Date(baseDate);

export const day = d.getDay();

export const diff = d.getDate() - day + (day === 0 ? -6 : 1);

export const monday = new Date(d);

export const date = new Date(monday);

export const result: Array<{ name: string; date: string; count: number }> = []

export const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled');

export const byDate = new Map<string, PlanningSlot[]>();

export const arr = byDate.get(s.date) || []

export const aStart = daySlots[i].startTime;

export const aEnd = daySlots[i].endTime;

export const bStart = daySlots[j].startTime;

export const bEnd = daySlots[j].endTime;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    employeeId: '', projectId: '', date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', task: '', notes: '', status: 'planned', priority: 'normal',
  }

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/planning/slots?${params}`);

export const data = await res.json();

export const items: PlanningSlot[] = data.items || data || []

export const res = await fetch(`/api/employees?companyId=${activeCompanyId}&limit=100&isActive=true`);

export const data = await res.json();

export const items: Record<string, string>[] = data.items || data || []

export const res = await fetch(`/api/projects?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const items: Record<string, string>[] = data.items || data || []

export const timeout = setTimeout(() => setLoading(false), 200);

export const todayStr = new Date().toISOString().split('T')[0]

export const d = new Date();

export const activeSlots = slots.filter((s) => s.status !== 'cancelled');

export const todaySlots = activeSlots.filter((s) => s.date === todayStr);

export const activeEmps = new Set(activeSlots.map((s) => s.employeeId));

export const totalHours = activeSlots.reduce((sum, s) => sum + (s.hours || 0), 0);

export const capacityHours = activeEmps.size * 40;

export const utilization = capacityHours > 0 ? Math.round((totalHours / capacityHours) * 100) : 0;

export const empHours = new Map<string, number>();

export const daySlots = slots.filter((s) => s.date === date && s.status !== 'cancelled');

export const planned = daySlots.filter((s) => s.status === 'planned').reduce((sum, s) => sum + (s.hours || 0), 0);

export const actual = daySlots.filter((s) => s.status === 'completed' || s.status === 'in_progress').reduce((sum, s) => sum + (s.hours || 0), 0);

export const map = new Map<string, number>();

export const name = s.projectName || t('planner.noProject');

export const nextWeek = getWeekDates(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

export const daySlots = slots.filter((s) => s.date === date && s.status !== 'cancelled');

export const months: Record<string, { planned: number; actual: number }> = {}

export const m = s.date.substring(0, 7);

export const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled');

export const planned = empSlots.reduce((sum, s) => sum + (s.hours || 0), 0);

export const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled');

export const total = empSlots.reduce((sum, s) => sum + (s.hours || 0), 0);

export const overtime = Math.max(0, total - 40);

export const filtered = slots.filter((s) => s.status !== 'cancelled');

export const handleCreate = async () => {
    if (!activeCompanyId) return
    const startTime = form.startTime || '09:00'
    const endTime = form.endTime || '17:00'
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const hours = Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)

    try {
      const res = await fetch('/api/planning/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, hours }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('planner.confirmDelete'))) return
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

export const handleDuplicate = (slot: PlanningSlot) => {
    setForm({
      employeeId: slot.employeeId || '', projectId: slot.projectId || '',
      date: slot.date, startTime: slot.startTime, endTime: slot.endTime,
      task: slot.task || '', notes: slot.notes || '', status: 'planned', priority: slot.priority || 'normal',
    })
    setDialogOpen(true)
  }

export const handleBulkAction = async () => {
    if (bulkSelected.size === 0 || !bulkAction) return
    try {
      await Promise.all(
        Array.from(bulkSelected).map((id) =>
          fetch(`/api/planning/slots?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkAction }),
          })
        )
      )
      loadDashboard()
      setBulkSelected(new Set())
      setBulkAction('')
    } catch { /* silent */ }
  }

export const handleExportCSV = () => {
    const header = 'Zaposleni,Projekat,Zadatak,Datum,Pocetak,Kraj,Sati,Status,Prioritet\n'
    const rows = filteredSlots.map((s) =>
      `"${s.employeeName || ''}","${s.projectName || ''}","${s.task || ''}","${s.date}","${s.startTime}","${s.endTime}",${s.hours},"${s.status}","${s.priority || ''}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planer_termini_${todayStr}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

export const toggleBulkSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

export const handleCellClick = (date: string, hour: string) => {
    const endHour = `${(parseInt(hour, 10) + 1).toString().padStart(2, '0')}:00`
    setForm({ ...emptyForm, date, startTime: hour, endTime: endHour })
    setDialogOpen(true)
  }

export const total = slots.length;

export const completed = slots.filter((s) => s.status === 'completed').length;

export const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

export const inProgress = slots.filter((s) => s.status === 'in_progress').length;

export const cancelled = slots.filter((s) => s.status === 'cancelled').length;

export const weekRangeLabel = `${new Date(weekDates[0]).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })} - ${new Date(weekDates[6]).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}`;

export const isToday = date === todayStr;

export const dayHours = calendarSlots.filter((s) => s.date === date).reduce((sum, s) => sum + (s.hours || 0), 0);

export const isToday = date === todayStr;

export const hourSlots = calendarSlots.filter((s) => s.date === date && s.startTime <= hour && s.endTime > hour);

export const hasConflict = hourSlots.length > 1;

export const proj = projects.find((p) => p.id === s.projectId);

export const bgColor = proj?.color || '#6366f1';

export const cfg = statusConfig[s.status]

export const priCfg = priorityConfig[s.priority || 'normal']

export const startMs = new Date(item.startDate).getTime();

export const endMs = new Date(item.endDate).getTime();

export const todayMs = new Date(todayStr).getTime();

export const totalRange = Math.max(endMs - startMs, 86400000);

export const leftPct = Math.max(0, Math.min(100, ((todayMs - 7 * 86400000 - startMs) / (21 * 86400000)) * 100));

export const widthPct = Math.max(2, (totalRange / (21 * 86400000)) * 100);

export const empAvail = availabilityData[emp.id] || []

export const day = empAvail.find((a) => a.date === date);

export const hours = day?.hours || 0;

export const status = day?.status || 'available';

export const empAvail = availabilityData[emp.id] || []

export const thisWeek = empAvail.filter((d) => weekDates.includes(d.date));

export const available = thisWeek.filter((d) => d.status === 'available').length;

export const partial = thisWeek.filter((d) => d.status === 'partial').length;

export const unavailable = thisWeek.filter((d) => d.status === 'unavailable').length;

export const totalHours = thisWeek.reduce((s, d) => s + d.hours, 0);

export const pct = Math.round((totalHours / 40) * 100);

export function generateMockSlots(): PlanningSlot[] {
  const today = new Date()
  const slots: PlanningSlot[] = []
  const statuses = ['planned', 'in_progress', 'completed']
  const priorities = ['low', 'normal', 'high', 'urgent']
  const tasks = [
    'Frontend development', 'Backend API', 'Database design',
    'Code review', 'Testing', 'Deployment', 'Meeting', 'Documentation',
  ]

  for (let d = -7; d <= 14; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    const slotsPerDay = 2 + Math.floor(Math.random() * 5)

    for (let i = 0; i < slotsPerDay; i++) {
      const emp = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)]
      const proj = MOCK_PROJECTS[Math.floor(Math.random() * MOCK_PROJECTS.length)]
      const startHour = 7 + Math.floor(Math.random() * 10)
      const duration = 1 + Math.floor(Math.random() * 7)
      const endHour = Math.min(startHour + duration, 21)
      if (endHour <= startHour) continue

      slots.push({
        id: `mock-${d}-${i}`,
        employeeId: emp.id,
        employeeName: emp.name,
        projectId: proj.id,
        projectName: proj.name,
        date: dateStr,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        hours: endHour - startHour,
        task: tasks[Math.floor(Math.random() * tasks.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
      })
    }
  }
  return slots
}

export function generateMockGantt(): GanttItem[] {
  const today = new Date()
  const items: GanttItem[] = [
    { id: 'g1', projectName: 'Web Portal v2.0', employeeName: 'Marko Petrović', startDate: offsetDate(today, -5), endDate: offsetDate(today, 10), progress: 65, color: '#6366f1' },
    { id: 'g2', projectName: 'Web Portal v2.0', employeeName: 'Ana Jovanović', startDate: offsetDate(today, -3), endDate: offsetDate(today, 12), progress: 40, color: '#6366f1' },
    { id: 'g3', projectName: 'Mobilna Aplikacija', employeeName: 'Nikola Stanković', startDate: offsetDate(today, -7), endDate: offsetDate(today, 5), progress: 80, color: '#f59e0b' },
    { id: 'g4', projectName: 'Mobilna Aplikacija', employeeName: 'Jelena Nikolić', startDate: offsetDate(today, -2), endDate: offsetDate(today, 15), progress: 25, color: '#f59e0b' },
    { id: 'g5', projectName: 'ERP Integracija', employeeName: 'Stefan Ilić', startDate: offsetDate(today, -10), endDate: offsetDate(today, 3), progress: 90, color: '#10b981', isMilestone: false },
    { id: 'g6', projectName: 'ERP Integracija', employeeName: 'Marko Petrović', startDate: offsetDate(today, 5), endDate: offsetDate(today, 20), progress: 0, color: '#10b981' },
    { id: 'g7', projectName: 'Infrastruktura', employeeName: 'Nikola Stanković', startDate: offsetDate(today, 0), endDate: offsetDate(today, 7), progress: 50, color: '#ef4444' },
    { id: 'g8', projectName: 'Infrastruktura', employeeName: 'Stefan Ilić', startDate: offsetDate(today, -1), endDate: offsetDate(today, 4), progress: 70, color: '#ef4444' },
    { id: 'g9', projectName: 'Web Portal v2.0', employeeName: 'Jelena Nikolić', startDate: offsetDate(today, 8), endDate: offsetDate(today, 8), progress: 0, color: '#6366f1', isMilestone: true },
    { id: 'g10', projectName: 'Mobilna Aplikacija', employeeName: 'Ana Jovanović', startDate: offsetDate(today, 14), endDate: offsetDate(today, 14), progress: 0, color: '#f59e0b', isMilestone: true },
  ]
  return items
}

export function generateMockAvailability(): Record<string, AvailabilityDay[]> {
  const today = new Date()
  const result: Record<string, AvailabilityDay[]> = {}
  const reasons = ['Godišnji', 'Bolovanje', 'Edukacija', 'Odsustvo']

  MOCK_EMPLOYEES.forEach((emp) => {
    const days: AvailabilityDay[] = []
    for (let d = -7; d <= 14; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const rand = Math.random()

      if (isWeekend) {
        days.push({ date: date.toISOString().split('T')[0], hours: 0, status: 'unavailable', reason: 'Vikend' })
      } else if (rand > 0.9) {
        days.push({ date: date.toISOString().split('T')[0], hours: 0, status: 'unavailable', reason: reasons[Math.floor(Math.random() * reasons.length)] })
      } else if (rand > 0.8) {
        days.push({ date: date.toISOString().split('T')[0], hours: 4, status: 'partial', reason: 'Smanjeno radno vrijeme' })
      } else {
        days.push({ date: date.toISOString().split('T')[0], hours: 8, status: 'available' })
      }
    }
    result[emp.id] = days
  })
  return result
}

export function offsetDate(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function getWeekDates(baseDate: Date): string[] {
  const d = new Date(baseDate)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date.toISOString().split('T')[0]
  })
}
