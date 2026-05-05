export const pageTypeConfig: Record<string, { label: string; color: string }> = {
  home: { label: 'Početna', color: 'bg-green-100 text-green-700' },
  about: { label: 'O nama', color: 'bg-sky-100 text-sky-700' },
  contact: { label: 'Kontakt', color: 'bg-amber-100 text-amber-700' },
  product: { label: 'Proizvodi', color: 'bg-purple-100 text-purple-700' },
  blog: { label: 'Blog', color: 'bg-pink-100 text-pink-700' },
  pricing: { label: 'Cenovnik', color: 'bg-emerald-100 text-emerald-700' },
  custom: { label: 'Prilagođena', color: 'bg-gray-100 text-gray-700' },
}

export const pageStatusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500' },
}

export const sectionTypes: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  hero: { label: 'Hero sekcija', icon: Megaphone, description: 'Veliki naslov, podnaslov i CTA dugme' },
  features: { label: 'Prikaži prednosti', icon: Sparkles, description: 'Grid sa ikonama i opisom' },
  testimonials: { label: 'Utisci korisnika', icon: Star, description: 'Kartice sa recenzijama' },
  cta: { label: 'Poziv na akciju', icon: Target, description: 'CTA sekcija sa dugmadima' },
  pricing: { label: 'Cenovnik', icon: Layers, description: 'Kartice sa planovima' },
  faq: { label: 'Česta pitanja', icon: BookOpen, description: 'Proširiva lista FAQ' },
  team: { label: 'Tim', icon: Users, description: 'Članovi tima sa pozicijama' },
  gallery: { label: 'Galerija', icon: Image, description: 'Grid sa slikama' },
  stats: { label: 'Statistike', icon: BarChart3, description: 'Brojevi i metrike' },
  contact_form: { label: 'Kontakt forma', icon: Mail, description: 'Forma za kontakt' },
}

export const templateOptions: Record<string, { label: string; sections: string[] }> = {
  blank: { label: 'Prazna stranica', sections: [] },
  landing: { label: 'Landing stranica', sections: ['hero', 'features', 'testimonials', 'cta', 'pricing'] },
  about: { label: 'O nama', sections: ['hero', 'stats', 'team', 'faq', 'cta'] },
  contact: { label: 'Kontakt', sections: ['hero', 'contact_form', 'faq'] },
  blog_home: { label: 'Blog početna', sections: ['hero', 'features'] },
  portfolio: { label: 'Portfolio', sections: ['hero', 'gallery', 'testimonials', 'cta'] },
  pricing_page: { label: 'Stranica cenovnika', sections: ['hero', 'pricing', 'faq', 'cta'] },
}

export const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open_sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'merriweather', label: 'Merriweather' },
]

export const buttonStyleOptions = [
  { value: 'rounded', label: 'Zaobljeno' },
  { value: 'pill', label: 'Pilula' },
  { value: 'sharp', label: 'Oštro' },
  { value: 'outline', label: 'Kontura' },
]

export const menuIcons = [
  'Home', 'FileText', 'ShoppingCart', 'Phone', 'Mail',
  'Users', 'Settings', 'Star', 'Heart', 'BookOpen',
  'BarChart3', 'Globe2', 'Package', 'Shield', 'Zap',
]

