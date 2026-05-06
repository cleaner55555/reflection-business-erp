// Forum module – static data, mock generators & pure helpers

export const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

export const TAG_COLORS = [
  "bg-slate-100 text-slate-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

export const TOP_CONTRIBUTORS = [
  {
    name: "Admin Tim",
    posts: 54,
    badge: "Admin",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Stefan Petrović",
    posts: 38,
    badge: "Ekspert",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Jelena Stanković",
    posts: 32,
    badge: "Aktivan",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Dragana Krstić",
    posts: 27,
    badge: "Aktivan",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Nikola Marković",
    posts: 21,
    badge: "Član",
    color: "bg-slate-100 text-slate-700",
  },
];
// ---- Pure helpers ----

export function formatDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Danas";
  if (days === 1) return "Juče";
  if (days < 7) return `Pre ${days} dana`;
  if (days < 30) return `Pre ${Math.floor(days / 7)} ned`;
  return new Date(dateStr).toLocaleDateString("sr-RS");
}
// ---- Mock data generators ----

export function generateMockTopics() {
  return [
    {
      id: "t1",
      title: "Kako podesiti PDV prijavu?",
      content: "Ne mogu da nađem opciju za PDV prijavu u modulu Knjigovodstvo.",
      category: "support",
      tags: ["pdv", "knjigovodstvo"],
      authorName: "Milan Jovanović",
      authorAvatar: "MJ",
      views: 245,
      replyCount: 12,
      likes: 18,
      isPinned: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "t2",
      title: "Predlog: Automatski backup podataka",
      content:
        "Predlažem dodavanje automatskog backup-a svih podataka na dnevnom nivou.",
      category: "feature_request",
      tags: ["backup", "predlog"],
      authorName: "Jelena Stanković",
      authorAvatar: "JS",
      views: 182,
      replyCount: 7,
      likes: 35,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "t3",
      title: "Bug: Faktura ne šalje na email",
      content:
        "Kada pokušam da pošaljem fakturu na email klijenta, dobijem grešku 500.",
      category: "bug_report",
      tags: ["faktura", "email", "bug"],
      authorName: "Nikola Marković",
      authorAvatar: "NM",
      views: 328,
      replyCount: 15,
      likes: 8,
      isSolved: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "t4",
      title: "Najbolje prakse za inventuru",
      content: "Delim se iskustvom sa sprovođenom inventure u maloprodaji.",
      category: "discussion",
      tags: ["inventura", "maloprodaja", "praksa"],
      authorName: "Dragana Krstić",
      authorAvatar: "DK",
      views: 456,
      replyCount: 23,
      likes: 42,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "t5",
      title: "Nova verzija sistema 4.0!",
      content:
        "Objavljujemo novu verziju sa 50+ modula, poboljšanim UI i novim funkcionalnostima.",
      category: "announcement",
      tags: ["update", "verzija"],
      authorName: "Admin Tim",
      authorAvatar: "AT",
      views: 1203,
      replyCount: 45,
      likes: 89,
      isPinned: true,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "t6",
      title: "Integracija sa bankama - vodič",
      content:
        "Korak po korak vodič za povezivanje sistema sa bankovnim računima.",
      category: "tutorial",
      tags: ["banka", "integracija", "vodič"],
      authorName: "Stefan Petrović",
      authorAvatar: "SP",
      views: 567,
      replyCount: 18,
      likes: 56,
      isSolved: true,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "t7",
      title: "Problem sa izvozom izveštaja u PDF",
      content:
        "Kada izvezem izveštaj o prodaji u PDF formatu, karakteri na ćirilici se ne prikazuju ispravno.",
      category: "bug_report",
      tags: ["pdf", "izveštaj", "bug", "ćirilica"],
      authorName: "Ana Ilić",
      authorAvatar: "AI",
      views: 198,
      replyCount: 6,
      likes: 4,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: "t8",
      title: "Kako koristiti naprednu pretragu?",
      content:
        "Može li neko objasniti kako funkcioniše napredna pretraga u modulu Partneri?",
      category: "support",
      tags: ["pretraga", "partneri"],
      authorName: "Marko Nikolić",
      authorAvatar: "MN",
      views: 134,
      replyCount: 4,
      likes: 7,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: "t9",
      title: "Predlog za poboljšanje dashboard-a",
      content:
        "Trenutni dashboard je koristan ali fali mu mogućnost prilagođavanja widget-a.",
      category: "feature_request",
      tags: ["dashboard", "predlog", "ui"],
      authorName: "Ivana Đorđević",
      authorAvatar: "IĐ",
      views: 267,
      replyCount: 11,
      likes: 28,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: "t10",
      title: "Kalendar integracija sa Google Calendar",
      content: "Uspešno sam integrisao kalendar modul sa Google Calendar.",
      category: "tutorial",
      tags: ["kalendar", "google", "integracija"],
      authorName: "Dejan Stojanović",
      authorAvatar: "DS",
      views: 389,
      replyCount: 14,
      likes: 33,
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
  ];
}

export function generateMockCategories() {
  return [
    {
      id: "c1",
      key: "general",
      label: "Opšte",
      description: "Opšte diskusije o sistemu i radnom okruženju",
      color: "bg-slate-100 text-slate-700",
      icon: "message",
      topicCount: 0,
      sortOrder: 1,
    },
    {
      id: "c2",
      key: "support",
      label: "Podrška",
      description: "Pitanja i problemi oko korišćenja sistema",
      color: "bg-emerald-100 text-emerald-700",
      icon: "help",
      topicCount: 0,
      sortOrder: 2,
    },
    {
      id: "c3",
      key: "feature_request",
      label: "Predlozi",
      description: "Predlozi za nove funkcionalnosti i poboljšanja",
      color: "bg-amber-100 text-amber-700",
      icon: "zap",
      topicCount: 0,
      sortOrder: 3,
    },
    {
      id: "c4",
      key: "bug_report",
      label: "Bug-ovi",
      description: "Prijave grešaka i problema u sistemu",
      color: "bg-rose-100 text-rose-700",
      icon: "bug",
      topicCount: 0,
      sortOrder: 4,
    },
    {
      id: "c5",
      key: "discussion",
      label: "Diskusija",
      description: "Otvorene diskusije i razmena iskustava",
      color: "bg-violet-100 text-violet-700",
      icon: "star",
      topicCount: 0,
      sortOrder: 5,
    },
    {
      id: "c6",
      key: "announcement",
      label: "Obaveštenja",
      description: "Zvanične najave i obaveštenja admin tima",
      color: "bg-orange-100 text-orange-700",
      icon: "flame",
      topicCount: 0,
      sortOrder: 6,
    },
    {
      id: "c7",
      key: "tutorial",
      label: "Tutorijali",
      description: "Vodiči, tutorijali i najbolje prakse",
      color: "bg-cyan-100 text-cyan-700",
      icon: "tag",
      topicCount: 0,
      sortOrder: 7,
    },
    {
      id: "c8",
      key: "offtopic",
      label: "Van teme",
      description: "Sve ostalo - opuštena zona za zajednicu",
      color: "bg-pink-100 text-pink-700",
      icon: "message",
      topicCount: 0,
      sortOrder: 8,
    },
  ];
}

export function generateMockQuestions() {
  return [
    {
      id: "q1",
      title: "Kako da kreiram prilagođeni izveštaj?",
      content: "Treba mi izveštaj koji prikazuje prodaju po regionima.",
      authorName: "Milan J.",
      votes: 24,
      answerCount: 3,
      hasAccepted: true,
      tags: ["izveštaj", "prilagođeno"],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "q2",
      title: "Da li je moguća integracija sa spoljnim ERP sistemom?",
      content: "Naša kompanija koristi spoljni ERP sistem.",
      authorName: "Jelena S.",
      votes: 18,
      answerCount: 2,
      hasAccepted: false,
      tags: ["integracija", "erp"],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "q3",
      title: "Koji je limit za broj stavki u fakturi?",
      content: "Imamo klijenta sa velikim brojem stavki na jednoj fakturi.",
      authorName: "Nikola M.",
      votes: 9,
      answerCount: 1,
      hasAccepted: true,
      tags: ["faktura", "limiti"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function generateMockTags() {
  return [
    {
      id: "tg1",
      name: "faktura",
      slug: "faktura",
      description: "Sve vezano za fakturisanje i račune",
      color: TAG_COLORS[0],
      usageCount: 23,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: "tg2",
      name: "pdv",
      slug: "pdv",
      description: "Porez na dodatu vrednost",
      color: TAG_COLORS[1],
      usageCount: 18,
      createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
    },
    {
      id: "tg3",
      name: "knjigovodstvo",
      slug: "knjigovodstvo",
      description: "Knjigovodstveni modul i funkcionalnosti",
      color: TAG_COLORS[2],
      usageCount: 15,
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    },
    {
      id: "tg4",
      name: "bug",
      slug: "bug",
      description: "Prijave grešaka u sistemu",
      color: TAG_COLORS[3],
      usageCount: 34,
      createdAt: new Date(Date.now() - 86400000 * 27).toISOString(),
    },
    {
      id: "tg5",
      name: "predlog",
      slug: "predlog",
      description: "Predlozi za poboljšanja",
      color: TAG_COLORS[4],
      usageCount: 12,
      createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    },
    {
      id: "tg6",
      name: "integracija",
      slug: "integracija",
      description: "Integracije sa spoljnim servisima",
      color: TAG_COLORS[5],
      usageCount: 19,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
  ];
}

export function generateMonthlyData() {
  return [
    { month: "Jan", teme: 45, odgovori: 128, pregledi: 890 },
    { month: "Feb", teme: 52, odgovori: 145, pregledi: 1020 },
    { month: "Mar", teme: 38, odgovori: 112, pregledi: 780 },
    { month: "Apr", teme: 67, odgovori: 198, pregledi: 1340 },
    { month: "Maj", teme: 73, odgovori: 210, pregledi: 1560 },
    { month: "Jun", teme: 59, odgovori: 175, pregledi: 1230 },
    { month: "Jul", teme: 42, odgovori: 120, pregledi: 890 },
    { month: "Avg", teme: 31, odgovori: 89, pregledi: 670 },
    { month: "Sep", teme: 68, odgovori: 195, pregledi: 1420 },
    { month: "Okt", teme: 81, odgovori: 234, pregledi: 1780 },
    { month: "Nov", teme: 76, odgovori: 218, pregledi: 1650 },
    { month: "Dec", teme: 55, odgovori: 156, pregledi: 1100 },
  ];
}

export function generateMockReplies(topicId: string) {
  const baseReplies: Record<
    string,
    Array<{
      id: string;
      topicId: string;
      authorName: string;
      content: string;
      likes: number;
      createdAt: string;
      isBest?: boolean;
    }>
  > = {
    t1: [
      {
        id: "r1",
        topicId: "t1",
        authorName: "Stefan P.",
        content: "PDV prijava se nalazi u Knjigovodstvo > Porezi > PDV.",
        likes: 5,
        createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
      },
      {
        id: "r2",
        topicId: "t1",
        authorName: "Dragana K.",
        content: "Tačno, admin je morao da mi dodeli dodatne permisije.",
        likes: 3,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "r3",
        topicId: "t1",
        authorName: "Admin Tim",
        content: "Dodali smo detaljan vodič u sekciji Pomoć.",
        likes: 8,
        isBest: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    t3: [
      {
        id: "r4",
        topicId: "t3",
        authorName: "Admin Tim",
        content:
          "Identifikovali smo problem. Popravka će biti u sledećem patch-u.",
        likes: 4,
        createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
      },
    ],
  };
  return (
    baseReplies[topicId] || [
      {
        id: `r-${topicId}-1`,
        topicId,
        authorName: "Stefan P.",
        content: "Hvala na pitanju!",
        likes: 2,
        createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      },
    ]
  );
}
