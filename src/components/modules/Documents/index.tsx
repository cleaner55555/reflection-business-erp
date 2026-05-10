'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  FolderOpen, FolderPlus, Download, Upload, Tag, Clock,
  CalendarDays, AlertTriangle, CheckCircle2, Filter,
  Grid3X3, List, Star, MoreVertical, FileUp, FileDown,
  Archive, Unlock, Lock, Copy, Link2, Share2, Printer,
  BarChart3, PieChart, TrendingUp, TrendingDown, File, FileSpreadsheet,
  FileImage, FileVideo, FileAudio, FileType2, X, ChevronRight,
  ChevronDown, Folder, TagIcon, Calendar, Users, HardDrive, ArrowLeft
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Doc {
  id: string; title: string; category: string | null; type: string | null
  fileName: string | null; fileSize: number; status: string; partnerId: string | null
  expiresAt: string | null; notes: string | null; createdAt: string; updatedAt: string
  version?: number; tags?: string; folder?: string | null
  partner?: { id: string; name: string } | null
}

interface Folder {
  id: string; name: string; parentId: string | null; color: string
  docCount: number; createdAt: string
}

// ============ CONSTANTS ============

const TYPE_LABELS: Record<string, string> = {
  faktura: 'Faktura', ugovor: 'Ugovor', ponuda: 'Ponuda', izvestaj: 'Izveštaj',
  predracun: 'Predračun', otpremnica: 'Otpremnica', rešenje: 'Rešenje',
  zahtev: 'Zahtev', obaveštenje: 'Obaveštenje', ostalo: 'Ostalo',
}

const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno', arhivirano: 'Arhivirano', nacrt: 'Nacrt',
  potrebno_potpisivanje: 'Potpisivanje', isteklo: 'Isteklo', obrisano: 'Obrisano',
}

const STATUS_COLORS: Record<string, string> = {
  aktivno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  arhivirano: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  nacrt: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  potrebno_potpisivanje: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  isteklo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  obrisano: 'bg-gray-100 text-gray-400',
}

const CATEGORIES = ['Fakture', 'Ugovori', 'Ponude', 'Izveštaji', 'Predračuni', 'Otpremnice', 'Rešenja', 'Zahtevi', 'Ostalo']

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileType2, doc: FileText, docx: FileText, xls: FileSpreadsheet,
  xlsx: FileSpreadsheet, csv: FileSpreadsheet, jpg: FileImage, jpeg: FileImage,
  png: FileImage, gif: FileImage, mp4: FileVideo, avi: FileVideo,
  mp3: FileAudio, wav: FileAudio, zip: Archive, rar: Archive,
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Fakture i računi', parentId: null, color: '#10b981', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f2', name: 'Ugovori', parentId: null, color: '#3b82f6', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f3', name: 'Ponude i predračuni', parentId: null, color: '#f59e0b', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f4', name: 'Izveštaji', parentId: null, color: '#8b5cf6', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f5', name: 'Ostalo', parentId: null, color: '#6b7280', docCount: 0, createdAt: '2025-01-01' },
]

// ============ HELPERS ============

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (fileName: string | null): React.ElementType => {
  if (!fileName) return File
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_ICONS[ext] || File
}

const getFileTypeColor = (fileName: string | null): string => {
  if (!fileName) return 'text-gray-400'
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const colors: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-500', docx: 'text-blue-500',
    xls: 'text-green-500', xlsx: 'text-green-500', csv: 'text-green-500',
    jpg: 'text-purple-500', jpeg: 'text-purple-500', png: 'text-purple-500',
    zip: 'text-amber-500', rar: 'text-amber-500',
  }
  return colors[ext] || 'text-gray-400'
}

const daysUntilExpiry = (date: string | null): number | null => {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ============ KPI CARD ============

const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
)

// ============ MAIN COMPONENT ============

