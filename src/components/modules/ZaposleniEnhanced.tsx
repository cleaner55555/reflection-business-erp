'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Star, Plus, Pencil, Trash2, Award, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

// ==================== OCENE RADNOG UČINKA TAB ====================

interface EmployeeEval {
  id: string; period: string; year: number; rating: number; strengths: string | null
  weaknesses: string | null; goals: string | null; reviewNotes: string | null
  status: string; reviewDate: string | null; createdAt: string
  employee: { firstName: string; lastName: string; position: string | null; department: string | null }
}

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

export { OceneTab }
