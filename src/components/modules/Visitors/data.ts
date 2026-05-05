export const statusConfig: Record<VisitorStatus, { label: string; color: string; icon: React.ElementType }> = {
  expected: { label: 'Očekivan', color: 'bg-amber-100 text-amber-700', icon: Clock },
  checked_in: { label: 'Prijavljen', color: 'bg-green-100 text-green-700', icon: LogIn },
  checked_out: { label: 'Odjavljen', color: 'bg-blue-100 text-blue-700', icon: LogOut },
  cancelled: { label: 'Otkazan', color: 'bg-red-100 text-red-700', icon: Trash2 },
}

export const purposeLabels: Record<string, string> = {
  sastanak: 'Sastanak',
  intervju: 'Intervju',
  isporuka: 'Isporuka',
  servis: 'Servis',
  konsultacija: 'Konsultacija',
  poseta: 'Poseta',
  prezentacija: 'Prezentacija',
  kontrola: 'Kontrola kvaliteta',
  ostalo: 'Ostalo',
}

export const departmentLabels: Record<string, string> = {
  management: 'Rukovodstvo',
  it: 'IT sektor',
  prodaja: 'Prodaja',
  marketing: 'Marketing',
  finansije: 'Finansije',
  hr: 'Ljudski resursi',
  proizvodnja: 'Proizvodnja',
  magacin: 'Magacin',
  podrška: 'Podrška',
}

