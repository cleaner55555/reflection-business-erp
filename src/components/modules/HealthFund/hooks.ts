import { useState, useEffect, useCallback, useMemo } from 'react'

export function useHealthFund() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<FundStats | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [claims, setClaims] = useState<HealthClaim[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [claimStatusFilter, setClaimStatusFilter] = useState('all')

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'contribution' | 'claim'>('contribution')
  const [selectedItem, setSelectedItem] = useState<Contribution | HealthClaim | null>(null)

  // Forms
  const emptyContribForm = {
    employeeName: '', baseAmount: '', month: 'januar', year: '2025',
    employerRate: '13.5', employeeRate: '7.7',
  }
  const emptyClaimForm = {
    employeeName: '', amount: '', serviceType: 'Opšta praksa',
    diagnosisCode: '', diagnosisName: '', providerName: '',
    serviceDate: '', notes: '',
  }
  const [contribForm, setContribForm] = useState(emptyContribForm)
  const [claimForm, setClaimForm] = useState(emptyClaimForm)

  // Load data
  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/health-fund?companyId=${activeCompanyId}`)
      if (res.ok) {
        const d = await res.json()
        setContributions(d.contributions?.length ? d.contributions : mockContributions)
        setClaims(d.claims?.length ? d.claims : mockClaims)
        setStats(d.stats || mockStats)
      } else {
        setContributions(mockContributions)
        setClaims(mockClaims)
        setStats(mockStats)
      }
    } catch {
      setContributions(mockContributions)
      setClaims(mockClaims)
      setStats(mockStats)
    }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // Create handlers
  const openCreate = (type: 'contribution' | 'claim') => {
    setCreateType(type)
    if (type === 'contribution') setContribForm(emptyContribForm)
    else setClaimForm(emptyClaimForm)
    setCreateOpen(true)
  }

  const handleCreateContribution = async () => {
    if (!contribForm.employeeName.trim() || !contribForm.baseAmount) return
    const base = parseFloat(contribForm.baseAmount) || 0
    const er = parseFloat(contribForm.employerRate) || 13.5
    const ee = parseFloat(contribForm.employeeRate) || 7.7
    const newContrib: Contribution = {
      id: `d-${Date.now()}`, employeeId: `e-${Date.now()}`,
      employeeName: contribForm.employeeName,
      month: contribForm.month, year: parseInt(contribForm.year) || 2025,
      baseAmount: base, employerShare: Math.round(base * er / 100),
      employeeShare: Math.round(base * ee / 100),
      totalAmount: Math.round(base * (er + ee) / 100),
      status: 'pending', paymentDate: null,
      dueDate: `2025-01-31`, createdAt: new Date().toISOString(),
    }
    setContributions(prev => [newContrib, ...prev])
    setCreateOpen(false)
    toast.success('Doprinos kreiran')
  }

  const handleCreateClaim = async () => {
    if (!claimForm.employeeName.trim() || !claimForm.amount || !claimForm.diagnosisCode.trim()) return
    const newClaim: HealthClaim = {
      id: `z-${Date.now()}`, employeeId: `e-${Date.now()}`,
      employeeName: claimForm.employeeName,
      claimNumber: `FZ-2025-${String(claims.length + 1).padStart(4, '0')}`,
      status: 'submitted', amount: parseFloat(claimForm.amount) || 0,
      approvedAmount: null, serviceType: claimForm.serviceType,
      diagnosisCode: claimForm.diagnosisCode,
      diagnosisName: claimForm.diagnosisName || 'Nepoznato',
      providerName: claimForm.providerName,
      serviceDate: claimForm.serviceDate || new Date().toISOString().split('T')[0],
      submittedDate: new Date().toISOString().split('T')[0],
      processedDate: null, notes: claimForm.notes,
    }
    setClaims(prev => [newClaim, ...prev])
    setCreateOpen(false)
    toast.success('Zahtev podnet')
  }

  // Filter helpers
  const filteredContributions = contributions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return c.employeeName.toLowerCase().includes(s) || c.month.toLowerCase().includes(s)
    }
    return true
  })

  const filteredClaims = claims.filter(cl => {
    if (claimStatusFilter !== 'all' && cl.status !== claimStatusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return cl.employeeName.toLowerCase().includes(s) || cl.claimNumber.toLowerCase().includes(s) || cl.diagnosisCode.toLowerCase().includes(s)
    }
    return true
  })

  // Summary helpers
  const contribSummary = {
    total: contributions.reduce((a, c) => a + c.totalAmount, 0),
    paid: contributions.filter(c => c.status === 'paid').reduce((a, c) => a + c.totalAmount, 0),
    pending: contributions.filter(c => c.status === 'pending').reduce((a, c) => a + c.totalAmount, 0),
    rejected: contributions.filter(c => c.status === 'rejected').reduce((a, c) => a + c.totalAmount, 0),
  }

  const claimSummary = {
    total: claims.reduce((a, c) => a + c.amount, 0),
    approved: claims.filter(c => c.status === 'approved' || c.status === 'paid').reduce((a, c) => a + (c.approvedAmount || 0), 0),
    pending: claims.filter(c => c.status === 'submitted').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  }

  return {
    activeTab,
    claimStatusFilter,
    claims,
    createOpen,
    detailOpen,
    filteredClaims,
    filteredContributions,
    loadData,
    m,
    search,
    selectedItem,
    setActiveTab,
    setClaimStatusFilter,
    setCreateOpen,
    setDetailOpen,
    setStatusFilter,
    st,
    statusFilter,
    util,
  }
}
