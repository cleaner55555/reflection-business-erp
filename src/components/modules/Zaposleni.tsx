'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Search, Pencil, Trash2, UserCog, Users, ArrowLeft, Printer,
  BarChart3, Building2, DollarSign, Calendar, Clock, TrendingUp, Award,
  AlertTriangle, Eye, FileText, Star, GitBranch,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { formatRSD, formatDate } from '@/lib/helpers'
import { OceneTab, OrganigramTab } from './ZaposleniEnhanced'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Employee {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; department: string | null; baseSalary: number; bankAccount: string | null
  isActive: boolean; hireDate: string; createdAt: string; partnerId: string | null
  partner?: { id: string; name: string } | null
  _count?: { payrolls: number; attendances: number }
}

interface Payroll {
  id: string; employeeId: string; month: number; year: number; baseSalary: number;
  bonuses: number; deductions: number; netSalary: number; status: string;
  payDate: string | null; notes: string | null
  employee: { id: string; firstName: string; lastName: string }
}

interface Attendance {
  id: string; employeeId: string; date: string; hoursWorked: number;
  type: string; notes: string | null; createdAt: string
  employee: { id: string; firstName: string; lastName: string }
}

interface EmployeeOption {
  id: string; firstName: string; lastName: string; baseSalary: number; department: string | null
}