export const mockVisitors: Visitor[] = [
  {
    id: 'v-001', firstName: 'Marko', lastName: 'Nikolić', email: 'marko.nikolic@techcorp.rs',
    phone: '+381 63 123 4567', company: 'TechCorp d.o.o.', purpose: 'sastanak',
    department: 'it', hostName: 'Jovan Petrović', hostId: 'emp-01',
    status: 'checked_in', badgeNumber: 'POS-2025-042', expectedAt: '2025-07-15T09:00:00',
    checkedInAt: '2025-07-15T08:55:00', notes: 'Sastanak o saradnji na novom projektu',
    isPreRegistered: true, visitCount: 5, totalDuration: 720, idDocument: 'Lična karta',
  },
  {
    id: 'v-002', firstName: 'Ana', lastName: 'Jovanović', email: 'ana.j@designstudio.rs',
    phone: '+381 64 234 5678', company: 'DesignStudio', purpose: 'prezentacija',
    department: 'marketing', hostName: 'Milica Stanković', hostId: 'emp-02',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T11:00:00',
    notes: 'Prezentacija novog brenda', isPreRegistered: true, visitCount: 3, totalDuration: 360,
  },
  {
    id: 'v-003', firstName: 'Nenad', lastName: 'Popović', email: 'nenad.p@logistik.co.rs',
    phone: '+381 65 345 6789', company: 'Logistik Co.', purpose: 'isporuka',
    department: 'magacin', hostName: 'Dragan Milić', hostId: 'emp-03',
    status: 'checked_out', badgeNumber: 'POS-2025-041', expectedAt: '2025-07-15T07:00:00',
    checkedInAt: '2025-07-15T07:10:00', checkedOutAt: '2025-07-15T08:30:00',
    notes: 'Isporuka robe za magacin', isPreRegistered: false, visitCount: 12, totalDuration: 1440,
    vehiclePlate: 'BG-123-AB',
  },
  {
    id: 'v-004', firstName: 'Jelena', lastName: 'Stanković', email: 'jelena.s@hr-consulting.rs',
    phone: '+381 62 456 7890', company: 'HR Consulting', purpose: 'intervju',
    department: 'hr', hostName: 'Snežana Radić', hostId: 'emp-04',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T14:00:00',
    notes: 'Intervju za poziciju Senior HR Manager', isPreRegistered: true, visitCount: 1, totalDuration: 0,
  },
  {
    id: 'v-005', firstName: 'Stefan', lastName: 'Đorđević', email: 'stefan.d@supplychain.rs',
    phone: '+381 66 567 8901', company: 'SupplyChain d.o.o.', purpose: 'konsultacija',
    department: 'prodaja', hostName: 'Aleksandar Kovačević', hostId: 'emp-05',
    status: 'checked_in', badgeNumber: 'POS-2025-043', expectedAt: '2025-07-15T10:00:00',
    checkedInAt: '2025-07-15T09:50:00', notes: 'Konsultacija o novim ugovorima za narednu godinu',
    isPreRegistered: true, visitCount: 8, totalDuration: 960, idDocument: ' Pasoš',
  },
  {
    id: 'v-006', firstName: 'Ivana', lastName: 'Matijević', email: 'ivana.m@qualitylab.rs',
    phone: '+381 61 678 9012', company: 'QualityLab', purpose: 'kontrola',
    department: 'proizvodnja', hostName: 'Goran Savić', hostId: 'emp-06',
    status: 'checked_out', badgeNumber: 'POS-2025-040', expectedAt: '2025-07-14T08:00:00',
    checkedInAt: '2025-07-14T08:05:00', checkedOutAt: '2025-07-14T16:00:00',
    notes: 'Redovna inspekcija proizvodnog procesa', isPreRegistered: true, visitCount: 6, totalDuration: 2880,
  },
  {
    id: 'v-007', firstName: 'Petar', lastName: 'Lazić', email: 'petar.l@startup.rs',
    phone: '+381 60 789 0123', company: 'StartupHub', purpose: 'poseta',
    department: 'management', hostName: 'Nenad Đorđević', hostId: 'emp-07',
    status: 'cancelled', badgeNumber: undefined, expectedAt: '2025-07-15T13:00:00',
    notes: 'Poseta otkazana - premestiti za sledeći tjedan', isPreRegistered: true, visitCount: 2, totalDuration: 120,
  },
  {
    id: 'v-008', firstName: 'Maja', lastName: 'Todorović', email: 'maja.t@it-security.rs',
    phone: '+381 63 890 1234', company: 'IT Security Solutions', purpose: 'servis',
    department: 'it', hostName: 'Jovan Petrović', hostId: 'emp-01',
    status: 'expected', badgeNumber: undefined, expectedAt: '2025-07-15T15:00:00',
    notes: 'Servis i zamena mrežne opreme', isPreRegistered: true, visitCount: 4, totalDuration: 480,
  },
  {
    id: 'v-009', firstName: 'Đorđe', lastName: 'Vukčević', email: 'djordje.v@audit.rs',
    phone: '+381 64 901 2345', company: 'Audit Partner', purpose: 'kontrola',
    department: 'finansije', hostName: 'Zorana Marković', hostId: 'emp-08',
    status: 'checked_in', badgeNumber: 'POS-2025-044', expectedAt: '2025-07-15T08:00:00',
    checkedInAt: '2025-07-15T08:00:00', notes: 'Godišnja finansijska revizija',
    isPreRegistered: true, visitCount: 2, totalDuration: 960, idDocument: 'Lična karta',
  },
  {
    id: 'v-010', firstName: 'Milica', lastName: 'Radosavljević', email: 'milica.r@courier.rs',
    phone: '+381 65 012 3456', company: 'Express Courier', purpose: 'isporuka',
    department: 'podrška', hostName: 'Tamara Nikolić', hostId: 'emp-09',
    status: 'checked_out', badgeNumber: 'POS-2025-039', expectedAt: '2025-07-15T09:30:00',
    checkedInAt: '2025-07-15T09:25:00', checkedOutAt: '2025-07-15T09:40:00',
    notes: 'Preuzimanje pošiljke', isPreRegistered: false, visitCount: 15, totalDuration: 300,
    vehiclePlate: 'NS-456-CD',
  },
]

