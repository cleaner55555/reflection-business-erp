export const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3.5 w-3.5" /> },
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3.5 w-3.5" /> },
  in_review: { label: 'U pregledu', color: 'bg-blue-100 text-blue-700', icon: <Eye className="h-3.5 w-3.5" /> },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Otkazano', color: 'bg-gray-200 text-gray-600', icon: <XCircle className="h-3.5 w-3.5" /> },
  returned: { label: 'Vraćeno na dopunu', color: 'bg-orange-100 text-orange-700', icon: <ArrowRight className="h-3.5 w-3.5" /> },
}

export const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  vacation: { label: 'Godišnji odmor', color: 'bg-emerald-50 text-emerald-700', icon: '🏖️' },
  expense: { label: 'Troškovi', color: 'bg-amber-50 text-amber-700', icon: '💰' },
  purchase: { label: 'Nabavka', color: 'bg-blue-50 text-blue-700', icon: '📦' },
  travel: { label: 'Putovanje', color: 'bg-purple-50 text-purple-700', icon: '✈️' },
  overtime: { label: 'Prekovremeni rad', color: 'bg-red-50 text-red-700', icon: '⏰' },
  equipment: { label: 'Oprema', color: 'bg-cyan-50 text-cyan-700', icon: '🖥️' },
  training: { label: 'Edukacija', color: 'bg-indigo-50 text-indigo-700', icon: '📚' },
  other: { label: 'Ostalo', color: 'bg-gray-50 text-gray-700', icon: '📋' },
}

export const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-400' },
  urgent: { label: 'Hitno', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-400' },
}

export const mockRequests: ApprovalRequest[] = [
  {
    id: 'apr-1', title: 'Godišnji odmor - Jul 2025', description: 'Zahtev za godišnji odmor u periodu od 1-15. jula 2025. godine. Potrebno je osigurati zamenu za projekat ABC.',
    type: 'vacation', priority: 'medium', status: 'pending', requestedBy: 'Marko Petrović', requestedByRole: 'Senior Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', startDate: '2025-07-01', endDate: '2025-07-15',
    comments: [
      { id: 'c1', author: 'Ana Nikolić', content: 'Potrebno je proveriti raspored projekta pre odobrenja.', createdAt: '2025-01-18T10:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Marko Petrović', timestamp: '2025-01-17T09:00:00' },
      { action: 'Dodeljen', performedBy: 'Sistem', timestamp: '2025-01-17T09:00:01', note: 'Auto-dodela prema hijerarhiji' },
    ],
    createdAt: '2025-01-17T09:00:00', updatedAt: '2025-01-18T10:00:00',
  },
  {
    id: 'apr-2', title: 'Nabavka monitora za developere', description: 'Potrebno je nabaviti 4 monitora 27" 4K za developere u timu. Procenjena vrednost: 1.200 EUR.',
    type: 'purchase', priority: 'high', status: 'in_review', requestedBy: 'Jelena Stanković', requestedByRole: 'Engineering Manager',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO', amount: 1200, currency: 'EUR',
    comments: [
      { id: 'c2', author: 'Petar Jovanović', content: 'Da li smo proverili alternative iz offline prodaje?', createdAt: '2025-01-18T14:00:00' },
      { id: 'c3', author: 'Jelena Stanković', content: 'Da, provjereno - online je 15% jeftinije.', createdAt: '2025-01-18T14:30:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Jelena Stanković', timestamp: '2025-01-16T11:00:00' },
      { action: 'Prebačen u pregled', performedBy: 'Petar Jovanović', timestamp: '2025-01-17T10:00:00' },
    ],
    createdAt: '2025-01-16T11:00:00', updatedAt: '2025-01-18T14:30:00',
  },
  {
    id: 'apr-3', title: 'Putovanje - TechConf 2025 Berlin', description: 'Poslovno putovanje na konferenciju TechConf u Berlinu. Avionska karta, hotel i per diem.',
    type: 'travel', priority: 'medium', status: 'approved', requestedBy: 'Ivan Đorđević', requestedByRole: 'Frontend Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', amount: 850, currency: 'EUR',
    startDate: '2025-03-15', endDate: '2025-03-19',
    comments: [
      { id: 'c4', author: 'Ana Nikolić', content: 'Odobreno. Pripremi troškovnik po povratku.', createdAt: '2025-01-15T16:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Ivan Đorđević', timestamp: '2025-01-14T09:00:00' },
      { action: 'Odobreno', performedBy: 'Ana Nikolić', timestamp: '2025-01-15T16:00:00', note: 'U okviru budžeta za edukaciju' },
    ],
    createdAt: '2025-01-14T09:00:00', updatedAt: '2025-01-15T16:00:00', approvedAt: '2025-01-15T16:00:00',
  },
  {
    id: 'apr-4', title: 'Troškovi - reprezentacija januara', description: 'Troškovi za ručak sa klijentom ABC d.o.o. i večeru sa partnerima.',
    type: 'expense', priority: 'low', status: 'approved', requestedBy: 'Marko Petrović', requestedByRole: 'Senior Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', amount: 12500, currency: 'RSD',
    comments: [],
    history: [
      { action: 'Kreiran', performedBy: 'Marko Petrović', timestamp: '2025-01-10T08:00:00' },
      { action: 'Odobreno', performedBy: 'Ana Nikolić', timestamp: '2025-01-11T09:00:00' },
    ],
    createdAt: '2025-01-10T08:00:00', updatedAt: '2025-01-11T09:00:00', approvedAt: '2025-01-11T09:00:00',
  },
  {
    id: 'apr-5', title: 'Edukacija - AWS Solutions Architect', description: 'Zahtev za finansiranje sertifikacionog ispita AWS Solutions Architect. Ispit košta 300 USD.',
    type: 'training', priority: 'medium', status: 'rejected', requestedBy: 'Nikola Ilić', requestedByRole: 'DevOps Engineer',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO', amount: 300, currency: 'USD',
    comments: [
      { id: 'c5', author: 'Petar Jovanović', content: 'Odbijeno za ovaj kvartal. Razmotrićemo u Q2.', createdAt: '2025-01-16T11:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Nikola Ilić', timestamp: '2025-01-15T10:00:00' },
      { action: 'Odbijeno', performedBy: 'Petar Jovanović', timestamp: '2025-01-16T11:00:00', note: 'Nema budžeta za Q1' },
    ],
    createdAt: '2025-01-15T10:00:00', updatedAt: '2025-01-16T11:00:00', rejectedAt: '2025-01-16T11:00:00',
  },
  {
    id: 'apr-6', title: 'Prekovremeni rad - mart 2025', description: 'Prekovremeni rad na hitnom projektu za klijenta XYZ. Ukupno 12 sati prekovremenog rada.',
    type: 'overtime', priority: 'urgent', status: 'pending', requestedBy: 'Jelena Stanković', requestedByRole: 'Engineering Manager',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO',
    comments: [],
    history: [
      { action: 'Kreiran', performedBy: 'Jelena Stanković', timestamp: '2025-01-18T16:00:00' },
    ],
    createdAt: '2025-01-18T16:00:00', updatedAt: '2025-01-18T16:00:00',
  },
]

