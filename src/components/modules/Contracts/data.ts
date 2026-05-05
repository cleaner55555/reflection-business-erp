export const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3.5 w-3.5" /> },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pre_expiring: { label: 'Pred-istekao', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  expired: { label: 'Istekao', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  terminated: { label: 'Raskinut', color: 'bg-gray-200 text-gray-600', icon: <XCircle className="h-3.5 w-3.5" /> },
  renewed: { label: 'Obnovljen', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-3.5 w-3.5" /> },
}

export const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  indefinite: { label: 'Neodređeno vreme', color: 'bg-green-50 text-green-700', icon: '📋' },
  definite: { label: 'Određeno vreme', color: 'bg-blue-50 text-blue-700', icon: '📅' },
  internship: { label: 'Stručna praksa', color: 'bg-purple-50 text-purple-700', icon: '🎓' },
  part_time: { label: 'Part-time', color: 'bg-orange-50 text-orange-700', icon: '⏱️' },
  consulting: { label: 'Konsalting', color: 'bg-cyan-50 text-cyan-700', icon: '💼' },
  temporary: { label: 'Privremen', color: 'bg-gray-50 text-gray-700', icon: '🔄' },
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const contractTypes: ContractType[] = [
  { id: 'indefinite', name: 'Neodređeno vreme', description: 'Ugovor na neodređeno vreme - standardni zaposlen', defaultDuration: 'Bez rokova', color: '#22c55e', contractCount: 18 },
  { id: 'definite', name: 'Određeno vreme', description: 'Ugovor na određeno vreme sa datumom isteka', defaultDuration: '6-12 meseci', color: '#3b82f6', contractCount: 8 },
  { id: 'internship', name: 'Stručna praksa', description: 'Ugovor o stručnoj praksi za studente', defaultDuration: '3-6 meseci', color: '#a855f7', contractCount: 4 },
  { id: 'part_time', name: 'Part-time', description: 'Ugovor sa nepunim radnim vremenom', defaultDuration: 'Prema dogovoru', color: '#f97316', contractCount: 3 },
  { id: 'consulting', name: 'Konsalting', description: 'Ugovor o konsaltingu', defaultDuration: 'Po projektu', color: '#06b6d4', contractCount: 2 },
  { id: 'temporary', name: 'Privremeni', description: 'Privremeni ugovor za zamenu ili sezonski rad', defaultDuration: '1-3 meseca', color: '#6b7280', contractCount: 2 },
]