export const mockHosts = [
  { id: 'emp-01', name: 'Jovan Petrović', department: 'IT sektor' },
  { id: 'emp-02', name: 'Milica Stanković', department: 'Marketing' },
  { id: 'emp-03', name: 'Dragan Milić', department: 'Magacin' },
  { id: 'emp-04', name: 'Snežana Radić', department: 'Ljudski resursi' },
  { id: 'emp-05', name: 'Aleksandar Kovačević', department: 'Prodaja' },
  { id: 'emp-06', name: 'Goran Savić', department: 'Proizvodnja' },
  { id: 'emp-07', name: 'Nenad Đorđević', department: 'Rukovodstvo' },
  { id: 'emp-08', name: 'Zorana Marković', department: 'Finansije' },
  { id: 'emp-09', name: 'Tamara Nikolić', department: 'Podrška' },
]

export const hourlyFlow = [
  { hour: '07:00', count: 3 }, { hour: '08:00', count: 8 }, { hour: '09:00', count: 12 },
  { hour: '10:00', count: 10 }, { hour: '11:00', count: 7 }, { hour: '12:00', count: 4 },
  { hour: '13:00', count: 5 }, { hour: '14:00', count: 6 }, { hour: '15:00', count: 4 },
  { hour: '16:00', count: 2 },
]

export const monthlyTrend = [
  { month: '2025-01', visitors: 87 }, { month: '2025-02', visitors: 92 },
  { month: '2025-03', visitors: 105 }, { month: '2025-04', visitors: 98 },
  { month: '2025-05', visitors: 115 }, { month: '2025-06', visitors: 128 },
  { month: '2025-07', visitors: 76 },
]

export const h = Math.floor(minutes / 60);

export const m = minutes % 60;

export const num = Math.floor(Math.random() * 50) + 50;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyVisitorForm = {
    firstName: '', lastName: '', email: '', phone: '', company: '',
    purpose: 'poseta', department: '', hostId: '', expectedAt: '',
    notes: '', isPreRegistered: false, idDocument: '', vehiclePlate: '',
  }

export const res = await fetch(`/api/visitors?companyId=${activeCompanyId}`);

export const data = await res.json();

export const res = await fetch(`/api/visitors/dashboard?companyId=${activeCompanyId}`);

export const data = await res.json();

export const load = async () => {
      await Promise.all([loadVisitors(), loadKPIs()])
      setLoading(false)
    }

export const filteredVisitors = visitors.filter((v) => {
    if (visitorsSearch) {
      const q = visitorsSearch.toLowerCase()
      const matches = `${v.firstName} ${v.lastName} ${v.company} ${v.email} ${v.hostName} ${v.badgeNumber}`
        .toLowerCase()
      if (!matches.includes(q)) return false
    }
    if (visitorsFilterStatus !== 'all' && v.status !== visitorsFilterStatus) return false
    if (visitorsFilterPurpose !== 'all' && v.purpose !== visitorsFilterPurpose) return false
    if (visitorsFilterDept !== 'all' && v.department !== visitorsFilterDept) return false
    return true
  });

export const purposeBreakdown = visitors.reduce((acc, v) => {
    const key = v.purpose
    if (!acc[key]) acc[key] = { count: 0, checkedIn: 0 }
    acc[key].count++
    if (v.status === 'checked_in') acc[key].checkedIn++
    return acc
  }, {} as Record<string, { count: number; checkedIn: number }>);

export const deptBreakdown = visitors.reduce((acc, v) => {
    const key = v.department || 'nema'
    if (!acc[key]) acc[key] = 0
    acc[key]++
    return acc
  }, {} as Record<string, number>);

export const maxHourlyCount = Math.max(...hourlyFlow.map((h) => h.count), 1);

