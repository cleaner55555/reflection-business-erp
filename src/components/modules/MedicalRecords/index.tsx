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
import { Plus, Search, Trash2, Pencil, Eye, FileText, ClipboardList } from 'lucide-react'
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

const INITIAL: MedicalRecord[] = [
  { id: '1', recordNo: 'KAR-2024-0001', patientName: 'Luka Petrović', patientNo: 'PAC-2024-001', doctor: 'Dr. Jelena Marković', date: '2024-06-10', type: 'checkup', diagnosis: 'Dijabetes tip 2 — kontrola', diagnosisCode: 'E11', symptoms: 'Bez simptoma, redovna kontrola', treatment: 'Nastavak terapije Metformin 1000mg x2, dijeta + vežbanje', prescribedMeds: ['Metformin 1000mg', 'Vitamin D3 2000IU'], vitalSigns: 'Pritisak: 130/85, Puls: 72, Težina: 89kg, HbA1c: 7.2%', labResults: 'Šećer natašte: 7.1 mmol/L, HbA1c: 7.2%', nextAction: 'Kontrola za 3 meseca', notes: 'Poboljšanje u odnosu na prethodnu kontrolu (HbA1c bio 7.8)' },
  { id: '2', recordNo: 'KAR-2024-0002', patientName: 'Ana Stanković', patientNo: 'PAC-2024-002', doctor: 'Dr. Dragan Milić', date: '2024-06-14', type: 'follow_up', diagnosis: 'Pneumonija desne strane', diagnosisCode: 'J18.0', symptoms: 'Kašalj, temperatura 38.5°C, bol u grudima', treatment: 'Antibiotici Amoksicilin + Klavulanska kiselina 10 dana', prescribedMeds: ['Amoksicilin/Clav 875/125mg', 'Paracetamol 500mg', 'Deksametazon sirup'], vitalSigns: 'Temp: 38.5°C, Pritisak: 115/75, SatO2: 94%, Puls: 88', labResults: 'CRP: 45 mg/L, Leukociti: 14.2x10^9', nextAction: 'Kontrola za 7 dana', notes: 'Rtg pluća: infiltrati desni donji režanj' },
  { id: '3', recordNo: 'KAR-2024-0003', patientName: 'Nikola Milić', patientNo: 'PAC-2024-005', doctor: 'Dr. Snežana Đorđević', date: '2024-06-15', type: 'emergency', diagnosis: 'Hipertenzivna kriza', diagnosisCode: 'I10', symptoms: 'Jaka glavobolja, vrtoglavica, mučnina, pritisak 180/120', treatment: 'Hitno snižavanje pritiska, hospitalizacija', prescribedMeds: ['Nifedipin 10mg sublingvalno', 'Kaptopril 25mg', 'Furosemid 40mg IV'], vitalSigns: 'Pritisak: 180/120→145/95, Puls: 98, SatO2: 97%', labResults: 'Kreatinin: 112 μmol/L, Kalij: 4.1, EKG: sinus ritam, LVH', nextAction: 'Hospitalizacija — kardiologija', notes: 'Kritično stanje, hitno prebačen na odeljenje' },
  { id: '4', recordNo: 'KAR-2024-0004', patientName: 'Gordana Đorđević', patientNo: 'PAC-2024-008', doctor: 'Dr. Jelena Marković', date: '2024-06-13', type: 'lab_result', diagnosis: 'Hiperholesterolemija — kontrola', diagnosisCode: 'E78.5', symptoms: 'Asimptomatska, profilaksa', treatment: 'Kontinuirana terapija statinima', prescribedMeds: ['Atorvastatin 20mg', 'Omega-3'], vitalSigns: 'Pritisak: 125/80, BMI: 26.4', labResults: 'Total holesterol: 6.8→5.9 mmol/L, LDL: 4.2→3.6, HDL: 1.3, TG: 1.8', nextAction: 'Kontrola lipida za 6 nedelja', notes: 'Poboljšanje LDL za 14% nakon 3 meseca terapije' },
  { id: '5', recordNo: 'KAR-2024-0005', patientName: 'Sara Pavlović', patientNo: 'PAC-2024-010', doctor: 'Dr. Snežana Đorđević', date: '2024-06-11', type: 'checkup', diagnosis: 'Godišnji zdravstveni pregled', diagnosisCode: 'Z00.0', symptoms: 'Bez tegoba', treatment: 'Preventivni pregled — sve normalno', prescribedMeds: [], vitalSigns: 'Pritisak: 118/72, Puls: 68, Težina: 62kg, Visina: 170cm, BMI: 21.5', labResults: 'KBC: normalno, Šećer: 4.8, Holesterol: 4.2, TSH: 1.8', nextAction: 'Godišnji pregled za 12 meseci', notes: 'Savet: fizička aktivnost 150 min/tjedno' },
  { id: '6', recordNo: 'KAR-2024-0006', patientName: 'Mira Stojanović', patientNo: 'PAC-2024-006', doctor: 'Dr. Goran Savić', date: '2024-06-12', type: 'follow_up', diagnosis: 'Dijabetes tip 2 + Hipertenzija', diagnosisCode: 'E11, I10', symptoms: 'Umor, otežano disanje pri naporu', treatment: 'Podešavanje doze insulina i antihypertenziva', prescribedMeds: ['Metformin 850mg', 'Insulin Glargin 24U', 'Ramipril 10mg', 'Amlodipin 5mg', 'Atorvastatin 10mg'], vitalSigns: 'Pritisak: 155/95, Puls: 78, Težina: 78kg, HbA1c: 8.1%', labResults: 'Šećer: 9.2, HbA1c: 8.1, Kreatinin: 98', nextAction: 'Kontrola za 4 nedelje', notes: 'Povećan HbA1c — intenziviranje terapije' },
  { id: '7', recordNo: 'KAR-2024-0007', patientName: 'Stefan Ilić', patientNo: 'PAC-2024-007', doctor: 'Dr. Dragan Milić', date: '2024-06-08', type: 'discharge', diagnosis: 'Infectivna mononukleoza — otpust', diagnosisCode: 'B27.9', symptoms: 'Otpušten bez simptoma', treatment: 'Otpust kući — mirovanje 2 nedelje', prescribedMeds: ['Paracetamol po potrebi', 'Vitamin C 1000mg'], vitalSigns: 'Pritisak: 120/75, Puls: 65, Temp: 36.4°C', labResults: 'Leukociti: normalni, Mononukleoza test: negativan', nextAction: 'Kontrola za 2 nedelje', notes: 'Uspešno lečenje — 10 dana hospitalizacija' },
  { id: '8', recordNo: 'KAR-2024-0008', patientName: 'Marko Jovanović', patientNo: 'PAC-2024-003', doctor: 'Dr. Ana Nikolić', date: '2024-06-05', type: 'referral', diagnosis: 'Astma — kontrola alergolog', diagnosisCode: 'J45', symptoms: 'Suvi kašalj, otežano disanje noću', treatment: 'Uput za alergološka ispitivanja', prescribedMeds: ['Salbutamol inhaler', 'Budesonid/formoterol'], vitalSigns: 'FEV1: 78% predviđenog, PEF: varijabilnost 18%', labResults: 'Eozinofili: 8%, IgE: 450 IU/mL', nextAction: 'Skinski test alergolog — 25.06.', notes: 'Uput za kožne punkcione testove' },
]

