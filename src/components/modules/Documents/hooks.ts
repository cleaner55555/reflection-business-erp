import { useState, useEffect, useCallback, useMemo } from 'react'

export function useDocuments() {
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

  return {
    activeTab,
    c,
    deleteConfirmOpen,
    docDetailOpen,
    docDialogOpen,
    docs,
    editingDoc,
    filterStatus,
    filterType,
    filteredDocs,
    folderDialogOpen,
    folderDocs,
    folders,
    handleCreateFolder,
    handleDeleteDoc,
    handleSubmitDoc,
    k,
    loading,
    openNewDoc,
    searchQuery,
    selectedDoc,
    selectedFolder,
    setActiveTab,
    setDeleteConfirmOpen,
    setDocDetailOpen,
    setDocDialogOpen,
    setFilterStatus,
    setFilterType,
    setFolderDialogOpen,
    submitting,
    toastMsg,
  }
}
