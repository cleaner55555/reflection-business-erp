'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  CalendarRange, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, AlertCircle, X,
  ChevronLeft, ChevronRight, Copy, Download, AlertTriangle,
  Calendar, GanttChart, LayoutGrid, List, TrendingUp, Filter,
} from 'lucide-react'

// ====================== TYPES ======================

interface PlanningSlot {
  id: string
  employeeId?: string
  employeeName?: string
  projectId?: string
  projectName?: string
  date: string
  startTime: string
  endTime: string
  hours: number
  task?: string
  status: string
  notes?: string
  priority?: string
  recurring?: string
}

interface Employee {
  id: string
  name: string
  capacity: number
  color: string
}

interface Project {
  id: string
  name: string
  color: string
}

interface GanttItem {
  id: string
  projectName: string
  employeeName: string
  startDate: string
  endDate: string
  progress: number
  color: string
  isMilestone?: boolean
}

interface AvailabilityDay {
  date: string
  hours: number
  status: 'available' | 'unavailable' | 'partial'
  reason?: string
}

// ====================== CONFIG ======================

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-700' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normalan', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Hitan', color: 'bg-red-100 text-red-600' },
}

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7
  return `${hour.toString().padStart(2, '0')}:00`
})

const DAY_NAMES_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

// ====================== MOCK DATA ======================

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Marko Petrović', capacity: 40, color: '#6366f1' },
  { id: 'emp2', name: 'Ana Jovanović', capacity: 40, color: '#f59e0b' },
  { id: 'emp3', name: 'Nikola Stanković', capacity: 40, color: '#10b981' },
  { id: 'emp4', name: 'Jelena Nikolić', capacity: 40, color: '#ef4444' },
  { id: 'emp5', name: 'Stefan Ilić', capacity: 40, color: '#8b5cf6' },
]

const MOCK_PROJECTS: Project[] = [
  { id: 'proj1', name: 'Web Portal v2.0', color: '#6366f1' },
  { id: 'proj2', name: 'Mobilna Aplikacija', color: '#f59e0b' },
  { id: 'proj3', name: 'ERP Integracija', color: '#10b981' },
  { id: 'proj4', name: 'Infrastruktura', color: '#ef4444' },
]

