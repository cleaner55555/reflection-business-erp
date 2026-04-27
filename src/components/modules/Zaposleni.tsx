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
import { useTranslation, useContentTranslation } from '@/lib/i18n'
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
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('employees.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('employees.subtitle')}</p>
      </div>
      <Tabs defaultValue="zaposleni" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zaposleni" className="gap-1.5"><Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('employees.employeeList')}</span></TabsTrigger>
          <TabsTrigger value="plate">{t('employees.payroll')}</TabsTrigger>
          <TabsTrigger value="prisustvo">{t('employees.attendance')}</TabsTrigger>
        </TabsList>
        <TabsContent value="zaposleni"><ZaposleniListTab /></TabsContent>
        <TabsContent value="plate"><PlateTab /></TabsContent>
        <TabsContent value="prisustvo"><PrisustvoTab /></TabsContent>
      </Tabs>
    </div>
  )
}

function ZaposleniListTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  useEffect(() => {
    if (employees.length > 0) {
      const texts: string[] = []
      employees.forEach(emp => {
        if (emp.firstName) texts.push(emp.firstName)
        if (emp.lastName) texts.push(emp.lastName)
        if (emp.position) texts.push(emp.position)
        if (emp.department) texts.push(emp.department)
      })
      translateTexts(texts)
    }
  }, [employees, translateTexts])

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
    if (!confirm(t('employees.confirmDelete'))) return
    try { await fetch(`/api/employees/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchEmployees() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), phone: fd.get('phone'), position: fd.get('position'), department: fd.get('department'), baseSalary: fd.get('baseSalary'), bankAccount: fd.get('bankAccount') }
    try {
      const url = editing ? `/api/employees/${editing.id}` : '/api/employees'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('list'); setEditing(null); fetchEmployees()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('employees.employee')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">{t('employees.employeeList')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{employees.length} {t('employees.employeeCount')}</p></div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('employees.newEmployee')}</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="relative max-w-sm mt-4"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder={t('employees.searchPlaceholder')} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('employees.firstName')} *</Label><Input name="firstName" defaultValue={editing?.firstName || ''} required /></div>
              <div className="space-y-2"><Label className="text-xs">{t('employees.lastName')} *</Label><Input name="lastName" defaultValue={editing?.lastName || ''} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('employees.position')}</Label><Input name="position" defaultValue={editing?.position || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('employees.department')}</Label>
                <Select name="department" defaultValue={editing?.department || ''}><SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger><SelectContent>
                  <SelectItem value="IT">IT</SelectItem><SelectItem value="Prodaja">{t('employees.deptSales')}</SelectItem><SelectItem value="Magacin">{t('employees.deptWarehouse')}</SelectItem><SelectItem value="Finansije">{t('employees.deptFinance')}</SelectItem><SelectItem value="Menadžment">{t('employees.deptManagement')}</SelectItem><SelectItem value="Administracija">{t('employees.deptAdmin')}</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('common.email')}</Label><Input name="email" type="email" defaultValue={editing?.email || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('employees.phone')}</Label><Input name="phone" defaultValue={editing?.phone || ''} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('employees.baseSalary')} (RSD)</Label><Input name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('employees.bankAccount')}</Label><Input name="bankAccount" defaultValue={editing?.bankAccount || ''} /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('employees.position')}</TableHead><TableHead className="text-xs">{t('employees.department')}</TableHead><TableHead className="text-xs text-right">{t('employees.salary')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="text-xs font-medium">{tc(emp.firstName)} {tc(emp.lastName)}</TableCell>
                  <TableCell className="text-xs">{tc(emp.position || '') || '-'}</TableCell>
                  <TableCell className="text-xs">{tc(emp.department || '') || '-'}</TableCell>
                  <TableCell className="text-xs text-right">{formatRSD(emp.baseSalary)}</TableCell>
                  <TableCell><Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-[10px]">{emp.isActive ? t('common.aktivan') : t('common.neaktivan')}</Badge></TableCell>
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
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  useEffect(() => {
    if (payrolls.length > 0) {
      const texts: string[] = []
      payrolls.forEach(p => {
        texts.push(p.employee.firstName, p.employee.lastName)
      })
      translateTexts(texts)
    }
  }, [payrolls, translateTexts])

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
    if (!confirm(t('employees.confirmDeletePayroll'))) return
    try {
      await fetch(`/api/payroll/${id}`, { method: 'DELETE' })
      toast.success(t('common.deleteSuccess'))
      fetchPayrolls()
    } catch { toast.error(t('common.error')) }
  }

  const handlePrint = (p: Payroll) => {
    const printContent = `
      <html><head><title>${t('employees.payrollSlip')} - ${p.employee.firstName} ${p.employee.lastName}</title>
      <style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px}h1{color:#333;font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 12px;border:1px solid #ddd;text-align:left;font-size:14px}th{background:#f5f5f5;font-weight:600}.net{font-weight:bold;font-size:16px;color:#059669}.footer{margin-top:24px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:12px}</style></head>
      <body>
        <h1>${t('employees.salaryCalc')}</h1>
        <table>
          <tr><th>${t('employees.title')}</th><td>${p.employee.firstName} ${p.employee.lastName}</td></tr>
          <tr><th>${t('employees.month')}</th><td>${MONTHS[p.month - 1]} ${p.year}</td></tr>
          <tr><th>${t('employees.baseSalary')}</th><td>${formatRSD(p.baseSalary)}</td></tr>
          <tr><th>${t('employees.bonuses')}</th><td>${formatRSD(p.bonuses)}</td></tr>
          <tr><th>${t('employees.deductions')}</th><td>${formatRSD(p.deductions)}</td></tr>
          <tr><th>${t('employees.netSalary')}</th><td class="net">${formatRSD(p.netSalary)}</td></tr>
          <tr><th>${t('common.status')}</th><td>${p.status}</td></tr>
          ${p.payDate ? `<tr><th>${t('employees.payDate')}</th><td>${new Date(p.payDate).toLocaleDateString('sr-Latn')}</td></tr>` : ''}
        </table>
        <div class="footer">${t('employees.generated')}: ${new Date().toLocaleString('sr-Latn')}</div>
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
      toast.error(t('employees.requiredFields'))
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
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('employees.payrollUpdated') : t('employees.payrollCreated'))
      setViewMode('list')
      setEditing(null)
      fetchPayrolls()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
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
            <div><CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('employees.payrollRecord')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('employees.payroll')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{payrolls.length} {t('employees.recordsCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('employees.newPayroll')}</Button>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="flex gap-4 mt-4">
            <div className="rounded-lg bg-muted px-4 py-2"><p className="text-xs text-muted-foreground">{t('employees.grossTotal')}</p><p className="text-sm font-bold">{formatRSD(totalBase)}</p></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-2"><p className="text-xs text-emerald-600">{t('employees.netTotal')}</p><p className="text-sm font-bold text-emerald-700">{formatRSD(totalNet)}</p></div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.title')} *</Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger><SelectValue placeholder={t('employees.selectEmployee')} /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.status')}</Label>
                <Select name="status" defaultValue={editing?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">{t('employees.statusDraft')}</SelectItem>
                    <SelectItem value="odobreno">{t('employees.statusApproved')}</SelectItem>
                    <SelectItem value="isplaceno">{t('employees.statusPaid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.month')} *</Label>
                <Select name="month" defaultValue={editing ? String(editing.month) : ''}>
                  <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.year')} *</Label>
                <Input name="year" type="number" min="2020" max="2030" defaultValue={editing?.year || new Date().getFullYear()} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.baseSalary')}</Label>
                <Input id="payroll-baseSalary" name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} onChange={() => recalcNet()} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.bonuses')}</Label>
                <Input id="payroll-bonuses" name="bonuses" type="number" step="0.01" defaultValue={editing?.bonuses || 0} onChange={() => recalcNet()} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.deductions')}</Label>
                <Input id="payroll-deductions" name="deductions" type="number" step="0.01" defaultValue={editing?.deductions || 0} onChange={() => recalcNet()} />
              </div>
            </div>
            <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('employees.netSalaryAuto')}:</span>
              <span id="payroll-netSalary-display" className="text-lg font-bold text-emerald-700">
                {formatRSD((editing ? editing.baseSalary : 0) + (editing ? editing.bonuses : 0) - (editing ? editing.deductions : 0))}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('employees.title')}</TableHead><TableHead className="text-xs">{t('employees.month')}</TableHead><TableHead className="text-xs text-right">{t('employees.baseSalaryShort')}</TableHead><TableHead className="text-xs text-right">{t('employees.bonuses')}</TableHead><TableHead className="text-xs text-right">{t('employees.deductions')}</TableHead><TableHead className="text-xs text-right">{t('employees.netSalary')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[100px]">{t('common.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {payrolls.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium">{tc(p.employee.firstName)} {tc(p.employee.lastName)}</TableCell>
                  <TableCell className="text-xs">{MONTHS[p.month - 1]} {p.year}</TableCell>
                  <TableCell className="text-xs text-right">{formatRSD(p.baseSalary)}</TableCell>
                  <TableCell className="text-xs text-right text-emerald-600">+{formatRSD(p.bonuses)}</TableCell>
                  <TableCell className="text-xs text-right text-red-600">-{formatRSD(p.deductions)}</TableCell>
                  <TableCell className="text-xs text-right font-bold">{formatRSD(p.netSalary)}</TableCell>
                  <TableCell><Badge variant={p.status === 'isplaceno' ? 'default' : p.status === 'odobreno' ? 'secondary' : 'outline'} className="text-[10px]">{p.status === 'nacrt' ? t('employees.statusDraft') : p.status === 'odobreno' ? t('employees.statusApproved') : t('employees.statusPaid')}</Badge></TableCell>
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
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
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

  useEffect(() => {
    if (attendances.length > 0) {
      const texts: string[] = []
      attendances.forEach(a => {
        texts.push(a.employee.firstName, a.employee.lastName)
        if (a.notes) texts.push(a.notes)
      })
      translateTexts(texts)
    }
  }, [attendances, translateTexts])

  const typeColors: Record<string, string> = { rad: 'text-emerald-600', bolovanje: 'text-red-600', godisnji: 'text-blue-600', sluzbeni_put: 'text-purple-600', odsustvo: 'text-amber-600' }
  const typeLabels: Record<string, string> = { rad: t('employees.typeWork'), bolovanje: t('common.bolovanje'), godisnji: t('common.godisnji'), sluzbeni_put: t('common.sluzbeni_put'), odsustvo: t('employees.typeAbsence') }

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
    if (!confirm(t('employees.confirmDeleteAttendance'))) return
    try {
      await fetch(`/api/attendances/${id}`, { method: 'DELETE' })
      toast.success(t('common.deleteSuccess'))
      fetchAttendances()
    } catch { toast.error(t('common.error')) }
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
      toast.error(t('employees.requiredFieldsAttendance'))
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
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('employees.recordUpdated') : t('employees.recordCreated'))
      setViewMode('list')
      setEditing(null)
      fetchAttendances()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
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
            <div><CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('employees.attendanceRecord')}</CardTitle></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('employees.attendanceRegister')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{attendances.length} {t('employees.recordsCount')}</p>
            </div>
            <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('employees.newRecord')}</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.title')} *</Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''}>
                  <SelectTrigger><SelectValue placeholder={t('employees.selectEmployee')} /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.date')} *</Label>
                <Input name="date" type="date" defaultValue={editing ? formatDateValue(editing.date) : new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('employees.workHours')}</Label>
                <Input name="hoursWorked" type="number" min="0" max="24" step="0.5" defaultValue={editing?.hoursWorked || 8} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.type')}</Label>
                <Select name="type" defaultValue={editing?.type || 'rad'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rad">{t('employees.typeWork')}</SelectItem>
                    <SelectItem value="bolovanje">{t('common.bolovanje')}</SelectItem>
                    <SelectItem value="godisnji">{t('common.godisnji')}</SelectItem>
                    <SelectItem value="sluzbeni_put">{t('common.sluzbeni_put')}</SelectItem>
                    <SelectItem value="odsustvo">{t('employees.typeAbsence')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.notes')}</Label>
              <Input name="notes" defaultValue={editing?.notes || ''} placeholder={t('employees.optionalNotes')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">{t('employees.title')}</TableHead><TableHead className="text-xs">{t('common.date')}</TableHead><TableHead className="text-xs text-center">{t('employees.hours')}</TableHead><TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('common.notes')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-medium">{tc(a.employee.firstName)} {tc(a.employee.lastName)}</TableCell>
                  <TableCell className="text-xs">{formatDate(a.date)}</TableCell>
                  <TableCell className="text-xs text-center">{a.hoursWorked}h</TableCell>
                  <TableCell className="text-xs"><span className={typeColors[a.type] || ''}>{typeLabels[a.type] || a.type}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tc(a.notes || '') || '-'}</TableCell>
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
