export const MOCK_PRS: PurchaseRequisition[] = [
  { id: 'pr1', prNumber: 'PR-2025-001', title: 'Kancelarijski materijal - Q1', description: 'Nabavka papira, tonera i potrošnog materijala za kancelariju', status: 'approved', priority: 'medium', requestedBy: 'Jelena Milić', department: 'Administracija', supplierId: 'sup1', supplierName: 'PaperMax d.o.o.', items: [{ name: 'A4 papir (500 listova)', quantity: 50, unitPrice: 450, unit: 'pak' }, { name: 'Toner HP 26A', quantity: 5, unitPrice: 5500, unit: 'kom' }], totalAmount: 50000, currency: 'RSD', requestedDate: '2025-01-15', requiredByDate: '2025-01-25', approvedBy: 'Marko Petrović', approvedAt: '2025-01-16T10:00:00Z', orderedAt: null, receivedAt: null, notes: 'Hitno za početak godine', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-01-16T10:00:00Z' },
  { id: 'pr2', prNumber: 'PR-2025-002', title: 'IT oprema - računari', description: 'Nabavka 10 laptopova za nove zaposlene', status: 'submitted', priority: 'high', requestedBy: 'Nikola Stanković', department: 'IT', supplierId: 'sup2', supplierName: 'TechPro Srbija', items: [{ name: 'Lenovo ThinkPad E14', quantity: 10, unitPrice: 95000, unit: 'kom' }], totalAmount: 950000, currency: 'RSD', requestedDate: '2025-01-18', requiredByDate: '2025-02-01', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Potrebno za nove radne pozicije', createdAt: '2025-01-18T09:00:00Z', updatedAt: '2025-01-18T09:00:00Z' },
  { id: 'pr3', prNumber: 'PR-2025-003', title: 'Sirovine za proizvodnju', description: 'Nabavka sirovina za proizvodni program u februaru', status: 'ordered', priority: 'urgent', requestedBy: 'Ana Jovanović', department: 'Proizvodnja', supplierId: 'sup3', supplierName: 'MetalIndustrija a.d.', items: [{ name: 'Čelične ploče 2mm', quantity: 200, unitPrice: 3500, unit: 'm²' }, { name: 'Aluminijumske profile', quantity: 500, unitPrice: 1200, unit: 'm' }], totalAmount: 1300000, currency: 'RSD', requestedDate: '2025-01-10', requiredByDate: '2025-01-28', approvedBy: 'Dragan Simić', approvedAt: '2025-01-11T14:00:00Z', orderedAt: '2025-01-12T09:00:00Z', receivedAt: null, notes: null, createdAt: '2025-01-10T07:00:00Z', updatedAt: '2025-01-12T09:00:00Z' },
  { id: 'pr4', prNumber: 'PR-2025-004', title: 'Čišćenje objekta', description: 'Mesečna usluga čišćenja za Februar', status: 'received', priority: 'low', requestedBy: 'Ivana Đorđević', department: 'Administracija', supplierId: 'sup4', supplierName: 'CleanServ d.o.o.', items: [{ name: 'Kompletno čišćenje objekta', quantity: 1, unitPrice: 85000, unit: 'mes' }], totalAmount: 85000, currency: 'RSD', requestedDate: '2025-01-05', requiredByDate: '2025-02-01', approvedBy: 'Marko Petrović', approvedAt: '2025-01-06T11:00:00Z', orderedAt: '2025-01-07T08:00:00Z', receivedAt: '2025-01-20T10:00:00Z', notes: 'Ugovor na godinu dana', createdAt: '2025-01-05T08:00:00Z', updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'pr5', prNumber: 'PR-2025-005', title: 'Gorivo za vozila', description: 'Mesečna potrošnja goriva za vozni park', status: 'draft', priority: 'medium', requestedBy: 'Stefan Nikolić', department: 'Logistika', supplierId: null, supplierName: null, items: [{ name: 'Dizel gorivo', quantity: 2000, unitPrice: 185, unit: 'l' }, { name: 'Benzin 95', quantity: 500, unitPrice: 210, unit: 'l' }], totalAmount: 475000, currency: 'RSD', requestedDate: new Date().toISOString().split('T')[0], requiredByDate: null, approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Standardna mesečna nabavka', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'pr6', prNumber: 'PR-2025-006', title: 'Sigurnosna oprema', description: 'Kupovina radnih odeća i zaštitne opreme', status: 'rejected', priority: 'high', requestedBy: 'Dragan Simić', department: 'Proizvodnja', supplierId: 'sup5', supplierName: 'SafetyGear d.o.o.', items: [{ name: 'Zaštitna kaciga', quantity: 20, unitPrice: 3500, unit: 'kom' }, { name: 'Radne rukavice (10 kom)', quantity: 50, unitPrice: 1200, unit: 'set' }, { name: 'Zaštitna odeća', quantity: 15, unitPrice: 8000, unit: 'kom' }], totalAmount: 245000, currency: 'RSD', requestedDate: '2025-01-12', requiredByDate: '2025-01-20', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: 'Odbijeno - ponovo podneti sa ispravljenim količinama', createdAt: '2025-01-12T10:00:00Z', updatedAt: '2025-01-14T15:00:00Z' },
  { id: 'pr7', prNumber: 'PR-2025-007', title: 'Servis klima uređaja', description: 'Godišnji servis i čišćenje klima uređaja', status: 'submitted', priority: 'low', requestedBy: 'Maja Popović', department: 'Administracija', supplierId: 'sup6', supplierName: 'KlimaServis Beograd', items: [{ name: 'Servis klima uređaja (12 kom)', quantity: 12, unitPrice: 5000, unit: 'kom' }], totalAmount: 60000, currency: 'RSD', requestedDate: '2025-01-20', requiredByDate: '2025-03-01', approvedBy: null, approvedAt: null, orderedAt: null, receivedAt: null, notes: null, createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-01-20T08:00:00Z' },
  { id: 'pr8', prNumber: 'PR-2025-008', title: 'Pakovanje i etikete', description: 'Nabavka kartonskih kutija i etiketa za proizvode', status: 'approved', priority: 'medium', requestedBy: 'Ana Jovanović', department: 'Proizvodnja', supplierId: 'sup7', supplierName: 'PackPro d.o.o.', items: [{ name: 'Kartonska kutija M', quantity: 5000, unitPrice: 85, unit: 'kom' }, { name: 'Lepak za etikete', quantity: 100, unitPrice: 450, unit: 'rol' }], totalAmount: 467500, currency: 'RSD', requestedDate: '2025-01-19', requiredByDate: '2025-02-05', approvedBy: 'Dragan Simić', approvedAt: '2025-01-20T11:00:00Z', orderedAt: null, receivedAt: null, notes: null, createdAt: '2025-01-19T09:00:00Z', updatedAt: '2025-01-20T11:00:00Z' },
]

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'PaperMax d.o.o.', code: 'SUP-001', category: 'Kancelarijski materijal', contactPerson: 'Milan Rakić', email: 'info@papermax.rs', phone: '+381113456789', address: 'Industrijska zona 12', city: 'Novi Sad', country: 'Srbija', website: 'www.papermax.rs', rating: 4.5, leadTime: 3, onTimeRate: 95, totalOrders: 48, totalValue: 2350000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-1234567890123-78', notes: 'Pouzdan dobavljač, sporazumno produženje roka', performanceScore: 92, createdAt: '2023-01-10T10:00:00Z' },
  { id: 'sup2', name: 'TechPro Srbija', code: 'SUP-002', category: 'IT oprema', contactPerson: 'Nebojša Perić', email: 'sales@techpro.rs', phone: '+381112345678', address: 'Bulevar Mihajla Pupina 10a', city: 'Beograd', country: 'Srbija', website: 'www.techpro.rs', rating: 4.2, leadTime: 7, onTimeRate: 88, totalOrders: 22, totalValue: 5800000, status: 'active', paymentTerms: '15 dana neto', bankAccount: '265-9876543210987-65', notes: 'Autorizovani Lenovo partner', performanceScore: 85, createdAt: '2023-03-15T10:00:00Z' },
  { id: 'sup3', name: 'MetalIndustrija a.d.', code: 'SUP-003', category: 'Sirovine', contactPerson: 'Slobodan Jović', email: 'komercijala@metalind.rs', phone: '+381114567890', address: 'Industrijska 45', city: 'Smederevo', country: 'Srbija', website: 'www.metalind.rs', rating: 4.8, leadTime: 10, onTimeRate: 97, totalOrders: 36, totalValue: 15200000, status: 'active', paymentTerms: '45 dana neto', bankAccount: '265-5556667778889-12', notes: 'Strategijski partner za sirovine', performanceScore: 96, createdAt: '2022-06-01T10:00:00Z' },
  { id: 'sup4', name: 'CleanServ d.o.o.', code: 'SUP-004', category: 'Usluge', contactPerson: 'Tamara Gligorijević', email: 'office@cleanserv.rs', phone: '+381115678901', address: 'Vojvode Mišića 22', city: 'Beograd', country: 'Srbija', website: null, rating: 4.0, leadTime: 1, onTimeRate: 100, totalOrders: 12, totalValue: 1020000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-1112223334445-56', notes: 'Ugovor na godinu dana - autoreno', performanceScore: 98, createdAt: '2024-01-05T10:00:00Z' },
  { id: 'sup5', name: 'SafetyGear d.o.o.', code: 'SUP-005', category: 'Radna zaštita', contactPerson: 'Zoran Marković', email: 'prodaja@safetygear.rs', phone: '+381116789012', address: 'Zrenjaninski put 88', city: 'Beograd', country: 'Srbija', website: 'www.safetygear.rs', rating: 3.5, leadTime: 5, onTimeRate: 78, totalOrders: 18, totalValue: 890000, status: 'active', paymentTerms: '30 dana neto', bankAccount: null, notes: 'Povremeno kašnjenje sa isporukama', performanceScore: 72, createdAt: '2023-07-20T10:00:00Z' },
  { id: 'sup6', name: 'KlimaServis Beograd', code: 'SUP-006', category: 'Usluge', contactPerson: 'Dejan Antić', email: 'dejan@klimaservis.rs', phone: '+381637890123', address: null, city: 'Beograd', country: 'Srbija', website: null, rating: 4.3, leadTime: 2, onTimeRate: 92, totalOrders: 8, totalValue: 480000, status: 'active', paymentTerms: '15 dana neto', bankAccount: null, notes: 'Brz servis, povoljne cene', performanceScore: 88, createdAt: '2024-06-01T10:00:00Z' },
  { id: 'sup7', name: 'PackPro d.o.o.', code: 'SUP-007', category: 'Pakovanje', contactPerson: 'Goran Stanković', email: 'info@packpro.rs', phone: '+381118901234', address: 'Pionirska 15', city: 'Niš', country: 'Srbija', website: 'www.packpro.rs', rating: 4.6, leadTime: 5, onTimeRate: 94, totalOrders: 30, totalValue: 3200000, status: 'active', paymentTerms: '30 dana neto', bankAccount: '265-9998887776665-43', notes: 'Širok asortiman pakovanja', performanceScore: 91, createdAt: '2023-04-10T10:00:00Z' },
  { id: 'sup8', name: 'EuroParts GmbH', code: 'SUP-008', category: 'Rezervni delovi', contactPerson: 'Hans Mueller', email: 'order@europarts.de', phone: '+49211123456', address: 'Essener Str. 45', city: 'Düsseldorf', country: 'Nemačka', website: 'www.europarts.de', rating: 3.8, leadTime: 21, onTimeRate: 82, totalOrders: 5, totalValue: 450000, status: 'inactive', paymentTerms: 'Predračun', bankAccount: null, notes: 'Uvoz rezervnih delova - retke narudžbine', performanceScore: 68, createdAt: '2023-09-01T10:00:00Z' },
]

export const MOCK_SPENDING: SpendingRecord[] = [
  { month: '2025-01', category: 'Sirovine', amount: 1300000, count: 3 },
  { month: '2025-01', category: 'IT oprema', amount: 950000, count: 1 },
  { month: '2025-01', category: 'Kancelarijski materijal', amount: 50000, count: 1 },
  { month: '2025-01', category: 'Usluge', amount: 145000, count: 2 },
  { month: '2025-01', category: 'Radna zaštita', amount: 0, count: 0 },
  { month: '2025-01', category: 'Pakovanje', amount: 467500, count: 1 },
  { month: '2024-12', category: 'Sirovine', amount: 1100000, count: 2 },
  { month: '2024-12', category: 'Kancelarijski materijal', amount: 38000, count: 1 },
  { month: '2024-12', category: 'Usluge', amount: 130000, count: 2 },
  { month: '2024-12', category: 'Gorivo', amount: 420000, count: 1 },
  { month: '2024-11', category: 'Sirovine', amount: 980000, count: 3 },
  { month: '2024-11', category: 'IT oprema', amount: 350000, count: 1 },
  { month: '2024-11', category: 'Pakovanje', amount: 320000, count: 2 },
]

export const MOCK_APPROVAL_METRICS: ApprovalMetric[] = [
  { id: 'am1', step: 'Prijem zahteva', approver: 'Sistem', avgTime: 0, pending: 0, approved: 8, rejected: 0 },
  { id: 'am2', step: 'Odobrenje rukovodioca', approver: 'Marko Petrović', avgTime: 4.2, pending: 2, approved: 5, rejected: 1 },
  { id: 'am3', step: 'Finansijska provera', approver: 'Jelena Milić', avgTime: 6.8, pending: 1, approved: 4, rejected: 0 },
  { id: 'am4', step: 'Narudžbenica', approver: 'Nikola Stanković', avgTime: 2.1, pending: 0, approved: 3, rejected: 0 },
]

export const PR_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  submitted: { label: 'Podnet', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  ordered: { label: 'Naručeno', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  received: { label: 'Primljeno', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

export const PR_PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  urgent: { label: 'Hitan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const SUPPLIER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Neaktivan', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  blocked: { label: 'Blokiran', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M RSD`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K RSD`
  return `${amount} RSD`
}

export const getStarDisplay = (rating: number) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
      {half > 0 && <Star key="h" className="h-3 w-3 text-amber-400 fill-amber-400/50" />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="h-3 w-3 text-gray-300 dark:text-gray-600" />)}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export const getPerformanceColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-amber-600'
  return 'text-red-600'
}

export const getPerformanceBg = (score: number) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 75) return 'bg-amber-500'
  return 'bg-red-500'
}

export const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const res = await fetch('/api/nabavka/requisitions');

export const res = await fetch('/api/nabavka/suppliers');

export const stats = (() => {
    const active = prs.filter(p => ['submitted', 'approved', 'ordered'].includes(p.status)).length
    const pending = prs.filter(p => p.status === 'submitted').length
    const totalValue = prs.filter(p => !['draft', 'rejected', 'cancelled'].includes(p.status)).reduce((s, p) => s + p.totalAmount, 0)
    const onTimeRate = suppliers.length > 0 ? Math.round(suppliers.reduce((s, sup) => s + sup.onTimeRate, 0) / suppliers.length) : 0
    const avgLeadTime = suppliers.filter(s => s.status === 'active').length > 0
      ? Math.round(suppliers.filter(s => s.status === 'active').reduce((s, sup) => s + sup.leadTime, 0) / suppliers.filter(s => s.status === 'active').length)
      : 0
    const totalSpending = spending.reduce((s, sp) => s + sp.amount, 0)
    const departments = [...new Set(prs.map(p => p.department))]
    const supplierCategories = [...new Set(suppliers.map(s => s.category))]
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length
    return { active, pending, totalValue, onTimeRate, avgLeadTime, totalSpending, departments, supplierCategories, activeSuppliers }
  })();

export const filteredPRs = (() => {
    let result = [...prs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.prNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) ||
        p.requestedBy.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) ||
        (p.supplierName || '').toLowerCase().includes(q)
      )
    }
    if (filterPRStatus !== 'all') result = result.filter(p => p.status === filterPRStatus)
    if (filterPRPriority !== 'all') result = result.filter(p => p.priority === filterPRPriority)
    if (filterDept !== 'all') result = result.filter(p => p.department === filterDept)
    return result
  })();

export const filteredSuppliers = (() => {
    let result = [...suppliers]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q)
      )
    }
    if (filterSuppCat !== 'all') result = result.filter(s => s.category === filterSuppCat)
    if (filterSuppStatus !== 'all') result = result.filter(s => s.status === filterSuppStatus)
    return result
  })();