function generateMockSlots(): PlanningSlot[] {
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

function generateMockGantt(): GanttItem[] {
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

function generateMockAvailability(): Record<string, AvailabilityDay[]> {
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

function offsetDate(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function getWeekDates(baseDate: Date): string[] {
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

// ====================== SUB-COMPONENTS ======================

function KpiCard({ label, value, icon: Icon, valueColor = 'text-foreground', subtitle }: {
  label: string
  value: string | number
  icon: React.ElementType
  valueColor?: string
  subtitle?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  )
}

function SlotForm({ form, setForm, employees, projects, t }: {
  form: Record<string, string>
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>
  employees: Employee[]
  projects: Project[]
  t: (key: string) => string
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('planner.employee')}</Label>
        <Select value={form.employeeId} onValueChange={(v) => setForm((p) => ({ ...p, employeeId: v }))}>
          <SelectTrigger><SelectValue placeholder={t('planner.selectEmployee')} /></SelectTrigger>
          <SelectContent>
            {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('planner.project')}</Label>
        <Select value={form.projectId} onValueChange={(v) => setForm((p) => ({ ...p, projectId: v }))}>
          <SelectTrigger><SelectValue placeholder={t('planner.selectProject')} /></SelectTrigger>
          <SelectContent>
            {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>{t('planner.date')}</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('planner.startTime')}</Label>
          <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('planner.endTime')}</Label>
          <Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>{t('planner.task')}</Label>
          <Input value={form.task} onChange={(e) => setForm((p) => ({ ...p, task: e.target.value }))} placeholder={t('planner.taskPlaceholder')} />
        </div>
        <div className="space-y-2">
          <Label>{t('planner.priority')}</Label>
          <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
            <SelectTrigger><SelectValue placeholder={t('planner.selectPriority')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('planner.priorityLow')}</SelectItem>
              <SelectItem value="normal">{t('planner.priorityNormal')}</SelectItem>
              <SelectItem value="high">{t('planner.priorityHigh')}</SelectItem>
              <SelectItem value="urgent">{t('planner.priorityUrgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t('planner.notes')}</Label>
        <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
      </div>
    </div>
  )
}

function ConflictAlert({ employees, slots, t }: { employees: Employee[]; slots: PlanningSlot[]; t: (key: string) => string }) {
  const conflicts = useMemo(() => {
    const result: Array<{ name: string; date: string; count: number }> = []
    employees.forEach((emp) => {
      const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled')
      const byDate = new Map<string, PlanningSlot[]>()
      empSlots.forEach((s) => {
        const arr = byDate.get(s.date) || []
        arr.push(s)
        byDate.set(s.date, arr)
      })
      byDate.forEach((daySlots, date) => {
        let overlapping = 0
        for (let i = 0; i < daySlots.length; i++) {
          for (let j = i + 1; j < daySlots.length; j++) {
            const aStart = daySlots[i].startTime
            const aEnd = daySlots[i].endTime
            const bStart = daySlots[j].startTime
            const bEnd = daySlots[j].endTime
            if (aStart < bEnd && bStart < aEnd) overlapping++
          }
        }
        if (overlapping > 0) {
          result.push({ name: emp.name, date, count: overlapping })
        }
      })
    })
    return result
  }, [employees, slots])

  if (conflicts.length === 0) return null

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {t('planner.conflictAlerts')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">{new Date(c.date).toLocaleDateString('sr-RS')}</span>
              <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px]">{c.count} {t('planner.conflicts')}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ====================== MAIN COMPONENT ======================

export function Scheduler() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // ---- State ----
  const [activeTab, setActiveTab] = useState('overview')
  const [slots, setSlots] = useState<PlanningSlot[]>([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<PlanningSlot | null>(null)
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [ganttScale, setGanttScale] = useState<'day' | 'week'>('day')

  // Weekly calendar state
  const [weekOffset, setWeekOffset] = useState(0)
  const [calendarEmployeeFilter, setCalendarEmployeeFilter] = useState('all')

  // Form state
  const emptyForm = {
    employeeId: '', projectId: '', date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', task: '', notes: '', status: 'planned', priority: 'normal',
  }
  const [form, setForm] = useState(emptyForm)

  // ---- Mock data ----
  const ganttData = useMemo(() => generateMockGantt(), [])
  const availabilityData = useMemo(() => generateMockAvailability(), [])

  // ---- Load data ----
  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId })
      const res = await fetch(`/api/planning/slots?${params}`)
      if (res.ok) {
        const data = await res.json()
        const items: PlanningSlot[] = data.items || data || []
        if (items.length > 0) {
          setSlots(items)
          return
        }
      }
    } catch { /* silent */ }
    setSlots(generateMockSlots())
  }, [activeCompanyId])

  const loadEmployees = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/employees?companyId=${activeCompanyId}&limit=100&isActive=true`)
      if (res.ok) {
        const data = await res.json()
        const items: Record<string, string>[] = data.items || data || []
        if (items.length > 0) {
          setEmployees(items.map((e, idx) => ({
            id: e.id, name: `${e.firstName} ${e.lastName}`,
            capacity: 40, color: CHART_COLORS[idx % CHART_COLORS.length],
          })))
          return
        }
      }
    } catch { /* silent */ }
    setEmployees(MOCK_EMPLOYEES)
  }, [activeCompanyId])

  const loadProjects = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/projects?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items: Record<string, string>[] = data.items || data || []
        if (items.length > 0) {
          setProjects(items.map((p, idx) => ({
            id: p.id, name: p.name, color: CHART_COLORS[idx % CHART_COLORS.length],
          })))
          return
        }
      }
    } catch { /* silent */ }
    setProjects(MOCK_PROJECTS)
  }, [activeCompanyId])

  useEffect(() => {
    loadDashboard()
    loadEmployees()
    loadProjects()
  }, [activeCompanyId, loadDashboard, loadEmployees, loadProjects])

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timeout)
  }, [activeTab, search, dateFilter, statusFilter, employeeFilter, projectFilter])

  // ---- Derived data ----
  const todayStr = new Date().toISOString().split('T')[0]
  const weekBaseDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])
  const weekDates = useMemo(() => getWeekDates(weekBaseDate), [weekBaseDate])

  const filteredSlots = useMemo(() => slots.filter((s) => {
    if (search && !s.employeeName?.toLowerCase().includes(search.toLowerCase()) && !s.task?.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFilter && s.date !== dateFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (employeeFilter !== 'all' && s.employeeId !== employeeFilter) return false
    if (projectFilter !== 'all' && s.projectId !== projectFilter) return false
    return true
  }), [slots, search, dateFilter, statusFilter, employeeFilter, projectFilter])

  const dashboardStats = useMemo(() => {
    const activeSlots = slots.filter((s) => s.status !== 'cancelled')
    const todaySlots = activeSlots.filter((s) => s.date === todayStr)
    const activeEmps = new Set(activeSlots.map((s) => s.employeeId))
    const totalHours = activeSlots.reduce((sum, s) => sum + (s.hours || 0), 0)
    const capacityHours = activeEmps.size * 40
    const utilization = capacityHours > 0 ? Math.round((totalHours / capacityHours) * 100) : 0

    const empHours = new Map<string, number>()
    activeSlots.forEach((s) => {
      if (s.employeeId) empHours.set(s.employeeId, (empHours.get(s.employeeId) || 0) + (s.hours || 0))
    })
    let overbookedCount = 0
    empHours.forEach((hours) => { if (hours > 40) overbookedCount++ })

    return { totalSlots: slots.length, todaySlots: todaySlots.length, activeEmployees: activeEmps.size, totalHours, utilization, overbookedCount }
  }, [slots, todayStr])

  const weeklyChartData = useMemo(() => {
    return weekDates.map((date, i) => {
      const daySlots = slots.filter((s) => s.date === date && s.status !== 'cancelled')
      const planned = daySlots.filter((s) => s.status === 'planned').reduce((sum, s) => sum + (s.hours || 0), 0)
      const actual = daySlots.filter((s) => s.status === 'completed' || s.status === 'in_progress').reduce((sum, s) => sum + (s.hours || 0), 0)
      return { name: DAY_NAMES_SR[i], planirano: Math.round(planned * 10) / 10, ostvareno: Math.round(actual * 10) / 10 }
    })
  }, [slots, weekDates])

  const projectPieData = useMemo(() => {
    const map = new Map<string, number>()
    slots.filter((s) => s.status !== 'cancelled').forEach((s) => {
      const name = s.projectName || t('planner.noProject')
      map.set(name, (map.get(name) || 0) + (s.hours || 0))
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
  }, [slots, t])

  const upcomingWeek = useMemo(() => {
    const nextWeek = getWeekDates(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    return nextWeek.map((date, i) => {
      const daySlots = slots.filter((s) => s.date === date && s.status !== 'cancelled')
      return { day: DAY_NAMES_SR[i], date, count: daySlots.length, hours: daySlots.reduce((s, sl) => s + (sl.hours || 0), 0) }
    })
  }, [slots])

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { planned: number; actual: number }> = {}
    slots.forEach((s) => {
      const m = s.date.substring(0, 7)
      if (!months[m]) months[m] = { planned: 0, actual: 0 }
      months[m].planned += s.hours || 0
      if (s.status === 'completed') months[m].actual += s.hours || 0
    })
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => ({
      name: m, planirano: Math.round(v.planned), ostvareno: Math.round(v.actual),
    }))
  }, [slots])

  // Employee utilization data
  const employeeUtilData = useMemo(() => {
    return employees.map((emp) => {
      const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled')
      const planned = empSlots.reduce((sum, s) => sum + (s.hours || 0), 0)
      return { name: emp.name.split(' ')[0], planirano: Math.round(planned), kapacitet: emp.capacity }
    })
  }, [employees, slots])

  // Overtime analysis
  const overtimeData = useMemo(() => {
    return employees.map((emp) => {
      const empSlots = slots.filter((s) => s.employeeId === emp.id && s.status !== 'cancelled')
      const total = empSlots.reduce((sum, s) => sum + (s.hours || 0), 0)
      const overtime = Math.max(0, total - 40)
      return { name: emp.name, total: Math.round(total * 10) / 10, capacity: 40, overtime: Math.round(overtime * 10) / 10 }
    }).filter((e) => e.overtime > 0).sort((a, b) => b.overtime - a.overtime)
  }, [employees, slots])

  // Calendar filtered slots
  const calendarSlots = useMemo(() => {
    const filtered = slots.filter((s) => s.status !== 'cancelled')
    if (calendarEmployeeFilter === 'all') return filtered
    return filtered.filter((s) => s.employeeId === calendarEmployeeFilter)
  }, [slots, calendarEmployeeFilter])

  // ---- Handlers ----
  const handleCreate = async () => {
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('planner.confirmDelete'))) return
    try {
      const res = await fetch(`/api/planning/slots?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadDashboard()
    } catch { /* silent */ }
  }

  const handleDuplicate = (slot: PlanningSlot) => {
    setForm({
      employeeId: slot.employeeId || '', projectId: slot.projectId || '',
      date: slot.date, startTime: slot.startTime, endTime: slot.endTime,
      task: slot.task || '', notes: slot.notes || '', status: 'planned', priority: slot.priority || 'normal',
    })
    setDialogOpen(true)
  }

  const handleBulkAction = async () => {
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

  const handleExportCSV = () => {
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

  const toggleBulkSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCellClick = (date: string, hour: string) => {
    const endHour = `${(parseInt(hour, 10) + 1).toString().padStart(2, '0')}:00`
    setForm({ ...emptyForm, date, startTime: hour, endTime: endHour })
    setDialogOpen(true)
  }

  // ---- Efficiency metrics ----
  const efficiencyMetrics = useMemo(() => {
    const total = slots.length
    const completed = slots.filter((s) => s.status === 'completed').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const inProgress = slots.filter((s) => s.status === 'in_progress').length
    const cancelled = slots.filter((s) => s.status === 'cancelled').length
    return { total, completed, inProgress, cancelled, completionRate }
  }, [slots])

  // ====================== RENDER ======================

  const weekRangeLabel = `${new Date(weekDates[0]).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })} - ${new Date(weekDates[6]).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('planner.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('planner.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('planner.refresh')}
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('planner.newSlot')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="h-4 w-4 mr-1" />{t('planner.tabOverview')}</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs"><Calendar className="h-4 w-4 mr-1" />{t('planner.tabWeekly')}</TabsTrigger>
          <TabsTrigger value="slots" className="text-xs"><List className="h-4 w-4 mr-1" />{t('planner.tabSlots')}</TabsTrigger>
          <TabsTrigger value="gantt" className="text-xs"><GanttChart className="h-4 w-4 mr-1" />{t('planner.tabGantt')}</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs"><LayoutGrid className="h-4 w-4 mr-1" />{t('planner.tabAvailability')}</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs"><TrendingUp className="h-4 w-4 mr-1" />{t('planner.tabAnalytics')}</TabsTrigger>
        </TabsList>

        {/* ========== TAB 1: OVERVIEW ========== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label={t('planner.kpiTotalSlots')} value={dashboardStats.totalSlots} icon={CalendarRange} />
            <KpiCard label={t('planner.kpiTodaySlots')} value={dashboardStats.todaySlots} icon={Clock} valueColor="text-amber-600" />
            <KpiCard label={t('planner.kpiActiveEmployees')} value={dashboardStats.activeEmployees} icon={Users} valueColor="text-primary" />
            <KpiCard label={t('planner.kpiTotalHours')} value={`${dashboardStats.totalHours.toFixed(1)}h`} icon={CheckCircle2} valueColor="text-green-600" />
            <KpiCard label={t('planner.kpiUtilization')} value={`${dashboardStats.utilization}%`} icon={TrendingUp} valueColor={dashboardStats.utilization > 80 ? 'text-red-600' : 'text-green-600'} />
            <KpiCard label={t('planner.kpiOverbooked')} value={dashboardStats.overbookedCount} icon={AlertCircle} valueColor={dashboardStats.overbookedCount > 0 ? 'text-red-600' : 'text-green-600'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.weeklyDistribution')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="planirano" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ostvareno" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.employeeWorkload')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={projectPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {projectPieData.map((_, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.upcomingWeek')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingWeek.map((day) => (
                    <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-10">{day.day}</span>
                        <span className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{day.count} {t('planner.slots')}</Badge>
                        <span className="text-xs font-medium">{day.hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ConflictAlert employees={employees} slots={slots} t={t} />
          </div>
        </TabsContent>

        {/* ========== TAB 2: WEEKLY CALENDAR ========== */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[180px] text-center">{weekRangeLabel}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>{t('planner.today')}</Button>
            </div>
            <Select value={calendarEmployeeFilter} onValueChange={setCalendarEmployeeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('planner.allEmployees')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('planner.allEmployees')}</SelectItem>
                {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-2 overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Day headers with total hours */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-xs font-medium text-muted-foreground">{t('planner.time')}</div>
                  {weekDates.map((date, i) => {
                    const isToday = date === todayStr
                    const dayHours = calendarSlots.filter((s) => s.date === date).reduce((sum, s) => sum + (s.hours || 0), 0)
                    return (
                      <div key={date} className={`p-2 text-center border-l ${isToday ? 'bg-primary/5' : ''}`}>
                        <div className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{DAY_NAMES_SR[i]}</div>
                        <div className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {new Date(date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{dayHours.toFixed(1)}h</div>
                      </div>
                    )
                  })}
                </div>
                {/* Time grid */}
                <div className="max-h-[500px] overflow-y-auto">
                  {TIME_SLOTS.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b last:border-0">
                      <div className="p-1 text-[10px] text-muted-foreground text-center border-r flex items-center justify-center">{hour}</div>
                      {weekDates.map((date) => {
                        const isToday = date === todayStr
                        const hourSlots = calendarSlots.filter((s) => s.date === date && s.startTime <= hour && s.endTime > hour)
                        const hasConflict = hourSlots.length > 1
                        return (
                          <div
                            key={`${date}-${hour}`}
                            className={`min-h-[40px] border-l p-0.5 cursor-pointer hover:bg-muted/30 ${isToday ? 'bg-primary/[0.02]' : ''} ${hasConflict ? 'bg-red-50' : ''}`}
                            onClick={() => handleCellClick(date, hour)}
                          >
                            {hourSlots.map((s) => {
                              const proj = projects.find((p) => p.id === s.projectId)
                              const bgColor = proj?.color || '#6366f1'
                              return (
                                <div
                                  key={s.id}
                                  className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium"
                                  style={{ backgroundColor: bgColor }}
                                  onClick={(e) => { e.stopPropagation(); setSelected(s); setDetailOpen(true) }}
                                >
                                  {s.employeeName?.split(' ')[0]} · {s.projectName?.split(' ')[0]}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB 3: SLOTS LIST ========== */}
        <TabsContent value="slots" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('planner.searchSlots')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Input type="date" className="w-[160px]" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('planner.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('planner.allStatuses')}</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('planner.allEmployees')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('planner.allEmployees')}</SelectItem>
                {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('planner.allProjects')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('planner.allProjects')}</SelectItem>
                {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>

          {bulkSelected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">{bulkSelected.size} {t('planner.selected')}</span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('planner.bulkAction')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">{t('planner.statusPlanned')}</SelectItem>
                  <SelectItem value="in_progress">{t('planner.statusInProgress')}</SelectItem>
                  <SelectItem value="completed">{t('planner.statusCompleted')}</SelectItem>
                  <SelectItem value="cancelled">{t('planner.statusCancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> {t('planner.apply')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setBulkSelected(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredSlots.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarRange className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('planner.noSlots')}</p>
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> {t('planner.createSlot')}</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-3 w-8"><Checkbox checked={bulkSelected.size === filteredSlots.length && filteredSlots.length > 0} onCheckedChange={(checked) => {
                        if (checked) setBulkSelected(new Set(filteredSlots.map((s) => s.id)))
                        else setBulkSelected(new Set())
                      }} /></th>
                      <th className="p-3">{t('planner.employee')}</th>
                      <th className="p-3">{t('planner.project')}</th>
                      <th className="p-3">{t('planner.task')}</th>
                      <th className="p-3">{t('planner.date')}</th>
                      <th className="p-3">{t('planner.time')}</th>
                      <th className="p-3">{t('planner.hours')}</th>
                      <th className="p-3">{t('planner.status')}</th>
                      <th className="p-3">{t('planner.priority')}</th>
                      <th className="p-3">{t('planner.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map((s) => {
                      const cfg = statusConfig[s.status]
                      const priCfg = priorityConfig[s.priority || 'normal']
                      return (
                        <tr key={s.id} className="border-t hover:bg-muted/30">
                          <td className="p-3">
                            <Checkbox checked={bulkSelected.has(s.id)} onCheckedChange={() => toggleBulkSelect(s.id)} />
                          </td>
                          <td className="p-3 font-medium">{s.employeeName || '-'}</td>
                          <td className="p-3 text-xs">{s.projectName || '-'}</td>
                          <td className="p-3 text-xs max-w-[150px] truncate">{s.task || '-'}</td>
                          <td className="p-3 text-xs">{new Date(s.date).toLocaleDateString('sr-RS')}</td>
                          <td className="p-3 text-xs">{s.startTime}-{s.endTime}</td>
                          <td className="p-3 text-xs font-medium">{s.hours}h</td>
                          <td className="p-3"><Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || s.status}</Badge></td>
                          <td className="p-3"><Badge variant="outline" className={`text-[10px] ${priCfg?.color || ''}`}>{priCfg?.label || s.priority}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(s); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDuplicate(s)}><Copy className="h-3.5 w-3.5" /></Button>
                              {s.status === 'planned' && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateStatus(s.id, 'in_progress')}><Edit3 className="h-3.5 w-3.5" /></Button>}
                              {s.status === 'in_progress' && <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateStatus(s.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ========== TAB 4: GANTT ========== */}
        <TabsContent value="gantt" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t('planner.ganttTitle')}</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={ganttScale} onValueChange={(v) => setGanttScale(v as 'day' | 'week')}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t('planner.dayScale')}</SelectItem>
                  <SelectItem value="week">{t('planner.weekScale')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <div className="space-y-2 min-w-[800px]">
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs ml-4">
                    <div className="w-3 h-3 rounded bg-amber-500 rotate-45" />
                    <span>{t('planner.milestone')}</span>
                  </div>
                </div>

                {ganttData.map((item) => {
                  const startMs = new Date(item.startDate).getTime()
                  const endMs = new Date(item.endDate).getTime()
                  const todayMs = new Date(todayStr).getTime()
                  const totalRange = Math.max(endMs - startMs, 86400000)
                  const leftPct = Math.max(0, Math.min(100, ((todayMs - 7 * 86400000 - startMs) / (21 * 86400000)) * 100))
                  const widthPct = Math.max(2, (totalRange / (21 * 86400000)) * 100)

                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-[180px] shrink-0 text-xs truncate">
                        <div className="font-medium">{item.employeeName}</div>
                        <div className="text-muted-foreground">{item.projectName}</div>
                      </div>
                      <div className="flex-1 relative h-8 bg-muted/30 rounded">
                        {/* Today marker */}
                        <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${((todayMs - (todayMs - 7 * 86400000)) / (21 * 86400000)) * 100}%` }} />
                        {item.isMilestone ? (
                          <div
                            className="absolute top-1 w-3 h-3 bg-amber-500 rotate-45"
                            style={{ left: `${leftPct}%` }}
                            title={`${item.projectName} - ${t('planner.milestone')}`}
                          />
                        ) : (
                          <div
                            className="absolute top-1 h-6 rounded flex items-center px-2 text-[10px] text-white font-medium"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: item.color }}
                          >
                            <span className="truncate">{item.progress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="w-[80px] text-right">
                        {!item.isMilestone && (
                          <Progress value={item.progress} className="h-2 w-16 ml-auto" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB 5: AVAILABILITY CALENDAR ========== */}
        <TabsContent value="availability" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t('planner.availabilityTitle')}</h3>
          </div>

          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground w-[140px]">{t('planner.employee')}</th>
                      {weekDates.map((date, i) => (
                        <th key={date} className={`p-2 text-center text-xs font-medium ${date === todayStr ? 'text-primary bg-primary/5 rounded' : 'text-muted-foreground'}`}>
                          <div>{DAY_NAMES_SR[i]}</div>
                          <div className="text-[10px]">{new Date(date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}</div>
                        </th>
                      ))}
                      <th className="p-2 text-center text-xs font-medium text-muted-foreground">{t('planner.weekTotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const empAvail = availabilityData[emp.id] || []
                      let weekTotal = 0
                      return (
                        <tr key={emp.id} className="border-b last:border-0">
                          <td className="p-2 font-medium text-xs">{emp.name}</td>
                          {weekDates.map((date) => {
                            const day = empAvail.find((a) => a.date === date)
                            const hours = day?.hours || 0
                            weekTotal += hours
                            const status = day?.status || 'available'
                            let bgClass = 'bg-green-100 text-green-700'
                            if (status === 'unavailable') bgClass = 'bg-red-100 text-red-700'
                            else if (status === 'partial') bgClass = 'bg-amber-100 text-amber-700'
                            return (
                              <td key={date} className={`p-1 text-center ${date === todayStr ? 'bg-primary/5' : ''}`}>
                                <div className={`rounded px-2 py-1 text-[10px] ${bgClass}`}>
                                  {hours > 0 ? `${hours}h` : (day?.reason || '-')}
                                </div>
                              </td>
                            )
                          })}
                          <td className="p-2 text-center">
                            <span className={`text-xs font-medium ${weekTotal >= 40 ? 'text-green-600' : weekTotal >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                              {weekTotal}h
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Team availability summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('planner.teamAvailability')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {employees.map((emp) => {
                  const empAvail = availabilityData[emp.id] || []
                  const thisWeek = empAvail.filter((d) => weekDates.includes(d.date))
                  const available = thisWeek.filter((d) => d.status === 'available').length
                  const partial = thisWeek.filter((d) => d.status === 'partial').length
                  const unavailable = thisWeek.filter((d) => d.status === 'unavailable').length
                  const totalHours = thisWeek.reduce((s, d) => s + d.hours, 0)
                  const pct = Math.round((totalHours / 40) * 100)
                  return (
                    <div key={emp.id} className="text-center">
                      <div className="text-xs font-medium mb-2">{emp.name.split(' ')[0]}</div>
                      <Progress value={pct} className="h-2 mb-1" />
                      <div className="text-[10px] text-muted-foreground">
                        {available} {t('planner.fullDays')}, {partial} {t('planner.partialDays')}, {unavailable} {t('planner.offDays')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB 6: ANALYTICS ========== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.monthlyTrend')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="planirano" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ostvareno" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.employeeUtilization')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={employeeUtilData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="planirano" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="kapacitet" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.projectAllocation')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={projectPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name.split(' ')[0]} ${value}h`}>
                      {projectPieData.map((_, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t('planner.efficiencyMetrics')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('planner.completionRate')}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={efficiencyMetrics.completionRate} className="h-2 w-32" />
                      <span className="text-sm font-medium">{efficiencyMetrics.completionRate}%</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('planner.totalSlots')}</span>
                      <p className="font-bold">{efficiencyMetrics.total}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('planner.completed')}</span>
                      <p className="font-bold text-green-600">{efficiencyMetrics.completed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('planner.inProgress')}</span>
                      <p className="font-bold text-amber-600">{efficiencyMetrics.inProgress}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('planner.cancelled')}</span>
                      <p className="font-bold text-red-600">{efficiencyMetrics.cancelled}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overtime analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {t('planner.overtimeAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overtimeData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('planner.noOvertime')}</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="p-3">{t('planner.employee')}</th>
                        <th className="p-3">{t('planner.totalHours')}</th>
                        <th className="p-3">{t('planner.capacity')}</th>
                        <th className="p-3">{t('planner.overtime')}</th>
                        <th className="p-3">{t('planner.overCapacity')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeData.map((row) => (
                        <tr key={row.name} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{row.name}</td>
                          <td className="p-3">{row.total}h</td>
                          <td className="p-3">{row.capacity}h</td>
                          <td className="p-3 text-red-600 font-medium">{row.overtime}h</td>
                          <td className="p-3">
                            <Progress value={Math.min(100, (row.total / row.capacity) * 100)} className="h-2 w-24" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource conflicts report */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                {t('planner.resourceConflicts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConflictAlert employees={employees} slots={slots} t={t} />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {t('planner.conflictsSummary', { count: String(slots.filter((s) => s.status !== 'cancelled').length) })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========== CREATE / EDIT DIALOG ========== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('planner.newSlotTitle')}</DialogTitle></DialogHeader>
          <SlotForm form={form} setForm={setForm} employees={employees} projects={projects} t={t} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('planner.cancel')}</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> {t('planner.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== DETAIL DIALOG ========== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('planner.slotDetails')}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('planner.employee')}:</span> <span className="font-medium">{selected.employeeName || '-'}</span></div>
                <div>
                  <span className="text-muted-foreground">{t('planner.status')}:</span>{' '}
                  <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
                </div>
                <div><span className="text-muted-foreground">{t('planner.date')}:</span> {new Date(selected.date).toLocaleDateString('sr-RS')}</div>
                <div><span className="text-muted-foreground">{t('planner.time')}:</span> {selected.startTime} - {selected.endTime} ({selected.hours}h)</div>
                <div><span className="text-muted-foreground">{t('planner.project')}:</span> {selected.projectName || '-'}</div>
                <div>
                  <span className="text-muted-foreground">{t('planner.priority')}:</span>{' '}
                  <Badge variant="outline" className={priorityConfig[selected.priority || 'normal']?.color}>{priorityConfig[selected.priority || 'normal']?.label}</Badge>
                </div>
              </div>
              <Separator />
              {selected.task && <div className="text-sm"><span className="text-muted-foreground">{t('planner.task')}:</span> {selected.task}</div>}
              {selected.notes && <div className="text-sm"><span className="text-muted-foreground">{t('planner.notes')}:</span> {selected.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
