'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, Eye, Wallet, CheckCircle2, AlertCircle, TrendingUp, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Tuition = {
  id: string
  studentName: string
  program: string
  studyLevel: string
  academicYear: string
  semester: string
  amount: number
  paid: number
  currency: string
  status: string
  dueDate: string
  paidDate: string
  paymentMethod: string
  discount: number
  notes: string
  createdAt: string
  updatedAt: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  paid: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćena' },
  partial: { color: 'bg-amber-100 text-amber-800', label: 'Delimično' },
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Na čekanju' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  exempt: { color: 'bg-teal-100 text-teal-800', label: 'Otpust' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

function formatRSD(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Tuition() {
  const [data, setData] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [editItem, setEditItem] = useState<Tuition | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tuition>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/tuition?${params.toString()}`)
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const json = await res.json()
      setData(json)
    } catch {
      toast.error('Greška pri učitavanju podataka')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const programs = [...new Set(data.map(i => i.program))]

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.studentName, item.program].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchProgram = !programFilter || item.program === programFilter
    return matchSearch && matchStatus && matchProgram
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zapis o školarini?')) return
    try {
      const res = await fetch(`/api/tuition/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Zapis obrisan')
      if (detailId === id) setDetailId(null)
    } catch {
      toast.error('Greška pri brisanju zapisa')
    }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({
      studentName: '', program: '', studyLevel: 'bachelor', academicYear: '',
      semester: 'zimski', amount: 85000, paid: 0, currency: 'RSD',
      status: 'pending', dueDate: '', paidDate: '', paymentMethod: 'cash',
      discount: 0, notes: '',
    })
    setActiveTab('dodaj')
  }

  const openEdit = (item: Tuition) => {
    setEditItem(item)
    setForm({ ...item })
    setActiveTab('dodaj')
  }

  const handleSave = async () => {
    if (!form.studentName || !form.program) { toast.error('Popunite obavezna polja'); return }
    setSaving(true)
    try {
      if (editItem) {
        const res = await fetch(`/api/tuition/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setData(prev => prev.map(i => i.id === editItem.id ? updated : i))
        toast.success('Zapis ažuriran')
      } else {
        const res = await fetch('/api/tuition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setData(prev => [created, ...prev])
        toast.success('Zapis kreiran')
      }
      setActiveTab('pregled')
      setEditItem(null)
    } catch {
      toast.error('Greška pri čuvanju zapisa')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalAmount = data.reduce((s, i) => s + (i.amount || 0), 0)
  const totalPaid = data.reduce((s, i) => s + (i.paid || 0), 0)
  const overdueCount = data.filter(i => i.status === 'overdue').length
  const paidCount = data.filter(i => i.status === 'paid' || i.status === 'exempt').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Školarina</h1><p className="text-sm text-muted-foreground">Upravljanje školarinom, uplatama i stipendijama</p></div>
        {activeTab === 'pregled' && <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi zapis</Button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wallet className="h-3 w-3" />Ukupno</div><p className="text-xl font-bold">{formatRSD(totalAmount)}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Uplaćeno</div><p className="text-xl font-bold text-emerald-700">{formatRSD(totalPaid)}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kasni</div><p className="text-2xl font-bold text-red-700">{overdueCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Regulisanih</div><p className="text-2xl font-bold text-blue-700">{paidCount}/{data.length}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v !== 'dodaj') setEditItem(null) }}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">{editItem ? 'Uredi' : 'Dodaj'}</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista uplata</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="paid">Plaćena</SelectItem><SelectItem value="partial">Delimično</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="exempt">Otpust</SelectItem></SelectContent></Select>
                  <Select value={programFilter || 'all'} onValueChange={v => setProgramFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi programi</SelectItem>{programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Student</TableHead><TableHead className="text-xs hidden sm:table-cell">Program</TableHead><TableHead className="text-xs hidden md:table-cell">Iznos</TableHead><TableHead className="text-xs hidden lg:table-cell">Uplaćeno</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.studentName}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{item.program}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{formatRSD(item.amount)}{item.discount > 0 && <span className="ml-1 text-emerald-600">(-{item.discount}%)</span>}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatRSD(item.paid)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
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
          <Card className="sm:max-w-[500px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                {editItem && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setActiveTab('pregled'); setEditItem(null) }}><ArrowLeft className="h-4 w-4" /></Button>}
                <CardTitle className="text-base">{editItem ? 'Uredi zapis' : 'Novi zapis školarine'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Student *</Label><Input className="text-xs" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Program *</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
                  {editItem && (
                    <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Plaćena</SelectItem><SelectItem value="partial">Delimično</SelectItem><SelectItem value="pending">Na čekanju</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="exempt">Otpust</SelectItem></SelectContent></Select></div>
                  )}
                  <div className="grid gap-2"><Label className="text-xs">Nivo studija</Label><Select value={form.studyLevel || 'bachelor'} onValueChange={v => setForm({ ...form, studyLevel: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bachelor">Osnovne</SelectItem><SelectItem value="master">Master</SelectItem><SelectItem value="doctoral">Doktorske</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Akademska godina</Label><Input className="text-xs" placeholder="2024/2025" value={form.academicYear || ''} onChange={e => setForm({ ...form, academicYear: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Semestar</Label><Select value={form.semester || 'zimski'} onValueChange={v => setForm({ ...form, semester: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="zimski">Zimski</SelectItem><SelectItem value="letnji">Letnji</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Iznos školarine (RSD)</Label><Input className="text-xs" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Popust (%)</Label><Input className="text-xs" type="number" value={form.discount || '0'} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Rok uplate</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {editItem && <Button variant="outline" size="sm" onClick={() => { setActiveTab('pregled'); setEditItem(null) }}>Otkaži</Button>}
                <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}<Plus className="h-4 w-4" />{editItem ? 'Sačuvaj' : 'Kreiraj zapis'}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi zapise</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.studentName}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.program} — {formatRSD(item.amount)} — Uplaćeno: {formatRSD(item.paid)}</p>
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

      {!!detailId && detailItem && (
      <Card className="sm:max-w-[550px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">Detalji školarine</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Student', detailItem.studentName],
                ['Program', detailItem.program],
                ['Nivo studija', detailItem.studyLevel],
                ['Akademska godina', detailItem.academicYear || '—'],
                ['Semestar', detailItem.semester],
                ['Iznos', formatRSD(detailItem.amount)],
                ['Uplaćeno', formatRSD(detailItem.paid)],
                ['Preostalo', formatRSD((detailItem.amount || 0) - (detailItem.paid || 0))],
                ['Popust', `${detailItem.discount}%`],
                ['Rok', formatDate(detailItem.dueDate)],
                ['Datum uplate', detailItem.paidDate ? formatDate(detailItem.paidDate) : '—'],
                ['Način plaćanja', detailItem.paymentMethod || '—'],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
              ))}
            </div>
            <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
            {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
