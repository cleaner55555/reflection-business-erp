 
'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, XCircle, AlertTriangle,
  TrendingUp, CalendarDays, Users, UserCog, BarChart3,
  ChevronLeft, ChevronRight, Copy, Palette
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Employee {
  id: string
  name: string
  department: string
  position: string
  email: string
  phone: string
  skills: string[]
  availability: string
  maxHours: number
  currentHours: number
  hourlyRate: number
  status: string
}

interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  type: string
  location: string
  department: string
  status: string
  notes: string
  breakMinutes: number
  overtimeMinutes: number
}

interface ScheduleTemplate {
  id: string
  name: string
  description: string
  department: string
  shifts: TemplateShift[]
  isDefault: boolean
}

interface TemplateShift {
  day: string
  startTime: string
  endTime: string
  breakMinutes: number
}

interface WorkforceStats {
  totalEmployees: number
  activeEmployees: number
  departments: Array<{ name: string; count: number; avgHours: number }>
  weeklyHours: Array<{ day: string; scheduled: number; actual: number }>
  overtimeAlerts: number
  coverageGaps: number
  laborCost: number
  utilizationRate: number
  absenceRate: number
  skillGaps: Array<{ skill: string; needed: number; available: number }>
}

// ============ CONFIG ============

const SHIFT_TYPES: Record<string, { label: string; color: string }> = {
  morning: { label: 'Jutarnja', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  afternoon: { label: 'Popodnevna', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  night: { label: 'Noćna', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  weekend: { label: 'Vikend', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  holiday: { label: 'Praznik', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  overtime: { label: 'Prekovremeno', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

const DAYS = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja']

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// ============ MOCK DATA ============

const mockEmployees: Employee[] = [
  { id: 'e-1', name: 'Marko Petrović', department: 'Proizvodnja', position: 'Tehničar', email: 'marko@company.rs', phone: '+381631112233', skills: ['CNC operacija', 'QA Kontrola'], availability: 'full', maxHours: 40, currentHours: 38, hourlyRate: 1200, status: 'active' },
  { id: 'e-2', name: 'Ana Nikolić', department: 'Proizvodnja', position: 'Operater', email: 'ana@company.rs', phone: '+381642233445', skills: ['Zavarivanje'], availability: 'full', maxHours: 40, currentHours: 40, hourlyRate: 1100, status: 'active' },
  { id: 'e-3', name: 'Jelena Stanković', department: 'Magacin', position: 'Koordinator', email: 'jelena@company.rs', phone: '+381653344556', skills: ['Forklift', 'QA Kontrola'], availability: 'full', maxHours: 40, currentHours: 36, hourlyRate: 1300, status: 'active' },
  { id: 'e-4', name: 'Petar Jovanović', department: 'Magacin', position: 'Operater', email: 'petar@company.rs', phone: '+381664455667', skills: ['Forklift'], availability: 'full', maxHours: 40, currentHours: 42, hourlyRate: 1000, status: 'active' },
  { id: 'e-5', name: 'Ivana Đorđević', department: 'Prodaja', position: 'Menadžer', email: 'ivana@company.rs', phone: '+381675566778', skills: ['Prodaja'], availability: 'full', maxHours: 40, currentHours: 35, hourlyRate: 1500, status: 'active' },
  { id: 'e-6', name: 'Nikola Milić', department: 'IT', position: 'Inženjer', email: 'nikola@company.rs', phone: '+381686677889', skills: ['Programiranje'], availability: 'full', maxHours: 40, currentHours: 40, hourlyRate: 2000, status: 'active' },
  { id: 'e-7', name: 'Sara Kovačević', department: 'Marketing', position: 'Administrator', email: 'sara@company.rs', phone: '+381697788990', skills: ['Dizajn', 'Markteting'], availability: 'part', maxHours: 20, currentHours: 18, hourlyRate: 1400, status: 'active' },
  { id: 'e-8', name: 'Dragan Ilić', department: 'Bezbednost', position: 'Supervizor', email: 'dragan@company.rs', phone: '+381608899001', skills: ['Vozač B kategorije'], availability: 'full', maxHours: 40, currentHours: 44, hourlyRate: 1100, status: 'active' },
  { id: 'e-9', name: 'Milica Radovanović', department: 'Proizvodnja', position: 'Operater', email: 'milica@company.rs', phone: '+381619900112', skills: ['CNC operacija', 'Zavarivanje'], availability: 'full', maxHours: 40, currentHours: 0, hourlyRate: 1050, status: 'on_leave' },
  { id: 'e-10', name: 'Stefan Marković', department: 'HR', position: 'Menadžer', email: 'stefan@company.rs', phone: '+381620011223', skills: [], availability: 'full', maxHours: 40, currentHours: 38, hourlyRate: 1600, status: 'active' },
]

const mockShifts: Shift[] = [
  { id: 'sh-1', employeeId: 'e-1', employeeName: 'Marko Petrović', date: '2025-01-20', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Fabrika A', department: 'Proizvodnja', status: 'confirmed', notes: '', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-2', employeeId: 'e-2', employeeName: 'Ana Nikolić', date: '2025-01-20', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Fabrika A', department: 'Proizvodnja', status: 'confirmed', notes: 'Kontrola kvaliteta', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-3', employeeId: 'e-3', employeeName: 'Jelena Stanković', date: '2025-01-20', startTime: '07:00', endTime: '15:00', type: 'morning', location: 'Magacin Centralni', department: 'Magacin', status: 'confirmed', notes: '', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-4', employeeId: 'e-4', employeeName: 'Petar Jovanović', date: '2025-01-20', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'Magacin Centralni', department: 'Magacin', status: 'pending', notes: 'Prekovremeni sati', breakMinutes: 30, overtimeMinutes: 120 },
  { id: 'sh-5', employeeId: 'e-5', employeeName: 'Ivana Đorđević', date: '2025-01-20', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Retail BG', department: 'Prodaja', status: 'confirmed', notes: '', breakMinutes: 60, overtimeMinutes: 0 },
  { id: 'sh-6', employeeId: 'e-6', employeeName: 'Nikola Milić', date: '2025-01-20', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Kancelarija', department: 'IT', status: 'confirmed', notes: '', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-7', employeeId: 'e-8', employeeName: 'Dragan Ilić', date: '2025-01-20', startTime: '22:00', endTime: '06:00', type: 'night', location: 'Fabrika A', department: 'Bezbednost', status: 'confirmed', notes: '', breakMinutes: 60, overtimeMinutes: 240 },
  { id: 'sh-8', employeeId: 'e-1', employeeName: 'Marko Petrović', date: '2025-01-21', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Fabrika A', department: 'Proizvodnja', status: 'draft', notes: '', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-9', employeeId: 'e-2', employeeName: 'Ana Nikolić', date: '2025-01-21', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'Fabrika A', department: 'Proizvodnja', status: 'draft', notes: '', breakMinutes: 30, overtimeMinutes: 0 },
  { id: 'sh-10', employeeId: 'e-7', employeeName: 'Sara Kovačević', date: '2025-01-21', startTime: '10:00', endTime: '14:00', type: 'morning', location: 'Kancelarija', department: 'Marketing', status: 'draft', notes: 'Part-time', breakMinutes: 0, overtimeMinutes: 0 },
]

const mockStats: WorkforceStats = {
  totalEmployees: 10, activeEmployees: 9, overtimeAlerts: 3, coverageGaps: 2,
  laborCost: 585600, utilizationRate: 88, absenceRate: 10,
  departments: [
    { name: 'Proizvodnja', count: 3, avgHours: 37 },
    { name: 'Magacin', count: 2, avgHours: 39 },
    { name: 'Prodaja', count: 1, avgHours: 35 },
    { name: 'IT', count: 1, avgHours: 40 },
    { name: 'Marketing', count: 1, avgHours: 18 },
    { name: 'Bezbednost', count: 1, avgHours: 44 },
    { name: 'HR', count: 1, avgHours: 38 },
  ],
  weeklyHours: [
    { day: 'Pon', scheduled: 72, actual: 68 },
    { day: 'Uto', scheduled: 72, actual: 70 },
    { day: 'Sre', scheduled: 70, actual: 65 },
    { day: 'Čet', scheduled: 72, actual: 72 },
    { day: 'Pet', scheduled: 68, actual: 60 },
    { day: 'Sub', scheduled: 20, actual: 18 },
    { day: 'Ned', scheduled: 0, actual: 0 },
  ],
  skillGaps: [
    { skill: 'CNC operacija', needed: 5, available: 2 },
    { skill: 'Zavarivanje', needed: 3, available: 2 },
    { skill: 'Forklift', needed: 3, available: 2 },
    { skill: 'QA Kontrola', needed: 2, available: 2 },
    { skill: 'Programiranje', needed: 2, available: 1 },
  ],
}

// ============ COMPONENT ============

export function PlanerRadneSile() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  const [detailOpen, setDetailOpen] = useState(false)

  const emptyShiftForm = { employeeId: '', date: '', startTime: '08:00', endTime: '16:00', type: 'morning', location: LOCATIONS[0], department: DEPARTMENTS[0], notes: '', breakMinutes: '30' }

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/workforce?companyId=${activeCompanyId}`)
      if (res.ok) { const d = await res.json(); setEmployees(d.employees?.length ? d.employees : mockEmployees); setShifts(d.shifts?.length ? d.shifts : mockShifts); setStats(d.stats || mockStats) }
      else { setEmployees(mockEmployees); setShifts(mockShifts); setStats(mockStats) }
    } catch { setEmployees(mockEmployees); setShifts(mockShifts); setStats(mockStats) }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const getWeekDates = () => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }

  const weekDates = getWeekDates()

  const getShiftsForDate = (date: string) => shifts.filter((s) => s.date === date)

  const getShiftsForEmployee = (empId: string) => shifts.filter((s) => s.employeeId === empId)

  const handleCreateShift = async () => {
    if (!activeCompanyId || !shiftForm.employeeId || !shiftForm.date) return
    try {
      const emp = employees.find((e) => e.id === shiftForm.employeeId)
      const res = await fetch('/api/workforce', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...shiftForm, employeeName: emp?.name || '', status: 'draft' }),
      })
      if (res.ok) { setCreateOpen(false); setShiftForm(emptyShiftForm); loadData(); toast.success('Smena kreirana') }
    } catch { /* silent */ }
  }

  const handleStatusChange = async (shiftId: string, status: string) => {
    try { await fetch('/api/workforce', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: shiftId, status }) }); loadData(); toast.success('Status ažuriran') }
    catch { /* silent */ }
  }

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Obrisati smenu?')) return
    await fetch(`/api/workforce?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  const activeEmps = employees.filter((e) => e.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planer Radne Sile</h1>
          <p className="text-sm text-muted-foreground">Planiranje smena, rasporeda i opterećenja zaposlenih</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => { setShiftForm(emptyShiftForm); setCreateOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Nova smena</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="schedule"><CalendarDays className="h-4 w-4 mr-1" /> Raspored</TabsTrigger>
          <TabsTrigger value="employees"><Users className="h-4 w-4 mr-1" /> Zaposleni</TabsTrigger>
          <TabsTrigger value="overtime"><AlertTriangle className="h-4 w-4 mr-1" /> Prekovremeno</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivni</span><Users className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold text-blue-600">{stats.activeEmployees}<span className="text-sm text-muted-foreground">/{stats.totalEmployees}</span></p><p className="text-[10px] text-muted-foreground">{stats.absenceRate}% odsustvo</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Utilizacija</span><TrendingUp className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{stats.utilizationRate}%</p><Progress value={stats.utilizationRate} className="mt-2 h-2" /></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Troškovi rada</span><UserCog className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold">{formatCurrency(stats.laborCost)}</p><p className="text-[10px] text-muted-foreground">mesečni</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Upozorenja</span><AlertTriangle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{stats.overtimeAlerts + stats.coverageGaps}</p><p className="text-[10px] text-muted-foreground">{stats.overtimeAlerts} prekovremene · {stats.coverageGaps} gapova</p></Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Sati po danima (ova sedmica)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {stats.weeklyHours.map((d) => {
                      const max = Math.max(...stats.weeklyHours.map((x) => x.scheduled), 1)
                      return (
                        <div key={d.day} className="flex items-center gap-3">
                          <span className="text-xs w-10">{d.day}</span>
                          <div className="flex-1 grid grid-cols-2 gap-1">
                            <div className="flex items-center gap-1"><div className="flex-1 bg-primary/20 rounded-full h-3"><div className="h-3 rounded-full bg-primary" style={{ width: `${(d.scheduled / max) * 100}%` }} /></div><span className="text-[9px] text-muted-foreground w-6">{d.scheduled}h</span></div>
                            <div className="flex items-center gap-1"><div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-full h-3"><div className="h-3 rounded-full bg-green-500" style={{ width: `${(d.actual / max) * 100}%` }} /></div><span className="text-[9px] text-green-600 w-6">{d.actual}h</span></div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Odeljenja - prosečni sati</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.departments.map((d) => {
                      const pct = (d.avgHours / 40) * 100
                      return (
                        <div key={d.name} className="flex items-center gap-3">
                          <span className="text-xs w-24 truncate">{d.name}</span>
                          <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                          <span className="text-xs font-medium w-10 text-right">{d.avgHours}h</span>
                          <span className="text-[10px] text-muted-foreground w-8 text-right">{d.count}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedostatak veština</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {stats.skillGaps.map((g) => {
                    const hasGap = g.available < g.needed
                    return (
                      <div key={g.skill} className="flex items-center gap-3">
                        <span className="text-xs w-32">{g.skill}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${hasGap ? 'bg-red-400' : 'bg-green-500'}`} style={{ width: `${(g.available / Math.max(g.needed, 1)) * 100}%` }} /></div>
                          <span className="text-xs font-medium w-16 text-right">{g.available}/{g.needed}</span>
                        </div>
                        {hasGap && <Badge variant="outline" className="text-[9px] text-red-500">-{g.needed - g.available}</Badge>}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== RASPORED ===== */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-medium min-w-[180px] text-center">{formatDate(weekDates[0])} — {formatDate(weekDates[6])}</span>
              <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
              {weekOffset !== 0 && <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Danas</Button>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeptFilter('Svi')}>Svi</Button>
              {DEPARTMENTS.slice(0, 4).map((d) => <Button key={d} variant={deptFilter === d ? 'default' : 'outline'} size="sm" onClick={() => setDeptFilter(d)}>{d}</Button>)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-muted p-2 text-xs font-medium">Zaposleni</div>
                {DAYS_SHORT.map((d, i) => <div key={d} className={`bg-muted p-2 text-center text-xs font-medium ${i >= 5 ? 'text-red-500' : ''}`}>{d}<br /><span className="text-[9px] text-muted-foreground">{new Date(weekDates[i]).getDate()}</span></div>)}

                {/* Rows */}
                {activeEmps.filter((e) => deptFilter === 'Svi' || e.department === deptFilter).map((emp) => (
                  <div key={emp.id} className="contents">
                    <div className="bg-background p-2 text-xs font-medium truncate border-b">{emp.name}<br /><span className="text-[10px] text-muted-foreground">{emp.department}</span></div>
                    {weekDates.map((date) => {
                      const dayShifts = getShiftsForDate(date).filter((s) => s.employeeId === emp.id)
                      return (
                        <div key={date} className={`bg-background p-1.5 min-h-[60px] border-b hover:bg-muted/30 ${new Date(date).getDay() === 0 || new Date(date).getDay() === 6 ? 'bg-muted/10' : ''}`}>
                          {dayShifts.length > 0 ? dayShifts.map((s) => {
                            const st = SHIFT_TYPES[s.type]
                            return (
                              <div key={s.id} className={`rounded p-1 mb-1 text-[9px] cursor-pointer hover:opacity-80 ${st?.color}`}>
                                <div className="font-medium">{s.startTime}-{s.endTime}</div>
                                <div className="text-[8px] opacity-70">{s.location}</div>
                                {s.overtimeMinutes > 0 && <div className="text-[8px] text-red-500 font-medium">+{s.overtimeMinutes}min</div>}
                              </div>
                            )
                          }) : <div className="h-full flex items-center justify-center text-muted-foreground/30 text-lg">—</div>}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(SHIFT_TYPES).map(([k, v]) => <div key={k} className="flex items-center gap-1"><div className={`h-3 w-3 rounded ${v.color}`} /><span className="text-[10px] text-muted-foreground">{v.label}</span></div>)}
          </div>
        </TabsContent>

        {/* =====ZAPOSLENI ===== */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži zaposlene..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          <div className="space-y-3">
            {employees.filter((e) => {
              if (search) { const s = search.toLowerCase(); return e.name.toLowerCase().includes(s) || e.department.toLowerCase().includes(s) || e.position.toLowerCase().includes(s) }
              return true
            }).map((e) => {
              const pct = (e.currentHours / e.maxHours) * 100
              const empShifts = getShiftsForEmployee(e.id)
              return (
                <Card key={e.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedEmployee(e); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{e.name}</span>
                          <Badge variant="secondary" className="text-[10px]">{e.department}</Badge>
                          <Badge variant="outline" className="text-[10px]">{e.position}</Badge>
                          {e.status === 'on_leave' && <Badge className="text-[10px] bg-amber-100 text-amber-700">Na odsustvu</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Max: {e.maxHours}h</span>
                          <span>Trenutno: <strong className={e.currentHours > e.maxHours ? 'text-red-500' : ''}>{e.currentHours}h</strong></span>
                          <span>{formatCurrency(e.hourlyRate)}/h</span>
                          <span>Smene ovaj mesec: {empShifts.length}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                          <span className="text-[10px]">{pct.toFixed(0)}%</span>
                        </div>
                        {e.skills.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{e.skills.map((sk) => <Badge key={sk} variant="outline" className="text-[9px]">{sk}</Badge>)}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== PREKOVREMENO ===== */}
        <TabsContent value="overtime" className="space-y-4">
          {(() => {
            const otShifts = shifts.filter((s) => s.overtimeMinutes > 0)
            const overloadedEmps = activeEmps.filter((e) => e.currentHours > e.maxHours)
            return (
              <>
                {overloadedEmps.length > 0 && (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3"><AlertTriangle className="h-5 w-5 text-red-500" /><span className="text-sm font-medium text-red-700 dark:text-red-400">{overloadedEmps.length} zaposlenih prekoračilo limit sati</span></div>
                    <div className="space-y-2">
                      {overloadedEmps.map((e) => (
                        <div key={e.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-900/50">
                          <div><span className="text-sm">{e.name}</span><span className="text-xs text-muted-foreground ml-2">{e.department}</span></div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs">{e.currentHours}/{e.maxHours}h</span>
                            <Badge className="text-[10px] bg-red-100 text-red-700">+{e.currentHours - e.maxHours}h prekovremeno</Badge>
                            <span className="text-xs font-medium text-red-600">{formatCurrency((e.currentHours - e.maxHours) * e.hourlyRate * 1.5)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Smena sa prekovremenim</CardTitle></CardHeader>
                  <CardContent>
                    {otShifts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nema prekovremenih smena</p> : (
                      <div className="space-y-2">
                        {otShifts.map((s) => {
                          const st = SHIFT_TYPES[s.type]
                          const emp = employees.find((e) => e.id === s.employeeId)
                          const otCost = (s.overtimeMinutes / 60) * (emp?.hourlyRate || 0) * 1.5
                          return (
                            <div key={s.id} className="flex items-center justify-between p-2 rounded border">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`text-[10px] ${st?.color}`}>{st?.label}</Badge>
                                <div><p className="text-sm">{s.employeeName}</p><p className="text-xs text-muted-foreground">{formatDate(s.date)} · {s.startTime}-{s.endTime} · {s.location}</p></div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-[10px] text-red-500">+{s.overtimeMinutes}min</Badge>
                                <p className="text-xs font-medium text-red-600 mt-1">{formatCurrency(otCost)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )
          })()}
        </TabsContent>
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedEmployee && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedEmployee.name}</DialogTitle>
                <DialogDescription>{selectedEmployee.department} · {selectedEmployee.position}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Max sati</p><p className="text-sm font-medium">{selectedEmployee.maxHours}h</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Trenutno</p><p className={`text-sm font-bold ${selectedEmployee.currentHours > selectedEmployee.maxHours ? 'text-red-600' : ''}`}>{selectedEmployee.currentHours}h</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Satnica</p><p className="text-sm font-medium">{formatCurrency(selectedEmployee.hourlyRate)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Dostupnost</p><p className="text-sm font-medium">{selectedEmployee.availability === 'full' ? 'Puno radno vreme' : 'Part-time'}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground mb-1">Veštine</p><div className="flex flex-wrap gap-1">{selectedEmployee.skills.length > 0 ? selectedEmployee.skills.map((sk) => <Badge key={sk} variant="outline" className="text-[10px]">{sk}</Badge>) : <span className="text-xs text-muted-foreground">Nije definisano</span>}</div></div>
              <div><p className="text-sm font-medium mb-2">Smene ({getShiftsForEmployee(selectedEmployee.id).length})</p><ScrollArea className="max-h-[200px]"><div className="space-y-1">{getShiftsForEmployee(selectedEmployee.id).map((s) => { const st = SHIFT_TYPES[s.type]; return <div key={s.id} className="flex items-center justify-between p-2 rounded border text-xs"><div className="flex items-center gap-2"><Badge variant="outline" className={`text-[9px] ${st?.color}`}>{st?.label}</Badge><span>{formatDate(s.date)}</span><span>{s.startTime}-{s.endTime}</span><span className="text-muted-foreground">{s.location}</span></div><Badge variant="outline" className="text-[9px]">{s.status === 'confirmed' ? 'Potvrđena' : s.status === 'pending' ? 'Na čekanju' : 'Nacrt'}</Badge></div> })}</div></ScrollArea></div>
              <div><p className="text-sm font-medium mb-2">Kontakt</p><p className="text-xs text-muted-foreground">{selectedEmployee.email} · {selectedEmployee.phone}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== CREATE SHIFT DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova smena</DialogTitle><DialogDescription>Dodeli smenu zaposlenom</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Zaposleni *</Label><Select value={shiftForm.employeeId} onValueChange={(v) => { const emp = employees.find((e) => e.id === v); setShiftForm({ ...shiftForm, employeeId: v, department: emp?.department || DEPARTMENTS[0] }) }}><SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger><SelectContent>{activeEmps.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} - {e.department}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Datum *</Label><Input type="date" value={shiftForm.date} onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tip</Label><Select value={shiftForm.type} onValueChange={(v) => setShiftForm({ ...shiftForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(SHIFT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Početak</Label><Input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kraj</Label><Input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Lokacija</Label><Select value={shiftForm.location} onValueChange={(v) => setShiftForm({ ...shiftForm, location: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Pauza (min)</Label><Input type="number" value={shiftForm.breakMinutes} onChange={(e) => setShiftForm({ ...shiftForm, breakMinutes: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Napomene</Label><Textarea rows={2} value={shiftForm.notes} onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateShift} disabled={!shiftForm.employeeId || !shiftForm.date}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
