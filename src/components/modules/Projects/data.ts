export const STATUS_OPTIONS = [
  { value: 'aktivan', label: 'Aktivan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'zavrsen', label: 'Završen', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'pauziran', label: 'Pauziran', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'otkazan', label: 'Otkazan', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'nizak', label: 'Nizak', color: 'text-slate-500', dot: 'bg-slate-400' },
  { value: 'srednji', label: 'Srednji', color: 'text-amber-600', dot: 'bg-amber-500' },
  { value: 'visok', label: 'Visok', color: 'text-orange-600', dot: 'bg-orange-500' },
  { value: 'hitan', label: 'Hitan', color: 'text-red-600', dot: 'bg-red-500' },
] as const;

export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'Za uraditi', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Square, colBg: 'bg-slate-50' },
  { value: 'u_toku', label: 'U toku', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Play, colBg: 'bg-blue-50/50' },
  { value: 'zavrseno', label: 'Završeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, colBg: 'bg-emerald-50/50' },
  { value: 'blokirano', label: 'Blokirano', color: 'bg-red-50 text-red-700 border-red-200', icon: Pause, colBg: 'bg-red-50/50' },
] as const;

export const PROJECT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7']

export const { t } = useTranslation();

export const allTasks = projects.flatMap(p => p.tasks || []);

export const allTimesheets = projects.flatMap(p => p.timesheetEntries || []);

export const now = new Date();

