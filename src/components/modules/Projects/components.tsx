'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/skeleton'
from '@/components/ui/table'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Circle, Clock, DollarSign, Eye, FolderKanban, ListTodo, Pencil, Play, Plus, Search, Target, Timer, Trash2, TrendingUp, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import type { Project, ProjectTask, TimesheetEntry, Partner } from './types'

function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const allTasks = projects.flatMap(p => p.tasks || [])
    const allTimesheets = projects.flatMap(p => p.timesheetEntries || [])
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'aktivan').length,
      completed: projects.filter(p => p.status === 'zavrsen').length,
      paused: projects.filter(p => p.status === 'pauziran').length,
      totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
      totalSpent: projects.reduce((s, p) => s + (p.spent || 0), 0),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'zavrseno').length,
      overdueTasks: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'zavrseno').length,
      totalHoursLogged: allTimesheets.reduce((s, e) => s + e.hours, 0),
      avgProgress: projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0,
    }
  }, [projects])

  const overdueTasks = useMemo(() => {
    const now = new Date()
    return projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectColor: p.color })))
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'zavrseno')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  }, [projects])

  const recentTasks = useMemo(() => {
    return projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
      .filter(t => t.status === 'u_toku')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8)
  }, [projects])

  const byStatus = useMemo(() => {
    return STATUS_OPTIONS.map(s => ({
      ...s,
      count: projects.filter(p => p.status === s.value).length,
      budget: projects.filter(p => p.status === s.value).reduce((sum, p) => sum + (p.budget || 0), 0),
      spent: projects.filter(p => p.status === s.value).reduce((sum, p) => sum + (p.spent || 0), 0),
    }))
  }, [projects])

  if (loading) return <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard icon={FolderKanban} label="Ukupno" value={stats.total} color="text-foreground" />
        <KpiCard icon={Circle} label="Aktivni" value={stats.active} color="text-emerald-600" />
        <KpiCard icon={CheckCircle2} label="Završeni" value={stats.completed} color="text-blue-600" />
        <KpiCard icon={Clock} label="Pauzirani" value={stats.paused} color="text-amber-600" />
        <KpiCard icon={Target} label="Zadaci" value={`${stats.completedTasks}/${stats.totalTasks}`} color="text-violet-600" />
        <KpiCard icon={AlertTriangle} label="Prekoračeni" value={stats.overdueTasks} color={stats.overdueTasks > 0 ? 'text-red-600' : 'text-foreground'} />
        <KpiCard icon={Timer} label="Sati evidentirani" value={`${stats.totalHoursLogged.toFixed(1)}h`} color="text-teal-600" />
        <KpiCard icon={TrendingUp} label="Prosek napretka" value={`${stats.avgProgress}%`} color="text-indigo-600" />
      </div>

      {/* Budget + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Budžet vs Potrošeno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div><p className="text-xs text-muted-foreground">Ukupan budžet</p><p className="text-xl font-bold">{formatRSD(stats.totalBudget)}</p></div>
                <div className="text-right"><p className="text-xs text-muted-foreground">Potrošeno</p><p className={`text-xl font-bold ${stats.totalBudget > 0 && stats.totalSpent > stats.totalBudget * 0.9 ? 'text-red-600' : 'text-orange-600'}`}>{formatRSD(stats.totalSpent)}</p></div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${stats.totalSpent > stats.totalBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${stats.totalBudget > 0 ? Math.min((stats.totalSpent / stats.totalBudget) * 100, 100) : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Preostalo: <strong>{formatRSD(Math.max(0, stats.totalBudget - stats.totalSpent))}</strong> ({stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%)</p>
              <div className="space-y-2 pt-2 border-t">
                {byStatus.map(s => s.count > 0 && (
                  <div key={s.value} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.dot}`} /><span>{s.label}</span></div>
                    <span className="text-muted-foreground">{s.count} projekata · {formatRSD(s.budget)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Play className="h-4 w-4" />Zadaci u toku ({recentTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {recentTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nema aktivnih zadataka</p>
              ) : recentTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-xs ${task.priority === 'hitan' ? 'text-red-600 font-medium' : ''}`}>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{task.projectName}</span>
                      {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" />Prekoračeni rokovi ({overdueTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {overdueTasks.slice(0, 12).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded bg-white border border-red-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium truncate">{task.title}</span>
                    <span className="text-[10px] text-muted-foreground">— {task.projectName}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-red-100 text-red-700 border-red-200 flex-shrink-0 ml-2">{formatDate(task.dueDate!)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </Card>
  )
}

function ProjectsList() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'kanban'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  // Task state
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' })
  const [newTag, setNewTag] = useState('')
  const [projTags, setProjTags] = useState<string[]>([])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/projects?${params}`)
    setProjects(await res.json())
    setLoading(false)
  }, [statusFilter, priorityFilter, search])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => {
    fetch('/api/partners?limit=200').then(r => r.json()).then((d: Partner[] | { partners?: Partner[] }) => {
      setPartners(Array.isArray(d) ? d : (d.partners || []))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      const texts: string[] = []
      projects.forEach(proj => {
        if (proj.name) texts.push(proj.name)
        if (proj.description) texts.push(proj.description)
        if (proj.assignedTo) texts.push(proj.assignedTo)
        ;(proj.tasks || []).forEach(task => {
          if (task.title) texts.push(task.title)
          if (task.description) texts.push(task.description)
        })
      })
      translateTexts(texts)
    }
  }, [projects, translateTexts])

  const filtered = useMemo(() => projects, [projects])

  const stats = useMemo(() => {
    const allTasks = filtered.flatMap(p => p.tasks || [])
    const allTs = filtered.flatMap(p => p.timesheetEntries || [])
    return {
      totalBudget: filtered.reduce((s, p) => s + (p.budget || 0), 0),
      totalSpent: filtered.reduce((s, p) => s + (p.spent || 0), 0),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'zavrseno').length,
      totalHours: allTs.reduce((s, e) => s + e.hours, 0),
    }
  }, [filtered])

  // ─── Project CRUD ──────────────────────────────────────────────
  const handleNew = () => { setEditing(null); setProjTags([]); setViewMode('form') }
  const handleEdit = (proj: Project) => { setEditing(proj); setProjTags(parseTags(proj.tags)); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditing(null); setExpandedId(null); setProjTags([]) }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati projekat i sve zadatke?')) return
    try { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success('Projekat obrisan'); fetchProjects() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'), description: fd.get('description'), status: fd.get('status'),
      startDate: fd.get('startDate'), endDate: fd.get('endDate') || null,
      budget: fd.get('budget'), priority: fd.get('priority'), assignedTo: fd.get('assignedTo') || null,
      partnerId: fd.get('partnerId') || null, tags: projTags.length > 0 ? JSON.stringify(projTags) : null,
      color: fd.get('color') || null,
    }
    try {
      const url = editing ? `/api/projects/${editing.id}` : '/api/projects'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Projekat ažuriran' : 'Projekat kreiran')
      setViewMode('list'); setEditing(null); setProjTags([]); fetchProjects()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !projTags.includes(tag)) { setProjTags([...projTags, tag]); setNewTag('') }
  }
  const removeTag = (tag: string) => setProjTags(projTags.filter(t => t !== tag))

  // ─── Task CRUD ────────────────────────────────────────────────
  const openAddTask = (projectId: string) => {
    setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' })
    setEditingTask(null); setAddingTaskFor(projectId)
  }
  const openEditTask = (task: ProjectTask) => {
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', assignedTo: task.assignedTo || '', estimatedHours: task.estimatedHours ? String(task.estimatedHours) : '' })
    setEditingTask(task); setAddingTaskFor(task.projectId)
  }
  const cancelTaskForm = () => { setAddingTaskFor(null); setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' }) }

  const saveTask = async () => {
    if (!taskForm.title || !addingTaskFor) return
    try {
      if (editingTask) {
        await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingTask.id, title: taskForm.title, description: taskForm.description || null, priority: taskForm.priority, dueDate: taskForm.dueDate || null, assignedTo: taskForm.assignedTo || null, estimatedHours: Number(taskForm.estimatedHours) || 0 }) })
        toast.success('Zadatak ažuriran')
      } else {
        await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: addingTaskFor, title: taskForm.title, description: taskForm.description || null, priority: taskForm.priority, dueDate: taskForm.dueDate || null, assignedTo: taskForm.assignedTo || null, estimatedHours: Number(taskForm.estimatedHours) || 0 }) })
        toast.success('Zadatak kreiran')
      }
      cancelTaskForm(); fetchProjects()
    } catch { toast.error('Greška') }
  }

  const toggleTask = async (task: ProjectTask) => {
    const newStatus = task.status === 'zavrseno' ? 'todo' : 'zavrseno'
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error('Greška') }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Obrisati zadatak?')) return
    try { await fetch(`/api/project-tasks?id=${taskId}`, { method: 'DELETE' }); toast.success('Zadatak obrisan'); fetchProjects() } catch { toast.error('Greška') }
  }

  const moveTask = async (task: ProjectTask, newStatus: string) => {
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error('Greška') }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!viewMode.includes('form') && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži projekte..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi statusi</SelectItem>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={priorityFilter || 'all'} onValueChange={(v) => setPriorityFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Prioritet" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi</SelectItem>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{filtered.length} projekata</Badge>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Novi projekat</Button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      {!viewMode.includes('form') && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Budžet</p><p className="text-sm font-bold">{formatRSD(stats.totalBudget)}</p></Card>
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Potrošeno</p><p className="text-sm font-bold text-orange-600">{formatRSD(stats.totalSpent)}</p></Card>
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Zadaci</p><p className="text-sm font-bold">{stats.completedTasks}/{stats.totalTasks} ({stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%)</p></Card>
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Sati evidentirani</p><p className="text-sm font-bold text-teal-600">{stats.totalHours.toFixed(1)}h</p></Card>
          <div className="p-3 flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">Pregled</p>
            <div className="flex gap-1">
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'outline'} className="h-7 text-[10px] px-2" onClick={() => setViewMode('list')}><ListTodo className="h-3 w-3" /> Lista</Button>
              <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'outline'} className="h-7 text-[10px] px-2" onClick={() => setViewMode('kanban')}><Target className="h-3 w-3" /> Kanban</Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Form */}
      {viewMode === 'form' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-base font-semibold">{editing ? 'Izmeni projekat' : 'Novi projekat'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Naziv projekta *</Label><Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Redizajn web sajta" /></div>
                <div className="space-y-2"><Label className="text-xs">Partner / Klijent</Label>
                  <Select name="partnerId" defaultValue={editing?.partnerId || ''}>
                    <SelectTrigger><SelectValue placeholder="Izaberi partnera" /></SelectTrigger>
                    <SelectContent>{partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label className="text-xs">Opis</Label><Textarea name="description" defaultValue={editing?.description || ''} rows={3} placeholder="Opišite projekat..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Status</Label>
                  <Select name="status" defaultValue={editing?.status || 'aktivan'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Prioritet</Label>
                  <Select name="priority" defaultValue={editing?.priority || 'srednji'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2"><Label className="text-xs">Početak</Label><Input name="startDate" type="date" defaultValue={editing?.startDate?.split('T')[0] || today} /></div>
                <div className="space-y-2"><Label className="text-xs">Kraj</Label><Input name="endDate" type="date" defaultValue={editing?.endDate?.split('T')[0] || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">Budžet (RSD)</Label><Input name="budget" type="number" step="0.01" defaultValue={editing?.budget || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">Boja</Label>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {PROJECT_COLORS.map(c => (
                      <button key={c} type="button" className={`w-6 h-6 rounded-full border-2 transition-all ${editing?.color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c }} onClick={() => { const inp = document.querySelector('[name="color"]') as HTMLInputElement; if (inp) inp.value = c }} />
                    ))}
                    <input type="hidden" name="color" defaultValue={editing?.color || ''} />
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label className="text-xs">Odgovorna osoba</Label><Input name="assignedTo" defaultValue={editing?.assignedTo || ''} placeholder="Ime zaposlenog" /></div>
              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-xs">Tagovi</Label>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="h-8 text-xs" placeholder="Dodaj tag..." />
                  <Button type="button" variant="outline" size="sm" className="h-8" onClick={addTag}>Dodaj</Button>
                </div>
                {projTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">{projTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] gap-1 pr-1">{tag}<button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button></Badge>
                  ))}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? 'Čuva se...' : 'Sačuvaj'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects - List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Nema projekata za prikaz</div>
            ) : (
              <div className="divide-y">
                {filtered.map((proj) => {
                  const tasks = proj.tasks || []
                  const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
                  const isExpanded = expandedId === proj.id
                  const statusInfo = getStatusInfo(proj.status)
                  const prioInfo = getPriorityInfo(proj.priority)
                  const isOverBudget = proj.budget > 0 && proj.spent > proj.budget
                  const tags = parseTags(proj.tags)
                  const totalTs = (proj.timesheetEntries || []).reduce((s, e) => s + e.hours, 0)

                  return (
                    <div key={proj.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                          {/* Color bar */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {proj.color && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />}
                            <h3 className="text-sm font-semibold">{tc(proj.name)}</h3>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                            <span className={`text-[10px] font-medium ${prioInfo.color}`}>{prioInfo.label}</span>
                            {proj.partner && <Badge variant="outline" className="text-[10px] px-2 py-0 bg-violet-50 text-violet-700 border-violet-200">{proj.partner.name}</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {proj.budget > 0 && <span>Budžet: <span className="font-medium text-foreground">{formatRSD(proj.budget)}</span></span>}
                            <span>Potrošeno: <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>{formatRSD(proj.spent)}</span></span>
                            {tasks.length > 0 && <span>Zadaci: <span className="font-medium text-foreground">{doneTasks}/{tasks.length}</span></span>}
                            {totalTs > 0 && <span><Timer className="h-3 w-3 inline" /> <span className="font-medium text-foreground">{totalTs.toFixed(1)}h</span></span>}
                            {proj.assignedTo && <span><Users className="h-3 w-3 inline" /> <span className="font-medium text-foreground">{tc(proj.assignedTo)}</span></span>}
                          </div>
                          {/* Progress bars */}
                          <div className="mt-2 flex items-center gap-3 flex-wrap">
                            {tasks.length > 0 && (
                              <div className="flex-1 max-w-[200px]">
                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5"><span>Napredak</span><span>{proj.progress}%</span></div>
                                <div className="w-full bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${proj.progress}%` }} /></div>
                              </div>
                            )}
                            {proj.budget > 0 && (
                              <div className="flex-1 max-w-[200px]">
                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5"><span>Budžet</span><span>{Math.round((proj.spent / proj.budget) * 100)}%</span></div>
                                <div className="w-full bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((proj.spent / proj.budget) * 100, 100)}%` }} /></div>
                              </div>
                            )}
                          </div>
                          {(proj.startDate || proj.endDate) && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><CalendarDays className="h-3 w-3" /><span>{formatDate(proj.startDate)}{proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}</span></div>
                          )}
                          {tags.length > 0 && <div className="mt-1.5 flex gap-1 flex-wrap">{tags.map(tag => <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">{tag}</Badge>)}</div>}
                        </div>
                        <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailProject(proj) }}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(proj)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(proj.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      {/* Expanded tasks */}
                      {isExpanded && (
                        <div className="mt-3 border-t pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold">Zadaci ({tasks.length})</h4>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => openAddTask(proj.id)}><Plus className="h-3 w-3" /> Dodaj</Button>
                          </div>
                          {(addingTaskFor === proj.id) && (
                            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                              <div className="flex items-center justify-between"><h4 className="text-xs font-semibold">{editingTask ? 'Izmeni zadatak' : 'Novi zadatak'}</h4><Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelTaskForm}><X className="h-3 w-3" /></Button></div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label className="text-[10px]">Naziv *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="h-8 text-xs" placeholder="Naziv zadatka" /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Prioritet</Label>
                                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1"><Label className="text-[10px]">Rok</Label><Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="h-8 text-xs" /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Zaduženi</Label><Input value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="h-8 text-xs" placeholder="Ime" /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Procena (h)</Label><Input type="number" step="0.5" value={taskForm.estimatedHours} onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })} className="h-8 text-xs" placeholder="0" /></div>
                              </div>
                              <div className="space-y-1"><Label className="text-[10px]">Opis</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="h-16 text-xs" placeholder="Detaljan opis..." /></div>
                              <div className="flex gap-2"><Button size="sm" className="h-7 text-xs" onClick={saveTask}>Sačuvaj</Button><Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelTaskForm}>Otkaži</Button></div>
                            </div>
                          )}
                          {tasks.length === 0 && !(addingTaskFor === proj.id) ? (
                            <p className="text-xs text-muted-foreground py-2">Nema zadataka</p>
                          ) : tasks.map((task) => {
                            const taskInfo = getTaskStatusInfo(task.status)
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno'
                            return (
                              <div key={task.id} className="flex items-center gap-2 py-1.5 group">
                                <button className="flex-shrink-0 cursor-pointer" onClick={() => toggleTask(task)}><CheckCircle2 className={`h-4 w-4 transition-colors ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-400'}`} /></button>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</span>
                                    {task.priority !== 'srednji' && <span className={`text-[10px] ${getPriorityInfo(task.priority).color}`}>{getPriorityInfo(task.priority).label}</span>}
                                    {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                                    {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
                                    {task.estimatedHours > 0 && <span className="text-[10px] text-muted-foreground"><Timer className="h-2.5 w-2.5 inline" /> {task.loggedHours.toFixed(1)}/{task.estimatedHours}h</span>}
                                    {task.assignedTo && <span className="text-[10px] text-muted-foreground"><Users className="h-2.5 w-2.5 inline" /> {task.assignedTo}</span>}
                                  </div>
                                  {task.description && <p className="text-[10px] text-muted-foreground truncate">{tc(task.description)}</p>}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${taskInfo.color}`}>{taskInfo.label}</Badge>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:text-red-600" onClick={() => deleteTask(task.id)}><Trash2 className="h-2.5 w-2.5" /></Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects - Kanban View */}
      {viewMode === 'kanban' && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" />Kanban tabla</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 min-h-[400px]">
                {STATUS_OPTIONS.filter(s => s.value !== 'otkazan').map(status => {
                  const fProjects = filtered.filter(p => p.status === status.value)
                  return (
                    <div key={status.value} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                        <h4 className="text-xs font-semibold">{status.label} ({fProjects.length})</h4>
                      </div>
                      <div className="space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto bg-muted/20 rounded-lg p-2">
                        {fProjects.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Nema projekata</p>}
                        {fProjects.map(proj => {
                          const tasks = proj.tasks || []
                          const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
                          return (
                            <div key={proj.id} className="bg-background rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-1">
                                {proj.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />}
                                <h4 className="text-xs font-semibold truncate flex-1">{tc(proj.name)}</h4>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>{doneTasks}/{tasks.length} taskova</span>
                                  <span>{proj.progress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1"><div className="h-1 rounded-full bg-blue-500" style={{ width: `${proj.progress}%` }} /></div>
                                {proj.budget > 0 && <p className="text-[10px] text-muted-foreground">{formatRSD(proj.budget)}</p>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={() => setDetailProject(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailProject.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: detailProject.color }} />}
                  {tc(detailProject.name)}
                </DialogTitle>
              </DialogHeader>
              <ProjectDetailView project={detailProject} onClose={() => setDetailProject(null)} onEdit={() => { setDetailProject(null); handleEdit(detailProject) }} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectDetailView({ project, onClose, onEdit }: { project: Project; onClose: () => void; onEdit: () => void }) {
  const { tc } = useContentTranslation()
  const tasks = project.tasks || []
  const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
  const totalHours = (project.timesheetEntries || []).reduce((s, e) => s + e.hours, 0)
  const tags = parseTags(project.tags)
  const statusInfo = getStatusInfo(project.status)
  const prioInfo = getPriorityInfo(project.priority)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
        <Badge variant="outline" className={`text-xs ${prioInfo.color}`}>{prioInfo.label}</Badge>
        {project.partner && <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">{project.partner.name}</Badge>}
        {tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
      </div>

      {project.description && <p className="text-sm text-muted-foreground">{tc(project.description)}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Budžet" value={formatRSD(project.budget)} />
        <MiniStat label="Potrošeno" value={formatRSD(project.spent)} />
        <MiniStat label="Napredak" value={`${project.progress}%`} />
        <MiniStat label="Sati" value={`${totalHours.toFixed(1)}h`} />
      </div>

      {project.assignedTo && (
        <div className="text-xs text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />Zaduženi: <strong className="text-foreground">{tc(project.assignedTo)}</strong></div>
      )}

      {(project.startDate || project.endDate) && (
        <div className="text-xs text-muted-foreground"><CalendarDays className="h-3 w-3 inline mr-1" />{formatDate(project.startDate)}{project.endDate ? ` — ${formatDate(project.endDate)}` : ''}</div>
      )}

      {/* Tasks summary */}
      <div>
        <h4 className="text-xs font-semibold mb-2">Zadaci ({doneTasks}/{tasks.length})</h4>
        <div className="w-full bg-muted rounded-full h-2 mb-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${project.progress}%` }} /></div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {tasks.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno'
            return (
              <div key={task.id} className="flex items-center gap-2 py-1">
                <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <span className={`text-xs flex-1 ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</span>
                {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
                {task.loggedHours > 0 && <span className="text-[10px] text-muted-foreground">{task.loggedHours.toFixed(1)}h</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5 mr-1" />Izmeni</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Zatvori</Button>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="text-center p-2 rounded bg-muted/50"><p className="text-[10px] text-muted-foreground">{label}</p><p className="text-sm font-bold">{value}</p></div>
}

function TaskKanban() {
  const { tc } = useContentTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProject, setFilterProject] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' })

  useEffect(() => { fetch('/api/projects').then(r => r.json()).then(setProjects).finally(() => setLoading(false)) }, [])

  const allTasks = useMemo(() => {
    const tasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectColor: p.color, projectId: p.id })))
    if (filterProject) return tasks.filter(t => t.projectId === filterProject)
    return tasks
  }, [projects, filterProject])

  const tasksByStatus = useMemo(() => {
    const map: Record<string, typeof allTasks> = {}
    TASK_STATUS_OPTIONS.forEach(s => { map[s.value] = allTasks.filter(t => t.status === s.value) })
    return map
  }, [allTasks])

  const addTask = async (status: string) => {
    if (!taskForm.title) return
    const proj = projects[0]
    if (!proj) return
    try {
      await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: proj.id, title: taskForm.title, description: taskForm.description || null, priority: taskForm.priority, dueDate: taskForm.dueDate || null, assignedTo: taskForm.assignedTo || null, estimatedHours: Number(taskForm.estimatedHours) || 0, status }) })
      toast.success('Zadatak kreiran')
      setAddingTo(null); setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' })
      const res = await fetch('/api/projects'); setProjects(await res.json())
    } catch { toast.error('Greška') }
  }

  const moveTask = async (task: typeof allTasks[0], newStatus: string) => {
    try {
      await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) })
      const res = await fetch('/api/projects'); setProjects(await res.json())
    } catch { toast.error('Greška') }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Obrisati zadatak?')) return
    try { await fetch(`/api/project-tasks?id=${taskId}`, { method: 'DELETE' }); toast.success('Obrisano'); const res = await fetch('/api/projects'); setProjects(await res.json()) } catch { toast.error('Greška') }
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-64 w-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filterProject || 'all'} onValueChange={(v) => setFilterProject(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Svi projekti" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi projekti ({allTasks.length} taskova)</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({(p.tasks || []).length})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-h-[500px]">
        {TASK_STATUS_OPTIONS.map(status => {
          const tasks = tasksByStatus[status.value] || []
          return (
            <div key={status.value} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <status.icon className="h-4 w-4" />
                  <h4 className="text-xs font-semibold">{status.label}</h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5">{tasks.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setAddingTo(status.value); setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' }) }}><Plus className="h-3.5 w-3.5" /></Button>
              </div>

              {/* Add task inline */}
              {addingTo === status.value && (
                <div className="border rounded-lg p-2 space-y-1.5 bg-background shadow-sm">
                  <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="h-7 text-xs" placeholder="Naziv zadatka *" autoFocus />
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="h-7 text-xs" />
                    <Input type="number" step="0.5" value={taskForm.estimatedHours} onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })} className="h-7 text-xs" placeholder="Sati" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => addTask(status.value)}>Dodaj</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setAddingTo(null)}>Otkaži</Button>
                  </div>
                </div>
              )}

              <div className={`space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto ${status.colBg} rounded-lg p-2`}>
                {tasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno'
                  return (
                    <div key={task.id} className="bg-background rounded-lg border p-2.5 shadow-sm group hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-1.5">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</p>
                          {task.projectName && <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">{task.projectColor && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.projectColor }} />}{task.projectName}</p>}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            {isOverdue && <span className="text-red-600 flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />Prekoračen</span>}
                            {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
                            {task.loggedHours > 0 && <span><Timer className="h-2.5 w-2.5 inline" />{task.loggedHours.toFixed(1)}h</span>}
                            {task.assignedTo && <span><Users className="h-2.5 w-2.5 inline" />{task.assignedTo}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100">
                          {/* Move buttons */}
                          {TASK_STATUS_OPTIONS.filter(s => s.value !== task.status).map(s => (
                            <button key={s.value} className="text-[8px] px-1 py-0 rounded hover:bg-muted" onClick={() => moveTask(task, s.value)}>{s.label.split(' ')[0]}</button>
                          ))}
                          <button className="text-red-500 hover:text-red-700" onClick={() => deleteTask(task.id)}><Trash2 className="h-2.5 w-2.5" /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimesheetView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tsData, setTsData] = useState<{ entries: TimesheetEntry[]; totalHours: number; byProject: Record<string, { name: string; hours: number; entries: number }> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterProject, setFilterProject] = useState('')
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])

  // Add form
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ projectId: '', taskId: '', hours: '', description: '', date: '' })

  const [refreshKey, setRefreshKey] = useState(0)

  const fetchTsEntries = useCallback(async (): Promise<void> => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterProject) params.set('projectId', filterProject)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const res = await fetch(`/api/timesheets?${params}`)
    setTsData(await res.json())
    setLoading(false)
  }, [filterProject, dateFrom, dateTo])

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

   
  useEffect(() => { fetchTsEntries() }, [fetchTsEntries, refreshKey])

  const allTasks = useMemo(() => {
    const currentProj = projects.find(p => p.id === form.projectId)
    return currentProj?.tasks || []
  }, [projects, form.projectId])

  const saveEntry = async () => {
    if (!form.projectId || !form.taskId || !form.hours) { toast.error('Popuni sva polja'); return }
    try {
      await fetch('/api/timesheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: form.projectId, taskId: form.taskId, hours: Number(form.hours), description: form.description || null, date: form.date || new Date().toISOString().split('T')[0] }) })
      toast.success('Vreme evidentirano')
      setAdding(false); setForm({ projectId: '', taskId: '', hours: '', description: '', date: '' }); setRefreshKey(k => k + 1)
    } catch { toast.error('Greška') }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Obrisati unos?')) return
    try { await fetch(`/api/timesheets?id=${id}`, { method: 'DELETE' }); toast.success('Obrisano'); setRefreshKey(k => k + 1) } catch { toast.error('Greška') }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={filterProject || 'all'} onValueChange={(v) => setFilterProject(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Svi projekti" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Svi projekti</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px] h-9" />
        <span className="text-xs text-muted-foreground">—</span>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px] h-9" />
        <Button size="sm" className="gap-1" onClick={() => { setAdding(true); setForm({ projectId: filterProject || projects[0]?.id || '', taskId: '', hours: '', description: '', date: new Date().toISOString().split('T')[0] }) }}><Plus className="h-3.5 w-3.5" />Dodaj</Button>
        {tsData && <Badge variant="outline" className="text-xs ml-auto"><Timer className="h-3 w-3 inline mr-1" />{tsData.totalHours.toFixed(1)}h total</Badge>}
      </div>

      {/* Add Form */}
      {adding && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between"><h4 className="text-xs font-semibold">Novi unos vremena</h4><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAdding(false)}><X className="h-3.5 w-3.5" /></Button></div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="space-y-1"><Label className="text-[10px]">Projekat *</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, taskId: '' })}><SelectTrigger className="h-8"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1"><Label className="text-[10px]">Zadatak *</Label>
                <Select value={form.taskId} onValueChange={(v) => setForm({ ...form, taskId: v })}><SelectTrigger className="h-8"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent>{allTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1"><Label className="text-[10px]">Datum</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-[10px]">Sati *</Label><Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="h-8 text-xs" placeholder="npr. 2.5" /></div>
              <div className="space-y-1"><Label className="text-[10px]">Opis</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-8 text-xs" placeholder="Opcionalno" /></div>
            </div>
            <div className="flex gap-2"><Button size="sm" className="h-7 text-xs" onClick={saveEntry}>Sačuvaj</Button><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAdding(false)}>Otkaži</Button></div>
          </CardContent>
        </Card>
      )}

      {/* Summary by Project */}
      {tsData && tsData.byProject && Object.keys(tsData.byProject).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.values(tsData.byProject).map(bp => (
            <Card key={bp.name} className="p-3">
              <p className="text-[10px] text-muted-foreground">{bp.name}</p>
              <p className="text-sm font-bold">{bp.hours.toFixed(1)}h</p>
              <p className="text-[10px] text-muted-foreground">{bp.entries} unosa</p>
            </Card>
          ))}
        </div>
      )}

      {/* Entries Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Evidencija radnog vremena</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4"><Skeleton className="h-48 w-full" /></div>
          ) : !tsData || tsData.entries.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Nema unosa za izabrani period</p>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-[10px] h-8">Datum</TableHead>
                  <TableHead className="text-[10px] h-8">Projekat</TableHead>
                  <TableHead className="text-[10px] h-8">Zadatak</TableHead>
                  <TableHead className="text-[10px] h-8">Sati</TableHead>
                  <TableHead className="text-[10px] h-8">Opis</TableHead>
                  <TableHead className="text-[10px] h-8 w-10"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {tsData.entries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs py-2">{formatDate(entry.date)}</TableCell>
                      <TableCell className="text-xs py-2">{entry.project?.name || '—'}</TableCell>
                      <TableCell className="text-xs py-2">{entry.task?.title || '—'}</TableCell>
                      <TableCell className="text-xs py-2 font-bold text-teal-600">{entry.hours.toFixed(1)}h</TableCell>
                      <TableCell className="text-xs py-2 text-muted-foreground max-w-[200px] truncate">{entry.description || '—'}</TableCell>
                      <TableCell className="py-2"><Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => deleteEntry(entry.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProject, setFilterProject] = useState('')

  useEffect(() => { fetch('/api/projects').then(r => r.json()).then(setProjects).finally(() => setLoading(false)) }, [])

  const timelineTasks = useMemo(() => {
    const proj = filterProject ? projects.filter(p => p.id === filterProject) : projects
    return proj.filter(p => p.status !== 'otkazan').map(p => {
      const tasks = (p.tasks || []).filter(t => t.dueDate).map(t => {
        const start = t.createdAt ? new Date(t.createdAt) : new Date()
        const end = new Date(t.dueDate!)
        return { ...t, projectName: p.name, projectColor: p.color, taskStart: start, taskEnd: end, taskDays: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000)) }
      })
      // Also include project itself
      const projStart = new Date(p.startDate)
      const projEnd = p.endDate ? new Date(p.endDate) : new Date(Date.now() + 30 * 86400000)
      const projDays = Math.max(1, Math.ceil((projEnd.getTime() - projStart.getTime()) / 86400000))
      return { project: p, tasks, projDays, projStart, projEnd }
    }).filter(g => g.tasks.length > 0 || g.projDays > 0)
  }, [projects, filterProject])

  // Calculate timeline range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (timelineTasks.length === 0) return { minDate: new Date(), maxDate: new Date(Date.now() + 30 * 86400000), totalDays: 30 }
    let min = new Date(timelineTasks[0].projStart)
    let max = new Date(timelineTasks[0].projEnd)
    timelineTasks.forEach(g => {
      if (g.projStart < min) min = new Date(g.projStart)
      if (g.projEnd > max) max = new Date(g.projEnd)
      g.tasks.forEach(t => {
        if (t.taskStart < min) min = new Date(t.taskStart)
        if (t.taskEnd > max) max = new Date(t.taskEnd)
      })
    })
    const days = Math.max(14, Math.ceil((max.getTime() - min.getTime()) / 86400000) + 2)
    return { minDate: min, maxDate: max, totalDays: Math.min(days, 120) }
  }, [timelineTasks])

  const getPosition = (date: Date) => {
    const diff = date.getTime() - minDate.getTime()
    return Math.max(0, Math.min(100, (diff / (totalDays * 86400000)) * 100))
  }

  const getWidth = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    return Math.max(1, (diff / (totalDays * 86400000)) * 100)
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-64 w-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filterProject || 'all'} onValueChange={(v) => setFilterProject(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Svi projekti" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Svi projekti</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{formatDate(minDate.toISOString())} — {formatDate(maxDate.toISOString())} ({totalDays} dana)</span>
      </div>

      {timelineTasks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nema projekata sa definisanim rokovima za prikaz</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <div className="space-y-4" style={{ minWidth: `${Math.max(600, totalDays * 18)}px` }}>
                {/* Timeline header - date markers */}
                <div className="flex items-center border-b pb-2 mb-2">
                  <div className="w-[180px] flex-shrink-0" />
                  <div className="flex-1 relative h-6">
                    {/* Month markers */}
                    {Array.from({ length: Math.ceil(totalDays / 30) }).map((_, i) => {
                      const date = new Date(minDate.getTime() + i * 30 * 86400000)
                      return (
                        <div key={i} className="absolute text-[9px] text-muted-foreground" style={{ left: `${getPosition(date)}%` }}>
                          {date.toLocaleDateString('sr-Latn', { month: 'short', day: 'numeric' })}
                          <div className="absolute top-3 w-px h-2 bg-muted-foreground/30" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Projects */}
                {timelineTasks.map(g => (
                  <div key={g.project.id} className="space-y-1">
                    {/* Project bar */}
                    <div className="flex items-center">
                      <div className="w-[180px] flex-shrink-0 pr-3">
                        <div className="flex items-center gap-1.5">
                          {g.project.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.project.color }} />}
                          <span className="text-[11px] font-semibold truncate">{g.project.name}</span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-6">
                        <div className="absolute top-1 h-4 rounded bg-primary/20 border border-primary/30" style={{ left: `${getPosition(g.projStart)}%`, width: `${getWidth(g.projStart, g.projEnd)}%` }}>
                          <div className="h-full rounded bg-primary/30" style={{ width: `${g.project.progress}%` }} />
                        </div>
                        <span className="absolute top-0 text-[8px] text-muted-foreground" style={{ left: `${getPosition(g.projStart)}%`, top: '-14px' }}>{g.project.progress}%</span>
                      </div>
                    </div>

                    {/* Task bars */}
                    {g.tasks.map(task => (
                      <div key={task.id} className="flex items-center ml-4">
                        <div className="w-[172px] flex-shrink-0 pr-3">
                          <span className="text-[10px] text-muted-foreground truncate block">{task.title}</span>
                        </div>
                        <div className="flex-1 relative h-4">
                          <div className={`absolute top-0 h-3 rounded ${task.status === 'zavrseno' ? 'bg-emerald-300' : task.status === 'blokirano' ? 'bg-red-300' : task.status === 'u_toku' ? 'bg-blue-300' : 'bg-slate-200'}`} style={{ left: `${getPosition(task.taskStart)}%`, width: `${getWidth(task.taskStart, task.taskEnd)}%` }} title={`${task.title} (${task.taskDays}d)`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-primary/30 border border-primary/30" />Projekat</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-slate-200" />Za uraditi</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-blue-300" />U toku</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-emerald-300" />Završeno</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-red-300" />Blokirano</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
