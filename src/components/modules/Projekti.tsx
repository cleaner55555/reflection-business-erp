'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, FolderKanban, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
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
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati projekat?')) return
    try { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success('Obrisano'); fetchProjects() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), description: fd.get('description'), status: fd.get('status'), startDate: fd.get('startDate'), endDate: fd.get('endDate'), budget: fd.get('budget'), priority: fd.get('priority'), assignedTo: fd.get('assignedTo') }
    try {
      const url = editing ? `/api/projects/${editing.id}` : '/api/projects'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Ažurirano' : 'Kreirano'); setDialogOpen(false); setEditing(null); fetchProjects()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  const addTask = async () => {
    if (!newTask.title) return
    try {
      await fetch('/api/project-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) })
      toast.success('Task kreiran'); setTaskDialogOpen(false); setNewTask({ projectId: '', title: '', priority: 'srednji' }); fetchProjects()
    } catch { toast.error('Greška') }
  }

  const toggleTask = async (task: ProjectTask) => {
    const newStatus = task.status === 'zavrseno' ? 'todo' : 'zavrseno'
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error('Greška') }
  }

  const openTaskDialog = (projectId: string) => {
    setNewTask({ projectId, title: '', priority: 'srednji' })
    setTaskDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-base font-semibold">Projekti</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{projects.length} projekata</p></div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novi Projekat</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novi'} Projekat</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input name="name" defaultValue={editing?.name || ''} required /></div>
                <div className="space-y-2"><Label className="text-xs">Opis</Label><Input name="description" defaultValue={editing?.description || ''} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Status</Label>
                    <Select name="status" defaultValue={editing?.status || 'aktivan'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="aktivan">Aktivan</SelectItem><SelectItem value="zavrsen">Završen</SelectItem><SelectItem value="pauziran">Pauziran</SelectItem><SelectItem value="otkazan">Otkazan</SelectItem>
                    </SelectContent></Select>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Prioritet</Label>
                    <Select name="priority" defaultValue={editing?.priority || 'srednji'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="nizak">Nizak</SelectItem><SelectItem value="srednji">Srednji</SelectItem><SelectItem value="visok">Visok</SelectItem><SelectItem value="hitan">Hitan</SelectItem>
                    </SelectContent></Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Početak</Label><Input name="startDate" type="date" defaultValue={editing?.startDate?.split('T')[0] || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">Kraj</Label><Input name="endDate" type="date" defaultValue={editing?.endDate?.split('T')[0] || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">Budžet (RSD)</Label><Input name="budget" type="number" defaultValue={editing?.budget || ''} /></div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Zaduženi</Label><Input name="assignedTo" defaultValue={editing?.assignedTo || ''} /></div>
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Novi Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naslov *</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /></div>
                <div className="space-y-2"><Label className="text-xs">Prioritet</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="nizak">Nizak</SelectItem><SelectItem value="srednji">Srednji</SelectItem><SelectItem value="visok">Visok</SelectItem><SelectItem value="hitan">Hitan</SelectItem>
                  </SelectContent></Select>
                </div>
                <Button className="w-full" onClick={addTask}>Kreiraj Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-2 mt-4">
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Svi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi</SelectItem><SelectItem value="aktivan">Aktivni</SelectItem><SelectItem value="zavrsen">Završeni</SelectItem><SelectItem value="pauziran">Pauzirani</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <div className="space-y-3">
            {projects.map((proj) => {
              const progress = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0
              const tasks = proj.tasks || []
              const doneTasks = tasks.filter(t => t.status === 'zavrseno').length
              const isExpanded = expandedId === proj.id
              return (
                <div key={proj.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : proj.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{proj.name}</h3>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[proj.status] || ''}`}>{proj.status}</Badge>
                        <span className={`text-[10px] font-medium ${PRIORITY_COLORS[proj.priority] || ''}`}>{proj.priority}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Budžet: {formatRSD(proj.budget)}</span>
                        <span>Potrošeno: {formatRSD(proj.spent)} ({progress}%)</span>
                        <span>Tasks: {doneTasks}/{tasks.length}</span>
                        {proj.assignedTo && <span>Zaduženi: {proj.assignedTo}</span>}
                      </div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                    </div>
                    <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(proj); setDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(proj.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold">Taskovi</h4>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => openTaskDialog(proj.id)}><Plus className="h-3 w-3" /> Dodaj</Button>
                      </div>
                      {tasks.length === 0 ? <p className="text-xs text-muted-foreground">Nema taskova</p> : tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 py-1" onClick={() => toggleTask(task)}>
                          <CheckCircle2 className={`h-4 w-4 ${task.status === 'zavrseno' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${task.status === 'zavrseno' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
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