export const componentLibrary: ComponentItem[] = [
  { id: 'c1', name: 'Heder navigacija', category: 'Navigacija', description: 'Fiksni heder sa logo, meni i CTA dugme', icon: Menu, sections: ['logo', 'nav_links', 'cta_button'] },
  { id: 'c2', name: 'Hero sa pozadinom', category: 'Hero', description: 'Veliki hero sa slikom u pozadini i overlay', icon: Frame, sections: ['background_image', 'heading', 'subheading', 'cta'] },
  { id: 'c3', name: 'Hero sa video pozadinom', category: 'Hero', description: 'Video hero sekcija sa autoplej opcijom', icon: RectangleHorizontal, sections: ['video_bg', 'heading', 'subheading', 'cta'] },
  { id: 'c4', name: 'Grid prednosti', category: 'Sadržaj', description: '3 ili 4 kolone sa ikonama i opisom', icon: Sparkles, sections: ['icon', 'title', 'description'] },
  { id: 'c5', name: 'Kartice usluga', category: 'Sadržaj', description: 'Kartice sa slikama i tekstom', icon: Layers, sections: ['image', 'title', 'description', 'link'] },
  { id: 'c6', name: 'Testimonial slajder', category: 'Društveni dokaz', description: 'Rotirajuće recenzije korisnika', icon: Star, sections: ['avatar', 'name', 'role', 'quote', 'rating'] },
  { id: 'c7', name: 'Logos klijenata', category: 'Društveni dokaz', description: 'Grid sa logouma partnera', icon: Users, sections: ['logo_grid'] },
  { id: 'c8', name: 'Cenovnik tabela', category: 'Cenovnik', description: '3 kolone sa planovima cenovnika', icon: Layers, sections: ['plan_name', 'price', 'features_list', 'cta_button'] },
  { id: 'c9', name: 'FAQ akordeon', category: 'Sadržaj', description: 'Proširiva lista pitanja i odgovora', icon: BookOpen, sections: ['question', 'answer'] },
  { id: 'c10', name: 'Tim sekcija', category: 'Sadržaj', description: 'Članovi tima sa slikama i pozicijama', icon: Users, sections: ['photo', 'name', 'role', 'social_links'] },
  { id: 'c11', name: 'Galerija', category: 'Mediji', description: 'Responsivni grid sa slikama', icon: Image, sections: ['image_grid', 'lightbox'] },
  { id: 'c12', name: 'CTA sekcija', category: 'Poziv na akciju', description: 'Poziv na akciju sa dugmadima', icon: Target, sections: ['heading', 'description', 'primary_btn', 'secondary_btn'] },
  { id: 'c13', name: 'Kontakt forma', category: 'Forme', description: 'Forma sa poljima i validacijom', icon: Mail, sections: ['name', 'email', 'phone', 'message', 'submit'] },
  { id: 'c14', name: 'Mapa', category: 'Mediji', description: 'Google Maps integracija', icon: Globe2, sections: ['map_embed', 'address', 'hours'] },
  { id: 'c15', name: 'Futer', category: 'Navigacija', description: 'Višekolonski futer sa linkovima', icon: AlignLeft, sections: ['logo', 'link_columns', 'social_links', 'copyright'] },
  { id: 'c16', name: 'Newsletter sekcija', category: 'Forme', description: 'Pretplata na newsletter sa email poljem', icon: Mail, sections: ['heading', 'description', 'email_input', 'subscribe_btn'] },
]

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('sr-RS', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const res = await fetch(`/api/website/pages?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const res = await fetch(`/api/website/media?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const res = await fetch(`/api/website/menu?companyId=${activeCompanyId}`);

export const data = await res.json();

export const publishedPages = pages.filter((p) => p.status === 'published').length;

export const draftPages = pages.filter((p) => p.status === 'draft').length;

export const totalTraffic = pages.reduce((sum, p) => sum + (p.traffic || 0), 0);

export const avgSeoScore = pages.length > 0;

export const seoScoreColor = avgSeoScore >= 80 ? 'text-green-600' : avgSeoScore >= 50 ? 'text-amber-600' : 'text-red-600';

export const seoScoreLabel = avgSeoScore >= 80 ? 'Odličan' : avgSeoScore >= 50 ? 'Dobar' : 'Potreban rad';

export const filteredPages = pages.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.slug.toLowerCase().includes(search.toLowerCase())) return false
    if (pageFilter !== 'all' && p.status !== pageFilter) return false
    return true
  });

export const filteredMedia = mediaFiles.filter((m) => {
    if (mediaFilter !== 'all' && !m.type.startsWith(mediaFilter)) return false
    if (mediaSearch && !m.name.toLowerCase().includes(mediaSearch.toLowerCase())) return false
    return true
  });

export const recentPages = [...pages].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5);

export const popularPages = [...pages].sort((a, b) => (b.traffic || 0) - (a.traffic || 0)).slice(0, 5);

export const componentCategories = [...new Set(componentLibrary.map((c) => c.category))]

export const emptyPageForm = { title: '', slug: '', type: 'custom', status: 'draft', template: 'blank', metaDescription: '', sections: [] as PageSection[] }

export const openPageDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page)
      setPageForm({
        title: page.title, slug: page.slug, type: page.type,
        status: page.status, template: page.template || 'blank',
        metaDescription: page.metaDescription || '', sections: page.sections || [],
      })
    } else {
      setEditingPage(null)
      setPageForm(emptyPageForm)
    }
    setPageDialogOpen(true)
  }

export const applyTemplate = (templateKey: string) => {
    const tpl = templateOptions[templateKey]
    if (!tpl) return
    const sections: PageSection[] = tpl.sections.map((type, idx) => ({
      id: `sec-${Date.now()}-${idx}`,
      type,
      title: sectionTypes[type]?.label || type,
      enabled: true,
      orderNum: idx,
    }))
    setPageForm((f) => ({ ...f, template: templateKey, sections }))
  }