export const spendingByCategory = (() => {
    const map: Record<string, number> = {}
    spending.forEach(s => { map[s.category] = (map[s.category] || 0) + s.amount })
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  })();

export const monthlySpending = (() => {
    const map: Record<string, number> = {}
    spending.forEach(s => { map[s.month] = (map[s.month] || 0) + s.amount })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  })();

export const openNewPR = () => {
    setEditingPR(null)
    setPrForm({ title: '', description: '', priority: 'medium', department: '', supplierId: '', requiredByDate: '', notes: '' })
    setPrDialogOpen(true)
  }

export const openEditPR = (pr: PurchaseRequisition) => {
    setEditingPR(pr)
    setPrForm({
      title: pr.title, description: pr.description || '', priority: pr.priority,
      department: pr.department, supplierId: pr.supplierId || '', requiredByDate: pr.requiredByDate || '',
      notes: pr.notes || '',
    })
    setPrDialogOpen(true)
  }

export const handleSavePR = () => {
    if (!prForm.title.trim()) { toast.error('Naziv je obavezan'); return }
    const newPR: PurchaseRequisition = {
      id: editingPR?.id || `pr-${Date.now()}`,
      prNumber: editingPR?.prNumber || `PR-${new Date().getFullYear()}-${String(prs.length + 1).padStart(3, '0')}`,
      title: prForm.title, description: prForm.description || null,
      status: editingPR?.status || 'draft',
      priority: prForm.priority,
      requestedBy: editingPR?.requestedBy || 'Trenutni korisnik',
      department: prForm.department,
      supplierId: prForm.supplierId || null,
      supplierName: prForm.supplierId ? suppliers.find(s => s.id === prForm.supplierId)?.name || null : null,
      items: editingPR?.items || [],
      totalAmount: editingPR?.totalAmount || 0,
      currency: 'RSD',
      requestedDate: editingPR?.requestedDate || new Date().toISOString().split('T')[0],
      requiredByDate: prForm.requiredByDate || null,
      approvedBy: editingPR?.approvedBy ?? null, approvedAt: editingPR?.approvedAt ?? null,
      orderedAt: editingPR?.orderedAt ?? null, receivedAt: editingPR?.receivedAt ?? null,
      notes: prForm.notes || null,
      createdAt: editingPR?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPrs(prev => editingPR ? prev.map(p => p.id === editingPR.id ? newPR : p) : [...prev, newPR])
    setPrDialogOpen(false)
    toast.success(editingPR ? 'Zahtev ažuriran' : 'Zahtev kreiran')
  }

export const handleDeletePR = () => {
    if (!selectedPR) return
    setPrs(prev => prev.filter(p => p.id !== selectedPR.id))
    setDeleteConfirmOpen(false)
    setSelectedPR(null)
    toast.success('Zahtev obrisan')
  }

export const handleAdvanceStatus = (pr: PurchaseRequisition) => {
    const statusFlow: Record<string, string> = {
      draft: 'submitted', submitted: 'approved', approved: 'ordered', ordered: 'received',
    }
    const nextStatus = statusFlow[pr.status]
    if (!nextStatus) return
    setPrs(prev => prev.map(p => p.id === pr.id ? { ...p, status: nextStatus as PurchaseRequisition['status'], updatedAt: new Date().toISOString() } : p))
    toast.success(`Status promenjen: ${PR_STATUS_CONFIG[pr.status].label} → ${PR_STATUS_CONFIG[nextStatus].label}`)
  }

export const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1);

export const maxAmount = Math.max(...spendingByCategory.map(([, a]) => a), 1);

export const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1);

export const prevMonth = monthlySpending[monthlySpending.findIndex(([m]) => m === month) - 1]

export const prevAmount = prevMonth ? prevMonth[1] : amount;

export const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0;
