 
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
import {
  StickyNote, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, Pin, PinOff,
  Tag, FolderOpen, Star, MoreHorizontal, FileText,
  Palette, Settings, Share2, Archive, BookOpen,
  Lightbulb, AlertCircle, ChevronDown, X, Filter, ArrowLeft
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Note {
  id: string
  title: string
  content: string
  categoryId: string
  tags: string[]
  priority: 'nizak' | 'srednji' | 'visok' | 'hitno'
  color: string
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  sharedWith: string[]
  templateId?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  noteCount: number
}

interface NoteTemplate {
  id: string
  name: string
  content: string
  categoryId: string
  isDefault: boolean
}

interface DashboardData {
  totalNotes: number
  totalCategories: number
  pinnedNotes: number
  recentActivity: Array<{ action: string; note: string; time: string }>
  notesByCategory: Array<{ category: string; count: number; color: string }>
  topTags: Array<{ tag: string; count: number }>
}

// ─── Config ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  nizak: { label: 'Nizak', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  srednji: { label: 'Srednji', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-400' },
  visok: { label: 'Visok', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-400' },
  hitno: { label: 'Hitno', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-400' },
}

const noteColors = [
  { value: '#ffffff', label: 'Belа' },
  { value: '#fef3c7', label: 'Žuta' },
  { value: '#dcfce7', label: 'Zelena' },
  { value: '#dbeafe', label: 'Plava' },
  { value: '#fce7f3', label: 'Roza' },
  { value: '#f3e8ff', label: 'Ljubičasta' },
  { value: '#ffedd5', label: 'Narandžasta' },
  { value: '#f1f5f9', label: 'Siva' },
]

const categoryIcons: Record<string, string> = {
  radni: '📋',
  licni: '👤',
  projekat: '📁',
  sastanak: '🤝',
  ideja: '💡',
  kupovina: '🛒',
  zdravlje: '❤️',
  edukacija: '📚',
}

const sortOptions = [
  { value: 'updated', label: 'Nedavno ažurirano' },
  { value: 'created', label: 'Nedavno kreirano' },
  { value: 'title', label: 'Naziv A-Z' },
  { value: 'priority', label: 'Prioritet' },
]

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Radni zadaci', color: '#dbeafe', icon: '📋', noteCount: 12 },
  { id: 'cat-2', name: 'Lične beleške', color: '#fce7f3', icon: '👤', noteCount: 8 },
  { id: 'cat-3', name: 'Projekti', color: '#dcfce7', icon: '📁', noteCount: 15 },
  { id: 'cat-4', name: 'Sastanci', color: '#fef3c7', icon: '🤝', noteCount: 6 },
  { id: 'cat-5', name: 'Ideje', color: '#f3e8ff', icon: '💡', noteCount: 4 },
  { id: 'cat-6', name: 'Edukacija', color: '#ffedd5', icon: '📚', noteCount: 7 },
]

const mockNotes: Note[] = [
  {
    id: 'note-1', title: 'Sastanak sa klijentom - ABC d.o.o.',
    content: 'Pripremiti prezentaciju za novi projekat. Proći kroz zahteve i rokove. Doneti ponudu za razvoj softvera.\n\nVažne tačke:\n- Budžet: 50.000 EUR\n- Rok: 3 meseca\n- Tim: 4 developera\n- MVP za 6 nedelja',
    categoryId: 'cat-4', tags: ['klijent', 'sastanak', 'hitno'],
    priority: 'visok', color: '#fef3c7', isPinned: true, isFavorite: true, isArchived: false,
    sharedWith: ['Marko Petrović', 'Jelena Stanković'], createdAt: '2025-01-15T10:00:00', updatedAt: '2025-01-18T14:30:00',
  },
  {
    id: 'note-2', title: 'Lista zadataka za Q1 2025',
    content: '1. Završiti migraciju baze podataka\n2. Implementirati novi API\n3. Ažurirati dokumentaciju\n4. Testiranje performansi\n5. Security audit',
    categoryId: 'cat-1', tags: ['zadaci', 'Q1', 'razvoj'],
    priority: 'srednji', color: '#dcfce7', isPinned: true, isFavorite: false, isArchived: false,
    sharedWith: [], createdAt: '2025-01-10T08:00:00', updatedAt: '2025-01-17T16:00:00',
  },
  {
    id: 'note-3', title: 'Ideja za novi proizvod',
    content: 'Mobilna aplikacija za praćenje potrošnje energije u realnom vremenu.\n\nIntegracija sa pametnim brojalima.\nAI preporuke za uštedu.\nGamifikacija za porodično učešće.',
    categoryId: 'cat-5', tags: ['ideja', 'mobilna', 'startup'],
    priority: 'nizak', color: '#f3e8ff', isPinned: false, isFavorite: true, isArchived: false,
    sharedWith: ['Ana Nikolić'], createdAt: '2025-01-12T12:00:00', updatedAt: '2025-01-12T12:00:00',
  },
  {
    id: 'note-4', title: 'Beleške sa edukacije - React 19',
    content: 'Novi React Server Components.\nSuspense boundaries za data fetching.\nNovi hook: use() za promisese.\nImproved error handling.',
    categoryId: 'cat-6', tags: ['react', 'edukacija', 'frontend'],
    priority: 'nizak', color: '#ffedd5', isPinned: false, isFavorite: false, isArchived: false,
    sharedWith: [], createdAt: '2025-01-14T09:00:00', updatedAt: '2025-01-16T11:00:00',
  },
  {
    id: 'note-5', title: 'Hitno: Ispravka bug-a u produkciji',
    content: 'Korisnici prijavljuju grešku pri plaćanju.\n\nKoraci za reprodukciju:\n1. Dodaj proizvod u korpu\n2. Idi na checkout\n3. Izaberi kreditnu karticu\n4. Greška: Payment gateway timeout\n\nDodijeljeno: Dev tim\nPrioritet: Kritično',
    categoryId: 'cat-1', tags: ['bug', 'produkcija', 'kritično'],
    priority: 'hitno', color: '#fecaca', isPinned: true, isFavorite: false, isArchived: false,
    sharedWith: ['Dev Tim', 'QA Tim'], createdAt: '2025-01-18T08:00:00', updatedAt: '2025-01-18T09:30:00',
  },
  {
    id: 'note-6', title: 'Nabavka opreme za kancelariju',
    content: 'Potrebna oprema:\n- 2x monitor 27" 4K (300 EUR/kom)\n- 5x ergonomska stolica (250 EUR/kom)\n- 1x projektor (800 EUR)\n- Kablovi i adapteri (100 EUR)\n\nUkupno: ~2.650 EUR\nOdobrenje: Direktor',
    categoryId: 'cat-1', tags: ['nabavka', 'oprema', 'budžet'],
    priority: 'srednji', color: '#dbeafe', isPinned: false, isFavorite: false, isArchived: false,
    sharedWith: ['HR', 'Finansije'], createdAt: '2025-01-11T13:00:00', updatedAt: '2025-01-15T10:00:00',
  },
  {
    id: 'note-7', title: 'Lični ciljevi za 2025',
    content: 'Profesionalni:\n- Završiti AWS certifikaciju\n- Predavati na 2 konferencije\n- Mentorisati 3 junior developera\n\nLični:\n- Čitati 24 knjige\n- Trčati polumaraton\n- Naučiti španski (B1 nivo)',
    categoryId: 'cat-2', tags: ['ciljevi', '2025', 'razvoj'],
    priority: 'srednji', color: '#fce7f3', isPinned: false, isFavorite: true, isArchived: false,
    sharedWith: [], createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-05T20:00:00',
  },
  {
    id: 'note-8', title: 'Projekat: Redesign web sajta',
    content: 'Faza 1: Istraživanje (2 nedelje)\n- Analiza konkurencije\n- Korisničke ankete\n- Wireframes\n\nFaza 2: Dizajn (3 nedelje)\n- UI/UX dizajn\n- Prototip\n- Testiranje sa korisnicima\n\nFaza 3: Razvoj (4 nedelje)\n- Frontend implementacija\n- Backend API\n- Integracije',
    categoryId: 'cat-3', tags: ['web', 'dizajn', 'projekat'],
    priority: 'visok', color: '#dcfce7', isPinned: false, isFavorite: false, isArchived: false,
    sharedWith: ['Dizajn tim', 'Dev tim'], createdAt: '2025-01-08T09:00:00', updatedAt: '2025-01-16T17:00:00',
  },
]

const mockTemplates: NoteTemplate[] = [
  { id: 'tpl-1', name: 'Sastanak', content: 'Datum: \nUčesnici: \nAgenda:\n1. \n2. \n3. \n\nZaključci:\n- \n- \n\nSledeći koraci:\n- ', categoryId: 'cat-4', isDefault: true },
  { id: 'tpl-2', name: 'Dnevne zadatke', content: '✅ Završeno juče:\n- \n\n📋 Današnji zadaci:\n- [ ] \n- [ ] \n- [ ] \n\n🚧 U toku:\n- ', categoryId: 'cat-1', isDefault: false },
  { id: 'tpl-3', name: 'Projektni predlog', content: 'Naziv projekta: \nOpis: \nCiljevi:\n1. \n2. \n\nBudžet: \nRok: \nResursi: \nRizici:\n- ', categoryId: 'cat-3', isDefault: false },
  { id: 'tpl-4', name: 'Beleške sa edukacije', content: 'Tema: \nPredavač: \nDatum: \n\nKljučne tačke:\n- \n- \n- \n\nŠta sam naučio/la:\n- \n\nPitanja za dalje:\n- ', categoryId: 'cat-6', isDefault: false },
  { id: 'tpl-5', name: 'Sprint review', content: 'Sprint: \nDatum: \n\nZavršeno:\n- [x] \n- [x] \n\nNije završeno:\n- [ ] \n- [ ] \n\nBlockeri:\n- \n\nPlan za sledeći sprint:\n- ', categoryId: 'cat-1', isDefault: false },
]

const mockDashboard: DashboardData = {
  totalNotes: 45,
  totalCategories: 6,
  pinnedNotes: 3,
  recentActivity: [
    { action: 'Kreirana', note: 'Hitno: Ispravka bug-a', time: 'Pre 2 sata' },
    { action: 'Ažurirana', note: 'Sastanak sa klijentom', time: 'Pre 5 sati' },
    { action: 'Arhivirana', note: 'Stari projekat - Q4', time: 'Pre 1 dan' },
    { action: 'Kreirana', note: 'Nove ideje za marketing', time: 'Pre 2 dana' },
    { action: 'Deljena', note: 'Lista zadataka za Q1', time: 'Pre 3 dana' },
  ],
  notesByCategory: [
    { category: 'Radni zadaci', count: 12, color: '#dbeafe' },
    { category: 'Lične beleške', count: 8, color: '#fce7f3' },
    { category: 'Projekti', count: 15, color: '#dcfce7' },
    { category: 'Sastanci', count: 6, color: '#fef3c7' },
    { category: 'Ideje', count: 4, color: '#f3e8ff' },
    { category: 'Edukacija', count: 7, color: '#ffedd5' },
  ],
  topTags: [
    { tag: 'zadaci', count: 15 },
    { tag: 'projekat', count: 12 },
    { tag: 'edukacija', count: 8 },
    { tag: 'klijent', count: 6 },
    { tag: 'sastanak', count: 5 },
  ],
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Notes() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [templates, setTemplates] = useState<NoteTemplate[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Note | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Forms
  const emptyNoteForm = {
    title: '', content: '', categoryId: '', tags: [] as string[],
    priority: 'srednji' as Note['priority'], color: '#ffffff',
    isPinned: false, isFavorite: false, templateId: '',
  }
  const [noteForm, setNoteForm] = useState(emptyNoteForm)

  const emptyCategoryForm = { name: '', color: '#dbeafe', icon: '📋' }
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)

  const emptyTemplateForm = { name: '', content: '', categoryId: '', isDefault: false }
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadNotes = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId, limit: '100' })
      const res = await fetch(`/api/notes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.items?.length ? data.items : mockNotes)
      } else {
        setNotes(mockNotes)
      }
    } catch {
      setNotes(mockNotes)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadCategories = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/note-categories?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.items?.length ? data.items : mockCategories)
      } else {
        setCategories(mockCategories)
      }
    } catch {
      setCategories(mockCategories)
    }
  }, [activeCompanyId])

  const loadTemplates = useCallback(async () => {
    try {
      setTemplates(mockTemplates)
    } catch {
      setTemplates(mockTemplates)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/notes/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        setDashboard(mockDashboard)
      }
    } catch {
      setDashboard(mockDashboard)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadNotes()
    loadCategories()
    loadTemplates()
    loadDashboard()
  }, [activeCompanyId, loadNotes, loadCategories, loadTemplates, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredNotes = notes
    .filter((n) => {
      if (n.isArchived && activeTab !== 'archived') return false
      if (activeTab === 'starred' && !n.isFavorite) return false
      if (search) {
        const s = search.toLowerCase()
        if (!n.title.toLowerCase().includes(s) && !n.content.toLowerCase().includes(s) && !n.tags.some((tag) => tag.toLowerCase().includes(s))) return false
      }
      if (categoryFilter !== 'all' && n.categoryId !== categoryFilter) return false
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
      return true
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'sr')
      if (sortBy === 'priority') {
        const order = { hitno: 0, visok: 1, srednji: 2, nizak: 3 }
        return (order[a.priority] || 3) - (order[b.priority] || 3)
      }
      return 0
    })

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned)
  const allTags = [...new Set(notes.flatMap((n) => n.tags))]

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreateNote = async () => {
    if (!activeCompanyId || !noteForm.title.trim()) return
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...noteForm,
          sharedWith: [],
          isArchived: false,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setNoteForm(emptyNoteForm)
        loadNotes()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleUpdateNote = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          ...noteForm,
          sharedWith: selected.sharedWith,
          isArchived: selected.isArchived,
        }),
      })
      if (res.ok) {
        setDetailOpen(false)
        setSelected(null)
        loadNotes()
      }
    } catch { /* silent */ }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Obrisati belešku?')) return
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadNotes()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleTogglePin = (note: Note) => {
    setNotes(notes.map((n) => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n))
  }

  const handleToggleFavorite = (note: Note) => {
    setNotes(notes.map((n) => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n))
  }

  const handleToggleArchive = (note: Note) => {
    setNotes(notes.map((n) => n.id === note.id ? { ...n, isArchived: !n.isArchived } : n))
    loadDashboard()
  }

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return
    try {
      const res = await fetch('/api/note-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...categoryForm, noteCount: 0 }),
      })
      if (res.ok) {
        setCategoryDialogOpen(false)
        setCategoryForm(emptyCategoryForm)
        loadCategories()
      }
    } catch { /* silent */ }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Obrisati kategoriju?')) return
    try {
      const res = await fetch(`/api/note-categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadCategories()
    } catch { /* silent */ }
  }

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim()) return
    try {
      const res = await fetch('/api/note-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...templateForm }),
      })
      if (res.ok) {
        setTemplateDialogOpen(false)
        setTemplateForm(emptyTemplateForm)
        loadTemplates()
      }
    } catch { /* silent */ }
  }

  const addTag = () => {
    if (tagInput.trim() && !noteForm.tags.includes(tagInput.trim().toLowerCase())) {
      setNoteForm({ ...noteForm, tags: [...noteForm.tags, tagInput.trim().toLowerCase()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setNoteForm({ ...noteForm, tags: noteForm.tags.filter((t) => t !== tag) })
  }

  const applyTemplate = (template: NoteTemplate) => {
    setNoteForm({
      ...noteForm,
      content: template.content,
      categoryId: template.categoryId,
      templateId: template.id,
    })
    setDialogOpen(true)
  }

  const openEdit = (note: Note) => {
    setSelected(note)
    setNoteForm({
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
      tags: [...note.tags],
      priority: note.priority,
      color: note.color,
      isPinned: note.isPinned,
      isFavorite: note.isFavorite,
      templateId: note.templateId || '',
    })
    setDetailOpen(true)
  }

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || 'Bez kategorije'
  }

  const getCategoryColor = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.color || '#f1f5f9'
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Beleške</h1>
          <p className="text-sm text-muted-foreground">Upravljanje beleškama, kategorijama i šablonima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadNotes(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setNoteForm(emptyNoteForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nova beleška
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="notes"><StickyNote className="h-4 w-4 mr-1" /> Sve beleške</TabsTrigger>
          <TabsTrigger value="starred"><Star className="h-4 w-4 mr-1" /> Označene</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno beleški</span>
                    <StickyNote className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalNotes}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Kategorije</span>
                    <FolderOpen className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{dashboard.totalCategories}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prikvačene</span>
                    <Pin className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pinnedNotes}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivnih</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{notes.filter((n) => !n.isArchived).length}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes by Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Beleške po kategorijama</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.notesByCategory.map((cat) => {
                      const maxCount = Math.max(...dashboard.notesByCategory.map((c) => c.count))
                      return (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${(cat.count / maxCount) * 100}%`, backgroundColor: cat.color }} />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{cat.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Top Tags */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Najkorišćeni tagovi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {dashboard.topTags.map((tagInfo) => (
                        <Badge key={tagInfo.tag} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
                          #{tagInfo.tag} <span className="ml-1 text-muted-foreground">({tagInfo.count})</span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Nedavna aktivnost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {dashboard.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div>
                            <span className="text-sm font-medium">{activity.action}</span>
                            <span className="text-sm text-muted-foreground"> — {activity.note}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Templates */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Brzi šabloni</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setTemplateDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj šablon
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.slice(0, 4).map((tpl) => (
                      <button
                        key={tpl.id}
                        className="p-4 border rounded-lg text-left hover:bg-muted/50 transition-colors"
                        onClick={() => applyTemplate(tpl)}
                      >
                        <BookOpen className="h-5 w-5 text-primary mb-2" />
                        <p className="text-sm font-medium">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tpl.content.substring(0, 60)}...</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Sve beleške Tab ────────────────────────────────────────── */}
        <TabsContent value="notes" className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži beleške..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Svi prioriteti" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi prioriteti</SelectItem>
                {Object.entries(priorityConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}>
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-8 w-8 p-0" onClick={() => setViewMode('list')}>
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes Display */}
          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredNotes.length === 0 ? (
            <Card className="p-8 text-center">
              <StickyNote className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema beleški</p>
              <p className="text-xs text-muted-foreground mt-1">Kreirajte prvu belešku ili promenite filtere</p>
              <Button variant="outline" className="mt-3" onClick={() => { setNoteForm(emptyNoteForm); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Kreiraj belešku
              </Button>
            </Card>
          ) : (
            <div>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">Prikvačene beleške ({pinnedNotes.length})</span>
                  </div>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard key={note.id} note={note} getCategoryName={getCategoryName} getCategoryColor={getCategoryColor}
                          onEdit={openEdit} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite}
                          onToggleArchive={handleToggleArchive} onDelete={handleDeleteNote} priorityConfig={priorityConfig} />
                      ))}
                    </div>
                  ) : (
                    <NoteList notes={pinnedNotes} getCategoryName={getCategoryName} getCategoryColor={getCategoryColor}
                      onEdit={openEdit} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite}
                      onToggleArchive={handleToggleArchive} onDelete={handleDeleteNote} priorityConfig={priorityConfig} />
                  )}
                </div>
              )}

              {/* Unpinned Notes */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} getCategoryName={getCategoryName} getCategoryColor={getCategoryColor}
                      onEdit={openEdit} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite}
                      onToggleArchive={handleToggleArchive} onDelete={handleDeleteNote} priorityConfig={priorityConfig} />
                  ))}
                </div>
              ) : (
                <NoteList notes={unpinnedNotes} getCategoryName={getCategoryName} getCategoryColor={getCategoryColor}
                  onEdit={openEdit} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite}
                  onToggleArchive={handleToggleArchive} onDelete={handleDeleteNote} priorityConfig={priorityConfig} />
              )}
            </div>
          )}
        </TabsContent>

        {/* ─── Označene Tab ───────────────────────────────────────────── */}
        <TabsContent value="starred" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži označene beleške..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filteredNotes.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema označenih beleški</p>
              <p className="text-xs text-muted-foreground mt-1">Označite beleške zvezdicom da bi se pojavile ovde</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} getCategoryName={getCategoryName} getCategoryColor={getCategoryColor}
                  onEdit={openEdit} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite}
                  onToggleArchive={handleToggleArchive} onDelete={handleDeleteNote} priorityConfig={priorityConfig} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Podešavanja Tab ────────────────────────────────────────── */}
        <TabsContent value="settings" className="space-y-6">
          {/* Categories Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Kategorije</CardTitle>
                  <CardDescription>Upravljajte kategorijama beleški</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setCategoryForm(emptyCategoryForm); setCategoryDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Nova kategorija
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-lg">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.noteCount} beleški</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Templates Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Šabloni beleški</CardTitle>
                  <CardDescription>Predefinisani šabloni za brzo kreiranje beleški</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setTemplateForm(emptyTemplateForm); setTemplateDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Novi šablon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">{tpl.name}</p>
                      </div>
                      {tpl.isDefault && <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Podrazumevano</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tpl.content.substring(0, 80)}...</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyTemplate(tpl)}>
                        <Plus className="h-3 w-3 mr-1" /> Koristi
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                        if (confirm('Obrisati šablon?')) setTemplates(templates.filter((t) => t.id !== tpl.id))
                      }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Tags Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Svi tagovi</CardTitle>
              <CardDescription>Pregled svih korišćenih tagova</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nema tagova</p>
                ) : (
                  allTags.map((tag) => {
                    const count = notes.filter((n) => n.tags.includes(tag)).length
                    return (
                      <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20" onClick={() => { setSearch(tag); setActiveTab('notes'); }}>
                        #{tag} <span className="ml-1 text-muted-foreground">({count})</span>
                      </Badge>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Archive Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Arhiva</CardTitle>
              <CardDescription>Arhivirane beleške ({notes.filter((n) => n.isArchived).length})</CardDescription>
            </CardHeader>
            <CardContent>
              {notes.filter((n) => n.isArchived).length === 0 ? (
                <div className="p-6 text-center">
                  <Archive className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arhiva je prazna</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notes.filter((n) => n.isArchived).map((note) => (
                    <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{note.title}</p>
                        <p className="text-xs text-muted-foreground">{getCategoryName(note.categoryId)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleToggleArchive(note)}>
                          Vrati
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create Note ──────────────────────────────────────────── */}
      {dialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Nova beleška</CardTitle><CardDescription>Kreirajte novu belešku sa naslovom, sadržajem i tagovima</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov</Label>
              <Input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} placeholder="Naslov beleške..." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={noteForm.categoryId} onValueChange={(v) => setNoteForm({ ...noteForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={noteForm.priority} onValueChange={(v) => setNoteForm({ ...noteForm, priority: v as Note['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Boja pozadine</Label>
                <div className="flex gap-1 flex-wrap">
                  {noteColors.map((c) => (
                    <button key={c.value} className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.value, borderColor: noteForm.color === c.value ? '#000' : '#e5e7eb' }}
                      onClick={() => setNoteForm({ ...noteForm, color: c.value })}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sadržaj</Label>
              <Textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} rows={8} placeholder="Sadržaj beleške..." />
            </div>
            <div className="space-y-2">
              <Label>Tagovi</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Dodaj tag..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1" />
                <Button size="sm" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
              </div>
              {noteForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {noteForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={noteForm.isPinned} onCheckedChange={(v) => setNoteForm({ ...noteForm, isPinned: v })} />
                <Label className="text-sm">Prikvači</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={noteForm.isFavorite} onCheckedChange={(v) => setNoteForm({ ...noteForm, isFavorite: v })} />
                <Label className="text-sm">Označi zvezdicom</Label>
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateNote}><Plus className="h-4 w-4 mr-1" /> Kreiraj belešku</Button>
          </div>
        </Card>
      )}

      {/* ─── Edit Note (Detail) ───────────────────────────────────── */}
      {detailOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailOpen(false); setSelected(null); }}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Uredi belešku</CardTitle><CardDescription>Izmenite naslov, sadržaj, kategoriju i tagove</CardDescription></div>
          </CardHeader>
          <CardContent>
            {selected && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Naslov</Label>
                  <Input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Kategorija</Label>
                    <Select value={noteForm.categoryId} onValueChange={(v) => setNoteForm({ ...noteForm, categoryId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioritet</Label>
                    <Select value={noteForm.priority} onValueChange={(v) => setNoteForm({ ...noteForm, priority: v as Note['priority'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Boja</Label>
                    <div className="flex gap-1 flex-wrap">
                      {noteColors.map((c) => (
                        <button key={c.value} className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.value, borderColor: noteForm.color === c.value ? '#000' : '#e5e7eb' }}
                          onClick={() => setNoteForm({ ...noteForm, color: c.value })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sadržaj</Label>
                  <Textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} rows={8} />
                </div>
                <div className="space-y-2">
                  <Label>Tagovi</Label>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Dodaj tag..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1" />
                    <Button size="sm" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {noteForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {noteForm.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Kreirano: {new Date(selected.createdAt).toLocaleString('sr-RS')}</div>
                  <div>Ažurirano: {new Date(selected.updatedAt).toLocaleString('sr-RS')}</div>
                </div>
                {selected.sharedWith.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Podeljeno sa: {selected.sharedWith.join(', ')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => { setDetailOpen(false); setSelected(null); }}>Otkaži</Button>
            <Button onClick={handleUpdateNote}><Edit3 className="h-4 w-4 mr-1" /> Sačuvaj izmene</Button>
          </div>
        </Card>
      )}

      {/* ─── Category ─────────────────────────────────────────────── */}
      {categoryDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCategoryDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Nova kategorija</CardTitle><CardDescription>Kreirajte novu kategoriju za beleške</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Naziv kategorije" />
            </div>
            <div className="space-y-2">
              <Label>Boja</Label>
              <div className="flex gap-2 flex-wrap">
                {noteColors.map((c) => (
                  <button key={c.value} className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value, borderColor: categoryForm.color === c.value ? '#000' : '#e5e7eb' }}
                    onClick={() => setCategoryForm({ ...categoryForm, color: c.value })}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ikona</Label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(categoryIcons).map(([key, icon]) => (
                  <button key={key} className="w-10 h-10 flex items-center justify-center rounded-lg border hover:bg-muted/50 text-lg"
                    style={{ borderColor: categoryForm.icon === icon ? '#000' : '#e5e7eb' }}
                    onClick={() => setCategoryForm({ ...categoryForm, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateCategory}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </div>
        </Card>
      )}

      {/* ─── Template ─────────────────────────────────────────────── */}
      {templateDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTemplateDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Novi šablon</CardTitle><CardDescription>Kreirajte šablon za brzo kreiranje beleški</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv šablona</Label>
              <Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="Naziv šablona" />
            </div>
            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select value={templateForm.categoryId} onValueChange={(v) => setTemplateForm({ ...templateForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sadržaj šablona</Label>
              <Textarea value={templateForm.content} onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })} rows={6} placeholder="Predložak sadržaja..." />
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateTemplate}><Plus className="h-4 w-4 mr-1" /> Kreiraj šablon</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface NoteCardProps {
  note: Note
  getCategoryName: (catId: string) => string
  getCategoryColor: (catId: string) => string
  onEdit: (note: Note) => void
  onTogglePin: (note: Note) => void
  onToggleFavorite: (note: Note) => void
  onToggleArchive: (note: Note) => void
  onDelete: (id: string) => void
  priorityConfig: Record<string, { label: string; color: string; dotColor: string }>
}

function NoteCard({ note, getCategoryName, getCategoryColor, onEdit, onTogglePin, onToggleFavorite, onToggleArchive, onDelete, priorityConfig }: NoteCardProps) {
  const priCfg = priorityConfig[note.priority] || priorityConfig.srednji
  const catColor = getCategoryColor(note.categoryId)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: note.color }}>
      <div className="h-1" style={{ backgroundColor: catColor }} />
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-1 flex-1">{note.title}</CardTitle>
          <div className="flex items-center gap-1 ml-2">
            {note.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
            <Badge variant="outline" className={`text-xs ${priCfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dotColor} mr-1`} />
              {priCfg.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">{note.content}</p>
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
          {note.tags.length > 3 && <Badge variant="secondary" className="text-xs">+{note.tags.length - 3}</Badge>}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{getCategoryName(note.categoryId)}</span>
          <div className="flex gap-0.5">
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleFavorite(note)}>
              <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onTogglePin(note)}>
              {note.isPinned ? <PinOff className="h-3.5 w-3.5 text-gray-500" /> : <Pin className="h-3.5 w-3.5 text-gray-400" />}
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onEdit(note)}>
              <Eye className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleArchive(note)}>
              <Archive className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-red-50" onClick={() => onDelete(note.id)}>
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface NoteListProps {
  notes: Note[]
  getCategoryName: (catId: string) => string
  getCategoryColor: (catId: string) => string
  onEdit: (note: Note) => void
  onTogglePin: (note: Note) => void
  onToggleFavorite: (note: Note) => void
  onToggleArchive: (note: Note) => void
  onDelete: (id: string) => void
  priorityConfig: Record<string, { label: string; color: string; dotColor: string }>
}

function NoteList({ notes, getCategoryName, getCategoryColor, onEdit, onTogglePin, onToggleFavorite, onToggleArchive, onDelete, priorityConfig }: NoteListProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="p-3">Naslov</th>
            <th className="p-3 hidden md:table-cell">Kategorija</th>
            <th className="p-3 hidden md:table-cell">Prioritet</th>
            <th className="p-3 hidden lg:table-cell">Tagovi</th>
            <th className="p-3">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => {
            const priCfg = priorityConfig[note.priority] || priorityConfig.srednji
            return (
              <tr key={note.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{note.title}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{getCategoryName(note.categoryId)}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(note.categoryId) }} />
                    <span className="text-xs">{getCategoryName(note.categoryId)}</span>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <Badge variant="outline" className={`text-xs ${priCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dotColor} mr-1`} />
                    {priCfg.label}
                  </Badge>
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                    {note.tags.length > 2 && <span className="text-xs text-muted-foreground">+{note.tags.length - 2}</span>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleFavorite(note)}>
                      <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                    </button>
                    <button className="p-1 rounded hover:bg-black/5" onClick={() => onEdit(note)}>
                      <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50" onClick={() => onDelete(note.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
