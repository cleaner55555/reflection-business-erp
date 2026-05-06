export const priorityConfig: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  nizak: {
    label: "Nizak",
    color: "bg-gray-100 text-gray-700",
    dotColor: "bg-gray-400",
  },
  srednji: {
    label: "Srednji",
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-400",
  },
  visok: {
    label: "Visok",
    color: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-400",
  },
  hitno: {
    label: "Hitno",
    color: "bg-red-100 text-red-700",
    dotColor: "bg-red-400",
  },
};

export const noteColors = [
  { value: "#ffffff", label: "Belа" },
  { value: "#fef3c7", label: "Žuta" },
  { value: "#dcfce7", label: "Zelena" },
  { value: "#dbeafe", label: "Plava" },
  { value: "#fce7f3", label: "Roza" },
  { value: "#f3e8ff", label: "Ljubičasta" },
  { value: "#ffedd5", label: "Narandžasta" },
  { value: "#f1f5f9", label: "Siva" },
];

export const categoryIcons: Record<string, string> = {
  radni: "📋",
  licni: "👤",
  projekat: "📁",
  sastanak: "🤝",
  ideja: "💡",
  kupovina: "🛒",
  zdravlje: "❤️",
  edukacija: "📚",
};

export const sortOptions = [
  { value: "updated", label: "Nedavno ažurirano" },
  { value: "created", label: "Nedavno kreirano" },
  { value: "title", label: "Naziv A-Z" },
  { value: "priority", label: "Prioritet" },
];

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Radni zadaci",
    color: "#dbeafe",
    icon: "📋",
    noteCount: 12,
  },
  {
    id: "cat-2",
    name: "Lične beleške",
    color: "#fce7f3",
    icon: "👤",
    noteCount: 8,
  },
  {
    id: "cat-3",
    name: "Projekti",
    color: "#dcfce7",
    icon: "📁",
    noteCount: 15,
  },
  { id: "cat-4", name: "Sastanci", color: "#fef3c7", icon: "🤝", noteCount: 6 },
  { id: "cat-5", name: "Ideje", color: "#f3e8ff", icon: "💡", noteCount: 4 },
  {
    id: "cat-6",
    name: "Edukacija",
    color: "#ffedd5",
    icon: "📚",
    noteCount: 7,
  },
];

export const mockNotes: Note[] = [
  {
    id: "note-1",
    title: "Sastanak sa klijentom - ABC d.o.o.",
    content:
      "Pripremiti prezentaciju za novi projekat. Proći kroz zahteve i rokove. Doneti ponudu za razvoj softvera.\n\nVažne tačke:\n- Budžet: 50.000 EUR\n- Rok: 3 meseca\n- Tim: 4 developera\n- MVP za 6 nedelja",
    categoryId: "cat-4",
    tags: ["klijent", "sastanak", "hitno"],
    priority: "visok",
    color: "#fef3c7",
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    sharedWith: ["Marko Petrović", "Jelena Stanković"],
    createdAt: "2025-01-15T10:00:00",
    updatedAt: "2025-01-18T14:30:00",
  },
  {
    id: "note-2",
    title: "Lista zadataka za Q1 2025",
    content:
      "1. Završiti migraciju baze podataka\n2. Implementirati novi API\n3. Ažurirati dokumentaciju\n4. Testiranje performansi\n5. Security audit",
    categoryId: "cat-1",
    tags: ["zadaci", "Q1", "razvoj"],
    priority: "srednji",
    color: "#dcfce7",
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    sharedWith: [],
    createdAt: "2025-01-10T08:00:00",
    updatedAt: "2025-01-17T16:00:00",
  },
  {
    id: "note-3",
    title: "Ideja za novi proizvod",
    content:
      "Mobilna aplikacija za praćenje potrošnje energije u realnom vremenu.\n\nIntegracija sa pametnim brojalima.\nAI preporuke za uštedu.\nGamifikacija za porodično učešće.",
    categoryId: "cat-5",
    tags: ["ideja", "mobilna", "startup"],
    priority: "nizak",
    color: "#f3e8ff",
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    sharedWith: ["Ana Nikolić"],
    createdAt: "2025-01-12T12:00:00",
    updatedAt: "2025-01-12T12:00:00",
  },
  {
    id: "note-4",
    title: "Beleške sa edukacije - React 19",
    content:
      "Novi React Server Components.\nSuspense boundaries za data fetching.\nNovi hook: use() za promisese.\nImproved error handling.",
    categoryId: "cat-6",
    tags: ["react", "edukacija", "frontend"],
    priority: "nizak",
    color: "#ffedd5",
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    sharedWith: [],
    createdAt: "2025-01-14T09:00:00",
    updatedAt: "2025-01-16T11:00:00",
  },
  {
    id: "note-5",
    title: "Hitno: Ispravka bug-a u produkciji",
    content:
      "Korisnici prijavljuju grešku pri plaćanju.\n\nKoraci za reprodukciju:\n1. Dodaj proizvod u korpu\n2. Idi na checkout\n3. Izaberi kreditnu karticu\n4. Greška: Payment gateway timeout\n\nDodijeljeno: Dev tim\nPrioritet: Kritično",
    categoryId: "cat-1",
    tags: ["bug", "produkcija", "kritično"],
    priority: "hitno",
    color: "#fecaca",
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    sharedWith: ["Dev Tim", "QA Tim"],
    createdAt: "2025-01-18T08:00:00",
    updatedAt: "2025-01-18T09:30:00",
  },
  {
    id: "note-6",
    title: "Nabavka opreme za kancelariju",
    content:
      'Potrebna oprema:\n- 2x monitor 27" 4K (300 EUR/kom)\n- 5x ergonomska stolica (250 EUR/kom)\n- 1x projektor (800 EUR)\n- Kablovi i adapteri (100 EUR)\n\nUkupno: ~2.650 EUR\nOdobrenje: Direktor',
    categoryId: "cat-1",
    tags: ["nabavka", "oprema", "budžet"],
    priority: "srednji",
    color: "#dbeafe",
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    sharedWith: ["HR", "Finansije"],
    createdAt: "2025-01-11T13:00:00",
    updatedAt: "2025-01-15T10:00:00",
  },
  {
    id: "note-7",
    title: "Lični ciljevi za 2025",
    content:
      "Profesionalni:\n- Završiti AWS certifikaciju\n- Predavati na 2 konferencije\n- Mentorisati 3 junior developera\n\nLični:\n- Čitati 24 knjige\n- Trčati polumaraton\n- Naučiti španski (B1 nivo)",
    categoryId: "cat-2",
    tags: ["ciljevi", "2025", "razvoj"],
    priority: "srednji",
    color: "#fce7f3",
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    sharedWith: [],
    createdAt: "2025-01-01T00:00:00",
    updatedAt: "2025-01-05T20:00:00",
  },
  {
    id: "note-8",
    title: "Projekat: Redesign web sajta",
    content:
      "Faza 1: Istraživanje (2 nedelje)\n- Analiza konkurencije\n- Korisničke ankete\n- Wireframes\n\nFaza 2: Dizajn (3 nedelje)\n- UI/UX dizajn\n- Prototip\n- Testiranje sa korisnicima\n\nFaza 3: Razvoj (4 nedelje)\n- Frontend implementacija\n- Backend API\n- Integracije",
    categoryId: "cat-3",
    tags: ["web", "dizajn", "projekat"],
    priority: "visok",
    color: "#dcfce7",
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    sharedWith: ["Dizajn tim", "Dev tim"],
    createdAt: "2025-01-08T09:00:00",
    updatedAt: "2025-01-16T17:00:00",
  },
];

