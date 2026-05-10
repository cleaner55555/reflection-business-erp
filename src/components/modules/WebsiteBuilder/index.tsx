'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Globe2, Plus, Search, Eye, Trash2, Edit3, RefreshCw, ArrowLeft,
  CheckCircle2, Clock, BarChart3, ExternalLink, FileCode,
  Layout, Palette, Type, Image, Settings, Zap, Shield,
  TrendingUp, Users, ArrowUpRight, ArrowDownRight, Minus,
  Copy, GripVertical, ChevronRight, ChevronDown, Menu,
  Monitor, Moon, Sun, Upload, Filter, Layers, MousePointer,
  Star, AlertTriangle, Sparkles, ImagePlus, FolderOpen,
  MousePointerClick, Link2, X, MoveUp, MoveDown, Circle,
  Square, RectangleHorizontal, Megaphone, Target, BookOpen,
  Paintbrush, Heading1, Heading2, AlignLeft, Frame,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Page {
  id: string
  title: string
  slug: string
  type: string
  status: string
  seoTitle?: string
  metaDescription?: string
  template?: string
  sections?: PageSection[]
  traffic?: number
  seoScore?: number
  updatedAt?: string
  createdAt: string
}

interface PageSection {
  id: string
  type: string
  title: string
  enabled: boolean
  orderNum: number
}

interface MenuItem {
  id: string
  label: string
  url: string
  icon: string
  parentId: string | null
  orderNum: number
  target: string
  visible: boolean
  children?: MenuItem[]
}

interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnail?: string
  uploadedAt: string
  usageCount: number
  alt?: string
}

interface ComponentItem {
  id: string
  name: string
  category: string
  description: string
  icon: React.ElementType
  sections: string[]
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  muted: string
  border: string
}

interface ThemeSettings {
  colors: ThemeColors
  headingFont: string
  bodyFont: string
  headingSize: string
  bodySize: string
  borderRadius: string
  buttonStyle: string
  darkMode: boolean
}

interface SeoSettings {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonicalUrl: string
  robotsIndex: boolean
  robotsFollow: boolean
  structuredData: string
}

// ─── Configs ─────────────────────────────────────────────────────────────────

const pageTypeConfig: Record<string, { label: string; color: string }> = {
  home: { label: 'Početna', color: 'bg-green-100 text-green-700' },
  about: { label: 'O nama', color: 'bg-sky-100 text-sky-700' },
  contact: { label: 'Kontakt', color: 'bg-amber-100 text-amber-700' },
  product: { label: 'Proizvodi', color: 'bg-purple-100 text-purple-700' },
  blog: { label: 'Blog', color: 'bg-pink-100 text-pink-700' },
  pricing: { label: 'Cenovnik', color: 'bg-emerald-100 text-emerald-700' },
  custom: { label: 'Prilagođena', color: 'bg-gray-100 text-gray-700' },
}

const pageStatusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500' },
}

const sectionTypes: Record<string, { label: string; icon: React.ElementType; description: string }> = {
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

const templateOptions: Record<string, { label: string; sections: string[] }> = {
  blank: { label: 'Prazna stranica', sections: [] },
  landing: { label: 'Landing stranica', sections: ['hero', 'features', 'testimonials', 'cta', 'pricing'] },
  about: { label: 'O nama', sections: ['hero', 'stats', 'team', 'faq', 'cta'] },
  contact: { label: 'Kontakt', sections: ['hero', 'contact_form', 'faq'] },
  blog_home: { label: 'Blog početna', sections: ['hero', 'features'] },
  portfolio: { label: 'Portfolio', sections: ['hero', 'gallery', 'testimonials', 'cta'] },
  pricing_page: { label: 'Stranica cenovnika', sections: ['hero', 'pricing', 'faq', 'cta'] },
}

const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open_sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'merriweather', label: 'Merriweather' },
]

const buttonStyleOptions = [
  { value: 'rounded', label: 'Zaobljeno' },
  { value: 'pill', label: 'Pilula' },
  { value: 'sharp', label: 'Oštro' },
  { value: 'outline', label: 'Kontura' },
]

const menuIcons = [
  'Home', 'FileText', 'ShoppingCart', 'Phone', 'Mail',
  'Users', 'Settings', 'Star', 'Heart', 'BookOpen',
  'BarChart3', 'Globe2', 'Package', 'Shield', 'Zap',
]

