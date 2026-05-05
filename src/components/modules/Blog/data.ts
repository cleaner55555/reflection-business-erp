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

export const { t } = useTranslation();

export const res = await fetch(`/api/blog/posts?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const items = data.items || data || []

export const { t } = useTranslation();

export const totalPosts = posts.length;

export const publishedPosts = posts.filter((p) => p.status === 'published');

export const draftPosts = posts.filter((p) => p.status === 'draft');

export const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

export const totalComments = comments.length;

export const totalAuthors = new Set(posts.map((p) => p.authorId)).size;

export const categoryPieData = categories.map((c) => ({
    name: c.name,
    value: posts.filter((p) => p.categoryId === c.id).length,
    color: c.color,
  })).filter((d) => d.value > 0);

export const topPosts = [...publishedPosts].sort((a, b) => b.views - a.views).slice(0, 5);

export const recentComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

export const cfg = commentStatusConfig[c.status]

export const { t } = useTranslation();

export const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (authorFilter !== 'all' && p.authorId !== authorFilter) return false
    return true
  });

export const openCreate = () => {
    setEditingPost(null)
    setForm(emptyPostForm())
    setDialogOpen(true)
  }

export const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setForm({
      title: post.title, categoryId: post.categoryId, authorId: post.authorId,
      content: post.content, status: post.status, tags: post.tags,
      featured: post.featured, seoTitle: post.seoTitle, seoDescription: post.seoDescription,
      publishedAt: post.publishedAt || '',
    })
    setDialogOpen(true)
  }

export const handleSave = () => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, ...form } : p))
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`, title: form.title, content: form.content,
        categoryId: form.categoryId, authorId: form.authorId, status: form.status,
        views: 0, commentCount: 0, tags: form.tags, featured: form.featured,
        seoTitle: form.seoTitle, seoDescription: form.seoDescription,
        publishedAt: form.publishedAt, createdAt: new Date().toISOString(), readingTime: Math.ceil(form.content.split(/\s+/).length / 200),
      }
      setPosts((prev) => [...prev, newPost])
    }
    setDialogOpen(false)
  }

export const handleDuplicate = (post: BlogPost) => {
    const dup: BlogPost = { ...post, id: `post-${Date.now()}`, title: `${post.title} (kopija)`, views: 0, commentCount: 0, status: 'draft', createdAt: new Date().toISOString() }
    setPosts((prev) => [...prev, dup])
  }

export const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

export const advanceStatus = (post: BlogPost) => {
    const idx = statusWorkflow.indexOf(post.status)
    if (idx < statusWorkflow.length - 1) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: statusWorkflow[idx + 1] } : p))
    }
  }

export const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((t) => t !== tagId) : [...prev.tags, tagId],
    }))
  }

export const cfg = postStatusConfig[p.status]

export const statusIdx = statusWorkflow.indexOf(p.status);

export const { t } = useTranslation();

export const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', color: '#6b7280' })
    setDialogOpen(true)
  }

export const openEdit = (cat: BlogCategory) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, color: cat.color })
    setDialogOpen(true)
  }

export const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (editing) {
      setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form, slug } : c))
    } else {
      setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, ...form, slug, postCount: 0 }])
    }
    setDialogOpen(false)
  }

export const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

export const postCount = posts.filter((p) => p.categoryId === cat.id).length;

export const { t } = useTranslation();

export const filtered = comments.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (postFilter !== 'all' && c.postId !== postFilter) return false
    if (dateFilter !== 'all') {
      const now = new Date()
      const commentDate = new Date(c.createdAt)
      const diffDays = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (dateFilter === '7d' && diffDays > 7) return false
      if (dateFilter === '30d' && diffDays > 30) return false
    }
    return true
  });

export const toggleSelect = (id: string) => {
    setSelectedComments((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

export const bulkApprove = () => {
    setComments((prev) => prev.map((c) => selectedComments.includes(c.id) ? { ...c, status: 'approved' as const } : c))
    setSelectedComments([])
  }

export const bulkReject = () => {
    setComments((prev) => prev.map((c) => selectedComments.includes(c.id) ? { ...c, status: 'rejected' as const } : c))
    setSelectedComments([])
  }

export const updateStatus = (id: string, status: BlogComment['status']) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
  }

export const handleReply = () => {
    if (!replyDialog || !replyText.trim()) return
    const newReply: BlogComment = {
      id: `cmt-${Date.now()}`, authorName: 'Admin', postId: replyDialog.postId,
      postTitle: replyDialog.postTitle, content: replyText, status: 'approved',
      createdAt: new Date().toISOString(), parentId: replyDialog.id,
    }
    setComments((prev) => [...prev, newReply])
    setReplyDialog(null)
    setReplyText('')
  }

export const pendingCount = comments.filter((c) => c.status === 'pending').length;

export const cfg = commentStatusConfig[c.status]

export const { t } = useTranslation();

export const filteredPosts = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : []

export const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '' })
    setDialogOpen(true)
  }