export function Documents() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // Data
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  // View
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Folders
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [folderForm, setFolderForm] = useState({ name: '', color: '#10b981', parentId: '' })

  // Dialogs
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [docDetailOpen, setDocDetailOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // Form
  const [docForm, setDocForm] = useState({
    title: '', type: '', category: '', fileName: '', notes: '',
    expiresAt: '', folder: '', tags: '', status: 'aktivno',
  })
  const [submitting, setSubmitting] = useState(false)

  // Stats
  const [stats, setStats] = useState<any>(null)

  // Toast
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  // ============ DATA LOADING ============

  const computeStats = (data: Doc[]) => {
    const total = data.length
    const active = data.filter(d => d.status === 'aktivno').length
    const archived = data.filter(d => d.status === 'arhivirano').length
    const drafts = data.filter(d => d.status === 'nacrt').length
    const needsSign = data.filter(d => d.status === 'potrebno_potpisivanje').length
    const totalSize = data.reduce((sum, d) => sum + (d.fileSize || 0), 0)

    // Category breakdown
    const categoryMap: Record<string, number> = {}
    data.forEach(d => {
      const cat = d.category || 'Nekategorizovano'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })

    // Type breakdown
    const typeMap: Record<string, number> = {}
    data.forEach(d => {
      const typ = d.type || 'Nedefinisano'
      typeMap[typ] = (typeMap[typ] || 0) + 1
    })

    // Expiring docs
    const expiring = data
      .filter(d => d.expiresAt)
      .map(d => ({ ...d, daysLeft: daysUntilExpiry(d.expiresAt)! }))
      .filter(d => d.daysLeft <= 30 && d.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)

    // Recent docs
    const recent = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

    // Storage by month
    const monthMap: Record<string, number> = {}
    data.forEach(d => {
      const month = new Date(d.createdAt).toLocaleDateString('sr-RS', { year: 'numeric', month: 'short' })
      monthMap[month] = (monthMap[month] || 0) + 1
    })

    setStats({
      total, active, archived, drafts, needsSign, totalSize,
      categoryMap, typeMap, expiring, recent, monthMap,
    })
  }

  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/documents?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDocs(data)
        computeStats(data)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [filterType, filterCategory])

  useEffect(() => { loadDocs() }, [loadDocs])

  // ============ FILTERED & SORTED DOCS ============

  const filteredDocs = useMemo(() => {
    let result = [...docs]

    // Folder filter
    if (selectedFolder) {
      const folder = folders.find(f => f.id === selectedFolder)
      if (folder) {
        result = result.filter(d => d.category === folder.name)
      }
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q) ||
        (d.partner?.name || '').toLowerCase().includes(q) ||
        (d.fileName || '').toLowerCase().includes(q) ||
        (d.tags || '').toLowerCase().includes(q)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(d => d.status === filterStatus)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'date': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
        case 'name': cmp = (a.title || '').localeCompare(b.title || ''); break
        case 'size': cmp = (a.fileSize || 0) - (b.fileSize || 0); break
        case 'type': cmp = (a.type || '').localeCompare(b.type || ''); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [docs, searchQuery, filterStatus, sortBy, sortDir, selectedFolder, folders])

  // ============ ACTIONS ============

  const openNewDoc = () => {
    setEditingDoc(null)
    setDocForm({ title: '', type: '', category: '', fileName: '', notes: '', expiresAt: '', folder: selectedFolder || '', tags: '', status: 'aktivno' })
    setDocDialogOpen(true)
  }

  const openEditDoc = (doc: Doc) => {
    setEditingDoc(doc)
    setDocForm({
      title: doc.title || '', type: doc.type || '', category: doc.category || '',
      fileName: doc.fileName || '', notes: doc.notes || '',
      expiresAt: doc.expiresAt?.split('T')[0] || '',
      folder: doc.folder || '', tags: doc.tags || '', status: doc.status || 'aktivno',
    })
    setDocDialogOpen(true)
  }

  const handleSubmitDoc = async () => {
    if (!docForm.title.trim()) { showToast('Naslov je obavezan'); return }
    setSubmitting(true)
    try {
      const body = {
        title: docForm.title, type: docForm.type || null, category: docForm.category || null,
        fileName: docForm.fileName || null, notes: docForm.notes || null,
        expiresAt: docForm.expiresAt || null, folder: docForm.folder || null,
        tags: docForm.tags, status: docForm.status,
      }
      const url = editingDoc ? `/api/documents/${editingDoc.id}` : '/api/documents'
      const res = await fetch(url, {
        method: editingDoc ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setDocDialogOpen(false)
        loadDocs()
        showToast(editingDoc ? 'Dokument ažuriran' : 'Dokument kreiran')
      }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

  const handleDeleteDoc = async () => {
    if (!selectedDoc) return
    try {
      await fetch(`/api/documents/${selectedDoc.id}`, { method: 'DELETE' })
      setDeleteConfirmOpen(false)
      setSelectedDoc(null)
      loadDocs()
      showToast('Dokument obrisan')
    } catch { showToast('Greška') }
  }

  const handleStatusChange = async (doc: Doc, status: string) => {
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadDocs()
      showToast(`Status: ${STATUS_LABELS[status] || status}`)
    } catch { showToast('Greška') }
  }

  // ============ FOLDER ACTIONS ============

  const handleCreateFolder = () => {
    if (!folderForm.name.trim()) { showToast('Naziv je obavezan'); return }
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name: folderForm.name,
      parentId: folderForm.parentId || null,
      color: folderForm.color,
      docCount: 0,
      createdAt: new Date().toISOString(),
    }
    setFolders([...folders, newFolder])
    setFolderDialogOpen(false)
    setFolderForm({ name: '', color: '#10b981', parentId: '' })
    showToast('Fascikla kreirana')
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dokumenta</h1>
          <p className="text-sm text-muted-foreground">Upravljanje dokumentima, ugovorima i fasciklama</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setFolderDialogOpen(true)}><FolderPlus className="h-4 w-4 mr-1" /> Fascikla</Button>
          <Button size="sm" onClick={openNewDoc}><Plus className="h-4 w-4 mr-1" /> Novi dokument</Button>
          <Button variant="outline" size="sm" onClick={() => { loadDocs() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Sva dokumenta</TabsTrigger>
          <TabsTrigger value="folders"><FolderOpen className="h-4 w-4 mr-1 hidden sm:inline" /> Fascikle</TabsTrigger>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
        </TabsList>

        {/* ===== ALL DOCUMENTS ===== */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži dokumente..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tip" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => {
                const dir = sortBy === 'date' && sortDir === 'desc' ? 'asc' : 'desc'
                setSortDir(dir as 'asc' | 'desc')
              }}>{sortDir === 'desc' ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />} {sortDir === 'desc' ? 'Noviji' : 'Stariji'}</Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredDocs.length} dokumenta
              {selectedFolder && <Badge variant="outline" className="ml-2 text-xs">{folders.find(f => f.id === selectedFolder)?.name}</Badge>}
            </p>
            {selectedFolder && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
                <X className="h-3 w-3 mr-1" /> Ukloni filter
              </Button>
            )}
          </div>

          {/* Document List/Grid */}
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredDocs.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema dokumenata</p>
              <Button className="mt-3" onClick={openNewDoc}><Plus className="h-4 w-4 mr-1" /> Dodaj prvi dokument</Button>
            </Card>
          ) : viewMode === 'list' ? (
            <Card>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="p-3">Naziv</th>
                      <th className="p-3 hidden md:table-cell">Tip</th>
                      <th className="p-3 hidden lg:table-cell">Kategorija</th>
                      <th className="p-3 hidden md:table-cell">Datum</th>
                      <th className="p-3 hidden lg:table-cell">Rok</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 w-[100px]">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => {
                      const FileIcon = getFileIcon(doc.fileName)
                      const days = daysUntilExpiry(doc.expiresAt)
                      return (
                        <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <FileIcon className={`h-4 w-4 shrink-0 ${getFileTypeColor(doc.fileName)}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[200px]">{doc.title}</p>
                                {doc.fileName && <p className="text-xs text-muted-foreground">{doc.fileName} · {formatFileSize(doc.fileSize || 0)}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell"><Badge variant="secondary" className="text-xs">{TYPE_LABELS[doc.type || ''] || doc.type || '-'}</Badge></td>
                          <td className="p-3 hidden lg:table-cell text-xs">{doc.category || '-'}</td>
                          <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{formatDate(doc.createdAt)}</td>
                          <td className="p-3 hidden lg:table-cell">
                            {doc.expiresAt ? (
                              <span className={`text-xs ${days !== null && days <= 7 ? 'text-red-500 font-medium' : days !== null && days <= 30 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                {formatDate(doc.expiresAt)} {days !== null && days <= 30 && `(${days}d)`}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-xs ${STATUS_COLORS[doc.status] || ''}`}>{STATUS_LABELS[doc.status] || doc.status}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDoc(doc) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => {
                const FileIcon = getFileIcon(doc.fileName)
                const days = daysUntilExpiry(doc.expiresAt)
                return (
                  <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${getFileTypeColor(doc.fileName)}`}>
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{doc.title}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{TYPE_LABELS[doc.type || ''] || doc.type || '-'}</Badge>
                        </div>
                      </div>
                      {doc.category && <p className="text-xs text-muted-foreground mb-1"><TagIcon className="h-3 w-3 inline mr-1" />{doc.category}</p>}
                      {doc.fileName && <p className="text-xs text-muted-foreground mb-1"><File className="h-3 w-3 inline mr-1" />{doc.fileName} · {formatFileSize(doc.fileSize || 0)}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className={`text-xs ${STATUS_COLORS[doc.status] || ''}`}>{STATUS_LABELS[doc.status] || doc.status}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                      </div>
                      {doc.expiresAt && days !== null && days <= 30 && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded ${days <= 7 ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                          <AlertTriangle className="h-3 w-3 inline mr-1" /> Ističe za {days} dana
                        </div>
                      )}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDoc(doc) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== FOLDERS TAB ===== */}
        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(folder => {
              const folderDocs = docs.filter(d => d.category === folder.name || d.folder === folder.name)
              return (
                <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedFolder(folder.id); setActiveTab('all') }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${folder.color}20` }}>
                        <Folder className="h-5 w-5" style={{ color: folder.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{folder.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{folderDocs.length} dokumenta</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-4">
          {!stats ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Kpi label="Ukupno dokumenata" value={stats.total} icon={FileText} sub={`${stats.active} aktivnih`} color="text-blue-500" />
                <Kpi label="Nacrti" value={stats.drafts} icon={Edit3} color="text-yellow-500" />
                <Kpi label="Na potpisivanju" value={stats.needsSign} icon={FileUp} color="text-orange-500" />
                <Kpi label="Ukupna veličina" value={formatFileSize(stats.totalSize)} icon={HardDrive} color="text-purple-500" />
              </div>

              {/* Expiring Documents Alert */}
              {stats.expiring.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" /> Dokumenti koji ističu (30 dana)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.expiring.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer" onClick={() => { setSelectedDoc(d); setDocDetailOpen(true) }}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">{d.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs text-amber-600">
                              <Clock className="h-3 w-3 mr-1" /> {d.daysLeft} dana
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(d.expiresAt!)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.categoryMap).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                        const max = Math.max(...Object.values(stats.categoryMap), 1)
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <span className="text-xs w-28 truncate">{cat}</span>
                            <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                            <span className="text-xs font-mono w-6 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Type Breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipovima</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.typeMap).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{TYPE_LABELS[type] || type}</Badge>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusima</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => {
                        const count = docs.filter(d => d.status === status).length
                        if (count === 0) return null
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <Badge variant="outline" className={`text-xs w-32 justify-center ${STATUS_COLORS[status] || ''}`}>{label}</Badge>
                            <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((count / Math.max(stats.total, 1)) * 100)}%` }} /></div>
                            <span className="text-xs font-mono w-6 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Nedavno dodati</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('all')}>Prikaži sve <ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recent.map(doc => {
                        const FileIcon = getFileIcon(doc.fileName)
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                            <div className="flex items-center gap-2">
                              <FileIcon className={`h-4 w-4 ${getFileTypeColor(doc.fileName)}`} />
                              <span className="text-sm truncate max-w-[200px]">{doc.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity by Month */}
              {Object.keys(stats.monthMap).length > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po mesecima</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.monthMap).sort().slice(-6).map(([month, count]) => {
                        const max = Math.max(...Object.values(stats.monthMap) as number[], 1)
                        return (
                          <div key={month} className="flex items-center gap-3">
                            <span className="text-xs w-20 text-muted-foreground">{month}</span>
                            <div className="flex-1 bg-muted rounded-full h-4"><div className="bg-primary h-4 rounded-full" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                            <span className="text-xs font-mono w-6 text-right">{count as number}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== INLINE FORMS ===== */}

      {/* New/Edit Document */}
      {docDialogOpen && (<Card className="max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDocDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">{editingDoc ? 'Izmeni dokument' : 'Novi dokument'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{editingDoc ? 'Izmenite podatke o dokumentu' : 'Popunite podatke za novi dokument'}</p>
          <div className="space-y-2">
            <Label className="text-xs">Naziv dokumenta *</Label>
            <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Unesite naziv..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Tip</Label>
              <Select value={docForm.type} onValueChange={(v) => setDocForm({ ...docForm, type: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite tip" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={docForm.status} onValueChange={(v) => setDocForm({ ...docForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Kategorija</Label>
              <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez kategorije</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fascikla</Label>
              <Select value={docForm.folder} onValueChange={(v) => setDocForm({ ...docForm, folder: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez fascikle</SelectItem>
                  {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Naziv datoteke</Label>
              <Input value={docForm.fileName} onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })} placeholder="faktura.pdf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Datum isteka</Label>
              <Input type="date" value={docForm.expiresAt} onChange={(e) => setDocForm({ ...docForm, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Oznake (tagovi, zarezom odvojene)</Label>
            <Input value={docForm.tags} onChange={(e) => setDocForm({ ...docForm, tags: e.target.value })} placeholder="važno, 2025, računi" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Napomene</Label>
            <Textarea value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} placeholder="Dodatne napomene..." rows={3} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setDocDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmitDoc} disabled={submitting || !docForm.title.trim()}>
              {submitting ? 'Čuvanje...' : editingDoc ? 'Ažuriraj' : 'Kreiraj'}
            </Button>
          </div>
        </CardContent>
      </Card>)}

      {/* Document Detail */}
      {docDetailOpen && selectedDoc && (<Card className="max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDocDetailOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" /> {selectedDoc.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-xs text-muted-foreground">Tip:</span><br /><Badge variant="secondary" className="text-xs">{TYPE_LABELS[selectedDoc.type || ''] || selectedDoc.type || '-'}</Badge></div>
                  <div><span className="text-xs text-muted-foreground">Status:</span><br /><Badge variant="outline" className={`text-xs ${STATUS_COLORS[selectedDoc.status] || ''}`}>{STATUS_LABELS[selectedDoc.status] || selectedDoc.status}</Badge></div>
                  <div><span className="text-xs text-muted-foreground">Kategorija:</span><br /><span className="text-sm">{selectedDoc.category || '-'}</span></div>
                  <div><span className="text-xs text-muted-foreground">Datum kreiranja:</span><br /><span className="text-sm">{formatDate(selectedDoc.createdAt)}</span></div>
                  <div><span className="text-xs text-muted-foreground">Datum isteka:</span><br />
                    <span className={`text-sm ${daysUntilExpiry(selectedDoc.expiresAt) !== null && daysUntilExpiry(selectedDoc.expiresAt)! <= 7 ? 'text-red-500 font-medium' : ''}`}>
                      {selectedDoc.expiresAt ? formatDate(selectedDoc.expiresAt) : '-'}
                    </span>
                  </div>
                  <div><span className="text-xs text-muted-foreground">Datoteka:</span><br /><span className="text-sm">{selectedDoc.fileName || '-'} {selectedDoc.fileName && `(${formatFileSize(selectedDoc.fileSize || 0)})`}</span></div>
                  <div><span className="text-xs text-muted-foreground">Komitent:</span><br /><span className="text-sm">{selectedDoc.partner?.name || '-'}</span></div>
                  <div><span className="text-xs text-muted-foreground">Oznake:</span><br />
                    <div className="flex gap-1 flex-wrap mt-1">
                      {(selectedDoc.tags || '').split(',').filter(Boolean).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs"><Tag className="h-2.5 w-2.5 mr-0.5" />{tag.trim()}</Badge>
                      ))}
                      {!(selectedDoc.tags || '').split(',').filter(Boolean).length && '-'}
                    </div>
                  </div>
                </div>
                {selectedDoc.notes && (
                  <div>
                    <span className="text-xs text-muted-foreground">Napomene:</span>
                    <p className="text-sm mt-1 bg-muted/30 rounded p-2">{selectedDoc.notes}</p>
                  </div>
                )}
                <Separator />
                {/* Quick Status Actions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Brze akcije:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.status !== 'aktivno' && (
                      <Button size="sm" variant="outline" onClick={() => { handleStatusChange(selectedDoc, 'aktivno'); setDocDetailOpen(false) }}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aktiviraj</Button>
                    )}
                    {selectedDoc.status !== 'arhivirano' && (
                      <Button size="sm" variant="outline" onClick={() => { handleStatusChange(selectedDoc, 'arhivirano'); setDocDetailOpen(false) }}><Archive className="h-3.5 w-3.5 mr-1" /> Arhiviraj</Button>
                    )}
                    {selectedDoc.status !== 'nacrt' && (
                      <Button size="sm" variant="outline" onClick={() => { handleStatusChange(selectedDoc, 'nacrt'); setDocDetailOpen(false) }}><Edit3 className="h-3.5 w-3.5 mr-1" /> Postavi kao nacrt</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { openEditDoc(selectedDoc); setDocDetailOpen(false) }}><Edit3 className="h-3.5 w-3.5 mr-1" /> Izmeni</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setDeleteConfirmOpen(true); setDocDetailOpen(false) }}><Trash2 className="h-3.5 w-3.5 mr-1" /> Obriši</Button>
                  </div>
                </div>
        </CardContent>
      </Card>)}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (<Card className="max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirmOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Potvrda brisanja</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Da li ste sigurni da želite obrisati dokument &quot;{selectedDoc?.title}&quot;? Ova radnja je nepovratna.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleDeleteDoc}>Obriši</Button>
          </div>
        </CardContent>
      </Card>)}

      {/* New Folder */}
      {folderDialogOpen && (<Card className="max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFolderDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base flex items-center gap-2"><FolderPlus className="h-5 w-5" /> Nova fascikla</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Naziv fascikle *</Label>
            <Input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Unesite naziv..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Boja</Label>
            <div className="flex gap-2 flex-wrap">
              {['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280', '#ec4899', '#06b6d4'].map(c => (
                <button key={c} className={`h-8 w-8 rounded-full border-2 transition-transform ${folderForm.color === c ? 'scale-110 border-primary' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }} onClick={() => setFolderForm({ ...folderForm, color: c })} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateFolder} disabled={!folderForm.name.trim()}>Kreiraj</Button>
          </div>
        </CardContent>
      </Card>)}

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Fascikle</p><p className="text-muted-foreground">Organizujte u kategorije</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Tagovi</p><p className="text-muted-foreground">Oznake za lakše pretraživanje</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Rokovi</p><p className="text-muted-foreground">Praćenje isteka dokumenata</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Pretraga</p><p className="text-muted-foreground">Pretraži po nazivu, tipu, tagu</p></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika skladišta</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{docs.filter(d => d.fileName?.endsWith('.pdf')).length}</p>
              <p className="text-xs text-muted-foreground">PDF dokumenti</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{docs.filter(d => d.fileName?.match(/\.(xls|xlsx|csv)/)).length}</p>
              <p className="text-xs text-muted-foreground">Tabele (Excel/CSV)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{docs.filter(d => d.fileName?.match(/\.(jpg|jpeg|png|gif)/)).length}</p>
              <p className="text-xs text-muted-foreground">Slike i grafika</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{docs.filter(d => !d.fileName).length}</p>
              <p className="text-xs text-muted-foreground">Bez datoteke</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ukupno:</span>
              <span className="font-medium">{formatFileSize(docs.reduce((sum, d) => sum + (d.fileSize || 0), 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prosečna veličina:</span>
              <span className="font-medium">{formatFileSize(Math.round(docs.reduce((s, d) => s + (d.fileSize || 0), 0) / Math.max(docs.length, 1)))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tagovano:</span>
              <span className="font-medium">{docs.filter(d => d.tags?.trim()).length} / {docs.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Type Guide */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Vodič kroz tipove dokumenata</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: 'faktura', icon: '🧾', desc: 'Računi i fakture za kupce/dobavljače', color: 'bg-green-50 dark:bg-green-900/10' },
              { type: 'ugovor', icon: '📝', desc: 'Poslovni ugovori i sporazumi', color: 'bg-blue-50 dark:bg-blue-900/10' },
              { type: 'ponuda', icon: '📋', desc: 'Komerčalne ponude i predračuni', color: 'bg-amber-50 dark:bg-amber-900/10' },
              { type: 'izvestaj', icon: '📊', desc: 'Poslovni izveštaji i analize', color: 'bg-purple-50 dark:bg-purple-900/10' },
              { type: 'predracun', icon: '💰', desc: 'Predračuni za proveru kupca', color: 'bg-teal-50 dark:bg-teal-900/10' },
              { type: 'otpremnica', icon: '🚚', desc: 'Otpremnice i transportni dokumenti', color: 'bg-orange-50 dark:bg-orange-900/10' },
              { type: 'rešenje', icon: '⚖️', desc: 'Službena rešenja i odluke', color: 'bg-red-50 dark:bg-red-900/10' },
              { type: 'zahtev', icon: '📨', desc: 'Zahtevi, molbe, podnesci', color: 'bg-cyan-50 dark:bg-cyan-900/10' },
            ].map(item => (
              <div key={item.type} className={`flex items-center gap-3 p-3 rounded-lg ${item.color}`}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{TYPE_LABELS[item.type]}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
