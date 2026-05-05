export const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'Arhivirano', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const statusWorkflow = ['draft', 'scheduled', 'published', 'archived'] as const;

export const CHART_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export const mediaTypeIcons: Record<string, React.ElementType> = {
  image: Image,
  document: FileText,
  video: Video,
  audio: Music,
  icon: Camera,
}

export const mediaTypeColors: Record<string, string> = {
  image: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  icon: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export const toolbarActions = [
  { icon: Bold, label: 'Bold', action: 'bold' },
  { icon: Italic, label: 'Italic', action: 'italic' },
  { icon: Underline, label: 'Underline', action: 'underline' },
  { icon: Type, label: 'Heading', action: 'heading' },
  { icon: Link, label: 'Link', action: 'link' },
  { icon: Image, label: 'Image', action: 'image' },
  { icon: List, label: 'Bullet List', action: 'ul' },
  { icon: ListOrdered, label: 'Numbered List', action: 'ol' },
  { icon: AlignLeft, label: 'Align Left', action: 'alignLeft' },
  { icon: AlignCenter, label: 'Align Center', action: 'alignCenter' },
  { icon: Code, label: 'Code Block', action: 'code' },
  { icon: Quote, label: 'Quote', action: 'quote' },
]

export const mockContentTypes: ContentType[] = [
  { id: 'ct-1', name: 'Blog Članak', slug: 'blog-post', description: 'Blog post sa kategorijama, tagovima i SEO', icon: 'Newspaper', fields: [{ id: 'f1', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f2', name: 'Istaknuta slika', type: 'image', required: false }, { id: 'f3', name: 'Tagovi', type: 'tags', required: false }, { id: 'f4', name: 'Autor', type: 'select', required: true, options: ['Marko', 'Ana', 'Nikola'] }], itemCount: 8, template: 'blog' },
  { id: 'ct-2', name: 'Stranica', slug: 'page', description: 'Statična stranica (O nama, Kontakt...)', icon: 'Layout', fields: [{ id: 'f5', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f6', name: 'Naslovna slika', type: 'image', required: false }], itemCount: 4, template: 'page' },
  { id: 'ct-3', name: 'Članak', slug: 'article', description: 'Dugački članak sa sekcijama', icon: 'BookOpen', fields: [{ id: 'f7', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f8', name: 'Autor', type: 'select', required: true, options: ['Marko', 'Ana', 'Nikola', 'Jelena'] }, { id: 'f9', name: 'Kategorija', type: 'select', required: false, options: ['Tehnologija', 'Biznis', 'Dizajn'] }], itemCount: 3, template: 'article' },
  { id: 'ct-4', name: 'Vest', slug: 'news', description: 'Kratke vesti sa hitnim objavama', icon: 'Megaphone', fields: [{ id: 'f10', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f11', name: 'Istaknuta', type: 'boolean', required: false }, { id: 'f12', name: 'Izvor', type: 'text', required: false }], itemCount: 2, template: 'news' },
  { id: 'ct-5', name: 'Landing Page', slug: 'landing', description: 'Promo stranica za kampanje', icon: 'Globe2', fields: [{ id: 'f13', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f14', name: 'CTA tekst', type: 'text', required: true }, { id: 'f15', name: 'CTA link', type: 'text', required: true }], itemCount: 1, template: 'landing' },
  { id: 'ct-6', name: 'FAQ', slug: 'faq', description: 'Pitanja i odgovori', icon: 'HelpCircle', fields: [{ id: 'f16', name: 'Pitanje', type: 'richtext', required: true }, { id: 'f17', name: 'Odgovor', type: 'richtext', required: true }, { id: 'f18', name: 'Kategorija', type: 'select', required: false, options: ['Opšte', 'Proizvodi', 'Plaćanje', 'Dostava'] }], itemCount: 2, template: 'faq' },
  { id: 'ct-7', name: 'Dokumentacija', slug: 'docs', description: 'Tehnička dokumentacija', icon: 'FileCode', fields: [{ id: 'f19', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f20', name: 'Verzija', type: 'text', required: false }, { id: 'f21', name: 'Kategorija', type: 'select', required: false, options: ['API', 'Setup', 'Troubleshooting', 'Migration'] }], itemCount: 1, template: 'docs' },
]

export const mockCategories: ContentCategory[] = [
  { id: 'cat-1', name: 'Tehnologija', slug: 'tehnologija', description: 'IT i tech vesti', parentId: null, color: '#3b82f6', itemCount: 5 },
  { id: 'cat-2', name: 'Biznis', slug: 'biznis', description: 'Poslovne vesti', parentId: null, color: '#22c55e', itemCount: 4 },
  { id: 'cat-3', name: 'Dizajn', slug: 'dizajn', description: 'UI/UX dizajn', parentId: null, color: '#8b5cf6', itemCount: 3 },
  { id: 'cat-4', name: 'Marketing', slug: 'marketing', description: 'Digitalni marketing', parentId: null, color: '#f59e0b', itemCount: 3 },
  { id: 'cat-5', name: 'Proizvodi', slug: 'proizvodi', description: 'Novosti o proizvodima', parentId: null, color: '#ef4444', itemCount: 2 },
  { id: 'cat-6', name: 'Vodiči', slug: 'vodici', description: 'Tutorijali i uputstva', parentId: 'cat-1', color: '#06b6d4', itemCount: 2 },
  { id: 'cat-7', name: 'API', slug: 'api', description: 'API dokumentacija', parentId: 'cat-1', color: '#14b8a6', itemCount: 1 },
  { id: 'cat-8', name: 'Startup', slug: 'startup', description: 'Startup ekosistem', parentId: 'cat-2', color: '#ec4899', itemCount: 2 },
]

export const mockAuthors = [
  { id: 'auth-1', name: 'Marko Petrović', avatar: 'MP' },
  { id: 'auth-2', name: 'Ana Jovanović', avatar: 'AJ' },
  { id: 'auth-3', name: 'Nikola Stanković', avatar: 'NS' },
  { id: 'auth-4', name: 'Jelena Milić', avatar: 'JM' },
  { id: 'auth-5', name: 'Ivan Savić', avatar: 'IS' },
]

export const mockContent: ContentItem[] = [
  { id: 'c-1', title: 'Kako napraviti SEO strategiju za 2025', slug: 'seo-strategija-2025', typeId: 'ct-1', categoryId: 'cat-4', authorId: 'auth-1', status: 'published', content: '<h2>SEO je ključan</h2><p>SEO optimizacija je osnova svake uspešne online prisutnosti...</p><p>U ovom članku ćemo pokriti najnovije trendove u SEO strategiji za 2025 godinu.</p>', excerpt: 'Kompletni vodič za SEO strategiju u 2025. godini sa praktičnim savetima.', featuredImage: '/images/seo-2025.jpg', tags: ['SEO', 'Marketing', '2025'], views: 4520, wordCount: 1850, readingTime: 8, seoTitle: 'SEO Strategija 2025 — Kompletni Vodič | Reflection', seoDescription: 'Naučite kako da kreirate efikasnu SEO strategiju za 2025 godinu.', ogImage: '/images/seo-og.jpg', publishedAt: '2025-01-15T10:00:00Z', scheduledAt: '', createdAt: '2025-01-14T08:00:00Z', updatedAt: '2025-01-15T10:00:00Z', revisionCount: 3, locale: 'sr' },
  { id: 'c-2', title: 'Uvod u React Server Components', slug: 'react-server-components', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-2', status: 'published', content: '<h2>Šta su RSC?</h2><p>React Server Components donose revoluciju u React razvoj...</p>', excerpt: 'Sve što treba da znate o React Server Components u Next.js 16.', featuredImage: '/images/rsc.jpg', tags: ['React', 'Next.js', 'RSC'], views: 3890, wordCount: 2400, readingTime: 12, seoTitle: 'React Server Components — Uvod | Reflection', seoDescription: 'Sve što treba da znate o React Server Components.', ogImage: '/images/rsc-og.jpg', publishedAt: '2025-01-20T09:00:00Z', scheduledAt: '', createdAt: '2025-01-19T14:00:00Z', updatedAt: '2025-01-20T09:00:00Z', revisionCount: 5, locale: 'sr' },
  { id: 'c-3', title: 'O nama', slug: 'o-nama', typeId: 'ct-2', categoryId: 'cat-2', authorId: 'auth-1', status: 'published', content: '<h2>Reflection Business</h2><p>Reflection Business je kompletni ERP sistem za mala i srednja preduzeća...</p>', excerpt: 'Upoznajte Reflection Business — kompletni ERP za vašu kompaniju.', featuredImage: '/images/about.jpg', tags: ['kompanija'], views: 5600, wordCount: 900, readingTime: 4, seoTitle: 'O nama — Reflection Business', seoDescription: 'Reflection Business je kompletni ERP sistem za mala i srednja preduzeća.', ogImage: '', publishedAt: '2025-01-01T00:00:00Z', scheduledAt: '', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-01T00:00:00Z', revisionCount: 8, locale: 'sr' },
  { id: 'c-4', title: 'Kontakt', slug: 'kontakt', typeId: 'ct-2', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', content: '<h2>Kontaktirajte nas</h2><p>Posaljite upit putem forme ili nas pozovite...</p>', excerpt: 'Kontaktirajte Reflection Business tim.', featuredImage: '', tags: ['kontakt'], views: 3200, wordCount: 450, readingTime: 2, seoTitle: 'Kontakt — Reflection Business', seoDescription: 'Kontaktirajte Reflection Business tim za više informacija.', ogImage: '', publishedAt: '2025-01-01T00:00:00Z', scheduledAt: '', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-01T00:00:00Z', revisionCount: 4, locale: 'sr' },
  { id: 'c-5', title: 'AI transformiše biznis u Srbiji', slug: 'ai-biznis-srbija', typeId: 'ct-4', categoryId: 'cat-2', authorId: 'auth-2', status: 'published', content: '<h2>AI revolucija</h2><p>Veštačka inteligencija menja način na koji poslujemo u Srbiji...</p>', excerpt: 'Kako AI menja poslovni krajolik u Srbiji.', featuredImage: '/images/ai-srbija.jpg', tags: ['AI', 'Srbija', 'Biznis'], views: 3210, wordCount: 1200, readingTime: 5, seoTitle: 'AI Biznis Srbija 2025 | Reflection', seoDescription: 'Kako veštačka inteligencija transformiše biznis u Srbiji.', ogImage: '/images/ai-og.jpg', publishedAt: '2025-02-20T10:00:00Z', scheduledAt: '', createdAt: '2025-02-19T09:00:00Z', updatedAt: '2025-02-20T10:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-6', title: '10 saveta za produktivniji rad', slug: 'saveti-za-produktivnost', typeId: 'ct-3', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', content: '<h2>Produktivnost</h2><p>Pomodoro tehnika, time blocking, deep work...</p>', excerpt: '10 praktičnih saveta za poboljšanje produktivnosti.', featuredImage: '/images/productivity.jpg', tags: ['Produktivnost', 'Saveti'], views: 2340, wordCount: 1600, readingTime: 7, seoTitle: '10 Saveta za Produktivnost | Reflection', seoDescription: 'Poboljšajte svoju produktivnost sa ovim 10 praktičnih saveta.', ogImage: '', publishedAt: '2025-02-01T11:00:00Z', scheduledAt: '', createdAt: '2025-01-30T10:00:00Z', updatedAt: '2025-02-01T11:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-7', title: 'Next.js 16 — Nove mogućnosti', slug: 'nextjs-16-novosti', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-1', status: 'published', content: '<h2>Next.js 16</h2><p>Nove mogućnosti: turbopack, server actions v2...</p>', excerpt: 'Upoznajte se sa novim funkcionalnostima u Next.js 16.', featuredImage: '/images/nextjs16.jpg', tags: ['Next.js', 'React', 'Framework'], views: 5670, wordCount: 2100, readingTime: 10, seoTitle: 'Next.js 16 Nove Mogućnosti | Reflection', seoDescription: 'Upoznajte se sa novim funkcionalnostima u Next.js 16.', ogImage: '', publishedAt: '2025-02-10T08:00:00Z', scheduledAt: '', createdAt: '2025-02-09T16:00:00Z', updatedAt: '2025-02-10T08:00:00Z', revisionCount: 4, locale: 'sr' },
  { id: 'c-8', title: 'UI/UX dizajn trendovi 2025', slug: 'ui-ux-trendovi-2025', typeId: 'ct-1', categoryId: 'cat-3', authorId: 'auth-4', status: 'published', content: '<h2>Trendovi</h2><p>Glassmorphism, neubrutalizam, 3D elementi...</p>', excerpt: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', featuredImage: '/images/uiux.jpg', tags: ['Dizajn', 'UI', 'UX'], views: 1890, wordCount: 1400, readingTime: 7, seoTitle: 'UI/UX Trendovi 2025 | Reflection', seoDescription: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', ogImage: '', publishedAt: '2025-02-15T14:00:00Z', scheduledAt: '', createdAt: '2025-02-14T12:00:00Z', updatedAt: '2025-02-15T14:00:00Z', revisionCount: 1, locale: 'sr' },
  { id: 'c-9', title: 'Vodič za TypeScript tipove', slug: 'typescript-tipovi', typeId: 'ct-3', categoryId: 'cat-1', authorId: 'auth-3', status: 'scheduled', content: '<h2>TypeScript</h2><p>Unioni, interfejsi, generici...</p>', excerpt: 'Kompletni vodič za TypeScript tipove.', featuredImage: '', tags: ['TypeScript', 'Programiranje'], views: 0, wordCount: 3200, readingTime: 15, seoTitle: 'TypeScript Tipovi Vodič | Reflection', seoDescription: 'Kompletni vodič za TypeScript tipove.', ogImage: '', publishedAt: '', scheduledAt: '2025-03-01T08:00:00Z', createdAt: '2025-02-25T10:00:00Z', updatedAt: '2025-02-25T10:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-10', title: 'Optimizacija baze podataka', slug: 'optimizacija-baze', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-1', status: 'draft', content: '<h2>Performanse</h2><p>Indeksi, query planning, caching...</p>', excerpt: 'Kako optimizovati upite baze podataka.', featuredImage: '', tags: ['Database', 'Performance'], views: 0, wordCount: 2200, readingTime: 11, seoTitle: 'Optimizacija Baze Podataka | Reflection', seoDescription: 'Kako optimizovati upite baze podataka.', ogImage: '', publishedAt: '', scheduledAt: '', createdAt: '2025-02-28T14:00:00Z', updatedAt: '2025-02-28T14:00:00Z', revisionCount: 0, locale: 'sr' },
  { id: 'c-11', title: 'API Reference v2.0', slug: 'api-reference-v2', typeId: 'ct-7', categoryId: 'cat-7', authorId: 'auth-5', status: 'published', content: '<h2>API v2.0</h2><p>Novi endpointi, autentikacija, rate limiting...</p>', excerpt: 'Službena API dokumentacija za Reflection Business v2.0.', featuredImage: '', tags: ['API', 'Dokumentacija'], views: 1200, wordCount: 4500, readingTime: 20, seoTitle: 'API Reference v2.0 | Reflection Business', seoDescription: 'Službena API dokumentacija za Reflection Business v2.0.', ogImage: '', publishedAt: '2025-01-25T10:00:00Z', scheduledAt: '', createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z', revisionCount: 12, locale: 'sr' },
  { id: 'c-12', title: 'Česta pitanja — Plaćanje', slug: 'faq-placanje', typeId: 'ct-6', categoryId: 'cat-2', authorId: 'auth-4', status: 'published', content: '<h2>Plaćanje</h2><p>Koje metode plaćanja prihvatate? Da li imate mesečne planove?</p>', excerpt: 'Česta pitanja o načinima plaćanja.', featuredImage: '', tags: ['FAQ', 'Plaćanje'], views: 890, wordCount: 600, readingTime: 3, seoTitle: 'FAQ — Plaćanje | Reflection Business', seoDescription: 'Česta pitanja o načinima plaćanja za Reflection Business.', ogImage: '', publishedAt: '2025-01-10T10:00:00Z', scheduledAt: '', createdAt: '2025-01-08T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z', revisionCount: 3, locale: 'sr' },
  { id: 'c-13', title: 'Promocija: 30% popusta na godišnju pretplatu', slug: 'promo-30-popust', typeId: 'ct-5', categoryId: 'cat-4', authorId: 'auth-2', status: 'scheduled', content: '<h2>Limited Offer</h2><p>Prijavite se do kraja meseca i dobijte 30% popusta...</p>', excerpt: '30% popusta na godišnju pretplatu do kraja meseca.', featuredImage: '/images/promo.jpg', tags: ['Promocija', 'Popust'], views: 0, wordCount: 350, readingTime: 2, seoTitle: '30% Popust Godišnja Pretplata | Reflection', seoDescription: 'Prijavite se do kraja meseca i dobijte 30% popusta.', ogImage: '/images/promo-og.jpg', publishedAt: '', scheduledAt: '2025-03-15T00:00:00Z', createdAt: '2025-02-28T16:00:00Z', updatedAt: '2025-02-28T16:00:00Z', revisionCount: 1, locale: 'sr' },
  { id: 'c-14', title: 'Društvene mreže za mala preduzeća', slug: 'drustvene-mreze-sme', typeId: 'ct-1', categoryId: 'cat-4', authorId: 'auth-4', status: 'draft', content: '<h2>Social Media Marketing</h2><p>Instagram, Facebook, LinkedIn strategija za SME...</p>', excerpt: 'Kako koristiti društvene mreže za rast biznisa.', featuredImage: '', tags: ['Social Media', 'Marketing', 'SME'], views: 0, wordCount: 1100, readingTime: 5, seoTitle: 'Društvene Mreže za SME | Reflection', seoDescription: 'Kako koristiti društvene mreže za rast malog biznisa.', ogImage: '', publishedAt: '', scheduledAt: '', createdAt: '2025-03-01T09:00:00Z', updatedAt: '2025-03-01T09:00:00Z', revisionCount: 0, locale: 'sr' },
  { id: 'c-15', title: 'DevOps prakse za timove', slug: 'devops-prakse', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-3', status: 'published', content: '<h2>CI/CD</h2><p>Docker, Kubernetes, GitHub Actions...</p>', excerpt: 'Najbolje DevOps prakse za razvojne timove.', featuredImage: '/images/devops.jpg', tags: ['DevOps', 'Docker', 'CI/CD'], views: 2670, wordCount: 2800, readingTime: 13, seoTitle: 'DevOps Prakse za Timove | Reflection', seoDescription: 'Najbolje DevOps prakse za razvojne timove.', ogImage: '', publishedAt: '2025-03-10T09:00:00Z', scheduledAt: '', createdAt: '2025-03-09T11:00:00Z', updatedAt: '2025-03-10T09:00:00Z', revisionCount: 3, locale: 'sr' },
]

export const mockMedia: MediaItem[] = [
  { id: 'm-1', name: 'hero-banner.jpg', type: 'image', mimeType: 'image/jpeg', size: 245000, url: '/uploads/hero-banner.jpg', folderId: 'folder-1', alt: 'Hero banner', width: 1920, height: 600, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 3 },
  { id: 'm-2', name: 'logo-dark.png', type: 'image', mimeType: 'image/png', size: 45000, url: '/uploads/logo-dark.png', folderId: 'folder-1', alt: 'Logo tamna', width: 200, height: 60, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 8 },
  { id: 'm-3', name: 'logo-light.png', type: 'image', mimeType: 'image/png', size: 42000, url: '/uploads/logo-light.png', folderId: 'folder-1', alt: 'Logo svetla', width: 200, height: 60, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 6 },
  { id: 'm-4', name: 'product-catalog-2025.pdf', type: 'document', mimeType: 'application/pdf', size: 3200000, url: '/uploads/product-catalog-2025.pdf', folderId: 'folder-2', alt: '', width: 0, height: 0, uploadedAt: '2025-01-20T14:00:00Z', usageCount: 2 },
  { id: 'm-5', name: 'promo-video.mp4', type: 'video', mimeType: 'video/mp4', size: 15000000, url: '/uploads/promo-video.mp4', folderId: 'folder-3', alt: 'Promo video', width: 1920, height: 1080, uploadedAt: '2025-02-01T10:00:00Z', usageCount: 1 },
  { id: 'm-6', name: 'team-photo.jpg', type: 'image', mimeType: 'image/jpeg', size: 890000, url: '/uploads/team-photo.jpg', folderId: 'folder-4', alt: 'Tim foto', width: 1200, height: 800, uploadedAt: '2025-02-05T12:00:00Z', usageCount: 2 },
  { id: 'm-7', name: 'favicon.ico', type: 'icon', mimeType: 'image/x-icon', size: 4000, url: '/uploads/favicon.ico', folderId: 'folder-1', alt: 'Favicon', width: 32, height: 32, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 1 },
  { id: 'm-8', name: 'about-office.jpg', type: 'image', mimeType: 'image/jpeg', size: 1200000, url: '/uploads/about-office.jpg', folderId: 'folder-4', alt: 'Kancelarija', width: 1600, height: 900, uploadedAt: '2025-01-15T09:00:00Z', usageCount: 1 },
  { id: 'm-9', name: 'podcast-ep1.mp3', type: 'audio', mimeType: 'audio/mpeg', size: 8000000, url: '/uploads/podcast-ep1.mp3', folderId: 'folder-5', alt: 'Podcast epizoda 1', width: 0, height: 0, uploadedAt: '2025-02-20T16:00:00Z', usageCount: 0 },
  { id: 'm-10', name: 'og-default.jpg', type: 'image', mimeType: 'image/jpeg', size: 180000, url: '/uploads/og-default.jpg', folderId: 'folder-1', alt: 'OG default', width: 1200, height: 630, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 5 },
  { id: 'm-11', name: 'user-guide.pdf', type: 'document', mimeType: 'application/pdf', size: 1500000, url: '/uploads/user-guide.pdf', folderId: 'folder-2', alt: '', width: 0, height: 0, uploadedAt: '2025-02-10T10:00:00Z', usageCount: 3 },
  { id: 'm-12', name: 'icon-settings.svg', type: 'icon', mimeType: 'image/svg+xml', size: 2000, url: '/uploads/icon-settings.svg', folderId: 'folder-1', alt: 'Settings ikona', width: 24, height: 24, uploadedAt: '2025-01-12T10:00:00Z', usageCount: 1 },
]

export const mockFolders: MediaFolder[] = [
  { id: 'folder-1', name: 'Logotipi', parentId: null, itemCount: 4 },
  { id: 'folder-2', name: 'Dokumenta', parentId: null, itemCount: 2 },
  { id: 'folder-3', name: 'Video', parentId: null, itemCount: 1 },
  { id: 'folder-4', name: 'Fotografije', parentId: null, itemCount: 2 },
  { id: 'folder-5', name: 'Audio', parentId: null, itemCount: 1 },
  { id: 'folder-6', name: 'E-mail šablone', parentId: null, itemCount: 0 },
]

export const mockRevisions: Revision[] = [
  { id: 'r-1', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Dodat novi odeljak o AI SEO alatima', wordCount: 1850, createdAt: '2025-01-15T10:00:00Z', restoredFrom: null },
  { id: 'r-2', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Ispravljena gramatika i formatiranje', wordCount: 1800, createdAt: '2025-01-14T16:00:00Z', restoredFrom: null },
  { id: 'r-3', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Dodat section o lokalnom SEO', wordCount: 1650, createdAt: '2025-01-14T12:00:00Z', restoredFrom: null },
  { id: 'r-4', contentId: 'c-2', contentTitle: 'Uvod u React Server Components', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Ažuriran primer koda za Next.js 16', wordCount: 2400, createdAt: '2025-01-20T09:00:00Z', restoredFrom: null },
  { id: 'r-5', contentId: 'c-2', contentTitle: 'Uvod u React Server Components', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Dodat odeljak o data fetching', wordCount: 2200, createdAt: '2025-01-19T18:00:00Z', restoredFrom: null },
  { id: 'r-6', contentId: 'c-3', contentTitle: 'O nama', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Ažuriran tekst o kompaniji', wordCount: 900, createdAt: '2025-01-01T00:00:00Z', restoredFrom: null },
  { id: 'r-7', contentId: 'c-7', contentTitle: 'Next.js 16 — Nove mogućnosti', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Dodat section o Turbopack', wordCount: 2100, createdAt: '2025-02-10T08:00:00Z', restoredFrom: null },
  { id: 'r-8', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-5', authorName: 'Ivan Savić', changeSummary: 'Novi endpoint: /api/v2/webhooks', wordCount: 4500, createdAt: '2025-01-25T10:00:00Z', restoredFrom: null },
  { id: 'r-9', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-5', authorName: 'Ivan Savić', changeSummary: 'Dodat autentikacija sekcija', wordCount: 4200, createdAt: '2025-01-24T15:00:00Z', restoredFrom: null },
  { id: 'r-10', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Pocetna verzija dokumentacije', wordCount: 3000, createdAt: '2025-01-20T10:00:00Z', restoredFrom: null },
]

export const issues: SeoAnalysis['issues'] = []

export const titleLen = item.seoTitle.length;

export const descLen = item.seoDescription.length;

export const wordCount = item.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

export const headings = (item.content.match(/<h[1-6]/g) || []).length;

export const images = (item.content.match(/<img/g) || []).length;

export const links = (item.content.match(/<a\s/g) || []).length;

export const titleScore = titleLen >= 30 && titleLen <= 60 ? 25 : titleLen > 0 ? 10 : 0;

export const descScore = descLen >= 120 && descLen <= 160 ? 25 : descLen > 0 ? 10 : 0;

export const contentScore = wordCount >= 300 ? 25 : wordCount >= 150 ? 15 : 5;

export const headingScore = headings > 0 ? 15 : 0;

export const mediaScore = images > 0 ? 10 : 0;

export const score = titleScore + descScore + contentScore + headingScore + mediaScore;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const res = await fetch(`/api/cms/content?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const published = content.filter(c => c.status === 'published');

export const drafts = content.filter(c => c.status === 'draft');

export const scheduled = content.filter(c => c.status === 'scheduled');

export const totalViews = content.reduce((s, c) => s + c.views, 0);

export const totalWords = content.reduce((s, c) => s + c.wordCount, 0);

export const typePie = generateTypePie(content);

export const topContent = [...published].sort((a, b) => b.views - a.views).slice(0, 5);

export const recentContent = [...content].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

export const filtered = content.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && c.typeId !== typeFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (catFilter !== 'all' && c.categoryId !== catFilter) return false
    return true
  });

export const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true) }

export const openEditor = (item: ContentItem) => {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, typeId: item.typeId, categoryId: item.categoryId,
      authorId: item.authorId, status: item.status, content: item.content, excerpt: item.excerpt,
      featuredImage: item.featuredImage, tags: item.tags, seoTitle: item.seoTitle,
      seoDescription: item.seoDescription, ogImage: item.ogImage, scheduledAt: item.scheduledAt || '', locale: item.locale,
    })
    setSeoPreview(null)
    setEditorOpen(true)
  }

export const handleSave = () => {
    if (editing) {
      setContent(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length, readingTime: Math.ceil(form.content.split(/\s+/).length / 200), updatedAt: new Date().toISOString(), revisionCount: c => c.revisionCount + 1 } : c))
    } else {
      const newItem: ContentItem = {
        id: `c-${Date.now()}`, title: form.title, slug: form.slug || generateSlug(form.title),
        typeId: form.typeId, categoryId: form.categoryId, authorId: form.authorId, status: form.status,
        content: form.content, excerpt: form.excerpt, featuredImage: form.featuredImage,
        tags: form.tags, views: 0, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length,
        readingTime: Math.ceil(form.content.split(/\s+/).length / 200), seoTitle: form.seoTitle,
        seoDescription: form.seoDescription, ogImage: form.ogImage, publishedAt: form.status === 'published' ? new Date().toISOString() : '',
        scheduledAt: form.scheduledAt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revisionCount: 0, locale: form.locale,
      }
      setContent(prev => [...prev, newItem])
    }
    setDialogOpen(false)
    setEditorOpen(false)
  }

export const handleDelete = (id: string) => setContent(prev => prev.filter(c => c.id !== id));

export const advanceStatus = (item: ContentItem) => {
    const idx = statusWorkflow.indexOf(item.status)
    if (idx < statusWorkflow.length - 1) setContent(prev => prev.map(c => c.id === item.id ? { ...c, status: statusWorkflow[idx + 1], publishedAt: statusWorkflow[idx + 1] === 'published' ? new Date().toISOString() : c.publishedAt } : c))
  }

export const toggleTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }))
  }

export const runSeoAnalysis = () => {
    if (editing) {
      const temp = { ...editing, ...form }
      setSeoPreview(analyzeSeo(temp))
    }
  }

export const allTags = [...new Set(content.flatMap(c => c.tags))]

export const handleCreate = () => {
    const newType: ContentType = { id: `ct-${Date.now()}`, name: form.name, slug: generateSlug(form.name), description: form.description, icon: form.icon, fields: [{ id: `f-${Date.now()}`, name: 'Sadržaj', type: 'richtext', required: true }], itemCount: 0, template: 'custom' }
    setTypes(prev => [...prev, newType])
    setDialogOpen(false)
    setForm({ name: '', description: '', icon: 'FileText' })
  }

export const handleDelete = (id: string) => setTypes(prev => prev.filter(t => t.id !== id));

export const filtered = media.filter(m => {
    if (folderFilter !== 'all' && m.folderId !== folderFilter) return false
    if (typeFilter !== 'all' && m.type !== typeFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  });

export const totalSize = media.reduce((s, m) => s + m.size, 0);

export const filtered = selectedContent === 'all' ? revisions : revisions.filter(r => r.contentId === selectedContent);

export const scheduled = content.filter(c => c.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

export const drafts = content.filter(c => c.status === 'draft');

export const recentlyPublished = content.filter(c => c.status === 'published').sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5);

export const item = content.find(c => c.id === selected);

export const analysis = item ? analyzeSeo(item) : null;

export const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

export const supportedLocales = [
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sr-latn', name: 'Srpski (latinica)', flag: '🇷🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'me', name: 'Crnogorski', flag: '🇲🇪' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'uz', name: 'Oʻzbek', flag: '🇺🇿' },
  { code: 'kk', name: 'Қазақ', flag: '🇰🇿' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'eu', name: 'Euskara', flag: '🇪🇸' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'gd', name: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'lb', name: 'Lëtzebuergesch', flag: '🇱🇺' },
]

export const sitemapItems = [
  { url: '/o-nama', priority: 0.8, changefreq: 'monthly', lastMod: '2025-01-01' },
  { url: '/kontakt', priority: 0.7, changefreq: 'monthly', lastMod: '2025-01-01' },
  { url: '/blog/seo-strategija-2025', priority: 0.9, changefreq: 'weekly', lastMod: '2025-01-15' },
  { url: '/blog/react-server-components', priority: 0.9, changefreq: 'weekly', lastMod: '2025-01-20' },
  { url: '/blog/nextjs-16-novosti', priority: 0.9, changefreq: 'weekly', lastMod: '2025-02-10' },
  { url: '/docs/api-reference-v2', priority: 0.8, changefreq: 'weekly', lastMod: '2025-01-25' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly', lastMod: '2025-01-10' },
]

export const mockRelations: ContentRelation[] = [
  { id: 'rel-1', sourceId: 'c-1', sourceTitle: 'SEO strategija 2025', targetId: 'c-8', targetTitle: 'UI/UX trendovi 2025', type: 'related' },
  { id: 'rel-2', sourceId: 'c-2', sourceTitle: 'React Server Components', targetId: 'c-7', targetTitle: 'Next.js 16', type: 'series' },
  { id: 'rel-3', sourceId: 'c-5', sourceTitle: 'AI biznis Srbija', targetId: 'c-6', targetTitle: '10 saveta za produktivnost', type: 'related' },
  { id: 'rel-4', sourceId: 'c-1', sourceTitle: 'SEO strategija 2025', targetId: 'c-1-en', sourceTitle: 'SEO Strategy 2025', targetId: 'c-1', targetTitle: 'SEO strategija 2025', type: 'translation' },
]

export const relationTypeConfig: Record<string, { label: string; color: string }> = {
  related: { label: 'Srodan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  translation: { label: 'Prevod', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  series: { label: 'Serija', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  reference: { label: 'Referenca', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export const authors = mockAuthors.map(a => {
    const authorContent = content.filter(c => c.authorId === a.id)
    return {
      name: a.name,
      avatar: a.avatar,
      published: authorContent.filter(c => c.status === 'published').length,
      drafts: authorContent.filter(c => c.status === 'draft').length,
      totalViews: authorContent.reduce((s, c) => s + c.views, 0),
      totalWords: authorContent.reduce((s, c) => s + c.wordCount, 0),
    }
  }).filter(a => a.published + a.drafts > 0).sort((a, b) => b.totalViews - a.totalViews);

export const categoryStats = mockCategories.filter(c => !c.parentId).map(cat => ({
    name: cat.name,
    color: cat.color,
    count: content.filter(c => c.categoryId === cat.id || mockCategories.find(p => p.id === cat.id)?.parentId === cat.id).length,
  }));

export const avgReadingTime = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.readingTime, 0) / content.length) : 0;

export const avgWordCount = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.wordCount, 0) / content.length) : 0;

export const item = content.find(c => c.id === selected);

export const analysis = item ? analyzeSeo(item) : null;

export const analytics = generateContentAnalytics(content);

export const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

export function getAuthorName(id: string): string { return mockAuthors.find(a => a.id === id)?.name ?? 'Nepoznat' }

export function getCategoryName(id: string): string { return mockCategories.find(c => c.id === id)?.name ?? '' }

export function getCategoryColor(id: string): string { return mockCategories.find(c => c.id === id)?.color ?? '#6b7280' }

export function getContentTypeName(id: string): string { return mockContentTypes.find(t => t.id === id)?.name ?? '' }

export function emptyForm(): ContentForm {
  return { title: '', slug: '', typeId: 'ct-1', categoryId: '', authorId: '', status: 'draft', content: '', excerpt: '', featuredImage: '', tags: [], seoTitle: '', seoDescription: '', ogImage: '', scheduledAt: '', locale: 'sr' }
}

export function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9šđčćžŠĐČĆŽ\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function analyzeSeo(item: ContentItem): SeoAnalysis {
  const issues: SeoAnalysis['issues'] = []
  const titleLen = item.seoTitle.length
  const descLen = item.seoDescription.length
  const wordCount = item.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const headings = (item.content.match(/<h[1-6]/g) || []).length
  const images = (item.content.match(/<img/g) || []).length
  const links = (item.content.match(/<a\s/g) || []).length
  if (titleLen < 30) issues.push({ type: 'warning', message: 'SEO naslov je prekratak (min 30 karaktera)' })
  if (titleLen > 60) issues.push({ type: 'warning', message: 'SEO naslov je predug (max 60 karaktera)' })
  if (descLen < 120) issues.push({ type: 'warning', message: 'SEO opis je prekratak (min 120 karaktera)' })
  if (descLen > 160) issues.push({ type: 'warning', message: 'SEO opis je predug (max 160 karaktera)' })
  if (!item.featuredImage) issues.push({ type: 'info', message: 'Nema istaknute slike' })
  if (wordCount < 300) issues.push({ type: 'warning', message: 'Sadržaj je kratak (min 300 reči za SEO)' })
  if (headings === 0) issues.push({ type: 'error', message: 'Nema naslova (H1-H6) u sadržaju' })
  if (images === 0) issues.push({ type: 'info', message: 'Nema slika u sadržaju' })
  const titleScore = titleLen >= 30 && titleLen <= 60 ? 25 : titleLen > 0 ? 10 : 0
  const descScore = descLen >= 120 && descLen <= 160 ? 25 : descLen > 0 ? 10 : 0
  const contentScore = wordCount >= 300 ? 25 : wordCount >= 150 ? 15 : 5
  const headingScore = headings > 0 ? 15 : 0
  const mediaScore = images > 0 ? 10 : 0
  const score = titleScore + descScore + contentScore + headingScore + mediaScore
  return { score, titleLength: titleLen, descriptionLength: descLen, keywordDensity: 2.1, readability: 72, wordCount, headings, images, links, issues }
}

export function generateMonthlyTrend() {
  return [
    { month: 'Jan', objavljeno: 4, nacrta: 2, ukupno: 6 },
    { month: 'Feb', objavljeno: 5, nacrta: 3, ukupno: 8 },
    { month: 'Mar', objavljeno: 3, nacrta: 1, ukupno: 4 },
  ]
}

export function generateTypePie(content: ContentItem[]) {
  return mockContentTypes.map(t => ({ name: t.name, value: content.filter(c => c.typeId === t.id).length })).filter(d => d.value > 0)
}

export function generateContentAnalytics(content: ContentItem[]) {
  const authors = mockAuthors.map(a => {
    const authorContent = content.filter(c => c.authorId === a.id)
    return {
      name: a.name,
      avatar: a.avatar,
      published: authorContent.filter(c => c.status === 'published').length,
      drafts: authorContent.filter(c => c.status === 'draft').length,
      totalViews: authorContent.reduce((s, c) => s + c.views, 0),
      totalWords: authorContent.reduce((s, c) => s + c.wordCount, 0),
    }
  }).filter(a => a.published + a.drafts > 0).sort((a, b) => b.totalViews - a.totalViews)

  const categoryStats = mockCategories.filter(c => !c.parentId).map(cat => ({
    name: cat.name,
    color: cat.color,
    count: content.filter(c => c.categoryId === cat.id || mockCategories.find(p => p.id === cat.id)?.parentId === cat.id).length,
  }))

  const avgReadingTime = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.readingTime, 0) / content.length) : 0
  const avgWordCount = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.wordCount, 0) / content.length) : 0

  return { authors, categoryStats, avgReadingTime, avgWordCount }
}