export const handleCreateVisitor = () => {
    if (!visitorForm.firstName || !visitorForm.lastName) {
      toast.error('Ime i prezime su obavezni')
      return
    }
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      firstName: visitorForm.firstName,
      lastName: visitorForm.lastName,
      email: visitorForm.email || undefined,
      phone: visitorForm.phone || undefined,
      company: visitorForm.company || undefined,
      purpose: visitorForm.purpose,
      department: visitorForm.department || undefined,
      hostId: visitorForm.hostId || undefined,
      hostName: mockHosts.find((h) => h.id === visitorForm.hostId)?.name,
      status: 'expected',
      expectedAt: visitorForm.expectedAt ? new Date(visitorForm.expectedAt).toISOString() : undefined,
      notes: visitorForm.notes || undefined,
      isPreRegistered: visitorForm.isPreRegistered,
      visitCount: 1,
      totalDuration: 0,
      idDocument: visitorForm.idDocument || undefined,
      vehiclePlate: visitorForm.vehiclePlate || undefined,
    }
    setVisitors((prev) => [newVisitor, ...prev])
    setCreateDialogOpen(false)
    setVisitorForm(emptyVisitorForm)
    toast.success(`Posetilac ${newVisitor.firstName} ${newVisitor.lastName} je uspešno kreiran`)
  }

export const handleQuickCheckin = () => {
    if (!quickCheckinForm.firstName || !quickCheckinForm.lastName) {
      toast.error('Ime i prezime su obavezni')
      return
    }
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      firstName: quickCheckinForm.firstName,
      lastName: quickCheckinForm.lastName,
      company: quickCheckinForm.company || undefined,
      purpose: quickCheckinForm.purpose,
      department: quickCheckinForm.department || undefined,
      hostId: quickCheckinForm.hostId || undefined,
      hostName: mockHosts.find((h) => h.id === quickCheckinForm.hostId)?.name,
      phone: quickCheckinForm.phone || undefined,
      status: 'checked_in',
      badgeNumber: getNextBadgeNumber(),
      checkedInAt: new Date().toISOString(),
      notes: quickCheckinForm.notes || undefined,
      isPreRegistered: false,
      visitCount: 1,
      totalDuration: 0,
      idDocument: quickCheckinForm.idDocument || undefined,
    }
    setVisitors((prev) => [newVisitor, ...prev])
    setCheckinDialogOpen(false)
    setQuickCheckinForm({
      firstName: '', lastName: '', company: '', purpose: 'poseta',
      department: '', hostId: '', phone: '', notes: '', idDocument: '',
    })
    toast.success(`${newVisitor.firstName} ${newVisitor.lastName} je uspešno prijavljen. Badge: ${newVisitor.badgeNumber}`)
  }

export const handleCheckIn = (visitor: Visitor) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id
          ? { ...v, status: 'checked_in' as VisitorStatus, checkedInAt: new Date().toISOString(), badgeNumber: visitor.badgeNumber || getNextBadgeNumber() }
          : v
      )
    )
    toast.success(`${visitor.firstName} ${visitor.lastName} je prijavljen`)
  }

export const handleCheckOut = (visitor: Visitor) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id
          ? { ...v, status: 'checked_out' as VisitorStatus, checkedOutAt: new Date().toISOString() }
          : v
      )
    )
    toast.success(`${visitor.firstName} ${visitor.lastName} je odjavljen`)
  }

export const handleDelete = (visitor: Visitor) => {
    if (!confirm(`Obrisati posetioca ${visitor.firstName} ${visitor.lastName}?`)) return
    setVisitors((prev) => prev.filter((v) => v.id !== visitor.id))
    toast.success('Posetilac je obrisan')
  }

export const handlePrintBadge = (visitor: Visitor) => {
    toast.success(`Badge ${visitor.badgeNumber || 'N/A'} poslat na štampaču`)
  }

export const maxCount = Math.max(...Object.values(purposeBreakdown).map((d) => d.count), 1);

export const cfg = statusConfig[v.status]

export const maxDept = Math.max(...Object.values(deptBreakdown), 1);

export const maxMonth = Math.max(...monthlyTrend.map((x) => x.visitors), 1);

export const StatusIcon = statusConfig[selectedVisitor.status].icon;

export function formatDuration(minutes: number): string {
  if (!minutes) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export function getNextBadgeNumber(): string {
  const num = Math.floor(Math.random() * 50) + 50
  return `POS-2025-${String(num).padStart(3, '0')}`
}
