export const postStatusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400' },
}

export const commentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const statusWorkflow = ['draft', 'scheduled', 'published', 'archived'] as const;

export const CHART_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export const mockCategories: BlogCategory[] = [
  { id: 'cat-1', name: 'Tehnologija', slug: 'tehnologija', description: 'Vesti iz sveta tehnologije i IT sektora', postCount: 5, color: '#3b82f6' },
  { id: 'cat-2', name: 'Biznis', slug: 'biznis', description: 'Poslovni saveti, trendovi i analize tržišta', postCount: 3, color: '#22c55e' },
  { id: 'cat-3', name: 'Marketing', slug: 'marketing', description: 'Digitalni marketing, SEO i društvene mreže', postCount: 3, color: '#f59e0b' },
  { id: 'cat-4', name: 'Dizajn', slug: 'dizajn', description: 'UI/UX dizajn, grafika i kreativnost', postCount: 2, color: '#8b5cf6' },
  { id: 'cat-5', name: 'Razvoj', slug: 'razvoj', description: 'Programiranje, alati i metodologije', postCount: 4, color: '#ef4444' },
  { id: 'cat-6', name: 'Vodiči', slug: 'vodici', description: 'Praktični vodiči i tutorijali', postCount: 2, color: '#ec4899' },
]

export const mockAuthors = [
  { id: 'auth-1', name: 'Marko Petrović' },
  { id: 'auth-2', name: 'Ana Jovanović' },
  { id: 'auth-3', name: 'Nikola Stanković' },
  { id: 'auth-4', name: 'Jelena Milić' },
]

