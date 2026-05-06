import { useState, useEffect, useCallback, useMemo } from 'react'

export function useContracts() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [renewals, setRenewals] = useState<ContractRenewal[]>([])
  const [dashboard, setDashboard] = useState<ContractDashboard | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Contract | null>(null)

  // Forms
  const emptyForm = {
    employeeName: '', department: '', position: '', type: 'indefinite', status: 'active',
    startDate: '', endDate: '', probationEndDate: '', salaryGross: '', salaryNet: '',
    workHours: 40, workLocation: '', contractNumber: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  const emptyRenewalForm = {
    contractId: '', employeeName: '', newStartDate: '', newEndDate: '', notes: '',
  }
  const [renewalForm, setRenewalForm] = useState(emptyRenewalForm)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadContracts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contracts?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setContracts(data.items?.length ? data.items : mockContracts)
      } else {
        setContracts(mockContracts)
      }
    } catch {
      setContracts(mockContracts)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadRenewals = useCallback(async () => {
    try {
      setRenewals(mockRenewals)
    } catch {
      setRenewals(mockRenewals)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/contracts/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        setDashboard(mockDashboard)
      }
    } catch {
      setDashboard(mockDashboard)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadContracts()
    loadRenewals()
    loadDashboard()
  }, [activeCompanyId, loadContracts, loadRenewals, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredContracts = contracts.filter((c) => {
    if (search) {
      const s = search.toLowerCase()
      if (!c.employeeName.toLowerCase().includes(s) && !c.position.toLowerCase().includes(s) && !c.department.toLowerCase().includes(s) && !c.contractNumber.toLowerCase().includes(s)) return false
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    return true
  })

  const daysUntilExpiry = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ugovor?')) return
    try {
      const res = await fetch(`/api/contracts?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadContracts(); loadDashboard() }
    } catch { /* silent */ }
  }

  const handleRenewalCreate = async () => {
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

  const openRenewal = (contract: Contract) => {
    setRenewalForm({
      contractId: contract.id,
      employeeName: contract.employeeName,
      newStartDate: contract.endDate || '',
      newEndDate: '',
      notes: '',
    })
    setRenewalDialogOpen(true)
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return {
    activeTab,
    contractTypes,
    contracts,
    detailOpen,
    dialogOpen,
    filteredContracts,
    handleCreate,
    handleRenewalCreate,
    k,
    loading,
    renewalDialogOpen,
    renewals,
    sCfg,
    search,
    selected,
    setActiveTab,
    setDetailOpen,
    setDialogOpen,
    setRenewalDialogOpen,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    tCfg,
    typeFilter,
  }
}
