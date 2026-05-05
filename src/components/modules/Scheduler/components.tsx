'use client'

import { useMemo } from 'react'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/checkbox'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/progress'
from '@/components/ui/select'
from '@/components/ui/separator'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , AlertTriangle } from 'lucide-react'
import type { PlanningSlot, Employee, Project, GanttItem, AvailabilityDay } from './types'

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
