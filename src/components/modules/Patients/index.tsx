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
import { Plus, Search, Trash2, Pencil, Eye, Users, Heart, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Patient = {
  id: string
  patientNo: string
  firstName: string
  lastName: string
  jmbg: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female'
  phone: string
  email: string
  address: string
  city: string
  bloodType: string
  insuranceNo: string
  insuranceStatus: 'active' | 'expired' | 'pending'
  primaryDoctor: string
  status: 'active' | 'discharged' | 'in_treatment' | 'critical'
  allergies: string[]
  chronicConditions: string[]
  lastVisit: string
  nextAppointment: string
  totalVisits: number
  notes: string
}

const INITIAL: Patient[] = [
  { id: '1', patientNo: 'PAC-2024-001', firstName: 'Luka', lastName: 'Petrović', jmbg: '1505998712345', dateOfBirth: '1987-05-15', age: 37, gender: 'male', phone: '+381 63 123 4567', email: 'luka.p@email.com', address: 'Bulevar Mihajla Pupina 45', city: 'Beograd', bloodType: 'A+', insuranceNo: 'ZS-2024-45678', insuranceStatus: 'active', primaryDoctor: 'Dr. Jelena Marković', status: 'active', allergies: ['Penicilin'], chronicConditions: ['Dijabetes tip 2'], lastVisit: '2024-06-10', nextAppointment: '2024-06-24', totalVisits: 15, notes: 'Kontrola šećera svakih 3 meseca' },
  { id: '2', patientNo: 'PAC-2024-002', firstName: 'Ana', lastName: 'Stanković', jmbg: '2308996789012', dateOfBirth: '1996-08-23', age: 27, gender: 'female', phone: '+381 64 987 6543', email: 'ana.s@email.com', address: 'Kralja Milana 88/5', city: 'Niš', bloodType: 'O-', insuranceNo: 'ZS-2024-56789', insuranceStatus: 'active', primaryDoctor: 'Dr. Dragan Milić', status: 'in_treatment', allergies: [], chronicConditions: [], lastVisit: '2024-06-14', nextAppointment: '2024-06-18', totalVisits: 3, notes: 'Pneumonija — antibiotici 10 dana' },
  { id: '3', patientNo: 'PAC-2024-003', firstName: 'Marko', lastName: 'Jovanović', jmbg: '1203995123456', dateOfBirth: '1995-03-12', age: 29, gender: 'male', phone: '+381 65 555 1234', email: 'marko.j@email.com', address: 'Strahinjića Bana 12', city: 'Novi Sad', bloodType: 'B+', insuranceNo: 'ZS-2024-67890', insuranceStatus: 'expired', primaryDoctor: 'Dr. Ana Nikolić', status: 'active', allergies: ['Aspirin', 'Ibuprofen'], chronicConditions: ['Astma'], lastVisit: '2024-05-28', nextAppointment: '2024-06-25', totalVisits: 8, notes: 'Obnova zdravstvenog osiguranja hitna' },
  { id: '4', patientNo: 'PAC-2024-004', firstName: 'Jelena', lastName: 'Nikolić', jmbg: '0712000890123', dateOfBirth: '2000-12-07', age: 23, gender: 'female', phone: '+381 62 444 8899', email: 'jelena.n@email.com', address: 'Vojvode Stepe 203', city: 'Beograd', bloodType: 'AB+', insuranceNo: 'ZS-2024-78901', insuranceStatus: 'active', primaryDoctor: 'Dr. Jelena Marković', status: 'active', allergies: [], chronicConditions: [], lastVisit: '2024-06-01', nextAppointment: '', totalVisits: 2, notes: '' },
  { id: '5', patientNo: 'PAC-2024-005', firstName: 'Nikola', lastName: 'Milić', jmbg: '2511998567890', dateOfBirth: '1998-11-25', age: 25, gender: 'male', phone: '+381 61 777 3344', email: 'nikola.m@email.com', address: 'Kneginje Ljubice 9', city: 'Kragujevac', bloodType: 'O+', insuranceNo: 'ZS-2024-89012', insuranceStatus: 'pending', primaryDoctor: 'Dr. Snežana Đorđević', status: 'critical', allergies: [], chronicConditions: ['Hipertenzija'], lastVisit: '2024-06-15', nextAppointment: '2024-06-16', totalVisits: 22, notes: 'Hitno — Pritisak 180/120, hospitalizacija' },
  { id: '6', patientNo: 'PAC-2024-006', firstName: 'Mira', lastName: 'Stojanović', jmbg: '0311500456789', dateOfBirth: '1950-11-03', age: 73, gender: 'female', phone: '+381 63 111 4455', email: '', address: 'Dimitrija Tucovića 55', city: 'Subotica', bloodType: 'A-', insuranceNo: 'ZS-2024-90123', insuranceStatus: 'active', primaryDoctor: 'Dr. Goran Savić', status: 'active', allergies: ['Sulfonamidi'], chronicConditions: ['Dijabetes tip 2', 'Hipertenzija', 'Artroza'], lastVisit: '2024-06-12', nextAppointment: '2024-06-26', totalVisits: 45, notes: 'Redovna kontrola hroničnih bolesti' },
  { id: '7', patientNo: 'PAC-2024-007', firstName: 'Stefan', lastName: 'Ilić', jmbg: '1804997456789', dateOfBirth: '1997-04-18', age: 27, gender: 'male', phone: '+381 60 222 7766', email: 'stefan.i@email.com', address: 'Njegoševa 34', city: 'Beograd', bloodType: 'B-', insuranceNo: 'ZS-2024-01234', insuranceStatus: 'active', primaryDoctor: 'Dr. Dragan Milić', status: 'discharged', allergies: [], chronicConditions: [], lastVisit: '2024-06-08', nextAppointment: '', totalVisits: 1, notes: 'Uspiješno lečenje mononukleoze — otpušten' },
  { id: '8', patientNo: 'PAC-2024-008', firstName: 'Gordana', lastName: 'Đorđević', jmbg: '2108690789012', dateOfBirth: '1969-08-21', age: 54, gender: 'female', phone: '+381 66 888 1122', email: 'gordana.dj@email.com', address: 'Bulevar Despota Stefana 156', city: 'Beograd', bloodType: 'O+', insuranceNo: 'ZS-2024-23456', insuranceStatus: 'active', primaryDoctor: 'Dr. Jelena Marković', status: 'in_treatment', allergies: [], chronicConditions: ['Holesterolemija'], lastVisit: '2024-06-13', nextAppointment: '2024-06-20', totalVisits: 30, notes: 'Statini — kontrola holesterola za 6 nedelja' },
  { id: '9', patientNo: 'PAC-2024-009', firstName: 'Milan', lastName: 'Marković', jmbg: '0902456901234', dateOfBirth: '1945-02-09', age: 79, gender: 'male', phone: '+381 63 333 6688', email: '', address: 'Ruzveltova 78', city: 'Zrenjanin', bloodType: 'AB-', insuranceNo: 'ZS-2024-34567', insuranceStatus: 'active', primaryDoctor: 'Dr. Ana Nikolić', status: 'active', allergies: ['Latex'], chronicConditions: ['KOPB', 'Hipertenzija', 'Dijabetes tip 2'], lastVisit: '2024-06-05', nextAppointment: '2024-06-19', totalVisits: 62, notes: 'Redovna terapija inhalatorima + insulinska pumpa' },
  { id: '10', patientNo: 'PAC-2024-010', firstName: 'Sara', lastName: 'Pavlović', jmbg: '1507997123456', dateOfBirth: '1997-07-15', age: 26, gender: 'female', phone: '+381 62 555 7799', email: 'sara.p@email.com', address: 'Takovska 28', city: 'Beograd', bloodType: 'A+', insuranceNo: 'ZS-2024-45670', insuranceStatus: 'active', primaryDoctor: 'Dr. Snežana Đorđević', status: 'active', allergies: [], chronicConditions: [], lastVisit: '2024-06-11', nextAppointment: '2024-08-11', totalVisits: 1, notes: 'Godišnji pregled' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  discharged: { color: 'bg-gray-100 text-gray-800', label: 'Otpušten' },
  in_treatment: { color: 'bg-blue-100 text-blue-800', label: 'Na lečenju' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Kritičan' },
}

const INSURANCE: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivno' },
  expired: { color: 'bg-red-100 text-red-800', label: 'Isteklo' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function getInsuranceBadge(s: string) { const r = INSURANCE[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function Patients() {
  const [data, setData] = useState<Patient[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Patient | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Patient>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.patientNo, `${item.firstName} ${item.lastName}`, item.jmbg, item.city, item.primaryDoctor].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati pacijenta?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Pacijent obrisan')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ patientNo: `PAC-2024-${String(data.length + 1).padStart(3, '0')}`, firstName: '', lastName: '', jmbg: '', dateOfBirth: '', age: 0, gender: 'male', phone: '', email: '', address: '', city: '', bloodType: '', insuranceNo: '', insuranceStatus: 'pending', primaryDoctor: '', status: 'active', allergies: [], chronicConditions: [], lastVisit: '', nextAppointment: '', totalVisits: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Patient) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.firstName || !form.lastName) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Patient : i))
      toast.success('Pacijent ažuriran')
    } else {
      const newItem: Patient = { id: Date.now().toString(), ...form } as Patient
      setData(prev => [newItem, ...prev])
      toast.success('Pacijent kreiran')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const activeCount = data.filter(i => i.status === 'active').length
  const treatmentCount = data.filter(i => i.status === 'in_treatment').length
  const criticalCount = data.filter(i => i.status === 'critical').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Pacijenti</h1><p className="text-sm text-muted-foreground">Registar pacijenata i praćenje zdravstvenog stanja</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi pacijent</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivnih</div><p className="text-2xl font-bold text-emerald-700">{activeCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Na lečenju</div><p className="text-2xl font-bold text-blue-700">{treatmentCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kritičnih</div><p className="text-2xl font-bold text-red-700">{criticalCount}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Registar pacijenata</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="active">Aktivan</SelectItem><SelectItem value="in_treatment">Na lečenju</SelectItem><SelectItem value="critical">Kritičan</SelectItem><SelectItem value="discharged">Otpušten</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Ime</TableHead><TableHead className="text-xs hidden sm:table-cell">JMBG</TableHead><TableHead className="text-xs hidden md:table-cell">God</TableHead><TableHead className="text-xs hidden md:table-cell">Kr. grupa</TableHead><TableHead className="text-xs hidden lg:table-cell">Lekar</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden lg:table-cell">Osigranje</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema pacijenata</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.firstName} {item.lastName}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.jmbg}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.age}</TableCell>
                        <TableCell className="text-xs font-semibold hidden md:table-cell">{item.bloodType}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.primaryDoctor}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{getInsuranceBadge(item.insuranceStatus)}</TableCell>
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
            <CardHeader><CardTitle className="text-base">Novi pacijent</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Prezime *</Label><Input className="text-xs" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">JMBG</Label><Input className="text-xs" value={form.jmbg || ''} onChange={e => setForm({ ...form, jmbg: e.target.value })} maxLength={13} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Datum rođenja</Label><Input className="text-xs" type="date" value={form.dateOfBirth || ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Pol</Label><Select value={form.gender || 'male'} onValueChange={v => setForm({ ...form, gender: v as Patient['gender'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Muški</SelectItem><SelectItem value="female">Ženski</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Krvna grupa</Label><Select value={form.bloodType || ''} onValueChange={v => setForm({ ...form, bloodType: v })}><SelectTrigger className="text-xs"><SelectValue placeholder="Izaberi" /></SelectTrigger><SelectContent>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label className="text-xs">Telefon</Label><Input className="text-xs" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Email</Label><Input className="text-xs" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Grad</Label><Input className="text-xs" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Adresa</Label><Input className="text-xs" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Lekar opšte prakse</Label><Input className="text-xs" value={form.primaryDoctor || ''} onChange={e => setForm({ ...form, primaryDoctor: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Br. osiguranja</Label><Input className="text-xs" value={form.insuranceNo || ''} onChange={e => setForm({ ...form, insuranceNo: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Alergije (zarez)</Label><Input className="text-xs" value={(form.allergies || []).join(', ')} onChange={e => setForm({ ...form, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Penicilin, Aspirin..." /></div>
                <div className="grid gap-2"><Label className="text-xs">Hronične bolesti (zarez)</Label><Input className="text-xs" value={(form.chronicConditions || []).join(', ')} onChange={e => setForm({ ...form, chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button size="sm" className="w-fit gap-2" onClick={handleSave}><Plus className="h-4 w-4" />Kreiraj pacijenta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uredi" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Uredi pacijente</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {data.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.firstName} {item.lastName}</span><span className="text-xs text-muted-foreground">{item.patientNo}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.city} — {item.primaryDoctor} — Poslednji: {item.lastVisit ? formatDate(item.lastVisit) : '—'}</p>
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
          <DialogHeader><DialogTitle>Karton pacijenta</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{detailItem.firstName} {detailItem.lastName}</h3>{getStatusBadge(detailItem.status)}{getInsuranceBadge(detailItem.insuranceStatus)}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Broj pacijenta', detailItem.patientNo],
                  ['JMBG', detailItem.jmbg],
                  ['Datum rođenja', formatDate(detailItem.dateOfBirth)],
                  ['Starost', `${detailItem.age} god.`],
                  ['Pol', detailItem.gender === 'male' ? 'Muški' : 'Ženski'],
                  ['Krvna grupa', detailItem.bloodType],
                  ['Grad', detailItem.city],
                  ['Adresa', detailItem.address],
                  ['Telefon', detailItem.phone],
                  ['Email', detailItem.email || '—'],
                  ['Lekar', detailItem.primaryDoctor],
                  ['Br. osiguranja', detailItem.insuranceNo],
                  ['Poslednja poseta', detailItem.lastVisit ? formatDate(detailItem.lastVisit) : '—'],
                  ['Sledeći termin', detailItem.nextAppointment ? formatDate(detailItem.nextAppointment) : '—'],
                  ['Ukupno poseta', String(detailItem.totalVisits)],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              {detailItem.allergies.length > 0 && <div className="p-2 rounded-lg bg-red-50"><div className="text-xs text-red-600 mb-1">⚠ Alergije</div><div className="flex flex-wrap gap-1">{detailItem.allergies.map(a => <Badge key={a} className="text-xs bg-red-100 text-red-700">{a}</Badge>)}</div></div>}
              {detailItem.chronicConditions.length > 0 && <div className="p-2 rounded-lg bg-amber-50"><div className="text-xs text-amber-600 mb-1">Hronične bolesti</div><div className="flex flex-wrap gap-1">{detailItem.chronicConditions.map(c => <Badge key={c} className="text-xs bg-amber-100 text-amber-700">{c}</Badge>)}</div></div>}
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground mb-1">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi pacijenta' : 'Novi pacijent'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label className="text-xs">Ime *</Label><Input className="text-xs" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Prezime *</Label><Input className="text-xs" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v as Patient['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="in_treatment">Na lečenju</SelectItem><SelectItem value="critical">Kritičan</SelectItem><SelectItem value="discharged">Otpušten</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Osigranje</Label><Select value={form.insuranceStatus || 'pending'} onValueChange={v => setForm({ ...form, insuranceStatus: v as Patient['insuranceStatus'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivno</SelectItem><SelectItem value="expired">Isteklo</SelectItem><SelectItem value="pending">Na čekanju</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
