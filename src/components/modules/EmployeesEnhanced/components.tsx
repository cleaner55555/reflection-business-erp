'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
'use client'

import { useEffect, useState } from 'react'

import { Award, ChevronDown, ChevronRight, GitBranch, Pencil, Plus, Star, Trash2, User, Users } from 'lucide-react'
import type { EmployeeEval, OrgEmployee } from './types'

function StarRating({ rating, onChange, readOnly = false }: { rating: number; onChange?: (r: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}

function OceneTab() {
  const [evaluations, setEvaluations] = useState<EmployeeEval[]>([])
  const [employees, setEmployees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    employeeId: '', period: 'Q4', year: new Date().getFullYear(), rating: 3,
    strengths: '', weaknesses: '', goals: '', reviewNotes: '', status: 'nacrt', reviewDate: ''
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [eRes, empRes] = await Promise.all([fetch('/api/employee-evaluations'), fetch('/api/employees')])
      if (cancelled) return
      setEvaluations(await eRes.json())
      setEmployees(await empRes.json())
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async () => {
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

  const handleEdit = (ev: EmployeeEval) => {
    setForm({
      employeeId: ev.employee.firstName + ' ' + ev.employee.lastName,
      period: ev.period, year: ev.year, rating: ev.rating,
      strengths: ev.strengths || '', weaknesses: ev.weaknesses || '', goals: ev.goals || '',
      reviewNotes: ev.reviewNotes || '', status: ev.status,
      reviewDate: ev.reviewDate?.split('T')[0] || ''
    })
    setEditId(ev.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/employee-evaluations/${id}`, { method: 'DELETE' })
    setEvaluations(prev => prev.filter(e => e.id !== id))
    toast.success('Ocena obrisana')
  }

  const getRatingLabel = (r: number) => {
    if (r >= 5) return 'Odličan'
    if (r >= 4) return 'Vrlo dobar'
    if (r >= 3) return 'Dobar'
    if (r >= 2) return 'Zadovoljavajući'
    return 'Nezadovoljavajući'
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  const avgRating = evaluations.length > 0 ? (evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{evaluations.length} ocena</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{avgRating}</span>
          </div>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(true); setEditId(null) }}>
          <Plus className="h-3.5 w-3.5" /> Nova ocena
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-dashed">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{editId ? 'Ažuriraj ocenu' : 'Nova ocena'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Zaposleni</Label>
                <Select value={form.employeeId} onValueChange={v => setForm(p => ({ ...p, employeeId: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                  <SelectContent>{employees.map(e => <SelectItem key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Period</Label>
                <Select value={form.period} onValueChange={v => setForm(p => ({ ...p, period: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="Q4">Q4 (Okt-Dec)</SelectItem>
                    <SelectItem value="godisnje">Godišnje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Godina</Label>
                <Input className="mt-1 h-9" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))} />
              </div>
              <div>
                <Label className="text-xs">Ocena</Label>
                <div className="mt-1">
                  <StarRating rating={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
                  <span className="text-xs text-muted-foreground ml-2">{getRatingLabel(form.rating)}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Datum ocene</Label>
                <Input className="mt-1 h-9" type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">Nacrt</SelectItem>
                    <SelectItem value="zakazano">Zakazano</SelectItem>
                    <SelectItem value="zavrseno">Završeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div>
                <Label className="text-xs">Prednosti</Label>
                <Textarea className="mt-1 text-xs" rows={2} value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} placeholder="Šta zaposleni dobro radi..." />
              </div>
              <div>
                <Label className="text-xs">Poboljšanja</Label>
                <Textarea className="mt-1 text-xs" rows={2} value={form.weaknesses} onChange={e => setForm(p => ({ ...p, weaknesses: e.target.value }))} placeholder="Šta može da poboljša..." />
              </div>
              <div>
                <Label className="text-xs">Ciljevi</Label>
                <Textarea className="mt-1 text-xs" rows={2} value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} placeholder="Ciljevi za naredni period..." />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Napomene recenzenta</Label>
              <Textarea className="mt-1 text-xs" rows={2} value={form.reviewNotes} onChange={e => setForm(p => ({ ...p, reviewNotes: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSubmit}>{editId ? 'Ažuriraj' : 'Sačuvaj'}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Otkaži</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Zaposleni</TableHead>
              <TableHead className="text-xs">Pozicija</TableHead>
              <TableHead className="text-xs">Period</TableHead>
              <TableHead className="text-xs">Ocena</TableHead>
              <TableHead className="text-xs">Datum</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map(ev => (
              <TableRow key={ev.id}>
                <TableCell className="text-xs font-medium">{ev.employee.firstName} {ev.employee.lastName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{ev.employee.position || '-'}</TableCell>
                <TableCell className="text-xs">{ev.period} {ev.year}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1">
                    <StarRating rating={ev.rating} readOnly />
                    <span className="text-xs text-muted-foreground">{getRatingLabel(ev.rating)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{ev.reviewDate ? formatDate(ev.reviewDate) : '-'}</TableCell>
                <TableCell className="text-xs">
                  {ev.status === 'zavrseno' ? <Badge className="bg-emerald-100 text-emerald-700">Završeno</Badge> :
                   ev.status === 'zakazano' ? <Badge className="bg-blue-100 text-blue-700">Zakazano</Badge> :
                   <Badge variant="outline">Nacrt</Badge>}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(ev)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(ev.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {evaluations.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                <Award className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                Nema ocena radnog učinka
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rating distribution */}
      {evaluations.length > 0 && (
        <Card className="p-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Distribucija ocena</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {[5, 4, 3, 2, 1].map(r => {
                const count = evaluations.filter(e => e.rating === r).length
                const pct = evaluations.length > 0 ? (count / evaluations.length) * 100 : 0
                return (
                  <div key={r} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground w-4">{r}</span>
                    <div className="w-12 bg-muted rounded-t overflow-hidden" style={{ height: `${Math.max(pct, 4)}px` }}>
                      <div className="w-full h-full bg-amber-400 rounded-t" />
                    </div>
                    <span className="text-xs font-medium w-8 text-center">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OrganigramTab() {
  const [employees, setEmployees] = useState<OrgEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
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
    load()
    return () => { cancelled = true }
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build hierarchy: find root (no manager) then build tree
  const roots = employees.filter(e => !e.managerId)
  const childrenMap = new Map<string, OrgEmployee[]>()
  employees.forEach(e => {
    if (e.managerId) {
      const existing = childrenMap.get(e.managerId) || []
      existing.push(e)
      childrenMap.set(e.managerId, existing)
    }
  })

  const getSubordinates = (empId: string) => childrenMap.get(empId) || []

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-emerald-100 text-emerald-700 border-emerald-200',     // Level 0 - root (CEO/Director)
      'bg-blue-100 text-blue-700 border-blue-200',              // Level 1 - Managers
      'bg-violet-100 text-violet-700 border-violet-200',        // Level 2 - Team leads
      'bg-amber-100 text-amber-700 border-amber-200',          // Level 3 - Team members
      'bg-slate-100 text-slate-700 border-slate-200',           // Level 4+
    ]
    return colors[Math.min(level, colors.length - 1)]
  }

  const getContractBadge = (type: string | null) => {
    switch (type) {
      case 'neodredjeno': return <Badge className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0">Neodređeno</Badge>
      case 'odredjeno': return <Badge className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0">Određeno</Badge>
      case 'honorarno': return <Badge className="bg-violet-100 text-violet-700 text-xs px-1.5 py-0">Honorarno</Badge>
      case 'praksa': return <Badge className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0">Praksa</Badge>
      default: return null
    }
  }

  // Stats
  const totalLevels = Math.max(1, ...employees.map(e => {
    let level = 0
    let current = e
    const visited = new Set<string>()
    while (current?.managerId && !visited.has(current.managerId)) {
      visited.add(current.managerId)
      level++
      current = employees.find(emp => emp.id === current!.managerId) || ({} as OrgEmployee)
    }
    return level + 1
  }))

  const maxTeamSize = Math.max(1, ...Array.from(childrenMap.values()).map(c => c.length))

  const renderNode = (emp: OrgEmployee, level: number) => {
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
                <Badge variant="outline" className="text-xs px-1.5 py-0">{emp.department}</Badge>
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

  // Selected employee details
  const selectedEmployee = selectedId ? employees.find(e => e.id === selectedId) : null
  const selectedDirectReports = selectedId ? getSubordinates(selectedId) : []
  const selectedManager = selectedEmployee?.managerId ? employees.find(e => e.id === selectedEmployee.managerId) : null

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{employees.length} aktivnih zaposlenih</span>
        </div>
        <Badge variant="outline">{totalLevels} nivoa hijerarhije</Badge>
        <Badge variant="outline">Max tim: {maxTeamSize}</Badge>
        <Button size="sm" variant="outline" className="gap-1.5 ml-auto" onClick={() => {
          // Expand all
          setExpanded(new Set(employees.map(e => e.id)))
        }}>
          <ChevronDown className="h-3.5 w-3.5" /> Proširi sve
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setExpanded(new Set())}>
          <ChevronRight className="h-3.5 w-3.5" /> Skupi sve
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree view */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="h-4 w-4" /> Organizaciona struktura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <User className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p>Nema zaposlenih u hijerarhiji</p>
                  <p className="text-xs mt-1">Postavite nadređenog (manager) zaposlenima u formi za uređivanje</p>
                </div>
              ) : (
                <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
                  {roots.map(emp => renderNode(emp, 0))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Detalji</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEmployee ? (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${getLevelColor(
                      (() => { let l = 0; let c = selectedEmployee; const v = new Set<string>(); while (c?.managerId && !v.has(c.managerId)) { v.add(c.managerId); l++; c = employees.find(e => e.id === c!.managerId) || ({} as OrgEmployee) } return l })()
                    )}`}>
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </div>
                    <h3 className="text-sm font-semibold mt-2">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p className="text-xs text-muted-foreground">{selectedEmployee.position || 'Nema poziciju'}</p>
                    {selectedEmployee.department && (
                      <Badge variant="outline" className="text-xs mt-1">{selectedEmployee.department}</Badge>
                    )}
                  </div>

                  {/* Info grid */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded bg-muted/30">
                      <span className="text-muted-foreground">Plata</span>
                      <span className="font-medium">{formatRSD(selectedEmployee.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-muted/30">
                      <span className="text-muted-foreground">Tip ugovora</span>
                      <span className="font-medium capitalize">{selectedEmployee.contractType || 'Određeno'}</span>
                    </div>
                    {selectedManager && (
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">Nadređeni</span>
                        <span className="font-medium">{selectedManager.firstName} {selectedManager.lastName}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-2 rounded bg-muted/30">
                      <span className="text-muted-foreground">Podređeni</span>
                      <span className="font-medium">{selectedDirectReports.length}</span>
                    </div>
                  </div>

                  {/* Direct reports */}
                  {selectedDirectReports.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold mb-2">Neposredni podređeni ({selectedDirectReports.length})</p>
                      <div className="space-y-1.5">
                        {selectedDirectReports.map(dr => (
                          <div
                            key={dr.id}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-xs"
                            onClick={() => { setSelectedId(dr.id); if (!expanded.has(dr.id)) toggleExpand(dr.id) }}
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {dr.firstName[0]}{dr.lastName[0]}
                            </div>
                            <span className="font-medium">{dr.firstName} {dr.lastName}</span>
                            <span className="text-muted-foreground ml-auto">{dr.position || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <User className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p>Izaberite zaposlenog sa organigrama</p>
                  <p className="mt-1">da vidite detalje</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
