'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, BarChart3, CheckCircle2, Circle, Clock, FolderKanban, Pencil, Plus, Search, Trash2, ArrowLeft, X, ListTodo, CalendarDays, DollarSign, Users, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

// ─── Interfaces ──────────────────────────────────────────────────────────

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string
  endDate: string | null
  budget: number
  spent: number
  priority: string
  assignedTo: string | null
  createdAt: string
  tasks?: ProjectTask[]
}

interface ProjectTask {
  id: string
  projectId: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  paused: number
  cancelled: number
  totalBudget: number
  totalSpent: number
  totalTasks: number
  completedTasks: number
}

// ─── Constants ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'aktivan', label: 'Aktivan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Circle },
  { value: 'zavrsen', label: 'Završen', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  { value: 'pauziran', label: 'Pauziran', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  { value: 'otkazan', label: 'Otkazan', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
] as const

const PRIORITY_OPTIONS = [
  { value: 'nizak', label: 'Nizak', color: 'text-slate-500' },
  { value: 'srednji', label: 'Srednji', color: 'text-amber-600' },
  { value: 'visok', label: 'Visok', color: 'text-orange-600' },
  { value: 'hitan', label: 'Hitan', color: 'text-red-600' },
] as const

const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'Za uraditi', color: 'bg-slate-100 text-slate-700', column: 'todo' },
  { value: 'u_toku', label: 'U toku', color: 'bg-blue-50 text-blue-700', column: 'in_progress' },
  { value: 'zavrseno', label: 'Završeno', color: 'bg-emerald-50 text-emerald-700', column: 'done' },
  { value: 'blokirano', label: 'Blokirano', color: 'bg-red-50 text-red-700', column: 'blocked' },
] as const

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
}

function getPriorityInfo(priority: string) {
  return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1]
}

function getTaskStatusInfo(status: string) {
  return TASK_STATUS_OPTIONS.find(s => s.value === status) || TASK_STATUS_OPTIONS[0]
}

// ─── Main Component ──────────────────────────────────────────────────────