export const openEdit = (tag: BlogTag) => {
    setEditing(tag)
    setForm({ name: tag.name, slug: tag.slug })
    setDialogOpen(true)
  }

export const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (editing) {
      setTags((prev) => prev.map((t) => t.id === editing.id ? { ...t, ...form, slug } : t))
    } else {
      setTags((prev) => [...prev, { id: `tag-${Date.now()}`, ...form, slug, postCount: 0 }])
    }
    setDialogOpen(false)
  }

export const handleDelete = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    if (activeTag === id) setActiveTag(null)
  }

export const maxPostCount = Math.max(...tags.map((t) => t.postCount), 1);

export const scale = 0.75 + (tag.postCount / maxPostCount) * 0.75;

export const cfg = postStatusConfig[p.status]

export const { t } = useTranslation();

export const publishedPosts = posts.filter((p) => p.status === 'published');

export const topPerforming = [...publishedPosts].sort((a, b) => b.views - a.views).slice(0, 6);

export const trafficSources = [
    { name: 'Google', value: 45, color: '#22c55e' },
    { name: 'Društvene mreže', value: 25, color: '#3b82f6' },
    { name: 'Direktan', value: 15, color: '#f59e0b' },
    { name: 'Referal', value: 10, color: '#8b5cf6' },
    { name: 'Email', value: 5, color: '#ef4444' },
  ]

export const keywords = [
    { keyword: 'Next.js tutorial', impressions: 12500, clicks: 3200, ctr: '25.6%', position: 3.2 },
    { keyword: 'React Server Components', impressions: 8900, clicks: 2100, ctr: '23.6%', position: 4.1 },
    { keyword: 'SEO strategija 2025', impressions: 6700, clicks: 1800, ctr: '26.9%', position: 2.8 },
    { keyword: 'UI dizajn trendovi', impressions: 5400, clicks: 1200, ctr: '22.2%', position: 5.5 },
    { keyword: 'TypeScript vodič', impressions: 4200, clicks: 980, ctr: '23.3%', position: 6.1 },
    { keyword: 'Startup Srbija', impressions: 3800, clicks: 890, ctr: '23.4%', position: 4.8 },
  ]

export const authorStats = mockAuthors.map((a) => {
    const authorPosts = posts.filter((p) => p.authorId === a.id)
    const totalViews = authorPosts.reduce((s, p) => s + p.views, 0)
    return {
      name: a.name,
      posts: authorPosts.length,
      views: totalViews,
      avgViews: authorPosts.length > 0 ? Math.round(totalViews / authorPosts.length) : 0,
    }
  }).sort((a, b) => b.views - a.views);

export const readingTimeTrend = generateReadingTimeTrend();

export const heatmapData: { day: string; mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number }[] = [
    { day: 'W1', mon: 2, tue: 1, wed: 3, thu: 0, fri: 2, sat: 1, sun: 0 },
    { day: 'W2', mon: 1, tue: 2, wed: 1, thu: 3, fri: 1, sat: 0, sun: 1 },
    { day: 'W3', mon: 0, tue: 1, wed: 2, thu: 1, fri: 3, sat: 1, sun: 0 },
    { day: 'W4', mon: 3, tue: 2, wed: 0, thu: 2, fri: 1, sat: 2, sun: 1 },
  ]

export const maxHeatmap = Math.max(...heatmapData.flatMap((d) => [d.mon, d.tue, d.wed, d.thu, d.fri, d.sat, d.sun]), 1);

export const getHeatColor = (val: number) => {
    if (val === 0) return 'bg-muted'
    const intensity = val / maxHeatmap
    if (intensity <= 0.33) return 'bg-green-200 dark:bg-green-900/40'
    if (intensity <= 0.66) return 'bg-green-400 dark:bg-green-700/60'
    return 'bg-green-600 dark:bg-green-500'
  }

export function getAuthorName(id: string): string {
  return mockAuthors.find((a) => a.id === id)?.name ?? 'Nepoznat'
}

export function getCategoryName(id: string): string {
  return mockCategories.find((c) => c.id === id)?.name ?? ''
}

export function getCategoryColor(id: string): string {
  return mockCategories.find((c) => c.id === id)?.color ?? '#6b7280'
}

export function emptyPostForm(): PostForm {
  return {
    title: '', categoryId: '', authorId: '', content: '', status: 'draft',
    tags: [], featured: false, seoTitle: '', seoDescription: '', publishedAt: '',
  }
}

export function generateMonthlyTrend(): { month: string; posts: number }[] {
  return [
    { month: 'Jan', posts: 3 },
    { month: 'Feb', posts: 5 },
    { month: 'Mar', posts: 7 },
  ]
}

export function generateReadingTimeTrend(): { month: string; avgTime: number }[] {
  return [
    { month: 'Jan', avgTime: 7.2 },
    { month: 'Feb', avgTime: 8.5 },
    { month: 'Mar', avgTime: 9.8 },
  ]
}