export const mockContracts: Contract[] = [
  {
    id: 'ct-1', employeeId: 'emp-1', employeeName: 'Marko Petrović', department: 'Razvoj', position: 'Senior Developer',
    type: 'indefinite', status: 'active', startDate: '2022-03-01',
    salaryGross: 250000, salaryNet: 175000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2022-001', probationEndDate: '2022-06-01',
    documents: [
      { id: 'doc-1', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2022-03-01', uploadedBy: 'HR' },
      { id: 'doc-2', name: 'Aneks - povećanje plata.pdf', type: 'pdf', size: '0.8 MB', uploadedAt: '2023-07-01', uploadedBy: 'HR' },
    ],
    createdAt: '2022-03-01', updatedAt: '2025-01-10',
  },
  {
    id: 'ct-2', employeeId: 'emp-2', employeeName: 'Ana Nikolić', department: 'Razvoj', position: 'Team Lead',
    type: 'indefinite', status: 'active', startDate: '2021-06-15',
    salaryGross: 320000, salaryNet: 220000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2021-005',
    documents: [{ id: 'doc-3', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.1 MB', uploadedAt: '2021-06-15', uploadedBy: 'HR' }],
    createdAt: '2021-06-15', updatedAt: '2025-01-08',
  },
  {
    id: 'ct-3', employeeId: 'emp-3', employeeName: 'Jelena Stanković', department: 'Razvoj', position: 'Engineering Manager',
    type: 'indefinite', status: 'active', startDate: '2020-01-10',
    salaryGross: 380000, salaryNet: 258000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2020-003',
    documents: [{ id: 'doc-4', name: 'Ugovor o radu.pdf', type: 'pdf', size: '2.3 MB', uploadedAt: '2020-01-10', uploadedBy: 'HR' }],
    createdAt: '2020-01-10', updatedAt: '2024-12-20',
  },
  {
    id: 'ct-4', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', department: 'Dizajn', position: 'UI/UX Designer',
    type: 'definite', status: 'pre_expiring', startDate: '2024-03-01', endDate: '2025-02-28',
    salaryGross: 180000, salaryNet: 128000, currency: 'RSD', workHours: 40, workLocation: 'Novi Sad',
    contractNumber: 'UG-2024-012', probationEndDate: '2024-05-01',
    notes: 'Ugovor ističe krajem februara. Potrebna obnova.',
    documents: [{ id: 'doc-5', name: 'Ugovor o radu na određeno vreme.pdf', type: 'pdf', size: '1.9 MB', uploadedAt: '2024-03-01', uploadedBy: 'HR' }],
    createdAt: '2024-03-01', updatedAt: '2025-01-15',
  },
  {
    id: 'ct-5', employeeId: 'emp-7', employeeName: 'Milena Radovanović', department: 'Marketing', position: 'Marketing praktičar',
    type: 'internship', status: 'active', startDate: '2025-01-06', endDate: '2025-06-06',
    salaryGross: 45000, salaryNet: 38000, currency: 'RSD', workHours: 20, workLocation: 'Beograd',
    contractNumber: 'UG-2025-001', probationEndDate: '2025-02-06',
    documents: [{ id: 'doc-6', name: 'Ugovor o stručnoj praksi.pdf', type: 'pdf', size: '1.5 MB', uploadedAt: '2025-01-06', uploadedBy: 'HR' }],
    createdAt: '2025-01-06', updatedAt: '2025-01-06',
  },
  {
    id: 'ct-6', employeeId: 'emp-8', employeeName: 'Lazar Matić', department: 'Razvoj', position: 'Junior Developer',
    type: 'definite', status: 'expired', startDate: '2024-01-15', endDate: '2024-12-31',
    salaryGross: 120000, salaryNet: 88000, currency: 'RSD', workHours: 40, workLocation: 'Beograd',
    contractNumber: 'UG-2024-002',
    notes: 'Ugovor istekao. Kandidat nije produžen.',
    documents: [{ id: 'doc-7', name: 'Ugovor o radu na određeno vreme.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '2024-01-15', uploadedBy: 'HR' }],
    createdAt: '2024-01-15', updatedAt: '2024-12-31',
  },
  {
    id: 'ct-7', employeeId: 'emp-9', employeeName: 'Sanja Vuković', department: 'Admin', position: 'Administrativni radnik',
    type: 'part_time', status: 'active', startDate: '2023-09-01',
    salaryGross: 65000, salaryNet: 48000, currency: 'RSD', workHours: 20, workLocation: 'Beograd',
    contractNumber: 'UG-2023-018',
    documents: [{ id: 'doc-8', name: 'Ugovor o radu - part time.pdf', type: 'pdf', size: '1.6 MB', uploadedAt: '2023-09-01', uploadedBy: 'HR' }],
    createdAt: '2023-09-01', updatedAt: '2025-01-05',
  },
  {
    id: 'ct-8', employeeId: 'emp-10', employeeName: 'Dragan Stojanović', department: 'Finansije', position: 'Konsultant',
    type: 'consulting', status: 'active', startDate: '2024-06-01', endDate: '2025-05-31',
    salaryGross: 200000, salaryNet: 140000, currency: 'RSD', workHours: 30, workLocation: 'Remote',
    contractNumber: 'UG-2024-025',
    notes: 'Konsalting za finansijske procese.',
    documents: [{ id: 'doc-9', name: 'Ugovor o konsaltingu.pdf', type: 'pdf', size: '2.0 MB', uploadedAt: '2024-06-01', uploadedBy: 'HR' }],
    createdAt: '2024-06-01', updatedAt: '2025-01-12',
  },
]

export const mockRenewals: ContractRenewal[] = [
  { id: 'rn-1', contractId: 'ct-4', employeeName: 'Ivan Đorđević', oldEndDate: '2025-02-28', newStartDate: '2025-03-01', newEndDate: '2026-02-28', status: 'pending', requestedDate: '2025-01-15', notes: 'Preporučena obnova na neodređeno vreme' },
  { id: 'rn-2', contractId: 'ct-8', employeeName: 'Dragan Stojanović', oldEndDate: '2025-05-31', newStartDate: '2025-06-01', newEndDate: '2026-05-31', status: 'approved', requestedDate: '2025-01-10', notes: 'Obnovljen na još godinu dana' },
]

export const mockDashboard: ContractDashboard = {
  activeContracts: 28,
  expiringSoon: 3,
  expiredContracts: 5,
  terminatedContracts: 2,
  totalEmployees: 35,
  avgSalary: 185000,
  totalPayroll: 6475000,
  byType: [
    { type: 'indefinite', count: 18, color: '#22c55e' },
    { type: 'definite', count: 8, color: '#3b82f6' },
    { type: 'internship', count: 4, color: '#a855f7' },
    { type: 'part_time', count: 3, color: '#f97316' },
    { type: 'consulting', count: 2, color: '#06b6d4' },
  ],
  expiringList: mockContracts.filter((c) => c.status === 'pre_expiring'),
  recentContracts: mockContracts.slice(0, 4),
  renewalsDue: 2,
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    employeeName: '', department: '', position: '', type: 'indefinite', status: 'active',
    startDate: '', endDate: '', probationEndDate: '', salaryGross: '', salaryNet: '',
    workHours: 40, workLocation: '', contractNumber: '', notes: '',
  }

export const emptyRenewalForm = {
    contractId: '', employeeName: '', newStartDate: '', newEndDate: '', notes: '',
  }

export const res = await fetch(`/api/contracts?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const res = await fetch(`/api/contracts/dashboard?companyId=${activeCompanyId}`);

export const data = await res.json();

export const filteredContracts = contracts.filter((c) => {
    if (search) {
      const s = search.toLowerCase()
      if (!c.employeeName.toLowerCase().includes(s) && !c.position.toLowerCase().includes(s) && !c.department.toLowerCase().includes(s) && !c.contractNumber.toLowerCase().includes(s)) return false
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    return true
  });

export const daysUntilExpiry = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

export const handleCreate = async () => {
    if (!activeCompanyId || !form.employeeName.trim()) return
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          salaryGross: parseFloat(form.salaryGross) || 0,
          salaryNet: parseFloat(form.salaryNet) || 0,
          documents: [],
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm(emptyForm)
        loadContracts()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ugovor?')) return
    try {
      const res = await fetch(`/api/contracts?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadContracts(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleRenewalCreate = async () => {
    if (!renewalForm.contractId) return
    const newRenewal: ContractRenewal = {
      id: `rn-${Date.now()}`,
      contractId: renewalForm.contractId,
      employeeName: renewalForm.employeeName,
      oldEndDate: contracts.find((c) => c.id === renewalForm.contractId)?.endDate || '',
      newStartDate: renewalForm.newStartDate,
      newEndDate: renewalForm.newEndDate,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0],
      notes: renewalForm.notes,
    }
    setRenewals([newRenewal, ...renewals])
    setRenewalDialogOpen(false)
    setRenewalForm(emptyRenewalForm)
  }

export const openRenewal = (contract: Contract) => {
    setRenewalForm({
      contractId: contract.id,
      employeeName: contract.employeeName,
      newStartDate: contract.endDate || '',
      newEndDate: '',
      notes: '',
    })
    setRenewalDialogOpen(true)
  }

export const tCfg = typeConfig[bt.type]

export const maxCount = Math.max(...dashboard.byType.map((b) => b.count));

export const days = c.endDate ? daysUntilExpiry(c.endDate) : 0;

export const sCfg = statusConfig[c.status]

export const tCfg = typeConfig[c.type]

export const sCfg = statusConfig[c.status]

export const tCfg = typeConfig[c.type]

export const days = c.endDate ? daysUntilExpiry(c.endDate) : 0;

export const progress = Math.max(0, Math.min(100, 100 - (days / 365) * 100));

export const tCfg = typeConfig[ct.id]

export const contract = contracts.find((c) => c.id === v);
