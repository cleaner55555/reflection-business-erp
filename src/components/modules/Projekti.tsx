'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, FolderKanban, CheckCircle2, ArrowLeft, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { formatRSD, formatDate } from '@/lib/helpers'

interface Project {
  id: string; name: string; description: string | null; status: string; startDate: string
  endDate: string | null; budget: number; spent: number; priority: string; assignedTo: string | null; createdAt: string
  tasks?: ProjectTask[]
}

interface ProjectTask {
  id: string; projectId: string; title: string; description: string | null; status: string; priority: string; dueDate: string | null
}

const STATUS_COLORS: Record<string, string> = { aktivan: 'bg-emerald-50 text-emerald-700 border-emerald-200', zavrsen: 'bg-blue-50 text-blue-700 border-blue-200', pauziran: 'bg-amber-50 text-amber-700 border-amber-200', otkazan: 'bg-red-50 text-red-700 border-red-200' }
const PRIORITY_COLORS: Record<string, string> = { nizak: 'text-muted-foreground', srednji: 'text-amber-600', visok: 'text-orange-600', hitan: 'text-red-600' }

export function Projekti() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingTaskForProject, setAddingTaskForProject] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({ projectId: '', title: '', priority: 'srednji' })

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
        if (proj.assignedTo) texts.push(proj.assignedTo)
        ;(proj.tasks || []).forEach(task => {
          if (task.title) texts.push(task.title)
        })
      })
      translateTexts(texts)
    }
  }, [projects, translateTexts])

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (proj: Project) => {
    setEditing(proj)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('projects.confirmDelete'))) return
    try { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchProjects() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), description: fd.get('description'), status: fd.get('status'), startDate: fd.get('startDate'), endDate: fd.get('endDate'), budget: fd.get('budget'), priority: fd.get('priority'), assignedTo: fd.get('assignedTo') }
    try {
      const url = editing ? `/api/projects/${editing.id}` : '/api/projects'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('list'); setEditing(null); fetchProjects()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const addTask = async () => {
    if (!newTask.title) return
    try {
      await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) })
      toast.success(t('projects.taskCreated')); setAddingTaskForProject(null); setNewTask({ projectId: '', title: '', priority: 'srednji' }); fetchProjects()
    } catch { toast.error(t('common.error')) }
  }

  const toggleTask = async (task: ProjectTask) => {
    const newStatus = task.status === 'zavrseno' ? 'todo' : 'zavrseno'
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error(t('common.error')) }
  }

  const openTaskForm = (projectId: string) => {
    setNewTask({ projectId, title: '', priority: 'srednji' })
    setAddingTaskForProject(projectId)
  }

  const cancelTaskForm = () => {
    setAddingTaskForProject(null)
    setNewTask({ projectId: '', title: '', priority: 'srednji' })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('projects.project')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">{t('projects.title')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{projects.length} {t('projects.projectCount')}</p></div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('projects.newProject')}</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="flex gap-2 mt-4">
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder={t('projects.all')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('projects.all')}</SelectItem><SelectItem value="aktivan">{t('projects.activeFilter')}</SelectItem><SelectItem value="zavrsen">{t('projects.completedFilter')}</SelectItem><SelectItem value="pauziran">{t('projects.pausedFilter')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">{t('projects.projectName')} *</Label><Input name="name" defaultValue={editing?.name || ''} required /></div>
            <div className="space-y-2"><Label className="text-xs">{t('common.description')}</Label><Input name="description" defaultValue={editing?.description || ''} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('common.status')}</Label>
                <Select name="status" defaultValue={editing?.status || 'aktivan'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="aktivan">{t('common.aktivan')}</SelectItem><SelectItem value="zavrsen">{t('common.zavrsen')}</SelectItem><SelectItem value="pauziran">{t('common.pauziran')}</SelectItem><SelectItem value="otkazan">{t('projects.otkazan')}</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">{t('common.priority')}</Label>
                <Select name="priority" defaultValue={editing?.priority || 'srednji'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="nizak">{t('projects.priorityLow')}</SelectItem><SelectItem value="srednji">{t('projects.priorityMedium')}</SelectItem><SelectItem value="visok">{t('projects.priorityHigh')}</SelectItem><SelectItem value="hitan">{t('projects.priorityUrgent')}</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('projects.startDate')}</Label><Input name="startDate" type="date" defaultValue={editing?.startDate?.split('T')[0] || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('projects.endDate')}</Label><Input name="endDate" type="date" defaultValue={editing?.endDate?.split('T')[0] || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('projects.budget')} (RSD)</Label><Input name="budget" type="number" defaultValue={editing?.budget || ''} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">{t('projects.assignee')}</Label><Input name="assignedTo" defaultValue={editing?.assignedTo || ''} /></div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => {
              const progress = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0
              const tasks = proj.tasks || []
              const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
              const isExpanded = expandedId === proj.id
              const isAddingTask = addingTaskForProject === proj.id
              return (
                <div key={proj.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{tc(proj.name)}</h3>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[proj.status] || ''}`}>{proj.status}</Badge>
                        <span className={`text-[10px] font-medium ${PRIORITY_COLORS[proj.priority] || ''}`}>{proj.priority}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{t('projects.budget')}: {formatRSD(proj.budget)}</span>
                        <span>{t('projects.spent')}: {formatRSD(proj.spent)} ({progress}%)</span>
                        <span>{t('projects.tasks')}: {doneTasks}/{tasks.length}</span>
                        {proj.assignedTo && <span>{t('projects.assignee')}: {tc(proj.assignedTo)}</span>}
                      </div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                    </div>
                    <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(proj)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(proj.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold">{t('projects.tasks')}</h4>
                        {!isAddingTask && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => openTaskForm(proj.id)}><Plus className="h-3 w-3" /> {t('common.add')}</Button>
                        )}
                      </div>
                      {isAddingTask && (
                        <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold">{t('projects.newTask')}</h4>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelTaskForm}><X className="h-3 w-3" /></Button>
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-1"><Label className="text-xs">{t('projects.taskName')} *</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="h-8 text-xs" placeholder={t('projects.taskNamePlaceholder')} /></div>
                            <div className="space-y-1"><Label className="text-xs">{t('common.priority')}</Label>
                              <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent>
                                <SelectItem value="nizak">{t('projects.priorityLow')}</SelectItem><SelectItem value="srednji">{t('projects.priorityMedium')}</SelectItem><SelectItem value="visok">{t('projects.priorityHigh')}</SelectItem><SelectItem value="hitan">{t('projects.priorityUrgent')}</SelectItem>
                              </SelectContent></Select>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs" onClick={addTask}>{t('projects.createTask')}</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelTaskForm}>{t('common.cancel')}</Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {tasks.length === 0 && !isAddingTask ? <p className="text-xs text-muted-foreground">{t('projects.noTasks')}</p> : tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 py-1" onClick={() => toggleTask(task)}>
                          <CheckCircle2 className={`h-4 w-4 ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{tc(task.title)}</span>
                          <Badge variant="secondary" className="text-[10px] ml-auto">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
