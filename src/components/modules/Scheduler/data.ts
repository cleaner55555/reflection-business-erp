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
