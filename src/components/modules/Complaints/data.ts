export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Nova', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  acknowledged: { label: 'Priznata', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: <Clock className="h-3.5 w-3.5" /> },
  investigating: { label: 'U istrazi', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Search className="h-3.5 w-3.5" /> },
  waiting_supplier: { label: 'Čeka dobavljača', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <Truck className="h-3.5 w-3.5" /> },
  waiting_customer: { label: 'Čeka kupca', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Users className="h-3.5 w-3.5" /> },
  resolved: { label: 'Rešena', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'Odbijena', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Otkazana', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', icon: <X className="h-3.5 w-3.5" /> },
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  defective: { label: 'Defektan proizvod', color: 'bg-red-50 text-red-700', icon: '🔴' },
  wrong_item: { label: 'Pogrešan artikal', color: 'bg-orange-50 text-orange-700', icon: '🟠' },
  damaged: { label: 'Oštećeno pri transportu', color: 'bg-amber-50 text-amber-700', icon: '📦' },
  missing: { label: 'Nedostaje iz pošiljke', color: 'bg-blue-50 text-blue-700', icon: '❓' },
  quantity: { label: 'Pogrešna količina', color: 'bg-cyan-50 text-cyan-700', icon: '🔢' },
  quality: { label: 'Nekvalitetno', color: 'bg-purple-50 text-purple-700', icon: '⭐' },
  not_as_described: { label: 'Ne odgovara opisu', color: 'bg-pink-50 text-pink-700', icon: '📝' },
  late_delivery: { label: 'Kasna isporuka', color: 'bg-indigo-50 text-indigo-700', icon: '🕐' },
  overcharged: { label: 'Previše naplaćeno', color: 'bg-rose-50 text-rose-700', icon: '💰' },
  service: { label: 'Usluga', color: 'bg-teal-50 text-teal-700', icon: '🔧' },
  other: { label: 'Ostalo', color: 'bg-gray-50 text-gray-700', icon: '📋' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export const RESOLUTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  refund: { label: 'Povrat novca', color: 'bg-green-50 text-green-700', icon: '💰' },
  replacement: { label: 'Zamena proizvoda', color: 'bg-blue-50 text-blue-700', icon: '🔄' },
  repair: { label: 'Popravka', color: 'bg-amber-50 text-amber-700', icon: '🔧' },
  discount: { label: 'Popust na sledeću kupovinu', color: 'bg-purple-50 text-purple-700', icon: '🏷️' },
  credit_note: { label: 'Knjižno odobrenje', color: 'bg-cyan-50 text-cyan-700', icon: '📄' },
  apology: { label: 'Izvinjenje / kompenzacija', color: 'bg-pink-50 text-pink-700', icon: '💝' },
  rejected: { label: 'Odbijena reklamacija', color: 'bg-red-50 text-red-700', icon: '❌' },
  no_action: { label: 'Bez akcije', color: 'bg-gray-50 text-gray-700', icon: '➖' },
}

export const REQUESTED_RESOLUTION_CONFIG: Record<string, string> = {
  refund: 'Povrat novca',
  replacement: 'Zamena proizvoda',
  repair: 'Popravka',
  discount: 'Popust',
  credit_note: 'Knjižno odobrenje',
  info: 'Samo informacija',
  other: 'Ostalo',
}

