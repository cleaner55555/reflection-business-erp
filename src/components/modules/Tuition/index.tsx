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
import { Plus, Search, Trash2, Pencil, Eye, Wallet, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

type Tuition = {
  id: string
  student: string
  indexNo: string
  program: string
  year: number
  semester: number
  amount: number
  paidAmount: number
  status: 'paid' | 'partial' | 'unpaid' | 'overdue' | 'scholarship' | 'exempt'
  dueDate: string
  paidDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'scholarship' | 'exempt'
  receiptNo: string
  installments: number
  currentInstallment: number
  discount: number
  notes: string
}

const INITIAL: Tuition[] = [
  { id: '1', student: 'Luka Petrović', indexNo: '2023/001', program: 'Elektrotehnika', year: 2, semester: 4, amount: 85000, paidAmount: 85000, status: 'paid', dueDate: '2024-03-15', paidDate: '2024-03-10', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0456', installments: 1, currentInstallment: 1, discount: 0, notes: '' },
  { id: '2', student: 'Ana Stanković', indexNo: '2022/015', program: 'Ekonomija', year: 3, semester: 5, amount: 92000, paidAmount: 46000, status: 'partial', dueDate: '2024-04-01', paidDate: '2024-03-28', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0512', installments: 2, currentInstallment: 1, discount: 0, notes: 'Druga rata do 01.07.' },
  { id: '3', student: 'Marko Jovanović', indexNo: '2023/023', program: 'Mašinstvo', year: 1, semester: 2, amount: 78000, paidAmount: 0, status: 'unpaid', dueDate: '2024-06-15', paidDate: '', paymentMethod: 'cash', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' },
  { id: '4', student: 'Jelena Nikolić', indexNo: '2021/008', program: 'Medicina', year: 4, semester: 7, amount: 180000, paidAmount: 180000, status: 'scholarship', dueDate: '2024-03-01', paidDate: '2024-02-25', paymentMethod: 'scholarship', receiptNo: 'RAC-2024-0398', installments: 1, currentInstallment: 1, discount: 100, notes: 'Republička stipendija za studente genijalce' },
  { id: '5', student: 'Nikola Milić', indexNo: '2022/031', program: 'Informatika', year: 3, semester: 5, amount: 95000, paidAmount: 0, status: 'overdue', dueDate: '2024-04-15', paidDate: '', paymentMethod: 'card', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: 'Podsetnik poslat 20.05. — kontaktirana studentska služba' },
  { id: '6', student: 'Sara Đorđević', indexNo: '2024/002', program: 'Arhitektura', year: 1, semester: 1, amount: 105000, paidAmount: 94500, status: 'paid', dueDate: '2024-09-15', paidDate: '2024-09-01', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0890', installments: 1, currentInstallment: 1, discount: 10, notes: '10% popust za rano upisivanje' },
  { id: '7', student: 'Ivan Savić', indexNo: '2021/042', program: 'Pravo', year: 4, semester: 8, amount: 88000, paidAmount: 0, status: 'exempt', dueDate: '', paidDate: '', paymentMethod: 'exempt', receiptNo: '', installments: 0, currentInstallment: 0, discount: 100, notes: 'Ostvario pravo na besplatne studije — prosečna ocena 9.85' },
  { id: '8', student: 'Maja Stojanović', indexNo: '2023/056', program: 'Psihologija', year: 2, semester: 3, amount: 82000, paidAmount: 27333, status: 'partial', dueDate: '2024-05-01', paidDate: '2024-05-01', paymentMethod: 'card', receiptNo: 'RAC-2024-0634', installments: 3, currentInstallment: 1, discount: 0, notes: 'Rata 2/3 do 01.08., rata 3/3 do 01.11.' },
  { id: '9', student: 'Stefan Ilić', indexNo: '2022/019', program: 'Građevinarstvo', year: 2, semester: 4, amount: 80000, paidAmount: 80000, status: 'paid', dueDate: '2024-03-20', paidDate: '2024-03-18', paymentMethod: 'cash', receiptNo: 'RAC-2024-0478', installments: 1, currentInstallment: 1, discount: 0, notes: '' },
  { id: '10', student: 'Milica Marković', indexNo: '2024/011', program: 'Farmacija', year: 1, semester: 2, amount: 130000, paidAmount: 0, status: 'unpaid', dueDate: '2024-06-20', paidDate: '', paymentMethod: 'bank_transfer', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  paid: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćena' },
  partial: { color: 'bg-amber-100 text-amber-800', label: 'Delimično' },
  unpaid: { color: 'bg-gray-100 text-gray-800', label: 'Neplaćena' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  scholarship: { color: 'bg-purple-100 text-purple-800', label: 'Stipendija' },
  exempt: { color: 'bg-teal-100 text-teal-800', label: 'Otpust' },
}

function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}

function formatRSD(p: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p) }

export function Skolarina() {
  const [data, setData] = useState<Tuition[]>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Tuition | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tuition>>({})
  const [activeTab, setActiveTab] = useState('pregled')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const programs = [...new Set(data.map(i => i.program))]

  const filtered = data.filter(item => {
    const matchSearch = !search || [item.student, item.indexNo, item.program].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchProgram = !programFilter || item.program === programFilter
    return matchSearch && matchStatus && matchProgram
  })

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati zapis o školarini?')) return
    setData(prev => prev.filter(i => i.id !== id))
    toast.success('Zapis obrisan')
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ student: '', indexNo: '', program: '', year: 1, semester: 1, amount: 85000, paidAmount: 0, status: 'unpaid', dueDate: '', paidDate: '', paymentMethod: 'cash', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Tuition) => {
    setEditItem(item)
    setForm({ ...item })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.student || !form.program) { toast.error('Popunite obavezna polja'); return }
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } as Tuition : i))
      toast.success('Zapis ažuriran')
    } else {
      const newItem: Tuition = { id: Date.now().toString(), ...form } as Tuition
      setData(prev => [newItem, ...prev])
      toast.success('Zapis kreiran')
    }
    setDialogOpen(false)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const totalAmount = data.reduce((s, i) => s + i.amount, 0)
  const totalPaid = data.reduce((s, i) => s + i.paidAmount, 0)
  const overdueCount = data.filter(i => i.status === 'overdue').length
  const paidCount = data.filter(i => i.status === 'paid' || i.status === 'scholarship' || i.status === 'exempt').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Školarina</h1><p className="text-sm text-muted-foreground">Upravljanje školarinom, uplatama i stipendijama</p></div>
        <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novi zapis</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wallet className="h-3 w-3" />Ukupno</div><p className="text-xl font-bold">{formatRSD(totalAmount)}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Uplaćeno</div><p className="text-xl font-bold text-emerald-700">{formatRSD(totalPaid)}</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Kasni</div><p className="text-2xl font-bold text-red-700">{overdueCount}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Regulisanih</div><p className="text-2xl font-bold text-blue-700">{paidCount}/{data.length}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj">Dodaj</TabsTrigger><TabsTrigger value="uredi">Uredi</TabsTrigger></TabsList>

        <TabsContent value="pregled" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Lista uplata</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="paid">Plaćena</SelectItem><SelectItem value="partial">Delimično</SelectItem><SelectItem value="unpaid">Neplaćena</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="scholarship">Stipendija</SelectItem></SelectContent></Select>
                  <Select value={programFilter || 'all'} onValueChange={v => setProgramFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi programi</SelectItem>{programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Student</TableHead><TableHead className="text-xs hidden sm:table-cell">Br. indeksa</TableHead><TableHead className="text-xs hidden md:table-cell">Program</TableHead><TableHead className="text-xs hidden md:table-cell">Iznos</TableHead><TableHead className="text-xs hidden lg:table-cell">Uplaćeno</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.student}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{item.indexNo}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{item.program}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{formatRSD(item.amount)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatRSD(item.paidAmount)}{item.discount > 0 && <span className="ml-1 text-emerald-600">(-{item.discount}%)</span>}</TableCell>
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
          <Card>
            <CardHeader><CardTitle className="text-base">Novi zapis školarine</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Student *</Label><Input className="text-xs" value={form.student || ''} onChange={e => setForm({ ...form, student: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Broj indeksa</Label><Input className="text-xs" value={form.indexNo || ''} onChange={e => setForm({ ...form, indexNo: e.target.value })} placeholder="2024/XXX" /></div>
                  <div className="grid gap-2"><Label className="text-xs">Program *</Label><Input className="text-xs" value={form.program || ''} onChange={e => setForm({ ...form, program: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Godina/Semestar</Label><div className="flex gap-2"><Input className="text-xs" type="number" value={form.year || ''} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /><Input className="text-xs" type="number" value={form.semester || ''} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} /></div></div>
                  <div className="grid gap-2"><Label className="text-xs">Iznos školarine (RSD)</Label><Input className="text-xs" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Popust (%)</Label><Input className="text-xs" type="number" value={form.discount || '0'} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Rok uplate</Label><Input className="text-xs" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Rate</Label><Input className="text-xs" type="number" value={form.installments || '1'} onChange={e => setForm({ ...form, installments: Number(e.target.value) })} /></div>
                </div>
                <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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
                      <div className="flex items-center gap-2"><span className="text-xs font-medium">{item.student}</span><span className="text-xs text-muted-foreground font-mono">{item.indexNo}</span>{getStatusBadge(item.status)}</div>
                      <p className="text-xs text-muted-foreground truncate">{item.program} — {formatRSD(item.amount)} — Uplaćeno: {formatRSD(item.paidAmount)}</p>
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
          <DialogHeader><DialogTitle>Detalji školarine</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Student', detailItem.student],
                  ['Broj indeksa', detailItem.indexNo],
                  ['Program', detailItem.program],
                  ['Godina/Semestar', `${detailItem.year}/${detailItem.semester}`],
                  ['Iznos', formatRSD(detailItem.amount)],
                  ['Uplaćeno', formatRSD(detailItem.paidAmount)],
                  ['Preostalo', formatRSD(detailItem.amount - detailItem.paidAmount)],
                  ['Popust', `${detailItem.discount}%`],
                  ['Rok', formatDate(detailItem.dueDate)],
                  ['Datum uplate', detailItem.paidDate ? formatDate(detailItem.paidDate) : '—'],
                  ['Broj računa', detailItem.receiptNo || '—'],
                  ['Rate', `${detailItem.currentInstallment}/${detailItem.installments}`],
                ].map(([label, val]) => (
                  <div key={label} className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground">{label}</div><div className="text-xs font-medium">{val}</div></div>
                ))}
              </div>
              <div className="p-2 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Status</div>{getStatusBadge(detailItem.status)}</div>
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
              <div className="grid gap-2"><Label className="text-xs">Student *</Label><Input className="text-xs" value={form.student || ''} onChange={e => setForm({ ...form, student: e.target.value })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'unpaid'} onValueChange={v => setForm({ ...form, status: v as Tuition['status'] })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Plaćena</SelectItem><SelectItem value="partial">Delimično</SelectItem><SelectItem value="unpaid">Neplaćena</SelectItem><SelectItem value="overdue">Kasni</SelectItem><SelectItem value="scholarship">Stipendija</SelectItem><SelectItem value="exempt">Otpust</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-xs">Iznos</Label><Input className="text-xs" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label className="text-xs">Uplaćeno</Label><Input className="text-xs" type="number" value={form.paidAmount || ''} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button size="sm" onClick={handleSave}>Sačuvaj</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