export const mockTemplates: NoteTemplate[] = [
  {
    id: "tpl-1",
    name: "Sastanak",
    content:
      "Datum: \nUčesnici: \nAgenda:\n1. \n2. \n3. \n\nZaključci:\n- \n- \n\nSledeći koraci:\n- ",
    categoryId: "cat-4",
    isDefault: true,
  },
  {
    id: "tpl-2",
    name: "Dnevne zadatke",
    content:
      "✅ Završeno juče:\n- \n\n📋 Današnji zadaci:\n- [ ] \n- [ ] \n- [ ] \n\n🚧 U toku:\n- ",
    categoryId: "cat-1",
    isDefault: false,
  },
  {
    id: "tpl-3",
    name: "Projektni predlog",
    content:
      "Naziv projekta: \nOpis: \nCiljevi:\n1. \n2. \n\nBudžet: \nRok: \nResursi: \nRizici:\n- ",
    categoryId: "cat-3",
    isDefault: false,
  },
  {
    id: "tpl-4",
    name: "Beleške sa edukacije",
    content:
      "Tema: \nPredavač: \nDatum: \n\nKljučne tačke:\n- \n- \n- \n\nŠta sam naučio/la:\n- \n\nPitanja za dalje:\n- ",
    categoryId: "cat-6",
    isDefault: false,
  },
  {
    id: "tpl-5",
    name: "Sprint review",
    content:
      "Sprint: \nDatum: \n\nZavršeno:\n- [x] \n- [x] \n\nNije završeno:\n- [ ] \n- [ ] \n\nBlockeri:\n- \n\nPlan za sledeći sprint:\n- ",
    categoryId: "cat-1",
    isDefault: false,
  },
];

export const mockDashboard: DashboardData = {
  totalNotes: 45,
  totalCategories: 6,
  pinnedNotes: 3,
  recentActivity: [
    { action: "Kreirana", note: "Hitno: Ispravka bug-a", time: "Pre 2 sata" },
    { action: "Ažurirana", note: "Sastanak sa klijentom", time: "Pre 5 sati" },
    { action: "Arhivirana", note: "Stari projekat - Q4", time: "Pre 1 dan" },
    { action: "Kreirana", note: "Nove ideje za marketing", time: "Pre 2 dana" },
    { action: "Deljena", note: "Lista zadataka za Q1", time: "Pre 3 dana" },
  ],
  notesByCategory: [
    { category: "Radni zadaci", count: 12, color: "#dbeafe" },
    { category: "Lične beleške", count: 8, color: "#fce7f3" },
    { category: "Projekti", count: 15, color: "#dcfce7" },
    { category: "Sastanci", count: 6, color: "#fef3c7" },
    { category: "Ideje", count: 4, color: "#f3e8ff" },
    { category: "Edukacija", count: 7, color: "#ffedd5" },
  ],
  topTags: [
    { tag: "zadaci", count: 15 },
    { tag: "projekat", count: 12 },
    { tag: "edukacija", count: 8 },
    { tag: "klijent", count: 6 },
    { tag: "sastanak", count: 5 },
  ],
};

export const { activeCompanyId } = useAppStore();
