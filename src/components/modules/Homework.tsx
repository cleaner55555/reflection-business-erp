'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, Pencil, Eye, BookOpen, CheckCircle2, Clock, AlertTriangle, FileText, CalendarDays, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Homework {
  id: string; title: string; subject: string; teacher: string; group: string; assignedDate: string; dueDate: string
  description: string; status: 'assigned' | 'submitted' | 'graded' | 'late'; maxPoints: number; avgScore: number | null
  submissions: number; totalStudents: number; type: 'essay' | 'problem_set' | 'project' | 'lab_report' | 'quiz'
}

const INITIAL: Homework[] = [
  { id: '1', title: 'Matrice i determinante - Vežbanje', subject: 'Linearna algebra', teacher: 'Dr. P. Nikolić', group: '1IT-2024', assignedDate: '2024-06-10', dueDate: '2024-06-17', description: 'Rešiti zadatke 1-30 iz poglavlja 4. Fokus na operacije sa matricama i računanje determinanti.', status: 'assigned', maxPoints: 20, avgScore: null, submissions: 18, totalStudents: 35, type: 'problem_set' },
  { id: '2', title: 'Esej o uticaju AI na obrazovanje', subject: 'Engleski jezik', teacher: 'J. Stanković', group: '1IT-2024', assignedDate: '2024-06-05', dueDate: '2024-06-12', description: 'Napisati esej od 500-700 reči na temu uticaja veštačke inteligencije na obrazovanje.', status: 'graded', maxPoints: 30, avgScore: 22.5, submissions: 35, totalStudents: 35, type: 'essay' },
  { id: '3', title: 'C program - Pokazivači i nizovi', subject: 'Programiranje 1', teacher: 'M. Đorđević', group: '1IT-2024', assignedDate: '2024-06-12', dueDate: '2024-06-19', description: 'Implementirati funkcije za rad sa nizovima koristeći pokazivače.', status: 'submitted', maxPoints: 25, avgScore: null, submissions: 28, totalStudents: 35, type: 'problem_set' },
  { id: '4', title: 'Projekat - Baza podataka biblioteke', subject: 'Baze podataka', teacher: 'G. Jovanović', group: '2IT-2024', assignedDate: '2024-06-01', dueDate: '2024-06-28', description: 'Dizajnirati i implementirati bazu podataka za biblioteku sa minimum 6 tabela.', status: 'assigned', maxPoints: 100, avgScore: null, submissions: 5, totalStudents: 30, type: 'project' },
  { id: '5', title: 'Kviz - Digitalna logika', subject: 'Arhitektura računara', teacher: 'Dr. N. Popović', group: '2IT-2024', assignedDate: '2024-06-08', dueDate: '2024-06-08', description: 'Kviz od 20 pitanja iz digitalne logike.', status: 'graded', maxPoints: 20, avgScore: 15.2, submissions: 30, totalStudents: 30, type: 'quiz' },
  { id: '6', title: 'Izveštaj laboratorijskih vežbi - Mehanika', subject: 'Fizika 1', teacher: 'Dr. J. Stanković', group: '1IT-2024', assignedDate: '2024-06-04', dueDate: '2024-06-11', description: 'Napisati izveštaj o laboratorijskim vežbama iz mehanike.', status: 'late', maxPoints: 15, avgScore: 10.3, submissions: 33, totalStudents: 35, type: 'lab_report' },
]

const STATUSES: Record<string, { color: string; label: string }> = { assigned: { color: 'bg-sky-100 text-sky-800', label: 'Dodeljen' }, submitted: { color: 'bg-amber-100 text-amber-800', label: 'Predati' }, graded: { color: 'bg-emerald-100 text-emerald-800', label: 'Ocenjen' }, late: { color: 'bg-red-100 text-red-800', label: 'Kasni' } }
const TYPES: Record<string, { label: string }> = { essay: { label: 'Esej' }, problem_set: { label: 'Zadaci' }, project: { label: 'Projekat' }, lab_report: { label: 'Lab. izveštaj' }, quiz: { label: 'Kviz' } }
function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function DomaciZadatak() {
  const [data, setData] = useState<Homework[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.subject.toLowerCase().includes(search.toLowerCase()) || item.teacher.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  }), [data, search])

  const stats = useMemo(() => ({
    total: data.length, assigned: data.filter(d => d.status === 'assigned').length, graded: data.filter(d => d.status === 'graded').length,
    late: data.filter(d => d.status === 'late').length, avgCompletion: Math.round(data.reduce((s, d) => s + (d.submissions / d.totalStudents) * 100, 0) / data.length),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Obrisano') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Domaći zadaci</h1><p className="text-sm text-muted-foreground">Upravljanje domaćim zadacima</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Dodeljeni</div><p className="text-xl font-bold text-sky-700">{stats.assigned}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Ocenjeni</div><p className="text-xl font-bold text-emerald-700">{stats.graded}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Kasni</div><p className="text-xl font-bold text-red-700">{stats.late}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prosek predaje</div><p className="text-xl font-bold">{stats.avgCompletion}%</p></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><CardTitle className="text-base">Svi zadaci</CardTitle><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Naziv, predmet..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div></div></CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Zadatak</TableHead><TableHead className="text-xs hidden sm:table-cell">Predmet</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Predaje</TableHead><TableHead className="text-xs hidden lg:table-cell">Bodovi</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema zadataka</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                    <TableCell><div className="text-xs font-medium">{item.title}</div><div className="text-[10px] text-muted-foreground">{item.teacher} · {item.group}</div></TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{item.subject}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{TYPES[item.type]?.label}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.submissions}/{item.totalStudents} ({Math.round(item.submissions / item.totalStudents * 100)}%)</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.avgScore ? `${item.avgScore}/${item.maxPoints}` : `${item.maxPoints} max`}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Detalji zadatka</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><p className="text-lg font-bold">{detailItem.title}</p>{getStatusBadge(detailItem.status)}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Predmet</div><p className="text-xs font-medium">{detailItem.subject}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Nastavnik</div><p className="text-xs font-medium">{detailItem.teacher}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Grupa</div><p className="text-xs font-medium">{detailItem.group}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Tip</div><p className="text-xs font-medium">{TYPES[detailItem.type]?.label}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Bodovi</div><p className="text-xs font-bold">{detailItem.avgScore ? `${detailItem.avgScore}/${detailItem.maxPoints}` : `${detailItem.maxPoints} max`}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Rok</div><p className="text-xs">{formatDate(detailItem.dueDate)}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs">{detailItem.description}</p><p className="text-[10px] text-muted-foreground mt-2">Predato: {detailItem.submissions}/{detailItem.totalStudents}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
