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
import { Plus, Search, Trash2, Pencil, Eye, FileText, ClipboardList, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type MedicalRecord = {
  id: string
  recordNo: string
  patientName: string
  patientNo: string
  doctor: string
  date: string
  type: 'checkup' | 'follow_up' | 'emergency' | 'lab_result' | 'surgery' | 'referral' | 'discharge'
  diagnosis: string
  diagnosisCode: string
  symptoms: string
  treatment: string
  prescribedMeds: string[]
  vitalSigns: string
  labResults: string
  nextAction: string
  notes: string
}

const TYPES: Record<string, { color: string; label: string }> = {
  checkup: { color: 'bg-emerald-100 text-emerald-800', label: 'Pregled' },
  follow_up: { color: 'bg-blue-100 text-blue-800', label: 'Kontrola' },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Hitno' },
  lab_result: { color: 'bg-purple-100 text-purple-800', label: 'Lab. rezultat' },
  surgery: { color: 'bg-amber-100 text-amber-800', label: 'Operacija' },
  referral: { color: 'bg-teal-100 text-teal-800', label: 'Uput' },
  discharge: { color: 'bg-gray-100 text-gray-800', label: 'Otpust' },
}

function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function MedicalRecords() {
  const [data, setData] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [editItem, setEditItem] = useState<MedicalRecord | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MedicalRecord>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter) params.set('department', typeFilter)
      const query = params.toString()
      const res = await fetch(`/api/medical-records${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      toast.error('Greška pri učitavanju zapisa')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.recordNo, item.patientName, item.doctor, item.diagnosis, item.diagnosisCode].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchType
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zapis?')) return
    try {
      setSaving(true)
      const res = await fetch(`/api/medical-records/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Greška pri brisanju')
      setData(prev => prev.filter(i => i.id !== id))
      toast.success('Zapis obrisan')
    } catch (err) {
      console.error(err)
      toast.error('Greška pri brisanju zapisa')
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setEditItem(null)
    const nextNum = data.length + 1
    setForm({ recordNo: `KAR-2024-${String(nextNum).padStart(4, '0')}`, patientName: '', patientNo: '', doctor: '', date: new Date().toISOString().split('T')[0], type: 'checkup', diagnosis: '', diagnosisCode: '', symptoms: '', treatment: '', prescribedMeds: [], vitalSigns: '', labResults: '', nextAction: '', notes: '' })
    setActiveTab('dodaj')
  }

  const openEdit = (item: MedicalRecord) => { setEditItem(item); setForm({ ...item }); setActiveTab('dodaj') }

  const handleSave = async () => {
    if (!form.patientName || !form.diagnosis) { toast.error('Popunite obavezna polja'); return }
    try {
      setSaving(true)
      if (editItem) {
        const res = await fetch(`/api/medical-records/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Greška pri ažuriranju')
        setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as MedicalRecord : i))
        toast.success('Zapis ažuriran')
      } else {
        const res = await fetch('/api/medical-records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Greška pri kreiranju')
        const created = await res.json()
        setData(prev => [created, ...prev])
        toast.success('Zapis kreiran')
      }
      setActiveTab('pregled'); setEditItem(null)
    } catch (err) {
      console.error(err)
      toast.error(editItem ? 'Greška pri ažuriranju zapisa' : 'Greška pri kreiranju zapisa')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Medicinski kartoni</h1><p className="text-sm text-muted-foreground">Evidencija pregleda, dijagnoza i tretmana</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate} disabled={saving}><Plus className="h-4 w-4" />Novi zapis</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Pregledi</div><p className="text-2xl font-bold text-emerald-700">{data.filter(i => i.type === 'checkup').length}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Kontrole</div><p className="text-2xl font-bold text-blue-700">{data.filter(i => i.type === 'follow_up').length}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1">Hitni</div><p className="text-2xl font-bold text-red-700">{data.filter(i => i.type === 'emergency').length}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista zapisa</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab.</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Br. kartona</TableHead><TableHead className="text-xs">Pacijent</TableHead><TableHead className="text-xs hidden sm:table-cell">Lekar</TableHead><TableHead className="text-xs hidden md:table-cell">Dijagnoza</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-mono">{item.recordNo}</TableCell>
                        <TableCell className="text-xs font-medium">{item.patientName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{item.doctor}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell max-w-[180px] truncate">{item.diagnosis} <span className="text-muted-foreground">({item.diagnosisCode})</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.date)}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)} disabled={saving}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <CardHeader><CardTitle className="text-base">Novi medicinski zapis</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => setForm({ ...form, patientName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Lekar *</Label><Input className="text-xs" value={form.doctor || ''} onChange={e => setForm({ ...form, doctor: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Dijagnoza *</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Šifra dijagnoze (ICD-10)</Label><Input className="text-xs" value={form.diagnosisCode || ''} onChange={e => setForm({ ...form, diagnosisCode: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'checkup'} onValueChange={v => setForm({ ...form, type: v as MedicalRecord['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab. rezultat</SelectItem><SelectItem value="surgery">Operacija</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Simptomi</Label><Input className="text-xs" value={form.symptoms || ''} onChange={e => setForm({ ...form, symptoms: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Tretman</Label><Input className="text-xs" value={form.treatment || ''} onChange={e => setForm({ ...form, treatment: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Recepti (zarez)</Label><Input className="text-xs" value={(form.prescribedMeds || []).join(', ')} onChange={e => setForm({ ...form, prescribedMeds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Vitalni znaci</Label><Input className="text-xs" value={form.vitalSigns || ''} onChange={e => setForm({ ...form, vitalSigns: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Lab. rezultati</Label><Input className="text-xs" value={form.labResults || ''} onChange={e => setForm({ ...form, labResults: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Sledeći korak</Label><Input className="text-xs" value={form.nextAction || ''} onChange={e => setForm({ ...form, nextAction: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}<Plus className="h-4 w-4" />Kreiraj zapis</Button>
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
                      <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.recordNo}</span><span className="text-xs font-medium">{item.patientName}</span>{getTypeBadge(item.type)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.diagnosis} — {item.doctor}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDelete(item.id)} disabled={saving}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {detailId && detailItem && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(null)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">Medicinski karton — {detailItem.recordNo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.patientName}</h3>{getTypeBadge(detailItem.type)}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Lekar', detailItem.doctor],
                  ['Datum', formatDate(detailItem.date)],
                  ['Dijagnoza', detailItem.diagnosis],
                  ['Šifra (ICD-10)', detailItem.diagnosisCode],
                  ['Simptomi', detailItem.symptoms],
                  ['Tretman', detailItem.treatment],
                  ['Vitalni znaci', detailItem.vitalSigns],
                  ['Lab. rezultati', detailItem.labResults],
                  ['Sledeći korak', detailItem.nextAction],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val || '—'}</div></div>
                ))}
              </div>
              {detailItem.prescribedMeds.length > 0 && <div className="p-2 rounded-lg bg-blue-50"><div className="text-xs text-blue-600 mb-1">Propisani lekovi</div><div className="flex flex-wrap gap-1">{detailItem.prescribedMeds.map(m => <Badge key={m} className="text-xs bg-blue-100 text-blue-700">{m}</Badge>)}</div></div>}
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