const componentLibrary: ComponentItem[] = [
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

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('sr-RS', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Mail icon alias
import { Mail } from 'lucide-react'

// ─── Component ───────────────────────────────────────────────────────────────

export function WebsiteBuilder() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Pages state
  const [pages, setPages] = useState<Page[]>([])
  const [pagesSubTab, setPagesSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [pageFilter, setPageFilter] = useState('all')
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false)

  // Media state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [mediaFilter, setMediaFilter] = useState('all')
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaSubTab, setMediaSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)

  // Navigation state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [navSubTab, setNavSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  // SEO state
  const [seoSubTab, setSeoSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [selectedPageSeo, setSelectedPageSeo] = useState<Page | null>(null)
  const [seoForm, setSeoForm] = useState<SeoSettings>({
    metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '',
    ogImage: '', canonicalUrl: '', robotsIndex: true, robotsFollow: true, structuredData: '',
  })

  // Theme state
  const [theme, setTheme] = useState<ThemeSettings>({
    colors: { primary: '#10b981', secondary: '#6366f1', accent: '#f59e0b', background: '#ffffff', text: '#1f2937', muted: '#6b7280', border: '#e5e7eb' },
    headingFont: 'inter', bodyFont: 'inter', headingSize: '32', bodySize: '16',
    borderRadius: '8', buttonStyle: 'rounded', darkMode: false,
  })

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadPages = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/website/pages?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setPages(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  const loadMedia = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/website/media?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setMediaFiles(data.items || data || [])
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  const loadMenuItems = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/website/menu?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setMenuItems(data.items || data || [])
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => {
    loadPages()
    loadMedia()
    loadMenuItems()
  }, [activeCompanyId, loadPages, loadMedia, loadMenuItems])

  // ─── Computed Values ──────────────────────────────────────────────────────

  const publishedPages = pages.filter((p) => p.status === 'published').length
  const draftPages = pages.filter((p) => p.status === 'draft').length
  const totalTraffic = pages.reduce((sum, p) => sum + (p.traffic || 0), 0)
  const avgSeoScore = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.seoScore || 0), 0) / pages.length)
    : 0
  const seoScoreColor = avgSeoScore >= 80 ? 'text-green-600' : avgSeoScore >= 50 ? 'text-amber-600' : 'text-red-600'
  const seoScoreLabel = avgSeoScore >= 80 ? 'Odličan' : avgSeoScore >= 50 ? 'Dobar' : 'Potreban rad'

  const filteredPages = pages.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.slug.toLowerCase().includes(search.toLowerCase())) return false
    if (pageFilter !== 'all' && p.status !== pageFilter) return false
    return true
  })

  const filteredMedia = mediaFiles.filter((m) => {
    if (mediaFilter !== 'all' && !m.type.startsWith(mediaFilter)) return false
    if (mediaSearch && !m.name.toLowerCase().includes(mediaSearch.toLowerCase())) return false
    return true
  })

  const recentPages = [...pages].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5)
  const popularPages = [...pages].sort((a, b) => (b.traffic || 0) - (a.traffic || 0)).slice(0, 5)

  const componentCategories = [...new Set(componentLibrary.map((c) => c.category))]

  // ─── Page Form ────────────────────────────────────────────────────────────

  const emptyPageForm = { title: '', slug: '', type: 'custom', status: 'draft', template: 'blank', metaDescription: '', sections: [] as PageSection[] }
  const [pageForm, setPageForm] = useState(emptyPageForm)

  const openPageForm = (page?: Page) => {
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
    setSectionPickerOpen(false)
    setPagesSubTab('dodaj')
  }

  const applyTemplate = (templateKey: string) => {
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

  const addSection = (type: string) => {
    const sec: PageSection = {
      id: `sec-${Date.now()}`,
      type,
      title: sectionTypes[type]?.label || type,
      enabled: true,
      orderNum: pageForm.sections.length,
    }
    setPageForm((f) => ({ ...f, sections: [...f.sections, sec] }))
  }

  const removeSection = (id: string) => {
    setPageForm((f) => ({ ...f, sections: f.sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, orderNum: i })) }))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const idx = pageForm.sections.findIndex((s) => s.id === id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === pageForm.sections.length - 1)) return
    const newSections = [...pageForm.sections]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]]
    setPageForm((f) => ({ ...f, sections: newSections.map((s, i) => ({ ...s, orderNum: i })) }))
  }

  const toggleSection = (id: string) => {
    setPageForm((f) => ({
      ...f,
      sections: f.sections.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s),
    }))
  }

  const handleSavePage = async () => {
    if (!activeCompanyId) return
    const slug = pageForm.slug || pageForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-čćžšđ]/g, '')
    try {
      const res = await fetch('/api/website/pages', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...pageForm, slug }),
      })
      if (res.ok) {
        setPagesSubTab('pregled')
        setEditingPage(null)
        setPageForm(emptyPageForm)
        loadPages()
      }
    } catch { /* silent */ }
  }

  const handleDeletePage = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu stranicu?')) return
    try {
      const res = await fetch(`/api/website/pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPages()
    } catch { /* silent */ }
  }

  // ─── SEO Functions ────────────────────────────────────────────────────────

  const openSeoForm = (page: Page) => {
    setSelectedPageSeo(page)
    setSeoForm({
      metaTitle: page.seoTitle || page.title,
      metaDescription: page.metaDescription || '',
      ogTitle: page.title,
      ogDescription: page.metaDescription || '',
      ogImage: '', canonicalUrl: '', robotsIndex: true, robotsFollow: true, structuredData: '',
    })
    setSeoSubTab('dodaj')
  }

  const generateMetaDescription = () => {
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

  // ─── Menu Functions ───────────────────────────────────────────────────────

  const emptyMenuForm = { label: '', url: '/', icon: 'Home', parentId: null as string | null, orderNum: 0, target: '_self', visible: true }
  const [menuForm, setMenuForm] = useState(emptyMenuForm)

  const openMenuForm = (item?: MenuItem) => {
    if (item) {
      setEditingMenu(item)
      setMenuForm({ label: item.label, url: item.url, icon: item.icon, parentId: item.parentId, orderNum: item.orderNum, target: item.target, visible: item.visible })
    } else {
      setEditingMenu(null)
      setMenuForm(emptyMenuForm)
    }
    setNavSubTab('dodaj')
  }

  const handleSaveMenu = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/website/menu', {
        method: editingMenu ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...menuForm, id: editingMenu?.id }),
      })
      if (res.ok) { setNavSubTab('pregled'); loadMenuItems() }
    } catch { /* silent */ }
  }

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Obrisati stavku menija?')) return
    try {
      const res = await fetch(`/api/website/menu?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadMenuItems()
    } catch { /* silent */ }
  }

  const toggleMenuExpand = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rootMenuItems = menuItems.filter((m) => !m.parentId)
  const getChildren = (parentId: string) => menuItems.filter((m) => m.parentId === parentId)

  // ─── Robots / Sitemap ─────────────────────────────────────────────────────

  const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml')
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml')

  // ─── Theme Functions ──────────────────────────────────────────────────────

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setTheme((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }

  const updateTheme = (key: keyof ThemeSettings, value: string | boolean) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Builder</h1>
          <p className="text-sm text-muted-foreground">Kreiranje i upravljanje veb stranicama, SEO, temama i medijima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadPages(); loadMedia(); loadMenuItems() }}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setEditingPage(null); setPageForm(emptyPageForm); setSectionPickerOpen(false); setActiveTab('pages'); setPagesSubTab('dodaj') }}>
            <Plus className="h-4 w-4 mr-1" /> Nova stranica
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs"><FileCode className="h-4 w-4 mr-1 hidden sm:inline" /> Stranice</TabsTrigger>
          <TabsTrigger value="components" className="text-xs"><Layers className="h-4 w-4 mr-1 hidden sm:inline" /> Komponente</TabsTrigger>
          <TabsTrigger value="navigation" className="text-xs"><Menu className="h-4 w-4 mr-1 hidden sm:inline" /> Navigacija</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs"><Shield className="h-4 w-4 mr-1 hidden sm:inline" /> SEO</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs"><Palette className="h-4 w-4 mr-1 hidden sm:inline" /> Tema</TabsTrigger>
          <TabsTrigger value="media" className="text-xs"><Image className="h-4 w-4 mr-1 hidden sm:inline" /> Mediji</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PREGLED (Overview) Tab                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Ukupno stranica</span>
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{pages.length}</p>
              <div className="flex items-center mt-1"><ArrowUpRight className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">+2 ovog meseca</span></div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Objavljene</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{publishedPages}</p>
              <Progress value={pages.length ? (publishedPages / pages.length) * 100 : 0} className="h-1.5 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Nacrti</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{draftPages}</p>
              <Progress value={pages.length ? (draftPages / pages.length) * 100 : 0} className="h-1.5 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Saobraćaj</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{totalTraffic.toLocaleString('sr-RS')}</p>
              <div className="flex items-center mt-1"><ArrowUpRight className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">+12%</span></div>
            </Card>
            <Card className="p-4 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">SEO ocena</span>
                <Shield className={`h-4 w-4 ${seoScoreColor}`} />
              </div>
              <p className={`text-2xl font-bold ${seoScoreColor}`}>{avgSeoScore}/100</p>
              <span className="text-xs text-muted-foreground">{seoScoreLabel}</span>
            </Card>
          </div>

          {/* Site Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zdravlje sajta</CardTitle>
              <CardDescription>Pregled statusa ključnih funkcionalnosti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'SSL sertifikat', status: true, desc: 'Aktivan, važi do 2026' },
                  { label: 'Google Analytics', status: true, desc: 'Povezan i aktivan' },
                  { label: 'Sitemap.xml', status: true, desc: `${pages.length} URL-ova indeksirano` },
                  { label: 'Robots.txt', status: true, desc: 'Konfigurisan' },
                  { label: 'Open Graph', status: pages.some((p) => p.seoTitle), desc: pages.some((p) => p.seoTitle) ? 'Podeseno' : 'Nije podeseno' },
                  { label: 'Canonical URL', status: false, desc: 'Preporučeno za SEO' },
                  { label: 'Struktuirani podaci', status: false, desc: 'Schema.org nije podešen' },
                  { label: 'Mobilna optimizacija', status: true, desc: 'Responsivan dizajn' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 border rounded-lg">
                    {item.status ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Pages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nedavno ažurirane stranice</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPages.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">Nema stranica</div>
                ) : (
                  <div className="space-y-3">
                    {recentPages.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">/{p.slug}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs shrink-0 ${pageStatusConfig[p.status]?.color}`}>
                          {pageStatusConfig[p.status]?.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Pages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Najposećenije stranice</CardTitle>
              </CardHeader>
              <CardContent>
                {popularPages.length === 0 || popularPages.every((p) => !p.traffic) ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">Nema podataka o saobraćaju</div>
                ) : (
                  <div className="space-y-3">
                    {popularPages.filter((p) => p.traffic && p.traffic > 0).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-5">#{idx + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{p.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-sm font-medium">{(p.traffic || 0).toLocaleString('sr-RS')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brze akcije</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Plus, label: 'Nova stranica', action: () => { setEditingPage(null); setPageForm(emptyPageForm); setSectionPickerOpen(false); setActiveTab('pages'); setPagesSubTab('dodaj') } },
                  { icon: Palette, label: 'Prilagodi temu', action: () => setActiveTab('theme') },
                  { icon: Shield, label: 'SEO podešavanja', action: () => setActiveTab('seo') },
                  { icon: ImagePlus, label: 'Upload medije', action: () => { setActiveTab('media'); setMediaSubTab('dodaj') } },
                ].map((item) => (
                  <Button key={item.label} variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={item.action}>
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STRANICE (Pages) Tab                                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="pages">
          <Tabs value={pagesSubTab} onValueChange={(v) => setPagesSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList>
              <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-4 w-4 mr-1" /> Dodaj/Uredi</TabsTrigger>
            </TabsList>

            {/* Pregled sub-tab */}
            <TabsContent value="pregled" className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži stranice po nazivu ili URL-u..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="published">Objavljene</SelectItem>
                <SelectItem value="draft">Nacrti</SelectItem>
                <SelectItem value="archived">Arhivirane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Summary */}
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">Ukupno: {pages.length}</Badge>
            <Badge variant="outline" className="text-xs text-green-600">Objavljene: {publishedPages}</Badge>
            <Badge variant="outline" className="text-xs text-amber-600">Nacrti: {draftPages}</Badge>
          </div>

          {/* Page List */}
          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredPages.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-1">Nema pronađenih stranica</p>
              <p className="text-xs text-muted-foreground mb-4">Kreirajte novu stranicu ili promenite filtere pretrage</p>
              <Button variant="outline" onClick={() => { setEditingPage(null); setPageForm(emptyPageForm); setSectionPickerOpen(false); setPagesSubTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> Kreiraj stranicu</Button>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Naziv</TableHead>
                    <TableHead className="text-xs">URL</TableHead>
                    <TableHead className="text-xs">Tip</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">SEO</TableHead>
                    <TableHead className="text-xs">Saobraćaj</TableHead>
                    <TableHead className="text-xs">Ažurirano</TableHead>
                    <TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">{p.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">/{p.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${pageTypeConfig[p.type]?.color}`}>
                          {pageTypeConfig[p.type]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${pageStatusConfig[p.status]?.color}`}>
                          {pageStatusConfig[p.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${(p.seoScore || 0) >= 80 ? 'bg-green-500' : (p.seoScore || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-xs">{p.seoScore || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{(p.traffic || 0).toLocaleString('sr-RS')}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(p.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setActiveTab('seo'); openSeoForm(p) }} title="SEO">
                            <Shield className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openPageForm(p)} title="Uredi">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeletePage(p.id)} title="Obriši">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </TabsContent>

            {/* Dodaj/Uredi sub-tab */}
            <TabsContent value="dodaj" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPagesSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                  <h3 className="text-sm font-semibold">{editingPage ? 'Uredi stranicu' : 'Nova stranica'}</h3>
                  <p className="text-xs text-muted-foreground">{editingPage ? 'Izmenite podešavanja postojeće stranice' : 'Kreirajte novu stranicu za vaš sajt'}</p>
                </div>
              </div>

              {sectionPickerOpen ? (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSectionPickerOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                      <CardTitle className="text-base">Dodaj sekciju</CardTitle>
                      <CardDescription>Izaberite tip sekcije koji želite da dodate na stranicu</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px]">
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(sectionTypes).map(([key, sec]) => (
                          <Button key={key} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => { addSection(key); setSectionPickerOpen(false) }}>
                            <sec.icon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs font-medium">{sec.label}</span>
                            <span className="text-xs text-muted-foreground text-center">{sec.description}</span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
              <Card>
                <CardContent className="max-w-2xl space-y-5">
                <div className="space-y-5">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><FileCode className="h-4 w-4" /> Osnovne informacije</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">Naziv stranice</Label>
                      <Input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-čćžšđ]/g, '') })} placeholder="Naziv stranice" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">URL slug</Label>
                        <Input value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} placeholder="url-slug-stranice" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Tip stranice</Label>
                        <Select value={pageForm.type} onValueChange={(v) => setPageForm({ ...pageForm, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(pageTypeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Status</Label>
                        <Select value={pageForm.status} onValueChange={(v) => setPageForm({ ...pageForm, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(pageStatusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Template</Label>
                        <Select value={pageForm.template} onValueChange={(v) => applyTemplate(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(templateOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Meta opis (SEO)</Label>
                      <Textarea value={pageForm.metaDescription} onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })} placeholder="Opišite stranicu u 1-2 rečenice za pretraživače..." className="min-h-[60px]" />
                      <p className="text-xs text-muted-foreground text-right">{pageForm.metaDescription.length}/160 karaktera</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Page Sections */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4" /> Sekcije stranice ({pageForm.sections.length})</h4>
                      <Button size="sm" variant="outline" onClick={() => setSectionPickerOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Dodaj sekciju</Button>
                    </div>
                    {pageForm.sections.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground">
                        <Layers className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Nema sekcija</p>
                        <p className="text-xs">Izaberite template ili dodajte sekcije ručno</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pageForm.sections.map((sec, idx) => {
                          const secType = sectionTypes[sec.type]
                          return (
                            <div key={sec.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!sec.enabled ? 'opacity-50' : ''}`}>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                              <div className="flex items-center gap-2 shrink-0">
                                {secType && <secType.icon className="h-4 w-4 text-muted-foreground" />}
                                <span className="text-xs font-medium">{secType?.label || sec.type}</span>
                              </div>
                              <div className="flex-1" />
                              <Switch checked={sec.enabled} onCheckedChange={() => toggleSection(sec.id)} className="shrink-0" />
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveSection(sec.id, 'up')} disabled={idx === 0}><MoveUp className="h-3 w-3" /></Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveSection(sec.id, 'down')} disabled={idx === pageForm.sections.length - 1}><MoveDown className="h-3 w-3" /></Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeSection(sec.id)}><X className="h-3 w-3" /></Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setPagesSubTab('pregled')}>Otkaži</Button>
                  <Button onClick={handleSavePage}>{editingPage ? 'Sačuvaj izmene' : 'Kreiraj stranicu'}</Button>
                </div>
                </CardContent>
              </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* KOMPONENTE (Components) Tab                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="components" className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Biblioteka ponovo upotrebljivih komponenti. Kliknite na komponentu da je kopirate u stranicu.
            </AlertDescription>
          </Alert>

          {componentCategories.map((category) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{category}</CardTitle>
                <CardDescription>{componentLibrary.filter((c) => c.category === category).length} komponenti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {componentLibrary.filter((c) => c.category === category).map((comp) => (
                    <div key={comp.id} className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <comp.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" title="Kopiraj na stranicu" onClick={() => { }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <h4 className="text-sm font-medium mb-1">{comp.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{comp.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {comp.sections.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {comp.sections.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{comp.sections.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* NAVIGACIJA (Navigation) Tab                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="navigation">
          <Tabs value={navSubTab} onValueChange={(v) => setNavSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList>
              <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-4 w-4 mr-1" /> Dodaj/Uredi</TabsTrigger>
            </TabsList>

            {/* Pregled sub-tab */}
            <TabsContent value="pregled" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Struktura menija</h3>
              <p className="text-sm text-muted-foreground">Upravljajte navigacionim menijem sajta</p>
            </div>
            <Button size="sm" onClick={() => { setEditingMenu(null); setMenuForm(emptyMenuForm); setNavSubTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> Nova stavka</Button>
          </div>

          {/* Menu Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pregled menija</CardTitle>
            </CardHeader>
            <CardContent>
              {rootMenuItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Menu className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Meni je prazan</p>
                  <p className="text-xs">Dodajte prvu stavku menija</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {rootMenuItems.sort((a, b) => a.orderNum - b.orderNum).map((item) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        {getChildren(item.id).length > 0 && (
                          <button onClick={() => toggleMenuExpand(item.id)} className="p-0">
                            {expandedMenus.has(item.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        )}
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.url}</span>
                        {!item.visible && <Badge variant="outline" className="text-xs text-red-500">Sakriveno</Badge>}
                        <Badge variant="outline" className="text-xs">{item.target === '_blank' ? 'Novi tab' : 'Isti tab'}</Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openMenuForm(item)}><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteMenu(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      {expandedMenus.has(item.id) && getChildren(item.id).length > 0 && (
                        <div className="ml-8 border-l-2 border-muted pl-2 space-y-1">
                          {getChildren(item.id).sort((a, b) => a.orderNum - b.orderNum).map((child) => (
                            <div key={child.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <Link2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm flex-1">{child.label}</span>
                              <span className="text-xs text-muted-foreground">{child.url}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openMenuForm(child)}><Edit3 className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteMenu(child.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Ukupno stavki</span>
              <p className="text-xl font-bold mt-1">{menuItems.length}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Nivoa dubine</span>
              <p className="text-xl font-bold mt-1">{menuItems.some((m) => m.parentId) ? 2 : 1}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Vidljive</span>
              <p className="text-xl font-bold mt-1">{menuItems.filter((m) => m.visible).length}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Spoljašnje linkovi</span>
              <p className="text-xl font-bold mt-1">{menuItems.filter((m) => m.target === '_blank').length}</p>
            </Card>
          </div>
            </TabsContent>

            {/* Dodaj/Uredi sub-tab */}
            <TabsContent value="dodaj" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNavSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                  <h3 className="text-sm font-semibold">{editingMenu ? 'Uredi stavku menija' : 'Nova stavka menija'}</h3>
                  <p className="text-xs text-muted-foreground">Podesite navigacionu stavku sajta</p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Naziv (label)</Label>
                      <Input value={menuForm.label} onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })} placeholder="Naziv stavke" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">URL</Label>
                      <Input value={menuForm.url} onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })} placeholder="/stranica ili https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Ikona</Label>
                        <Select value={menuForm.icon} onValueChange={(v) => setMenuForm({ ...menuForm, icon: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{menuIcons.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cilj (target)</Label>
                        <Select value={menuForm.target} onValueChange={(v) => setMenuForm({ ...menuForm, target: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_self">Isti tab</SelectItem>
                            <SelectItem value="_blank">Novi tab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Roditelj</Label>
                        <Select value={menuForm.parentId || 'none'} onValueChange={(v) => setMenuForm({ ...menuForm, parentId: v === 'none' ? null : v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Bez roditelja (root)</SelectItem>
                            {rootMenuItems.filter((m) => m.id !== editingMenu?.id).map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Redosled</Label>
                        <Input type="number" value={menuForm.orderNum} onChange={(e) => setMenuForm({ ...menuForm, orderNum: parseInt(e.target.value) || 0 })} min={0} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Vidljivo u meniju</Label>
                      <Switch checked={menuForm.visible} onCheckedChange={(v) => setMenuForm({ ...menuForm, visible: v })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setNavSubTab('pregled')}>Otkaži</Button>
                    <Button onClick={handleSaveMenu}>{editingMenu ? 'Sačuvaj' : 'Dodaj'}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SEO Tab                                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="seo">
          <Tabs value={seoSubTab} onValueChange={(v) => setSeoSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList>
              <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Shield className="h-4 w-4 mr-1" /> SEO Uredi</TabsTrigger>
            </TabsList>

            {/* Pregled sub-tab */}
            <TabsContent value="pregled" className="space-y-6">
          {/* SEO Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 flex flex-col items-center justify-center">
              <Shield className={`h-12 w-12 mb-2 ${seoScoreColor}`} />
              <p className={`text-4xl font-bold ${seoScoreColor}`}>{avgSeoScore}</p>
              <p className="text-sm text-muted-foreground">Prosečna SEO ocena</p>
              <Progress value={avgSeoScore} className="h-2 w-full mt-3" />
            </Card>
            <Card className="p-4">
              <CardTitle className="text-sm mb-3">SEO proverke</CardTitle>
              <div className="space-y-3">
                {[
                  { label: 'Meta title (do 60 karaktera)', ok: pages.filter((p) => p.seoTitle && p.seoTitle.length <= 60).length, total: pages.length },
                  { label: 'Meta opis (do 160 karaktera)', ok: pages.filter((p) => p.metaDescription && p.metaDescription.length <= 160).length, total: pages.length },
                  { label: 'URL friendly slug', ok: pages.filter((p) => p.slug && !p.slug.includes('_')).length, total: pages.length },
                  { label: 'Stranice sa statusom 200', ok: publishedPages, total: pages.length },
                ].map((check) => (
                  <div key={check.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">{check.label}</span>
                      <span className="text-xs text-muted-foreground">{check.ok}/{check.total}</span>
                    </div>
                    <Progress value={check.total ? (check.ok / check.total) * 100 : 0} className="h-1.5" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <CardTitle className="text-sm mb-3">SEO preporuke</CardTitle>
              <div className="space-y-2">
                {[
                  { text: 'Dodajte meta opise svim stranicama', severity: 'warning' },
                  { text: 'Optimizujte meta titlove (do 60 karaktera)', severity: 'info' },
                  { text: 'Dodajte alt tekst svim slikama', severity: 'warning' },
                  { text: 'Podesite struktuirane podatke (Schema.org)', severity: 'error' },
                  { text: 'Kreirajte robots.txt', severity: 'success' },
                  { text: 'Generišite sitemap.xml', severity: 'success' },
                ].map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {rec.severity === 'error' && <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    {rec.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                    {rec.severity === 'info' && <ExternalLink className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />}
                    {rec.severity === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
                    <span className="text-xs">{rec.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Per-Page SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">SEO po stranicama</CardTitle>
              <CardDescription>Kliknite na štit da uredite SEO podešavanja za stranicu</CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">Nema stranica za SEO optimizaciju</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Stranica</TableHead>
                      <TableHead className="text-xs">Meta Title</TableHead>
                      <TableHead className="text-xs">Meta Opis</TableHead>
                      <TableHead className="text-xs">SEO Ocena</TableHead>
                      <TableHead className="text-xs text-right">Akcija</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">{p.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{p.seoTitle || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">{p.metaDescription || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={p.seoScore || 0} className="h-1.5 w-16" />
                            <span className={`text-xs font-medium ${(p.seoScore || 0) >= 80 ? 'text-green-600' : (p.seoScore || 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {p.seoScore || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openSeoForm(p)}>
                            <Shield className="h-3.5 w-3.5 mr-1" /> Uredi
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Robots.txt Editor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Robots.txt</CardTitle>
              <CardDescription>Konfigurišite pristup pretraživačima</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={robotsTxt} onChange={(e) => setRobotsTxt(e.target.value)} className="font-mono text-xs min-h-[120px]" />
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(robotsTxt) }}>Kopiraj</Button>
                <Button size="sm">Sačuvaj</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sitemap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sitemap.xml</CardTitle>
              <CardDescription>URL sitemapa i informacije o indeksiranju</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Sitemap URL</Label>
                  <Input value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} className="font-mono text-sm" />
                </div>
                <Button size="sm" variant="outline">Testiraj</Button>
                <Button size="sm" variant="outline">Regeneriši</Button>
              </div>
              <div className="flex gap-4 text-sm">
                <div><span className="text-muted-foreground">URL-ova:</span> <span className="font-medium">{pages.length}</span></div>
                <div><span className="text-muted-foreground">Zadnja generacija:</span> <span className="font-medium">{formatDate(new Date().toISOString())}</span></div>
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            {/* Dodaj/Uredi sub-tab (SEO form) */}
            <TabsContent value="dodaj" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSeoSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                  <h3 className="text-sm font-semibold">SEO podešavanja — {selectedPageSeo?.title}</h3>
                  <p className="text-xs text-muted-foreground">Optimizujte stranicu za pretraživače</p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Meta title</Label>
                        <span className="text-xs text-muted-foreground">{seoForm.metaTitle.length}/60</span>
                      </div>
                      <Input value={seoForm.metaTitle} onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })} placeholder="Meta title (do 60 karaktera)" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Meta opis</Label>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={generateMetaDescription}><Sparkles className="h-3 w-3 mr-1" /> Generiši</Button>
                          <span className="text-xs text-muted-foreground">{seoForm.metaDescription.length}/160</span>
                        </div>
                      </div>
                      <Textarea value={seoForm.metaDescription} onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })} placeholder="Meta opis (do 160 karaktera)" className="min-h-[60px]" />
                    </div>

                    <Separator />

                    <h4 className="text-sm font-semibold">Open Graph</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">OG title</Label>
                      <Input value={seoForm.ogTitle} onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })} placeholder="Naslov za društvene mreže" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">OG opis</Label>
                      <Textarea value={seoForm.ogDescription} onChange={(e) => setSeoForm({ ...seoForm, ogDescription: e.target.value })} placeholder="Opis za društvene mreže" className="min-h-[50px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">OG slika (URL)</Label>
                      <Input value={seoForm.ogImage} onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })} placeholder="https://example.com/og-image.jpg" />
                    </div>

                    <Separator />

                    <h4 className="text-sm font-semibold">Dodatna podešavanja</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">Canonical URL</Label>
                      <Input value={seoForm.canonicalUrl} onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })} placeholder="https://example.com/stranica" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Robots: Index</Label>
                      <Switch checked={seoForm.robotsIndex} onCheckedChange={(v) => setSeoForm({ ...seoForm, robotsIndex: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Robots: Follow</Label>
                      <Switch checked={seoForm.robotsFollow} onCheckedChange={(v) => setSeoForm({ ...seoForm, robotsFollow: v })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Struktuirani podaci (JSON-LD)</Label>
                      <Textarea value={seoForm.structuredData} onChange={(e) => setSeoForm({ ...seoForm, structuredData: e.target.value })} placeholder='{"@context": "https://schema.org", ...}' className="font-mono text-xs min-h-[80px]" />
                    </div>

                    {/* SEO Score Preview */}
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Predviđena SEO ocena</span>
                        <span className={`text-sm font-bold ${(seoForm.metaTitle.length > 0 && seoForm.metaTitle.length <= 60 && seoForm.metaDescription.length > 0 && seoForm.metaDescription.length <= 160) ? 'text-green-600' : 'text-amber-600'}`}>
                          {(seoForm.metaTitle.length > 0 && seoForm.metaTitle.length <= 60 && seoForm.metaDescription.length > 0 && seoForm.metaDescription.length <= 160) ? '85/100' : '45/100'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {[
                          { ok: seoForm.metaTitle.length > 0 && seoForm.metaTitle.length <= 60, text: 'Meta title okvirno dužine' },
                          { ok: seoForm.metaDescription.length > 0 && seoForm.metaDescription.length <= 160, text: 'Meta opis okvirno dužine' },
                          { ok: seoForm.ogTitle.length > 0, text: 'OG title podešen' },
                          { ok: seoForm.canonicalUrl.length > 0, text: 'Canonical URL podešen' },
                        ].map((c) => (
                          <div key={c.text} className="flex items-center gap-2">
                            {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-red-400" />}
                            <span className="text-xs">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSeoSubTab('pregled')}>Otkaži</Button>
                    <Button onClick={() => { setSeoSubTab('pregled'); loadPages() }}>Sačuvaj SEO</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TEMA (Theme) Tab                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="theme" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Podešavanja teme</h3>
              <p className="text-sm text-muted-foreground">Prilagodite izgled sajta bojama, fontovima i stilovima</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={theme.darkMode} onCheckedChange={(v) => updateTheme('darkMode', v)} />
                <Moon className="h-4 w-4" />
              </div>
              <Button size="sm">Sačuvaj temu</Button>
            </div>
          </div>

          {/* Color Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Paleta boja</CardTitle>
              <CardDescription>Izaberite boje za različite elemente sajta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {(Object.entries(theme.colors) as [keyof ThemeColors, string][]).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="w-full h-16 rounded-lg border" style={{ backgroundColor: value }} />
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-8 h-8 p-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-medium capitalize">{key === 'muted' ? 'Muted' : key.charAt(0).toUpperCase() + key.slice(1)}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Palette Preview */}
              <Separator className="my-4" />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>
                <h4 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Naslov primera</h4>
                <p className="text-sm mb-3" style={{ color: theme.colors.text }}>Ovo je tekst primera sa primenjenom temom. Pregledajte kako izgledaju boje u kontekstu.</p>
                <div className="flex gap-2">
                  <Button size="sm" style={{ backgroundColor: theme.colors.primary, color: '#fff', borderRadius: theme.buttonStyle === 'pill' ? '9999px' : `${theme.borderRadius}px` }}>Primarno dugme</Button>
                  <Button size="sm" variant="outline" style={{ borderColor: theme.colors.secondary, color: theme.colors.secondary, borderRadius: theme.buttonStyle === 'pill' ? '9999px' : `${theme.borderRadius}px` }}>Sekundarno</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tipografija</CardTitle>
              <CardDescription>Podesite fontove i veličine teksta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Font za naslove</Label>
                  <Select value={theme.headingFont} onValueChange={(v) => updateTheme('headingFont', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fontOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-lg font-bold" style={{ fontFamily: theme.headingFont }}>Naslov primera</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Font za tekst</Label>
                  <Select value={theme.bodyFont} onValueChange={(v) => updateTheme('bodyFont', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fontOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-sm" style={{ fontFamily: theme.bodyFont }}>Tekst primera za pregled</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Veličina naslova (px)</Label>
                  <Input type="number" value={theme.headingSize} onChange={(e) => updateTheme('headingSize', e.target.value)} min="16" max="72" />
                  <p className="text-sm" style={{ fontSize: `${theme.headingSize}px` }}>Naslov {theme.headingSize}px</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Veličina teksta (px)</Label>
                  <Input type="number" value={theme.bodySize} onChange={(e) => updateTheme('bodySize', e.target.value)} min="12" max="24" />
                  <p className="text-sm" style={{ fontSize: `${theme.bodySize}px` }}>Tekst {theme.bodySize}px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spacing & Border */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Razmaci i stilovi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs">Border radius (px)</Label>
                  <Input type="number" value={theme.borderRadius} onChange={(e) => updateTheme('borderRadius', e.target.value)} min="0" max="32" />
                  <div className="flex gap-2 mt-2">
                    <div className="w-12 h-12 border-2 border-primary" style={{ borderRadius: `${theme.borderRadius}px` }} />
                    <div className="w-12 h-12 bg-primary" style={{ borderRadius: `${theme.borderRadius}px` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Stil dugmadi</Label>
                  <Select value={theme.buttonStyle} onValueChange={(v) => updateTheme('buttonStyle', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buttonStyleOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" style={{ backgroundColor: theme.colors.primary, color: '#fff', borderRadius: theme.buttonStyle === 'pill' ? '9999px' : theme.buttonStyle === 'sharp' ? '0' : `${theme.borderRadius}px`, border: theme.buttonStyle === 'outline' ? `2px solid ${theme.colors.primary}` : 'none', background: theme.buttonStyle === 'outline' ? 'transparent' : theme.colors.primary }}>
                      Dugme
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tamni režim</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Switch checked={theme.darkMode} onCheckedChange={(v) => updateTheme('darkMode', v)} />
                    <span className="text-sm">{theme.darkMode ? 'Aktivan' : 'Neaktivan'}</span>
                  </div>
                  <div className={`w-full h-16 rounded-lg border mt-2 flex items-center justify-center ${theme.darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                    {theme.darkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                    <span className="ml-2 text-sm font-medium">{theme.darkMode ? 'Tamna tema' : 'Svetla tema'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MEDIJI (Media) Tab                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="media">
          <Tabs value={mediaSubTab} onValueChange={(v) => setMediaSubTab(v as 'pregled' | 'dodaj' | 'detalji')}>
            <TabsList>
              <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Upload className="h-4 w-4 mr-1" /> Upload</TabsTrigger>
              {mediaSubTab === 'detalji' && (
                <TabsTrigger value="detalji"><Eye className="h-4 w-4 mr-1" /> Detalji</TabsTrigger>
              )}
            </TabsList>

            {/* Pregled sub-tab */}
            <TabsContent value="pregled" className="space-y-4">
          {/* Upload & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži medije po nazivu..." className="pl-9" value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} />
            </div>
            <Select value={mediaFilter} onValueChange={setMediaFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tip fajla" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="image">Slike</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="application">Dokumenta</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setMediaSubTab('dodaj')}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
          </div>

          {/* Media Stats */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs">Ukupno: {mediaFiles.length} fajlova</Badge>
            <Badge variant="outline" className="text-xs">Slike: {mediaFiles.filter((m) => m.type.startsWith('image')).length}</Badge>
            <Badge variant="outline" className="text-xs">Video: {mediaFiles.filter((m) => m.type.startsWith('video')).length}</Badge>
            <Badge variant="outline" className="text-xs">Dokumenta: {mediaFiles.filter((m) => m.type.startsWith('application')).length}</Badge>
          </div>

          {/* Media Grid */}
          {filteredMedia.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-1">Nema medija</p>
              <p className="text-xs text-muted-foreground mb-4">Uploadujte slike, video ili dokumente</p>
              <Button variant="outline" onClick={() => setMediaSubTab('dodaj')}><Upload className="h-4 w-4 mr-1" /> Uploaduj fajl</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMedia.map((file) => (
                <div key={file.id} className="border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group" onClick={() => { setSelectedMedia(file); setMediaSubTab('detalji') }}>
                  <div className="aspect-square bg-muted flex items-center justify-center relative">
                    {file.type.startsWith('image') ? (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    ) : file.type.startsWith('video') ? (
                      <Monitor className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileCode className="h-8 w-8 text-muted-foreground" />
                    )}
                    {file.type.startsWith('image') && file.thumbnail && (
                      <img src={file.thumbnail} alt={file.alt || file.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                      <span className="text-xs text-muted-foreground">{file.usageCount}×</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </TabsContent>

            {/* Dodaj sub-tab (Upload) */}
            <TabsContent value="dodaj" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMediaSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                  <h3 className="text-sm font-semibold">Upload medija</h3>
                  <p className="text-xs text-muted-foreground">Dodajte slike, video ili dokumente u biblioteku</p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium">Prevucite fajlove ovde</p>
                      <p className="text-xs text-muted-foreground mb-3">ili kliknite za izbor</p>
                      <Input type="file" className="hidden" multiple accept="image/*,video/*,.pdf,.doc,.docx" />
                      <Button size="sm" variant="outline">Izaberi fajlove</Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Podržani formati: JPG, PNG, GIF, SVG, WebP, MP4, PDF, DOC, DOCX</p>
                      <p>Maksimalna veličina: 10MB po fajlu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detalji sub-tab (Media Detail) */}
            {mediaSubTab === 'detalji' && (
            <TabsContent value="detalji" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMediaSubTab('pregled')}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                  <h3 className="text-sm font-semibold">Detalji medija</h3>
                  <p className="text-xs text-muted-foreground">Informacije o izabranom fajlu</p>
                </div>
              </div>
              <Card>
                <CardContent>
                  {selectedMedia && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        {selectedMedia.type.startsWith('image') ? (
                          <Image className="h-12 w-12 text-muted-foreground" />
                        ) : selectedMedia.type.startsWith('video') ? (
                          <Monitor className="h-12 w-12 text-muted-foreground" />
                        ) : (
                          <FileCode className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Naziv:</span> <span className="font-medium">{selectedMedia.name}</span></div>
                        <div><span className="text-muted-foreground">Tip:</span> <span className="font-medium">{selectedMedia.type}</span></div>
                        <div><span className="text-muted-foreground">Veličina:</span> <span className="font-medium">{formatSize(selectedMedia.size)}</span></div>
                        <div><span className="text-muted-foreground">Korišćenje:</span> <span className="font-medium">{selectedMedia.usageCount} puta</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Datum uploada:</span> <span className="font-medium">{formatDate(selectedMedia.uploadedAt)}</span></div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Alt tekst</Label>
                        <Input value={selectedMedia.alt || ''} placeholder="Alternativni tekst za sliku" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">URL fajla</Label>
                        <Input value={selectedMedia.url} readOnly className="font-mono text-xs" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { if (selectedMedia) navigator.clipboard.writeText(selectedMedia.url) }}>Kopiraj URL</Button>
                    <Button variant="destructive">Obriši</Button>
                    <Button variant="outline" onClick={() => setMediaSubTab('pregled')}>Zatvori</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            )}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
