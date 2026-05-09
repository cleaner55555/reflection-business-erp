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
import { Plus, Search, Trash2, Pencil, Eye, Pill, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
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

const INITIAL: Prescription[] = [
  { id: '1', prescriptionNo: 'REC-2024-001', patientName: 'Luka Petrović', doctor: 'Dr. Jelena Marković', date: '2024-06-10', status: 'active', type: 'reimbursable', medications: [{ name: 'Metformin 1000mg', dosage: '1000mg', frequency: '2x dnevno', duration: '90 dana', quantity: '180 tableta' }, { name: 'Vitamin D3 2000IU', dosage: '2000IU', frequency: '1x dnevno', duration: '90 dana', quantity: '90 kapsula' }], diagnosis: 'E11 — Dijabetes tip 2', totalCost: 3200, patientShare: 640, insuranceCoverage: 2560, pharmacy: 'Apoteka "Lek"', validUntil: '2024-07-10', notes: 'Reemburzibilni recept — 80% pokriće' },
  { id: '2', prescriptionNo: 'REC-2024-002', patientName: 'Ana Stanković', doctor: 'Dr. Dragan Milić', date: '2024-06-14', status: 'active', type: 'reimbursable', medications: [{ name: 'Amoksicilin/Clav 875/125mg', dosage: '875/125mg', frequency: '3x dnevno', duration: '10 dana', quantity: '30 tableta' }, { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '3x dnevno po potrebi', duration: '10 dana', quantity: '30 tableta' }], diagnosis: 'J18.0 — Pneumonija', totalCost: 1850, patientShare: 370, insuranceCoverage: 1480, pharmacy: '', validUntil: '2024-07-14', notes: '' },
  { id: '3', prescriptionNo: 'REC-2024-003', patientName: 'Nikola Milić', doctor: 'Dr. Snežana Đorđević', date: '2024-06-15', status: 'active', type: 'special', medications: [{ name: 'Nifedipin 10mg', dosage: '10mg sublingvalno', frequency: 'Hitno', duration: 'Jednokratno', quantity: '1 tableta' }, { name: 'Kaptopril 25mg', dosage: '25mg', frequency: '2x dnevno', duration: 'Neprekidno', quantity: '60 tableta' }], diagnosis: 'I10 — Hipertenzivna kriza', totalCost: 950, patientShare: 950, insuranceCoverage: 0, pharmacy: 'Bolnička apoteka', validUntil: '2024-06-22', notes: 'Hitni recept — hospitalizacija' },
  { id: '4', prescriptionNo: 'REC-2024-004', patientName: 'Gordana Đorđević', doctor: 'Dr. Jelena Marković', date: '2024-06-13', status: 'completed', type: 'reimbursable', medications: [{ name: 'Atorvastatin 20mg', dosage: '20mg', frequency: '1x dnevno (veče)', duration: '90 dana', quantity: '90 tableta' }, { name: 'Omega-3 1000mg', dosage: '1000mg', frequency: '1x dnevno', duration: '90 dana', quantity: '90 kapsula' }], diagnosis: 'E78.5 — Hiperholesterolemija', totalCost: 4100, patientShare: 820, insuranceCoverage: 3280, pharmacy: 'Apoteka "Zdravlje"', validUntil: '2024-07-13', notes: 'Realizovan 13.06.' },
  { id: '5', prescriptionNo: 'REC-2024-005', patientName: 'Mira Stojanović', doctor: 'Dr. Goran Savić', date: '2024-06-12', status: 'active', type: 'reimbursable', medications: [{ name: 'Metformin 850mg', dosage: '850mg', frequency: '2x dnevno', duration: '90 dana', quantity: '180 tableta' }, { name: 'Insulin Glargin 100IU/mL', dosage: '24U', frequency: '1x dnevno (veče)', duration: '90 dana', quantity: '3 olovke x 3mL' }, { name: 'Ramipril 10mg', dosage: '10mg', frequency: '1x dnevno', duration: '90 dana', quantity: '90 tableta' }, { name: 'Amlodipin 5mg', dosage: '5mg', frequency: '1x dnevno', duration: '90 dana', quantity: '90 tableta' }, { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: '1x dnevno', duration: '90 dana', quantity: '90 tableta' }], diagnosis: 'E11 + I10 — Dijabetes + Hipertenzija', totalCost: 18500, patientShare: 3700, insuranceCoverage: 14800, pharmacy: '', validUntil: '2024-07-12', notes: 'Politerapija — 5 lekova' },
  { id: '6', prescriptionNo: 'REC-2024-006', patientName: 'Stefan Ilić', doctor: 'Dr. Dragan Milić', date: '2024-06-08', status: 'completed', type: 'private', medications: [{ name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Po potrebi (max 4x/dan)', duration: '14 dana', quantity: '28 tableta' }, { name: 'Vitamin C 1000mg', dosage: '1000mg', frequency: '1x dnevno', duration: '30 dana', quantity: '30 tableta' }], diagnosis: 'B27.9 — Mononukleoza (otpust)', totalCost: 850, patientShare: 850, insuranceCoverage: 0, pharmacy: 'Apoteka "Lek"', validUntil: '2024-06-22', notes: 'Privatni recept — analgetik + suplement' },
  { id: '7', prescriptionNo: 'REC-2024-007', patientName: 'Marko Jovanović', doctor: 'Dr. Ana Nikolić', date: '2024-06-05', status: 'expired', type: 'reimbursable', medications: [{ name: 'Salbutamol 100μg/inh', dosage: '200μg', frequency: 'Po potrebi', duration: 'Neprekidno', quantity: '1 inhalator' }, { name: 'Budesonid/Formoterol 160/4.5μg', dosage: '2 udisaja', frequency: '2x dnevno', duration: '90 dana', quantity: '1 inhalator' }], diagnosis: 'J45 — Astma', totalCost: 3200, patientShare: 640, insuranceCoverage: 2560, pharmacy: '', validUntil: '2024-06-20', notes: 'Nije realizovan — istekao rok' },
  { id: '8', prescriptionNo: 'REC-2024-008', patientName: 'Milan Marković', doctor: 'Dr. Ana Nikolić', date: '2024-06-05', status: 'active', type: 'narcotic', medications: [{ name: 'Morfijum 10mg/ml amp.', dosage: '10mg', frequency: 'Po potrebi (max 4x/dan)', duration: '14 dana', quantity: '10 ampula' }], diagnosis: 'J44.1 — KOPB (simptomatska terapija)', totalCost: 450, patientShare: 90, insuranceCoverage: 360, pharmacy: '', validUntil: '2024-06-19', notes: 'Recept na posebnom obrascu — narkotik' },
]

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
  const [data, setData] = useState<Prescription[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Prescription | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Prescription>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.prescriptionNo, item.patientName, item.doctor, item.diagnosis].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati recept?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Recept obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ prescriptionNo: `REC-2024-${String(data.length + 1).padStart(3, '0')}`, patientName: '', doctor: '', date: new Date().toISOString().split('T')[0], status: 'active', type: 'reimbursable', medications: [], diagnosis: '', totalCost: 0, patientShare: 0, insuranceCoverage: 0, pharmacy: '', validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Prescription) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.patientName || !form.doctor) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Prescription : i)); toast.success('Recept ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as Prescription, ...prev]); toast.success('Recept kreiran') }
    setDialogOpen(false)
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
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema recepata</TableCell></TableRow> : filtered.map(item => (
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
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj recept</Button>
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

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Recept — {detailItem?.prescriptionNo}</DialogTitle></DialogHeader>
          {detailItem && (
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
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi recept' : 'Novi recept'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => setForm({ ...form, patientName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v as Prescription['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="completed">Realizovan</SelectItem><SelectItem value="expired">Istekao</SelectItem><SelectItem value="cancelled">Otkazan</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'reimbursable'} onValueChange={v => setForm({ ...form, type: v as Prescription['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reimbursable">Reemburzibilni</SelectItem><SelectItem value="private">Privatni</SelectItem><SelectItem value="narcotic">Narkotik</SelectItem><SelectItem value="special">Specijalni</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Vrednost</Label><Input className="text-xs" type="number" value={form.totalCost || ''} onChange={e => setForm({ ...form, totalCost: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