export const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/projects?${params}`);

export const texts: string[] = []

export const allTasks = filtered.flatMap(p => p.tasks || []);

export const allTs = filtered.flatMap(p => p.timesheetEntries || []);

export const handleNew = () => { setEditing(null); setProjTags([]); setViewMode('form') }

export const handleEdit = (proj: Project) => { setEditing(proj); setProjTags(parseTags(proj.tags)); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditing(null); setExpandedId(null); setProjTags([]) }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati projekat i sve zadatke?')) return
    try { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success('Projekat obrisan'); fetchProjects() } catch { toast.error('Greška') }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !projTags.includes(tag)) { setProjTags([...projTags, tag]); setNewTag('') }
  }

export const removeTag = (tag: string) => setProjTags(projTags.filter(t => t !== tag));

export const openAddTask = (projectId: string) => {
    setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' })
    setEditingTask(null); setAddingTaskFor(projectId)
  }

export const openEditTask = (task: ProjectTask) => {
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', assignedTo: task.assignedTo || '', estimatedHours: task.estimatedHours ? String(task.estimatedHours) : '' })
    setEditingTask(task); setAddingTaskFor(task.projectId)
  }

export const cancelTaskForm = () => { setAddingTaskFor(null); setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'srednji', dueDate: '', assignedTo: '', estimatedHours: '' }) }

export const saveTask = async () => {
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

export const toggleTask = async (task: ProjectTask) => {
    const newStatus = task.status === 'zavrseno' ? 'todo' : 'zavrseno'
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error('Greška') }
  }

export const deleteTask = async (taskId: string) => {
    if (!confirm('Obrisati zadatak?')) return
    try { await fetch(`/api/project-tasks?id=${taskId}`, { method: 'DELETE' }); toast.success('Zadatak obrisan'); fetchProjects() } catch { toast.error('Greška') }
  }

export const moveTask = async (task: ProjectTask, newStatus: string) => {
    try { await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) }); fetchProjects() } catch { toast.error('Greška') }
  }

export const today = new Date().toISOString().split('T')[0]

export const tasks = proj.tasks || []

export const doneTasks = tasks.filter(t => t.status === 'zavrseno').length;

export const isExpanded = expandedId === proj.id;

export const statusInfo = getStatusInfo(proj.status);

export const prioInfo = getPriorityInfo(proj.priority);

export const isOverBudget = proj.budget > 0 && proj.spent > proj.budget;

export const tags = parseTags(proj.tags);

export const totalTs = (proj.timesheetEntries || []).reduce((s, e) => s + e.hours, 0);

export const taskInfo = getTaskStatusInfo(task.status);

export const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno';

export const fProjects = filtered.filter(p => p.status === status.value);

export const tasks = proj.tasks || []

export const doneTasks = tasks.filter(t => t.status === 'zavrseno').length;

export const { tc } = useContentTranslation();

export const tasks = project.tasks || []

export const doneTasks = tasks.filter(t => t.status === 'zavrseno').length;

export const totalHours = (project.timesheetEntries || []).reduce((s, e) => s + e.hours, 0);

export const tags = parseTags(project.tags);

export const statusInfo = getStatusInfo(project.status);

export const prioInfo = getPriorityInfo(project.priority);

export const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno';

export const { tc } = useContentTranslation();

export const tasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectColor: p.color, projectId: p.id })));

export const map: Record<string, typeof allTasks> = {}

export const addTask = async (status: string) => {
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

export const moveTask = async (task: typeof allTasks[0], newStatus: string) => {
    try {
      await fetch('/api/project-tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: newStatus }) })
      const res = await fetch('/api/projects'); setProjects(await res.json())
    } catch { toast.error('Greška') }
  }

export const deleteTask = async (taskId: string) => {
    if (!confirm('Obrisati zadatak?')) return
    try { await fetch(`/api/project-tasks?id=${taskId}`, { method: 'DELETE' }); toast.success('Obrisano'); const res = await fetch('/api/projects'); setProjects(await res.json()) } catch { toast.error('Greška') }
  }

export const tasks = tasksByStatus[status.value] || []

export const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'zavrseno';

export const params = new URLSearchParams();

export const res = await fetch(`/api/timesheets?${params}`);

export const currentProj = projects.find(p => p.id === form.projectId);

export const saveEntry = async () => {
    if (!form.projectId || !form.taskId || !form.hours) { toast.error('Popuni sva polja'); return }
    try {
      await fetch('/api/timesheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: form.projectId, taskId: form.taskId, hours: Number(form.hours), description: form.description || null, date: form.date || new Date().toISOString().split('T')[0] }) })
      toast.success('Vreme evidentirano')
      setAdding(false); setForm({ projectId: '', taskId: '', hours: '', description: '', date: '' }); setRefreshKey(k => k + 1)
    } catch { toast.error('Greška') }
  }

export const deleteEntry = async (id: string) => {
    if (!confirm('Obrisati unos?')) return
    try { await fetch(`/api/timesheets?id=${id}`, { method: 'DELETE' }); toast.success('Obrisano'); setRefreshKey(k => k + 1) } catch { toast.error('Greška') }
  }

export const proj = filterProject ? projects.filter(p => p.id === filterProject) : projects;

export const tasks = (p.tasks || []).filter(t => t.dueDate).map(t => {
        const start = t.createdAt ? new Date(t.createdAt) : new Date()
        const end = new Date(t.dueDate!)
        return { ...t, projectName: p.name, projectColor: p.color, taskStart: start, taskEnd: end, taskDays: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000)) }
      });

export const projStart = new Date(p.startDate);

export const projEnd = p.endDate ? new Date(p.endDate) : new Date(Date.now() + 30 * 86400000);

export const projDays = Math.max(1, Math.ceil((projEnd.getTime() - projStart.getTime()) / 86400000));

export const days = Math.max(14, Math.ceil((max.getTime() - min.getTime()) / 86400000) + 2);

export const getPosition = (date: Date) => {
    const diff = date.getTime() - minDate.getTime()
    return Math.max(0, Math.min(100, (diff / (totalDays * 86400000)) * 100))
  }

export const getWidth = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    return Math.max(1, (diff / (totalDays * 86400000)) * 100)
  }

export const date = new Date(minDate.getTime() + i * 30 * 86400000);

export function getStatusInfo(s: string) { return STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0] }

export function getPriorityInfo(p: string) { return PRIORITY_OPTIONS.find(o => o.value === p) || PRIORITY_OPTIONS[1] }

export function getTaskStatusInfo(s: string) { return TASK_STATUS_OPTIONS.find(o => o.value === s) || TASK_STATUS_OPTIONS[0] }

export function parseTags(tags: string | null): string[] { if (!tags) return []; try { return JSON.parse(tags) } catch { return [] } }
