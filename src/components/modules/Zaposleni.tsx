'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, UserCog, Users, ArrowLeft, Printer } from 'lucide-react'
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

interface EmployeeOption {
  id: string; firstName: string; lastName: string; baseSalary: number
}

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

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
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
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

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (emp: Employee) => {
    setEditing(emp)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

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
      toast.success(editing ? 'Ažurirano' : 'Kreirano'); setViewMode('list'); setEditing(null); fetchEmployees()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? 'Izmeni' : 'Novi'} Zaposleni</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">Zaposleni</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{employees.length} zaposlenih</p></div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Novi Zaposleni</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="relative max-w-sm mt-4"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
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
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(emp)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(emp.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
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
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Payroll | null>(null)

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/payroll')
    setPayrolls(await res.json())
    setLoading(false)
  }, [])

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data.map((e: Employee) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, baseSalary: e.baseSalary })))
  }, [])

  useEffect(() => { fetchPayrolls(); fetchEmployees() }, [fetchPayrolls, fetchEmployees])

  const totalBase = payrolls.reduce((s, p) => s + p.baseSalary, 0)
  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0)

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (p: Payroll) => {
    setEditing(p)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovu isplatu?')) return
    try {
      await fetch(`/api/payroll/${id}`, { method: 'DELETE' })
      toast.success('Obrisano')
      fetchPayrolls()
    } catch { toast.error('Greška') }
  }

  const handlePrint = (p: Payroll) => {
    const printContent = `
      <html><head><title>Isplata - ${p.employee.firstName} ${p.employee.lastName}</title>
      <style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px}h1{color:#333;font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 12px;border:1px solid #ddd;text-align:left;font-size:14px}th{background:#f5f5f5;font-weight:600}.net{font-weight:bold;font-size:16px;color:#059669}.footer{margin-top:24px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:12px}</style></head>
      <body>
        <h1>Obračun plate</h1>
        <table>
          <tr><th>Zaposleni</th><td>${p.employee.firstName} ${p.employee.lastName}</td></tr>
          <tr><th>Mesec</th><td>${MONTHS[p.month - 1]} ${p.year}</td></tr>
          <tr><th>Osnovna plata</th><td>${formatRSD(p.baseSalary)}</td></tr>
          <tr><th>Bonusi</th><td>${formatRSD(p.bonuses)}</td></tr>
          <tr><th>Odbitci</th><td>${formatRSD(p.deductions)}</td></tr>
          <tr><th>Neto plata</th><td class="net">${formatRSD(p.netSalary)}</td></tr>
          <tr><th>Status</th><td>${p.status}</td></tr>
          ${p.payDate ? `<tr><th>Datum isplate</th><td>${new Date(p.payDate).toLocaleDateString('sr-Latn')}</td></tr>` : ''}
        </table>
        <div class="footer">Generisano: ${new Date().toLocaleString('sr-Latn')}</div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const employeeId = fd.get('employeeId') as string
    const month = Number(fd.get('month'))
    const year = Number(fd.get('year'))
    const baseSalary = Number(fd.get('baseSalary')) || 0
    const bonuses = Number(fd.get('bonuses')) || 0
    const deductions = Number(fd.get('deductions')) || 0
    const netSalary = baseSalary + bonuses - deductions
    const status = fd.get('status') as string

    if (!employeeId || !month || !year) {
      toast.error('Zaposleni, mesec i godina su obavezni')
      setSubmitting(false)
      return
    }

    const body = { employeeId, month, year, baseSalary, bonuses, deductions, netSalary, status }

    try {
      const url = editing ? `/api/payroll/${editing.id}` : '/api/payroll'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Isplata ažurirana' : 'Isplata kreirana')
      setViewMode('list')
      setEditing(null)
      fetchPayrolls()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    if (emp) {
      const baseInput = document.getElementById('payroll-baseSalary') as HTMLInputElement
      const bonusInput = document.getElementById('payroll-bonuses') as HTMLInputElement
      const dedInput = document.getElementById('payroll-deductions') as HTMLInputElement
      const netDisplay = document.getElementById('payroll-netSalary-display')
      if (baseInput) {
        baseInput.value = String(emp.baseSalary)
        recalcNet(baseInput, bonusInput, dedInput, netDisplay)
      }
    }
  }

  const recalcNet = (base?: HTMLInputElement | null, bonus?: HTMLInputElement | null, ded?: HTMLInputElement | null, display?: HTMLElement | null) => {
    const b = base || document.getElementById('payroll-baseSalary') as HTMLInputElement
    const bon = bonus || document.getElementById('payroll-bonuses') as HTMLInputElement
    const d = ded || document.getElementById('payroll-deductions') as HTMLInputElement
    const n = display || document.getElementById('payroll-netSalary-display')
    if (b && bon && d && n) {
      const net = (Number(b.value) || 0) + (Number(bon.value) || 0) - (Number(d.value) || 0)
      n.textContent = formatRSD(net)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? 'Izmeni' : 'Nova'} Isplatu</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Plate</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{payrolls.length} zapisa</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Nova Isplata</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="flex gap-4 mt-4">
            <div className="rounded-lg bg-muted px-4 py-2"><p className="text-xs text-muted-foreground">Bruto</p><p className="text-sm font-bold">{formatRSD(totalBase)}</p></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-2"><p className="text-xs text-emerald-600">Neto</p><p className="text-sm font-bold text-emerald-700">{formatRSD(totalNet)}</p></div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zaposleni *</Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger><SelectValue placeholder="Izaberite zaposlenog" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select name="status" defaultValue={editing?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">Nacrt</SelectItem>
                    <SelectItem value="odobreno">Odobreno</SelectItem>
                    <SelectItem value="isplaceno">Isplaćeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Mesec *</Label>
                <Select name="month" defaultValue={editing ? String(editing.month) : ''}>
                  <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Godina *</Label>
                <Input name="year" type="number" min="2020" max="2030" defaultValue={editing?.year || new Date().getFullYear()} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Osnovna plata</Label>
                <Input id="payroll-baseSalary" name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} onChange={() => recalcNet()} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bonusi</Label>
                <Input id="payroll-bonuses" name="bonuses" type="number" step="0.01" defaultValue={editing?.bonuses || 0} onChange={() => recalcNet()} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Odbitci</Label>
                <Input id="payroll-deductions" name="deductions" type="number" step="0.01" defaultValue={editing?.deductions || 0} onChange={() => recalcNet()} />
              </div>
            </div>
            <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Neto plata (auto):</span>
              <span id="payroll-netSalary-display" className="text-lg font-bold text-emerald-700">
                {formatRSD((editing ? editing.baseSalary : 0) + (editing ? editing.bonuses : 0) - (editing ? editing.deductions : 0))}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Mesec</TableHead><TableHead className="text-xs text-right">Osnovna</TableHead><TableHead className="text-xs text-right">Bonusi</TableHead><TableHead className="text-xs text-right">Odbitci</TableHead><TableHead className="text-xs text-right">Neto</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs w-[100px]">Akcije</TableHead>
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
                  <TableCell><Badge variant={p.status === 'isplaceno' ? 'default' : p.status === 'odobreno' ? 'secondary' : 'outline'} className="text-[10px]">{p.status === 'nacrt' ? 'Nacrt' : p.status === 'odobreno' ? 'Odobreno' : 'Isplaćeno'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handlePrint(p)}><Printer className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
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
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Attendance | null>(null)

  const fetchAttendances = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/attendances')
    setAttendances(await res.json())
    setLoading(false)
  }, [])

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data.map((e: Employee) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, baseSalary: e.baseSalary })))
  }, [])

  useEffect(() => { fetchAttendances(); fetchEmployees() }, [fetchAttendances, fetchEmployees])

  const typeColors: Record<string, string> = { rad: 'text-emerald-600', bolovanje: 'text-red-600', godisnji: 'text-blue-600', sluzbeni_put: 'text-purple-600', odsustvo: 'text-amber-600' }
  const typeLabels: Record<string, string> = { rad: 'Rad', bolovanje: 'Bolovanje', godisnji: 'Godišnji', sluzbeni_put: 'Službeni put', odsustvo: 'Odsustvo' }

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (a: Attendance) => {
    setEditing(a)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ovaj unos prisustva?')) return
    try {
      await fetch(`/api/attendances/${id}`, { method: 'DELETE' })
      toast.success('Obrisano')
      fetchAttendances()
    } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const employeeId = fd.get('employeeId') as string
    const date = fd.get('date') as string
    const hoursWorked = Number(fd.get('hoursWorked')) || 8
    const type = fd.get('type') as string
    const notes = fd.get('notes') as string

    if (!employeeId || !date) {
      toast.error('Zaposleni i datum su obavezni')
      setSubmitting(false)
      return
    }

    const body = { employeeId, date, hoursWorked, type, notes: notes || null }

    try {
      const url = editing ? `/api/attendances/${editing.id}` : '/api/attendances'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Unos ažuriran' : 'Unos kreiran')
      setViewMode('list')
      setEditing(null)
      fetchAttendances()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  const formatDateValue = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? 'Izmeni' : 'Novi'} Unos Prisustva</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Evidencija prisustva</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{attendances.length} unosa</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> Novi Unos</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zaposleni *</Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''}>
                  <SelectTrigger><SelectValue placeholder="Izaberite zaposlenog" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Datum *</Label>
                <Input name="date" type="date" defaultValue={editing ? formatDateValue(editing.date) : new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Radni sati</Label>
                <Input name="hoursWorked" type="number" min="0" max="24" step="0.5" defaultValue={editing?.hoursWorked || 8} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tip</Label>
                <Select name="type" defaultValue={editing?.type || 'rad'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rad">Rad</SelectItem>
                    <SelectItem value="bolovanje">Bolovanje</SelectItem>
                    <SelectItem value="godisnji">Godišnji</SelectItem>
                    <SelectItem value="sluzbeni_put">Službeni put</SelectItem>
                    <SelectItem value="odsustvo">Odsustvo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Napomene</Label>
              <Input name="notes" defaultValue={editing?.notes || ''} placeholder="Opciono..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Otkaži</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Datum</TableHead><TableHead className="text-xs text-center">Sati</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Napomene</TableHead><TableHead className="text-xs w-[80px]">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-medium">{a.employee.firstName} {a.employee.lastName}</TableCell>
                  <TableCell className="text-xs">{formatDate(a.date)}</TableCell>
                  <TableCell className="text-xs text-center">{a.hoursWorked}h</TableCell>
                  <TableCell className="text-xs"><span className={typeColors[a.type] || ''}>{typeLabels[a.type] || a.type}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
