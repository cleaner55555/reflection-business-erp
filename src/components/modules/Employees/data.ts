export const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

export const DEPARTMENTS = ['IT', 'Prodaja', 'Magacin', 'Finansije', 'Menadžment', 'Administracija', 'Marketing', 'Proizvodnja', 'Logistika']

export const ATTENDANCE_TYPES = [
  { value: 'rad', label: 'Rad', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'bolovanje', label: 'Bolovanje', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'godisnji', label: 'Godišnji', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'sluzbeni_put', label: 'Službeni put', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'odsustvo', label: 'Odsustvo', color: 'text-amber-600 bg-amber-50 border-amber-200' },
]

export const { t } = useTranslation();

export const { t } = useTranslation();

export const res = await fetch('/api/employees/stats');

export const maxCount = stats.departments[0]?.count || 1;

export const pct = Math.round((dept.count / maxCount) * 100);

export const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type);

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/employees?${params}`);

export const data = await res.json();

export const texts: string[] = []

export const handleNew = () => { setEditing(null); setViewMode('form') }

export const handleEdit = (emp: Employee) => { setEditing(emp); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditing(null) }

export const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDelete'))) return
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      toast.success(t('common.deleteSuccess'))
      fetchEmployees()
    } catch { toast.error(t('common.error')) }
  }

export const handleToggleActive = async (emp: Employee) => {
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

export const handleViewDetail = async (emp: Employee) => {
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

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type);

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/payroll?${params}`);

export const res = await fetch('/api/employees');

export const data = await res.json();

export const texts: string[] = []

export const filteredPayrolls = filterEmployee || filterMonth || filterYear ? payrolls : payrolls;

export const totalBase = filteredPayrolls.reduce((s, p) => s + p.baseSalary, 0);

export const totalNet = filteredPayrolls.reduce((s, p) => s + p.netSalary, 0);

export const totalBonuses = filteredPayrolls.reduce((s, p) => s + p.bonuses, 0);

export const totalDeductions = filteredPayrolls.reduce((s, p) => s + p.deductions, 0);

export const handleNew = () => { setEditing(null); setViewMode('form') }

export const handleEdit = (p: Payroll) => { setEditing(p); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditing(null) }

export const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDeletePayroll'))) return
    try { await fetch(`/api/payroll/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchPayrolls() } catch { toast.error(t('common.error')) }
  }

export const handlePrint = (p: Payroll) => {
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

export const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (emp) {
      const baseInput = document.getElementById('payroll-baseSalary') as HTMLInputElement
      if (baseInput) { baseInput.value = String(emp.baseSalary); recalcNet() }
    }
  }

export const recalcNet = () => {
    const b = document.getElementById('payroll-baseSalary') as HTMLInputElement
    const bon = document.getElementById('payroll-bonuses') as HTMLInputElement
    const d = document.getElementById('payroll-deductions') as HTMLInputElement
    const n = document.getElementById('payroll-netSalary-display')
    if (b && bon && d && n) {
      const net = (Number(b.value) || 0) + (Number(bon.value) || 0) - (Number(d.value) || 0)
      n.textContent = formatRSD(net)
    }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/attendances?${params}`);

export const res = await fetch('/api/employees');

export const data = await res.json();

export const texts: string[] = []

export const totalHours = attendances.reduce((s, a) => s + a.hoursWorked, 0);

export const workHours = attendances.filter((a) => a.type === 'rad').reduce((s, a) => s + a.hoursWorked, 0);

export const leaveDays = attendances.filter((a) => a.type === 'godisnji').length;

export const sickDays = attendances.filter((a) => a.type === 'bolovanje').length;

export const handleNew = () => { setEditing(null); setViewMode('form') }

export const handleEdit = (a: Attendance) => { setEditing(a); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditing(null) }

export const handleDelete = async (id: string) => {
    if (!confirm(t('employees.confirmDeleteAttendance'))) return
    try { await fetch(`/api/attendances/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchAttendances() } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const formatDateValue = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().split('T')[0]
  }

export const typeInfo = ATTENDANCE_TYPES.find((at) => at.value === a.type);
