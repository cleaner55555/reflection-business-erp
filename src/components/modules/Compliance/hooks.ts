import { useState, useEffect, useCallback, useMemo } from 'react'

export function useCompliance() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [ncList, setNcList] = useState<NonConformance[]>([])
  const [capaList, setCapaList] = useState<CAPA[]>([])
  const [risks, setRisks] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Sve')
  const [deptFilter, setDeptFilter] = useState('Svi')

  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'requirement' | 'nc' | 'capa' | 'risk'>('requirement')
  const [selectedItem, setSelectedItem] = useState<Requirement | Audit | NonConformance | CAPA | RiskAssessment | null>(null)

  const emptyReqForm = { title: '', regulation: '', category: 'ISO 9001', priority: 'medium', owner: OWNERS[0], department: DEPARTMENTS[1], dueDate: '', description: '', evidence: '', notes: '' }
  const emptyNcForm = { title: '', type: 'product', severity: 'minor', source: 'Interna kontrola', department: DEPARTMENTS[1], detectedBy: OWNERS[0], description: '', rootCause: '', correctiveAction: '', responsible: OWNERS[0], dueDate: '' }
  const emptyCapaForm = { title: '', type: 'corrective', priority: 'medium', department: DEPARTMENTS[1], owner: OWNERS[0], description: '', rootCause: '', actionPlan: '', dueDate: '' }
  const emptyRiskForm = { title: '', category: 'Operativno', department: DEPARTMENTS[1], owner: OWNERS[0], likelihood: 3, impact: 3, existingControls: '', mitigationPlan: '', reviewDate: '' }

  const [reqForm, setReqForm] = useState(emptyReqForm)
  const [ncForm, setNcForm] = useState(emptyNcForm)
  const [capaForm, setCapaForm] = useState(emptyCapaForm)
  const [riskForm, setRiskForm] = useState(emptyRiskForm)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/compliance?companyId=${activeCompanyId}`)
      if (res.ok) {
        const d = await res.json()
        setRequirements(d.requirements?.length ? d.requirements : mockRequirements)
        setAudits(d.audits?.length ? d.audits : mockAudits)
        setNcList(d.nonConformances?.length ? d.nonConformances : mockNC)
        setCapaList(d.capa?.length ? d.capa : mockCAPA)
        setRisks(d.risks?.length ? d.risks : mockRisks)
        setStats(d.stats || mockStats)
      } else {
        setRequirements(mockRequirements)
        setAudits(mockAudits)
        setNcList(mockNC)
        setCapaList(mockCAPA)
        setRisks(mockRisks)
        setStats(mockStats)
      }
    } catch {
      setRequirements(mockRequirements)
      setAudits(mockAudits)
      setNcList(mockNC)
      setCapaList(mockCAPA)
      setRisks(mockRisks)
      setStats(mockStats)
    }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      let body: Record<string, unknown> = {}
      let endpoint = '/api/compliance'
      if (createType === 'requirement') {
        if (!reqForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'requirement', ...reqForm }
        endpoint = '/api/compliance/requirements'
      } else if (createType === 'nc') {
        if (!ncForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'nc', ...ncForm }
        endpoint = '/api/compliance/nonconformances'
      } else if (createType === 'capa') {
        if (!capaForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'capa', ...capaForm }
        endpoint = '/api/compliance/capa'
      } else {
        if (!riskForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'risk', ...riskForm, riskScore: riskForm.likelihood * riskForm.impact }
        endpoint = '/api/compliance/risks'
      }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setCreateOpen(false); loadData(); toast.success('Zapis kreiran') }
    } catch { /* silent */ }
  }

  const handleStatusChange = async (type: string, id: string, newStatus: string) => {
    try {
      await fetch('/api/compliance', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, status: newStatus }) })
      loadData()
      toast.success('Status ažuriran')
    } catch { /* silent */ }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Obrisati ovaj zapis?')) return
    try {
      await fetch(`/api/compliance?type=${type}&id=${id}`, { method: 'DELETE' })
      loadData()
    } catch { /* silent */ }
  }

  const openCreate = (type: 'requirement' | 'nc' | 'capa' | 'risk') => {
    setCreateType(type)
    setCreateOpen(true)
  }

  const openDetail = (item: Requirement | Audit | NonConformance | CAPA | RiskAssessment) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  return {
    activeTab,
    audits,
    c,
    capaList,
    categoryFilter,
    createOpen,
    d,
    deptFilter,
    detailOpen,
    handleCreate,
    isOverdue,
    loadData,
    loading,
    lv,
    ncList,
    o,
    requirements,
    risks,
    rlv,
    sc,
    search,
    selectedItem,
    setActiveTab,
    setCategoryFilter,
    setCreateOpen,
    setDeptFilter,
    setDetailOpen,
    sev,
    st,
  }
}