export const mockPosts: BlogPost[] = [
  { id: 'post-1', title: 'Kako napraviti SEO strategiju za 2025', content: 'SEO je ključan za online vidljivost. U ovom članku ćemo pokriti najnovije trendove...', categoryId: 'cat-3', authorId: 'auth-1', status: 'published', views: 4520, commentCount: 8, tags: ['tag-1', 'tag-3', 'tag-5'], featured: true, seoTitle: 'SEO Strategija 2025 - Kompletni vodič', seoDescription: 'Naučite kako da kreirate efikasnu SEO strategiju za 2025 godinu.', publishedAt: '2025-01-15T10:00:00Z', createdAt: '2025-01-14T08:00:00Z', readingTime: 8 },
  { id: 'post-2', title: 'Uvod u React Server Components', content: 'React Server Components donose novi paradigma u React razvoj...', categoryId: 'cat-5', authorId: 'auth-2', status: 'published', views: 3890, commentCount: 12, tags: ['tag-2', 'tag-4'], featured: true, seoTitle: 'React Server Components - Uvod', seoDescription: 'Sve što treba da znate o React Server Components.', publishedAt: '2025-01-20T09:00:00Z', createdAt: '2025-01-19T14:00:00Z', readingTime: 12 },
  { id: 'post-3', title: '10 saveta za produktivniji rad', content: 'Produktivnost je veština koja se može usavršiti...', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', views: 2340, commentCount: 5, tags: ['tag-6', 'tag-7'], featured: false, seoTitle: '10 saveta za produktivnost', seoDescription: 'Poboljšajte svoju produktivnost sa ovim 10 praktičnih saveta.', publishedAt: '2025-02-01T11:00:00Z', createdAt: '2025-01-30T10:00:00Z', readingTime: 6 },
  { id: 'post-4', title: 'Next.js 15 - Nove mogućnosti', content: 'Next.js 15 donosi mnoge poboljšanja i nove funkcionalnosti...', categoryId: 'cat-5', authorId: 'auth-1', status: 'published', views: 5670, commentCount: 15, tags: ['tag-2', 'tag-4', 'tag-8'], featured: true, seoTitle: 'Next.js 15 Nove mogućnosti', seoDescription: 'Upoznajte se sa novim funkcionalnostima u Next.js 15.', publishedAt: '2025-02-10T08:00:00Z', createdAt: '2025-02-09T16:00:00Z', readingTime: 10 },
  { id: 'post-5', title: 'UI/UX dizajn trendovi 2025', content: 'Svake godine donosi nove trendove u dizajnu...', categoryId: 'cat-4', authorId: 'auth-4', status: 'published', views: 1890, commentCount: 3, tags: ['tag-9', 'tag-10'], featured: false, seoTitle: 'UI/UX trendovi 2025', seoDescription: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', publishedAt: '2025-02-15T14:00:00Z', createdAt: '2025-02-14T12:00:00Z', readingTime: 7 },
  { id: 'post-6', title: 'Veštačka inteligencija u biznisu', content: 'AI transformiše način na koji poslujemo...', categoryId: 'cat-1', authorId: 'auth-2', status: 'published', views: 3210, commentCount: 9, tags: ['tag-1', 'tag-6'], featured: true, seoTitle: 'AI u biznisu', seoDescription: 'Kako veštačka inteligencija menja poslovanje.', publishedAt: '2025-02-20T10:00:00Z', createdAt: '2025-02-19T09:00:00Z', readingTime: 9 },
  { id: 'post-7', title: 'Vodič za TypeScript tipove', content: 'TypeScript tipovi su moćan alat...', categoryId: 'cat-6', authorId: 'auth-3', status: 'scheduled', views: 0, commentCount: 0, tags: ['tag-2', 'tag-8'], featured: false, seoTitle: 'TypeScript tipovi vodič', seoDescription: 'Kompletni vodič za TypeScript tipove.', publishedAt: '2025-03-01T08:00:00Z', createdAt: '2025-02-25T10:00:00Z', readingTime: 15 },
  { id: 'post-8', title: 'Optimizacija baze podataka', content: 'Brzina upita je kritična za performanse...', categoryId: 'cat-5', authorId: 'auth-1', status: 'draft', views: 0, commentCount: 0, tags: ['tag-4', 'tag-5'], featured: false, seoTitle: 'Optimizacija baze podataka', seoDescription: 'Kako optimizovati upite baze podataka.', publishedAt: '', createdAt: '2025-02-28T14:00:00Z', readingTime: 11 },
  { id: 'post-9', title: 'Društvene mreže za mala preduzeća', content: 'Social media marketing za SME sektor...', categoryId: 'cat-3', authorId: 'auth-4', status: 'draft', views: 0, commentCount: 0, tags: ['tag-3', 'tag-6'], featured: false, seoTitle: 'Društvene mreže za SME', seoDescription: 'Kako koristiti društvene mreže za rast biznisa.', publishedAt: '', createdAt: '2025-03-01T09:00:00Z', readingTime: 8 },
  { id: 'post-10', title: 'Figma vs Sketch - Poređenje', content: 'Dva najpopularnija alata za dizajn...', categoryId: 'cat-4', authorId: 'auth-2', status: 'published', views: 1450, commentCount: 6, tags: ['tag-9', 'tag-10'], featured: false, seoTitle: 'Figma vs Sketch poređenje', seoDescription: 'Uporedite Figmu i Sketch za dizajn korisničkog interfejsa.', publishedAt: '2025-03-05T12:00:00Z', createdAt: '2025-03-04T08:00:00Z', readingTime: 6 },
  { id: 'post-11', title: 'DevOps prakse za timove', content: 'CI/CD, Docker i Kubernetes su standardi...', categoryId: 'cat-5', authorId: 'auth-3', status: 'published', views: 2670, commentCount: 4, tags: ['tag-4', 'tag-5', 'tag-8'], featured: false, seoTitle: 'DevOps prakse', seoDescription: 'Najbolje DevOps prakse za razvojne timove.', publishedAt: '2025-03-10T09:00:00Z', createdAt: '2025-03-09T11:00:00Z', readingTime: 13 },
  { id: 'post-12', title: 'Cybersecurity osnovi', content: 'Zaštita podataka je obaveza svake kompanije...', categoryId: 'cat-1', authorId: 'auth-1', status: 'scheduled', views: 0, commentCount: 0, tags: ['tag-1', 'tag-5'], featured: false, seoTitle: 'Cybersecurity osnovi', seoDescription: 'Osnovni principi zaštite u cyber prostoru.', publishedAt: '2025-03-20T10:00:00Z', createdAt: '2025-03-12T08:00:00Z', readingTime: 10 },
  { id: 'post-13', title: 'Kreiranje brenda od nule', content: 'Brending je mnogo više od logotipa...', categoryId: 'cat-2', authorId: 'auth-4', status: 'published', views: 1980, commentCount: 7, tags: ['tag-3', 'tag-6', 'tag-7'], featured: true, seoTitle: 'Kreiranje brenda', seoDescription: 'Kako kreirati jak brend od početka.', publishedAt: '2025-03-15T08:00:00Z', createdAt: '2025-03-14T10:00:00Z', readingTime: 9 },
  { id: 'post-14', title: 'API dizajn najbolje prakse', content: 'REST vs GraphQL, verzionisanje, autentikacija...', categoryId: 'cat-6', authorId: 'auth-2', status: 'archived', views: 890, commentCount: 2, tags: ['tag-2', 'tag-4'], featured: false, seoTitle: 'API dizajn prakse', seoDescription: 'Najbolje prakse za dizajn API-ja.', publishedAt: '2024-12-01T10:00:00Z', createdAt: '2024-11-28T14:00:00Z', readingTime: 14 },
  { id: 'post-15', title: 'Startup ekosistem u Srbiji', content: 'Srbija postaje regionalni hub za inovacije...', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', views: 3100, commentCount: 11, tags: ['tag-6', 'tag-7', 'tag-1'], featured: true, seoTitle: 'Startup ekosistem Srbija', seoDescription: 'Pregled startup ekosistema u Srbiji 2025.', publishedAt: '2025-03-18T11:00:00Z', createdAt: '2025-03-17T09:00:00Z', readingTime: 11 },
]

export const mockComments: BlogComment[] = [
  { id: 'cmt-1', authorName: 'Ivan Savić', postId: 'post-1', postTitle: 'Kako napraviti SEO strategiju za 2025', content: 'Odličan članak! Veoma korisni saveti za SEO optimizaciju.', status: 'approved', createdAt: '2025-01-16T14:30:00Z', parentId: null },
  { id: 'cmt-2', authorName: 'Maja Đorđević', postId: 'post-2', postTitle: 'Uvod u React Server Components', content: 'Konačno objašnjenje RSC koje ima smisla. Hvala!', status: 'approved', createdAt: '2025-01-21T09:15:00Z', parentId: null },
  { id: 'cmt-3', authorName: 'Lazar Popović', postId: 'post-4', postTitle: 'Next.js 15 - Nove mogućnosti', content: 'Turbopack je zaista brz, testirao sam na velikom projektu.', status: 'pending', createdAt: '2025-02-11T16:45:00Z', parentId: null },
  { id: 'cmt-4', authorName: 'Sara Marković', postId: 'post-6', postTitle: 'Veštačka inteligencija u biznisu', content: 'Koji AI alati preporučujete za mala preduzeća?', status: 'approved', createdAt: '2025-02-21T11:20:00Z', parentId: null },
  { id: 'cmt-5', authorName: 'Nenad Vukčević', postId: 'post-1', postTitle: 'Kako napraviti SEO strategiju za 2025', content: 'Da li ste probali nove AI SEO alate?', status: 'pending', createdAt: '2025-02-22T08:10:00Z', parentId: 'cmt-1' },
  { id: 'cmt-6', authorName: 'Jovana Nikolić', postId: 'post-10', postTitle: 'Figma vs Sketch - Poređenje', content: 'Figma je pobednik za saradnju u timu, definitivno.', status: 'approved', createdAt: '2025-03-06T10:00:00Z', parentId: null },
  { id: 'cmt-7', authorName: 'Bogdan Jokić', postId: 'post-13', postTitle: 'Kreiranje brenda od nule', content: 'Vrlo inspirativan članak. Imam pitanje o brend strategiji.', status: 'pending', createdAt: '2025-03-16T14:30:00Z', parentId: null },
  { id: 'cmt-8', authorName: 'Milica Radovanović', postId: 'post-15', postTitle: 'Startup ekosistem u Srbiji', content: 'Srbija zaista ima potencijal. NAPREDak je odlična inicijativa!', status: 'approved', createdAt: '2025-03-19T09:45:00Z', parentId: null },
  { id: 'cmt-9', authorName: 'Đorđe Stamenić', postId: 'post-11', postTitle: 'DevOps prakse za timove', content: 'Kubernetes je prekompleksan za male timove. Docker Compose je dovoljan.', status: 'rejected', createdAt: '2025-03-11T16:00:00Z', parentId: null },
  { id: 'cmt-10', authorName: 'Ana Đorđević', postId: 'post-5', postTitle: 'UI/UX dizajn trendovi 2025', content: 'Glassmorphism i dalje u trendu?', status: 'approved', createdAt: '2025-02-16T11:30:00Z', parentId: null },
  { id: 'cmt-11', authorName: 'Viktor Todorović', postId: 'post-3', postTitle: '10 saveta za produktivniji rad', content: 'Pomodoro tehnika je zaista promenila moj radni dan.', status: 'approved', createdAt: '2025-02-02T15:20:00Z', parentId: null },
  { id: 'cmt-12', authorName: 'Tamara Ilić', postId: 'post-15', postTitle: 'Startup ekosistem u Srbiji', content: 'Koje fondiranje opcije postoje za tech startup u Srbiji?', status: 'pending', createdAt: '2025-03-20T08:00:00Z', parentId: null },
]

export const mockTags: BlogTag[] = [
  { id: 'tag-1', name: 'AI', slug: 'ai', postCount: 3 },
  { id: 'tag-2', name: 'React', slug: 'react', postCount: 3 },
  { id: 'tag-3', name: 'Marketing', slug: 'marketing', postCount: 3 },
  { id: 'tag-4', name: 'Veb razvoj', slug: 'veb-razvoj', postCount: 4 },
  { id: 'tag-5', name: 'Bezbednost', slug: 'bezbednost', postCount: 3 },
  { id: 'tag-6', name: 'Biznis', slug: 'biznis', postCount: 4 },
  { id: 'tag-7', name: 'Kreativnost', slug: 'kreativnost', postCount: 3 },
  { id: 'tag-8', name: 'Alati', slug: 'alati', postCount: 3 },
  { id: 'tag-9', name: 'Dizajn', slug: 'dizajn', postCount: 2 },
  { id: 'tag-10', name: 'UX', slug: 'ux', postCount: 2 },
]

export const { activeCompanyId } = useAppStore();
