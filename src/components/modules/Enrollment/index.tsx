'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, UserPlus, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Enrollment = {
  id: string
  applicantName: string
  jmbg: string
  email: string
  phone: string
  program: string
  studyLevel: string
  status: string
  applicationDate: string
  entranceExamScore: number
  highSchoolGPA: number
  previousSchool: string
  city: string
  documentsComplete: boolean
  interviewDate: string
  notes: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Na čekanju' },
  documents_submitted: { color: 'bg-blue-100 text-blue-800', label: 'Dokumenta' },
  under_review: { color: 'bg-amber-100 text-amber-800', label: 'U proceduri' },
  accepted: { color: 'bg-emerald-100 text-emerald-800', label: 'Prihvaćen' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Odbijen' },
  enrolled: { color: 'bg-teal-100 text-teal-800', label: 'Upisan' },
}

const LEVELS: Record<string, { label: string }> = {
  bachelor: { label: 'Osnovne' },
  master: { label: 'Master' },
  phd: { label: 'Doktorske' },
  specialist: { label: 'Specijalističke' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function Enrollment() {
  const [data, setData] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Enrollment | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Enrollment>>({})

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/enrollment')
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const json = await res.json()
      setData(json as Enrollment[])
    } catch {
      toast.error('Greška pri učitavanju prijava')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.applicantName, item.program, item.city, item.previousSchool].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchLevel = !levelFilter || item.studyLevel === levelFilter
    return matchSearch && matchStatus && matchLevel
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati prijavu?')) return
    try {
      const res = await fetch(`/api/enrollment/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Prijava obrisana')
    } catch {
      toast.error('Greška pri brisanju prijave')
    }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ applicantName: '', jmbg: '', email: '', phone: '', program: '', studyLevel: 'bachelor', status: 'pending', applicationDate: new Date().toISOString().split('T')[0], entranceExamScore: 0, highSchoolGPA: 0, previousSchool: '', city: '', documentsComplete: false, interviewDate: '', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Enrollment) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.applicantName || !form.program) { toast.error('Popunite obavezna polja'); return }
    setSaving(true)
    try {
      if (editItem) {
        const res = await fetch(`/api/enrollment/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...updated } : i))
        toast.success('Prijava ažurirana')
      } else {
        const res = await fetch('/api/enrollment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setData(prev => [created, ...prev])
        toast.success('Prijava kreirana')
      }
      setDialogOpen(false)
    } catch {
      toast.error(editItem ? 'Greška pri ažuriranju prijave' : 'Greška pri kreiranju prijave')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const pendingCount = data.filter(i => i.status === 'pending').length
  const acceptedCount = data.filter(i => i.status === 'accepted' || i.status === 'enrolled').length
  const rejectedCount = data.filter(i => i.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Prijave za upis</h1><p className="text-sm text-muted-foreground">Upravljanje prijavama, dokumentacijom i upisom kandidata</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nova prijava</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UserPlus className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Na čekanju</div><p className="text-2xl font-bold text-amber-700">{pendingCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Prihvaćeni</div><p className="text-2xl font-bold text-emerald-700">{acceptedCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Odbijeni</div><p className="text-2xl font-bold text-red-700">{rejectedCount}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista prijava</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="documents_submitted">Dokumenta</SelectItem><SelectItem value="under_review">U proceduri</SelectItem><SelectItem value="accepted">Prihvaćen</SelectItem><SelectItem value="rejected">Odbijen</SelectItem><SelectItem value="enrolled">Upisan</SelectItem></SelectContent></Select>
              <Select value={levelFilter || 'all'} onValueChange={v => setLevelFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="bachelor">Osnovne</SelectItem><SelectItem value="master">Master</SelectItem><SelectItem value="phd">Doktorske</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Kandidat</TableHead><TableHead className="text-xs hidden sm:table-cell">Program</TableHead><TableHead className="text-xs hidden md:table-cell">Nivo</TableHead><TableHead className="text-xs hidden md:table-cell">Prosek</TableHead><TableHead className="text-xs hidden lg:table-cell">Grad</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema prijava</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium">{item.applicantName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.program}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{LEVELS[item.studyLevel]?.label}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.highSchoolGPA > 0 ? item.highSchoolGPA : '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.city}</TableCell>
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

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalji prijave</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.applicantName}</h3>{getStatusBadge(detailItem.status)}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['JMBG', detailItem.jmbg],
                  ['Email', detailItem.email],
                  ['Telefon', detailItem.phone],
                  ['Program', detailItem.program],
                  ['Nivo', LEVELS[detailItem.studyLevel]?.label],
                  ['Prethodna škola', detailItem.previousSchool],
                  ['Grad', detailItem.city],
                  ['Prosek ocena', detailItem.highSchoolGPA > 0 ? String(detailItem.highSchoolGPA) : '—'],
                  ['Prijemni ispit', detailItem.entranceExamScore > 0 ? String(detailItem.entranceExamScore) : 'Nije polagan'],
                  ['Datum prijave', formatDate(detailItem.applicationDate)],
                  ['Intervju', detailItem.interviewDate ? formatDate(detailItem.interviewDate) : 'Nije zakazan'],
                  ['Dokumenta kompletna', detailItem.documentsComplete ? 'Da' : 'Ne'],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi prijavu' : 'Nova prijava'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.applicantName || ''} onChange={e => setForm({ ...form, applicantName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="documents_submitted">Dokumenta</SelectItem><SelectItem value="under_review">U proceduri</SelectItem><SelectItem value="accepted">Prihvaćen</SelectItem><SelectItem value="rejected">Odbijen</SelectItem><SelectItem value="enrolled">Upisan</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Program</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Prosek</Label><Input className="text-xs" type="number" step="0.01" value={form.highSchoolGPA || ''} onChange={e => setForm({ ...form, highSchoolGPA: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