export function Projekti() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('projects.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljanje projektima, zadacima i napretkom</p>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
          <TabsTrigger value="projekti" className="gap-1.5">
            <FolderKanban className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Projekti</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pregled"><ProjectDashboard /></TabsContent>
        <TabsContent value="projekti"><ProjectsList /></TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Dashboard ──────────────────────────────────────────────────────────

function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/projects')
      setProjects(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo<ProjectStats>(() => {
    const allTasks = projects.flatMap(p => p.tasks || [])
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'aktivan').length,
      completed: projects.filter(p => p.status === 'zavrsen').length,
      paused: projects.filter(p => p.status === 'pauziran').length,
      cancelled: projects.filter(p => p.status === 'otkazan').length,
      totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
      totalSpent: projects.reduce((s, p) => s + (p.spent || 0), 0),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'zavrseno').length,
    }
  }, [projects])

  const overdueTasks = useMemo(() => {
    const now = new Date()
    return projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'zavreseno')
  }, [projects])

  const topBudgetProjects = useMemo(() => {
    return [...projects].filter(p => p.budget > 0).sort((a, b) => b.budget - a.budget).slice(0, 5)
  }, [projects])

  if (loading) {
    return <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><FolderKanban className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><Circle className="h-3.5 w-3.5" />Aktivni</div><p className="text-2xl font-bold text-emerald-700">{stats.active}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Završeni</div><p className="text-2xl font-bold text-blue-700">{stats.completed}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-amber-600 mb-1"><Clock className="h-3.5 w-3.5" />Pauzirani</div><p className="text-2xl font-bold text-amber-700">{stats.paused}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Target className="h-3.5 w-3.5" />Zadaci</div><p className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Prekoračeni</div><p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p></Card>
      </div>

      {/* Budget overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Budžet projekata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground">Ukupan budžet</p>
                  <p className="text-lg font-bold">{formatRSD(stats.totalBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Potrošeno</p>
                  <p className="text-lg font-bold text-orange-600">{formatRSD(stats.totalSpent)} ({stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%)</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${stats.totalSpent > stats.totalBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${stats.totalBudget > 0 ? Math.min((stats.totalSpent / stats.totalBudget) * 100, 100) : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Preostalo: {formatRSD(Math.max(0, stats.totalBudget - stats.totalSpent))}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Top projekti po budžetu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {topBudgetProjects.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nema projekata sa budžetom</p>
              ) : topBudgetProjects.map((p, i) => {
                const pct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0
                const taskPct = (p.tasks || []).length > 0 ? Math.round(((p.tasks || []).filter(t => t.status === 'zavrseno').length / (p.tasks || []).length) * 100) : 0
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>{formatRSD(p.budget)}</span>
                        <span className={pct > 90 ? 'text-red-600' : ''}>{pct}% potrošeno</span>
                        <span>{taskPct}% taskova</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" />Prekoračeni zadaci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {overdueTasks.slice(0, 10).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{task.title}</span>
                    <span className="text-[10px] text-muted-foreground">— {task.projectName}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-red-100 text-red-700 border-red-200">{formatDate(task.dueDate!)}</Badge>
                </div>
              ))}
              {overdueTasks.length > 10 && <p className="text-[10px] text-muted-foreground text-center">I još {overdueTasks.length - 10} prekoračenih...</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Projects List with Kanban ───────────────────────────────────────────

function ProjectsList() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'kanban'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Task state
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'srednji', dueDate: '' })

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/projects?${params}`)
    setProjects(await res.json())
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

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

  const filtered = useMemo(() => {
    if (!search) return projects
    const s = search.toLowerCase()
    return projects.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.assignedTo || '').toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s)
    )
  }, [projects, search])

  const stats = useMemo(() => {
    const allTasks = filtered.flatMap(p => p.tasks || [])
    return {
      totalBudget: filtered.reduce((s, p) => s + (p.budget || 0), 0),
      totalSpent: filtered.reduce((s, p) => s + (p.spent || 0), 0),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'zavrseno').length,
    }
  }, [filtered])

  // ─── Project CRUD ──────────────────────────────────────────────
  const handleNew = () => { setEditing(null); setViewMode('form') }
  const handleEdit = (proj: Project) => { setEditing(proj); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditing(null); setExpandedId(null) }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati projekat i sve zadace?')) return
    try { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success('Projekat obrisan'); fetchProjects() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'), description: fd.get('description'), status: fd.get('status'),
      startDate: fd.get('startDate'), endDate: fd.get('endDate') || null,
      budget: fd.get('budget'), priority: fd.get('priority'), assignedTo: fd.get('assignedTo') || null,
    }
    try {
      const url = editing ? `/api/projects/${editing.id}` : '/api/projects'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Projekat ažuriran' : 'Projekat kreiran')
      setViewMode('list'); setEditing(null); fetchProjects()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  // ─── Task CRUD ────────────────────────────────────────────────
  const openAddTask = (projectId: string) => {
    setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '' })
    setEditingTask(null)
    setAddingTaskFor(projectId)
  }

  const openEditTask = (task: ProjectTask) => {
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' })
    setEditingTask(task)
    setAddingTaskFor(task.projectId)
  }

  const cancelTaskForm = () => {
    setAddingTaskFor(null); setEditingTask(null)
    setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '' })
  }

  const saveTask = async () => {
    if (!taskForm.title || !addingTaskFor) return
    try {
      if (editingTask) {
        await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingTask.id, title: taskForm.title, description: taskForm.description || null, priority: taskForm.priority, dueDate: taskForm.dueDate || null }) })
        toast.success('Zadatak ažuriran')
      } else {
        await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: addingTaskFor, title: taskForm.title, description: taskForm.description || null, priority: taskForm.priority, dueDate: taskForm.dueDate || null }) })
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
      {/* Summary bar */}
      {!viewMode.includes('form') && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži projekte..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Budžet</p><p className="text-sm font-bold">{formatRSD(stats.totalBudget)}</p></Card>
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Potrošeno</p><p className="text-sm font-bold text-orange-600">{formatRSD(stats.totalSpent)}</p></Card>
          <Card className="p-3"><p className="text-[10px] text-muted-foreground">Zadaci</p><p className="text-sm font-bold">{stats.completedTasks}/{stats.totalTasks} ({stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%)</p></Card>
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
              <div className="space-y-2"><Label className="text-xs">Naziv projekta *</Label><Input name="name" defaultValue={editing?.name || ''} required placeholder="npr. Redizajn web sajta" /></div>
              <div className="space-y-2"><Label className="text-xs">Opis</Label><Textarea name="description" defaultValue={editing?.description || ''} rows={3} placeholder="Opišite projekat..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Status</Label>
                  <Select name="status" defaultValue={editing?.status || 'aktivan'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Prioritet</Label>
                  <Select name="priority" defaultValue={editing?.priority || 'srednji'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    {PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs">Početak</Label><Input name="startDate" type="date" defaultValue={editing?.startDate?.split('T')[0] || today} /></div>
                <div className="space-y-2"><Label className="text-xs">Kraj</Label><Input name="endDate" type="date" defaultValue={editing?.endDate?.split('T')[0] || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">Budžet (RSD)</Label><Input name="budget" type="number" step="0.01" defaultValue={editing?.budget || ''} /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs">Odgovorna osoba</Label><Input name="assignedTo" defaultValue={editing?.assignedTo || ''} placeholder="Ime zaposlenog" /></div>
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
                  const progress = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0
                  const tasks = proj.tasks || []
                  const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
                  const isExpanded = expandedId === proj.id
                  const statusInfo = getStatusInfo(proj.status)
                  const prioInfo = getPriorityInfo(proj.priority)
                  const isOverBudget = proj.budget > 0 && proj.spent > proj.budget

                  return (
                    <div key={proj.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold">{tc(proj.name)}</h3>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                            <span className={`text-[10px] font-medium ${prioInfo.color}`}>{prioInfo.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {proj.budget > 0 && <span>Budžet: <span className="font-medium text-foreground">{formatRSD(proj.budget)}</span></span>}
                            <span>Potrošeno: <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>{formatRSD(proj.spent)}</span></span>
                            {tasks.length > 0 && <span>Zadaci: <span className="font-medium text-foreground">{doneTasks}/{tasks.length}</span></span>}
                            {proj.assignedTo && <span><Users className="h-3 w-3 inline" /> <span className="font-medium text-foreground">{tc(proj.assignedTo)}</span></span>}
                          </div>
                          {(proj.budget > 0 || tasks.length > 0) && (
                            <div className="mt-2 flex items-center gap-3">
                              {proj.budget > 0 && (
                                <div className="flex-1 max-w-[200px]">
                                  <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5"><span>Budžet</span><span>{progress}%</span></div>
                                  <div className="w-full bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                                </div>
                              )}
                              {tasks.length > 0 && (
                                <div className="flex-1 max-w-[200px]">
                                  <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5"><span>Taskovi</span><span>{Math.round((doneTasks / tasks.length) * 100)}%</span></div>
                                  <div className="w-full bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.round((doneTasks / tasks.length) * 100)}%` }} /></div>
                                </div>
                              )}
                            </div>
                          )}
                          {(proj.startDate || proj.endDate) && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatDate(proj.startDate)}{proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
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
                          {/* Add/Edit task form */}
                          {(addingTaskFor === proj.id) && (
                            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold">{editingTask ? 'Izmeni zadatak' : 'Novi zadatak'}</h4>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelTaskForm}><X className="h-3 w-3" /></Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label className="text-[10px]">Naziv *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="h-8 text-xs" placeholder="Naziv zadatka" /></div>
                                <div className="space-y-1"><Label className="text-[10px]">Prioritet</Label>
                                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent>
                                    {PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                  </SelectContent></Select>
                                </div>
                              </div>
                              <div className="space-y-1"><Label className="text-[10px]">Opis</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="h-16 text-xs" placeholder="Detaljan opis..." /></div>
                              <div className="space-y-1"><Label className="text-[10px]">Rok</Label><Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="h-8 text-xs" /></div>
                              <div className="flex gap-2">
                                <Button size="sm" className="h-7 text-xs" onClick={saveTask}>Sačuvaj</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelTaskForm}>Otkaži</Button>
                              </div>
                            </div>
                          )}
                          {/* Task list */}
                          {tasks.length === 0 && !(addingTaskFor === proj.id) ? (
                            <p className="text-xs text-muted-foreground py-2">Nema zadataka</p>
                          ) : (
                            tasks.map((task) => {
                            const taskInfo = getTaskStatusInfo(task.status)
                              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno'
                              return (
                              <div key={task.id} className="flex items-center gap-2 py-1.5 group">
                                <button className="flex-shrink-0 cursor-pointer" onClick={() => toggleTask(task)}>
                                  <CheckCircle2 className={`h-4 w-4 transition-colors ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-400'}`} />
                                </button>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</span>
                                    {task.priority !== 'srednji' && <span className={`text-[10px] ${getPriorityInfo(task.priority).color}`}>{getPriorityInfo(task.priority).label}</span>}
                                    {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                                    {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" />Kanban tabla</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Nema projekata za prikaz</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 min-h-[400px]">
                {STATUS_OPTIONS.filter(s => s.value !== 'otkazan').map(status => {
                  const filteredProjects = filtered.filter(p => p.status === status.value)
                  return (
                    <div key={status.value} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.value === 'aktivan' ? 'bg-emerald-500' : status.value === 'zavrsen' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <h4 className="text-xs font-semibold">{status.label} ({filteredProjects.length})</h4>
                      </div>
                      <div className="space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto bg-muted/20 rounded-lg p-2">
                        {filteredProjects.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Nema projekata</p>}
                        {filteredProjects.map(proj => {
                          const tasks = proj.tasks || []
                          const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
                          return (
                            <div key={proj.id} className="bg-background rounded-lg border p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}>
                              <h4 className="text-xs font-semibold mb-1">{tc(proj.name)}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>{doneTasks}/{tasks.length} taskova</span>
                                {proj.budget > 0 && <span>{formatRSD(proj.budget)}</span>}
                              </div>
                              {expandedId === proj.id && (
                                <div className="mt-2 pt-2 border-t space-y-1">
                                  {tasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-1.5 py-0.5">
                                      <button className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); toggleTask(task) }}>
                                        <CheckCircle2 className={`h-3.5 w-3.5 ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                      </button>
                                      <span className={`text-[10px] ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
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
    </div>
  )
}
