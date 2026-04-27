'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, UserCog, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

interface Employee {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; department: string | null; baseSalary: number; bankAccount: string | null
  isActive: boolean; hireDate: string; createdAt: string
}

interface Payroll {
  id: string; employeeId: string; month: number; year: number; baseSalary: number; bonuses: number; deductions: number; netSalary: number; status: string; payDate: string | null
  employee: { id: string; firstName: string; lastName: string }
}

interface Attendance {
  id: string; employeeId: string; date: string; hoursWorked: number; type: string; notes: string | null; createdAt: string
  employee: { id: string; firstName: string; lastName: string }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

export function Zaposleni() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zaposleni</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljanje kadrovima, platama i prisustvom</p>
      </div>
      <Tabs defaultValue="zaposleni" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zaposleni" className="gap-1.5"><Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">Zaposleni</span></TabsTrigger>
          <TabsTrigger value="plate">Plate</TabsTrigger>
          <TabsTrigger value="prisustvo">Prisustvo</TabsTrigger>
        </TabsList>
        <TabsContent value="zaposleni"><ZaposleniListTab /></TabsContent>
        <TabsContent value="plate"><PlateTab /></TabsContent>
        <TabsContent value="prisustvo"><PrisustvoTab /></TabsContent>
      </Tabs>
    </div>
  )
}

function ZaposleniListTab() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/employees?${params}`)
    setEmployees(await res.json())
    setLoading(false)
  }, [search])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zaposlenog?')) return
    try { await fetch(`/api/employees/${id}`, { method: 'DELETE' }); toast.success('Obrisano'); fetchEmployees() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), phone: fd.get('phone'), position: fd.get('position'), department: fd.get('department'), baseSalary: fd.get('baseSalary'), bankAccount: fd.get('bankAccount') }
    try {
      const url = editing ? `/api/employees/${editing.id}` : '/api/employees'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Ažurirano' : 'Kreirano'); setDialogOpen(false); setEditing(null); fetchEmployees()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-base font-semibold">Zaposleni</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{employees.length} zaposlenih</p></div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novi Zaposleni</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novi'} Zaposleni</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Ime *</Label><Input name="firstName" defaultValue={editing?.firstName || ''} required /></div>
                  <div className="space-y-2"><Label className="text-xs">Prezime *</Label><Input name="lastName" defaultValue={editing?.lastName || ''} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Pozicija</Label><Input name="position" defaultValue={editing?.position || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">Departman</Label>
                    <Select name="department" defaultValue={editing?.department || ''}><SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger><SelectContent>
                      <SelectItem value="IT">IT</SelectItem><SelectItem value="Prodaja">Prodaja</SelectItem><SelectItem value="Magacin">Magacin</SelectItem><SelectItem value="Finansije">Finansije</SelectItem><SelectItem value="Menadžment">Menadžment</SelectItem><SelectItem value="Administracija">Administracija</SelectItem>
                    </SelectContent></Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Email</Label><Input name="email" type="email" defaultValue={editing?.email || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">Telefon</Label><Input name="phone" defaultValue={editing?.phone || ''} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Osnovna plata (RSD)</Label><Input name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">Račun banke</Label><Input name="bankAccount" defaultValue={editing?.bankAccount || ''} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-sm mt-4"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Ime</TableHead><TableHead className="text-xs">Pozicija</TableHead><TableHead className="text-xs">Departman</TableHead><TableHead className="text-xs text-right">Plata</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs w-[80px]">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="text-xs font-medium">{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell className="text-xs">{emp.position || '-'}</TableCell>
                  <TableCell className="text-xs">{emp.department || '-'}</TableCell>
                  <TableCell className="text-xs text-right">{formatRSD(emp.baseSalary)}</TableCell>
                  <TableCell><Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-[10px]">{emp.isActive ? 'Aktivan' : 'Neaktivan'}</Badge></TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(emp); setDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(emp.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlateTab() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/payroll').then(r => r.json()).then(setPayrolls).finally(() => setLoading(false)) }, [])

  const totalBase = payrolls.reduce((s, p) => s + p.baseSalary, 0)
  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          <div className="rounded-lg bg-muted px-4 py-2"><p className="text-xs text-muted-foreground">Bruto</p><p className="text-sm font-bold">{formatRSD(totalBase)}</p></div>
          <div className="rounded-lg bg-emerald-50 px-4 py-2"><p className="text-xs text-emerald-600">Neto</p><p className="text-sm font-bold text-emerald-700">{formatRSD(totalNet)}</p></div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[300px] w-full" /> : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Mesec</TableHead><TableHead className="text-xs text-right">Osnovna</TableHead><TableHead className="text-xs text-right">Bonusi</TableHead><TableHead className="text-xs text-right">Odbitci</TableHead><TableHead className="text-xs text-right">Neto</TableHead><TableHead className="text-xs">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {payrolls.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium">{p.employee.firstName} {p.employee.lastName}</TableCell>
                  <TableCell className="text-xs">{MONTHS[p.month - 1]} {p.year}</TableCell>
                  <TableCell className="text-xs text-right">{formatRSD(p.baseSalary)}</TableCell>
                  <TableCell className="text-xs text-right text-emerald-600">+{formatRSD(p.bonuses)}</TableCell>
                  <TableCell className="text-xs text-right text-red-600">-{formatRSD(p.deductions)}</TableCell>
                  <TableCell className="text-xs text-right font-bold">{formatRSD(p.netSalary)}</TableCell>
                  <TableCell><Badge variant={p.status === 'isplaceno' ? 'default' : 'secondary'} className="text-[10px]">{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PrisustvoTab() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/attendances').then(r => r.json()).then(setAttendances).finally(() => setLoading(false)) }, [])

  const typeColors: Record<string, string> = { rad: 'text-emerald-600', bolovanje: 'text-red-600', godisnji: 'text-blue-600', sluzbeni_put: 'text-purple-600', odsustvo: 'text-amber-600' }
  const typeLabels: Record<string, string> = { rad: 'Rad', bolovanje: 'Bolovanje', godisnji: 'Godišnji', sluzbeni_put: 'Službeni put', odsustvo: 'Odsustvo' }

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Evidencija prisustva</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[300px] w-full" /> : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Datum</TableHead><TableHead className="text-xs text-center">Sati</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Napomene</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-medium">{a.employee.firstName} {a.employee.lastName}</TableCell>
                  <TableCell className="text-xs">{formatDate(a.date)}</TableCell>
                  <TableCell className="text-xs text-center">{a.hoursWorked}h</TableCell>
                  <TableCell className="text-xs"><span className={typeColors[a.type] || ''}>{typeLabels[a.type] || a.type}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