export const mockTemplates: ApprovalTemplate[] = [
  { id: 'tpl-1', name: 'Godišnji odmor', description: 'Standardni zahtev za godišnji odmor zaposlenog', type: 'vacation', requiredFields: ['startDate', 'endDate', 'description'], approverRole: 'Team Lead', isActive: true, usageCount: 45 },
  { id: 'tpl-2', name: 'Troškovi', description: 'Zahtev za refundaciju poslovnih troškova', type: 'expense', requiredFields: ['amount', 'currency', 'description'], approverRole: 'Team Lead', isActive: true, usageCount: 128 },
  { id: 'tpl-3', name: 'Nabavka', description: 'Zahtev za nabavku opreme ili materijala', type: 'purchase', requiredFields: ['amount', 'currency', 'description'], approverRole: 'CTO', isActive: true, usageCount: 32 },
  { id: 'tpl-4', name: 'Putovanje', description: 'Zahtev za poslovno putovanje', type: 'travel', requiredFields: ['startDate', 'endDate', 'amount', 'currency'], approverRole: 'Team Lead', isActive: true, usageCount: 18 },
  { id: 'tpl-5', name: 'Edukacija', description: 'Zahtev za sertifikaciju ili kurs', type: 'training', requiredFields: ['amount', 'currency', 'description'], approverRole: 'CTO', isActive: true, usageCount: 22 },
  { id: 'tpl-6', name: 'Prekovremeni rad', description: 'Prijavljivanje prekovremenog rada', type: 'overtime', requiredFields: ['description'], approverRole: 'Engineering Manager', isActive: false, usageCount: 8 },
]

