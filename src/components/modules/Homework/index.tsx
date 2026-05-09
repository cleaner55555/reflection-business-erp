'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Homework = {
  id: string
  title: string
  subject: string
  classGroup: string
  teacher: string
  type: 'essay' | 'problem_set' | 'lab_report' | 'project' | 'presentation' | 'reading'
  status: 'assigned' | 'submitted' | 'graded' | 'overdue' | 'returned'
  dueDate: string
  assignedDate: string
  maxPoints: number
  avgScore: number
  submittedCount: number
  totalStudents: number
  description: string
  instructions: string
}

const INITIAL: Homework[] = [
  { id: '1', title: 'Analiza tržišnih kretanja u Srbiji 2024', subject: 'Ekonomija', classGroup: 'III-2', teacher: 'Prof. Dragan Milić', type: 'essay', status: 'assigned', dueDate: '2024-06-20', assignedDate: '2024-06-10', maxPoints: 30, avgScore: 0, submittedCount: 0, totalStudents: 28, description: 'Napisati analizu od 1500-2000 reči o aktuelnim tržišnim kretanjima', instructions: 'Koristiti zvanične izvore RZS i NBS. Priložiti grafikone.' },
  { id: '2', title: 'Integralno računanje — zbirka zadataka', subject: 'Matematika', classGroup: 'II-1', teacher: 'Prof. Jelena Marković', type: 'problem_set', status: 'graded', dueDate: '2024-06-12', assignedDate: '2024-06-05', maxPoints: 20, avgScore: 14.5, submittedCount: 30, totalStudents: 32, description: 'Rešiti zadatke 1-25 iz poglavlja 8', instructions: 'Prikazati svaki korak. Korišćenje kalkulatora nije dozvoljeno.' },
  { id: '3', title: 'Laboratorijski izveštaj: Kinetika reakcija', subject: 'Hemija', classGroup: 'III-1', teacher: 'Prof. Goran Savić', type: 'lab_report', status: 'submitted', dueDate: '2024-06-18', assignedDate: '2024-06-04', maxPoints: 25, avgScore: 0, submittedCount: 22, totalStudents: 25, description: 'Izveštaj o eksperimentu brzine hemijske reakcije', instructions: 'Format: Uvod, Metodologija, Rezultati, Diskusija, Zaključak. Priložiti raw podatke.' },
  { id: '4', title: 'Grupni projekat: Poslovni plan startup-a', subject: 'Preduzetništvo', classGroup: 'IV-1', teacher: 'Prof. Ana Nikolić', type: 'project', status: 'assigned', dueDate: '2024-06-28', assignedDate: '2024-06-01', maxPoints: 50, avgScore: 0, submittedCount: 0, totalStudents: 26, description: 'Kreirati kompletni poslovni plan za fiktivni startup', instructions: 'Grupe 4-5 studenata. Prezentacija 15 min. Uključiti SWOT analizu, finansijske projekte i marketinški plan.' },
  { id: '5', title: 'Prezentacija: Obnovljivi izvori energije', subject: 'Fizika', classGroup: 'II-2', teacher: 'Prof. Snežana Đorđević', type: 'presentation', status: 'overdue', dueDate: '2024-06-10', assignedDate: '2024-05-28', maxPoints: 15, avgScore: 0, submittedCount: 18, totalStudents: 30, description: 'Individualna prezentacija 10 min o izabranom obnovljivom izvoru', instructions: 'PowerPoint ili PDF. Najmanje 5 akademskih referenci. Vreme: 8-12 min.' },
  { id: '6', title: 'Čitanje: Na Drini ćuprija — analiza', subject: 'Književnost', classGroup: 'III-1', teacher: 'Prof. Marija Ilić', type: 'reading', status: 'returned', dueDate: '2024-06-08', assignedDate: '2024-05-25', maxPoints: 20, avgScore: 16.2, submittedCount: 25, totalStudents: 25, description: 'Literarna analiza romana Ive Andrića', instructions: 'Fokus na narativne tehnike, simboliku i istorijski kontekst. 1000-1500 reči.' },
  { id: '7', title: 'Linearna algebra — matrice i determinante', subject: 'Matematika', classGroup: 'I-1', teacher: 'Prof. Jelena Marković', type: 'problem_set', status: 'graded', dueDate: '2024-06-05', assignedDate: '2024-05-28', maxPoints: 25, avgScore: 18.3, submittedCount: 35, totalStudents: 35, description: 'Zadaci iz matrica, determinanata i sistema jednačina', instructions: 'Poglavlje 5 i 6. Pokazati računske korake.' },
  { id: '8', title: 'HTML/CSS portfolio sajt', subject: 'Računarstvo', classGroup: 'II-1', teacher: 'Nenad Stojanović', type: 'project', status: 'assigned', dueDate: '2024-06-25', assignedDate: '2024-06-08', maxPoints: 40, avgScore: 0, submittedCount: 0, totalStudents: 32, description: 'Kreirati responsivni portfolio sajt sa HTML i CSS', instructions: 'Najmanje 4 sekcije. Validan HTML5. Responsivan dizajn. Hosting na GitHub Pages.' },
  { id: '9', title: 'Makroekonomski pokazatelji — istraživanje', subject: 'Ekonomija', classGroup: 'IV-2', teacher: 'Prof. Dragan Milić', type: 'essay', status: 'submitted', dueDate: '2024-06-19', assignedDate: '2024-06-05', maxPoints: 30, avgScore: 0, submittedCount: 15, totalStudents: 27, description: 'Analiza BDP, inflacije i stopa zaposlenosti u Srbiji', instructions: 'Duzina 2000-2500 reči. Minimum 5 akademskih izvora.' },
  { id: '10', title: 'Programiranje u Python-u: funkcije', subject: 'Računarstvo', classGroup: 'I-2', teacher: 'Nenad Stojanović', type: 'problem_set', status: 'assigned', dueDate: '2024-06-22', assignedDate: '2024-06-12', maxPoints: 20, avgScore: 0, submittedCount: 0, totalStudents: 30, description: 'Rešiti 15 zadataka sa funkcijama, rekurzijom i lambda izrazima', instructions: 'Kod u .py fajlu. Dodati komentare. Testirati svaku funkciju.' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  assigned: { color: 'bg-blue-100 text-blue-800', label: 'Dodeljena' },
  submitted: { color: 'bg-amber-100 text-amber-800', label: 'Predana' },
  graded: { color: 'bg-emerald-100 text-emerald-800', label: 'Ocenjena' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  returned: { color: 'bg-gray-100 text-gray-800', label: 'Vraćena' },
}

const TYPES: Record<string, { label: string }> = {
  essay: { label: 'Esej' },
  problem_set: { label: 'Zadaci' },
  lab_report: { label: 'Lab. izveštaj' },
  project: { label: 'Projekat' },
  presentation: { label: 'Prezentacija' },
  reading: { label: 'Čitanje' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function Homework() {
  const [data, setData] = useState<Homework[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Homework | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Homework>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const subjects = [...new Set(data.map(i => i.subject))]

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.title, item.subject, item.classGroup, item.teacher].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchSubject = !subjectFilter || item.subject === subjectFilter
    return matchSearch && matchStatus && matchSubject
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati obavezu?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Obaveza obrisana')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ title: '', subject: '', classGroup: '', teacher: '', type: 'essay', status: 'assigned', dueDate: '', assignedDate: new Date().toISOString().split('T')[0], maxPoints: 20, avgScore: 0, submittedCount: 0, totalStudents: 30, description: '', instructions: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Homework) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.subject) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Homework : i))
      toast.success('Obaveza ažurirana')
    } else {
      const newItem: Homework = { id: Date.now().toString(), ...form } as Homework
      setData(prev => [newItem, ...prev])
      toast.success('Obaveza kreirana')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const assignedCount = data.filter(i => i.status === 'assigned').length
  const gradedCount = data.filter(i => i.status === 'graded').length
  const overdueCount = data.filter(i => i.status === 'overdue').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Domaće obaveze</h1><p className="text-sm text-muted-foreground">Dodeljivanje, praćenje i ocenjivanje domaćih zadataka</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova obaveza</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Aktivnih</div><p className="text-2xl font-bold text-blue-700">{assignedCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ocenjenih</div><p className="text-2xl font-bold text-emerald-700">{gradedCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kasne</div><p className="text-2xl font-bold text-red-700">{overdueCount}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista obaveza</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="assigned">Dodeljena</SelectItem><SelectItem value="submitted">Predana</SelectItem><SelectItem value="graded">Ocenjena</SelectItem><SelectItem value="overdue">Kasni</SelectItem></SelectContent></Select>
                  <Select value={subjectFilter || 'all'} onValueChange={v => setSubjectFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi predmeti</SelectItem>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden sm:table-cell">Predmet</TableHead><TableHead className="text-xs hidden md:table-cell">Odjeljenje</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs hidden lg:table-cell">Predano</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema obaveza</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{item.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.subject}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.classGroup}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{TYPES[item.type]?.label || item.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{item.submittedCount}/{item.totalStudents}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Nova obaveza</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2 sm:col-span-2"><Label className="text-xs">Naslov *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Naslov zadatka" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Predmet *</Label><Input className="text-xs" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Predmet" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Odjeljenje</Label><Input className="text-xs" value={form.classGroup || ''} onChange={e => setForm({ ...form, classGroup: e.target.value })} placeholder="III-2" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Nastavnik</Label><Input className="text-xs" value={form.teacher || ''} onChange={e => setForm({ ...form, teacher: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'essay'} onValueChange={v => setForm({ ...form, type: v as Homework['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Rok predaje</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Max bodova</Label><Input className="text-xs" type="number" value={form.maxPoints || ''} onChange={e => setForm({ ...form, maxPoints: Number(e.target.value) })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input className="text-xs" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Uputstva</Label><Input className="text-xs" value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj obavezu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi obaveze</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.title}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.subject} — {item.classGroup} — Rok: {formatDate(item.dueDate)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji obaveze</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{detailItem.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Predmet', detailItem.subject],
                  ['Odjeljenje', detailItem.classGroup],
                  ['Nastavnik', detailItem.teacher],
                  ['Tip', TYPES[detailItem.type]?.label],
                  ['Rok', formatDate(detailItem.dueDate)],
                  ['Dodeljena', formatDate(detailItem.assignedDate)],
                  ['Max bodova', String(detailItem.maxPoints)],
                  ['Prosek', detailItem.avgScore > 0 ? String(detailItem.avgScore) : '—'],
                  ['Predano', `${detailItem.submittedCount}/${detailItem.totalStudents}`],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
              {detailItem.description && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Opis</div><div className="text-xs">{detailItem.description}</div></div>}
              {detailItem.instructions && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Uputstva</div><div className="text-xs">{detailItem.instructions}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi obavezu' : 'Nova obaveza'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Naslov *</Label><Input className="text-xs" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'assigned'} onValueChange={v => setForm({ ...form, status: v as Homework['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="assigned">Dodeljena</SelectItem><SelectItem value="submitted">Predana</SelectItem><SelectItem value="graded">Ocenjena</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="returned">Vraćena</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Max bodova</Label><Input className="text-xs" type="number" value={form.maxPoints || ''} onChange={e => setForm({ ...form, maxPoints: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Rok</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Opis</Label><Input className="text-xs" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