const TYPES: Record<string, { color: string; label: string }> = {
  checkup: { color: 'bg-emerald-100 text-emerald-800', label: 'Pregled' },
  follow_up: { color: 'bg-blue-100 text-blue-800', label: 'Kontrola' },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Hitno' },
  lab_result: { color: 'bg-purple-100 text-purple-800', label: 'Lab. rezultat' },
  surgery: { color: 'bg-amber-100 text-amber-800', label: 'Operacija' },
  referral: { color: 'bg-teal-100 text-teal-800', label: 'Uput' },
  discharge: { color: 'bg-gray-100 text-gray-800', label: 'Otpust' },
}

function getTypeBadge(s: string) { const r = TYPES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

export function MedicalRecords() {
  const [data, setData] = useState<MedicalRecord[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MedicalRecord | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MedicalRecord>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.recordNo, item.patientName, item.doctor, item.diagnosis, item.diagnosisCode].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchType
  })

  const handleDelete = (id: string) => { if (!confirm('Obrisati zapis?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Zapis obrisan') }

  const openCreate = () => {
    setEditItem(null)
    setForm({ recordNo: `KAR-2024-${String(data.length + 1).padStart(4, '0')}`, patientName: '', patientNo: '', doctor: '', date: new Date().toISOString().split('T')[0], type: 'checkup', diagnosis: '', diagnosisCode: '', symptoms: '', treatment: '', prescribedMeds: [], vitalSigns: '', labResults: '', nextAction: '', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: MedicalRecord) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.patientName || !form.diagnosis) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as MedicalRecord : i)); toast.success('Zapis ažuriran') }
    else { setData(prev => [{ id: Date.now().toString(), ...form } as MedicalRecord, ...prev]); toast.success('Zapis kreiran') }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Medicinski kartoni</h1><p className="text-sm text-muted-foreground">Evidencija pregleda, dijagnoza i tretmana</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi zapis</Button>
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
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj zapis</Button>
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
          <DialogHeader><DialogTitle>Medicinski karton — {detailItem?.recordNo}</DialogTitle></DialogHeader>
          {detailItem && (
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
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val || '—'}</div></div>
                ))}
              </div>
              {detailItem.prescribedMeds.length > 0 && <div className="p-2 rounded-lg bg-blue-50"><div className="text-[10px] text-blue-600 mb-1">Propisani lekovi</div><div className="flex flex-wrap gap-1">{detailItem.prescribedMeds.map(m => <Badge key={m} className="text-[10px] bg-blue-100 text-blue-700">{m}</Badge>)}</div></div>}
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi zapis' : 'Novi zapis'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Pacijent *</Label><Input className="text-xs" value={form.patientName || ''} onChange={e => setForm({ ...form, patientName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={form.type || 'checkup'} onValueChange={v => setForm({ ...form, type: v as MedicalRecord['type'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checkup">Pregled</SelectItem><SelectItem value="follow_up">Kontrola</SelectItem><SelectItem value="emergency">Hitno</SelectItem><SelectItem value="lab_result">Lab.</SelectItem><SelectItem value="surgery">Operacija</SelectItem><SelectItem value="referral">Uput</SelectItem><SelectItem value="discharge">Otpust</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Dijagnoza *</Label><Input className="text-xs" value={form.diagnosis || ''} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Datum</Label><Input className="text-xs" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
