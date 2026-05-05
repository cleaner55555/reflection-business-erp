export const load = async () => {
      const [eRes, empRes] = await Promise.all([fetch('/api/employee-evaluations'), fetch('/api/employees')])
      if (cancelled) return
      setEvaluations(await eRes.json())
      setEmployees(await empRes.json())
      setLoading(false)
    }

export const handleSubmit = async () => {
    if (editId) {
      await fetch(`/api/employee-evaluations/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/employee-evaluations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId: 'default' })
      })
    }
    setShowForm(false); setEditId(null)
    setForm({ employeeId: '', period: 'Q4', year: new Date().getFullYear(), rating: 3, strengths: '', weaknesses: '', goals: '', reviewNotes: '', status: 'nacrt', reviewDate: '' })
    const res = await fetch('/api/employee-evaluations'); setEvaluations(await res.json())
    toast.success(editId ? 'Ocena ažurirana' : 'Ocena kreirana')
  }

export const handleEdit = (ev: EmployeeEval) => {
    setForm({
      employeeId: ev.employee.firstName + ' ' + ev.employee.lastName,
      period: ev.period, year: ev.year, rating: ev.rating,
      strengths: ev.strengths || '', weaknesses: ev.weaknesses || '', goals: ev.goals || '',
      reviewNotes: ev.reviewNotes || '', status: ev.status,
      reviewDate: ev.reviewDate?.split('T')[0] || ''
    })
    setEditId(ev.id); setShowForm(true)
  }

export const handleDelete = async (id: string) => {
    await fetch(`/api/employee-evaluations/${id}`, { method: 'DELETE' })
    setEvaluations(prev => prev.filter(e => e.id !== id))
    toast.success('Ocena obrisana')
  }

export const getRatingLabel = (r: number) => {
    if (r >= 5) return 'Odličan'
    if (r >= 4) return 'Vrlo dobar'
    if (r >= 3) return 'Dobar'
    if (r >= 2) return 'Zadovoljavajući'
    return 'Nezadovoljavajući'
  }

export const avgRating = evaluations.length > 0 ? (evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length).toFixed(1) : '0';

export const count = evaluations.filter(e => e.rating === r).length;

export const pct = evaluations.length > 0 ? (count / evaluations.length) * 100 : 0;

export const load = async () => {
      const res = await fetch('/api/employees')
      if (cancelled) return
      setEmployees((await res.json()).filter((e: OrgEmployee) => e.isActive))
      // Auto-expand root nodes
      const data = await res.json()
      const roots = (data as OrgEmployee[]).filter((e: OrgEmployee) => e.isActive && !e.managerId)
      if (roots.length > 0) {
        setExpanded(new Set(roots.map((r: OrgEmployee) => r.id)))
      }
      setLoading(false)
    }

export const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

export const roots = employees.filter(e => !e.managerId);

export const childrenMap = new Map<string, OrgEmployee[]>();

export const existing = childrenMap.get(e.managerId) || []

export const getSubordinates = (empId: string) => childrenMap.get(empId) || []

export const getLevelColor = (level: number) => {
    const colors = [
      'bg-emerald-100 text-emerald-700 border-emerald-200',     // Level 0 - root (CEO/Director)
      'bg-blue-100 text-blue-700 border-blue-200',              // Level 1 - Managers
      'bg-violet-100 text-violet-700 border-violet-200',        // Level 2 - Team leads
      'bg-amber-100 text-amber-700 border-amber-200',          // Level 3 - Team members
      'bg-slate-100 text-slate-700 border-slate-200',           // Level 4+
    ]
    return colors[Math.min(level, colors.length - 1)]
  }

export const getContractBadge = (type: string | null) => {
    switch (type) {
      case 'neodredjeno': return <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0">Neodređeno</Badge>
      case 'odredjeno': return <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0">Određeno</Badge>
      case 'honorarno': return <Badge className="bg-violet-100 text-violet-700 text-[9px] px-1.5 py-0">Honorarno</Badge>
      case 'praksa': return <Badge className="bg-teal-100 text-teal-700 text-[9px] px-1.5 py-0">Praksa</Badge>
      default: return null
    }
  }

export const totalLevels = Math.max(1, ...employees.map(e => {
    let level = 0
    let current = e
    const visited = new Set<string>()
    while (current?.managerId && !visited.has(current.managerId)) {
      visited.add(current.managerId)
      level++
      current = employees.find(emp => emp.id === current!.managerId) || ({} as OrgEmployee)
    }
    return level + 1
  }));

export const maxTeamSize = Math.max(1, ...Array.from(childrenMap.values()).map(c => c.length));

export const renderNode = (emp: OrgEmployee, level: number) => {
    const children = getSubordinates(emp.id)
    const hasChildren = children.length > 0
    const isExpanded = expanded.has(emp.id)
    const isSelected = selectedId === emp.id
    const avatarInitials = `${emp.firstName[0]}${emp.lastName[0]}`
    const levelColor = getLevelColor(level)

    return (
      <div key={emp.id}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
            isSelected
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-transparent hover:bg-muted/50 hover:border-muted'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedId(isSelected ? null : emp.id)}
        >
          {/* Expand toggle */}
          <button
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
            onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(emp.id) }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />}
          </button>

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${levelColor}`}>
            {avatarInitials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{emp.firstName} {emp.lastName}</span>
              {emp.department && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{emp.department}</Badge>
              )}
              {getContractBadge(emp.contractType)}
            </div>
            {emp.position && <p className="text-xs text-muted-foreground truncate">{emp.position}</p>}
          </div>

          {/* Team size indicator */}
          {hasChildren && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{children.length}</span>
            </div>
          )}
        </div>

        {/* Expanded children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-muted-foreground/15" style={{ marginLeft: `${level * 24}px` }} />
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

export const selectedEmployee = selectedId ? employees.find(e => e.id === selectedId) : null;

export const selectedDirectReports = selectedId ? getSubordinates(selectedId) : []

export const selectedManager = selectedEmployee?.managerId ? employees.find(e => e.id === selectedEmployee.managerId) : null;
