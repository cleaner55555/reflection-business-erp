export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Odobreno', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <CheckCircle2 className="h-3 w-3" /> },
  implemented: { label: 'Realizovano', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="h-3 w-3" /> },
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  kvalitet: { label: 'Kvalitet', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  proces: { label: 'Proces', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  safety: { label: 'Bezbednost', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  troskovi: { label: 'Troškovi', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  organizacija: { label: 'Organizacija', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'Visok', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const mockSuggestions: Suggestion[] = [
  {
    id: 's-1', title: 'Automatizacija pakovanja proizvoda serije A',
    description: 'Predlažem uvođenje poluautomatske linije za pakovanje proizvoda serije A koja bi smanjila vreme pakovanja za 40% i reducirala greške u etiketiranju. Trenutno se ručno pakuje prosečno 500 jedinica dnevno sa 3% grešaka.',
    category: 'proces', priority: 'high', status: 'approved',
    authorName: 'Marko Petrović', authorId: 'emp-1', authorDept: 'Proizvodnja',
    votesFor: 24, votesAgainst: 3, userVote: 'for', comments: 8,
    createdAt: '2025-01-10', updatedAt: '2025-01-18', implementedAt: null,
    estimatedSaving: 1500000, implementerName: null, rejectionReason: null,
  },
  {
    id: 's-2', title: 'Uvođenje 5S metode u radionici 3',
    description: 'Primena 5S metodologije (Sort, Set, Shine, Standardize, Sustain) u radionici 3 bi značajno poboljšala organizaciju radnog prostora, smanjila vreme traženja alata i smanjila rizik od nesreća.',
    category: 'organizacija', priority: 'medium', status: 'implemented',
    authorName: 'Jelena Nikolić', authorId: 'emp-2', authorDept: 'Proizvodnja',
    votesFor: 31, votesAgainst: 2, userVote: 'for', comments: 12,
    createdAt: '2024-11-05', updatedAt: '2025-01-15', implementedAt: '2025-01-15',
    estimatedSaving: 350000, implementerName: 'Jelena Nikolić', rejectionReason: null,
  },
  {
    id: 's-3', title: 'Zamena PVC ambalaže ekološkim materijalima',
    description: 'Predlažem postepenu zamenu PVC ambalaže za proizvode iz kategorije hrane sa biodegradabilnim alternativama (PLA). To bi poboljšalo imidž kompanije i zadovoljilo nove ekološke standarde EU.',
    category: 'kvalitet', priority: 'high', status: 'pending',
    authorName: 'Ana Stanković', authorId: 'emp-3', authorDept: 'Kvalitet',
    votesFor: 18, votesAgainst: 7, userVote: null, comments: 15,
    createdAt: '2025-01-20', updatedAt: '2025-01-20', implementedAt: null,
    estimatedSaving: 0, implementerName: null, rejectionReason: null,
  },
  {
    id: 's-4', title: 'Servisni protokol za mašine CNC br. 7 i 12',
    description: 'Mašine CNC br. 7 i 12 imaju učestale kvarove poslednjih 6 meseci (prosečno 3 nedelje zastoja/mesec). Predlažem uvođenje preventivnog održavanja po ISO 55001 standardu sa nedeljnim kontrolama.',
    category: 'safety', priority: 'critical', status: 'approved',
    authorName: 'Nenad Jović', authorId: 'emp-4', authorDept: 'Održavanje',
    votesFor: 35, votesAgainst: 0, userVote: 'for', comments: 6,
    createdAt: '2025-01-08', updatedAt: '2025-01-16', implementedAt: null,
    estimatedSaving: 800000, implementerName: null, rejectionReason: null,
  },
  {
    id: 's-5', title: 'Prebacivanje na LED rasvetu u svim objektima',
    description: 'Zamena trenutne fluorescentne rasvete sa LED panelima bi smanjila potrošnju struje za osvetljenje za oko 60%. Procenjeni ROI je 14 meseci uz trenutne cene struje.',
    category: 'troskovi', priority: 'medium', status: 'implemented',
    authorName: 'Ivan Đorđević', authorId: 'emp-5', authorDept: 'Administracija',
    votesFor: 28, votesAgainst: 1, userVote: 'for', comments: 4,
    createdAt: '2024-09-15', updatedAt: '2024-12-20', implementedAt: '2024-12-20',
    estimatedSaving: 420000, implementerName: 'Ivan Đorđević', rejectionReason: null,
  },
  {
    id: 's-6', title: 'Digitalizacija nalogа za internu potrošnju',
    description: 'Trenutno se interni nalozi za potrošnju (kancelarijski materijal, gorivo, alati) popunjavaju na papiru. Predlažem uvođenje digitalnog obrasca sa odobrenjima putem aplikacije, što bi ubrzalo proces za 70%.',
    category: 'proces', priority: 'medium', status: 'pending',
    authorName: 'Sara Kovačević', authorId: 'emp-6', authorDept: 'Administracija',
    votesFor: 15, votesAgainst: 4, userVote: null, comments: 7,
    createdAt: '2025-01-22', updatedAt: '2025-01-22', implementedAt: null,
    estimatedSaving: 200000, implementerName: null, rejectionReason: null,
  },
  {
    id: 's-7', title: 'Obuka za rukovaoce viljuškara - godišnja recertifikacija',
    description: 'Prema novim propisima o bezbednosti na radu, svi rukovaoci viljuškara moraju proći godišnju recertifikaciju. Trenutno imamo 12 rukovlalaca bez važećeg sertifikata.',
    category: 'safety', priority: 'critical', status: 'implemented',
    authorName: 'Dragan Milić', authorId: 'emp-7', authorDept: 'Bezbednost',
    votesFor: 32, votesAgainst: 0, userVote: 'for', comments: 3,
    createdAt: '2024-12-01', updatedAt: '2025-01-10', implementedAt: '2025-01-10',
    estimatedSaving: 0, implementerName: 'Dragan Milić', rejectionReason: null,
  },
  {
    id: 's-8', title: 'Smanjenje količine OTP pakovanja za transport',
    description: 'Analiza pokazuje da koristimo 30% više pakovnog materijala nego što je neophodno za bezbedan transport. Predlažem optimizaciju dimenzija kartona i uvođenje plenuma umesto punjenja penom.',
    category: 'troskovi', priority: 'low', status: 'rejected',
    authorName: 'Milan Simić', authorId: 'emp-8', authorDept: 'Logistika',
    votesFor: 10, votesAgainst: 12, userVote: 'against', comments: 9,
    createdAt: '2024-10-20', updatedAt: '2024-11-15', implementedAt: null,
    estimatedSaving: 280000, implementerName: null, rejectionReason: 'Procena rizika pokazuje povećanu verovatnoću oštećenja robe u transportu za 12%. Neophodno dodatno testiranje.',
  },
  {
    id: 's-9', title: 'Uvođenje dnevnog stand-up sastanka u timu za razvoj',
    description: 'Predlažem uvođenje 15-minutnih dnevnih stand-up sastanaka (9:00h) u timu za razvoj softvera radi bolje koordinacije, bržeg rešavanja blokera i transparentnosti napretka projekata.',
    category: 'organizacija', priority: 'low', status: 'implemented',
    authorName: 'Marko Petrović', authorId: 'emp-1', authorDept: 'IT',
    votesFor: 14, votesAgainst: 6, userVote: 'for', comments: 11,
    createdAt: '2024-08-10', updatedAt: '2024-09-01', implementedAt: '2024-09-01',
    estimatedSaving: 0, implementerName: 'Marko Petrović', rejectionReason: null,
  },
  {
    id: 's-10', title: 'Kontrola kvaliteta - dodatni check-point pre pakovanja',
    description: 'Predlažem dodavanje još jedne tačke kontrole kvaliteta neposredno pre pakovanja finalnih proizvoda. Trenutni broj reklamacija (2.3%) bi se mogao smanjiti na ispod 1% sa ovom merom.',
    category: 'kvalitet', priority: 'high', status: 'pending',
    authorName: 'Ana Stanković', authorId: 'emp-3', authorDept: 'Kvalitet',
    votesFor: 22, votesAgainst: 5, userVote: 'for', comments: 5,
    createdAt: '2025-01-25', updatedAt: '2025-01-25', implementedAt: null,
    estimatedSaving: 600000, implementerName: null, rejectionReason: null,
  },
]

export const mockStats: SuggestionStats = {
  total: 10,
  pending: 4,
  approved: 2,
  implemented: 4,
  rejected: 1,
  totalVotes: 229,
  avgResolutionDays: 18.5,
  implementationRate: 40,
  categoryBreakdown: [
    { category: 'kvalitet', count: 2, color: 'bg-green-500' },
    { category: 'proces', count: 2, color: 'bg-blue-500' },
    { category: 'safety', count: 2, color: 'bg-red-500' },
    { category: 'troskovi', count: 2, color: 'bg-amber-500' },
    { category: 'organizacija', count: 2, color: 'bg-purple-500' },
  ],
  monthlyTrend: [
    { month: 'Avg', submitted: 3, implemented: 1 },
    { month: 'Sep', submitted: 2, implemented: 1 },
    { month: 'Okt', submitted: 2, implemented: 0 },
    { month: 'Nov', submitted: 1, implemented: 1 },
    { month: 'Dec', submitted: 2, implemented: 1 },
    { month: 'Jan', submitted: 4, implemented: 0 },
  ],
  topContributors: [
    { name: 'Marko Petrović', dept: 'Proizvodnja', count: 2, implemented: 1 },
    { name: 'Ana Stanković', dept: 'Kvalitet', count: 2, implemented: 0 },
    { name: 'Nenad Jović', dept: 'Održavanje', count: 1, implemented: 0 },
    { name: 'Jelena Nikolić', dept: 'Proizvodnja', count: 1, implemented: 1 },
    { name: 'Ivan Đorđević', dept: 'Administracija', count: 1, implemented: 1 },
  ],
  deptBreakdown: [
    { dept: 'Proizvodnja', total: 3, implemented: 2, rate: 67 },
    { dept: 'Kvalitet', total: 2, implemented: 0, rate: 0 },
    { dept: 'Održavanje', total: 1, implemented: 0, rate: 0 },
    { dept: 'Administracija', total: 2, implemented: 1, rate: 50 },
    { dept: 'Bezbednost', total: 1, implemented: 1, rate: 100 },
    { dept: 'Logistika', total: 1, implemented: 0, rate: 0 },
  ],
}

export const { activeCompanyId, currentUser } = useAppStore();