export const mockDashboard: ApprovalDashboard = {
  totalRequests: 156,
  pendingRequests: 23,
  approvedRequests: 112,
  rejectedRequests: 14,
  avgResponseHours: 18.5,
  myPendingCount: 5,
  urgentPendingCount: 3,
  requestsByType: [
    { type: 'vacation', count: 45, label: 'Godišnji odmor' },
    { type: 'expense', count: 48, label: 'Troškovi' },
    { type: 'purchase', count: 22, label: 'Nabavka' },
    { type: 'travel', count: 15, label: 'Putovanje' },
    { type: 'training', count: 12, label: 'Edukacija' },
    { type: 'overtime', count: 8, label: 'Prekovremeni' },
    { type: 'equipment', count: 6, label: 'Oprema' },
  ],
  requestsByPriority: [
    { priority: 'low', count: 35 },
    { priority: 'medium', count: 78 },
    { priority: 'high', count: 33 },
    { priority: 'urgent', count: 10 },
  ],
  recentRequests: mockRequests.slice(0, 3),
  monthlyTrend: [
    { month: 'Avg', approved: 12, rejected: 2 },
    { month: 'Sep', approved: 15, rejected: 1 },
    { month: 'Okt', approved: 18, rejected: 3 },
    { month: 'Nov', approved: 14, rejected: 2 },
    { month: 'Dec', approved: 10, rejected: 1 },
    { month: 'Jan', approved: 8, rejected: 2 },
  ],
}

export const formatCurrency = (val: number, currency: string = 'RSD') => {
  if (currency === 'EUR') return `€${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}`
  if (currency === 'USD') return `$${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}`
  return `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    title: '', description: '', type: 'vacation', priority: 'medium',
    requestedBy: '', assignedTo: '', amount: '', currency: 'RSD',
    startDate: '', endDate: '',
  }

export const res = await fetch(`/api/approvals?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const res = await fetch(`/api/approvals/dashboard?companyId=${activeCompanyId}`);

export const data = await res.json();

export const filteredRequests = requests.filter((r) => {
    if (activeTab === 'my_requests' && r.requestedBy !== 'Marko Petrović') return false
    if (activeTab === 'pending' && r.status !== 'pending' && r.status !== 'in_review') return false
    if (activeTab === 'approved' && r.status !== 'approved') return false
    if (activeTab === 'rejected' && r.status !== 'rejected') return false
    if (search) {
      const s = search.toLowerCase()
      if (!r.title.toLowerCase().includes(s) && !r.description.toLowerCase().includes(s) && !r.requestedBy.toLowerCase().includes(s)) return false
    }
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false
    return true
  });

export const handleCreate = async () => {
    if (!activeCompanyId || !form.title.trim()) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          amount: form.amount ? parseFloat(form.amount) : undefined,
          status: 'pending',
          comments: [],
          history: [{ action: 'Kreiran', performedBy: form.requestedBy || 'Trenutni korisnik', timestamp: new Date().toISOString() }],
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm(emptyForm)
        loadRequests()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const handleApprove = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'approved',
          approvedAt: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

export const handleReject = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectNote: rejectNote,
        }),
      })
      if (res.ok) {
        setRejectDialogOpen(false)
        setRejectNote('')
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

export const handleReturn = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: 'returned' }),
      })
      if (res.ok) {
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za odobrenje?')) return
    try {
      const res = await fetch(`/api/approvals?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadRequests()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

export const handleAddComment = async () => {
    if (!selected || !commentInput.trim()) return
    const newComment: ApprovalComment = {
      id: `c-${Date.now()}`,
      author: 'Trenutni korisnik',
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
    }
    setSelected({
      ...selected,
      comments: [...selected.comments, newComment],
    })
    setCommentInput('')
    try {
      await fetch('/api/approvals/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selected.id, ...newComment }),
      })
    } catch { /* silent */ }
  }

export const cfg = typeConfig[tp.type]

export const maxCount = Math.max(...dashboard.requestsByType.map((r) => r.count));

export const cfg = priorityConfig[pr.priority]

export const maxCount = Math.max(...dashboard.requestsByPriority.map((r) => r.count));

export const maxVal = Math.max(...dashboard.monthlyTrend.map((t) => Math.max(t.approved, t.rejected)));

export const sCfg = statusConfig[r.status]

export const tCfg = typeConfig[r.type]

export const sCfg = statusConfig[r.status]

export const tCfg = typeConfig[r.type]

export const pCfg = priorityConfig[r.priority]

export const tCfg = typeConfig[tpl.type]