interface EmployeeStats {
  total: number; active: number; inactive: number; totalSalaryCost: number; avgSalary: number
  newThisMonth: number; anniversaries: { id: string; firstName: string; lastName: string; hireDate: string; years: number }[]
  departments: { name: string; count: number; avgSalary: number }[]
  attendanceByType: { type: string; label: string; count: number; hours: number }[]
  totalAttendanceHours: number; payrollTotal: number; payrollPaid: number; payrollTotalCount: number
}

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
const DEPARTMENTS = ['IT', 'Prodaja', 'Magacin', 'Finansije', 'Menadžment', 'Administracija', 'Marketing', 'Proizvodnja', 'Logistika']
const ATTENDANCE_TYPES = [
  { value: 'rad', label: 'Rad', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'bolovanje', label: 'Bolovanje', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'godisnji', label: 'Godišnji', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'sluzbeni_put', label: 'Službeni put', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'odsustvo', label: 'Odsustvo', color: 'text-amber-600 bg-amber-50 border-amber-200' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function Zaposleni() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('employees.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('employees.subtitle')}</p>
      </div>
      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
          <TabsTrigger value="zaposleni" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.employeeList')}</span>
          </TabsTrigger>
          <TabsTrigger value="plate" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.payroll')}</span>
          </TabsTrigger>
          <TabsTrigger value="prisustvo" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.attendance')}</span>
          </TabsTrigger>
          <TabsTrigger value="organigram" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Organigram</span>
          </TabsTrigger>
          <TabsTrigger value="ocene" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ocene</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pregled"><PregledTab /></TabsContent>
        <TabsContent value="zaposleni"><ZaposleniListTab /></TabsContent>
        <TabsContent value="plate"><PlateTab /></TabsContent>
        <TabsContent value="prisustvo"><PrisustvoTab /></TabsContent>
        <TabsContent value="organigram"><OrganigramTab /></TabsContent>
        <TabsContent value="ocene"><OceneTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Tab 1: Pregled (Dashboard) ───────────────────────────────────────────────

function PregledTab() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/employees/stats')
        setStats(await res.json())
      } catch { toast.error('Greška') } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
  }
  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ukupno zaposlenih</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.active} aktivnih, {stats.inactive} neaktivnih</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Prosečna plata</p>
              <p className="text-2xl font-bold mt-1">{formatRSD(stats.avgSalary)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Ukupno: {formatRSD(stats.totalSalaryCost)}/mes</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Novo ovog meseca</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.newThisMonth}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.departments.length} departmana</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Plate ({MONTHS[new Date().getMonth()]})</p>
              <p className="text-2xl font-bold mt-1">{formatRSD(stats.payrollTotal)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.payrollPaid}/{stats.payrollTotalCount} isplaćeno</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Departments + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Po odeljenjima ({stats.departments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.departments.map((dept, i) => {
                const maxCount = stats.departments[0]?.count || 1
                const pct = Math.round((dept.count / maxCount) * 100)
                return (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.count} • {formatRSD(dept.avgSalary)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Prisustvo ovog meseca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.attendanceByType.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nema evidentiranog prisustva ovog meseca.</p>
            ) : (
              <div className="space-y-3">
                {stats.attendanceByType.map((a) => {
                  const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type)
                  return (
                    <div key={a.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeInfo?.color || ''}`}>{a.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">{a.count} dana</span>
                        <span className="font-medium">{a.hours.toFixed(1)}h</span>
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between pt-2 border-t text-xs font-medium">
                  <span>Ukupno sati</span>
                  <span>{stats.totalAttendanceHours.toFixed(1)}h</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anniversaries */}
      {stats.anniversaries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Godišnjice zaposlenja ovog meseca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.anniversaries.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{a.firstName} {a.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">{a.years} god. radnog staža</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Tab 2: Zaposleni List + CRUD ─────────────────────────────────────────────

function ZaposleniListTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null)
  const [detailPayrolls, setDetailPayrolls] = useState<Payroll[]>([])
  const [detailAttendances, setDetailAttendances] = useState<Attendance[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (deptFilter) params.set('department', deptFilter)
    const res = await fetch(`/api/employees?${params}`)
    const data = await res.json()
    setEmployees(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, deptFilter])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  useEffect(() => {
    if (employees.length > 0) {
      const texts: string[] = []
      employees.forEach((emp) => {
        if (emp.firstName) texts.push(emp.firstName)
        if (emp.lastName) texts.push(emp.lastName)
        if (emp.position) texts.push(emp.position)
        if (emp.department) texts.push(emp.department)
      })
      translateTexts(texts)
    }
  }, [employees, translateTexts])

  const handleNew = () => { setEditing(null); setViewMode('form') }
  const handleEdit = (emp: Employee) => { setEditing(emp); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditing(null) }

  const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDelete'))) return
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      toast.success(t('common.deleteSuccess'))
      fetchEmployees()
    } catch { toast.error(t('common.error')) }
  }

  const handleToggleActive = async (emp: Employee) => {
    try {
      await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !emp.isActive }),
      })
      toast.success(emp.isActive ? 'Zaposleni deaktiviran' : 'Zaposleni aktiviran')
      fetchEmployees()
    } catch { toast.error('Greška') }
  }

  const handleViewDetail = async (emp: Employee) => {
    setDetailEmployee(emp)
    setDetailLoading(true)
    try {
      const [payrollRes, attRes] = await Promise.all([
        fetch(`/api/payroll?employeeId=${emp.id}&_limit=12`),
        fetch(`/api/attendances?employeeId=${emp.id}&_limit=20`),
      ])
      setDetailPayrolls(await payrollRes.json())
      setDetailAttendances(await attRes.json())
    } catch { toast.error('Greška pri učitavanju') } finally { setDetailLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      firstName: fd.get('firstName'), lastName: fd.get('lastName'),
      email: fd.get('email') || null, phone: fd.get('phone') || null,
      position: fd.get('position') || null, department: fd.get('department') || null,
      baseSalary: Number(fd.get('baseSalary')) || 0, bankAccount: fd.get('bankAccount') || null,
    }
    try {
      const url = editing ? `/api/employees/${editing.id}` : '/api/employees'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created'))
      setViewMode('list'); setEditing(null); fetchEmployees()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-base font-semibold">
                {editing ? 'Izmeni zaposlenog' : 'Novi zaposleni'}
              </CardTitle>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t('employees.employeeList')}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{employees.length} {t('employees.employeeCount')}</p>
                </div>
                <Button size="sm" className="gap-2" onClick={handleNew}>
                  <Plus className="h-4 w-4" /> {t('employees.newEmployee')}
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('employees.searchPlaceholder')} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={deptFilter || 'all'} onValueChange={(v) => setDeptFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Svi departmani" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi departmani</SelectItem>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi</SelectItem>
                    <SelectItem value="true">Aktivni</SelectItem>
                    <SelectItem value="false">Neaktivni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5" key={editing?.id || 'new'}>
              {/* Personal info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lični podaci</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">{t('employees.firstName')} <span className="text-red-500">*</span></Label><Input name="firstName" defaultValue={editing?.firstName || ''} required /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('employees.lastName')} <span className="text-red-500">*</span></Label><Input name="lastName" defaultValue={editing?.lastName || ''} required /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('employees.position')}</Label><Input name="position" defaultValue={editing?.position || ''} /></div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('employees.department')}</Label>
                    <Select name="department" defaultValue={editing?.department || ''}>
                      <SelectTrigger><SelectValue placeholder="Izaberi..." /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">{t('common.email')}</Label><Input name="email" type="email" defaultValue={editing?.email || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('employees.phone')}</Label><Input name="phone" defaultValue={editing?.phone || ''} /></div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Finansijski podaci</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">{t('employees.baseSalary')} (RSD)</Label><Input name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('employees.bankAccount')}</Label><Input name="bankAccount" defaultValue={editing?.bankAccount || ''} /></div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? t('common.saving') : editing ? t('common.saveChanges') : 'Kreiraj'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('common.name')}</TableHead>
                    <TableHead className="text-xs">{t('employees.position')}</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">{t('employees.department')}</TableHead>
                    <TableHead className="text-xs text-right">{t('employees.salary')}</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">{t('employees.hireDate')}</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema zaposlenih</TableCell></TableRow>
                  ) : (
                    employees.map((emp) => (
                      <TableRow key={emp.id} className={!emp.isActive ? 'opacity-50' : ''}>
                        <TableCell className="text-xs font-medium">{tc(emp.firstName)} {tc(emp.lastName)}</TableCell>
                        <TableCell className="text-xs">{tc(emp.position || '') || '-'}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          {emp.department ? <Badge variant="outline" className="text-[10px] px-2 py-0">{emp.department}</Badge> : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatRSD(emp.baseSalary)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell text-muted-foreground">{formatDate(emp.hireDate)}</TableCell>
                        <TableCell className="text-xs text-center">
                          <button onClick={() => handleToggleActive(emp)} className="inline-flex" title={emp.isActive ? 'Deaktiviraj' : 'Aktiviraj'}>
                            <div className={`w-5 h-3 rounded-full relative transition-colors ${emp.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                              <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-transform ${emp.isActive ? 'left-2.5' : 'left-0.5'}`} />
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetail(emp)} title="Detalji">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(emp)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(emp.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={!!detailEmployee} onOpenChange={(open) => { if (!open) setDetailEmployee(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{tc(detailEmployee.firstName)} {tc(detailEmployee.lastName)}</DialogTitle>
              </DialogHeader>
              {detailLoading ? (
                <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
              ) : (
                <div className="space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Pozicija:</span><p className="font-medium">{tc(detailEmployee.position || '-')}</p></div>
                    <div><span className="text-muted-foreground">Departman:</span><p className="font-medium">{detailEmployee.department || '-'}</p></div>
                    <div><span className="text-muted-foreground">Plata:</span><p className="font-medium">{formatRSD(detailEmployee.baseSalary)}</p></div>
                    <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{detailEmployee.email || '-'}</p></div>
                    <div><span className="text-muted-foreground">Telefon:</span><p className="font-medium">{detailEmployee.phone || '-'}</p></div>
                    <div><span className="text-muted-foreground">Zaposlen od:</span><p className="font-medium">{formatDate(detailEmployee.hireDate)}</p></div>
                  </div>

                  <Separator />

                  {/* Recent payrolls */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Plate ({detailPayrolls.length})</h4>
                    {detailPayrolls.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nema obračunatih plata.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto">
                        <Table>
                          <TableHeader><TableRow>
                            <TableHead className="text-xs">Mesec</TableHead>
                            <TableHead className="text-xs text-right">Neto</TableHead>
                            <TableHead className="text-xs text-center">Status</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {detailPayrolls.slice(0, 6).map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="text-xs">{MONTHS[p.month - 1]} {p.year}</TableCell>
                                <TableCell className="text-xs text-right font-medium">{formatRSD(p.netSalary)}</TableCell>
                                <TableCell className="text-xs text-center">
                                  <Badge variant={p.status === 'isplaceno' ? 'default' : 'outline'} className="text-[10px]">
                                    {p.status === 'nacrt' ? 'Nacrt' : p.status === 'odobreno' ? 'Odobreno' : 'Isplaćeno'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Recent attendance */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Prisustvo ({detailAttendances.length})</h4>
                    {detailAttendances.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nema evidentiranog prisustva.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto">
                        <Table>
                          <TableHeader><TableRow>
                            <TableHead className="text-xs">Datum</TableHead>
                            <TableHead className="text-xs text-center">Sati</TableHead>
                            <TableHead className="text-xs">Tip</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {detailAttendances.slice(0, 8).map((a) => {
                              const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type)
                              return (
                                <TableRow key={a.id}>
                                  <TableCell className="text-xs">{formatDate(a.date)}</TableCell>
                                  <TableCell className="text-xs text-center">{a.hoursWorked}h</TableCell>
                                  <TableCell className="text-xs">
                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeInfo?.color || ''}`}>
                                      {typeInfo?.label || a.type}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Tab 3: Plate (Payroll) ──────────────────────────────────────────────────

function PlateTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Payroll | null>(null)
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [filterEmployee, setFilterEmployee] = useState('')

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterMonth) params.set('month', filterMonth)
    if (filterYear) params.set('year', filterYear)
    if (filterEmployee) params.set('employeeId', filterEmployee)
    const res = await fetch(`/api/payroll?${params}`)
    setPayrolls(await res.json())
    setLoading(false)
  }, [filterMonth, filterYear, filterEmployee])

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees((Array.isArray(data) ? data : []).map((e: Employee) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, baseSalary: e.baseSalary, department: e.department })))
  }, [])

  useEffect(() => { fetchPayrolls(); fetchEmployees() }, [fetchPayrolls, fetchEmployees])

  useEffect(() => {
    if (payrolls.length > 0) {
      const texts: string[] = []
      payrolls.forEach((p) => { texts.push(p.employee.firstName, p.employee.lastName) })
      translateTexts(texts)
    }
  }, [payrolls, translateTexts])

  const filteredPayrolls = filterEmployee || filterMonth || filterYear ? payrolls : payrolls
  const totalBase = filteredPayrolls.reduce((s, p) => s + p.baseSalary, 0)
  const totalNet = filteredPayrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalBonuses = filteredPayrolls.reduce((s, p) => s + p.bonuses, 0)
  const totalDeductions = filteredPayrolls.reduce((s, p) => s + p.deductions, 0)

  const handleNew = () => { setEditing(null); setViewMode('form') }
  const handleEdit = (p: Payroll) => { setEditing(p); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditing(null) }

  const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDeletePayroll'))) return
    try { await fetch(`/api/payroll/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchPayrolls() } catch { toast.error(t('common.error')) }
  }

  const handlePrint = (p: Payroll) => {
    const printContent = `
      <html><head><title>Obračun plate - ${p.employee.firstName} ${p.employee.lastName}</title>
      <style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px}h1{color:#333;font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 12px;border:1px solid #ddd;text-align:left;font-size:14px}th{background:#f5f5f5;font-weight:600}.net{font-weight:bold;font-size:16px;color:#059669}.footer{margin-top:24px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:12px}</style></head>
      <body><h1>Obračun plate</h1><table>
        <tr><th>Zaposleni</th><td>${p.employee.firstName} ${p.employee.lastName}</td></tr>
        <tr><th>Mesec</th><td>${MONTHS[p.month - 1]} ${p.year}</td></tr>
        <tr><th>Osnovica</th><td>${formatRSD(p.baseSalary)}</td></tr>
        <tr><th>Bonusi</th><td>${formatRSD(p.bonuses)}</td></tr>
        <tr><th>Odbitci</th><td>${formatRSD(p.deductions)}</td></tr>
        <tr><th>Neto plata</th><td class="net">${formatRSD(p.netSalary)}</td></tr>
        <tr><th>Status</th><td>${p.status}</td></tr>
      </table><div class="footer">Generisano: ${new Date().toLocaleString('sr-Latn')}</div></body></html>
    `
    const win = window.open('', '_blank')
    if (win) { win.document.write(printContent); win.document.close(); win.print() }
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (emp) {
      const baseInput = document.getElementById('payroll-baseSalary') as HTMLInputElement
      if (baseInput) { baseInput.value = String(emp.baseSalary); recalcNet() }
    }
  }

  const recalcNet = () => {
    const b = document.getElementById('payroll-baseSalary') as HTMLInputElement
    const bon = document.getElementById('payroll-bonuses') as HTMLInputElement
    const d = document.getElementById('payroll-deductions') as HTMLInputElement
    const n = document.getElementById('payroll-netSalary-display')
    if (b && bon && d && n) {
      const net = (Number(b.value) || 0) + (Number(bon.value) || 0) - (Number(d.value) || 0)
      n.textContent = formatRSD(net)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const employeeId = fd.get('employeeId') as string
    const month = Number(fd.get('month'))
    const year = Number(fd.get('year'))
    const baseSalary = Number(fd.get('baseSalary')) || 0
    const bonuses = Number(fd.get('bonuses')) || 0
    const deductions = Number(fd.get('deductions')) || 0
    const netSalary = baseSalary + bonuses - deductions
    const status = fd.get('status') as string
    if (!employeeId || !month || !year) { toast.error(t('employees.requiredFields')); setSubmitting(false); return }
    const body = { employeeId, month, year, baseSalary, bonuses, deductions, netSalary, status }
    try {
      const url = editing ? `/api/payroll/${editing.id}` : '/api/payroll'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? 'Plate ažurirana' : 'Plate kreirana')
      setViewMode('list'); setEditing(null); fetchPayrolls()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base font-semibold">{editing ? 'Izmeni obračun' : 'Novi obračun'}</CardTitle>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('employees.payroll')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredPayrolls.length} zapisa</p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('employees.newPayroll')}</Button>
            </div>
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" className="w-[100px] h-9" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} min="2020" max="2030" />
              <Select value={filterEmployee || 'all'} onValueChange={(v) => setFilterEmployee(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="Svi zaposleni" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi zaposleni</SelectItem>
                  {employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg bg-muted px-3 py-2"><p className="text-[10px] text-muted-foreground">Osnovica</p><p className="text-sm font-bold">{formatRSD(totalBase)}</p></div>
              <div className="rounded-lg bg-emerald-50 px-3 py-2"><p className="text-[10px] text-emerald-600">Bonusi</p><p className="text-sm font-bold text-emerald-700">+{formatRSD(totalBonuses)}</p></div>
              <div className="rounded-lg bg-red-50 px-3 py-2"><p className="text-[10px] text-red-600">Odbitci</p><p className="text-sm font-bold text-red-600">-{formatRSD(totalDeductions)}</p></div>
              <div className="rounded-lg bg-emerald-100 px-3 py-2"><p className="text-[10px] text-emerald-700">Neto ukupno</p><p className="text-sm font-bold text-emerald-700">{formatRSD(totalNet)}</p></div>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zaposleni <span className="text-red-500">*</span></Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger><SelectValue placeholder={t('employees.selectEmployee')} /></SelectTrigger>
                  <SelectContent>{employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select name="status" defaultValue={editing?.status || 'nacrt'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacrt">Nacrt</SelectItem><SelectItem value="odobreno">Odobreno</SelectItem><SelectItem value="isplaceno">Isplaćeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Mesec <span className="text-red-500">*</span></Label>
                <Select name="month" defaultValue={editing ? String(editing.month) : ''}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Godina <span className="text-red-500">*</span></Label>
                <Input name="year" type="number" min="2020" max="2030" defaultValue={editing?.year || new Date().getFullYear()} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-xs">Osnovica</Label><Input id="payroll-baseSalary" name="baseSalary" type="number" step="0.01" defaultValue={editing?.baseSalary || ''} onChange={() => recalcNet()} /></div>
              <div className="space-y-2"><Label className="text-xs">Bonusi</Label><Input id="payroll-bonuses" name="bonuses" type="number" step="0.01" defaultValue={editing?.bonuses || 0} onChange={() => recalcNet()} /></div>
              <div className="space-y-2"><Label className="text-xs">Odbitci</Label><Input id="payroll-deductions" name="deductions" type="number" step="0.01" defaultValue={editing?.deductions || 0} onChange={() => recalcNet()} /></div>
            </div>
            <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Neto plata:</span>
              <span id="payroll-netSalary-display" className="text-lg font-bold text-emerald-700">
                {formatRSD((editing ? editing.baseSalary : 0) + (editing ? editing.bonuses : 0) - (editing ? editing.deductions : 0))}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Mesec</TableHead>
                <TableHead className="text-xs text-right">Osnovica</TableHead><TableHead className="text-xs text-right">Bonusi</TableHead>
                <TableHead className="text-xs text-right">Odbitci</TableHead><TableHead className="text-xs text-right">Neto</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead><TableHead className="text-xs w-[100px]">{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredPayrolls.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Nema obračunatih plata za izabrani period.</TableCell></TableRow>
                ) : (
                  filteredPayrolls.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-medium">{tc(p.employee.firstName)} {tc(p.employee.lastName)}</TableCell>
                      <TableCell className="text-xs">{MONTHS[p.month - 1]} {p.year}</TableCell>
                      <TableCell className="text-xs text-right">{formatRSD(p.baseSalary)}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-600">+{formatRSD(p.bonuses)}</TableCell>
                      <TableCell className="text-xs text-right text-red-600">-{formatRSD(p.deductions)}</TableCell>
                      <TableCell className="text-xs text-right font-bold">{formatRSD(p.netSalary)}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant={p.status === 'isplaceno' ? 'default' : p.status === 'odobreno' ? 'secondary' : 'outline'} className="text-[10px]">
                          {p.status === 'nacrt' ? 'Nacrt' : p.status === 'odobreno' ? 'Odobreno' : 'Isplaćeno'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handlePrint(p)}><Printer className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Tab 4: Prisustvo (Attendance) ───────────────────────────────────────────

function PrisustvoTab() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Attendance | null>(null)
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [filterType, setFilterType] = useState('')

  const fetchAttendances = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterMonth && filterYear) params.set('month', filterMonth)
    params.set('year', filterYear)
    if (filterType) params.set('type', filterType)
    const res = await fetch(`/api/attendances?${params}`)
    setAttendances(await res.json())
    setLoading(false)
  }, [filterMonth, filterYear, filterType])

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees((Array.isArray(data) ? data : []).map((e: Employee) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, baseSalary: e.baseSalary, department: e.department })))
  }, [])

  useEffect(() => { fetchAttendances(); fetchEmployees() }, [fetchAttendances, fetchEmployees])

  useEffect(() => {
    if (attendances.length > 0) {
      const texts: string[] = []
      attendances.forEach((a) => { texts.push(a.employee.firstName, a.employee.lastName); if (a.notes) texts.push(a.notes) })
      translateTexts(texts)
    }
  }, [attendances, translateTexts])

  // Attendance summary
  const totalHours = attendances.reduce((s, a) => s + a.hoursWorked, 0)
  const workHours = attendances.filter((a) => a.type === 'rad').reduce((s, a) => s + a.hoursWorked, 0)
  const leaveDays = attendances.filter((a) => a.type === 'godisnji').length
  const sickDays = attendances.filter((a) => a.type === 'bolovanje').length

  const handleNew = () => { setEditing(null); setViewMode('form') }
  const handleEdit = (a: Attendance) => { setEditing(a); setViewMode('form') }
  const handleCancel = () => { setViewMode('list'); setEditing(null) }

  const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDeleteAttendance'))) return
    try { await fetch(`/api/attendances/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchAttendances() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const employeeId = fd.get('employeeId') as string
    const date = fd.get('date') as string
    const hoursWorked = Number(fd.get('hoursWorked')) || 8
    const type = fd.get('type') as string
    const notes = fd.get('notes') as string
    if (!employeeId || !date) { toast.error(t('employees.requiredFieldsAttendance')); setSubmitting(false); return }
    try {
      const url = editing ? `/api/attendances/${editing.id}` : '/api/attendances'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, date, hoursWorked, type, notes: notes || null }) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? 'Zapis ažuriran' : 'Zapis kreiran')
      setViewMode('list'); setEditing(null); fetchAttendances()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const formatDateValue = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        {viewMode === 'form' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base font-semibold">{editing ? 'Izmeni prisustvo' : 'Novi zapis'}</CardTitle>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('employees.attendanceRegister')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{attendances.length} zapisa</p>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('employees.newRecord')}</Button>
            </div>
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" className="w-[100px] h-9" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} min="2020" max="2030" />
              <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {ATTENDANCE_TYPES.map((at) => <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg bg-muted px-3 py-2"><p className="text-[10px] text-muted-foreground">Ukupno sati</p><p className="text-sm font-bold">{totalHours.toFixed(1)}h</p></div>
              <div className="rounded-lg bg-emerald-50 px-3 py-2"><p className="text-[10px] text-emerald-600">Rad</p><p className="text-sm font-bold text-emerald-700">{workHours.toFixed(1)}h</p></div>
              <div className="rounded-lg bg-blue-50 px-3 py-2"><p className="text-[10px] text-blue-600">Godišnji</p><p className="text-sm font-bold text-blue-700">{leaveDays} dana</p></div>
              <div className="rounded-lg bg-red-50 px-3 py-2"><p className="text-[10px] text-red-600">Bolovanje</p><p className="text-sm font-bold text-red-700">{sickDays} dana</p></div>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Zaposleni <span className="text-red-500">*</span></Label>
                <Select name="employeeId" defaultValue={editing?.employeeId || ''}>
                  <SelectTrigger><SelectValue placeholder={t('employees.selectEmployee')} /></SelectTrigger>
                  <SelectContent>{employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Datum <span className="text-red-500">*</span></Label>
                <Input name="date" type="date" defaultValue={editing ? formatDateValue(editing.date) : new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Radnih sati</Label>
                <Input name="hoursWorked" type="number" min="0" max="24" step="0.5" defaultValue={editing?.hoursWorked || 8} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tip</Label>
                <Select name="type" defaultValue={editing?.type || 'rad'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ATTENDANCE_TYPES.map((at) => <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('common.notes')}</Label>
              <Input name="notes" defaultValue={editing?.notes || ''} placeholder="Opciono..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </form>
        ) : loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Zaposleni</TableHead><TableHead className="text-xs">Datum</TableHead>
                <TableHead className="text-xs text-center">Sati</TableHead><TableHead className="text-xs">Tip</TableHead>
                <TableHead className="text-xs hidden md:table-cell">{t('common.notes')}</TableHead>
                <TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {attendances.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nema zapisa za izabrani period.</TableCell></TableRow>
                ) : (
                  attendances.map((a) => {
                    const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type)
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-medium">{tc(a.employee.firstName)} {tc(a.employee.lastName)}</TableCell>
                        <TableCell className="text-xs">{formatDate(a.date)}</TableCell>
                        <TableCell className="text-xs text-center">{a.hoursWorked}h</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeInfo?.color || ''}`}>
                            {typeInfo?.label || a.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{tc(a.notes || '') || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
