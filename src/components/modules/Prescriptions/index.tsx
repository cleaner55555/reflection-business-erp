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
import { Plus, Search, Trash2, Pencil, Eye, Pill, CheckCircle2, Clock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Prescription = {
  id: string
  prescriptionNo: string
  patientName: string
  doctor: string
  date: string
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  type: 'reimbursable' | 'private' | 'narcotic' | 'special'
  medications: { name: string; dosage: string; frequency: string; duration: string; quantity: string }[]
  diagnosis: string
  totalCost: number
  patientShare: number
  insuranceCoverage: number
  pharmacy: string
  validUntil: string
  notes: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Realizovan' },
  expired: { color: 'bg-amber-100 text-amber-800', label: 'Istekao' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Otkazan' },
}

const TYPES: Record<string, { color: string; label: string }> = {
  reimbursable: { color: 'bg-teal-100 text-teal-800', label: 'Reemburzibilni' },
  private: { color: 'bg-gray-100 text-gray-800', label: 'Privatni' },
  narcotic: { color: 'bg-red-100 text-red-800', label: 'Narkotik' },
  special: { color: 'bg-purple-100 text-purple-800', label: 'Specijalni' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function formatRSD(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Prescriptions() {
  const [data, setData] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editItem, setEditItem] = useState<Prescription | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Prescription>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/prescriptions?${params.toString()}`)
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      toast.error('Greška pri učitavanju recepata')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati recept?')) return
    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Greška pri brisanju')
      toast.success('Recept obrisan')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Greška pri brisanju recepta')
    }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ prescriptionNo: `REC-2024-${String(data.length + 1).padStart(3, '0')}`, patientName: '', doctor: '', date: new Date().toISOString().split('T')[0], status: 'active', type: 'reimbursable', medications: [], diagnosis: '', totalCost: 0, patientShare: 0, insuranceCoverage: 0, pharmacy: '', validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: '' })
    setActiveTab('dodaj')
  }

  const openEdit = (item: Prescription) => { setEditItem(item); setForm({ ...item }); setActiveTab('dodaj') }

  const handleSave = async () => {
    if (!form.patientName || !form.doctor) { toast.error('Popunite obavezna polja'); return }
    try {
      setSaving(true)
      if (editItem) {
        const res = await fetch(`/api/prescriptions/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Greška pri ažuriranju')
        toast.success('Recept ažuriran')
      } else {
        const res = await fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Greška pri kreiranju')
        toast.success('Recept kreiran')
      }
      setEditItem(null)
      setActiveTab('pregled')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error(editItem ? 'Greška pri ažuriranju recepta' : 'Greška pri kreiranju recepta')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const activeCount = data.filter(i => i.status === 'active').length
  const totalCost = data.reduce((s, i) => s + i.totalCost, 0)
  const totalInsurance = data.reduce((s, i) => s + i.insuranceCoverage, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Recepti</h1><p className="text-sm text-muted-foreground">Izdavanje i praćenje recepta za lekove</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi recept</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Pill className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupna vrednost</div><p className="text-lg font-bold">{formatRSD(totalCost)}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Osigranje</div><p className="text-lg font-bold text-blue-700">{formatRSD(totalInsurance)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          {detailId && detailItem && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-base">Recept — {detailItem.prescriptionNo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.patientName}</h3>{getTypeBadge(detailItem.type)}{getStatusBadge(detailItem.status)}</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Lekar', detailItem.doctor],
                    ['Datum', formatDate(detailItem.date)],
                    ['Dijagnoza', detailItem.diagnosis],
                    ['Vredi do', formatDate(detailItem.validUntil)],
                    ['Apoteka', detailItem.pharmacy || '—'],
                    ['Ukupna vrednost', formatRSD(detailItem.totalCost)],
                    ['Učešće pacijenta', formatRSD(detailItem.patientShare)],
                    ['Pokriće osiguranja', formatRSD(detailItem.insuranceCoverage)],
                  ].map(([label, val]) => (
                    <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-blue-50"><div className="text-xs text-blue-600 mb-2">Propisani lekovi</div>
                  {detailItem.medications.map((m, i) => (
                    <div key={i} className="text-xs mb-1"><span className="font-medium">{m.name}</span> — {m.dosage} — {m.frequency} — {m.duration} ({m.quantity})</div>
                  ))}
                </div>
                {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
              </div>
            </CardContent>
          </Card>
          )}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista recepata</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="completed">Realizovan</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="cancelled">Otkazan</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Br. recepta</TableHead><TableHead className="text-xs">Pacijent</TableHead><TableHead className="text-xs hidden sm:table-cell">Lekar</TableHead><TableHead className="text-xs hidden md:table-cell">Lekovi</TableHead><TableHead className="text-xs hidden lg:table-cell">Vrednost</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema recepata</TableCell></TableRow> : data.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-mono">{item.prescriptionNo}</TableCell>
                        <TableCell className="text-xs font-medium">{item.patientName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.doctor}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell max-w-[180px] truncate">{item.medications.map(m => m.name).join(', ')}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatRSD(item.totalCost)}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
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
            <CardHeader><CardTitle className="text-base">Novi recept</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => setForm({ ...form, patientName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Lekar *</Label><Input className="text-xs" value={form.doctor || ''} onChange={e => setForm({ ...form, doctor: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Dijagnoza</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'reimbursable'} onValueChange={v => setForm({ ...form, type: v as Prescription['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reimbursable">Reemburzibilni</SelectItem><SelectItem value="private">Privatni</SelectItem><SelectItem value="narcotic">Narkotik</SelectItem><SelectItem value="special">Specijalni</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Vredi do</Label><Input className="text-xs" type="date" value={form.validUntil || ''} onChange={e => setForm({ ...form, validUntil: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Apoteka</Label><Input className="text-xs" value={form.pharmacy || ''} onChange={e => setForm({ ...form, pharmacy: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Lek (ime, doza, učestalost)</Label><Input className="text-xs" value={form.medications?.map(m => m.name).join(', ') || ''} onChange={e => setForm({ ...form, medications: e.target.value.split(',').map(s => ({ name: s.trim(), dosage: '', frequency: '', duration: '', quantity: '' })).filter(m => m.name) })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Ukupna vrednost (RSD)</Label><Input className="text-xs" type="number" value={form.totalCost || ''} onChange={e => setForm({ ...form, totalCost: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Učešće pacijenta (RSD)</Label><Input className="text-xs" type="number" value={form.patientShare || ''} onChange={e => setForm({ ...form, patientShare: Number(e.target.value), insuranceCoverage: (form.totalCost || 0) - Number(e.target.value) })} /></div>
                </div>
                <Button size="sm" className="w-fit gap-2" disabled={saving} onClick={handleSave}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? 'Čuvanje...' : 'Kreiraj recept'}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi recepte</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.prescriptionNo}</span><span className="text-xs font-medium">{item.patientName}</span>{getTypeBadge(item.type)}{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.medications.map(m => m.name).join(', ')} — {formatRSD(item.totalCost)}</p>
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
    </div>