export const mockComplaints: Complaint[] = [
  {
    id: 'cmp-1', number: 'REK-2025-001', partnerName: 'Jovan Petrović', partnerEmail: 'jovan@email.com', partnerPhone: '+381631234567',
    productCode: 'ART-001', productName: 'Samsung Galaxy S24 Ultra', batchNumber: 'BT-2025-001',
    category: 'defective', priority: 'high', status: 'investigating', resolutionType: '', subject: 'Ne radi kamera',
    description: 'Kamera na zadnjoj strani ne fokusira pravilno. Fotografije su zamagljene bez obzira na uslove osvetljenja. Problem je prisutan od prvog dana korišćenja.',
    customerNote: '', internalNote: 'Proveriti sa servisom da li je hardverski problem.',
    reportedBy: 'Jovan Petrović', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-02-01',
    resolvedAt: null, createdAt: '2025-01-15T10:00:00', updatedAt: '2025-01-17T14:00:00', qualityScore: 0,
    timeline: [
      { id: 'e1', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-15T10:00:00' },
      { id: 'e2', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-15T14:30:00' },
      { id: 'e3', type: 'status_change', description: 'Status: Priznata → U istrazi', performedBy: 'Ana Stanković', timestamp: '2025-01-17T14:00:00' },
      { id: 'e4', type: 'note', description: 'Proveriti sa servisom da li je hardverski problem', performedBy: 'Ana Stanković', timestamp: '2025-01-17T14:00:00' },
    ],
    attachments: [
      { id: 'a1', fileName: 'foto-kamera.jpg', fileType: 'image/jpeg', fileSize: 2450000, uploadedAt: '2025-01-15T10:05:00' },
    ],
  },
  {
    id: 'cmp-2', number: 'REK-2025-002', partnerName: 'D.o.o. TechPro', partnerEmail: 'office@techpro.rs', partnerPhone: '+38111234567',
    productCode: 'ART-045', productName: 'Dell UltraSharp 27" Monitor', batchNumber: 'BT-2024-156',
    category: 'damaged', priority: 'medium', status: 'waiting_supplier', resolutionType: '', subject: 'Pukao ekran pri transportu',
    description: 'Monitor je stigao sa puknutim ekranom. Ambalaža je očigledno bila nedovoljno zaštićena. Kutija je imala vidljiva oštećenja.',
    customerNote: 'Tražimo hitnu zamenu ili povrat novca.', internalNote: 'Kontaktirati kurira za štetu.',
    reportedBy: 'Marko Đorđević', assignedTo: 'Petar Nikolić', requestedResolution: 'replacement',
    amountRequested: 85000, amountApproved: 0, currency: 'RSD', deadline: '2025-01-30',
    resolvedAt: null, createdAt: '2025-01-10T09:00:00', updatedAt: '2025-01-16T11:00:00', qualityScore: 0,
    timeline: [
      { id: 'e5', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-10T09:00:00' },
      { id: 'e6', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Petar Nikolić', timestamp: '2025-01-10T15:00:00' },
      { id: 'e7', type: 'status_change', description: 'Status: Priznata → Čeka dobavljača', performedBy: 'Petar Nikolić', timestamp: '2025-01-16T11:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-3', number: 'REK-2025-003', partnerName: 'Milica Jovanović', partnerEmail: 'milica@gmail.com', partnerPhone: '+381648765432',
    productCode: 'ART-078', productName: 'Nike Air Max 90', batchNumber: 'BT-2025-012',
    category: 'wrong_item', priority: 'low', status: 'resolved', resolutionType: 'replacement', subject: 'Stigla pogrešna veličina',
    description: 'Naručila sam veličinu 42, a stigla je 39. Etiketa na kutiji je ispravna ali unutra je pogrešna veličina.',
    customerNote: '', internalNote: '',
    reportedBy: 'Milica Jovanović', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-01-25',
    resolvedAt: '2025-01-18T16:00:00', createdAt: '2025-01-12T08:00:00', updatedAt: '2025-01-18T16:00:00', qualityScore: 4,
    timeline: [
      { id: 'e8', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-12T08:00:00' },
      { id: 'e9', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-12T12:00:00' },
      { id: 'e10', type: 'status_change', description: 'Status: Priznata → Rešena (Zamena)', performedBy: 'Ana Stanković', timestamp: '2025-01-18T16:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-4', number: 'REK-2025-004', partnerName: 'B2B Solutions d.o.o.', partnerEmail: 'info@b2bsolutions.rs', partnerPhone: '+381113456789',
    productCode: 'ART-120', productName: 'HP LaserJet Pro M404dn', batchNumber: 'BT-2024-089',
    category: 'defective', priority: 'critical', status: 'new', resolutionType: '', subject: 'Stampa crne trake',
    description: 'Stampač stampa konstantnu crnu traku na svakoj stranici, bez obzira na sadržaj. Pokušano je zamena tonera ali problem ostaje. Garancija je još aktivna.',
    customerNote: 'Imamo 15 ovih stampaća u firmi — brinite se da se ne ponovi.', internalNote: '',
    reportedBy: 'Nikola Marković', assignedTo: '', requestedResolution: 'replacement',
    amountRequested: 120000, amountApproved: 0, currency: 'RSD', deadline: '2025-02-05',
    resolvedAt: null, createdAt: '2025-01-19T08:00:00', updatedAt: '2025-01-19T08:00:00', qualityScore: 0,
    timeline: [
      { id: 'e11', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-19T08:00:00' },
    ],
    attachments: [
      { id: 'a2', fileName: 'scan-test-page.pdf', fileType: 'application/pdf', fileSize: 890000, uploadedAt: '2025-01-19T08:02:00' },
      { id: 'a3', fileName: 'photo-defect.jpg', fileType: 'image/jpeg', fileSize: 3100000, uploadedAt: '2025-01-19T08:03:00' },
    ],
  },
  {
    id: 'cmp-5', number: 'REK-2025-005', partnerName: 'Sara Ilić', partnerEmail: 'sara.ilic@yahoo.com', partnerPhone: '+381651112233',
    productCode: 'ART-055', productName: 'KitchenAid Mixer Artisan', batchNumber: 'BT-2024-201',
    category: 'not_as_described', priority: 'medium', status: 'resolved', resolutionType: 'discount', subject: 'Boja ne odgovara slici',
    description: 'Naručila sam mixer u boji "Empire Red" (tamno crvena), a stigla je svetlo crvena/narandžasta boja. Slika na sajtu je prevarena.',
    customerNote: 'Ne želim zamenu, tražim popust od minimum 20%.', internalNote: 'Popust odobren — specijalna ponuda za zadovoljstvo.',
    reportedBy: 'Sara Ilić', assignedTo: 'Ana Stanković', requestedResolution: 'discount',
    amountRequested: 15000, amountApproved: 10000, currency: 'RSD', deadline: '2025-01-28',
    resolvedAt: '2025-01-20T10:00:00', createdAt: '2025-01-13T11:00:00', updatedAt: '2025-01-20T10:00:00', qualityScore: 3,
    timeline: [
      { id: 'e12', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-13T11:00:00' },
      { id: 'e13', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-13T15:00:00' },
      { id: 'e14', type: 'status_change', description: 'Status: Priznata → Rešena (Popust)', performedBy: 'Ana Stanković', timestamp: '2025-01-20T10:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-6', number: 'REK-2025-006', partnerName: 'ABC Trade d.o.o.', partnerEmail: 'orders@abctrade.rs', partnerPhone: '+38111222333',
    productCode: 'ART-200', productName: 'Canon EOS R6 Mark II', batchNumber: 'BT-2025-005',
    category: 'quantity', priority: 'high', status: 'resolved', resolutionType: 'replacement', subject: 'Nedostaje 3 komada',
    description: 'Naručili smo 10 komada, a primili samo 7. Avans je plaćen za 10 komada. Potvrda narudžbenice je priložena.',
    customerNote: 'Očekujemo isporuku preostala 3 komada u roku od 48h.', internalNote: 'Greška u pakovanju — 3 komada su ostala na skladištu.',
    reportedBy: 'Ljubiša Tomić', assignedTo: 'Petar Nikolić', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-01-22',
    resolvedAt: '2025-01-21T09:00:00', createdAt: '2025-01-18T08:00:00', updatedAt: '2025-01-21T09:00:00', qualityScore: 5,
    timeline: [
      { id: 'e15', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-18T08:00:00' },
      { id: 'e16', type: 'status_change', description: 'Status: Nova → Rešena (Zamena)', performedBy: 'Petar Nikolić', timestamp: '2025-01-21T09:00:00' },
    ],
    attachments: [
      { id: 'a4', fileName: 'narudzbenica-2025-0045.pdf', fileType: 'application/pdf', fileSize: 156000, uploadedAt: '2025-01-18T08:01:00' },
    ],
  },
  {
    id: 'cmp-7', number: 'REK-2025-007', partnerName: 'Ivana Stojković', partnerEmail: 'ivana.s@outlook.com', partnerPhone: '+381664445566',
    productCode: 'ART-033', productName: 'Bosch Dishwasher SMS6ECI01E', batchNumber: 'BT-2024-178',
    category: 'defective', priority: 'medium', status: 'waiting_customer', resolutionType: '', subject: 'Mašina ne pere pravilno',
    description: 'Mašina za sudove ne pere pravilno — ostaju mrlje i tragovi deterdženta. Serviser je obišao i rekao da je u redu ali problem i dalje postoji.',
    customerNote: 'Serviser je bio već 2 puta — problem nije rešen. Tražim zamenu.', internalNote: 'Serviser izveštava da je mašina funkcionalna. Čekamo odgovor kupca.',
    reportedBy: 'Ivana Stojković', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-02-10',
    resolvedAt: null, createdAt: '2025-01-05T14:00:00', updatedAt: '2025-01-19T09:00:00', qualityScore: 0,
    timeline: [
      { id: 'e17', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-05T14:00:00' },
      { id: 'e18', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-06T10:00:00' },
      { id: 'e19', type: 'note', description: 'Serviser zakazan za 10.01.', performedBy: 'Ana Stanković', timestamp: '2025-01-07T09:00:00' },
      { id: 'e20', type: 'status_change', description: 'Status: Priznata → U istrazi', performedBy: 'Ana Stanković', timestamp: '2025-01-10T11:00:00' },
      { id: 'e21', type: 'note', description: 'Serviser izveštava: mašina funkcionalna, korisnik koristi pogrešan program', performedBy: 'Servis', timestamp: '2025-01-15T16:00:00' },
      { id: 'e22', type: 'status_change', description: 'Status: U istrazi → Čeka kupca', performedBy: 'Ana Stanković', timestamp: '2025-01-19T09:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-8', number: 'REK-2025-008', partnerName: 'Gamma Corp d.o.o.', partnerEmail: 'procurement@gammacorp.rs', partnerPhone: '+381114556677',
    productCode: 'ART-310', productName: 'Cisco Meraki MR46 Access Point', batchNumber: 'BT-2024-320',
    category: 'service', priority: 'low', status: 'rejected', resolutionType: 'rejected', subject: 'Problem sa garancijom',
    description: 'Kupili smo 20 AP uređaja u avgustu 2023. Sa garancijom ne znamo da li pokriva ovaj tip kvara (Wi-Fi intermittently pada).',
    customerNote: '', internalNote: 'Garancija istekla avgust 2024. Nije pokriveno.',
    reportedBy: 'Dragan Milić', assignedTo: 'Petar Nikolić', requestedResolution: 'repair',
    amountRequested: 45000, amountApproved: 0, currency: 'RSD', deadline: '2025-01-20',
    resolvedAt: '2025-01-16T14:00:00', createdAt: '2025-01-08T13:00:00', updatedAt: '2025-01-16T14:00:00', qualityScore: 2,
    timeline: [
      { id: 'e23', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-08T13:00:00' },
      { id: 'e24', type: 'status_change', description: 'Status: Nova → Odbijena (Garancija istekla)', performedBy: 'Petar Nikolić', timestamp: '2025-01-16T14:00:00' },
    ],
    attachments: [],
  },
]

export const mockStats: ComplaintStats = {
  total: 147, new: 12, inProgress: 28, resolved: 95, rejected: 8, overdueCount: 3,
  avgResolutionDays: 4.2, avgSatisfaction: 3.8, totalAmountRequested: 2850000, totalAmountApproved: 1920000,
  byCategory: [
    { category: 'defective', count: 42, label: 'Defektan proizvod', amountRequested: 980000, amountApproved: 720000 },
    { category: 'damaged', count: 28, label: 'Oštećeno pri transportu', amountRequested: 650000, amountApproved: 480000 },
    { category: 'wrong_item', count: 25, label: 'Pogrešan artikal', amountRequested: 320000, amountApproved: 280000 },
    { category: 'quantity', count: 18, label: 'Pogrešna količina', amountRequested: 180000, amountApproved: 140000 },
    { category: 'not_as_described', count: 15, label: 'Ne odgovara opisu', amountRequested: 450000, amountApproved: 200000 },
    { category: 'quality', count: 12, label: 'Nekvalitetno', amountRequested: 200000, amountApproved: 70000 },
    { category: 'late_delivery', count: 5, label: 'Kasna isporuka', amountRequested: 50000, amountApproved: 20000 },
    { category: 'other', count: 2, label: 'Ostalo', amountRequested: 20000, amountApproved: 10000 },
  ],
  byPriority: [
    { priority: 'low', count: 35 },
    { priority: 'medium', count: 62 },
    { priority: 'high', count: 38 },
    { priority: 'critical', count: 12 },
  ],
  byResolution: [
    { resolution: 'replacement', count: 48, label: 'Zamena' },
    { resolution: 'refund', count: 25, label: 'Povrat novca' },
    { resolution: 'discount', count: 12, label: 'Popust' },
    { resolution: 'repair', count: 7, label: 'Popravka' },
    { resolution: 'credit_note', count: 3, label: 'Knjižno odobrenje' },
    { resolution: 'rejected', count: 8, label: 'Odbijena' },
  ],
  byMonth: [
    { month: 'Avg', opened: 18, resolved: 15, rejected: 1 },
    { month: 'Sep', opened: 22, resolved: 19, rejected: 2 },
    { month: 'Okt', opened: 20, resolved: 18, rejected: 1 },
    { month: 'Nov', opened: 25, resolved: 22, rejected: 2 },
    { month: 'Dec', opened: 30, resolved: 25, rejected: 1 },
    { month: 'Jan', opened: 32, resolved: 28, rejected: 1 },
  ],
  topProducts: [
    { product: 'Samsung Galaxy S24', count: 8, percentage: 5.4 },
    { product: 'Dell Monitor 27"', count: 6, percentage: 4.1 },
    { product: 'HP LaserJet Pro', count: 5, percentage: 3.4 },
    { product: 'Canon EOS R6', count: 4, percentage: 2.7 },
    { product: 'Nike Air Max', count: 4, percentage: 2.7 },
  ],
  topPartners: [
    { partner: 'B2B Solutions d.o.o.', count: 12, amount: 450000 },
    { partner: 'ABC Trade d.o.o.', count: 9, amount: 380000 },
    { partner: 'Gamma Corp d.o.o.', count: 7, amount: 220000 },
    { partner: 'Jovan Petrović', count: 5, amount: 85000 },
    { partner: 'Milica Jovanović', count: 4, amount: 45000 },
  ],
  satisfactionTrend: [
    { month: 'Avg', score: 3.5 },
    { month: 'Sep', score: 3.7 },
    { month: 'Okt', score: 3.4 },
    { month: 'Nov', score: 3.9 },
    { month: 'Dec', score: 4.0 },
    { month: 'Jan', score: 3.8 },
  ],
}

export const STATUS_FLOW = ['new', 'acknowledged', 'investigating', 'waiting_supplier', 'waiting_customer', 'resolved', 'rejected']

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();