export const addSection = (type: string) => {
    const sec: PageSection = {
      id: `sec-${Date.now()}`,
      type,
      title: sectionTypes[type]?.label || type,
      enabled: true,
      orderNum: pageForm.sections.length,
    }
    setPageForm((f) => ({ ...f, sections: [...f.sections, sec] }))
  }

export const removeSection = (id: string) => {
    setPageForm((f) => ({ ...f, sections: f.sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, orderNum: i })) }))
  }

export const moveSection = (id: string, direction: 'up' | 'down') => {
    const idx = pageForm.sections.findIndex((s) => s.id === id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === pageForm.sections.length - 1)) return
    const newSections = [...pageForm.sections]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]]
    setPageForm((f) => ({ ...f, sections: newSections.map((s, i) => ({ ...s, orderNum: i })) }))
  }

export const toggleSection = (id: string) => {
    setPageForm((f) => ({
      ...f,
      sections: f.sections.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s),
    }))
  }

export const handleSavePage = async () => {
    if (!activeCompanyId) return
    const slug = pageForm.slug || pageForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-čćžšđ]/g, '')
    try {
      const res = await fetch('/api/website/pages', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...pageForm, slug }),
      })
      if (res.ok) {
        setPageDialogOpen(false)
        setEditingPage(null)
        setPageForm(emptyPageForm)
        loadPages()
      }
    } catch { /* silent */ }
  }

export const handleDeletePage = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu stranicu?')) return
    try {
      const res = await fetch(`/api/website/pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPages()
    } catch { /* silent */ }
  }

export const openSeoDialog = (page: Page) => {
    setSelectedPageSeo(page)
    setSeoForm({
      metaTitle: page.seoTitle || page.title,
      metaDescription: page.metaDescription || '',
      ogTitle: page.title,
      ogDescription: page.metaDescription || '',
      ogImage: '', canonicalUrl: '', robotsIndex: true, robotsFollow: true, structuredData: '',
    })
    setSeoDialogOpen(true)
  }

export const generateMetaDescription = () => {
    const descs: Record<string, string> = {
      home: 'Zvanični sajt naše kompanije. Otkrijte naše proizvode, usluge i rešenja za vaše poslovanje.',
      about: 'Saznajte više o našoj kompaniji, našoj misiji, vrednostima i timu koji stoji iza našeg uspeha.',
      contact: 'Kontaktirajte nas. Radno vreme, adresa, telefon i kontakt forma za sve vaše upite.',
      product: 'Pregledajte našu ponudu proizvoda. Kvalitet, povoljne cene i brza dostava.',
      blog: 'Čitajte naše najnovije članke, vesti i savete iz oblasti poslovanja i industrije.',
      pricing: 'Pregledajte naše cene i odaberite plan koji najbolje odgovara vašim potrebama.',
      custom: 'Saznajte više o našoj ponudi i uslugama prilagođenim vašim potrebama.',
    }
    setSeoForm((f) => ({ ...f, metaDescription: descs[pageForm.type] || `Stranica ${pageForm.title} - saznajte više o našim uslugama i ponudi.` }))
  }

export const emptyMenuForm = { label: '', url: '/', icon: 'Home', parentId: null as string | null, orderNum: 0, target: '_self', visible: true }

export const openMenuDialog = (item?: MenuItem) => {
    if (item) {
      setEditingMenu(item)
      setMenuForm({ label: item.label, url: item.url, icon: item.icon, parentId: item.parentId, orderNum: item.orderNum, target: item.target, visible: item.visible })
    } else {
      setEditingMenu(null)
      setMenuForm(emptyMenuForm)
    }
    setMenuDialogOpen(true)
  }

export const handleSaveMenu = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/website/menu', {
        method: editingMenu ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...menuForm, id: editingMenu?.id }),
      })
      if (res.ok) { setMenuDialogOpen(false); loadMenuItems() }
    } catch { /* silent */ }
  }

export const handleDeleteMenu = async (id: string) => {
    if (!confirm('Obrisati stavku menija?')) return
    try {
      const res = await fetch(`/api/website/menu?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadMenuItems()
    } catch { /* silent */ }
  }

export const toggleMenuExpand = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

export const rootMenuItems = menuItems.filter((m) => !m.parentId);

export const getChildren = (parentId: string) => menuItems.filter((m) => m.parentId === parentId);

export const updateColor = (key: keyof ThemeColors, value: string) => {
    setTheme((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }

export const updateTheme = (key: keyof ThemeSettings, value: string | boolean) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

export const secType = sectionTypes[sec.type]
